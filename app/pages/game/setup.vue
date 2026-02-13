<script setup lang="ts">
import SetupAddPlayerDrawer from "~/components/game/SetupAddPlayerDrawer.vue"

const { fetchPlayers } = usePlayers()
const { createSession, loading } = useGame()
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const { selectedGroupId } = useActiveGroup()

const groupId = selectedGroupId
const selectedPlayers = ref<string[]>(route.query.players ? (route.query.players as string).split(",") : [])
const wordCount = ref(Number(route.query.words) || 5)
const teamCount = ref(Number(route.query.teams) || 2)
const maxPoints = ref(Number(route.query.max_points) || 30)
const language = ref((route.query.lang as string) || locale.value || "nl")
const assignmentMode = ref<"random" | "manual">(route.query.assignments ? "manual" : "random")
const manualAssignments = ref<Record<string, number>>({})

// Pre-fill manual assignments if provided in query
if (route.query.assignments) {
  const pairs = (route.query.assignments as string).split(",")
  pairs.forEach((pair) => {
    const [id, team] = pair.split(":")
    if (id && team) {
      manualAssignments.value[id] = Number(team)
    }
  })
}

// Redirect if no group_id provided

if (!groupId.value) {
  router.push("/?action=new-room")
}

const maxPossibleTeams = computed(() => Math.floor(selectedPlayers.value.length / 2))

// Slideover state
const isAddPlayerOpen = ref(false)

const togglePlayer = (id: string) => {
  if (selectedPlayers.value.includes(id)) {
    selectedPlayers.value = selectedPlayers.value.filter(p => p !== id)
  } else {
    selectedPlayers.value.push(id)
  }
}

// Fetch players (specific to this group)
const { data: players, refresh } = useAsyncData("players-room", () => fetchPlayers(groupId.value || undefined), { lazy: true, watch: [groupId] })

const handlePlayerAdded = (player: { id: string }) => {
  refresh()
  selectedPlayers.value.push(player.id)
}

// Initialize manual assignments when selected players change
watch(selectedPlayers, (newSelected) => {
  newSelected.forEach((id) => {
    if (!manualAssignments.value[id]) {
      manualAssignments.value[id] = 1
    }
  })

  // Ensure teamCount doesn't exceed max allowed teams for 2-player teams
  if (teamCount.value > maxPossibleTeams.value) {
    teamCount.value = Math.max(2, maxPossibleTeams.value)
  }
}, { deep: true })

watch(teamCount, (newCount) => {
  // Clamp manual assignments to new team count
  Object.keys(manualAssignments.value).forEach((id) => {
    const currentTeam = manualAssignments.value[id]
    if (currentTeam && currentTeam > (newCount || 0)) {
      manualAssignments.value[id] = newCount || 1
    }
  })
})

const onCreateSession = async () => {
  try {
    const activeGroupId = groupId.value
    if (!activeGroupId) return

    const playerMap = Object.fromEntries(players.value?.map(p => [p.id, p.name]) || [])
    let assignments: { player_id: string, name: string, team: number }[] = []

    if (assignmentMode.value === "random") {
      const shuffled = [...selectedPlayers.value].sort(() => 0.5 - Math.random())
      assignments = shuffled.map((id, index) => ({
        player_id: id,
        name: playerMap[id] || "Unknown",
        team: (index % teamCount.value) + 1
      }))
    } else {
      assignments = selectedPlayers.value.map(id => ({
        player_id: id,
        name: playerMap[id] || "Unknown",
        team: manualAssignments.value[id] || 1
      }))
    }

    const session = await createSession(assignments, activeGroupId)
    if (!session) return

    router.push({
      path: `/game/${session.id}`,
      query: {
        lang: language.value,
        words: wordCount.value.toString(),
        max_points: maxPoints.value.toString()
      }
    })
  } catch (err) {
    const error = err as Error
    alert(error.message || t("failed_to_create_game"))
  }
}

const canCreateGame = computed(() => {
  if (selectedPlayers.value.length < 4) return false

  if (assignmentMode.value === "manual") {
    const teamPlayerCounts: Record<number, number> = {}
    selectedPlayers.value.forEach((id) => {
      const team = manualAssignments.value[id] || 1
      teamPlayerCounts[team] = (teamPlayerCounts[team] || 0) + 1
    })

    for (let t = 1; t <= teamCount.value; t++) {
      if ((teamPlayerCounts[t] || 0) < 2) return false
    }
  }

  return true
})
</script>

<template>
  <div class="h-full bg-neutral-50 dark:bg-neutral-950 overflow-hidden relative flex flex-col">
    <div class=" flex-1 overflow-y-auto p-6 flex flex-col items-center pb-48 pt-safe">
      <div class="w-full max-w-lg space-y-10 flex flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-black uppercase tracking-tighter leading-none">
              {{ t('setup_game') }}
            </h1>
            <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">
              {{ t('prepare_battle') }}
            </p>
          </div>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="xl"
            @click="router.back()"
          />
        </header>

        <!-- Player Selection -->
        <div class="flex flex-col gap-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <h2 class="text-xl font-bold tracking-tight">
                  {{ t('select_players') }}
                </h2>
                <p class="text-sm text-gray-500">
                  {{ selectedPlayers.length }} {{ t('players_selected') }}
                  <span
                    v-if="selectedPlayers.length < 4"
                    class="text-orange-500 ml-1"
                  >({{ t('min_4') }})</span>
                </p>
              </div>
              <UButton
                color="neutral"
                variant="soft"
                icon="i-heroicons-user-plus"
                size="sm"
                @click="isAddPlayerOpen = true"
              >
                {{ t('quick_add') }}
              </UButton>
            </div>

            <div class="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
              <div
                v-for="player in players"
                :key="player.id"
                class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer"
                :class="selectedPlayers.includes(player.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-md' : 'border-neutral-100 dark:border-neutral-800 active:scale-[0.98]'"
                @click="togglePlayer(player.id)"
              >
                <div class="flex flex-col gap-1 overflow-hidden">
                  <span class="font-black tracking-tight text-neutral-900 dark:text-white truncate">
                    {{ player.name }}
                  </span>
                  <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {{ player.user_id ? t('member') : t('guest') }}
                  </span>
                </div>
                <UIcon
                  v-if="selectedPlayers.includes(player.id)"
                  name="i-lucide-check-circle-2"
                  class="text-primary-500 text-xl shrink-0"
                />
              </div>
            </div>
          </div>

          <div class="h-px bg-neutral-100 dark:bg-neutral-800" />

          <!-- Game Config -->
          <div class="space-y-8 ">
            <div class="px-1">
              <h2 class="text-sm font-black uppercase tracking-widest text-neutral-400">
                2. {{ t('step_teams') }}
              </h2>
            </div>

            <!-- Team Count -->
            <div class="space-y-4">
              <div class="flex items-center justify-between px-1">
                <label class="text-xs font-black tracking-widest text-neutral-500">
                  {{ t('number_of_teams') }} ({{ t('max') }}: {{ maxPossibleTeams > 2 ? maxPossibleTeams : 2 }})
                </label>
              </div>

              <UInputNumber
                v-model="teamCount"
                :min="2"
                :max="maxPossibleTeams || 2"
                :step="1"
                size="xl"
                class="w-full"
                :ui="{
                  base: 'font-bold h-14'
                }"
              />
            </div>

            <div class="h-px bg-neutral-100 dark:bg-neutral-800" />

            <div class="px-1">
              <h2 class="text-sm font-black uppercase tracking-widest text-neutral-400">
                3. {{ t('step_assignment') }}
              </h2>
            </div>

            <!-- Assignment Mode -->
            <div class="space-y-4 pt-2">
              <label class="text-xs font-black uppercase tracking-widest text-neutral-500 px-1">
                {{ t('team_assignment') }}
              </label>
              <div class="grid grid-cols-2 gap-2">
                <UButton
                  v-for="mode in (['random', 'manual'] as const)"
                  :key="mode"
                  :variant="assignmentMode === mode ? 'solid' : 'subtle'"
                  color="primary"
                  size="md"
                  class="font-black uppercase py-3 justify-center"
                  @click="assignmentMode = mode"
                >
                  {{ t(`assignment_${mode}`) }}
                </UButton>
              </div>
            </div>

            <!-- Manual Assignments -->
            <div
              v-if="assignmentMode === 'manual'"
              class="space-y-4 animate-in slide-in-from-top-2 duration-300"
            >
              <div
                v-for="id in selectedPlayers"
                :key="id"
                class="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
              >
                <span class="text-xs font-bold truncate pr-4 uppercase tracking-tighter">{{ players?.find(p => p.id === id)?.name }}</span>
                <div class="flex items-center gap-1">
                  <UButton
                    v-for="tIdx in teamCount"
                    :key="tIdx"
                    size="xs"
                    :color="manualAssignments[id] === tIdx ? 'primary' : 'neutral'"
                    :variant="manualAssignments[id] === tIdx ? 'solid' : 'ghost'"
                    class="w-8 h-8 flex items-center justify-center p-0 rounded-lg font-black"
                    @click="manualAssignments[id] = tIdx"
                  >
                    {{ tIdx }}
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-neutral-100 dark:bg-neutral-800" />

            <div class="px-1">
              <h2 class="text-sm font-black uppercase tracking-widest text-neutral-400">
                4. {{ t('step_settings') }}
              </h2>
            </div>

            <!-- More Settings -->
            <div class="flex flex-col gap-8">
              <div class="space-y-4">
                <div class="flex items-center justify-between px-1">
                  <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    {{ t('words_per_turn') }}
                  </label>
                </div>
                <UInputNumber
                  v-model="wordCount"
                  :min="1"
                  :max="10"
                  size="xl"
                  class="w-full"
                  :ui="{
                    base: 'font-bold h-14'
                  }"
                />
              </div>
              <div class="space-y-4">
                <div class="flex items-center justify-between px-1">
                  <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    {{ t('points_to_win') }}
                  </label>
                </div>
                <UInputNumber
                  v-model="maxPoints"
                  type="number"
                  :min="10"
                  :max="100"
                  :step="5"
                  size="xl"
                  class="w-full"
                  :ui="{
                    base: 'font-bold h-14'
                  }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer spacing -->
        <div class="flex-1" />
      </div>
    </div>

    <!-- Start Button Area -->
    <div class="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 z-10">
      <div class="max-w-lg mx-auto">
        <UButton
          size="xl"
          block
          color="primary"
          class="py-6 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/25 disabled:opacity-30"
          :loading="loading"
          :disabled="!canCreateGame"
          @click="onCreateSession"
        >
          {{ t('start_the_battle') }}
        </UButton>
        <p
          v-if="!canCreateGame"
          class="text-center text-[10px] font-bold text-neutral-400 uppercase mt-4 tracking-widest"
        >
          {{ selectedPlayers.length < 4 ? t('need_more_players') : t('check_team_balance') }}
        </p>
      </div>
    </div>

    <!-- Add Player Drawer -->
    <SetupAddPlayerDrawer
      v-model:open="isAddPlayerOpen"
      :group-id="groupId || undefined"
      @player-added="handlePlayerAdded"
    />
  </div>
</template>

<i18n lang="yaml">
en:
  setup_game: "Prepare Your Battle"
  prepare_battle: "Configure teams and settings"
  select_players: "Choose Warriors"
  players_selected: "players selected"
  min_4: "min 4"
  quick_add: "Add New"
  member: "Member"
  guest: "Guest"
  config_battle: "Session Logic"
  step_teams: "Amount of Teams"
  step_assignment: "Team Assignment"
  step_settings: "Game Settings"
  max: "Max"
  number_of_teams: "Amount of Teams"
  team_assignment: "Team Assignment"
  assignment_random: "Random"
  assignment_manual: "Manual"
  words_per_turn: "Words / Turn"
  points_to_win: "Points to Win"
  start_the_battle: "Start the Battle"
  team: "Team"
  need_more_players: "Need at least 4 players (2 per team)"
  check_team_balance: "Each team needs at least 2 players"
  failed_to_create_game: "Deployment failed"
nl:
  setup_game: "Bereid de Strijd voor"
  prepare_battle: "Configureer teams en instellingen"
  select_players: "Kies Spelers"
  players_selected: "spelers geselecteerd"
  min_4: "min 4"
  quick_add: "Nieuwe Speler"
  member: "Lid"
  guest: "Gast"
  config_battle: "Sessie Logica"
  step_teams: "Aantal teams"
  step_assignment: "Teamindeling"
  step_settings: "Spel instellingen"
  max: "Max"
  number_of_teams: "Aantal Teams"
  team_assignment: "Teamindeling"
  assignment_random: "Willekeurig"
  assignment_manual: "Handmatig"
  words_per_turn: "Woorden / Beurt"
  points_to_win: "Punten om te winnen"
  start_the_battle: "Start de Strijd"
  team: "Team"
  need_more_players: "Minimaal 4 spelers nodig (2 per team)"
  check_team_balance: "Elk team moet minimaal 2 spelers hebben"
  failed_to_create_game: "Sessie aanmaken mislukt"
</i18n>
