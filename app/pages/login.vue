<script setup lang="ts">
definePageMeta({
  middleware: "guest"
})

const { t } = useI18n({ useScope: "local" })
const supabase = useSupabaseClient()
const { getRedirectUrl } = useRedirectUrl()

const state = reactive({
  email: ""
})

const loading = ref(false)
const errorMsg = ref("")
const successMsg = ref("")

const sendMagicLink = async () => {
  if (!state.email) {
    errorMsg.value = t("email_required")
    return
  }

  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: state.email,
      options: {
        emailRedirectTo: getRedirectUrl("/confirm")
      }
    })

    if (error) throw error

    successMsg.value = t("magic_link_sent")
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMsg.value = err.message
    } else {
      errorMsg.value = t("error_occurred_login")
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 p-4 pt-safe md:p-8">
    <div class="flex-1 flex flex-col pt-[10vh] max-w-sm mx-auto w-full space-y-12">
      <!-- Header -->
      <div class="space-y-4 text-center">
        <h1 class="text-5xl font-black tracking-tighter leading-none text-neutral-900 dark:text-white">
          30 SECONDS
        </h1>
        <p class="text-neutral-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          {{ t("login_title") }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white dark:bg-neutral-900 ">
        <UForm
          :state="state"
          class="space-y-8"
          @submit="sendMagicLink"
        >
          <div
            v-if="errorMsg"
            class="p-4 bg-error-50 dark:bg-error-950/30 border border-error-200 dark:border-error-800 rounded-2xl text-error-600 dark:text-error-400 text-xs font-bold"
          >
            {{ errorMsg }}
          </div>

          <div
            v-if="successMsg"
            class="p-4 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-2xl text-primary-600 dark:text-primary-400 text-xs font-bold"
          >
            {{ successMsg }}
          </div>

          <div class="space-y-6">
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
                  base: 'bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4'
                }"
              />
            </div>

            <UButton
              type="submit"
              size="xl"
              block
              :loading="loading"
              icon="i-lucide-wand-2"
              class="py-4 font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
            >
              {{ t('login_magic_link') }}
            </UButton>
          </div>
        </UForm>
      </div>

      <!-- Sign Up Link -->
      <p class="text-center text-xs text-neutral-400 font-bold">
        {{ t("no_account") }}
        <NuxtLink
          to="/signup"
          class="text-primary-500 hover:text-primary-600 ml-1 transition-colors"
        >
          {{ t("signup") }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  login_title: "Login to your account"
  login_button: "Login"
  email: "Email"
  password: "Password"
  forgot_password: "Forgot Password"
  no_account: "Don't have an account?"
  signup: "Sign up"
  error_occurred_login: "An error occurred during login"
  email_required: "Email is required"
  magic_link_sent: "Check your email for the magic link!"
  login_magic_link: "Login with Magic Link"
  or: "or"
nl:
  login_title: "Log in op je account"
  login_button: "Inloggen"
  email: "E-mailadres"
  password: "Wachtwoord"
  forgot_password: "Wachtwoord vergeten"
  no_account: "Nog geen account?"
  signup: "Aanmelden"
  error_occurred_login: "Er is een fout opgetreden tijdens het inloggen"
  email_required: "E-mailadres is verplicht"
  magic_link_sent: "Check je e-mail voor de magische link!"
  login_magic_link: "Inloggen met Magische Link"
  or: "of"
</i18n>
