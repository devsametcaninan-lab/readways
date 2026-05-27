"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { readUserPreferences, writeUserPreferences } from "./storage";
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from "./types";

type UserPreferencesContextValue = {
  preferences: UserPreferences;
  hydrated: boolean;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

export default function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferences(readUserPreferences());
    setHydrated(true);
  }, []);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      writeUserPreferences(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      hydrated,
      updatePreferences
    }),
    [preferences, hydrated, updatePreferences]
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextValue {
  const context = useContext(UserPreferencesContext);

  if (!context) {
    return {
      preferences: DEFAULT_USER_PREFERENCES,
      hydrated: false,
      updatePreferences: () => undefined
    };
  }

  return context;
}

export function useUserPreferencesOptional(): UserPreferencesContextValue | null {
  return useContext(UserPreferencesContext);
}
