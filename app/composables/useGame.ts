import type { Database, Json } from "~/types/database.types"

export const useGame = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const loading = ref(false)

  const createGroup = async (name: string, playerIds: string[]) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const currentUser = authUser || user.value

    if (!currentUser) {
      throw new Error("You must be logged in to create a group")
    }

    loading.value = true
    try {
      // 1. Create the group
      const { data: group, error: groupError } = await supabase
        .from("game_groups")
        .insert({
          name,
          user_id: currentUser.id
        })
        .select()
        .single()

      if (groupError || !group) throw groupError || new Error("Failed to create group")

      // 2. Add creator as first member if they have a player record
      const { data: creatorPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", currentUser.id)
        .maybeSingle()

      const finalPlayerIds = [...playerIds]
      if (creatorPlayer && !finalPlayerIds.includes(creatorPlayer.id)) {
        finalPlayerIds.push(creatorPlayer.id)
      }

      if (finalPlayerIds.length > 0) {
        const groupMembers = finalPlayerIds.map(pid => ({
          group_id: group.id,
          player_id: pid
        }))

        const { error: membersError } = await supabase
          .from("group_members")
          .insert(groupMembers)

        if (membersError) throw membersError
      }

      return group
    } finally {
      loading.value = false
    }
  }

  const fetchGroups = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const currentUser = authUser || user.value

    if (!currentUser) return []

    // 1. Find the player record for the current user
    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", currentUser.id)
      .maybeSingle()

    let groupIds: string[] = []

    if (player) {
      // 2. Find all group IDs where this player is participating
      const { data: memberGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("player_id", player.id)

      if (memberGroups) {
        groupIds = memberGroups.map(mg => mg.group_id)
      }
    }

    // 3. Fetch groups hosted by user OR where user is a member
    const filters = [`user_id.eq.${currentUser.id}`]
    if (groupIds.length > 0) {
      filters.push(`id.in.(${groupIds.join(",")})`)
    }

    const { data, error } = await supabase
      .from("game_groups")
      .select(`
        *,
        group_members (
          player_id,
          players (*)
        ),
        game_sessions (*)
      `)
      .or(filters.join(","))
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  const createSession = async (playerAssignments: { player_id: string, team: number }[], groupId: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const currentUser = authUser || user.value

    if (!currentUser) {
      throw new Error("You must be logged in to create a game session")
    }

    if (playerAssignments.length < 2) {
      throw new Error("Please select at least 2 players")
    }

    loading.value = true
    try {
      // 0. Ensure all participating players are members of the group
      const playerIds = playerAssignments.map(a => a.player_id)

      // Get current members to avoid duplicates
      const { data: existingMembers } = await supabase
        .from("group_members")
        .select("player_id")
        .eq("group_id", groupId)
        .in("player_id", playerIds)

      const existingIds = existingMembers?.map(m => m.player_id) || []
      const newMemberIds = playerIds.filter(id => !existingIds.includes(id))

      if (newMemberIds.length > 0) {
        const { error: memberError } = await supabase
          .from("group_members")
          .insert(newMemberIds.map(pid => ({
            group_id: groupId,
            player_id: pid
          })))
        if (memberError) console.error("Error adding members to group:", memberError)
      }

      // 1. Create the session
      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .insert({
          user_id: currentUser.id,
          status: "setup",
          group_id: groupId,
          current_score: { assignments: playerAssignments, scores: { 1: 0, 2: 0 } }
        })
        .select(`
          *,
          game_groups (
            *,
            group_members (
              *,
              players (*)
            )
          )
        `)
        .single()

      if (sessionError) throw sessionError

      return session
    } finally {
      loading.value = false
    }
  }

  const fetchRecentSessions = async (limit = 10, groupId?: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const currentUser = authUser || user.value

    if (!currentUser) return []

    // 1. Find the player record for the current user
    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", currentUser.id)
      .maybeSingle()

    let sessionIds: string[] = []

    if (player && !groupId) {
      // 2. Find all sessions where this player is participating (via group)
      const { data: memberGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("player_id", player.id)

      if (memberGroups && memberGroups.length > 0) {
        const groupIds = memberGroups.map(mg => mg.group_id)
        const { data: sessions } = await supabase
          .from("game_sessions")
          .select("id")
          .in("group_id", groupIds)

        if (sessions) {
          sessionIds = sessions.map(s => s.id)
        }
      }
    }

    // 3. Fetch sessions hosted by user OR where user is a participant
    const filters = []
    if (groupId) {
      filters.push(`group_id.eq.${groupId}`)
    } else {
      filters.push(`user_id.eq.${currentUser.id}`)
      if (sessionIds.length > 0) {
        filters.push(`id.in.(${sessionIds.join(",")})`)
      }
    }

    const { data, error } = await supabase
      .from("game_sessions")
      .select(`
        *,
        game_groups (
          *,
          group_members (
            *,
            players (*)
          )
        )
      `)
      .or(filters.join(","))
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  const fetchSessionDetails = async (sessionId: string) => {
    const { data: session, error } = await supabase
      .from("game_sessions")
      .select(`
        *,
        game_groups (
          *,
          group_members (
            *,
            players (*)
          )
        )
      `)
      .eq("id", sessionId)
      .single()

    if (error) throw error
    return session
  }

  const updateSessionScore = async (sessionId: string, score: Json, status?: string) => {
    const updateData: { current_score: Json, status?: string } = { current_score: score }
    if (status) updateData.status = status

    const { data, error } = await supabase
      .from("game_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const fetchRandomWords = async (language: string, count: number) => {
    // 1. Get the total count of enabled words for this language
    const { count: totalCount, error: countError } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("language", language)
      .or("is_disabled.is.null,is_disabled.eq.false")

    if (countError || !totalCount || totalCount === 0) {
      console.warn(`No words found for language ${language}`)
      return []
    }

    // 2. Parallel fetch with random offsets to ensure a high variety of words
    // We fetch more than needed and pick a subset to increase randomness
    const numRequests = Math.min(4, Math.ceil(totalCount / count))
    const fetchPromises = Array.from({ length: numRequests }).map(() => {
      // Ensure the offset doesn't go out of bounds
      const maxOffset = Math.max(0, totalCount - count)
      const randomOffset = Math.floor(Math.random() * maxOffset)

      return supabase
        .from("words")
        .select("id, text")
        .eq("language", language)
        .or("is_disabled.is.null,is_disabled.eq.false")
        .range(randomOffset, randomOffset + count - 1)
    })

    const results = await Promise.all(fetchPromises)
    const allWords = results.flatMap(r => r.data || [])

    // De-duplicate by ID
    const uniqueWords = Array.from(new Map(allWords.map(w => [w.id, w])).values())

    // Final shuffle and slice
    return uniqueWords.sort(() => 0.5 - Math.random()).slice(0, count)
  }

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("game_sessions")
      .delete()
      .eq("id", sessionId)

    if (error) throw error
  }

  return {
    loading,
    createGroup,
    fetchGroups,
    createSession,
    fetchRecentSessions,
    fetchSessionDetails,
    updateSessionScore,
    fetchRandomWords,
    deleteSession
  }
}
