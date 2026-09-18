# Version 0

The full product is a character dresser plus a virtual office. Version 0 only builds the **character dresser**.

The goal is to pick a look and see the same sprite we will later walk around the office. The map, walking, desks, and multiplayer are not in this version.

![Character dresser concept](images/character-dresser.png)

## Scope

Includes:

- A two-pane character creator in the browser (left catalog, right preview)
- Three slots: **skin**, **hair**, **outfit, shadows**
- Live preview and four-direction rotation
- One composited sprite drawn with Canvas (not stacked `<img>` tags)
- Save the current look in `localStorage`



## Implementation

- **Stack:** Vite + React + TypeScript, CSS / Tailwind for the two-pane layout.
- **Catalog:** JSON list of items. Each item has `id`, `slot`, `name`, `thumb`, and idle frame paths.
- **State:** `{ skin, hair, outfit, direction }`.
- **Preview:** Canvas 2D compositor stacks the equipped layers (hair back → skin → outfit → hair front) and bakes one high-resolution sprite. Preview scales the sprite in CSS; do not downscale the source PNGs.
- **Rotate:** Cycle `down → right → up → left`. Draw `left` by flipping `right` when the art is symmetric.
- **Animation:** idle only (1 frame × 4 directions). Walk frames stay in the catalog shape for later, but are not drawn yet.

```ts
type Direction = "down" | "up" | "left" | "right"
type Slot = "skin" | "hair" | "outfit"

interface Item {
  id: string
  slot: Slot
  name: string
  thumb: string
  frames: Record<Direction, string>
}

interface Loadout {
  skin: string
  hair: string
  outfit: string
  direction: Direction
}
```

Asset layout for this version: `asset/{skin|hair|clothes}/{id}/idle_{direction}.png`, transparent PNG, shared feet origin. Thumbs are the item only (skin swatch, hair, clothes) — never the full character.

## Minimum wardrobe

Enough art to prove the pipeline:

- 2–3 skins (or 1 body + palette swap)
- 2 hairstyles (one short, one with a back layer)
- 2 full outfits

