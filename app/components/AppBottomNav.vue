<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const isGameActive = computed(() => {
  return route.name === "game-id"
})

const navItems = [
  {
    label: t("nav_home"),
    icon: "i-lucide-layout-grid",
    to: "/"
  },
  {
    label: t("nav_players"),
    icon: "i-lucide-users",
    to: "/players"
  },
  {
    label: t("nav_stats"),
    icon: "i-lucide-trophy",
    to: "/stats"
  },
  {
    label: t("nav_account"),
    icon: "i-lucide-user",
    to: "/account"
  }
]
</script>

<template>
  <nav
    v-if="!isGameActive"
    class="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 pb-safe relative z-50"
  >
    <div class=" px-4 h-20 flex items-center justify-between relative">
      <!-- Main Nav Items (Left) -->
      <div class="flex gap-8 grow justify-center pr-8">
        <NuxtLink
          v-for="item in navItems.slice(0, 2)"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-1 transition-colors"
          :class="route.path === item.to ? 'text-primary-500' : 'text-neutral-400'"
        >
          <UIcon
            :name="item.icon"
            class="text-2xl"
          />
          <span class="text-[10px] font-black uppercase tracking-tighter">{{ item.label }}</span>
        </NuxtLink>
      </div>

      <!-- Center Play Button (Floating-ish) -->
      <div class="absolute left-1/2 -translate-x-1/2 -top-6">
        <UButton
          to="/game/setup"
          size="xl"
          icon="i-lucide-play"
          class="rounded-full w-16 h-16 shadow-xl shadow-primary-500/20 border-4 border-white dark:border-neutral-900 items-center justify-center"
          :ui="{ leadingIcon: 'text-3xl' }"
        />
      </div>

      <!-- Main Nav Items (Right) -->
      <div class="flex grow gap-8 justify-center pl-8">
        <NuxtLink
          v-for="item in navItems.slice(2)"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-1 transition-colors"
          :class="route.path === item.to ? 'text-primary-500' : 'text-neutral-400'"
        >
          <UIcon
            :name="item.icon"
            class="text-2xl"
          />
          <span class="text-[10px] font-black uppercase tracking-tighter">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<i18n lang="yaml">
en:
  nav_home: "Home"
  nav_players: "Players"
  nav_stats: "Stats"
  nav_account: "Account"
nl:
  nav_home: "Start"
  nav_players: "Spelers"
  nav_stats: "Stats"
  nav_account: "Account"
</i18n>
