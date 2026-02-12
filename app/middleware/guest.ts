export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  if (!user.value) {
    const { data: { session } } = await client.auth.getSession()
    if (session) {
      return navigateTo("/")
    }
  } else {
    return navigateTo("/")
  }
})
