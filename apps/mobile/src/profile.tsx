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

/**
 * Scaffold default. US profile per the master doc's v1 recommendation;
 * the birth date is a stand-in until onboarding captures the real one —
 * Settings surfaces it so binding ages aren't silently wrong.
 */
export const DEFAULT_PROFILE: UserProfile = {
  discipline: "of",
  normProfile: "us",
  birthDate: "1990-01-01",
};

interface ProfileState {
  profile: UserProfile;
  setProfile: (next: UserProfile) => void;
}

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setState] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
      })
      .catch(() => {
        // Unreadable stored profile: keep the default rather than crash.
      });
  }, []);

  const value = useMemo<ProfileState>(
    () => ({
      profile,
      setProfile: (next) => {
        setState(next);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      },
    }),
    [profile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileState {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
