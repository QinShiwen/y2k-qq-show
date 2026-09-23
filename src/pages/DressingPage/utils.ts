import { defaultOverlayBox, layerZ } from "./consts";
import { getCostume } from "./costumes";
import { CostumeType, Gender, type OverlayLayout } from "./costumes";

export function getOverlayLayout(
    gender: Gender,
    costumeType: CostumeType,
    costume: string,
): OverlayLayout {
    const item = getCostume(gender, costumeType, costume);
    return {
        ...(item?.layout ?? defaultOverlayBox),
        z: layerZ[costumeType],
    };
}

export function overlayToStyle(layout: OverlayLayout) {
    return {
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        width: `${layout.width}%`,
        height: `${layout.height}%`,
        zIndex: layout.z,
    };
}

export function overlayToCanvasRect(
    layout: OverlayLayout,
    canvasWidth: number,
    canvasHeight: number,
) {
    return {
        dx: (layout.x / 100) * canvasWidth,
        dy: (layout.y / 100) * canvasHeight,
        dw: (layout.width / 100) * canvasWidth,
        dh: (layout.height / 100) * canvasHeight,
    };
}

