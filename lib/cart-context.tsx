'use client';

import type { CartLine, Skin } from '@/lib/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'skinlar-bozori-cart-v1';

type CartContextValue = {
  lines: CartLine[];
  addToCart: (skin: Skin, qty?: number) => void;
  removeLine: (skinId: string) => void;
  setQty: (skinId: string, qty: number) => void;
  clearCart: () => void;
  totalUsd: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((l) => l?.skin?.id && typeof l.qty === 'number');
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(loadInitial());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addToCart = useCallback((skin: Skin, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.skin.id === skin.id);
      if (i === -1) {
        return [...prev, { skin, qty, addedAt: Date.now() }];
      }
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
      return next;
    });
  }, []);

  const removeLine = useCallback((skinId: string) => {
    setLines((prev) => prev.filter((l) => l.skin.id !== skinId));
  }, []);

  const setQty = useCallback((skinId: string, qty: number) => {
    const q = Math.max(0, Math.min(99, Math.floor(qty)));
    setLines((prev) => {
      if (q === 0) return prev.filter((l) => l.skin.id !== skinId);
      return prev.map((l) => (l.skin.id === skinId ? { ...l, qty: q } : l));
    });
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalUsd = lines.reduce((t, l) => t + l.skin.priceUsd * l.qty, 0);
    const count = lines.reduce((t, l) => t + l.qty, 0);
    return {
      lines,
      addToCart,
      removeLine,
      setQty,
      clearCart,
      totalUsd,
      count,
    };
  }, [lines, addToCart, removeLine, setQty, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
