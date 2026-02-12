<script setup lang="ts">
import type { GameSessionRelation, GameScore } from "~/types/game"

const props = defineProps<{
  session: GameSessionRelation
  showGroupName?: boolean
  showDelete?: boolean
}>()

const emit = defineEmits(["delete"])

const { t } = useI18n({ useScope: "local" })

const formattedDate = computed(() => {
  if (!props.session.created_at) return ""
  return new Date(props.session.created_at).toLocaleDateString()
})

const assignments = computed(() => {
  return (props.session.current_score as GameScore)?.assignments || []
})

const scores = computed(() => {
  const s = (props.session.current_score as GameScore)?.scores || {}
  return {
    team1: s["1"] || 0,
    team2: s["2"] || 0
  }
})

const statusColor = computed(() => {
  return props.session.status === "finished"
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
})

const statusLabel = computed(() => {
  return props.session.status === "finished" ? t("finished") : t("in_progress")
})
</script>

<template>
  <div class="relative group">
    <NuxtLink
      :to="session.status === 'finished' ? `/stats/${session.id}` : `/game/${session.id}`"
      class="block p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex flex-col gap-0.5">
          <span
            v-if="showGroupName && session.game_groups"
            class="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none mb-1"
          >
            {{ session.game_groups.name }}
          </span>
          <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
            {{ formattedDate }}
          </span>
        </div>
        <span
          class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
          :class="statusColor"
        >
          {{ statusLabel }}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex -space-x-2 shrink-0">
          <div
            v-for="(assignment, idx) in assignments.slice(0, 4)"
            :key="idx"
            class="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-[10px] font-bold shadow-sm"
          >
            {{ assignment.name?.charAt(0) || '?' }}
          </div>
          <div
            v-if="assignments.length > 4"
            class="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-[9px] font-black text-neutral-400 shadow-sm"
          >
            +{{ assignments.length - 4 }}
          </div>
        </div>

        <div class="flex flex-col items-end">
          <div class="text-xl font-black tracking-tighter tabular-nums">
            {{ scores.team1 }} - {{ scores.team2 }}
          </div>
          <div
            v-if="session.status === 'finished'"
            class="text-[9px] font-black text-primary-500 uppercase flex items-center gap-1 mt-0.5"
          >
            <UIcon name="i-lucide-award" />
            {{ t('view_stats') }}
          </div>
        </div>
      </div>
    </NuxtLink>

    <button
      v-if="showDelete"
      class="absolute right-2 -top-2 p-2 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 shadow-sm transition-all opacity-0 group-hover:opacity-100"
      @click.stop.prevent="emit('delete', session.id)"
    >
      <UIcon
        name="i-lucide-trash-2"
        class="text-base"
      />
    </button>
  </div>
</template>

<i18n lang="yaml">
en:
  finished: "Finished"
  in_progress: "In progress"
  view_stats: "Stats"
nl:
  finished: "Afgelopen"
  in_progress: "Bezig"
  view_stats: "Statistieken"
</i18n>
