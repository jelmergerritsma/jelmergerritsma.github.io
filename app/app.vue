<script setup>
// const user = useSupabaseUser()
const route = useRoute()
const { fetchProfile, isInitialized } = useProfile()

const isStandalone = ref(false)

isStandalone.value = window.matchMedia("(display-mode: standalone)").matches
  || navigator.standalone === true

// Always fetch once to resolve initial auth/profile state
await fetchProfile(false, true)

// watch(user, (newUser, oldUser) => {
//   const isDeepEqual = JSON.stringify(newUser) === JSON.stringify(oldUser)

//   if (newUser && !isDeepEqual) {
//     console.info("📋 app.vue:18 FETCH AGAIN")
//     fetchProfile()
//   }
// })

const isMainPage = computed(() => {
  const routesWithBottomNav = ["/", "/players", "/stats", "/account"]
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
    class: "bg-gray-50 dark:bg-default"
  }
})
</script>

<template>
  <NuxtPwaManifest />
  <PwaUpdatePrompt />
  <UApp>
    <div
      v-show="isInitialized"
      class="h-dvh min-h-dvh overflow-hidden grid grid-cols-1 pb-safe-top"
      :class="isStandalone ? 'grid-rows-[1fr_5.5rem]' : 'grid-rows-[1fr_4rem]'"
    >
      <div class="row-start-1 col-start-1 row-span-2 overflow-y-auto relative">
        <NuxtPage :transition="{ name: 'slide-left', mode: 'default' }" />
      </div>

      <AppBottomNav v-if="isMainPage" />

      <!-- Full screen loader during initialization -->
      <div
        v-show="!isInitialized"
        class="row-start-1 col-start-1 row-span-2 h-full w-full flex items-center justify-center bg-white dark:bg-neutral-900 relative z-100"
      >
        <div class="flex flex-col items-center gap-4">
          <UIcon
            name="i-lucide-loader-2"
            class="animate-spin text-4xl text-primary-500"
          />
          <span class="text-xs font-black uppercase tracking-widest text-neutral-400">Loading Session...</span>
        </div>
      </div>
    </div>
  </UApp>
</template>
