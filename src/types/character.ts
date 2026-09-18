export const DIRECTIONS = ["down", "right", "up", "left"] as const
export type Direction = (typeof DIRECTIONS)[number]

export const SLOTS = ["skin", "hair", "outfit"] as const
export type Slot = (typeof SLOTS)[number]

export const ANIMS = ["idle", "walk"] as const
export type Anim = (typeof ANIMS)[number]

/** Single frame path, or a walk cycle list. Version 0 only draws idle. */
export type FrameRef = string | string[]

export type DirectionFrames = Partial<Record<Direction, FrameRef>>

export interface Item {
  id: string
  slot: Slot
  name: string
  thumb: string
  frames: Record<Anim, DirectionFrames>
  /** Optional hair-back layer, drawn behind skin. */
  framesBack?: Record<Anim, DirectionFrames>
}

export interface Loadout {
  skin: string
  hair: string
  outfit: string
  direction: Direction
}
