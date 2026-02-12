<script setup lang="ts">
import type { Database } from "~/types/database.types"

type Group = Database["public"]["Tables"]["game_groups"]["Row"]

const props = defineProps<{
  open: boolean
  groups?: Group[] | null
  selectedGroupId?: string | null
}>()

const emit = defineEmits(["update:open", "select-room"])

const isOpen = computed({
  get: () => props.open,
  set: val => emit("update:open", val)
})

const { t } = useI18n({ useScope: "local" })

const selectGroup = (id: string) => {
  emit("select-room", id)
  isOpen.value = false
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title="t('switch_room_title')"
    :description="t('switch_room_desc')"
    overlay
  >
    <template #content>
      <div class="p-6 space-y-4 bg-white dark:bg-neutral-900 overflow-y-auto max-h-[80vh] pb-safe">
        <p class="text-neutral-500 font-medium px-1">
          {{ t('switch_room_desc') }}
        </p>
        <div
          v-for="group in groups"
          :key="group.id"
          class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer"
          :class="selectedGroupId === group.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-md' : 'border-neutral-100 dark:border-neutral-800 active:scale-[0.98]'"
          @click="selectGroup(group.id)"
        >
          <div class="flex flex-col gap-1">
            <span class="font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              {{ group.name }}
            </span>
            <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {{ new Date(group.created_at || '').toLocaleDateString() }}
            </span>
          </div>
          <UIcon
            v-if="selectedGroupId === group.id"
            name="i-lucide-check-circle-2"
            class="text-primary-500 text-xl"
          />
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<i18n lang="yaml">
en:
  switch_room_title: "Switch Room"
  switch_room_desc: "Choose a room to see its games and stats, or create a new one."
nl:
  switch_room_title: "Wissel van Kamer"
  switch_room_desc: "Kies een kamer om de spellen en statistieken te zien, of maak een nieuwe aan."
</i18n>
