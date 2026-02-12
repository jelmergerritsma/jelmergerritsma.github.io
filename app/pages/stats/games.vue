<script setup lang="ts">
const { t } = useI18n()
const { fetchRecentSessions } = useGame()
const { selectedGroupId } = useActiveGroup()

const { data: sessions, status } = useAsyncData(
  "stats-games-" + (selectedGroupId.value || "all"),
  () => fetchRecentSessions(200, selectedGroupId.value || undefined),
  { lazy: true, watch: [selectedGroupId] }
)

const winsLeaderboard = computed(() => {
  if (!sessions.value) return []

  const stats: Record<string, { id: string, name: string, wins: number }> = {}

  sessions.value.forEach((session) => {
    const scoreData = session.current_score as { assignments?: { player_id: string, name?: string, team: number }[], scores?: Record<string, number> } | null
    if (!scoreData || !scoreData.scores || session.status !== "finished") return

    // Find winning team score
    const winningTeams: number[] = []
    let maxScore = -1

    Object.entries(scoreData.scores).forEach(([teamId, score]) => {
      const s = Number(score)
      if (s > maxScore) {
        maxScore = s
        winningTeams.length = 0
        winningTeams.push(Number(teamId))
      } else if (s === maxScore && s > 0) {
        winningTeams.push(Number(teamId))
      }
    })

    if (maxScore <= 0) return

    // Credit all players on winning teams
    scoreData.assignments?.forEach((assignment) => {
      if (winningTeams.includes(assignment.team)) {
        const pid = assignment.player_id
        const gGroups = session.game_groups as { group_members?: Array<{ player_id: string, players?: { name: string } }> } | null
        const member = gGroups?.group_members?.find(m => m.player_id === pid)
        const name = assignment.name || member?.players?.name || "Unknown"

        if (!stats[pid]) {
          stats[pid] = {
            id: pid,
            name,
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
  <UContainer class="h-full flex flex-col p-6 space-y-8 overflow-y-auto pb-32">
    <header class="flex items-center gap-4">
      <UButton
        to="/stats"
        variant="ghost"
        icon="i-lucide-chevron-left"
        size="xl"
        class="-ml-4 font-bold"
      />
      <div>
        <h1 class="text-2xl font-black tracking-tighter uppercase">
          {{ t('wins_leaderboard') }}
        </h1>
        <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
          {{ t('all_time_performance') }}
        </p>
      </div>
    </header>

    <div
      v-if="status === 'pending'"
      class="space-y-4"
    >
      <USkeleton
        v-for="i in 10"
        :key="i"
        class="h-20 w-full rounded-3xl"
      />
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
        <div class="grid grid-cols-1 divide-y divide-neutral-100 dark:divide-neutral-800">
          <div
            v-for="(player, index) in winsLeaderboard"
            :key="player.id"
            class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-black text-neutral-500">
                {{ index + 1 }}
              </div>
              <div>
                <p class="font-bold text-neutral-900 dark:text-white">
                  {{ player.name }}
                </p>
                <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                  #{{ index + 1 }} {{ t('rank') }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-black text-primary-500 leading-none mb-1">
                {{ player.wins }}
              </p>
              <p class="text-[9px] font-black uppercase text-neutral-400 tracking-tighter leading-none">
                {{ t('games_won') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<i18n lang="yaml">
en:
  wins_leaderboard: "Wins Leaderboard"
  all_time_performance: "Total performance across all games"
  rank: "Rank"
  games_won: "Games Won"
nl:
  wins_leaderboard: "Winst Klassement"
  all_time_performance: "Totale prestaties over alle spellen"
  rank: "Rang"
  games_won: "Spellen Gewonnen"
</i18n>
