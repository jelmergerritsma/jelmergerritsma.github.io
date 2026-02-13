<script setup lang="ts">
const { $pwa } = useNuxtApp()
const { t } = useI18n()
const toast = useToast()

const registration = ref<ServiceWorkerRegistration | null | undefined>(null)

if ($pwa) {
  // Check for updates immediately on mount
  const checkForUpdates = async () => {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      registration.value = reg
      if (reg) {
        await reg.update()
      }
    }
  }

  checkForUpdates()

  // Check for updates every 15 minutes
  const interval = setInterval(checkForUpdates, 15 * 60 * 1000)

  onUnmounted(() => clearInterval(interval))

  // Watch for the needRefresh property
  watch(() => $pwa.needRefresh, (needRefresh) => {
    if (needRefresh) {
      toast.add({
        title: t("update_available_title"),
        description: t("update_available_description"),
        color: "primary",
        duration: 0,
        id: "pwa-update",
        actions: [
          {
            label: t("update_now"),
            onClick: async () => {
              await $pwa.updateServiceWorker()
              window.location.reload()
            }
          }
        ]
      })
    }
  }, { immediate: true })
}
</script>

<template>
  <div v-if="false" />
</template>

<i18n lang="yaml">
en:
  update_available_title: "Update Available"
  update_available_description: "A new version of the app is available. Update now to get the latest features."
  update_now: "Update Now"
nl:
  update_available_title: "Update Beschikbaar"
  update_available_description: "Er is een nieuwe versie van de app beschikbaar. Update nu voor de nieuwste functies."
  update_now: "Nu bijwerken"
</i18n>
