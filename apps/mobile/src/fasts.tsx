/**
 * Persisted personal fasting layer — chosen commitments only; church
 * obligations come from the rule resolver and never live here.
 *
 * The accumulation notice's cadence lives here too: "gentle, infrequent,
 * dismissible" — a dismissal snoozes it for two weeks. Nothing in this
 * store scores, streaks, or counts set-asides.
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
import { PersonalFast, resumeOn, setAsideOn } from "@kanon/engine";

const STORAGE_KEY = "kanon.fasts.v1";
const DISMISS_DAYS = 14;

interface FastsState {
  fasts: PersonalFast[];
  accumulationDismissedUntil?: string;
}

interface FastsStore {
  state: FastsState;
  addFast: (fast: Omit<PersonalFast, "id" | "origin" | "setAsideDates" | "createdAt">) => void;
  endFast: (id: string) => void;
  setAside: (id: string, date: string) => void;
  resume: (id: string, date: string) => void;
  dismissAccumulation: (fromDate: string) => void;
}

const FastsContext = createContext<FastsStore | null>(null);

export function FastsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FastsState>({ fasts: [] });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ fasts: [], ...JSON.parse(raw) });
      })
      .catch(() => {});
  }, []);

  const store = useMemo<FastsStore>(() => {
    const persist = (next: FastsState) => {
      setState(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    };
    const mapFast = (id: string, fn: (f: PersonalFast) => PersonalFast) =>
      persist({ ...state, fasts: state.fasts.map((f) => (f.id === id ? fn(f) : f)) });

    return {
      state,
      addFast: (fast) =>
        persist({
          ...state,
          fasts: [
            ...state.fasts,
            {
              ...fast,
              id: `pf${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`,
              origin: "chosen",
              createdAt: new Date().toISOString(),
              setAsideDates: [],
            },
          ],
        }),
      endFast: (id) =>
        persist({ ...state, fasts: state.fasts.filter((f) => f.id !== id) }),
      setAside: (id, date) => mapFast(id, (f) => setAsideOn(f, date)),
      resume: (id, date) => mapFast(id, (f) => resumeOn(f, date)),
      dismissAccumulation: (fromDate) => {
        const until = new Date(
          Date.parse(`${fromDate}T00:00:00Z`) + DISMISS_DAYS * 86_400_000,
        )
          .toISOString()
          .slice(0, 10);
        persist({ ...state, accumulationDismissedUntil: until });
      },
    };
  }, [state]);

  return <FastsContext.Provider value={store}>{children}</FastsContext.Provider>;
}

export function useFasts(): FastsStore {
  const ctx = useContext(FastsContext);
  if (!ctx) throw new Error("useFasts must be used inside FastsProvider");
  return ctx;
}
