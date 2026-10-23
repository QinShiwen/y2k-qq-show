import type { CSSProperties } from "react";
import { CostumeType, type Gender } from "./costumes";
import {
  getAssetUrl,
  getLayerSrc,
  getOverlayLayout,
  overlayToStyle,
} from "./utils";
import { baseOverlayLayout, layerOrder } from "./consts";

export type QQShowFigureProps = {
  gender: Gender;
  hair: string | null;
  top: string | null;
  bottom: string | null;
  shoes: string | null;

  /*
   * Box width - used to scale the figure to the desired size.
   * Height follows the 3:4 stage.
   */
  width?: number | string;
};

const layerStyle: CSSProperties = {
  position: "absolute",
  objectFit: "fill",
  animation: "qqshow-pop .25s ease",
  pointerEvents: "none",
};

export default function QQShowFigure({
  gender,
  hair,
  top,
  bottom,
  shoes,
  width = "100%",
}: QQShowFigureProps) {
  const slots: Record<CostumeType, string | null> = {
    [CostumeType.Hair]: hair,
    [CostumeType.Top]: top,
    [CostumeType.Bottom]: bottom,
    [CostumeType.Shoes]: shoes,
  };

  return (
    <div
      style={{
        position: "relative",
        width,
        aspectRatio: "3 / 4",
        overflow: "hidden",
      }}
    >
      <img
        style={{
          ...layerStyle,
          ...overlayToStyle(baseOverlayLayout[gender]),
        }}
        src={getAssetUrl(`${gender}/base.png`)}
        alt=""
        draggable={false}
      />
      {layerOrder.map((key) => {
        const id = slots[key];
        if (!id) return null;
        const layout = getOverlayLayout(gender, key, id);
        return (
          <img
            key={`${gender}-${key}-${id}`}
            style={{ ...layerStyle, ...overlayToStyle(layout) }}
            src={getLayerSrc(gender, key, id)}
            alt=""
            draggable={false}
          />
        );
      })}
    </div>
  );
}
