<script setup lang="ts">
definePageMeta({
  middleware: "auth"
})

const { fetchPlayers, addPlayer, deletePlayer, invitePlayer, loading } = usePlayers()
const { t } = useI18n({ useScope: "local" })
const toast = useToast()
const { selectedGroupId } = useActiveGroup()

const newPlayerName = ref("")
const newPlayerEmail = ref("")
const isAddPlayerDrawerOpen = ref(false)
const searchQuery = ref("")

// Delete state
const isDeleteDrawerOpen = ref(false)
const playerToDelete = ref<string | null>(null)
const isDeletingPlayer = ref(false)

// Invite state
const selectedPlayer = ref<{ id: string, name: string, email: string | null } | null>(null)
const inviteEmail = ref("")
const isInviteDrawerOpen = ref(false)

// Fetch players
const { data: players, refresh, status } = useAsyncData("players", () => fetchPlayers(selectedGroupId.value || undefined), { lazy: true, watch: [selectedGroupId] })

const filteredPlayers = computed(() => {
  if (!players.value) return []
  if (!searchQuery.value) return players.value
  const query = searchQuery.value.toLowerCase()
  return players.value.filter(p =>
    p.name.toLowerCase().includes(query)
    || (p.email && p.email.toLowerCase().includes(query))
  )
})

const onAddPlayer = async () => {
  if (!newPlayerName.value) return

  try {
    await addPlayer(newPlayerName.value, newPlayerEmail.value, selectedGroupId.value || undefined)
    newPlayerName.value = ""
    newPlayerEmail.value = ""
    isAddPlayerDrawerOpen.value = false
    await refresh()
  } catch (err) {
    const error = err as Error
    alert(error.message || t("failed_to_add_player"))
  }
}

const onDeletePlayer = (id: string) => {
  playerToDelete.value = id
  isDeleteDrawerOpen.value = true
}

const handleDeleteConfirm = async () => {
  if (!playerToDelete.value) return
  isDeletingPlayer.value = true
  try {
    await deletePlayer(playerToDelete.value)
    isDeleteDrawerOpen.value = false
    playerToDelete.value = null
    await refresh()
  } catch (err) {
    const error = err as Error
    alert(error.message || t("failed_to_delete_player"))
  } finally {
    isDeletingPlayer.value = false
  }
}

const openInviteDrawer = (player: { id: string, name: string, email: string | null }) => {
  selectedPlayer.value = player
  inviteEmail.value = ""
  isInviteDrawerOpen.value = true
}

const onInvitePlayer = async () => {
  if (!selectedPlayer.value || !inviteEmail.value) return

  try {
    await invitePlayer(selectedPlayer.value.id, inviteEmail.value)
    isInviteDrawerOpen.value = false
    selectedPlayer.value = null
    inviteEmail.value = ""
    toast.add({
      title: t("invite_sent_success"),
      color: "success"
    })
    await refresh()
  } catch (err: unknown) {
    const error = err as Error
    toast.add({
      title: t("invite_sent_error"),
      description: error.message,
      color: "error"
    })
  }
}
</script>

<template>
  <UContainer class="relative h-full flex flex-col p-6 space-y-10">
    <!-- Invite Player / Add Email Drawer -->
    <UDrawer
      v-model:open="isInviteDrawerOpen"
      :title="t('invite_player_title')"
      :description="t('invite_description', { name: selectedPlayer?.name })"
    >
      <template #content>
        <div class="p-6 space-y-6 bg-white dark:bg-neutral-900 pb-10">
          <p class="text-neutral-500 font-medium px-1">
            {{ t('invite_description', { name: selectedPlayer?.name }) }}
          </p>
          <div class="space-y-4">
            <UForm
              class="space-y-6"
              @submit="onInvitePlayer"
            >
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">
                  {{ t('player_email') }}
                </label>
                <UInput
                  v-model="inviteEmail"
                  :placeholder="t('player_email')"
                  size="xl"
                  icon="i-lucide-mail"
                  :disabled="loading"
                  type="email"
                  autofocus
                  required
                  class="w-full"
                  :ui="{
                    base: 'bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4'
                  }"
                />
              </div>

              <UButton
                type="submit"
                size="xl"
                block
                icon="i-lucide-send"
                variant="subtle"
                :loading="loading"
                class="py-4 font-black uppercase tracking-widest"
              >
                {{ t('send_invite') }}
              </UButton>
            </UForm>
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Add Player Drawer -->
    <UDrawer
      v-model:open="isAddPlayerDrawerOpen"
      :title="t('add_player')"
      :description="t('add_player_desc')"
    >
      <template #content>
        <div class="p-6 space-y-8 flex flex-col bg-white dark:bg-neutral-900  pb-10">
          <p class="text-neutral-500 font-medium px-1">
            {{ t('add_player_desc') }}
          </p>
          <UForm
            class="space-y-6"
            @submit="onAddPlayer"
          >
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">
                  {{ t('player_name') }}
                </label>
                <UInput
                  v-model="newPlayerName"
                  :placeholder="t('player_name')"
                  size="xl"
                  icon="i-lucide-user"
                  :disabled="loading"
                  autofocus
                  required
                  class="w-full"
                  :ui="{
                    base: 'bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4'
                  }"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">
                  {{ t('player_email_optional') }}
                </label>
                <UInput
                  v-model="newPlayerEmail"
                  :placeholder="t('player_email_optional')"
                  size="xl"
                  icon="i-lucide-mail"
                  :disabled="loading"
                  type="email"
                  class="w-full"
                  :ui="{
                    base: 'w-full bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4'
                  }"
                />
              </div>
            </div>

            <UButton
              type="submit"
              size="xl"
              block
              icon="i-lucide-plus"
              variant="subtle"
              :loading="loading"
              class="py-4 font-black uppercase tracking-widest"
            >
              {{ t('add_player') }}
            </UButton>
          </UForm>
        </div>
      </template>
    </UDrawer>

    <!-- Delete Confirmation Drawer -->
    <UDrawer
      v-model:open="isDeleteDrawerOpen"
      :title="t('confirm_delete_title')"
      :description="t('confirm_delete_player_message')"
    >
      <template #content>
        <div class="p-6 space-y-6">
          <p class="text-neutral-500 font-medium px-1">
            {{ t('confirm_delete_player_message') }}
          </p>
          <div class="flex flex-col gap-3 pb-safe">
            <UButton
              size="xl"
              color="error"
              block
              variant="subtle"
              class="py-4 font-black uppercase tracking-widest"
              :loading="isDeletingPlayer"
              @click="handleDeleteConfirm"
            >
              {{ t('delete_confirm') }}
            </UButton>

            <UButton
              size="xl"
              block
              variant="subtle"
              class="py-4 font-black uppercase tracking-widest"
              @click="isDeleteDrawerOpen = false"
            >
              {{ t('cancel') }}
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tighter">
          {{ t('players_title') }}
        </h1>
        <p class="text-xs text-neutral-400 font-bold uppercase tracking-widest">
          {{ t('manage_players_subtitle') }}
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="sm"
        color="neutral"
        variant="subtle"
        @click="isAddPlayerDrawerOpen = true"
      >
        {{ t('add_player') }}
      </UButton>
    </header>

    <!-- Search Filter -->
    <UInput
      v-model="searchQuery"
      :placeholder="t('search_players')"
      size="xl"
      icon="i-lucide-search"
      variant="subtle"
      class="w-full"
      :ui="{ base: 'h-14' }"
    />

    <!-- Players List -->
    <div v-if="status === 'pending'">
      <div class="space-y-3">
        <div
          v-for="i in 5"
          :key="i"
          class="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-sm"
        >
          <div class="flex items-center gap-3">
            <USkeleton class="w-10 h-10 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-3 w-32" />
            </div>
          </div>
          <USkeleton class="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>

    <div
      v-else-if="filteredPlayers && filteredPlayers.length > 0"
      class="pb-10"
    >
      <div class="space-y-3">
        <div
          v-for="player in filteredPlayers"
          :key="player.id"
          class="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all"
          :class="{ 'hover:border-primary-500/50 cursor-pointer': !player.email }"
          @click="!player.email && openInviteDrawer(player)"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold border border-primary-500/20">
              {{ player.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="font-bold text-neutral-900 dark:text-white leading-tight">{{ player.name }}</span>
                <UIcon
                  v-if="!player.email"
                  name="i-lucide-user-plus"
                  class="text-primary-500 w-3 h-3"
                />
              </div>
              <span
                v-if="player.email"
                class="text-xs text-neutral-500"
              >{{ player.email }}</span>
              <span
                v-else
                class="text-[10px] uppercase font-black tracking-widest text-primary-500/70"
              >
                {{ t('guest_player') }}
              </span>
            </div>
          </div>
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash"
            size="md"
            class="hover:bg-error-50 dark:hover:bg-error-950/30"
            @click.stop="onDeletePlayer(player.id)"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-20 bg-white/50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800"
    >
      <UIcon
        name="i-lucide-users"
        class="text-6xl text-neutral-200 dark:text-neutral-800 mb-4"
      />
      <p class="text-neutral-500 font-medium">
        {{ searchQuery ? t('no_results_found') : t('no_players_message') }}
      </p>
    </div>
  </UContainer>
</template>

<i18n lang="yaml">
en:
  players_title: "Players List"
  manage_players_subtitle: "Manage your game buddies"
  no_players_message: "You haven't added any players yet."
  failed_to_add_player: "Failed to add player"
  confirm_delete_title: "Delete Player?"
  confirm_delete_player_message: "Are you sure you want to delete this player? This action cannot be undone."
  failed_to_delete_player: "Failed to delete player"
  delete_confirm: "Yes, delete"
  cancel: "Cancel"
  back: "Back"
  add_player: "Add Player"
  add_player_desc: "Add a new player to your group."
  player_name: "Player Name"
  player_email_optional: "Email (optional)"
  search_players: "Search players..."
  no_results_found: "No players match your search."
  invite_player_title: "Invite Guest Player"
  invite_player_desc: "Send an invitation to a player to join your room."
  invite_description: "Invite {name} to create an account and join your games."
  player_email: "Email Address"
  send_invite: "Send Invite"
  failed_to_update_player: "Failed to update player"
  invite_sent_success: "Invitation sent! They can join using the link in their email."
  invite_sent_error: "Failed to send invitation"
  guest_player: "Guest"
nl:
  players_title: "Spelerslijst"
  manage_players_subtitle: "Beheer je medespelers"
  no_players_message: "Je hebt nog geen spelers toegevoegd."
  failed_to_add_player: "Speler toevoegen mislukt"
  confirm_delete_title: "Speler verwijderen?"
  confirm_delete_player_message: "Weet je zeker dat je deze speler wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
  failed_to_delete_player: "Speler verwijderen mislukt"
  delete_confirm: "Ja, verwijderen"
  cancel: "Annuleren"
  back: "Terug"
  add_player: "Speler toevoegen"
  add_player_desc: "Voeg een nieuwe speler toe aan je groep."
  player_name: "Naam speler"
  player_email_optional: "E-mail (optioneel)"
  search_players: "Zoek spelers..."
  no_results_found: "Geen spelers gevonden voor je zoekopdracht."
  invite_player_title: "Gastspeler uitnodigen"
  invite_player_desc: "Stuur een uitnodiging naar een speler om deel te nemen aan je kamer."
  invite_description: "Nodig {name} uit om een account aan te maken en deel te nemen aan je spellen."
  player_email: "E-mailadres"
  send_invite: "Uitnodiging versturen"
  failed_to_update_player: "Speler bijwerken mislukt"
  invite_sent_success: "Uitnodiging verstuurd! Ze kunnen deelnemen via de link in hun e-mail."
  invite_sent_error: "Uitnodiging versturen mislukt"
  guest_player: "Gast"
</i18n>
