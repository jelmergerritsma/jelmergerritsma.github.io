export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (user.value) return

  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()

  if (!session) return navigateTo("/login")
})
