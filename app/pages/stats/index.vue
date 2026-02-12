<script setup lang="ts">
import GameSessionCard from "~/components/game/GameSessionCard.vue"

definePageMeta({
  middleware: "auth"
})

const { t } = useI18n({ useScope: "local" })
const { fetchRecentSessions, fetchGroups } = useGame()
const { selectedGroupId } = useActiveGroup()

const { data: groups } = useAsyncData("stats-groups", () => fetchGroups())
const { data: sessions, status } = useAsyncData(
  "stats-sessions",
  () => fetchRecentSessions(100, selectedGroupId.value || undefined),
  { lazy: true, watch: [selectedGroupId] }
)

const activeGroupName = computed(() => {
  if (!groups.value || !selectedGroupId.value) return ""
  return groups.value.find(g => g.id === selectedGroupId.value)?.name || ""
})

const playerLeaderboard = computed(() => {
  if (!sessions.value) return []

  const stats: Record<string, { id: string, name: string, score: number }> = {}

  sessions.value.forEach((session) => {
    const scoreData = session.current_score as { player_stats?: Record<string, number>, assignments?: Array<{ player_id: string, name?: string }> } | null
    if (!scoreData?.player_stats) return

    Object.entries(scoreData.player_stats).forEach(([playerId, score]) => {
      if (!stats[playerId]) {
        // Find player name from assignments first (more reliable), then group_members
        const assignment = scoreData.assignments?.find(a => a.player_id === playerId)
        const gGroups = session.game_groups as { group_members?: Array<{ player_id: string, players?: { name: string } }> } | null
        const member = gGroups?.group_members?.find(m => m.player_id === playerId)

        stats[playerId] = {
          id: playerId,
          name: assignment?.name || member?.players?.name || "Unknown",
          score: 0
        }
      }
      stats[playerId].score += score
    })
  })

  return Object.values(stats).sort((a, b) => b.score - a.score)
})

const winsLeaderboard = computed(() => {
  if (!sessions.value) return []

  const stats: Record<string, { id: string, name: string, wins: number }> = {}

  sessions.value.forEach((session) => {
    const scoreData = session.current_score as { scores?: Record<string, number>, assignments?: { player_id: string, name?: string, team: number }[] } | null
    if (session.status !== "finished" || !scoreData?.scores || !scoreData?.assignments) return

    const scores = scoreData.scores
    const teams = Array.from(new Set(scoreData.assignments.map(a => a.team))).sort()

    let maxS = -1
    let winners: number[] = []

    teams.forEach((tIdx) => {
      const s = Number(scores[String(tIdx)]) || 0
      if (s > maxS) {
        maxS = s
        winners = [tIdx]
      } else if (s === maxS && s > 0) {
        winners.push(tIdx)
      }
    })

    if (maxS <= 0) return

    // Award wins to players on the winning team(s)
    scoreData.assignments.forEach((a) => {
      if (winners.includes(a.team)) {
        const pid = a.player_id
        if (!stats[pid]) {
          const gGroups = session.game_groups as { group_members?: Array<{ player_id: string, players?: { name: string } }> } | null
          const member = gGroups?.group_members?.find(m => m.player_id === pid)
          stats[pid] = {
            id: pid,
            name: a.name || member?.players?.name || "Unknown",
            wins: 0
          }
        }
        stats[pid].wins++
      }
    })
  })

  return Object.values(stats).sort((a, b) => b.wins - a.wins)
})
</script>

<template>
  <UContainer class="h-full flex flex-col p-6 space-y-8 overflow-y-auto min-h-0 pb-32">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tighter">
          {{ t('stats_title') }}
        </h1>
        <p class="text-xs text-neutral-400 font-bold uppercase tracking-widest">
          {{ activeGroupName ? activeGroupName : t('performance_overview_all') }}
        </p>
      </div>
    </header>

    <!-- Global Leaderboard (Words) -->
    <section
      v-if="playerLeaderboard.length > 0"
      class="space-y-4"
    >
      <div class="flex items-center justify-between px-2">
        <h2 class="text-xs font-black uppercase tracking-widest text-neutral-400">
          {{ t('all_time_top_wordsmiths') }}
        </h2>
        <UButton
          size="xs"
          variant="ghost"
          color="primary"
          class="font-black uppercase tracking-tighter"
          to="/stats/words"
        >
          {{ t('view_all') }}
        </UButton>
      </div>

      <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
        <div class="grid grid-cols-1 divide-y divide-neutral-100 dark:divide-neutral-800">
          <div
            v-for="(player, index) in playerLeaderboard.slice(0, 5)"
            :key="player.id"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-black text-neutral-500">
                {{ index + 1 }}
              </div>
              <div>
                <p class="font-bold text-neutral-900 dark:text-white">
                  {{ player.name }}
                </p>
                <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                  {{ t('player') }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xl font-black text-primary-500 leading-none mb-1">
                {{ player.score }}
              </p>
              <p class="text-[8px] font-black uppercase text-neutral-400 tracking-tighter leading-none">
                {{ t('words_guessed') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Leaderboard (Wins) -->
    <section
      v-if="winsLeaderboard.length > 0"
      class="space-y-4"
    >
      <div class="flex items-center justify-between px-2">
        <h2 class="text-xs font-black uppercase tracking-widest text-neutral-400">
          {{ t('all_time_top_winners') }}
        </h2>
        <UButton
          size="xs"
          variant="ghost"
          color="primary"
          class="font-black uppercase tracking-tighter"
          to="/stats/games"
        >
          {{ t('view_all') }}
        </UButton>
      </div>

      <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
        <div class="grid grid-cols-1 divide-y divide-neutral-100 dark:divide-neutral-800">
          <div
            v-for="(player, index) in winsLeaderboard.slice(0, 5)"
            :key="player.id"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-black text-neutral-500">
                {{ index + 1 }}
              </div>
              <div>
                <p class="font-bold text-neutral-900 dark:text-white">
                  {{ player.name }}
                </p>
                <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                  {{ t('player') }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xl font-black text-primary-500 leading-none mb-1">
                {{ player.wins }}
              </p>
              <p class="text-[8px] font-black uppercase text-neutral-400 tracking-tighter leading-none">
                {{ t('games_won') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="status === 'pending'"
      class="space-y-6"
    >
      <section
        v-for="i in 2"
        :key="i"
        class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <USkeleton class="w-8 h-8 rounded-full" />
            <div class="space-y-1">
              <USkeleton class="h-3 w-24" />
              <USkeleton class="h-2 w-16" />
            </div>
          </div>
          <USkeleton class="h-5 w-16 rounded-full" />
        </div>
        <div class="space-y-3">
          <USkeleton
            v-for="j in 2"
            :key="j"
            class="h-16 w-full rounded-2xl"
          />
        </div>
      </section>
    </div>

    <div
      v-else-if="sessions && sessions.length > 0"
      class="space-y-6"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-black uppercase tracking-widest text-neutral-400">
          {{ t('recent_games') }}
        </h2>
      </div>

      <div class="space-y-4">
        <GameSessionCard
          v-for="session in sessions"
          :key="session.id"
          :session="session"
          show-group-name
        />
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center py-20 text-center space-y-4"
    >
      <div class="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
        <UIcon
          name="i-lucide-bar-chart-3"
          class="text-3xl text-neutral-400"
        />
      </div>
      <p class="text-neutral-500 font-medium">
        {{ t('no_stats_yet') }}
      </p>
    </div>
  </UContainer>
</template>

<i18n lang="yaml">
en:
  stats_title: "Statistics"
  performance_overview_all: "Leaderboards across all your active rooms"
  performance_overview_room: "Leaderboard for the selected room"
  no_stats_yet: "No games found to display stats."
  all_time_top_wordsmiths: "Top Wordsmiths (Words)"
  all_time_top_winners: "Top Winners (Games)"
  view_all: "View All"
  words_guessed: "Words Guessed"
  games_won: "Games Won"
  player: "Player"
  recent_games: "Recent Games"
  words_leaderboard: "Words Leaderboard"
  wins_leaderboard: "Wins Leaderboard"
  all_time_performance: "Total performance across all games"
  rank: "Rank"
  all_rooms: "All Rooms"
nl:
  stats_title: "Statistieken"
  performance_overview_all: "Klassementen voor al je actieve kamers"
  performance_overview_room: "Klassement voor de geselecteerde kamer"
  no_stats_yet: "Geen spellen gevonden om statistieken te tonen."
  all_time_top_wordsmiths: "Top Woordkunstenaars (Woorden)"
  all_time_top_winners: "Top Winnaars (Spellen)"
  view_all: "Bekijk Alles"
  words_guessed: "Woorden Geraden"
  games_won: "Spellen Gewonnen"
  player: "Speler"
  recent_games: "Recente Spellen"
  words_leaderboard: "Woorden Klassement"
  wins_leaderboard: "Winst Klassement"
  all_time_performance: "Totale prestaties over alle spellen"
  rank: "Rang"
  all_rooms: "Alle Kamers"
</i18n>
