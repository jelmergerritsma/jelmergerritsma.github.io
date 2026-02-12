<script setup lang="ts">
definePageMeta({
  middleware: "guest"
})

const supabase = useSupabaseClient()
const { t } = useI18n()
const { getRedirectUrl } = useRedirectUrl()

const state = reactive({
  email: ""
})

const loading = ref(false)
const errorMsg = ref("")
const successMsg = ref("")

const requestResetPassword = async () => {
  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(state.email, {
      redirectTo: getRedirectUrl("/password/update")
    })
    if (error) throw error
    successMsg.value = t("check_email_confirmation")
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMsg.value = err.message
    } else {
      errorMsg.value = "An unknown error occurred"
    }
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
          {{ t("reset_password") }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white dark:bg-neutral-900 px-8 py-10 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
        <UForm
          :state="state"
          class="space-y-8"
          @submit="requestResetPassword"
        >
          <div class="space-y-3">
            <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-4 block">
              {{ t('email') }}
            </label>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="john@example.com"
              size="xl"
              icon="i-lucide-mail"
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
              {{ t("request_reset") }}
            </UButton>

            <div class="text-center pt-2">
              <NuxtLink
                to="/login"
                class="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-chevron-left"
                  class="w-3 h-3"
                />
                {{ t("back") }} {{ t("login") }}
              </NuxtLink>
            </div>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  reset_password: "Reset Password"
  email: "Email"
  check_email_confirmation: "Check your email for the confirmation link!"
  request_reset: "Request Password Reset"
  back: "Back"
  login: "Login"
nl:
  reset_password: "Wachtwoord herstellen"
  email: "E-mail"
  check_email_confirmation: "Controleer je e-mail voor de bevestigingslink!"
  request_reset: "Vraag wachtwoordherstel aan"
  back: "Terug"
  login: "Inloggen"
</i18n>
