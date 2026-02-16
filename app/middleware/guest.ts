export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (user.value) return navigateTo("/")

  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()

  if (session) return navigateTo("/")
})
