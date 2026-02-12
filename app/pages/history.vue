<script setup lang="ts">
import GameSessionCard from "~/components/game/GameSessionCard.vue"

definePageMeta({
  middleware: "auth"
})

const { fetchRecentSessions, deleteSession } = useGame()
const { t } = useI18n({ useScope: "local" })
const { selectedGroupId } = useActiveGroup()

const { data: sessions, refresh, status } = useAsyncData(
  () => "history-sessions-" + (selectedGroupId.value || "all"),
  () => fetchRecentSessions(50, selectedGroupId.value || undefined),
  { lazy: true, watch: [selectedGroupId] }
)

const showDeleteModal = ref(false)
const sessionToDelete = ref<string | null>(null)
const isDeleting = ref(false)

const confirmDelete = (id: string) => {
  sessionToDelete.value = id
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!sessionToDelete.value) return

  isDeleting.value = true
  try {
    await deleteSession(sessionToDelete.value)
    await refresh()
    showDeleteModal.value = false
    sessionToDelete.value = null
  } catch (err) {
    console.error("Delete failed:", err)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <div class="flex-1 overflow-y-auto min-h-0 p-6 flex flex-col items-center pb-32 pt-safe">
      <div class="w-full max-w-lg space-y-10">
        <!-- Header -->
        <header class="flex items-center gap-4">
          <UButton
            to="/"
            variant="ghost"
            icon="i-lucide-chevron-left"
            size="xl"
            class="-ml-4 font-bold"
          />
          <div>
            <h1 class="text-3xl font-black tracking-tighter">
              {{ t('game_history') }}
            </h1>
            <p class="text-xs text-neutral-400 font-bold uppercase tracking-widest">
              {{ t('history_subtitle') }}
            </p>
          </div>
        </header>

        <div
          v-if="status === 'pending'"
          class="space-y-4"
        >
          <USkeleton
            v-for="i in 5"
            :key="i"
            class="h-24 w-full rounded-2xl"
          />
        </div>

        <template v-else-if="sessions && sessions.length > 0">
          <div class="space-y-4">
            <GameSessionCard
              v-for="session in sessions"
              :key="session.id"
              :session="session"
              show-group-name
              show-delete
              @delete="confirmDelete"
            />
          </div>
        </template>

        <div
          v-else
          class="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800"
        >
          <UIcon
            name="i-lucide-ghost"
            class="text-4xl text-neutral-300 mb-4"
          />
          <p class="text-neutral-500 font-medium">
            {{ t('no_history_yet') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Drawer -->
    <UDrawer
      v-model:open="showDeleteModal"
      :title="t('confirm_delete_title')"
      :description="t('confirm_delete_message')"
    >
      <template #content>
        <div class="p-6 space-y-6">
          <p class="text-neutral-500 font-medium px-1">
            {{ t('confirm_delete_message') }}
          </p>
          <div class="flex flex-col gap-3 pb-safe">
            <UButton
              size="xl"
              color="error"
              block
              variant="subtle"
              class="py-4 font-black uppercase tracking-widest"
              :loading="isDeleting"
              @click="handleDelete"
            >
              {{ t('delete_confirm') }}
            </UButton>

            <UButton
              size="xl"
              block
              variant="subtle"
              class="py-4 font-black uppercase tracking-widest"
              @click="showDeleteModal = false"
            >
              {{ t('cancel') }}
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<i18n lang="yaml">
en:
  game_history: "Game History"
  history_subtitle: "Your past matches"
  back: "Back"
  no_history_yet: "You haven't played any games yet."
  confirm_delete_title: "Delete Game?"
  confirm_delete_message: "This will permanently delete this game and all associated statistics."
  delete_confirm: "Yes, delete"
  cancel: "Cancel"
nl:
  game_history: "Geschiedenis"
  history_subtitle: "Je eerdere potjes"
  back: "Terug"
  no_history_yet: "Je hebt nog geen spellen gespeeld."
  confirm_delete_title: "Spel verwijderen?"
  confirm_delete_message: "Dit zal dit spel en alle bijbehorende statistieken permanent verwijderen."
  delete_confirm: "Ja, verwijderen"
  cancel: "Annuleren"
</i18n>
