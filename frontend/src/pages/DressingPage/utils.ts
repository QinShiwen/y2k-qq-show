import { defaultOverlayBox, layerZ } from "./consts";
import { getCostume } from "./costumes";
import { CostumeType, Gender, type OverlayLayout } from "./costumes";

const assetModules = import.meta.glob("./asset/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export function getAssetUrl(relativePath: string) {
  return assetModules[`./asset/${relativePath}`] ?? "";
}

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

export function getLayerSrc(
    gender: Gender,
    costumeType: CostumeType,
    costume: string | null,
) {
    if (!costume) return "";
    return getAssetUrl(`${gender}/${costumeType}/${costume}.png`);
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
