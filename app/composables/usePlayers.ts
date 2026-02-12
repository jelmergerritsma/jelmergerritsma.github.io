export const usePlayers = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const loading = ref(false)

  const fetchPlayers = async (groupId?: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const currentUser = authUser || user.value

    if (!currentUser?.id) return []

    const { isAdmin, profile, fetchProfile } = useProfile()

    // Ensure the current user has a profile record before we search for other players
    if (!profile.value) {
      await fetchProfile()
    }

    if (groupId) {
      // Fetch players specifically in this group
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          players (*)
        `)
        .eq("group_id", groupId)

      if (error) {
        console.error("fetchPlayers (group) error:", error)
        throw error
      }
      return data?.map(d => d.players).filter((p): p is NonNullable<typeof p> => !!p) || []
    }

    let query = supabase.from("players").select("*")

    // If not admin, only show players created by user or linked to their email
    if (!isAdmin.value) {
      const filters = [`user_id.eq.${currentUser.id}`]
      if (currentUser.email) {
        filters.push(`email.eq.${currentUser.email}`)
      }
      query = query.or(filters.join(","))
    }

    const { data, error } = await query.order("name")

    if (error) {
      console.error("fetchPlayers error:", error)
      throw error
    }
    return data
  }

  const addPlayer = async (name: string, email?: string, groupId?: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const currentUser = authUser || user.value

    if (!currentUser?.id) {
      console.error("Auth Error: Cannot add player without active session")
      throw new Error("You must be logged in to add players")
    }

    loading.value = true
    try {
      let player: Database["public"]["Tables"]["players"]["Row"] | null = null

      if (email?.trim()) {
        const { data: existing } = await supabase
          .from("players")
          .select("*")
          .eq("email", email.trim())
          .maybeSingle()

        if (existing) {
          player = existing
        }
      }

      if (!player) {
        console.log("Adding player for user:", currentUser.id)
        const { data, error } = await supabase
          .from("players")
          .insert({
            name,
            email: email?.trim() || null,
            user_id: currentUser.id
          })
          .select()
          .single()

        if (error) {
          console.error("Supabase Database Error:", error.message, error.details)
          throw error
        }
        player = data
      }

      // If groupId is provided, ensure player is in the group
      if (groupId && player) {
        const { error: memberError } = await supabase
          .from("group_members")
          .insert({
            group_id: groupId,
            player_id: player.id
          })
          .or("group_id,player_id") // Don't fail if already a member

        if (memberError && memberError.code !== "23505") { // 23505 is unique violation
          console.error("Error adding player to group:", memberError)
        }
      }

      return player
    } finally {
      loading.value = false
    }
  }

  const deletePlayer = async (id: string) => {
    const { error } = await supabase.from("players").delete().eq("id", id)
    if (error) throw error
  }

  const updatePlayer = async (id: string, updates: { name?: string, email?: string }) => {
    loading.value = true
    try {
      if (updates.email?.trim()) {
        const { data: existing } = await supabase
          .from("players")
          .select("id")
          .eq("email", updates.email.trim())
          .neq("id", id)
          .maybeSingle()

        if (existing) {
          throw new Error("A player with this email address already exists.")
        }
      }

      const { error } = await supabase
        .from("players")
        .update({
          ...updates,
          email: updates.email?.trim() || null
        })
        .eq("id", id)

      if (error) throw error
    } finally {
      loading.value = false
    }
  }

  const invitePlayer = async (id: string, email: string) => {
    loading.value = true
    try {
      // 1. Update the player's email record first so the link exists in DB
      const { error: updateError } = await supabase
        .from("players")
        .update({ email: email.trim() })
        .eq("id", id)

      if (updateError) throw updateError

      // 2. Send the actual Supabase invitation (using OTP/Magic Link)
      // This allows the user to click the link and be automatically logged in
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin + "/confirm"
        }
      })

      if (authError) throw authError
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchPlayers,
    addPlayer,
    deletePlayer,
    updatePlayer,
    invitePlayer
  }
}
