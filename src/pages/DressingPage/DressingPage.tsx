import { useEffect, useRef, useState } from "react";
import { composeSprite, SPRITE_H, SPRITE_W } from "../../compositor/composeSprite";
import { DIRECTIONS, type Direction, type Item, type Loadout, type Slot } from "../../types/character";
import { itemsBySlot, nextDirection } from "../../catalog";
import { readLoadout, writeLoadout } from "../../storage/loadout";


const TABS: Array<{ slot: Slot; label: string; icon: string }> = [
    { slot: "skin", label: "Skin", icon: "◇" },
    { slot: "hair", label: "Hair", icon: "◐" },
    { slot: "outfit", label: "Outfit", icon: "▣" },
]

const DIRECTION_LABEL: Record<Direction, string> = {
    down: "Front",
    right: "Right",
    up: "Back",
    left: "Left",
}

type PreviewPaneProps = {
    loadout: Loadout
    onRotate: () => void
    onDirection: (direction: Direction) => void
}


type CatalogPaneProps = {
    activeSlot: Slot
    equippedId: string
    onSlotChange: (slot: Slot) => void
    onEquip: (item: Item) => void
}

export function CatalogPane({
    activeSlot,
    equippedId,
    onSlotChange,
    onEquip,
}: CatalogPaneProps) {
    const items = itemsBySlot(activeSlot)

    return (
        <section className="flex min-h-[520px] flex-col rounded-[28px] border border-line bg-card p-6 shadow-[0_12px_40px_rgba(90,61,43,0.08)] sm:p-8">
            <h1 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
                Character Dresser
            </h1>

            <div className="mt-6 flex flex-wrap gap-2">
                {TABS.map((tab) => {
                    const selected = tab.slot === activeSlot
                    return (
                        <button
                            key={tab.slot}
                            type="button"
                            onClick={() => onSlotChange(tab.slot)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${selected
                                ? "bg-selected text-ink shadow-inner"
                                : "bg-tab text-muted hover:bg-selected/60"
                                }`}
                        >
                            <span className="mr-1.5 opacity-70">{tab.icon}</span>
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {items.map((item) => {
                    const selected = item.id === equippedId
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onEquip(item)}
                                title={item.name}
                                className={`flex aspect-square w-full items-center justify-center rounded-2xl border-2 bg-cream p-2 transition ${selected
                                    ? "border-selected-border bg-selected/40"
                                    : "border-transparent hover:border-line"
                                    }`}
                            >
                                <img
                                    src={item.thumb}
                                    alt={item.name}
                                    className="h-full w-full object-contain"
                                />
                            </button>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

export function PreviewPane({
    loadout,
    onRotate,
    onDirection,
}: PreviewPaneProps) {
    return (
        <section className="flex flex-col rounded-[28px] border border-line bg-card p-6 shadow-[0_12px_40px_rgba(90,61,43,0.08)] sm:p-8">
            <h2 className="text-center text-lg font-medium text-muted">Preview</h2>

            <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl bg-cream px-6 py-10">
                <div className="relative">
                    <div className="absolute bottom-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-ink/10 blur-[1px]" />
                    <SpritePreview loadout={loadout} />
                </div>
            </div>

            <button
                type="button"
                onClick={onRotate}
                className="mt-5 rounded-2xl bg-tab px-4 py-3 text-sm font-medium text-ink transition hover:bg-selected"
            >
                Rotate
            </button>

            <div className="mt-4 grid grid-cols-4 gap-2">
                {DIRECTIONS.map((direction) => {
                    const selected = loadout.direction === direction
                    return (
                        <button
                            key={direction}
                            type="button"
                            onClick={() => onDirection(direction)}
                            className={`rounded-xl border-2 px-2 py-2 text-xs font-medium capitalize transition ${selected
                                ? "border-selected-border bg-selected/50 text-ink"
                                : "border-transparent bg-cream text-muted hover:border-line"
                                }`}
                        >
                            {DIRECTION_LABEL[direction]}
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

type SpritePreviewProps = {
    loadout: Loadout
}

export function SpritePreview({ loadout }: SpritePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        let cancelled = false

        composeSprite(loadout)
            .then((sprite) => {
                if (cancelled || !canvasRef.current) return
                const ctx = canvas.getContext("2d")
                if (!ctx) return
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = "high"
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(sprite, 0, 0)
            })
            .catch((error: unknown) => {
                console.error(error)
            })

        return () => {
            cancelled = true
        }
    }, [loadout])

    return (
        <canvas
            ref={canvasRef}
            width={SPRITE_W}
            height={SPRITE_H}
            className="block h-[min(28rem,58vh)] w-auto"
            aria-label="Character preview"
        />
    )
}

export default function DressingPage() {
    const [loadout, setLoadout] = useState<Loadout>(readLoadout)
    const [activeSlot, setActiveSlot] = useState<Slot>("skin")

    useEffect(() => {
        writeLoadout(loadout)
    }, [loadout])

    function equip(item: Item) {
        setLoadout((current) => ({ ...current, [item.slot]: item.id }))
    }

    return (
        <div className="mx-auto grid min-h-screen max-w-6xl gap-6 p-4 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
            <CatalogPane
                activeSlot={activeSlot}
                equippedId={loadout[activeSlot]}
                onSlotChange={setActiveSlot}
                onEquip={equip}
            />
            <PreviewPane
                loadout={loadout}
                onRotate={() =>
                    setLoadout((current) => ({
                        ...current,
                        direction: nextDirection(current.direction),
                    }))
                }
                onDirection={(direction) =>
                    setLoadout((current) => ({ ...current, direction }))
                }
            />
        </div>
    )
}