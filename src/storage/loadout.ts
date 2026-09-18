import { DEFAULT_LOADOUT, isLoadoutValid } from "../catalog"
import type { Loadout } from "../types/character"

const STORAGE_KEY = "online-2d-office:v2:loadout"

export function readLoadout(): Loadout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LOADOUT
    const parsed = JSON.parse(raw) as Loadout
    return isLoadoutValid(parsed) ? parsed : DEFAULT_LOADOUT
  } catch {
    return DEFAULT_LOADOUT
  }
}

export function writeLoadout(loadout: Loadout) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loadout))
}
