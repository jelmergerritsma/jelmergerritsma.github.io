<script setup lang="ts">
const props = defineProps<{
  open: boolean
  groupId?: string
}>()

const emit = defineEmits(["update:open", "player-added"])

const isOpen = computed({
  get: () => props.open,
  set: val => emit("update:open", val)
})

const { addPlayer } = usePlayers()
const { t } = useI18n({ useScope: "local" })

const newPlayerName = ref("")
const newPlayerEmail = ref("")
const isAddingPlayer = ref(false)

const onAddPlayer = async () => {
  if (!newPlayerName.value) return
  isAddingPlayer.value = true
  try {
    const player = await addPlayer(newPlayerName.value, newPlayerEmail.value, props.groupId)
    if (player) {
      newPlayerName.value = ""
      newPlayerEmail.value = ""
      isOpen.value = false
      emit("player-added", player)
    }
  } catch (err) {
    const error = err as Error
    alert(error.message || t("failed_to_add_player"))
  } finally {
    isAddingPlayer.value = false
  }
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title="t('add_player')"
    :description="t('add_player_desc')"
    overlay
  >
    <template #content>
      <div class="p-6 space-y-6 pt-2">
        <div class="space-y-4">
          <UFormField :label="t('player_name')">
            <UInput
              v-model="newPlayerName"
              :placeholder="t('player_name_placeholder')"
              size="xl"
              class="w-full"
              autofocus
            />
          </UFormField>

          <UFormField
            :label="t('email_address') + ' (' + t('optional') + ')'"
            :description="t('email_invite_desc')"
          >
            <UInput
              v-model="newPlayerEmail"
              type="email"
              :placeholder="t('player_email_placeholder')"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="pt-2 flex flex-col gap-3 pb-safe">
          <UButton
            color="primary"
            size="xl"
            block
            class="py-4 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
            :loading="isAddingPlayer"
            :disabled="!newPlayerName"
            @click="onAddPlayer"
          >
            {{ t("confirm_add_player") }}
          </UButton>
          <UButton
            color="neutral"
            variant="subtle"
            size="xl"
            block
            class="py-4 font-black uppercase tracking-widest rounded-2xl"
            @click="isOpen = false"
          >
            {{ t("cancel") }}
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<i18n lang="yaml">
en:
  add_player: "Add Player"
  add_player_desc: "Add a new legend to the roster"
  player_name: "Name"
  player_name_placeholder: "Enter name"
  email_address: "Email"
  player_email_placeholder: "email{'@'}example.com"
  optional: "Optional"
  email_invite_desc: "Send a magic link to join as a member"
  confirm_add_player: "Add to Roster"
  cancel: "Cancel"
  failed_to_add_player: "Failed to add player"
nl:
  add_player: "Speler Toevoegen"
  add_player_desc: "Voeg een nieuwe legende toe aan de lijst"
  player_name: "Naam"
  player_name_placeholder: "Voer naam in"
  email_address: "E-mail"
  player_email_placeholder: "e-mail{'@'}voorbeeld.nl"
  optional: "Optioneel"
  email_invite_desc: "Stuur een magic link om lid te worden"
  confirm_add_player: "Toevoegen aan Lijst"
  cancel: "Annuleren"
  failed_to_add_player: "Speler toevoegen mislukt"
</i18n>
