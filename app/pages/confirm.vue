<script setup lang="ts">
const { t } = useI18n()
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

watch(user, () => {
  if (user.value) {
    // Get redirect path, and clear it from the cookie
    const path = redirectInfo.pluck()
    // Redirect to the saved path, or fallback to home
    return navigateTo(path || "/")
  }
}, { immediate: true })
</script>

<template>
  <div>{{ t("waiting_for_login") }}</div>
</template>

<i18n lang="yaml">
en:
  waiting_for_login: "Waiting for login..."
nl:
  waiting_for_login: "Wachten op inloggen..."
</i18n>
