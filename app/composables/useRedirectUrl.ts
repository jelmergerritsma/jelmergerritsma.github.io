export const useRedirectUrl = () => {
  const config = useRuntimeConfig()

  // In production, use the configured workspace URL
  // In development, use the current origin (localhost or local network IP)
  const getRedirectUrl = (path: string) => {
    if (import.meta.dev) {
      // Development: use window.location.origin to support localhost and network access
      return `${window.location.origin}${path}`
    } else {
      // Production: use configured domain
      const protocol = window.location.protocol // Keep https if installed as PWA
      return `${protocol}//${config.public.workspaceUrl}${path}`
    }
  }

  return {
    getRedirectUrl
  }
}
