/**
 * Persisted fitness state: body profile, plan, split, weight log, units.
 * Storage is metric throughout; units affect display only.
 *
 * `body` starts null — targets appear once the user enters their numbers,
 * rather than showing figures computed from a fabricated body.
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
import {
  BodyProfile,
  DEFAULT_PLAN,
  normalizeLog,
  Plan,
  Split,
  SPLIT_TEMPLATES,
  UnitSystem,
  WeightEntry,
} from "@kanon/fitness";

const STORAGE_KEY = "kanon.fitness.v1";

export interface FitnessState {
  body: BodyProfile | null;
  plan: Plan;
  split: Split;
  weightLog: WeightEntry[];
  units: UnitSystem;
}

const DEFAULT_STATE: FitnessState = {
  body: null,
  plan: DEFAULT_PLAN,
  split: SPLIT_TEMPLATES[0]!,
  weightLog: [],
  units: "imperial", // US-scoped v1 default; toggle in Settings
};

interface FitnessStore {
  state: FitnessState;
  update: (patch: Partial<FitnessState>) => void;
  /** Log today's weight; also keeps body.weightKg current for targets. */
  logWeight: (entry: WeightEntry) => void;
  reset: () => void;
}

const FitnessContext = createContext<FitnessStore | null>(null);

export function FitnessProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FitnessState>(DEFAULT_STATE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      })
      .catch(() => {});
  }, []);

  const store = useMemo<FitnessStore>(() => {
    const persist = (next: FitnessState) => {
      setState(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    };
    return {
      state,
      update: (patch) => persist({ ...state, ...patch }),
      logWeight: (entry) =>
        persist({
          ...state,
          weightLog: normalizeLog([...state.weightLog, entry]),
          body: state.body ? { ...state.body, weightKg: entry.weightKg } : state.body,
        }),
      reset: () => persist(DEFAULT_STATE),
    };
  }, [state]);

  return <FitnessContext.Provider value={store}>{children}</FitnessContext.Provider>;
}

export function useFitness(): FitnessStore {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error("useFitness must be used inside FitnessProvider");
  return ctx;
}
