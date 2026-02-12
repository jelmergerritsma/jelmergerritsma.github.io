<script setup>
const user = useSupabaseUser()
const route = useRoute()
const { fetchProfile, isInitialized } = useProfile()

onMounted(async () => {
  // Always fetch once to resolve initial auth/profile state
  await fetchProfile()
})

watch(user, (newUser) => {
  if (newUser) {
    fetchProfile()
  }
})

const isMainPage = computed(() => {
  const routesWithBottomNav = ["/", "/players", "/stats", "/stats/*", "/account"]
  return routesWithBottomNav.some((pattern) => {
    if (pattern.includes("*")) {
      const regex = new RegExp("^" + pattern.replace("*", ".*") + "$")
      return regex.test(route.path)
    }
    return pattern === route.path
  })
})

useHead({
  bodyAttrs: {
    class: "h-full overflow-hidden bg-gray-50 dark:bg-default"
  }
})
</script>

<template>
  <NuxtPwaManifest />
  <UApp>
    <div
      v-show="isInitialized"
      class="h-full flex flex-col overflow-hidden"
      :class="{ 'bg-gray-50 dark:bg-default': isMainPage }"
    >
      <div class="flex-1 relative overflow-hidden">
        <NuxtPage
          :transition="route.meta.pageTransition ?? { name: 'slide-left', mode: 'default' }"
        />
      </div>
      <AppBottomNav v-if="isMainPage" />
    </div>

    <!-- Full screen loader during initialization -->
    <div
      v-if="!isInitialized"
      class="h-full w-full flex items-center justify-center bg-white dark:bg-neutral-900"
    >
      <div class="flex flex-col items-center gap-4">
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin text-4xl text-primary-500"
        />
        <span class="text-xs font-black uppercase tracking-widest text-neutral-400">Loading Session...</span>
      </div>
    </div>
  </UApp>
</template>

<style>
:root {
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-bottom: env(safe-area-inset-bottom);
}

.safe-area-inset {
  padding-top: var(--safe-area-top);
}

html, body, #__nuxt {
  height: 100%;
}

/* Ensure pages have a background for transitions */
.flex-1.relative > * {
  background-color: var(--ui-bg);
  min-height: 100%;
}
</style>
