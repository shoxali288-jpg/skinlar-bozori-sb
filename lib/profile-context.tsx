'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'skinlar-bozori-profile-v1';

export type Profile = {
  displayName: string;
  steamTradeUrl: string;
  note: string;
};

const defaultProfile: Profile = {
  displayName: 'Oʻyinchi',
  steamTradeUrl: '',
  note: '',
};

function load(): Profile {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      displayName: parsed.displayName || defaultProfile.displayName,
      steamTradeUrl: parsed.steamTradeUrl || '',
      note: parsed.note || '',
    };
  } catch {
    return defaultProfile;
  }
}

type ProfileContextValue = {
  profile: Profile;
  setProfile: (p: Profile) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(defaultProfile);

  useEffect(() => {
    setProfileState(load());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const setProfile = useCallback((p: Profile) => {
    setProfileState(p);
  }, []);

  const value = useMemo(() => ({ profile, setProfile }), [profile, setProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
