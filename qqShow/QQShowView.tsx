import { useMediaQuery } from "@mantine/hooks";
import {
    useMemo,
    useState,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { baseOverlayLayout, costumeLabels, costumeTabs, genderTabs } from "./consts";
import { CostumeType, Gender, getCostume, getCostumes, initialSelected, OverlayLayout, SelectedCostumesMap } from "./costumes";
import { getOverlayLayout, overlayToCanvasRect, overlayToStyle } from "./utils";

const assetModules = import.meta.glob("./asset/**/*.png", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;
const layerOrder: CostumeType[] = [CostumeType.Shoes, CostumeType.Bottom, CostumeType.Top, CostumeType.Hair];

function getAssetUrl(relativePath: string) {
    return assetModules[`./asset/${relativePath}`] ?? "";
}

function getLayerSrc(gender: Gender, costumeType: CostumeType, costume: string | null) {
    if (!costume) return "";
    return getAssetUrl(`${gender}/${costumeType}/${costume}.png`);
}

function getThumbSrc(gender: Gender, costume: string | null) {
    if (!costume) return "";
    return getAssetUrl(`${gender}/thumbs/${costume}.png`);
}

function getItemName(gender: Gender, costumeType: CostumeType, costume: string | null) {
    if (!costume) return "None";
    return getCostume(gender, costumeType, costume)?.name ?? costume;
}

const keyframes = `
@keyframes qqshow-pop { from { opacity: .2; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
@keyframes qqshow-blink { 50% { opacity: .15; } }
@keyframes qqshow-twinkle { from { opacity: .25; } to { opacity: .95; } }
`;

const pageFont = '"Yuanti SC", "YouYuan", "幼圆", "Comic Sans MS", "PingFang SC", sans-serif';

const styles = {
    page: {
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: pageFont,
        color: "#5a3d5c",
        userSelect: "none",
        background:
            "radial-gradient(circle at 15% 20%, rgba(255, 255, 255, .55) 0 2px, transparent 3px), radial-gradient(circle at 80% 15%, rgba(255, 255, 255, .5) 0 2px, transparent 3px), radial-gradient(circle at 65% 75%, rgba(255, 255, 255, .45) 0 2px, transparent 3px), radial-gradient(circle at 30% 85%, rgba(255, 255, 255, .5) 0 2px, transparent 3px), linear-gradient(135deg, #ffd6ec 0%, #d6c8ff 45%, #bfe8ff 100%)",
    },
    stars: {
        position: "fixed",
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 26,
        letterSpacing: 60,
        color: "rgba(255, 255, 255, .8)",
        textShadow: "0 0 8px #fff",
        animation: "qqshow-twinkle 2.6s ease-in-out infinite alternate",
        pointerEvents: "none",
    },
    window: {
        position: "relative",
        width: 960,
        maxWidth: "100%",
        background: "#fff6fb",
        border: "3px solid #fff",
        borderRadius: 18,
        boxShadow: "0 0 0 2px #ff6eb8, 0 18px 50px rgba(190, 90, 160, .45), inset 0 0 30px rgba(255, 182, 220, .25)",
        overflow: "hidden",
    },
    titlebar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        fontWeight: "bold",
        color: "#fff",
        textShadow: "0 1px 0 rgba(180, 60, 140, .6)",
        background: "linear-gradient(180deg, #ffb7dd 0%, #ff6eb8 55%, #f45fae 100%)",
        borderBottom: "2px solid #fff",
    },
    title: {
        letterSpacing: 2,
        fontSize: 15,
    },
    backBtn: {
        appearance: "none",
        WebkitAppearance: "none",
        position: "fixed",
        top: 20,
        left: 20,
        zIndex: 20,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 26px",
        fontFamily: "inherit",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 1,
        color: "#fff",
        textShadow: "0 1px 0 rgba(150, 40, 110, .55)",
        background: "linear-gradient(180deg, #ffc4e4, #ff6eb8)",
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "#fff",
        borderRadius: 999,
        cursor: "pointer",
        boxShadow: "0 4px 0 #d1479a, 0 8px 18px rgba(190, 90, 160, .35)",
    },
    backBtnHover: {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 0 #d1479a, 0 12px 22px rgba(190, 90, 160, .4)",
    },
    backBtnPressed: {
        transform: "translateY(4px)",
        boxShadow: "none",
    },
    winBtns: {
        display: "inline-flex",
        alignItems: "center",
    },
    winBtn: {
        display: "inline-block",
        width: 22,
        height: 22,
        lineHeight: "20px",
        marginLeft: 6,
        textAlign: "center",
        fontStyle: "normal",
        fontSize: 12,
        color: "#ff6eb8",
        background: "linear-gradient(180deg, #fff, #ffd9ee)",
        border: "1px solid #fff",
        borderRadius: 6,
        boxShadow: "0 1px 2px rgba(0, 0, 0, .2)",
    },
    main: {
        display: "flex",
        gap: 18,
        padding: 18,
    },
    panel: {
        width: 340,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    genderTabs: {
        display: "flex",
        gap: 10,
    },
    genderTab: {
        appearance: "none",
        WebkitAppearance: "none",
        flex: 1,
        padding: "12px 0",
        fontFamily: "inherit",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 4,
        color: "#5a3d5c",
        background: "linear-gradient(180deg, #fff, #e8f6ff)",
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "#4aa8e8",
        borderRadius: 12,
        cursor: "pointer",
        boxShadow: "0 3px 0 #4aa8e8",
        transition: "transform .08s, box-shadow .08s, background .15s",
    },
    genderTabActive: {
        color: "#fff",
        textShadow: "0 1px 0 rgba(150, 40, 110, .55)",
        background: "linear-gradient(180deg, #ffc4e4, #ff6eb8)",
        borderColor: "#fff",
        boxShadow: "0 3px 0 #d1479a, 0 0 12px rgba(255, 110, 184, .7)",
    },
    genderTabPressed: {
        transform: "translateY(3px)",
        boxShadow: "none",
    },
    catTabs: {
        display: "flex",
        gap: 6,
        padding: 6,
        background: "#ffe3f2",
        border: "2px solid #ffc0de",
        borderRadius: 12,
    },
    catTab: {
        appearance: "none",
        WebkitAppearance: "none",
        flex: 1,
        padding: "8px 0",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: "normal",
        color: "#a06a92",
        background: "transparent",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background .15s, color .15s",
    },
    catTabHover: {
        background: "rgba(255, 255, 255, .6)",
    },
    catTabActive: {
        color: "#fff",
        fontWeight: "bold",
        background: "linear-gradient(180deg, #c9a0ff, #a06ee8)",
        boxShadow: "inset 0 2px 4px rgba(255, 255, 255, .5), 0 2px 4px rgba(140, 90, 220, .4)",
    },
    items: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 10,
        minHeight: 300,
        alignContent: "start",
    },
    itemCard: {
        appearance: "none",
        WebkitAppearance: "none",
        position: "relative",
        padding: "8px 8px 6px",
        fontFamily: "inherit",
        color: "inherit",
        background: "#fff",
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "#e6d6f5",
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "center",
        transition: "transform .12s, border-color .15s, box-shadow .15s",
    },
    itemCardHover: {
        transform: "translateY(-3px) scale(1.03)",
        borderColor: "#ff9ecd",
    },
    itemCardSelected: {
        borderColor: "#ff6eb8",
        boxShadow: "0 0 0 2px #ffd0e8, 0 0 14px rgba(255, 110, 184, .65)",
    },
    selectedHeart: {
        position: "absolute",
        top: -9,
        right: -6,
        width: 22,
        height: 22,
        lineHeight: "22px",
        fontSize: 12,
        color: "#fff",
        background: "#ff6eb8",
        border: "2px solid #fff",
        borderRadius: "50%",
    },
    thumb: {
        height: 86,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    thumbImg: {
        maxWidth: "100%",
        maxHeight: "100%",
        filter: "drop-shadow(0 2px 2px rgba(120, 60, 110, .25))",
        pointerEvents: "none",
    },
    noneIcon: {
        fontSize: 30,
        color: "#cbb3cf",
    },
    itemName: {
        marginTop: 4,
        fontSize: 13,
        color: "#7c5580",
    },
    itemNameSelected: {
        color: "#ff6eb8",
        fontWeight: "bold",
    },
    panelFooter: {
        fontSize: 12,
        textAlign: "center",
        color: "#b48bb0",
    },
    stageWrap: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
    },
    stage: {
        position: "relative",
        width: "100%",
        maxWidth: 420,
        aspectRatio: "3 / 4",
        border: "3px solid #fff",
        borderRadius: 16,
        boxShadow: "0 0 0 2px #4aa8e8, inset 0 0 40px rgba(127, 212, 255, .35)",
        background:
            "radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, .9) 0%, rgba(255, 255, 255, 0) 55%), repeating-conic-gradient(rgba(255, 255, 255, .35) 0% 25%, rgba(190, 230, 255, .35) 0% 50%), linear-gradient(180deg, #d8f1ff, #ffe0f1)",
        backgroundSize: "auto, 36px 36px, auto",
        overflow: "hidden",
    },
    layer: {
        position: "absolute",
        objectFit: "fill",
        animation: "qqshow-pop .25s ease",
        pointerEvents: "none",
    },
    stageShine: {
        position: "absolute",
        inset: 0,
        zIndex: 6,
        pointerEvents: "none",
        background: "linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, .28) 45%, transparent 60%)",
    },
    stageBtns: {
        display: "flex",
        gap: 12,
    },
    y2kBtn: {
        appearance: "none",
        WebkitAppearance: "none",
        padding: "10px 22px",
        fontFamily: "inherit",
        fontSize: 15,
        fontWeight: "bold",
        color: "#5a3d5c",
        background: "linear-gradient(180deg, #fff, #dff2ff)",
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "#4aa8e8",
        borderRadius: 999,
        cursor: "pointer",
        boxShadow: "0 3px 0 #4aa8e8",
        transition: "transform .08s, box-shadow .08s",
    },
    y2kBtnPrimary: {
        color: "#fff",
        textShadow: "0 1px 0 rgba(150, 40, 110, .55)",
        background: "linear-gradient(180deg, #ffc4e4, #ff6eb8)",
        borderColor: "#fff",
        boxShadow: "0 3px 0 #d1479a",
    },
    y2kBtnPressed: {
        transform: "translateY(3px)",
        boxShadow: "none",
    },
    statusbar: {
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 16px",
        fontSize: 12,
        color: "#96709b",
        background: "#ffe9f5",
        borderTop: "2px solid #ffd0e8",
    },
    blink: {
        animation: "qqshow-blink 1.2s steps(2) infinite",
    },
} as const satisfies Record<string, CSSProperties>;

function PressableTab({
    style,
    hoverStyle,
    pressedStyle,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    style: CSSProperties;
    hoverStyle?: CSSProperties;
    pressedStyle?: CSSProperties;
}) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    return (
        <button
            {...props}
            style={{
                ...style,
                ...(hovered ? hoverStyle : null),
                ...(pressed ? pressedStyle : null),
            }}
            onMouseEnter={(event) => {
                setHovered(true);
                onMouseEnter?.(event);
            }}
            onMouseLeave={(event) => {
                setHovered(false);
                setPressed(false);
                onMouseLeave?.(event);
            }}
            onMouseDown={(event) => {
                setPressed(true);
                onMouseDown?.(event);
            }}
            onMouseUp={(event) => {
                setPressed(false);
                onMouseUp?.(event);
            }}
        />
    );
}

function ItemCard({
    selected,
    onClick,
    children,
}: {
    selected: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <PressableTab
            type="button"
            onClick={onClick}
            style={{
                ...styles.itemCard,
                ...(selected ? styles.itemCardSelected : null),
            }}
            hoverStyle={selected ? { transform: styles.itemCardHover.transform } : styles.itemCardHover}
        >
            {selected ? (
                <span style={styles.selectedHeart} aria-hidden="true">
                    ♥
                </span>
            ) : null}
            {children}
        </PressableTab>
    );
}

export default function QQShowView() {
    const navigate = useNavigate();
    const isNarrow = useMediaQuery("(max-width: 860px)") ?? false;
    const [gender, setGender] = useState<Gender>(Gender.Male);
    const [currentCostumeType, setCurrentCostumeType] = useState<CostumeType>(CostumeType.Hair);

    const [selectedCostumes, setSelectedCostumes] = useState<SelectedCostumesMap>(initialSelected(gender));

    const currentCostumeList = getCostumes(gender, currentCostumeType);

    const statusText = useMemo(() => {
        const parts = [gender === Gender.Male ? "Male" : "Female"];
        for (const key of [CostumeType.Hair, CostumeType.Top, CostumeType.Bottom, CostumeType.Shoes]) {
            const selectedId = selectedCostumes[key];
            parts.push(selectedId ? getItemName(gender, key, selectedId) : `No ${costumeLabels[key]}`);
        }
        return `Current look: ${parts.join(" · ")}`;
    }, [selectedCostumes, gender]);

    const handleGenderChange = (nextGender: Gender) => {
        if (nextGender === gender) return;
        setGender(nextGender);
        setSelectedCostumes(initialSelected(nextGender));
    };

    const handleCostumeTypeChange = (nextCostumeType: CostumeType) => {
        setCurrentCostumeType(nextCostumeType);
    };

    const handleCostumeChange = (costume: string | null) => {
        setSelectedCostumes((prev) => ({
            ...prev,
            [currentCostumeType]: costume,
        }));
    };

    const handleBack = () => {
        if (window.history.length >= 3) {
            navigate(-1);
            return;
        }
        navigate("/admin/tools");
    };

    const handleRandom = () => {
        setSelectedCostumes((prev) => {
            const nextSelectedCostumes = { ...prev };
            for (const key of [CostumeType.Hair, CostumeType.Top, CostumeType.Bottom, CostumeType.Shoes]) {
                const items = getCostumes(gender, key);
                nextSelectedCostumes[key] = items[Math.floor(Math.random() * items.length)]?.id ?? null;
            }
            return nextSelectedCostumes;
        });
    };

    const handleSave = async () => {
        const W = 864;
        const H = 1152;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const loadImage = (src: string) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });

        try {
            const layers: Array<{ src: string; layout: OverlayLayout }> = [
                {
                    src: getAssetUrl(`${gender}/base.png`),
                    layout: baseOverlayLayout[gender],
                },
            ];
            for (const key of layerOrder) {
                const id = selectedCostumes[key];
                if (!id) continue;
                layers.push({
                    src: getLayerSrc(gender, key, id),
                    layout: getOverlayLayout(gender, key, id),
                });
            }
            layers.sort((a, b) => a.layout.z - b.layout.z);
            for (const layer of layers) {
                const { dx, dy, dw, dh } = overlayToCanvasRect(layer.layout, W, H);
                ctx.drawImage(await loadImage(layer.src), dx, dy, Number(dw), Number(dh));
            }
            const a = document.createElement("a");
            a.download = `qq-show-${gender}-${Date.now()}.png`;
            a.href = canvas.toDataURL("image/png");
            a.click();
        } catch {
            window.alert("Save failed: the browser blocked image composition. Please open this page from the dev server and try again.");
        }
    };

    return (
        <div style={styles.page}>
            <style>{keyframes}</style>
            <div aria-hidden="true">
                <span style={{ ...styles.stars, top: "6%" }}>✦ ✧ ✦ ✧ ✦ ✧ ✦</span>
                <span style={{ ...styles.stars, bottom: "6%", animationDelay: "1.3s" }}>✦ ✧ ✦ ✧ ✦ ✧ ✦</span>
            </div>

            <PressableTab
                type="button"
                style={styles.backBtn}
                hoverStyle={styles.backBtnHover}
                pressedStyle={styles.backBtnPressed}
                onClick={handleBack}
                aria-label="Back"
            >
                ← Back
            </PressableTab>

            <div style={styles.window}>
                <div style={styles.titlebar}>
                    <span style={styles.title}>♡ QQ Show Dress-Up Room · Y2K Special Edition ♡</span>
                    <span style={styles.winBtns} aria-hidden="true">
                        <i style={styles.winBtn}>—</i>
                        <i style={styles.winBtn}>▢</i>
                        <i style={styles.winBtn}>✕</i>
                    </span>
                </div>

                <div style={{ ...styles.main, ...(isNarrow ? { flexDirection: "column" } : null) }}>
                    <aside style={{ ...styles.panel, ...(isNarrow ? { width: "100%" } : null) }}>
                        <div style={styles.genderTabs}>
                            {genderTabs.map((tab) => (
                                <PressableTab
                                    key={tab.value}
                                    type="button"
                                    style={{
                                        ...styles.genderTab,
                                        ...(tab.value === gender ? styles.genderTabActive : null),
                                    }}
                                    pressedStyle={styles.genderTabPressed}
                                    onClick={() => handleGenderChange(tab.value)}
                                >
                                    {tab.label}
                                </PressableTab>
                            ))}
                        </div>

                        <div style={styles.catTabs}>
                            {costumeTabs.map((tab) => {
                                const active = tab.value === currentCostumeType;
                                return (
                                    <PressableTab
                                        key={tab.value}
                                        type="button"
                                        style={{
                                            ...styles.catTab,
                                            ...(active ? styles.catTabActive : null),
                                        }}
                                        hoverStyle={active ? undefined : styles.catTabHover}
                                        onClick={() => handleCostumeTypeChange(tab.value)}
                                    >
                                        {tab.label}
                                    </PressableTab>
                                );
                            })}
                        </div>

                        <div style={styles.items}>
                            <ItemCard
                                selected={selectedCostumes[currentCostumeType] === null}
                                onClick={() => handleCostumeChange(null)}
                            >
                                <div style={styles.thumb}>
                                    <span style={styles.noneIcon}>✕</span>
                                </div>
                                <div
                                    style={{
                                        ...styles.itemName,
                                        ...(selectedCostumes[currentCostumeType] === null
                                            ? styles.itemNameSelected
                                            : null),
                                    }}
                                >
                                    None
                                </div>
                            </ItemCard>

                            {currentCostumeList.map((item) => {
                                const selectedItem = selectedCostumes[currentCostumeType] === item.id;
                                return (
                                    <ItemCard
                                        key={item.id}
                                        selected={selectedItem}
                                        onClick={() => handleCostumeChange(item.id)}
                                    >
                                        <div style={styles.thumb}>
                                            <img
                                                src={getThumbSrc(gender, item.id)}
                                                alt={item.name}
                                                draggable={false}
                                                style={styles.thumbImg}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                ...styles.itemName,
                                                ...(selectedItem ? styles.itemNameSelected : null),
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                    </ItemCard>
                                );
                            })}
                        </div>

                        <div style={styles.panelFooter}>
                            ✦ Click an item to dress up · Switch gender to load a different wardrobe ✦
                        </div>
                    </aside>

                    <section style={styles.stageWrap}>
                        <div style={{ ...styles.stage, ...(isNarrow ? { maxWidth: 340 } : null) }}>
                            <img
                                style={{ ...styles.layer, ...overlayToStyle(baseOverlayLayout[gender]) }}
                                src={getAssetUrl(`${gender}/base.png`)}
                                alt="base"
                                draggable={false}
                            />
                            {layerOrder.map((key) => {
                                const id = selectedCostumes[key];
                                if (!id) return null;
                                const layout = getOverlayLayout(gender, key, id);
                                return (
                                    <img
                                        key={`${gender}-${key}-${id}`}
                                        style={{ ...styles.layer, ...overlayToStyle(layout) }}
                                        src={getLayerSrc(gender, key, id)}
                                        alt={key}
                                        draggable={false}
                                    />
                                );
                            })}
                            <div style={styles.stageShine} aria-hidden="true" />
                        </div>

                        <div style={styles.stageBtns}>
                            <PressableTab
                                type="button"
                                style={styles.y2kBtn}
                                pressedStyle={styles.y2kBtnPressed}
                                onClick={handleRandom}
                            >
                                🎲 Random Outfit
                            </PressableTab>
                            <PressableTab
                                type="button"
                                style={{ ...styles.y2kBtn, ...styles.y2kBtnPrimary }}
                                pressedStyle={styles.y2kBtnPressed}
                                onClick={handleSave}
                            >
                                💾 Save Look
                            </PressableTab>
                        </div>
                    </section>
                </div>

                <div style={styles.statusbar}>
                    <span>{statusText}</span>
                    <span style={styles.blink}>♪ Y2K loading complete</span>
                </div>
            </div>
        </div>
    );
}
