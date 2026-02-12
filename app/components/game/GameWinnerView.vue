<script setup lang="ts">
import type { GameScore, GameSessionRelation } from "../../types/game"

const props = defineProps<{
  winner: number
  session: GameSessionRelation | null
  teamsInGame: number[]
  teamPlayers: (team: number) => { player_id: string, name: string, team: number }[]
  language: string
  wordsPerTurn: number
  maxPoints: number
}>()

const { t } = useI18n({ useScope: "local" })

const onPlayAgain = () => {
  const scoreData = (props.session?.current_score as GameScore) || {}
  const assignments = scoreData.assignments || []
  const playerIds = assignments.map(a => a.player_id).filter(Boolean).join(",")
  const assignmentsParam = assignments
    .map(a => `${a.player_id}:${a.team}`)
    .join(",")

  navigateTo({
    path: "/game/setup",
    query: {
      lang: props.language,
      words: props.wordsPerTurn,
      max_points: props.maxPoints,
      players: playerIds,
      teams: props.teamsInGame.length,
      assignments: assignmentsParam
    }
  })
}

const scoreData = computed(() => (props.session?.current_score as GameScore) || {})

const leaderboard = computed(() => {
  if (!scoreData.value?.player_stats) return []
  return (Object.entries(scoreData.value.player_stats) as [string, number][])
    .sort((a, b) => b[1] - a[1])
})

const getPlayerName = (playerId: string) => {
  const members = props.session?.game_groups?.group_members || []
  return members.find(p => p.player_id === playerId)?.players?.name || "Unknown"
}
</script>

<template>
  <div class="w-full max-w-lg text-center space-y-8 pb-40 pt-10">
    <div class="space-y-4">
      <div class="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-yellow-500/20 scale-110 mb-6">
        <UIcon
          name="i-lucide-trophy"
          class="text-4xl text-white"
        />
      </div>
      <h1 class="text-4xl font-black uppercase tracking-tighter">
        {{ t('team') }} {{ winner }} {{ t('wins') }}!
      </h1>
    </div>

    <!-- Game Statistics Overview -->
    <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
      <h2 class="text-xs font-black uppercase tracking-widest text-neutral-400">
        {{ t('game_statistics') }}
      </h2>

      <!-- Team Scores -->
      <div class="space-y-3">
        <div
          v-for="tIdx in teamsInGame"
          :key="tIdx"
          class="flex items-center justify-between p-4 rounded-2xl"
          :class="winner === tIdx ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500/20' : 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800'"
        >
          <div class="text-left">
            <div class="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {{ t('team') }} {{ tIdx }}
            </div>
            <div class="font-bold text-neutral-900 dark:text-white">
              {{ teamPlayers(tIdx).map(p => p.name).join(' & ') }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-black text-primary-500">
              {{ scoreData.scores?.[tIdx] || 0 }}
            </div>
            <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {{ t('points') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Player Leaderboard -->
      <div
        v-if="leaderboard.length > 0"
        class="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4"
      >
        <h3 class="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-left">
          {{ t('player_leaderboard') }}
        </h3>
        <div class="space-y-2">
          <div
            v-for="([playerId, score], index) in leaderboard"
            :key="playerId"
            class="flex items-center justify-between py-1"
          >
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-500">
                {{ index + 1 }}
              </div>
              <span class="font-bold text-sm">{{ getPlayerName(playerId) }}</span>
            </div>
            <div class="font-black text-neutral-900 dark:text-white px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
              {{ score }} <span class="text-[9px] text-neutral-400 ml-1">WORDS</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800 pb-safe z-10">
      <div class="max-w-lg mx-auto flex flex-col gap-2">
        <UButton
          size="xl"
          block
          variant="subtle"
          class="py-6 font-black uppercase tracking-widest"
          @click="onPlayAgain"
        >
          {{ t('play_again') }}
        </UButton>
        <UButton
          size="xl"
          block
          variant="ghost"
          class="text-neutral-500 font-bold uppercase text-sm tracking-widest"
          to="/"
        >
          {{ t('nav_home') }}
        </UButton>
      </div>
    </footer>
  </div>
</template>

<i18n lang="yaml">
en:
  team: "Team"
  wins: "Wins"
  game_statistics: "Game Statistics"
  points: "Points"
  player_leaderboard: "Player Leaderboard"
  play_again: "Play Again"
  nav_home: "Back to Home"
nl:
  team: "Team"
  wins: "Wint"
  game_statistics: "Statistieken"
  points: "Punten"
  player_leaderboard: "Speler ranglijst"
  play_again: "Opnieuw spelen"
  nav_home: "Terug naar start"
</i18n>
