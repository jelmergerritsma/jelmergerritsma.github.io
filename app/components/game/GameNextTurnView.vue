<script setup lang="ts">
defineProps<{
  currentTeam: number
  activePlayerName?: string
  guessingPlayersNames?: string
  wordsPerTurn: number
}>()

defineEmits(["start-turn"])

const { t } = useI18n({ useScope: "local" })
</script>

<template>
  <div class="w-full max-w-sm text-center space-y-12 pb-40 pt-5">
    <div class="space-y-6">
      <div class="inline-block px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {{ t('next_up') }}
      </div>

      <div class="space-y-2">
        <h2 class="text-5xl font-black uppercase tracking-tighter text-primary-500">
          {{ t('team') }} {{ currentTeam }}
        </h2>
        <div class="space-y-1">
          <div class="text-3xl font-black text-neutral-900 dark:text-white px-4 leading-tight">
            {{ activePlayerName }}
          </div>
          <div class="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            {{ t('describing') }}
          </div>
        </div>

        <div
          v-if="guessingPlayersNames"
          class="pt-4 space-y-1"
        >
          <div class="text-sm font-bold text-neutral-600 dark:text-neutral-400">
            {{ guessingPlayersNames }}
          </div>
          <div class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            {{ t('guessing') }}
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl shadow-sm mx-4">
      <p class="text-lg font-medium leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('get_prepared', { seconds: 30, words: wordsPerTurn }) }}
      </p>
    </div>

    <footer class="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800 pb-safe z-10">
      <div class="max-w-lg mx-auto flex flex-col gap-2">
        <UButton
          size="xl"
          block
          variant="subtle"
          class="py-6 font-black uppercase tracking-widest shadow-lg"
          @click="$emit('start-turn')"
        >
          {{ t('start_turn') }}
        </UButton>
      </div>
    </footer>
  </div>
</template>

<i18n lang="yaml">
en:
  next_up: "Next Up"
  team: "Team"
  describing: "Describing"
  guessing: "Guessing"
  get_prepared: "Get ready! You'll have {seconds} seconds to describe {words} words."
  start_turn: "Start turn"
nl:
  next_up: "Volgende beurt"
  team: "Team"
  describing: "Omschrijven"
  guessing: "Raden"
  get_prepared: "Maak je klaar! Je hebt {seconds} seconden om {words} woorden te omschrijven."
  start_turn: "Start beurt"
</i18n>
