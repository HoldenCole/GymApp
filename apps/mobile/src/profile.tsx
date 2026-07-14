/**
 * The user profile: discipline (OF/EF), country norm profile, birth date.
 * These are exactly the resolver's inputs — onboarding will capture them
 * properly; Settings edits them now.
 *
 * Two rules from the content pack this store must keep:
 * - The norm profile persists across a discipline switch (Part 5 §3) —
 *   switching OF↔EF changes ages and thresholds, never resets country.
 * - Home country, not live location (Part D): the value only changes when
 *   the user changes it.
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
import type { UserProfile } from "@kanon/engine";

const STORAGE_KEY = "kanon.profile.v1";

export type PatronId = "joseph" | "benedict" | "hyacinth" | "therese" | "anthony";

/** The resolver's UserProfile plus app-level onboarding state. */
export interface AppProfile extends UserProfile {
  /** Gates the tabs; false routes to onboarding. */
  onboarded?: boolean;
  /** Formation companion; Benedict is the catalog's default. */
  patronId?: PatronId;
}

/**
 * Pre-onboarding default. US profile per the master doc's v1
 * recommendation; the birth date is a stand-in that onboarding replaces.
 */
export const DEFAULT_PROFILE: AppProfile = {
  discipline: "of",
  normProfile: "us",
  birthDate: "1990-01-01",
  onboarded: false,
  patronId: "benedict",
};

interface ProfileState {
  profile: AppProfile;
  /** True once persisted state has been read — gate routing on this. */
  loaded: boolean;
  setProfile: (next: AppProfile) => void;
}

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setState] = useState<AppProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
      })
      .catch(() => {
        // Unreadable stored profile: keep the default rather than crash.
      })
      .finally(() => setLoaded(true));
  }, []);

  const value = useMemo<ProfileState>(
    () => ({
      profile,
      loaded,
      setProfile: (next) => {
        setState(next);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      },
    }),
    [profile, loaded],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileState {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
