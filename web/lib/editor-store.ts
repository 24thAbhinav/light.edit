import { create } from "zustand";
import {
  aspectRatioValue,
  defaultEditState,
  STRAIGHTEN_LIMIT,
  type AspectRatioKey,
  type CropRegion,
  type EditState,
  type ParameterKey,
} from "./edit-state";
import {
  cropForAspect,
  fitCropToAspect,
  normalizeRotation,
  rotateCrop,
  rotatedDimensions,
} from "./engine/geometry";
import { emptyHistogram, type Histogram } from "./engine/histogram";

const HISTORY_LIMIT = 100;

export interface EditorPhoto {
  id: string;
  name: string;
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
  edits: EditState;
  past: EditState[];
  future: EditState[];
  lastAction: string | null;
}

interface EditorStore {
  photos: EditorPhoto[];
  activeId: string | null;
  histogram: Histogram;
  setHistogram: (histogram: Histogram) => void;
  addPhotos: (photos: EditorPhoto[]) => void;
  selectPhoto: (id: string) => void;
  removePhoto: (id: string) => void;
  setEdit: (key: ParameterKey, value: number) => void;
  resetEdit: (key: ParameterKey) => void;
  resetAll: () => void;
  rotateBy: (delta: number) => void;
  setCrop: (crop: CropRegion | null) => void;
  setStraighten: (value: number) => void;
  setAspectRatio: (key: AspectRatioKey) => void;
  toggleCropLock: () => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
  undo: () => void;
  redo: () => void;
}

let photoSequence = 0;

export const createPhotoId = () => {
  photoSequence += 1;
  return `photo-${photoSequence}`;
};

const findActive = (state: EditorStore) =>
  state.photos.find((photo) => photo.id === state.activeId) ?? null;

const record = (
  photo: EditorPhoto,
  next: EditState,
  actionKey: string | null,
): EditorPhoto => {
  const push = actionKey === null || photo.lastAction !== actionKey;
  return {
    ...photo,
    edits: next,
    past: push ? [...photo.past, photo.edits].slice(-HISTORY_LIMIT) : photo.past,
    future: [],
    lastAction: actionKey,
  };
};

const replaceActive = (
  state: EditorStore,
  next: EditorPhoto,
): Partial<EditorStore> => ({
  photos: state.photos.map((photo) =>
    photo.id === next.id ? next : photo,
  ),
});

export const useEditorStore = create<EditorStore>((set) => ({
  photos: [],
  activeId: null,
  histogram: emptyHistogram(),

  setHistogram: (histogram) =>
    set((state) => (state.histogram === histogram ? {} : { histogram })),

  addPhotos: (entries) =>
    set((state) => ({
      photos: [...state.photos, ...entries],
      activeId: state.activeId ?? entries[0]?.id ?? null,
    })),

  selectPhoto: (id) =>
    set((state) => (state.activeId === id ? {} : { activeId: id })),

  removePhoto: (id) =>
    set((state) => {
      const index = state.photos.findIndex((photo) => photo.id === id);
      if (index === -1) return {};
      const photos = state.photos.filter((photo) => photo.id !== id);
      const activeId =
        state.activeId === id
          ? (photos[index]?.id ?? photos[index - 1]?.id ?? null)
          : state.activeId;
      return { photos, activeId };
    }),

  setEdit: (key, value) =>
    set((state) => {
      const photo = findActive(state);
      if (!photo || photo.edits[key] === value) return {};
      const next = { ...photo.edits, [key]: value };
      return replaceActive(state, record(photo, next, `param:${key}`));
    }),

  resetEdit: (key) =>
    set((state) => {
      const photo = findActive(state);
      if (!photo || photo.edits[key] === defaultEditState[key]) return {};
      const next = { ...photo.edits, [key]: defaultEditState[key] };
      return replaceActive(state, record(photo, next, null));
    }),

  resetAll: () =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      return replaceActive(state, record(photo, defaultEditState, null));
    }),

  rotateBy: (delta) =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      const rotation = normalizeRotation(photo.edits.rotation + delta);
      let crop = photo.edits.crop ? rotateCrop(photo.edits.crop, delta) : null;
      const ratio = aspectRatioValue(photo.edits.aspectRatio);
      if (crop && photo.edits.cropLocked && ratio !== null) {
        const frame = rotatedDimensions(photo.image, rotation);
        crop = fitCropToAspect(crop, frame.width, frame.height, ratio);
      }
      const next: EditState = { ...photo.edits, rotation, crop };
      return replaceActive(state, record(photo, next, null));
    }),

  setCrop: (crop) =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      const next = { ...photo.edits, crop };
      return replaceActive(state, record(photo, next, "crop"));
    }),

  setStraighten: (value) =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      const straighten = Math.max(
        -STRAIGHTEN_LIMIT,
        Math.min(STRAIGHTEN_LIMIT, value),
      );
      if (photo.edits.straighten === straighten) return {};
      const next = { ...photo.edits, straighten };
      return replaceActive(state, record(photo, next, "straighten"));
    }),

  setAspectRatio: (key) =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      const ratio = aspectRatioValue(key);
      if (ratio === null) {
        const next: EditState = {
          ...photo.edits,
          aspectRatio: key,
          cropLocked: false,
          crop: null,
        };
        return replaceActive(state, record(photo, next, null));
      }
      const frame = rotatedDimensions(photo.image, photo.edits.rotation);
      const next: EditState = {
        ...photo.edits,
        aspectRatio: key,
        cropLocked: true,
        crop: cropForAspect(frame.width, frame.height, ratio),
      };
      return replaceActive(state, record(photo, next, null));
    }),

  toggleCropLock: () =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      const next: EditState = {
        ...photo.edits,
        cropLocked: !photo.edits.cropLocked,
      };
      return replaceActive(state, record(photo, next, null));
    }),

  flipHorizontal: () =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      const next: EditState = {
        ...photo.edits,
        flipHorizontal: !photo.edits.flipHorizontal,
      };
      return replaceActive(state, record(photo, next, null));
    }),

  flipVertical: () =>
    set((state) => {
      const photo = findActive(state);
      if (!photo) return {};
      const next: EditState = {
        ...photo.edits,
        flipVertical: !photo.edits.flipVertical,
      };
      return replaceActive(state, record(photo, next, null));
    }),

  undo: () =>
    set((state) => {
      const photo = findActive(state);
      if (!photo || photo.past.length === 0) return {};
      const previous = photo.past[photo.past.length - 1];
      return replaceActive(state, {
        ...photo,
        edits: previous,
        past: photo.past.slice(0, -1),
        future: [...photo.future, photo.edits].slice(-HISTORY_LIMIT),
        lastAction: null,
      });
    }),

  redo: () =>
    set((state) => {
      const photo = findActive(state);
      if (!photo || photo.future.length === 0) return {};
      const next = photo.future[photo.future.length - 1];
      return replaceActive(state, {
        ...photo,
        edits: next,
        past: [...photo.past, photo.edits].slice(-HISTORY_LIMIT),
        future: photo.future.slice(0, -1),
        lastAction: null,
      });
    }),
}));

export const selectActivePhoto = (state: EditorStore) => findActive(state);

export const getActiveEdits = () =>
  findActive(useEditorStore.getState())?.edits ?? defaultEditState;

export const selectParameter =
  (key: ParameterKey) => (state: EditorStore) =>
    (findActive(state)?.edits ?? defaultEditState)[key];

export const useActiveEdits = () =>
  useEditorStore((state) => findActive(state)?.edits ?? defaultEditState);

export const useCanUndo = () =>
  useEditorStore((state) => (findActive(state)?.past.length ?? 0) > 0);

export const useCanRedo = () =>
  useEditorStore((state) => (findActive(state)?.future.length ?? 0) > 0);

export const hasEdits = (edits: EditState) =>
  (Object.keys(defaultEditState) as (keyof EditState)[]).some(
    (key) => edits[key] !== defaultEditState[key],
  );
