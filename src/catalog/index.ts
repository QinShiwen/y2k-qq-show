import clothesJson from "./clothes.json"
import hairJson from "./hair.json"
import skinJson from "./skin.json"
import type { Direction, Item, Loadout, Slot } from "../types/character"
import { DIRECTIONS } from "../types/character"

export const catalog: Item[] = [
  ...(skinJson as Item[]),
  ...(hairJson as Item[]),
  ...(clothesJson as Item[]),
]

export const DEFAULT_LOADOUT: Loadout = {
  skin: "fair",
  hair: "none",
  outfit: "vest-shorts",
  direction: "down",
}

export function itemsBySlot(slot: Slot): Item[] {
  return catalog.filter((item) => item.slot === slot)
}

export function getItem(slot: Slot, id: string): Item | undefined {
  return catalog.find((item) => item.slot === slot && item.id === id)
}

export function nextDirection(direction: Direction): Direction {
  const index = DIRECTIONS.indexOf(direction)
  return DIRECTIONS[(index + 1) % DIRECTIONS.length]
}

export function isLoadoutValid(value: Loadout): boolean {
  return (
    Boolean(getItem("skin", value.skin)) &&
    Boolean(getItem("hair", value.hair)) &&
    Boolean(getItem("outfit", value.outfit)) &&
    DIRECTIONS.includes(value.direction)
  )
}
