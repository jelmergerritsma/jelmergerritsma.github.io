export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  // If user is null, wait a tiny bit for session restoration
  if (!user.value) {
    const { data: { session } } = await client.auth.getSession()
    if (!session) {
      return navigateTo("/login")
    }
  }
})
