<script setup lang="ts">
const route = useRoute()
const gameId = route.params.id as string
const { fetchSessionDetails } = useGame()
const { t } = useI18n({ useScope: "local" })
const router = useRouter()

const { data: session, status: _status } = useAsyncData(`session-stats-${gameId}`, () => fetchSessionDetails(gameId), { lazy: true })

const teamPlayers = (team: number) => {
  const scoreData = (session.value?.current_score as { assignments?: Array<{ player_id: string, name: string, team: number }> }) || {}
  const assignments = scoreData.assignments || []
  return assignments.filter(a => a.team === team)
}

const teamsInGame = computed(() => {
  const scoreData = (session.value?.current_score as { assignments?: Array<{ team: number }> }) || {}
  const assignments = scoreData.assignments || []
  const teams = new Set(assignments.map(a => a.team).filter(Boolean))
  return Array.from(teams).sort() as number[]
})

const winner = computed(() => {
  if (session.value?.status !== "finished") return null

  const scoreData = (session.value?.current_score as { scores?: Record<string, number> }) || {}
  const scores = scoreData.scores || {}
  let maxScore = -1
  let winningTeam = 1

  teamsInGame.value.forEach((tIdx) => {
    const score = Number(scores[String(tIdx)]) || 0
    if (score > maxScore) {
      maxScore = score
      winningTeam = tIdx
    }
  })

  return winningTeam
})
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-neutral-950 px-safe">
    <div
      v-if="_status === 'pending'"
      class="flex-1 p-6 flex flex-col items-center justify-center space-y-10"
    >
      <USkeleton class="h-10 w-48 mb-4" />
      <div class="space-y-4 w-full max-w-lg">
        <USkeleton class="h-32 w-full" />
        <USkeleton class="h-32 w-full" />
      </div>
    </div>

    <template v-else-if="session">
      <!-- Header -->
      <header class="flex items-center gap-4 p-6 pt-safe">
        <UButton
          variant="ghost"
          icon="i-lucide-chevron-left"
          size="xl"
          class="-ml-4 font-bold"
          @click="router.back()"
        />
        <div>
          <h1 class="text-2xl font-black tracking-tighter text-neutral-900 dark:text-white">
            {{ t('game_stats') }}
          </h1>
          <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">
            {{ session.created_at ? new Date(session.created_at).toLocaleDateString() : '' }}
          </p>
        </div>
      </header>

      <main class="flex-1 flex flex-col items-center px-6 pb-40 bg-neutral-50 dark:bg-neutral-950 overflow-y-auto min-h-0">
        <div class="w-full max-w-lg text-center space-y-8 pb-10 pt-10">
          <div class="space-y-4">
            <div class="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-yellow-500/20 scale-110 mb-6">
              <UIcon
                name="i-lucide-trophy"
                class="text-4xl text-white"
              />
            </div>
            <h1 class="text-4xl font-black uppercase tracking-tighter">
              {{ winner ? t('team') + ' ' + winner + ' ' + t('wins') + '!' : t('game_over') }}
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
                    {{ (session?.current_score as any)?.scores?.[tIdx] || 0 }}
                  </div>
                  <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {{ t('points') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Player Leaderboard -->
            <div
              v-if="(session?.current_score as any)?.player_stats"
              class="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4"
            >
              <h3 class="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-left">
                {{ t('player_leaderboard') }}
              </h3>
              <div class="space-y-2">
                <div
                  v-for="([playerId, score], index) in (Object.entries((session?.current_score as any)?.player_stats || {}) as [string, number][]).sort((a, b) => b[1] - a[1])"
                  :key="playerId"
                  class="flex items-center justify-between py-1"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-500">
                      {{ index + 1 }}
                    </div>
                    <span class="font-bold text-sm">
                      {{ ((session?.current_score as any)?.assignments as Array<{ player_id: string, name: string }>)?.find(a => a.player_id === playerId)?.name || 'Unknown' }}
                    </span>
                  </div>
                  <div class="font-black text-neutral-900 dark:text-white px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
                    {{ score }} <span class="text-[9px] text-neutral-400 ml-1">WORDS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Sticky Footer -->
      <footer class="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800 pb-safe z-10">
        <div class="max-w-lg mx-auto flex flex-col gap-2">
          <UButton
            size="xl"
            block
            variant="subtle"
            class="py-6 font-black uppercase tracking-widest"
            to="/"
          >
            {{ t('nav_home') }}
          </UButton>
        </div>
      </footer>
    </template>
  </div>
</template>

<i18n lang="yaml">
en:
  game_stats: "Game Stats"
  team: "Team"
  wins: "Wins"
  game_over: "Game Over"
  game_statistics: "Game Statistics"
  player_leaderboard: "Player Leaderboard"
  points: "Points"
  play_again: "Play Again"
  nav_home: "Back to Home"
nl:
  game_stats: "Statistieken"
  team: "Team"
  wins: "Wint"
  game_over: "Spel afgelopen"
  game_statistics: "Statistieken"
  player_leaderboard: "Speler ranglijst"
  points: "Punten"
  play_again: "Opnieuw spelen"
  nav_home: "Terug naar start"
</i18n>
