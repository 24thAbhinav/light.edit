export type EditKey =
  | "exposure"
  | "contrast"
  | "highlights"
  | "shadows"
  | "whites"
  | "blacks"
  | "temperature"
  | "tint"
  | "vibrance"
  | "saturation";

export type EditState = Record<EditKey, number>;

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
};

export interface ParameterDefinition {
  key: EditKey;
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
];
