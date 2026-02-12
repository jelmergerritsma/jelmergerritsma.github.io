<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  stats: {
    games: number
    players: number
    words: number
  }
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div class="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mb-1">
        {{ t("games_count") }}
      </div>
      <div class="text-4xl font-black text-primary-500">
        {{ stats.games }}
      </div>
    </div>
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div class="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mb-1">
        {{ t("players_count") }}
      </div>
      <div class="text-4xl font-black text-primary-500">
        {{ stats.players }}
      </div>
    </div>
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div class="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mb-1">
        {{ t("words_count") }}
      </div>
      <div class="text-4xl font-black text-primary-500">
        {{ stats.words }}
      </div>
    </div>
  </div>
</template>

<i18n locale="en" lang="yaml">
words_count: "Total Words"
players_count: "Total Players"
games_count: "Games Played"
</i18n>

<i18n locale="nl" lang="yaml">
words_count: "Totaal Woorden"
players_count: "Totaal Spelers"
games_count: "Gespeelde Potjes"
</i18n>
