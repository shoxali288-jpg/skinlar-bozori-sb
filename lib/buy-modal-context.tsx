'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type BuyModalContextValue = {
  open: boolean;
  openBuyModal: () => void;
  closeBuyModal: () => void;
};

const BuyModalContext = createContext<BuyModalContextValue | null>(null);

export function BuyModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openBuyModal = useCallback(() => setOpen(true), []);
  const closeBuyModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openBuyModal, closeBuyModal }),
    [open, openBuyModal, closeBuyModal],
  );

  return <BuyModalContext.Provider value={value}>{children}</BuyModalContext.Provider>;
}

export function useBuyModal() {
  const ctx = useContext(BuyModalContext);
  if (!ctx) throw new Error('useBuyModal must be used within BuyModalProvider');
  return ctx;
}
