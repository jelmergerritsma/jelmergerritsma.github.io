<script setup lang="ts">
defineProps<{
  title: string
  team: number
  activePlayerName?: string
}>()

defineEmits(["back", "open-scores"])
const { t } = useI18n({ useScope: "local" })
</script>

<template>
  <div class="bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
    <header class="max-w-lg mx-auto flex items-center justify-between p-4 px-6 bg-default">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          size="xl"
          class="-ml-4 rounded-full"
          @click="$emit('back')"
        />
        <div>
          <h1 class="text-lg font-black tracking-tighter uppercase leading-none truncate max-w-40">
            {{ title }}
          </h1>
          <p class="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
            {{ t('team') }} {{ team }} • {{ activePlayerName }}
          </p>
        </div>
      </div>
      <UButton
        icon="i-lucide-bar-chart-3"
        variant="soft"
        color="primary"
        class="rounded-full h-10 w-10 flex items-center justify-center p-0"
        @click="$emit('open-scores')"
      />
    </header>
  </div>
</template>

<i18n lang="yaml">
en:
  team: "Team"
nl:
  team: "Team"
</i18n>
