// Module-level cache to prevent multiple simultaneous requests across the entire app
let fetchPromise: Promise<void> | null = null

export const useProfile = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  // Now using its own state but fetching from 'players' table
  const profile = useState<Database["public"]["Tables"]["players"]["Row"] | null>("profile", () => null)
  const loading = useState("profile-loading", () => false)
  const isInitialized = useState("profile-init", () => false)

  const fetchProfile = async (force = false, fromApp = false): Promise<void> => {
    // If a fetch is already in progress, wait for it instead of starting a new one

    if (!fromApp) {
      console.trace("📋 useProfile.ts:15 FETCH PROFILE", { force, fromApp })
    }

    if (fetchPromise && !force) {
      return fetchPromise
    }

    loading.value = true
    // Wrap the fetch logic in a promise and cache it at the module level
    fetchPromise = (async () => {
      try {
        let userId = user.value?.id
        let userEmail = user.value?.email

        // Fallback if useSupabaseUser() is still hydration-lagged
        if (!userId) {
          const { data } = await supabase.auth.getUser()
          userId = data.user?.id
          userEmail = data.user?.email
        }

        if (!userId) {
          profile.value = null
          return
        }

        // Skip if already loaded (unless forced)
        if (profile.value && profile.value.user_id === userId && !force) {
          return
        }

        // consolidated check: find any record matching our user_id OR email
        const { data: potentialProfiles, error: lookupError } = await supabase
          .from("players")
          .select("*")
          .or(`user_id.eq.${userId},email.eq.${userEmail || "no-email"}`)

        if (lookupError) {
          console.error("Profile lookup error:", lookupError)
        }

        let data: Database["public"]["Tables"]["players"]["Row"] | null = null

        if (potentialProfiles && potentialProfiles.length > 0) {
          // If we have multiple, prioritize the one that already has our user_id AND email
          data = potentialProfiles.find(p => p.user_id === userId && p.email === userEmail)
            || potentialProfiles.find(p => p.user_id === userId)
            || potentialProfiles.find(p => p.email === userEmail)
            || potentialProfiles[0]
            || null

          // If the selected profile is missing our user_id or email, update it
          if (data && (data.user_id !== userId || (userEmail && data.email !== userEmail))) {
            const { data: updatedData } = await supabase
              .from("players")
              .update({
                user_id: userId,
                email: userEmail || data.email // keep existing email if userEmail is null
              })
              .eq("id", data.id)
              .select("*")
              .single()

            if (updatedData) data = updatedData
          }
        }

        if (!data) {
          const { data: newPlayer, error: createError } = await supabase
            .from("players")
            .insert({
              user_id: userId,
              name: userEmail?.split("@")[0] || "User",
              email: userEmail || "",
              is_admin: false
            })
            .select("*")
            .single()

          if (createError) throw createError
          profile.value = newPlayer as Database["public"]["Tables"]["players"]["Row"]
        } else {
          profile.value = data as Database["public"]["Tables"]["players"]["Row"]
        }
      } catch (err) {
        console.error("fetchProfile Error:", err)
      } finally {
        loading.value = false
        isInitialized.value = true
      }
    })()

    try {
      await fetchPromise
    } finally {
      // Clear the promise once finished so future calls (like force refreshes) can run
      fetchPromise = null
    }
  }

  watch(user, (newUser, oldUser) => {
    if (!oldUser) return

    const isDeepEqual = JSON.stringify(newUser) === JSON.stringify(oldUser)

    if (newUser && !isDeepEqual) {
      fetchProfile()
    }
  }, { immediate: true })

  const updateProfile = async (updates: Partial<Database["public"]["Tables"]["players"]["Update"]>) => {
    let userId = user.value?.id
    if (!userId) {
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id
    }

    if (!userId) {
      throw new Error("You must be logged in to update your profile")
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from("players")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error("Player record not found")

      profile.value = data as Database["public"]["Tables"]["players"]["Row"]
      return data
    } finally {
      loading.value = false
    }
  }

  const isAdmin = computed(() => {
    // 0. Logging to keep track of state
    // if (user.value) {
    //   console.log("User found:", user.value.email, "Role:", user.value?.app_metadata?.role)
    // }
    // if (profile.value) {
    //   console.log("Profile found:", profile.value.email, "is_admin:", profile.value.is_admin)
    // }

    // 1. Check App Metadata for role (if user object is available)
    if (user.value?.app_metadata?.role === "admin") return true

    // 2. Check local player record flag (this works even if user ref lags)
    if (profile.value?.is_admin === true) return true

    return false
  })

  return {
    profile,
    loading,
    isInitialized,
    fetchProfile,
    updateProfile,
    isAdmin
  }
}
