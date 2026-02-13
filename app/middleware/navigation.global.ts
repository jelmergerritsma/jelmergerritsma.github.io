export default defineNuxtRouteMiddleware((_to, _from) => {
  return
  // const EXCLUDED_PATHS = ["/login"]

  // if (EXCLUDED_PATHS.includes(to.path) || EXCLUDED_PATHS.includes(from.path)) {
  //   // For auth pages, use a simple fade transition
  //   to.meta.pageTransition = { name: "fade", mode: "default" }
  //   from.meta.pageTransition = { name: "fade", mode: "default" }
  //   return
  // }

  // const navItems = [
  //   { path: "/", index: 0 },
  //   { path: "/players", index: 1 },
  //   { path: "/stats", index: 3 },
  //   { path: "/account", index: 4 }
  // ]

  // // Normalize paths for comparison
  // const normalize = (path: string) => path.replace(/\/$/, "") || "/"
  // const toPath = normalize(to.path)
  // const fromPath = normalize(from.path)

  // const toItem = navItems.find(i => i.path === toPath)
  // const fromItem = navItems.find(i => i.path === fromPath)

  // let transition: "slide-left" | "slide-right" | "slide-up" | "slide-down" = "slide-left"

  // // Special Case: Game/Setup (Slide Up/Down)
  // const isGameRoute = (path: string) => path.startsWith("/game")

  // if (isGameRoute(toPath) && !isGameRoute(fromPath)) {
  //   transition = "slide-up"
  // } else if (isGameRoute(fromPath) && !isGameRoute(toPath)) {
  //   transition = "slide-down"
  // } else if (toItem && fromItem) {
  //   // Standard Tab Navigation
  //   if (toItem.index > fromItem.index) {
  //     transition = "slide-left"
  //   } else if (toItem.index < fromItem.index) {
  //     transition = "slide-right"
  //   }
  // }

  // console.info("📋 navigation.global.ts:46 ", transition)

  // // Set transition for both to ensure synchronization
  // to.meta.pageTransition = { name: transition, mode: "default" }
  // from.meta.pageTransition = { name: transition, mode: "default" }
})
