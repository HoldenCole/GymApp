/**
 * The Rule tab's journal: one entry per day, private, local. Zero
 * mechanics by design — no streaks, no prompts to catch up, no empty-day
 * guilt. Days without an entry simply don't exist here.
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

const STORAGE_KEY = "kanon.journal.v1";

export interface JournalEntry {
  date: string;
  text: string;
}

interface JournalStore {
  entries: JournalEntry[];
  /** Write (or clear, with empty text) the entry for a date. */
  write: (date: string, text: string) => void;
  reset: () => void;
}

const JournalContext = createContext<JournalStore | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setEntries(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  const store = useMemo<JournalStore>(() => {
    const persist = (next: JournalEntry[]) => {
      setEntries(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    };
    return {
      entries,
      write: (date, text) => {
        const others = entries.filter((e) => e.date !== date);
        persist(
          text.trim() ? [...others, { date, text }].sort((a, b) => (a.date < b.date ? -1 : 1)) : others,
        );
      },
      reset: () => persist([]),
    };
  }, [entries]);

  return <JournalContext.Provider value={store}>{children}</JournalContext.Provider>;
}

export function useJournal(): JournalStore {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal must be used inside JournalProvider");
  return ctx;
}
