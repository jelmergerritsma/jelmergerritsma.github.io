<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits(["update:open", "room-created"])

const isOpen = computed({
  get: () => props.open,
  set: val => emit("update:open", val)
})

const { createGroup } = useGame()
const { t } = useI18n({ useScope: "local" })
const router = useRouter()
const { setGroupId } = useActiveGroup()

const newGroupName = ref("")
const loading = ref(false)

const onCreateGroup = async () => {
  if (!newGroupName.value) return
  loading.value = true
  try {
    const group = await createGroup(newGroupName.value, [])
    if (group) {
      newGroupName.value = ""
      isOpen.value = false
      setGroupId(group.id)
      emit("room-created", group)
      router.push("/game/setup")
    }
  } catch {
    alert(t("failed_to_create_room"))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title="t('new_room_title')"
    :description="t('new_room_desc')"
    overlay
  >
    <template #content>
      <div class="p-6 space-y-6 pt-2">
        <div class="space-y-4">
          <UFormField :label="t('room_name')">
            <UInput
              v-model="newGroupName"
              :placeholder="t('room_name_placeholder')"
              size="xl"
              class="w-full"
              :ui="{
                base: 'bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4'
              }"
              autofocus
            />
          </UFormField>
          <p class="text-xs text-neutral-500 font-medium leading-relaxed">
            {{ t('new_room_help') }}
          </p>
        </div>

        <div class="pt-2 flex flex-col gap-3 pb-safe">
          <UButton
            color="primary"
            size="xl"
            block
            icon="i-lucide-plus"
            variant="subtle"
            class="py-4 font-black uppercase tracking-widest"
            :loading="loading"
            :disabled="!newGroupName"
            @click="onCreateGroup"
          >
            {{ t("confirm_create_room") }}
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<i18n lang="yaml">
en:
  new_room_title: "New Game Room"
  new_room_desc: "Create a room to keep your scores and players organized across multiple games."
  room_name: "Room Name"
  room_name_placeholder: "e.g. Friday Night Fun"
  new_room_help: "Rooms help you track history and stats for a specific group of friends."
  confirm_create_room: "Create Room"
  cancel: "Cancel"
  failed_to_create_room: "Failed to create room"
nl:
  new_room_title: "Nieuwe Kamer"
  new_room_desc: "Maak een kamer aan om je scores en spelers georganiseerd te houden over meerdere spellen."
  room_name: "Kamernaam"
  room_name_placeholder: "bijv. Vrijdagavond Gezelligheid"
  new_room_help: "Kamers helpen je bij het bijhouden van geschiedenis en statistieken voor een specifieke groep vrienden."
  confirm_create_room: "Kamer aanmaken"
  cancel: "Annuleren"
  failed_to_create_room: "Kamer aanmaken mislukt"
</i18n>
