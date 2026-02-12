<script setup lang="ts">
import type { GameScore, GameWord } from "~/types/game"
import GameHeader from "~/components/game/GameHeader.vue"
import GameScoreDrawer from "~/components/game/GameScoreDrawer.vue"
import GamePlayView from "~/components/game/GamePlayView.vue"
import GameWinnerView from "~/components/game/GameWinnerView.vue"
import GameNextTurnView from "~/components/game/GameNextTurnView.vue"

const route = useRoute()
const router = useRouter()
const gameId = route.params.id as string
const language = (route.query.lang as string) || "nl"
const wordsPerTurn = parseInt((route.query.words as string) || "5")
const maxPoints = parseInt((route.query.max_points as string) || "30")
const { fetchSessionDetails, updateSessionScore, fetchRandomWords } = useGame()
const { playTurnMusic, stopTurnMusic, vibrate } = useGameEvents()
const { t } = useI18n({ useScope: "local" })

const { data: session, status } = useAsyncData(`session-${gameId}`, () => fetchSessionDetails(gameId), { lazy: true })

watch(session, (newSession) => {
  if (newSession?.status === "finished" && !winner.value) {
    const scoreData = (newSession.current_score as GameScore) || {}
    const scores = scoreData.scores || {}
    const assignments = scoreData.assignments || []
    const teams = Array.from(new Set(assignments.map(a => a.team).filter(Boolean))).sort()

    let maxScore = -1
    let winningTeam = 1

    // Find team with highest score
    teams.forEach((tIdx) => {
      const score = Number(scores[String(tIdx)]) || 0
      if (score > maxScore) {
        maxScore = score
        winningTeam = tIdx as number
      }
    })

    if (maxScore >= 0) {
      winner.value = winningTeam
    }
  }
}, { immediate: true })

const teamPlayers = (team: number) => {
  const scoreData = (session.value?.current_score as GameScore) || {}
  const assignments = scoreData.assignments || []
  return assignments.filter(a => a.team === team)
}

const teamsInGame = computed(() => {
  const scoreData = (session.value?.current_score as GameScore) || {}
  const assignments = scoreData.assignments || []
  const teams = new Set(assignments.map(a => a.team).filter(Boolean))
  return Array.from(teams).sort() as number[]
})

const activePlayer = computed(() => {
  const players = teamPlayers(currentTeam.value)
  if (!players.length) return null
  const idx = teamPlayerTurnIndex.value[currentTeam.value] || 0
  return players[idx % players.length]
})

const guessingPlayersNames = computed(() => {
  const others = teamPlayers(currentTeam.value).filter(p => p.player_id !== activePlayer.value?.player_id)
  return others.map(p => p.name).join(" & ")
})

// Game State
const winner = ref<number | null>(null)
const isScoreDrawerOpen = ref(false)
const currentTeam = ref(1)
const teamPlayerTurnIndex = ref<Record<number, number>>({}) // teamNum -> playerIndex
const timeLeft = ref(30)
const isPlaying = ref(false)
const isReviewing = ref(false)
const currentWords = ref<GameWord[]>([])
const sessionScore = ref(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)

const startTurn = async () => {
  if (winner.value) return
  try {
    const data = await fetchRandomWords(language, wordsPerTurn)
    if (data) {
      currentWords.value = data
        .filter((w): w is NonNullable<typeof w> => !!w)
        .sort(() => 0.5 - Math.random())
        .map(w => ({
          id: w.id,
          text: w.text,
          guessed: false
        }))
    }

    timeLeft.value = 30
    isPlaying.value = true
    isReviewing.value = false
    sessionScore.value = 0

    vibrate([100, 50, 100])

    timerInterval.value = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--

        if (timeLeft.value === 13) {
          playTurnMusic()
        }

        if (timeLeft.value <= 3) {
          vibrate(50)
        }
      } else {
        stopTurnMusic()
        stopTimerAndReview()
      }
    }, 1000)
  } catch (err) {
    const error = err as Error
    alert(t("failed_to_start_turn") + ": " + error.message)
  }
}

const stopTimerAndReview = () => {
  stopTurnMusic()
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  isPlaying.value = false
  isReviewing.value = true

  vibrate([300, 100, 300])
}

const toggleWord = (index: number) => {
  const word = currentWords.value[index]
  if (word) {
    word.guessed = !word.guessed
    sessionScore.value = currentWords.value.filter(w => w.guessed).length

    vibrate(40)

    // Automatically trigger review/confirm state if all words are guessed during play
    if (isPlaying.value && sessionScore.value === wordsPerTurn) {
      stopTimerAndReview()
    }
  }
}

const endTurn = async () => {
  stopTurnMusic()
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }

  isPlaying.value = false
  isReviewing.value = false

  const currentScoreData = (session.value?.current_score as GameScore) || { assignments: [], scores: { 1: 0, 2: 0 }, player_stats: {} }
  const scoreData: Required<GameScore> = {
    assignments: currentScoreData.assignments || [],
    scores: { ...(currentScoreData.scores || { 1: 0, 2: 0 }) },
    player_stats: { ...(currentScoreData.player_stats || {}) }
  }

  // Update team score
  scoreData.scores[currentTeam.value] = (Number(scoreData.scores[currentTeam.value]) || 0) + sessionScore.value

  // Update player stats
  if (activePlayer.value?.player_id) {
    scoreData.player_stats[activePlayer.value.player_id] = (scoreData.player_stats[activePlayer.value.player_id] || 0) + sessionScore.value
  }

  // Check for winner
  if ((Number(scoreData.scores[currentTeam.value]) || 0) >= maxPoints) {
    winner.value = currentTeam.value

    // Trigger confetti after a short delay to ensure DOM is ready
    nextTick(async () => {
      const confetti = (await import("canvas-confetti")).default
      const duration = 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#3b82f6", "#22c55e", "#ef4444", "#eab308"]
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#3b82f6", "#22c55e", "#ef4444", "#eab308"]
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    })
  }

  try {
    const status = winner.value ? "finished" : "playing"
    await updateSessionScore(gameId, scoreData, status)

    if (!winner.value) {
      // Increment player index for CURRENT team before switching
      const currentVal = teamPlayerTurnIndex.value[currentTeam.value] || 0
      teamPlayerTurnIndex.value[currentTeam.value] = currentVal + 1

      // Rotate to next team
      const currentIdx = teamsInGame.value.indexOf(currentTeam.value)
      const nextIdx = (currentIdx + 1) % teamsInGame.value.length
      currentTeam.value = (teamsInGame.value[nextIdx] as number)
    }

    await refreshNuxtData(`session-${gameId}`)
  } catch (err) {
    const error = err as Error
    alert(t("failed_to_update_score") + ": " + error.message)
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-neutral-950 overflow-hidden px-safe">
    <div
      v-if="status === 'pending' && !session"
      class="flex-1 flex flex-col"
    >
      <div class="p-4 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div class="max-w-lg mx-auto grid grid-cols-2 gap-3">
          <USkeleton
            v-for="i in 2"
            :key="i"
            class="h-20 rounded-xl"
          />
        </div>
      </div>
      <div class="flex-1 p-6 flex flex-col items-center justify-center space-y-10">
        <USkeleton class="w-48 h-10 rounded-2xl" />
        <USkeleton class="w-full max-w-sm h-64 rounded-3xl" />
        <USkeleton class="w-32 h-12 rounded-full" />
      </div>
    </div>

    <template v-else>
      <!-- Header Area -->
      <GameHeader
        :title="session?.game_groups?.name || t('game_in_progress')"
        :team="currentTeam"
        :active-player-name="activePlayer?.name"
        @back="router.back()"
        @open-scores="isScoreDrawerOpen = true"
      />

      <!-- Score Drawer -->
      <GameScoreDrawer
        v-model:open="isScoreDrawerOpen"
        :session="session || null"
        :current-team="currentTeam"
        :teams-in-game="teamsInGame"
        :team-players="teamPlayers"
      />

      <!-- Main Game Area -->
      <main class="flex-1 flex flex-col items-center p-6 bg-neutral-50 dark:bg-neutral-950 overflow-y-auto min-h-0">
        <Transition
          name="fade"
          mode="out-in"
        >
          <!-- Winner View -->
          <GameWinnerView
            v-if="winner"
            key="winner"
            :winner="winner"
            :session="session || null"
            :teams-in-game="teamsInGame"
            :team-players="teamPlayers"
            :language="language"
            :words-per-turn="wordsPerTurn"
            :max-points="maxPoints"
          />

          <!-- Active Turn View -->
          <GamePlayView
            v-else-if="isPlaying || isReviewing"
            key="active"
            :is-playing="isPlaying"
            :is-reviewing="isReviewing"
            :time-left="timeLeft"
            :session-score="sessionScore"
            :words-per-turn="wordsPerTurn"
            :current-words="currentWords"
            @toggle-word="toggleWord"
            @stop-timer="stopTimerAndReview"
            @end-turn="endTurn"
          />

          <!-- Next Turn View -->
          <GameNextTurnView
            v-else
            key="preturn"
            :current-team="currentTeam"
            :active-player-name="activePlayer?.name"
            :guessing-players-names="guessingPlayersNames"
            :words-per-turn="wordsPerTurn"
            @start-turn="startTurn"
          />
        </Transition>
      </main>
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<i18n lang="yaml">
en:
  next_up: "Next Up"
  timer_seconds: "{n}s"
  early_end: "Finish Now"
  team: "Team"
  turn: "{team}'s Turn"
  end_turn: "End Turn Early"
  get_prepared: "Get ready! You'll have {seconds} seconds to describe {words} words."
  start_timer: "Start Timer"
  quit_game: "Quit Game"
  failed_to_start_turn: "Failed to start turn"
  failed_to_update_score: "Failed to update score"
  wins: "Wins"
  final_score: "Final Score"
  play_again: "Play Again"
  nav_home: "Back to Home"
  check_words: "Check words"
  continue: "Continue"
  confirm_score: "Confirm Score"
  describing: "Describing"
  guessing: "Guessing"
  game_statistics: "Game Statistics"
  player_leaderboard: "Player Leaderboard"
  points: "Points"
  home: "Home"
  switch_room: "Switch"
  your_active_rooms: "Your Active Rooms"
  view_scores: "View Scores"
  scores: "Scores"
  scores_desc: "Current standings of the game."
  game_in_progress: "Game in progress"
nl:
  next_up: "Volgende beurt"
  timer_seconds: "{n}s"
  early_end: "Nu stoppen"
  team: "Team"
  turn: "Beurt van {team}"
  end_turn: "Beurt voortijdig beëindigen"
  get_prepared: "Maak je klaar! Je hebt {seconds} seconden om {words} woorden te omschrijven."
  start_timer: "Start timer"
  quit_game: "Spel verlaten"
  failed_to_start_turn: "Beurt starten mislukt"
  failed_to_update_score: "Score bijwerken mislukt"
  wins: "Wint"
  final_score: "Eindscore"
  play_again: "Opnieuw spelen"
  nav_home: "Terug naar start"
  check_words: "Controleer woorden"
  continue: "Verder"
  confirm_score: "Bevestig score"
  describing: "Omschrijven"
  guessing: "Raden"
  game_statistics: "Statistieken"
  player_leaderboard: "Speler ranglijst"
  points: "Punten"
  home: "Start"
  switch_room: "Wisselen"
  your_active_rooms: "Je actieve kamers"
  view_scores: "Scores bekijken"
  scores: "Scores"
  scores_desc: "Huidige stand van het spel."
  game_in_progress: "Spel in uitvoering"
</i18n>
