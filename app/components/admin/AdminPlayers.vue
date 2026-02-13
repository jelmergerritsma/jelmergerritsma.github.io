<script setup lang="ts">
const { t } = useI18n()
const supabase = useSupabaseClient<Database>()
const toast = useToast()

const emit = defineEmits(["update-stats"])

interface Player {
  id: string
  name: string
  is_admin: boolean | null
  created_at: string
}

const players = ref<Player[]>([])
const playerSearch = ref("")
const loading = ref(false)

const confirmModal = ref({
  open: false,
  id: "",
  loading: false
})

const fetchPlayers = async () => {
  loading.value = true
  try {
    let query = supabase.from("players").select("*").order("name", { ascending: true })
    if (playerSearch.value) query = query.ilike("name", `%${playerSearch.value}%`)

    const { data, error } = await query.limit(100)
    if (error) throw error
    players.value = (data as unknown as Player[]) || []
  } catch (err) {
    console.error("Failed to fetch players:", err)
  } finally {
    loading.value = false
  }
}

const updatePlayerRole = async (player: Player) => {
  const newAdminStatus = !player.is_admin
  try {
    const { error } = await supabase
      .from("players")
      .update({ is_admin: newAdminStatus })
      .eq("id", player.id)
    if (error) throw error

    player.is_admin = newAdminStatus
    toast.add({
      title: t("role_updated"),
      color: "success"
    })
  } catch {
    toast.add({ title: t("operation_failed"), color: "error" })
  }
}

const openDeleteConfirm = (id: string) => {
  confirmModal.value = { open: true, id, loading: false }
}

const deletePlayer = async () => {
  confirmModal.value.loading = true
  try {
    const { error } = await supabase.from("players").delete().eq("id", confirmModal.value.id)
    if (error) throw error
    players.value = players.value.filter(p => p.id !== confirmModal.value.id)
    emit("update-stats")
    confirmModal.value.open = false
    toast.add({ title: t("player_deleted"), color: "success" })
  } catch (err) {
    console.error(err)
    toast.add({ title: t("operation_failed"), color: "error" })
  } finally {
    confirmModal.value.loading = false
  }
}

fetchPlayers()

defineExpose({ fetchPlayers })
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div class="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
      <h2 class="text-lg font-black uppercase tracking-tight">
        {{ t("players_mgmt") }}
      </h2>
      <div class="flex gap-4">
        <UInput
          v-model="playerSearch"
          :placeholder="t('search_players')"
          icon="i-lucide-search"
          class="w-64"
          @input="fetchPlayers"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 text-[10px] font-black uppercase tracking-widest border-b border-neutral-200 dark:border-neutral-800">
            <th class="px-6 py-4">
              {{ t("name") }}
            </th>
            <th class="px-6 py-4">
              {{ t("role") }}
            </th>
            <th class="px-6 py-4">
              {{ t("joined") }}
            </th>
            <th class="px-6 py-4 text-right">
              {{ t("actions") }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
          <tr
            v-if="loading"
            class="animate-pulse"
          >
            <td
              colspan="4"
              class="px-6 py-8 text-center text-neutral-400"
            >
              {{ t("loading_players") }}
            </td>
          </tr>
          <tr v-else-if="players.length === 0">
            <td
              colspan="4"
              class="px-6 py-8 text-center text-neutral-400 font-medium"
            >
              {{ t("no_players") }}
            </td>
          </tr>
          <tr
            v-for="player in players"
            :key="player.id"
            class="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-black text-xs text-neutral-400 uppercase">
                  {{ player.name.slice(0, 2) }}
                </div>
                <span class="font-bold text-neutral-900 dark:text-white">{{ player.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <UBadge
                :color="player.is_admin ? 'primary' : 'neutral'"
                variant="subtle"
                class="font-bold uppercase text-[9px]"
              >
                {{ player.is_admin ? t('admin_role') : t('user_role') }}
              </UBadge>
            </td>
            <td class="px-6 py-4 text-xs text-neutral-500 font-medium">
              {{ new Date(player.created_at).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-shield"
                class="font-bold"
                @click="updatePlayerRole(player)"
              >
                {{ player.is_admin ? t('demote') : t('promote') }}
              </UButton>
              <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                class="font-bold"
                @click="openDeleteConfirm(player.id)"
              >
                {{ t('delete') }}
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UDrawer
      v-model:open="confirmModal.open"
      :title="t('delete_player_title')"
      :description="t('delete_player_msg')"
    >
      <template #content>
        <div class="p-6 space-y-6">
          <div class="flex flex-col gap-3 pb-safe">
            <UButton
              color="error"
              size="xl"
              block
              class="py-5 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-error/20"
              :loading="confirmModal.loading"
              @click="deletePlayer"
            >
              {{ t("confirm_action") }}
            </UButton>
            <UButton
              color="neutral"
              variant="subtle"
              size="xl"
              block
              class="py-4 font-black uppercase tracking-widest rounded-2xl"
              @click="confirmModal.open = false"
            >
              {{ t("cancel") }}
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<i18n locale="en" lang="yaml">
search_players: "Search players..."
players_mgmt: "Player Directory"
name: "Name"
role: "Role"
joined: "Joined"
actions: "Actions"
promote: "Make Admin"
demote: "Make User"
delete: "Delete"
confirm_action: "Yes, I'm Sure"
cancel: "Wait, No"
delete_player_title: "Ban Player?"
delete_player_msg: "Deleting a player is permanent. They will lose all progress."
operation_failed: "Action failed. Try again."
player_deleted: "Player removed"
role_updated: "Player role updated"
loading_players: "Fetching players..."
no_players: "No players found."
admin_role: "Admin"
user_role: "User"
</i18n>

<i18n locale="nl" lang="yaml">
search_players: "Zoek spelers..."
players_mgmt: "Spelerslijst"
name: "Naam"
role: "Rol"
joined: "Lid sinds"
actions: "Acties"
promote: "Maak Admin"
demote: "Maak Gebruiker"
delete: "Verwijderen"
confirm_action: "Ja, weet het zeker"
cancel: "Wacht, nee"
delete_player_title: "Speler Verwijderen?"
delete_player_msg: "Een speler verwijderen is definitief. Ze verliezen alle voortgang."
operation_failed: "Actie mislukt. Probeer opnieuw."
player_deleted: "Speler verwijderd"
role_updated: "Spelersrol aangepast"
loading_players: "Spelers ophalen..."
no_players: "Geen spelers gevonden."
admin_role: "Admin"
user_role: "Gebruiker"
</i18n>
