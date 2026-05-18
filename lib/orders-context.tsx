'use client';

import type { Order } from '@/lib/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'skinlar-bozori-orders-v1';

function load(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function demoOrders(): Order[] {
  const now = Date.now();
  return [
    {
      id: 'SB-10492',
      createdAt: now - 1000 * 60 * 60 * 24 * 4,
      totalUsd: 428,
      status: 'yakunlangan',
      items: [{ skinId: 'demo-1', name: 'AK-47 | Redline', qty: 1, priceUsd: 428 }],
    },
    {
      id: 'SB-10418',
      createdAt: now - 1000 * 60 * 60 * 30,
      totalUsd: 1190,
      status: 'qayta ishlanmoqda',
      items: [
        { skinId: 'demo-2', name: 'M4A1-S | Printstream', qty: 1, priceUsd: 890 },
        { skinId: 'demo-3', name: 'USP-S | Kill Confirmed', qty: 1, priceUsd: 300 },
      ],
    },
  ];
}

type OrdersContextValue = {
  orders: Order[];
  addOrder: (o: Order) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const stored = load();
    setOrders(stored.length > 0 ? stored : demoOrders());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((o: Order) => {
    setOrders((prev) => [o, ...prev]);
  }, []);

  const value = useMemo(() => ({ orders, addOrder }), [orders, addOrder]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
