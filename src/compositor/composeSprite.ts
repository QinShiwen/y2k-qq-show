import { getItem } from "../catalog"
import type {
  Anim,
  Direction,
  DirectionFrames,
  FrameRef,
  Loadout,
} from "../types/character"
import { loadImage } from "./loadImage"

export const SPRITE_W = 440
export const SPRITE_H = 935

function firstFrame(ref: FrameRef | undefined): string | undefined {
  if (!ref) return undefined
  return Array.isArray(ref) ? ref[0] : ref
}

export function resolveFrame(
  frames: DirectionFrames | undefined,
  direction: Direction,
): { src: string; flip: boolean } | null {
  if (!frames) return null

  const direct = firstFrame(frames[direction])
  if (direct) return { src: direct, flip: false }

  if (direction === "left") {
    const right = firstFrame(frames.right)
    if (right) return { src: right, flip: true }
  }

  const down = firstFrame(frames.down)
  return down ? { src: down, flip: false } : null
}

async function drawLayer(
  ctx: CanvasRenderingContext2D,
  frames: DirectionFrames | undefined,
  direction: Direction,
) {
  const resolved = resolveFrame(frames, direction)
  if (!resolved) return

  const img = await loadImage(resolved.src)
  if (resolved.flip) {
    ctx.save()
    ctx.translate(SPRITE_W, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(img, 0, 0)
    ctx.restore()
    return
  }

  ctx.drawImage(img, 0, 0)
}

export async function composeSprite(
  loadout: Loadout,
  anim: Anim = "idle",
): Promise<HTMLCanvasElement> {
  const skin = getItem("skin", loadout.skin)
  const hair = getItem("hair", loadout.hair)
  const outfit = getItem("outfit", loadout.outfit)

  const canvas = document.createElement("canvas")
  canvas.width = SPRITE_W
  canvas.height = SPRITE_H

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D is not available")

  ctx.imageSmoothingEnabled = false

  const layerFrames: Array<DirectionFrames | undefined> = [
    hair?.framesBack?.[anim],
    skin?.frames[anim],
    outfit?.frames[anim],
    hair?.frames[anim],
  ]

  for (const frames of layerFrames) {
    await drawLayer(ctx, frames, loadout.direction)
  }

  return canvas
}
