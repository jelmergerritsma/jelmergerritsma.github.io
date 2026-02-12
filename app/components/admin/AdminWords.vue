<script setup lang="ts">
const { t } = useI18n()
const supabase = useSupabaseClient<Database>()
const toast = useToast()

const emit = defineEmits(["update-stats"])

interface Word {
  id: string
  text: string
  language: string | null
  is_disabled: boolean | null
}

const words = ref<Word[]>([])
const wordSearch = ref("")
const wordLanguage = ref("all")
const loading = ref(false)
const totalWords = ref(0)
const page = ref(1)
const itemsPerPage = 20

const confirmModal = ref({
  open: false,
  id: "",
  loading: false
})

const fetchWords = async () => {
  loading.value = true
  try {
    const from = (page.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let query = supabase.from("words").select("*", { count: "exact" }).order("text", { ascending: true })
    if (wordSearch.value) query = query.ilike("text", `%${wordSearch.value}%`)
    if (wordLanguage.value !== "all") query = query.eq("language", wordLanguage.value)

    const { data, error, count } = await query.range(from, to)
    if (error) throw error
    words.value = data || []
    totalWords.value = count || 0
  } catch (err) {
    console.error("Failed to fetch words:", err)
  } finally {
    loading.value = false
  }
}

const toggleWordDisabled = async (word: Word) => {
  try {
    const { error } = await supabase
      .from("words")
      .update({ is_disabled: !word.is_disabled })
      .eq("id", word.id)
    if (error) throw error

    word.is_disabled = !word.is_disabled
    toast.add({
      title: t("word_toggled", { status: word.is_disabled ? t("word_disabled") : t("word_enabled") }),
      color: word.is_disabled ? "warning" : "success"
    })
  } catch (err) {
    console.error("Failed to toggle word:", err)
    toast.add({ title: t("operation_failed"), color: "error" })
  }
}

const openDeleteConfirm = (id: string) => {
  confirmModal.value = { open: true, id, loading: false }
}

const deleteWord = async () => {
  confirmModal.value.loading = true
  try {
    const { error } = await supabase.from("words").delete().eq("id", confirmModal.value.id)
    if (error) throw error
    words.value = words.value.filter(w => w.id !== confirmModal.value.id)
    emit("update-stats")
    confirmModal.value.open = false
    toast.add({ title: t("word_deleted"), color: "success" })
  } catch (err) {
    console.error(err)
  } finally {
    confirmModal.value.loading = false
  }
}

onMounted(fetchWords)
watch([wordLanguage, page], fetchWords)

const onSearch = () => {
  page.value = 1
  fetchWords()
}

defineExpose({ fetchWords })
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div class="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
      <h2 class="text-lg font-black uppercase tracking-tight">
        {{ t("words_mgmt") }} <span class="text-gray-500">({{ totalWords }})</span>
      </h2>
      <div class="flex gap-4">
        <UInput
          v-model="wordSearch"
          :placeholder="t('search_words')"
          icon="i-lucide-search"
          class="w-64"
          @input="onSearch"
        />
        <USelect
          v-model="wordLanguage"
          :items="[
            { label: t('all_languages'), value: 'all' },
            { label: t('dutch'), value: 'nl' },
            { label: t('english'), value: 'en' }
          ]"
          value-attribute="value"
          class="w-48"
          @change="page = 1"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 text-[10px] font-black uppercase tracking-widest border-b border-neutral-200 dark:border-neutral-800">
            <th class="px-6 py-4">
              {{ t("word") }}
            </th>
            <th class="px-6 py-4">
              {{ t("language") }}
            </th>
            <th class="px-6 py-4">
              {{ t("status") }}
            </th>
            <th class="px-6 py-4 text-right">
              {{ t("actions") }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
          <tr
            v-if="loading"
            class="animate-pulse"
          >
            <td
              colspan="4"
              class="px-6 py-8 text-center text-neutral-400"
            >
              {{ t("loading_words") }}
            </td>
          </tr>
          <tr v-else-if="words.length === 0">
            <td
              colspan="4"
              class="px-6 py-8 text-center text-neutral-400 font-medium"
            >
              {{ t("no_words") }}
            </td>
          </tr>
          <tr
            v-for="word in words"
            :key="word.id"
            class="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
          >
            <td class="px-6 py-4 font-bold text-neutral-900 dark:text-white capitalize">
              {{ word.text }}
            </td>
            <td class="px-6 py-4">
              <span
                class="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase"
                :class="word.language === 'nl' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'"
              >
                {{ word.language }}
              </span>
            </td>
            <td class="px-6 py-4">
              <UBadge
                :color="word.is_disabled ? 'error' : 'success'"
                variant="subtle"
                class="font-bold uppercase text-[9px]"
              >
                {{ word.is_disabled ? t('disabled') : t('active') }}
              </UBadge>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <UButton
                size="xs"
                :color="word.is_disabled ? 'success' : 'warning'"
                variant="ghost"
                :icon="word.is_disabled ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                class="font-bold"
                @click="toggleWordDisabled(word)"
              >
                {{ word.is_disabled ? t('enable') : t('disable') }}
              </UButton>
              <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                class="font-bold"
                @click="openDeleteConfirm(word.id)"
              >
                {{ t('delete') }}
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalWords > itemsPerPage"
      class="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-center bg-neutral-50/50 dark:bg-neutral-800/50"
    >
      <UPagination
        v-model:page="page"
        :total="totalWords"
        :items-per-page="itemsPerPage"
        size="md"
        :ui="{
          root: 'gap-1',
          item: 'min-w-[32px] font-bold h-8 rounded-lg'
        }"
      />
    </div>

    <UDrawer
      v-model:open="confirmModal.open"
      :title="t('delete_word_title')"
      :description="t('delete_word_msg')"
    >
      <template #content>
        <div class="p-6 space-y-6">
          <div class="flex flex-col gap-3 pb-safe">
            <UButton
              color="error"
              size="xl"
              block
              class="py-5 font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-error/20"
              :loading="confirmModal.loading"
              @click="deleteWord"
            >
              {{ t("confirm_action") }}
            </UButton>
            <UButton
              color="neutral"
              variant="subtle"
              size="xl"
              block
              class="py-4 font-black uppercase tracking-widest rounded-2xl"
              @click="confirmModal.open = false"
            >
              {{ t("cancel") }}
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<i18n locale="en" lang="yaml">
search_words: "Filter words..."
words_mgmt: "Word Management"
all_languages: "All Languages"
dutch: "Dutch"
english: "English"
word: "Word"
language: "Lang"
status: "Status"
actions: "Actions"
disabled: "Disabled"
active: "Active"
enable: "Enable"
disable: "Disable"
delete: "Delete"
confirm_action: "Yes, I'm Sure"
cancel: "Wait, No"
delete_word_title: "Nuke Word?"
delete_word_msg: "This will permanently delete this word from the database."
operation_failed: "Action failed. Try again."
word_toggled: "Word {status} successfully"
word_disabled: "disabled"
word_enabled: "enabled"
word_deleted: "Word removed from existence"
loading_words: "Loading vocabulary..."
no_words: "No words found matching your search."
</i18n>

<i18n locale="nl" lang="yaml">
search_words: "Filter woorden..."
words_mgmt: "Woordenbeheer"
all_languages: "Alle Talen"
dutch: "Nederlands"
english: "Engels"
word: "Woord"
language: "Taal"
status: "Status"
actions: "Acties"
disabled: "Uitgeschakeld"
active: "Actief"
enable: "Inschakelen"
disable: "Uitschakelen"
delete: "Verwijderen"
confirm_action: "Ja, weet het zeker"
cancel: "Wacht, nee"
delete_word_title: "Woord Verwijderen?"
delete_word_msg: "Dit verwijdert het woord permanent uit de database."
operation_failed: "Actie mislukt. Probeer opnieuw."
word_toggled: "Woord succesvol {status}"
word_disabled: "uitgeschakeld"
word_enabled: "ingeschakeld"
word_deleted: "Woord gewist uit bestaan"
loading_words: "Woordenlijst ophalen..."
no_words: "Geen woorden gevonden voor je zoekopdracht."
</i18n>
