'use client';

import { BuyModal } from '@/components/BuyModal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BuyModalProvider } from '@/lib/buy-modal-context';
import { CartProvider } from '@/lib/cart-context';
import { OrdersProvider } from '@/lib/orders-context';
import { ProfileProvider } from '@/lib/profile-context';
import { useCallback, useState, type ReactNode } from 'react';

function SplashGate({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(true);
  const done = useCallback(() => setShow(false), []);

  if (show) return <LoadingScreen onDone={done} />;
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <OrdersProvider>
        <CartProvider>
          <BuyModalProvider>
            <SplashGate>{children}</SplashGate>
            <BuyModal />
          </BuyModalProvider>
        </CartProvider>
      </OrdersProvider>
    </ProfileProvider>
  );
}
