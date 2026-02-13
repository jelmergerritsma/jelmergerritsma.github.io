<script setup lang="ts">
const { t } = useI18n()
const supabase = useSupabaseClient<Database>()
const toast = useToast()

const emit = defineEmits(["update-stats"])

interface Game {
  id: string
  created_at: string
  score: number
  players_count: number
  status: string
  host?: { name: string }
}

const games = ref<Game[]>([])
const loading = ref(false)

const confirmModal = ref({
  open: false,
  id: "",
  loading: false
})

const fetchGames = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .select(`
        id,
        created_at,
        current_score,
        status,
        user_id,
        game_groups (
          group_members (
            players (id, name, user_id)
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    games.value = (data || []).map((game) => {
      const g = game as unknown as {
        id: string
        created_at: string
        current_score: Record<string, unknown>
        status: string
        user_id: string
        game_groups: {
          group_members: {
            players: {
              name: string
              user_id: string
            } | null
          }[]
        } | null
      }

      // Get group members from the nested structure
      const players = g.game_groups?.group_members || []

      // Calculate total score from current_score Json
      const scores = g.current_score || {}
      const totalScore = Object.entries(scores)
        .filter(([key]) => key.startsWith("team"))
        .reduce((sum, [_, val]) => sum + (Number(val) || 0), 0)

      // Find host name from group members
      const hostPlayer = players.find(gp => gp.players?.user_id === g.user_id)

      return {
        id: g.id,
        created_at: g.created_at,
        score: totalScore,
        players_count: players.length,
        status: g.status,
        host: hostPlayer?.players ? { name: hostPlayer.players.name } : undefined
      }
    })
  } catch (err) {
    console.error("Failed to fetch games:", err)
  } finally {
    loading.value = false
  }
}

const openDeleteConfirm = (id: string) => {
  confirmModal.value = { open: true, id, loading: false }
}

const deleteGame = async () => {
  confirmModal.value.loading = true
  try {
    const { error } = await supabase.from("game_sessions").delete().eq("id", confirmModal.value.id)
    if (error) throw error
    games.value = games.value.filter(g => g.id !== confirmModal.value.id)
    emit("update-stats")
    confirmModal.value.open = false
    toast.add({ title: t("game_deleted"), color: "success" })
  } catch {
    toast.add({ title: t("operation_failed"), color: "error" })
  } finally {
    confirmModal.value.loading = false
  }
}

fetchGames()

defineExpose({ fetchGames })
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div class="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
      <h2 class="text-lg font-black uppercase tracking-tight">
        {{ t("games_history") }}
      </h2>
      <UButton
        icon="i-lucide-refresh-cw"
        variant="ghost"
        color="neutral"
        size="sm"
        :loading="loading"
        @click="fetchGames"
      />
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 text-[10px] font-black uppercase tracking-widest border-b border-neutral-200 dark:border-neutral-800">
            <th class="px-6 py-4">
              {{ t("host") }}
            </th>
            <th class="px-6 py-4">
              {{ t("score") }}
            </th>
            <th class="px-6 py-4">
              {{ t("players") }}
            </th>
            <th class="px-6 py-4">
              {{ t("date") }}
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
              colspan="5"
              class="px-6 py-8 text-center text-neutral-400"
            >
              {{ t("loading_games") }}
            </td>
          </tr>
          <tr v-else-if="games.length === 0">
            <td
              colspan="5"
              class="px-6 py-8 text-center text-neutral-400 font-medium"
            >
              {{ t("no_games") }}
            </td>
          </tr>
          <tr
            v-for="game in games"
            :key="game.id"
            class="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
          >
            <td class="px-6 py-4">
              <span class="font-bold text-neutral-900 dark:text-white capitalize">{{ game.host?.name || t('unknown_player') }}</span>
            </td>
            <td class="px-6 py-4 font-mono font-bold text-primary-500">
              {{ game.score }}
            </td>
            <td class="px-6 py-4">
              <UBadge
                color="neutral"
                variant="subtle"
                class="font-bold uppercase text-[9px] px-2"
              >
                {{ game.players_count }} {{ t('players') }}
              </UBadge>
            </td>
            <td class="px-6 py-4 text-xs text-neutral-500 font-medium">
              {{ new Date(game.created_at).toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-right">
              <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                class="font-bold"
                @click="openDeleteConfirm(game.id)"
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
      :title="t('delete_game_title')"
      :description="t('delete_game_msg')"
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
              @click="deleteGame"
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
games_history: "Recent Games"
host: "Host"
score: "Score"
players: "Players"
date: "Date"
actions: "Actions"
delete: "Delete"
confirm_action: "Yes, I'm Sure"
cancel: "Wait, No"
delete_game_title: "Purge Game?"
delete_game_msg: "Delete this game record from history?"
operation_failed: "Action failed. Try again."
game_deleted: "Game record purged"
loading_games: "Fetching history..."
no_games: "No games played yet."
unknown_player: "Unknown Legend"
</i18n>

<i18n locale="nl" lang="yaml">
games_history: "Recente Games"
host: "Host"
score: "Score"
players: "Spelers"
date: "Datum"
actions: "Acties"
delete: "Verwijderen"
confirm_action: "Ja, weet het zeker"
cancel: "Wacht, nee"
delete_game_title: "Game Wissen?"
delete_game_msg: "Dit spelrecord uit de geschiedenis verwijderen?"
operation_failed: "Actie mislukt. Probeer opnieuw."
game_deleted: "Game record gewist"
loading_games: "Geschiedenis ophalen..."
no_games: "Nog geen games gespeeld."
unknown_player: "Onbekende Legende"
</i18n>
