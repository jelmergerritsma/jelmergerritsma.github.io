<script setup lang="ts">
definePageMeta({
  middleware: "auth"
})

const user = useSupabaseUser()
const client = useSupabaseClient()
const { t, locale, locales, setLocale } = useI18n({ useScope: "local" })
const { profile, updateProfile, isAdmin } = useProfile()

const displayName = ref("")
const isSaving = ref(false)
const isDisplayNameDrawerOpen = ref(false)
const isLanguageDrawerOpen = ref(false)
const toast = useToast()

// Sync displayName with profile name
watch(profile, (newProfile) => {
  if (newProfile?.name && !displayName.value) {
    displayName.value = newProfile.name
  }
}, { immediate: true })

const languageItems = locales.value.map(l => ({
  label: l.code === "en" ? "English" : "Nederlands",
  value: l.code,
  icon: l.code === "en" ? "i-circle-flags:us" : "i-circle-flags:nl"
}))

const selectLanguage = (code: "en" | "nl") => {
  setLocale(code)
  isLanguageDrawerOpen.value = false
}

const logout = async () => {
  await client.auth.signOut()
  navigateTo("/login")
}

const onUpdateDisplayName = async () => {
  if (!displayName.value || displayName.value === profile.value?.name) {
    isDisplayNameDrawerOpen.value = false
    return
  }

  isSaving.value = true
  try {
    await updateProfile({ name: displayName.value })
    isDisplayNameDrawerOpen.value = false
    toast.add({
      title: t("profile_updated"),
      color: "success"
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error("Failed to update display name:", error)
    toast.add({
      title: t("failed_to_update_profile"),
      description: error.message,
      color: "error"
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <UContainer class="h-full p-6 space-y-10 overflow-y-auto min-h-0 pb-32">
    <!-- Update Display Name Drawer -->
    <UDrawer
      v-model:open="isDisplayNameDrawerOpen"
      :title="t('edit_display_name')"
      :description="t('edit_display_name_desc')"
    >
      <template #content>
        <div class="p-6 space-y-8 flex flex-col bg-white dark:bg-neutral-900 pb-10">
          <p class="text-neutral-500 font-medium px-1">
            {{ t('edit_display_name_desc') }}
          </p>
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">
                {{ t('display_name') }}
              </label>
              <UInput
                v-model="displayName"
                :placeholder="t('display_name')"
                size="xl"
                icon="i-lucide-user"
                autofocus
                class="w-full"
                :ui="{ base: 'font-bold h-14' }"
              />
            </div>

            <UButton
              size="xl"
              block
              variant="subtle"
              :loading="isSaving"
              :disabled="!displayName || displayName === profile?.name"
              class="py-4 font-black uppercase tracking-widest"
              @click="onUpdateDisplayName"
            >
              {{ t('save') }}
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Update Language Drawer -->
    <UDrawer
      v-model:open="isLanguageDrawerOpen"
      :title="t('language')"
      :description="t('language_desc')"
    >
      <template #content>
        <div class="p-6 space-y-4 bg-white dark:bg-neutral-900 pb-10">
          <p class="text-neutral-500 font-medium px-1">
            {{ t('language_desc') }}
          </p>
          <div
            v-for="item in languageItems"
            :key="item.value"
            class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer"
            :class="locale === item.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-neutral-100 dark:border-neutral-800'"
            @click="selectLanguage(item.value as 'en' | 'nl')"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="item.icon"
                class="text-2xl"
              />
              <span class="font-black text-lg">{{ item.label }}</span>
            </div>
            <UIcon
              v-if="locale === item.value"
              name="i-lucide-check-circle-2"
              class="text-primary-500 text-xl"
            />
          </div>
        </div>
      </template>
    </UDrawer>

    <header>
      <h1 class="text-3xl font-black tracking-tighter">
        {{ t('account') }}
      </h1>
      <p class="text-xs text-neutral-400 font-bold uppercase tracking-widest">
        {{ t('manage_profile') }}
      </p>
    </header>

    <div
      v-if="user"
      class="space-y-8"
    >
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 rounded-full flex items-center justify-center text-2xl font-black">
          {{ (profile?.name || user.email)?.charAt(0).toUpperCase() }}
        </div>
        <div class="flex flex-col">
          <span class="font-black text-xl tracking-tight leading-none">{{ profile?.name || 'User' }}</span>
          <span class="text-xs text-neutral-500 font-medium">{{ user.email }}</span>
        </div>
        <div class="flex-1" />
        <div
          v-if="isAdmin"
          class="px-2 py-1 bg-primary-500 text-white text-[10px] font-black rounded-lg uppercase"
        >
          Admin
        </div>
      </div>

      <div
        class="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
        @click="isDisplayNameDrawerOpen = true"
      >
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            {{ t('display_name') }}
          </label>
          <span class="font-bold text-lg">{{ profile?.name || '...' }}</span>
        </div>
        <UIcon
          name="i-lucide-chevron-right"
          class="text-neutral-400"
        />
      </div>

      <div
        class="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
        @click="isLanguageDrawerOpen = true"
      >
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            {{ t('language') }}
          </label>
          <div class="flex items-center gap-2">
            <span class="font-bold text-lg">{{ languageItems.find(i => i.value === locale)?.label || '...' }}</span>
          </div>
        </div>
        <UIcon
          name="i-lucide-chevron-right"
          class="text-neutral-400"
        />
      </div>

      <section class="space-y-3">
        <UButton
          v-if="isAdmin"
          to="/admin"
          size="xl"
          block
          variant="subtle"
          color="primary"
          icon="i-lucide-shield-check"
          class="justify-start py-4 font-bold"
        >
          {{ t('admin') }}
        </UButton>
      </section>

      <section class="pt-10">
        <UButton
          size="xl"
          block
          color="error"
          variant="subtle"
          icon="i-lucide-log-out"
          class="py-4 font-bold"
          @click="logout"
        >
          {{ t('logout') }}
        </UButton>
      </section>
    </div>
  </UContainer>
</template>

<i18n lang="yaml">
en:
  account: "Account"
  manage_profile: "Manage your profile"
  language: "Language"
  language_desc: "Choose your preferred language for the application."
  display_name: "Display Name"
  edit_display_name: "Edit Display Name"
  edit_display_name_desc: "Change how your name appears to others in the game."
  save: "Save"
  edit_profile: "Edit Profile"
  notifications: "Notifications"
  security: "Security & Privacy"
  security_desc: "Keep your account safe by setting a strong password."
  new_password: "New Password"
  update_password: "Set Password"
  password_updated: "Password updated successfully!"
  failed_to_update_password: "Failed to update password"
  logout: "Log out"
  admin: "Admin Board"
  profile_updated: "Profile updated successfully!"
  failed_to_update_profile: "Failed to update profile"
nl:
  account: "Account"
  manage_profile: "Beheer je profiel"
  language: "Taal"
  language_desc: "Kies je voorkeurstaal voor de applicatie."
  display_name: "Weergavenaam"
  edit_display_name: "Weergavenaam bewerken"
  edit_display_name_desc: "Pas aan hoe je naam voor anderen in het spel verschijnt."
  save: "Opslaan"
  edit_profile: "Profiel bewerken"
  notifications: "Meldingen"
  security: "Beveiliging & Privacy"
  security_desc: "Houd je account veilig door een sterk wachtwoord in te stellen."
  new_password: "Nieuw wachtwoord"
  update_password: "Wachtwoord instellen"
  password_updated: "Wachtwoord succesvol bijgewerkt!"
  failed_to_update_password: "Wachtwoord bijwerken mislukt"
  logout: "Uitloggen"
  admin: "Admin Beheer"
  profile_updated: "Profiel succesvol bijgewerkt!"
  failed_to_update_profile: "Profiel bijwerken mislukt"
</i18n>
