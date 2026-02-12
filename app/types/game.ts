import type { Database } from "./database.types"

export interface GameScore {
  assignments?: Array<{ player_id: string, name: string, team: number }>
  scores?: Record<string, number>
  player_stats?: Record<string, number>
}

export interface GameWord {
  id: string
  text: string
  guessed: boolean
}

export type GameSessionRelation = Database["public"]["Tables"]["game_sessions"]["Row"] & {
  game_groups: Database["public"]["Tables"]["game_groups"]["Row"] & {
    group_members: (Database["public"]["Tables"]["group_members"]["Row"] & {
      players: Database["public"]["Tables"]["players"]["Row"] | null
    })[]
  } | null
}
