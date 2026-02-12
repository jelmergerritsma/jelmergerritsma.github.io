<script setup lang="ts">
import type { GameWord } from "~/types/game"

defineProps<{
  isPlaying: boolean
  isReviewing: boolean
  timeLeft: number
  sessionScore: number
  wordsPerTurn: number
  currentWords: GameWord[]
}>()

defineEmits(["toggle-word", "stop-timer", "end-turn"])

const { t } = useI18n({ useScope: "local" })
</script>

<template>
  <div class="w-full max-w-lg flex flex-col gap-6 pb-10">
    <div class="flex items-center justify-between shrink-0 gap-4 min-h-16">
      <!-- Score counter -->
      <div class="w-24 px-4 py-2 rounded-full border-2 border-neutral-200 dark:border-neutral-800 text-center font-bold">
        {{ sessionScore }}/{{ wordsPerTurn }}
      </div>

      <!-- Timer or Review Text -->
      <div
        v-if="isPlaying"
        class="text-6xl font-black tracking-tighter tabular-nums text-primary-500"
      >
        {{ timeLeft }}<small class="text-2xl ml-1">s</small>
      </div>
      <div
        v-else
        class="text-md font-black uppercase text-primary-500"
      >
        {{ t('check_words') }}
      </div>

      <!-- Quit Button -->
      <UButton
        v-if="isPlaying"
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        @click="$emit('stop-timer')"
      />
      <div
        v-else
        class="w-8"
      />
    </div>

    <!-- Timer Progress Bar -->
    <div
      class="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0 overflow-hidden shadow-inner transition-opacity duration-300"
      :class="isPlaying ? 'opacity-100' : 'opacity-0'"
    >
      <div
        class="h-full bg-primary-500 transition-all duration-1000 ease-linear"
        :style="{ width: `${(timeLeft / 30) * 100}%` }"
        :class="{ 'bg-red-500': timeLeft <= 5 }"
      />
    </div>

    <div class="w-full space-y-3">
      <button
        v-for="(word, index) in currentWords"
        :key="word.id"
        class="w-full min-h-[70px] flex items-center justify-between px-6 py-4 rounded-2xl border-4 transition-all duration-100 font-bold text-base uppercase tracking-tight text-left"
        :class="word.guessed
          ? 'bg-primary-500 border-primary-600 text-white shadow-lg active:scale-95'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white active:bg-neutral-100 dark:active:bg-neutral-800'"
        @click="$emit('toggle-word', index)"
      >
        <span class="flex-1">{{ word.text }}</span>
        <UIcon
          v-if="word.guessed"
          name="i-lucide-check-circle-2"
          class="text-3xl shrink-0 ml-4"
        />
      </button>
    </div>

    <!-- Extra prominent Continue button at bottom when reviewing -->
    <footer
      v-if="isReviewing"
      class="animate-in slide-in-from-bottom-4 fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800 pb-safe z-10"
    >
      <div class="max-w-lg mx-auto flex flex-col gap-2">
        <UButton
          block
          size="xl"
          variant="subtle"
          class="py-6 font-black uppercase tracking-widest"
          @click="$emit('end-turn')"
        >
          {{ t('confirm_score') }}
        </UButton>
      </div>
    </footer>
  </div>
</template>

<i18n lang="yaml">
en:
  check_words: "Check words"
  confirm_score: "Confirm Score"
nl:
  check_words: "Controleer woorden"
  confirm_score: "Bevestig score"
</i18n>
