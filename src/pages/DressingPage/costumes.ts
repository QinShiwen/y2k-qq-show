export enum Gender {
    Male = "male",
    Female = "female",
}

export enum CostumeType {
    Hair = "hair",
    Top = "top",
    Bottom = "bottom",
    Shoes = "shoes",
}

export type SelectedCostumesMap = Record<CostumeType, string | null>;

/**
 * Position of one layer on the dress-up stage / save canvas.
 *
 * x, y, width, height are percentages of the stage box.
 * Stage is 3:4, same as the 864×1152 PNGs, origin at top-left.
 *
 * CSS mapping (preview):
 *   left: `${x}%`; top: `${y}%`; width: `${width}%`; height: `${height}%`; z-index: z
 *
 * Canvas mapping (Save Look, W=864 H=1152):
 *   drawImage(img, x/100*W, y/100*H, width/100*W, height/100*H)
 */
export type OverlayLayout = {
    x: number;
    y: number;
    width: number;
    height: number;
    z: number;
};

export type CostumeLayout = Pick<OverlayLayout, "x" | "y" | "width" | "height">;

export type CostumeItem = {
    id: string;
    gender: Gender;
    type: CostumeType;
    name: string;
    layout: CostumeLayout;
    default?: boolean;
};

/**
 * Costume catalog: asset id, overlay position on the figure, and default pick
 * Available for both gender and type. Can be extended with new items.
*/
export const costumes: CostumeItem[] = [
    {
        id: "hair1",
        gender: Gender.Male,
        type: CostumeType.Hair,
        name: "Black Spiky Hair",
        layout: { x: 10, y: -3, width: 80, height: 80 },
        default: true,
    },
    {
        id: "hair2",
        gender: Gender.Male,
        type: CostumeType.Hair,
        name: "Brown Tousled Hair",
        layout: { x: 10, y: -3, width: 80, height: 80 },
    },
    {
        id: "hair3",
        gender: Gender.Male,
        type: CostumeType.Hair,
        name: "Blond Side Bangs",
        layout: { x: 4, y: -3, width: 90, height: 90 },
    },
    {
        id: "top1",
        gender: Gender.Male,
        type: CostumeType.Top,
        name: "Red-Black Plaid Shirt",
        layout: { x: 22.8, y: 20, width: 55, height: 45 },
        default: true,
    },
    {
        id: "top2",
        gender: Gender.Male,
        type: CostumeType.Top,
        name: "Sky Blue Hoodie",
        layout: { x: 10.5, y: 10, width: 80, height: 58 },
    },
    {
        id: "top3",
        gender: Gender.Male,
        type: CostumeType.Top,
        name: "Black Flame Tee",
        layout: { x: 23, y: 23, width: 54, height: 38 },
    },
    {
        id: "bottom1",
        gender: Gender.Male,
        type: CostumeType.Bottom,
        name: "Baggy Jeans",
        layout: { x: 17.3, y: 43, width: 65, height: 50 },
        default: true,
    },
    {
        id: "bottom2",
        gender: Gender.Male,
        type: CostumeType.Bottom,
        name: "Khaki Cargo Pants",
        layout: { x: 17.5, y: 42.5, width: 65, height: 52 },
    },
    {
        id: "bottom3",
        gender: Gender.Male,
        type: CostumeType.Bottom,
        name: "Black Shorts",
        layout: { x: 27.5, y: 36, width: 45, height: 52 },
    },
    {
        id: "shoes1",
        gender: Gender.Male,
        type: CostumeType.Shoes,
        name: "Black Canvas Shoes",
        layout: { x: 21.7, y: 72, width: 56, height: 30 },
        default: true,
    },
    {
        id: "shoes2",
        gender: Gender.Male,
        type: CostumeType.Shoes,
        name: "Blue-White Sneakers",
        layout: { x: 24.5, y: 73, width: 51, height: 30 },
    },
    {
        id: "shoes3",
        gender: Gender.Male,
        type: CostumeType.Shoes,
        name: "Brown Boots",
        layout: { x: 24, y: 68.5, width: 52, height: 30 },
    },
    {
        id: "hair1",
        gender: Gender.Female,
        type: CostumeType.Hair,
        name: "Twin Tails",
        layout: { x: -10, y: -2, width: 120, height: 120 },
        default: true,
    },
    {
        id: "hair2",
        gender: Gender.Female,
        type: CostumeType.Hair,
        name: "Bob Cut",
        layout: { x: 26, y: -3, width: 48, height: 35 },
    },
    {
        id: "hair3",
        gender: Gender.Female,
        type: CostumeType.Hair,
        name: "Long Purple Hair",
        layout: { x: 8, y: 0, width: 85, height: 70 },
    },
    {
        id: "top1",
        gender: Gender.Female,
        type: CostumeType.Top,
        name: "Pink Heart Tee",
        layout: { x: 27.5, y: 21, width: 45, height: 30 },
        default: true,
    },
    {
        id: "top2",
        gender: Gender.Female,
        type: CostumeType.Top,
        name: "Taro Purple Hoodie",
        layout: { x: 22.8, y: 18, width: 55, height: 40 },
    },
    {
        id: "top3",
        gender: Gender.Female,
        type: CostumeType.Top,
        name: "White Camisole",
        layout: { x: 31.5, y: 22, width: 36.5, height: 30 },
    },
    {
        id: "bottom1",
        gender: Gender.Female,
        type: CostumeType.Bottom,
        name: "Plaid Pleated Skirt",
        layout: { x: 30.5, y: 33, width: 39, height: 39 },
        default: true,
    },
    {
        id: "bottom2",
        gender: Gender.Female,
        type: CostumeType.Bottom,
        name: "Low-Rise Jeans",
        layout: { x: 20, y: 40, width: 60, height: 50 },
    },
    {
        id: "bottom3",
        gender: Gender.Female,
        type: CostumeType.Bottom,
        name: "Denim Hot Pants",
        layout: { x: 25, y: 26, width: 50, height: 55 },
    },
    {
        id: "shoes1",
        gender: Gender.Female,
        type: CostumeType.Shoes,
        name: "Platform Sneakers",
        layout: { x: 15, y: 60, width: 70, height: 40 },
        default: true,
    },
    {
        id: "shoes2",
        gender: Gender.Female,
        type: CostumeType.Shoes,
        name: "Black Mary Janes",
        layout: { x: 15.5, y: 63, width: 70, height: 45 },
    },
    {
        id: "shoes3",
        gender: Gender.Female,
        type: CostumeType.Shoes,
        name: "Pink Boots",
        layout: { x: 11.5, y: 58, width: 77, height: 50 },
    },
];

const costumesByGenderType: Record<Gender, Record<CostumeType, CostumeItem[]>> = costumes.reduce(
    (index, item) => {
        index[item.gender][item.type].push(item);
        return index;
    },
    {
        [Gender.Male]: {
            [CostumeType.Hair]: [],
            [CostumeType.Top]: [],
            [CostumeType.Bottom]: [],
            [CostumeType.Shoes]: [],
        },
        [Gender.Female]: {
            [CostumeType.Hair]: [],
            [CostumeType.Top]: [],
            [CostumeType.Bottom]: [],
            [CostumeType.Shoes]: [],
        },
    } as Record<Gender, Record<CostumeType, CostumeItem[]>>,
);

export function getCostumes(gender: Gender, type: CostumeType): CostumeItem[] {
    return costumesByGenderType[gender][type];
}

export function getCostume(
    gender: Gender,
    type: CostumeType,
    id: string,
): CostumeItem | undefined {
    return costumesByGenderType[gender][type].find((item) => item.id === id);
}

/* Initialization for both gender characters. */
export const initialSelected = (gender: Gender): SelectedCostumesMap => {
    return costumes.reduce((selected, item) => {
        if (item.gender === gender && item.default) {
            selected[item.type] = item.id as string | null;
        }
        return selected;
    }, {} as SelectedCostumesMap);
}
