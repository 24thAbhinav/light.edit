import { create } from "zustand";
import { defaultEditState, type EditKey, type EditState } from "./edit-state";

interface EditorStore {
  edits: EditState;
  setEdit: (key: EditKey, value: number) => void;
  resetEdit: (key: EditKey) => void;
  resetAll: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  edits: defaultEditState,
  setEdit: (key, value) =>
    set((state) => ({ edits: { ...state.edits, [key]: value } })),
  resetEdit: (key) =>
    set((state) => ({
      edits: { ...state.edits, [key]: defaultEditState[key] },
    })),
  resetAll: () => set({ edits: defaultEditState }),
}));

export const hasEdits = (edits: EditState) =>
  (Object.keys(edits) as EditKey[]).some(
    (key) => edits[key] !== defaultEditState[key],
  );
