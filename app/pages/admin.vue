<script setup lang="ts">
import AdminStats from "~/components/admin/AdminStats.vue"
import AdminWords from "~/components/admin/AdminWords.vue"
import AdminPlayers from "~/components/admin/AdminPlayers.vue"
import AdminGames from "~/components/admin/AdminGames.vue"

definePageMeta({
  middleware: "auth"
})

const { t } = useI18n({ useScope: "local" })
const { profile, fetchProfile, isAdmin } = useProfile()
const supabase = useSupabaseClient<Database>()
const loading = ref(true)

const stats = ref({
  words: 0,
  players: 0,
  games: 0
})

const tabs = computed(() => [
  { label: t("words"), icon: "i-lucide-file-text", slot: "words" },
  { label: t("players"), icon: "i-lucide-users", slot: "players" },
  { label: t("games"), icon: "i-lucide-trophy", slot: "games" }
])

const checkAdmin = async () => {
  // Ensure we have current profile data
  if (!profile.value) {
    await fetchProfile(true) // Force fetch to get freshest DB data
  }

  // Double check directly against Supabase if state seems wrong
  if (!profile.value?.is_admin) {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data } = await supabase
        .from("players")
        .select("is_admin")
        .eq("user_id", authUser.id)
        .maybeSingle()

      if (data?.is_admin) {
        // Update local state if DB says yes
        await fetchProfile(true)
      }
    }
  }

  if (isAdmin.value) {
    await fetchStats()
  }
}

const fetchStats = async () => {
  const [w, p, g] = await Promise.all([
    supabase.from("words").select("id", { count: "exact", head: true }),
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("game_sessions").select("id", { count: "exact", head: true })
  ])
  stats.value = {
    words: w.count || 0,
    players: p.count || 0,
    games: g.count || 0
  }
}

await checkAdmin()
loading.value = false
</script>

<template>
  <div class="h-full overflow-y-auto p-4 md:p-8">
    <div
      v-if="loading"
      class="max-w-6xl mx-auto flex items-center justify-center h-full"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-primary-500"
      />
    </div>

    <div
      v-else-if="!isAdmin"
      class="max-w-2xl mx-auto mt-20 text-center pb-12"
    >
      <div class="bg-white dark:bg-neutral-900 p-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
        <UIcon
          name="i-lucide-shield-alert"
          class="w-16 h-16 mx-auto text-error-500 mb-6"
        />
        <h1 class="text-3xl font-black uppercase mb-4">
          {{ t("access_denied") }}
        </h1>
        <p class="text-neutral-500 mb-8 font-medium">
          {{ t("admin_only") }}
        </p>
        <UButton
          to="/"
          color="neutral"
          size="xl"
          class="font-black uppercase tracking-wider"
        >
          {{ t("go_home") }}
        </UButton>
      </div>
    </div>

    <div
      v-else
      class="w-full max-w-6xl mx-auto space-y-8 pb-20"
    >
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
            {{ t("admin_panel") }}
          </h1>
          <p class="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-2">
            {{ t("manage_platform") }}
          </p>
        </div>
        <UButton
          to="/"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          class="font-black uppercase text-xs tracking-widest"
        >
          {{ t("back_to_game") }}
        </UButton>
      </div>

      <!-- Stats Grid -->
      <AdminStats :stats="stats" />

      <!-- Main Tabs -->
      <UTabs
        :items="tabs"
        class="w-full"
      >
        <template #words>
          <AdminWords @update-stats="fetchStats" />
        </template>

        <template #players>
          <AdminPlayers @update-stats="fetchStats" />
        </template>

        <template #games>
          <AdminGames @update-stats="fetchStats" />
        </template>
      </UTabs>
    </div>
  </div>
</template>

<i18n locale="en" lang="yaml">
admin_panel: "Admin Command Center"
manage_platform: "Managing words, heathens, and legends"
access_denied: "Restricted Area"
admin_only: "You do not have the required permissions to access this page."
go_home: "Back to safety"
back_to_game: "Exit Admin"
words: "Words"
players: "Players"
games: "Games"
</i18n>

<i18n locale="nl" lang="yaml">
admin_panel: "Admin Controlecentrum"
manage_platform: "Beheer woorden, spelers en legendes"
access_denied: "Verboden Toegang"
admin_only: "Je hebt niet de juiste rechten om deze pagina te bekijken."
go_home: "Terug naar veiligheid"
back_to_game: "Verlaat Admin"
words: "Woorden"
players: "Spelers"
games: "Games"
</i18n>
