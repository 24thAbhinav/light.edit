export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ParameterKey =
  | "exposure"
  | "contrast"
  | "highlights"
  | "shadows"
  | "whites"
  | "blacks"
  | "temperature"
  | "tint"
  | "vibrance"
  | "saturation"
  | "texture"
  | "clarity"
  | "dehaze"
  | "vignette"
  | "grain";

export type AspectRatioKey =
  | "original"
  | "1:1"
  | "5:4"
  | "4:3"
  | "3:2"
  | "2:3"
  | "3:4"
  | "16:9"
  | "2:1"
  | "instagram-square"
  | "instagram-portrait"
  | "instagram-landscape"
  | "instagram-story";

export type AspectRatioGroup = "none" | "standard" | "instagram";

export interface AspectRatioDefinition {
  key: AspectRatioKey;
  label: string;
  hint?: string;
  group: AspectRatioGroup;
  ratio: number | null;
}

export interface AspectRatioMenu {
  label: string | null;
  options: AspectRatioDefinition[];
}

const originalRatio: AspectRatioDefinition = {
  key: "original",
  label: "Original",
  group: "none",
  ratio: null,
};

const standardRatios: AspectRatioDefinition[] = [
  { key: "1:1", label: "1:1", hint: "Square", group: "standard", ratio: 1 },
  { key: "5:4", label: "5:4", group: "standard", ratio: 5 / 4 },
  { key: "4:3", label: "4:3", hint: "Classic", group: "standard", ratio: 4 / 3 },
  { key: "3:2", label: "3:2", hint: "35mm", group: "standard", ratio: 3 / 2 },
  { key: "2:3", label: "2:3", hint: "Portrait", group: "standard", ratio: 2 / 3 },
  { key: "3:4", label: "3:4", group: "standard", ratio: 3 / 4 },
  {
    key: "16:9",
    label: "16:9",
    hint: "Widescreen",
    group: "standard",
    ratio: 16 / 9,
  },
  { key: "2:1", label: "2:1", hint: "Panorama", group: "standard", ratio: 2 },
];

const instagramRatios: AspectRatioDefinition[] = [
  {
    key: "instagram-square",
    label: "Instagram 1:1",
    hint: "Square post",
    group: "instagram",
    ratio: 1,
  },
  {
    key: "instagram-portrait",
    label: "Instagram 4:5",
    hint: "Feed portrait",
    group: "instagram",
    ratio: 4 / 5,
  },
  {
    key: "instagram-landscape",
    label: "Instagram 1.91:1",
    hint: "Feed landscape",
    group: "instagram",
    ratio: 1.91,
  },
  {
    key: "instagram-story",
    label: "Instagram 9:16",
    hint: "Story & reels",
    group: "instagram",
    ratio: 9 / 16,
  },
];

export const aspectRatioGroups: AspectRatioMenu[] = [
  { label: null, options: [originalRatio] },
  { label: "Standard", options: standardRatios },
  { label: "Instagram", options: instagramRatios },
];

export const aspectRatioValue = (key: AspectRatioKey) =>
  aspectRatioGroups
    .flatMap((group) => group.options)
    .find((entry) => entry.key === key)?.ratio ?? null;

export type EditState = Record<ParameterKey, number> & {
  rotation: number;
  straighten: number;
  crop: CropRegion | null;
  aspectRatio: AspectRatioKey;
  cropLocked: boolean;
  flipHorizontal: boolean;
  flipVertical: boolean;
};

export const defaultEditState: EditState = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  texture: 0,
  clarity: 0,
  dehaze: 0,
  vignette: 0,
  grain: 0,
  rotation: 0,
  straighten: 0,
  crop: null,
  aspectRatio: "original",
  cropLocked: false,
  flipHorizontal: false,
  flipVertical: false,
};

export const STRAIGHTEN_LIMIT = 45;

export interface ParameterDefinition {
  key: ParameterKey;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  gradient?: readonly [string, string];
  format: (value: number) => string;
}

export interface ParameterGroup {
  label: string;
  parameters: ParameterDefinition[];
}

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

const signedFloat = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}`;

export const parameterGroups: ParameterGroup[] = [
  {
    label: "Light",
    parameters: [
      {
        key: "exposure",
        label: "Exposure",
        min: -5,
        max: 5,
        step: 0.01,
        defaultValue: 0,
        format: (value) => `${signedFloat(value)} EV`,
      },
      {
        key: "contrast",
        label: "Contrast",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "highlights",
        label: "Highlights",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "shadows",
        label: "Shadows",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "whites",
        label: "Whites",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "blacks",
        label: "Blacks",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
    ],
  },
  {
    label: "Color",
    parameters: [
      {
        key: "temperature",
        label: "Temperature",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        gradient: ["#4a72b0", "#d29a45"],
        format: signed,
      },
      {
        key: "tint",
        label: "Tint",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        gradient: ["#3f9e6b", "#b45fb0"],
        format: signed,
      },
      {
        key: "vibrance",
        label: "Vibrance",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "saturation",
        label: "Saturation",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
    ],
  },
  {
    label: "Presence",
    parameters: [
      {
        key: "texture",
        label: "Texture",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "clarity",
        label: "Clarity",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "dehaze",
        label: "Dehaze",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
    ],
  },
  {
    label: "Effects",
    parameters: [
      {
        key: "vignette",
        label: "Vignette",
        min: -100,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: signed,
      },
      {
        key: "grain",
        label: "Grain",
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 0,
        format: (value) => `${value}`,
      },
    ],
  },
];

export const parameterKeys = parameterGroups.flatMap((group) =>
  group.parameters.map((parameter) => parameter.key),
);

export const straightenParameter = {
  label: "Straighten",
  min: -STRAIGHTEN_LIMIT,
  max: STRAIGHTEN_LIMIT,
  step: 0.5,
  defaultValue: 0,
  format: (value: number) =>
    `${value > 0 ? "+" : ""}${Number.isInteger(value) ? value : value.toFixed(1)}`,
};
