import { describe, it, expect } from "vitest"
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime"
import type { GameSessionRelation } from "~/types/game"
import GameSessionCard from "~/components/game/GameSessionCard.vue"

// Mock I18n
mockNuxtImport("useI18n", () => {
  return () => ({
    t: (key: string) => key
  })
})

describe("GameSessionCard", () => {
  const mockSession: Partial<GameSessionRelation> = {
    id: "test-id",
    status: "finished",
    created_at: "2024-02-12T10:00:00Z",
    current_score: {
      scores: { 1: 30, 2: 25 },
      assignments: [
        { player_id: "1", name: "Alice", team: 1 },
        { player_id: "2", name: "Bob", team: 2 }
      ]
    } as unknown as GameSessionRelation["current_score"],
    game_groups: {
      name: "Test Room"
    } as unknown as GameSessionRelation["game_groups"]
  }

  it("renders scores correctly", async () => {
    const component = await mountSuspended(GameSessionCard, {
      props: {
        session: mockSession as GameSessionRelation,
        showGroupName: true
      }
    })

    expect(component.text()).toContain("30 - 25")
    expect(component.text()).toContain("Test Room")
    expect(component.text().toLowerCase()).toContain("finished")
  })

  it("renders player initials", async () => {
    const component = await mountSuspended(GameSessionCard, {
      props: {
        session: mockSession as GameSessionRelation
      }
    })

    expect(component.text()).toContain("A")
    expect(component.text()).toContain("B")
  })
})
