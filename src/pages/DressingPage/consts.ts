import { CostumeType, Gender, type OverlayLayout } from "./costumes";

export const layerZ = {
    base: 1,
    [CostumeType.Shoes]: 2,
    [CostumeType.Bottom]: 3,
    [CostumeType.Top]: 4,
    [CostumeType.Hair]: 5,
} as const;

export const defaultOverlayBox = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
} as const;

export const genderTabs: Array<{ label: string; value: Gender }> = [
    { label: "♂ Male", value: Gender.Male },
    { label: "♀ Female", value: Gender.Female },
];

export const costumeTabs: Array<{ label: string; value: CostumeType }> = [
    { label: "Hair", value: CostumeType.Hair },
    { label: "Top", value: CostumeType.Top },
    { label: "Bottom", value: CostumeType.Bottom },
    { label: "Shoes", value: CostumeType.Shoes },
];

export const costumeLabels: Record<CostumeType, string> = {
    [CostumeType.Hair]: "Hair",
    [CostumeType.Top]: "Top",
    [CostumeType.Bottom]: "Bottom",
    [CostumeType.Shoes]: "Shoes",
};

export const baseOverlayLayout: Record<Gender, OverlayLayout> = {
    [Gender.Male]: { ...defaultOverlayBox, z: layerZ.base },
    [Gender.Female]: { ...defaultOverlayBox, z: layerZ.base },
};
