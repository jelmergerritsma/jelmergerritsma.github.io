<script setup lang="ts">
definePageMeta({
  middleware: "guest"
})

const { t } = useI18n({ useScope: "local" })
const supabase = useSupabaseClient()
const { getRedirectUrl } = useRedirectUrl()

const state = reactive({
  email: "",
  password: ""
})

const loading = ref(false)
const errorMsg = ref("")
const successMsg = ref("")
const loginMethod = ref<"magic" | "password">("password") // Default to password

const signInWithPassword = async () => {
  if (!state.email || !state.password) {
    errorMsg.value = t("email_password_required")
    return
  }

  loading.value = true
  errorMsg.value = ""
  successMsg.value = ""

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: state.email,
      password: state.password
    })

    if (error) throw error

    // Redirect on success
    navigateTo("/")
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

const handleSubmit = () => {
  if (loginMethod.value === "password") {
    signInWithPassword()
  } else {
    sendMagicLink()
  }
}

const config = useRuntimeConfig()
const appVersion = computed(() => {
  const version = config.public.appVersion
  if (version === "v0.0.0") return "1.0.0-DEV"
  return `VERSION ${version}`
})
</script>

<template>
  <div class="flex flex-col p-4 pt-safe md:p-8">
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
        <!-- Login Method Toggle -->
        <div class="flex gap-2 mb-6 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
          <button
            type="button"
            class="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            :class="loginMethod === 'password' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400'"
            @click="loginMethod = 'password'"
          >
            {{ t('with_password') }}
          </button>
          <button
            type="button"
            class="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            :class="loginMethod === 'magic' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400'"
            @click="loginMethod = 'magic'"
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

            <!-- Password field - only show for password login -->
            <div
              v-if="loginMethod === 'password'"
              class="space-y-3"
            >
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

            <UButton
              type="submit"
              size="xl"
              block
              :loading="loading"
              :icon="loginMethod === 'password' ? 'i-lucide-log-in' : 'i-lucide-wand-2'"
              class="py-4 font-black uppercase tracking-widest shadow-lg shadow-primary-500/20"
            >
              {{ loginMethod === 'password' ? t('login_button') : t('login_magic_link') }}
            </UButton>

            <!-- Forgot password link - only show for password login -->
            <NuxtLink
              v-if="loginMethod === 'password'"
              to="/password/reset"
              class="block text-center text-xs text-neutral-400 hover:text-primary-500 transition-colors font-bold"
            >
              {{ t('forgot_password') }}
            </NuxtLink>
          </div>
        </UForm>
      </div>
    </div>

    <!-- Version Footer -->
    <div class="mt-auto py-8 text-center pointer-events-none">
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 dark:text-white/10 drop-shadow-[1px_1px_0px_rgba(255,255,255,0.4)] dark:drop-shadow-[1px_1px_0px_rgba(0,0,0,0.6)]">
        {{ appVersion }}
      </span>
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
  error_occurred_login: "An error occurred during login"
  email_required: "Email is required"
  email_password_required: "Email and password are required"
  magic_link_sent: "Check your email for the magic link!"
  login_magic_link: "Send Magic Link"
  with_password: "Password"
  with_magic_link: "Magic Link"
nl:
  login_title: "Log in op je account"
  login_button: "Inloggen"
  email: "E-mailadres"
  password: "Wachtwoord"
  forgot_password: "Wachtwoord vergeten"
  error_occurred_login: "Er is een fout opgetreden tijdens het inloggen"
  email_required: "E-mailadres is verplicht"
  email_password_required: "E-mailadres en wachtwoord zijn verplicht"
  magic_link_sent: "Check je e-mail voor de magische link!"
  login_magic_link: "Stuur Magische Link"
  with_password: "Wachtwoord"
  with_magic_link: "Magische Link"
</i18n>
