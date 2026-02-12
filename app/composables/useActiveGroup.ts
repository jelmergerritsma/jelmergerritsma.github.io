export const useActiveGroup = () => {
  const selectedGroupId = useCookie<string | null>("selected_group_id", {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7 // Persist for 7 days
  })

  const setGroupId = (id: string | null) => {
    selectedGroupId.value = id
  }

  return {
    selectedGroupId,
    setGroupId
  }
}
