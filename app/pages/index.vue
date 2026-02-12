<script setup lang="ts">
import HomeRoomSwitcherDrawer from "~/components/home/HomeRoomSwitcherDrawer.vue"
import HomeCreateRoomDrawer from "~/components/home/HomeCreateRoomDrawer.vue"
import GameSessionCard from "~/components/game/GameSessionCard.vue"

definePageMeta({
  middleware: "auth"
})

const { t } = useI18n({ useScope: "local" })
const router = useRouter()
const route = useRoute()
const { fetchRecentSessions, fetchGroups } = useGame()
const { selectedGroupId, setGroupId } = useActiveGroup()

const isRoomSwitcherOpen = ref(false)
const isNewGroupDrawerOpen = ref(false)

const { data: groups, refresh: refreshGroups, status: groupsStatus } = useAsyncData("groups", () => fetchGroups(), { lazy: true })

const activeGroup = computed(() => {
  if (!groups.value) return null
  if (selectedGroupId.value) {
    return groups.value.find(g => g.id === selectedGroupId.value) || groups.value[0] || null
  }
  return groups.value[0] || null
})

// Update selected ID if it was null but groups loaded
watch(groups, (newGroups) => {
  if (newGroups?.length && !selectedGroupId.value) {
    selectedGroupId.value = newGroups[0]?.id || null
  }
}, { immediate: true })

const { data: recentSessions, status: sessionsStatus } = useAsyncData(
  "recent-sessions",
  () => fetchRecentSessions(3, activeGroup.value?.id),
  { lazy: true, watch: [activeGroup] }
)

const handleRoomSelected = (id: string) => {
  selectedGroupId.value = id
}

const handleRoomCreated = () => {
  refreshGroups()
}

// Handle global navigation to start a game or create a room
watch([() => route.query.action, groupsStatus], ([action, status]) => {
  if (action === "new-room" && status === "success") {
    if (groups.value && groups.value.length > 0) {
      // If we already have rooms, go to the setup for the most recent one
      setGroupId(groups.value[0]?.id || null)
      router.replace({
        path: "/game/setup"
      })
    } else {
      // Otherwise open the new room drawer
      isNewGroupDrawerOpen.value = true
      router.replace({ query: {} })
    }
  }
})
</script>

<template>
  <UContainer class="relative h-full flex flex-col p-4 sm:p-6 space-y-8 sm:space-y-10">
    <!-- Drawers -->
    <HomeRoomSwitcherDrawer
      v-model:open="isRoomSwitcherOpen"
      :groups="groups"
      :selected-group-id="selectedGroupId"
      @select-room="handleRoomSelected"
    />

    <HomeCreateRoomDrawer
      v-model:open="isNewGroupDrawerOpen"
      @room-created="handleRoomCreated"
    />

    <!-- Header Section -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tighter">
          30 SECONDS
        </h1>
        <p class="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-widest">
          {{ t("welcome_back") }}
        </p>
      </div>
    </header>

    <!-- Content -->
    <div
      class="flex-1 space-y-8 overflow-y-auto min-h-0 pb-32 -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      <!-- Groups Section -->
      <section class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center justify-between gap-2 grow">
            <UButton
              variant="link"
              size="sm"
              color="primary"
              class="font-black uppercase tracking-widest text-[10px]"
              @click="isRoomSwitcherOpen = true"
            >
              <UIcon
                name="i-lucide-house"
                class="text-lg"
              />
              {{ t('switch_room') }}
            </UButton>
            <UButton
              variant="link"
              size="sm"
              color="neutral"
              class="font-black uppercase tracking-widest text-[10px]"
              @click="isNewGroupDrawerOpen = true"
            >
              <UIcon
                name="i-lucide-house-plus"
                class="text-lg"
              />
              {{ t('new_room') }}
            </UButton>
          </div>
        </div>

        <!-- Active Room Card -->
        <div
          v-if="groupsStatus === 'pending'"
          class="px-1"
        >
          <USkeleton class="h-40 w-full rounded-2xl" />
        </div>
        <div
          v-else-if="activeGroup"
          class="p-5 sm:p-6 bg-white dark:bg-neutral-900 border-2 border-primary-500/20 dark:border-primary-500/10 rounded-3xl shadow-sm space-y-4 ring-4 ring-primary-500/5"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1 min-w-0">
              <h3 class="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-tight truncate">
                {{ activeGroup.name }}
              </h3>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-widest text-primary-500 shrink-0">
                  {{ activeGroup.game_sessions?.length || 0 }} {{ t('games_played') }}
                </span>
                <span class="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                <span class="text-[10px] font-black uppercase tracking-widest text-neutral-400 shrink-0">
                  {{ activeGroup.group_members?.length || 0 }} {{ t('members') }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div class="flex -space-x-2 overflow-hidden">
              <div
                v-for="(gm, idx) in activeGroup.group_members?.slice(0, 5)"
                :key="idx"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-white dark:border-neutral-900 flex items-center justify-center text-[10px] sm:text-xs font-black shadow-sm shrink-0"
              >
                {{ gm.players?.name?.charAt(0) }}
              </div>
              <div
                v-if="activeGroup.group_members?.length > 5"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-50 dark:bg-primary-950 border border-white dark:border-neutral-900 flex items-center justify-center text-[10px] font-black text-primary-500 shrink-0"
              >
                +{{ activeGroup.group_members.length - 5 }}
              </div>
            </div>
          </div>
        </div>

        <!-- No Rooms State -->
        <div
          v-else-if="groupsStatus === 'success' && (!groups || groups.length === 0)"
          class="p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-4 mx-1"
        >
          <div class="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto">
            <UIcon
              name="i-lucide-door-open"
              class="text-2xl text-neutral-400"
            />
          </div>
          <p class="text-xs text-neutral-500 font-bold uppercase tracking-widest">
            {{ t('no_rooms_yet_title') }}
          </p>
          <UButton
            icon="i-lucide-plus"
            size="lg"
            variant="subtle"
            class="font-black uppercase tracking-widest"
            @click="isNewGroupDrawerOpen = true"
          >
            {{ t("create_first_room") }}
          </UButton>
        </div>
      </section>

      <!-- Recent Sessions Section -->
      <section class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-3">
            <h2 class="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {{ t('recent_games') }}
            </h2>
          </div>
          <UButton
            v-if="activeGroup"
            variant="link"
            size="sm"
            color="primary"
            class="font-black uppercase tracking-widest text-[10px]"
            to="/history"
          >
            {{ t('view_all') }}
          </UButton>
        </div>

        <div
          v-if="sessionsStatus === 'pending'"
          class="space-y-3"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="block p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <USkeleton class="h-3 w-20" />
              <USkeleton class="h-4 w-12 rounded-full" />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex -space-x-2">
                <USkeleton
                  v-for="j in 3"
                  :key="j"
                  class="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900"
                />
              </div>
              <USkeleton class="h-6 w-16" />
            </div>
          </div>
        </div>

        <div
          v-else-if="recentSessions && recentSessions.length > 0"
          class="space-y-3"
        >
          <GameSessionCard
            v-for="session in recentSessions"
            :key="session.id"
            :session="session"
          />
        </div>

        <div
          v-else
          class="p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-3 mx-1"
        >
          <div class="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto opacity-50">
            <UIcon
              name="i-lucide-gamepad-2"
              class="text-xl text-neutral-400"
            />
          </div>
          <p class="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
            {{ t("no_games_in_room") }}
          </p>
          <UButton
            icon="i-lucide-play"
            size="sm"
            variant="ghost"
            class="font-black uppercase tracking-widest text-[10px]"
            to="/game/setup"
          >
            {{ t("start_first_game") }}
          </UButton>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<i18n lang="yaml">
en:
  welcome_back: "Welcome back!"
  hero_title: "The Ultimate Party Game"
  recent_games: "Recent Games"
  active_room: "Active Room"
  switch_room: "Switch Room"
  switch_room_title: "Switch Room"
  switch_room_desc: "Choose a room to see its games and stats, or create a new one."
  games_played: "games played"
  members: "members"
  play: "Play"
  room_stats: "Room Stats"
  no_rooms_yet_title: "No rooms yet"
  create_first_room: "Create your first room"
  no_games_in_room: "No games played in this room yet"
  finished: "Finished"
  in_progress: "In progress"
  new_room: "New Room"
  view_all: "History"
  start_first_game: "Start First Game"
  get_started: "Get Started"
  hero_subtitle_room: "Create a room and invite your friends by email to play together."
  create_account: "Create Account"
  join_by_email: "Join by Email"
  view_stats: "Stats"
  new_room_title: "New Game Room"
  new_room_desc: "Create a room to keep your scores and players organized across multiple games."
  create_room: "Create Room"
  room_name: "Room Name"
  room_name_placeholder: "e.g. Friday Night Fun"
  failed_to_create_room: "Failed to create room"

nl:
  welcome_back: "Welkom terug!"
  hero_title: "Het Ultieme Partyspel"
  recent_games: "Recente Spellen"
  active_room: "Actieve Kamer"
  switch_room: "Wissel van Kamer"
  switch_room_title: "Wissel van Kamer"
  switch_room_desc: "Kies een kamer om de spellen en statistieken te zien, of maak een nieuwe aan."
  games_played: "games gespeeld"
  members: "leden"
  play: "Spelen"
  room_stats: "Kamer Stats"
  no_rooms_yet_title: "Nog geen kamers"
  create_first_room: "Maak je eerste kamer aan"
  no_games_in_room: "Nog geen spellen gespeeld in deze kamer"
  finished: "Afgelopen"
  in_progress: "Bezig"
  new_room: "Nieuwe Kamer"
  view_all: "Geschiedenis"
  start_first_game: "Start Eerste Spel"
  get_started: "Aan de slag"
  hero_subtitle_room: "Maak een kamer aan en nodig je vrienden uit via e-mail om samen te spelen."
  create_account: "Account aanmaken"
  join_by_email: "Deelnemen via E-mail"
  view_stats: "Statistieken"
  new_room_title: "Nieuwe Kamer"
  new_room_desc: "Maak een kamer aan om je scores en spelers georganiseerd te houden over meerdere spellen."
  create_room: "Kamer aanmaken"
  room_name: "Kamernaam"
  room_name_placeholder: "bijv. Vrijdagavond Gezelligheid"
  failed_to_create_room: "Kamer aanmaken mislukt"
</i18n>
