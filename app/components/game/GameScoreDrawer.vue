<script setup lang="ts">
import type { GameScore, GameSessionRelation } from "../../types/game"

const props = defineProps<{
  open: boolean
  session: GameSessionRelation | null
  currentTeam: number
  teamsInGame: number[]
  teamPlayers: (team: number) => { player_id: string, name: string, team: number }[]
}>()

const emit = defineEmits(["update:open"])

const isOpen = computed({
  get: () => props.open,
  set: val => emit("update:open", val)
})

const { t } = useI18n({ useScope: "local" })

const scoreData = computed(() => (props.session?.current_score as GameScore) || {})

const leaderboard = computed(() => {
  if (!scoreData.value?.player_stats) return []
  return Object.entries(scoreData.value.player_stats)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
})

const getPlayerName = (playerId: string) => {
  const members = props.session?.game_groups?.group_members || []
  const member = members.find(m => m.players?.id === playerId)
  return member?.players?.name || "Unknown"
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title="t('scores')"
    :description="t('scores_desc')"
  >
    <template #content>
      <div class="p-6 space-y-8 max-h-[80vh] h-full overflow-y-auto pb-safe">
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="tIdx in teamsInGame"
              :key="tIdx"
              class="p-4 rounded-2xl border-2 flex items-center justify-between transition-all"
              :class="currentTeam === tIdx ? 'bg-primary-50 dark:bg-primary-950 border-primary-500 shadow-sm' : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'"
            >
              <div class="flex flex-col">
                <span
                  class="text-[10px] font-black uppercase tracking-widest"
                  :class="currentTeam === tIdx ? 'text-primary-500' : 'text-neutral-400'"
                >
                  {{ t('team') }} {{ tIdx }}
                </span>
                <span class="font-bold text-neutral-900 dark:text-white">
                  {{ teamPlayers(tIdx).map(p => p.name).join(' & ') }}
                </span>
              </div>
              <div
                class="text-3xl font-black"
                :class="currentTeam === tIdx ? 'text-primary-500' : 'text-neutral-900 dark:text-white'"
              >
                {{ scoreData.scores?.[tIdx] || 0 }}
              </div>
            </div>
          </div>
        </div>

        <!-- Player Leaderboard in Drawer -->
        <div
          v-if="leaderboard.length > 0"
          class="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800"
        >
          <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400">
            {{ t('player_leaderboard') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="([playerId, score], index) in leaderboard"
              :key="playerId"
              class="flex items-center justify-between py-2 border-b border-neutral-50 dark:border-neutral-900 last:border-0"
            >
              <div class="flex items-center gap-3">
                <span class="text-xs font-black text-neutral-400 w-4">{{ index + 1 }}</span>
                <span class="font-bold text-sm text-neutral-700 dark:text-neutral-300">
                  {{ getPlayerName(playerId) }}
                </span>
              </div>
              <span class="font-black text-primary-500 text-sm">
                {{ score }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<i18n lang="yaml">
en:
  scores: "Scores"
  scores_desc: "Current standings of the game."
  team: "Team"
  player_leaderboard: "Player Leaderboard"
nl:
  scores: "Scores"
  scores_desc: "Huidige stand van het spel."
  team: "Team"
  player_leaderboard: "Speler ranglijst"
</i18n>
