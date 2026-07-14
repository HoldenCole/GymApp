/**
 * Persisted food state: the diary plus the user-owned filter layers.
 *
 * Allergies are the safety layer — a hard filter applied everywhere food
 * is suggested, absolute, with no override anywhere in the UI. Dislikes
 * are preference: same mechanics, casual treatment. The fast/abstinence
 * layer is NOT stored here — the engine supplies it per day; it is shown,
 * not managed (UI brief §4).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DiaryEntry } from "@kanon/food";

const STORAGE_KEY = "kanon.food.v1";

export interface FoodState {
  diary: DiaryEntry[];
  allergies: string[];
  dislikedCategories: string[];
}

const DEFAULT_STATE: FoodState = {
  diary: [],
  allergies: [],
  dislikedCategories: [],
};

interface FoodStore {
  state: FoodState;
  addEntry: (entry: Omit<DiaryEntry, "id">) => void;
  removeEntry: (id: string) => void;
  update: (patch: Partial<Omit<FoodState, "diary">>) => void;
  reset: () => void;
}

const FoodContext = createContext<FoodStore | null>(null);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FoodState>(DEFAULT_STATE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      })
      .catch(() => {});
  }, []);

  const store = useMemo<FoodStore>(() => {
    const persist = (next: FoodState) => {
      setState(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    };
    return {
      state,
      addEntry: (entry) =>
        persist({
          ...state,
          diary: [
            ...state.diary,
            { ...entry, id: `e${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}` },
          ],
        }),
      removeEntry: (id) =>
        persist({ ...state, diary: state.diary.filter((e) => e.id !== id) }),
      update: (patch) => persist({ ...state, ...patch }),
      reset: () => persist(DEFAULT_STATE),
    };
  }, [state]);

  return <FoodContext.Provider value={store}>{children}</FoodContext.Provider>;
}

export function useFood(): FoodStore {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error("useFood must be used inside FoodProvider");
  return ctx;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
