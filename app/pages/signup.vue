<script setup lang="ts">
definePageMeta({
  middleware: "guest"
})

const { t } = useI18n({ useScope: "local" })
const supabase = useSupabaseClient()
const { getRedirectUrl } = useRedirectUrl()

const state = reactive({
  email: "",
  password: "",
  confirmPassword: ""
})

const loading = ref(false)
const errorMsg = ref("")
const successMsg = ref("")
const signupMethod = ref<"magic" | "password">("password") // Default to password

const signupWithPassword = async () => {
  if (!state.email || !state.password || !state.confirmPassword) {
    errorMsg.value = t("all_fields_required")
    return
  }

  if (state.password !== state.confirmPassword) {
    errorMsg.value = t("passwords_do_not_match")
    return
  }

  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    const { error } = await supabase.auth.signUp({
      email: state.email,
      password: state.password,
      options: {
        emailRedirectTo: getRedirectUrl("/confirm")
      }
    })

    if (error) throw error

    successMsg.value = t("check_email_confirmation")
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMsg.value = err.message
    } else {
      errorMsg.value = t("error_occurred_signup")
    }
  } finally {
    loading.value = false
  }
}

const signupWithMagicLink = async () => {
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

    successMsg.value = t("check_email_confirmation")
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMsg.value = err.message
    } else {
      errorMsg.value = t("error_occurred_signup")
    }
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  if (signupMethod.value === "password") {
    signupWithPassword()
  } else {
    signupWithMagicLink()
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
          {{ t("signup_title") }}
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white dark:bg-neutral-900 ">
        <!-- Signup Method Toggle -->
        <div class="flex gap-2 mb-6 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
          <button
            type="button"
            class="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            :class="signupMethod === 'password' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400'"
            @click="signupMethod = 'password'"
          >
            {{ t('with_password') }}
          </button>
          <button
            type="button"
            class="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            :class="signupMethod === 'magic' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400'"
            @click="signupMethod = 'magic'"
          >
            {{ t('with_magic_link') }}
          </button>
        </div>

        <UForm
          :state="state"
          class="space-y-8"
          @submit="handleSubmit"
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

            <!-- Password fields - only show for password signup -->
            <template v-if="signupMethod === 'password'">
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-4 block">
                  {{ t('password') }}
                </label>
                <UInput
                  v-model="state.password"
                  type="password"
                  placeholder="••••••••"
                  size="xl"
                  icon="i-lucide-lock"
                  class="w-full"
                  :ui="{
                    base: 'bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4'
                  }"
                />
              </div>

              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-4 block">
                  {{ t('confirm_password') }}
                </label>
                <UInput
                  v-model="state.confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  size="xl"
                  icon="i-lucide-lock"
                  class="w-full"
                  :ui="{
                    base: 'bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4'
                  }"
                />
              </div>
            </template>

            <UButton
              type="submit"
              size="xl"
              block
              :loading="loading"
              :icon="signupMethod === 'password' ? 'i-lucide-user-plus' : 'i-lucide-wand-2'"
              class="py-4 font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
            >
              {{ signupMethod === 'password' ? t('signup') : t('signup_magic_link') }}
            </UButton>
          </div>
        </UForm>

        <!-- Login Link -->
        <p class="text-center text-xs text-neutral-400 font-bold mt-8">
          {{ t('already_have_account') }}
          <NuxtLink
            to="/login"
            class="text-primary-500 hover:text-primary-600 ml-1 transition-colors"
          >
            {{ t('login') }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  signup_title: "Create an account"
  signup: "Sign Up"
  email: "Email"
  password: "Password"
  confirm_password: "Confirm Password"
  signup_magic_link: "Send Magic Link"
  check_email_confirmation: "Check your email to confirm your account!"
  passwords_do_not_match: "Passwords do not match"
  all_fields_required: "All fields are required"
  email_required: "Email is required"
  error_occurred_signup: "An error occurred during signup"
  already_have_account: "Already have an account?"
  login: "Login"
  with_password: "Password"
  with_magic_link: "Magic Link"
nl:
  signup_title: "Account aanmaken"
  signup: "Registreren"
  email: "E-mailadres"
  password: "Wachtwoord"
  confirm_password: "Bevestig Wachtwoord"
  signup_magic_link: "Stuur Magische Link"
  check_email_confirmation: "Check je e-mail om je account te bevestigen!"
  passwords_do_not_match: "Wachtwoorden komen niet overeen"
  all_fields_required: "Alle velden zijn verplicht"
  email_required: "E-mailadres is verplicht"
  error_occurred_signup: "Er is een fout opgetreden tijdens het aanmelden"
  already_have_account: "Heb je al een account?"
  login: "Inloggen"
  with_password: "Wachtwoord"
  with_magic_link: "Magische Link"
</i18n>
