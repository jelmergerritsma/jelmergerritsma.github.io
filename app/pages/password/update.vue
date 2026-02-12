<script setup lang="ts">
const supabase = useSupabaseClient()
const { t } = useI18n()
const router = useRouter()

const state = reactive({
  password: ""
})

const loading = ref(false)
const errorMsg = ref("")
const successMsg = ref("")

const updateUserPassword = async () => {
  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    const { error } = await supabase.auth.updateUser({
      password: state.password
    })
    if (error) throw error
    successMsg.value = t("password_updated_success")
    setTimeout(() => {
      router.push("/")
    }, 2000)
  } catch (err) {
    const error = err as { message?: string }
    errorMsg.value = error.message || t("error_updating_password")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 p-4 pt-safe md:p-8">
    <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-12">
      <!-- Header -->
      <div class="space-y-4 text-center">
        <h1 class="text-5xl font-black tracking-tighter leading-none text-neutral-900 dark:text-white">
          30 SECONDS
        </h1>
        <p class="text-neutral-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          {{ t("update_password") }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white dark:bg-neutral-900 px-8 py-10 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
        <UForm
          :state="state"
          class="space-y-8"
          @submit="updateUserPassword"
        >
          <div class="space-y-3">
            <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-4 block">
              {{ t('new_password') }}
            </label>
            <UInput
              v-model="state.password"
              type="password"
              placeholder="••••••••"
              size="xl"
              icon="i-lucide-lock"
              class="w-full"
              :ui="{
                base: 'bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl px-6 py-4'
              }"
            />
          </div>

          <UAlert
            v-if="errorMsg"
            color="error"
            variant="subtle"
            :title="errorMsg"
            icon="i-lucide-alert-circle"
            class="rounded-2xl"
          />

          <UAlert
            v-if="successMsg"
            color="success"
            variant="subtle"
            :title="successMsg"
            icon="i-lucide-check-circle"
            class="rounded-2xl"
          />

          <div class="space-y-4 pt-2">
            <UButton
              type="submit"
              block
              size="xl"
              :loading="loading"
              class="py-6 text-xl font-black uppercase rounded-2xl shadow-lg"
            >
              {{ t("update_password") }}
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  update_password: "Update Password"
  new_password: "New Password"
  password_updated_success: "Password updated successfully!"
  error_updating_password: "There was an error updating your password."
nl:
  update_password: "Wachtwoord bijwerken"
  new_password: "Nieuw wachtwoord"
  password_updated_success: "Wachtwoord succesvol bijgewerkt!"
  error_updating_password: "Er is een fout opgetreden bij het bijwerken van je wachtwoord."
</i18n>
