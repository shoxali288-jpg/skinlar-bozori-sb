'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFade(true), 800);
    const t2 = window.setTimeout(onDone, 1200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center gap-6 bg-void transition-opacity duration-500 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative">
        <div className="absolute inset-0 animate-pulseGlow rounded-full bg-neon/20 blur-2xl" />
        <img
          src="/site-logo.jpg"
          alt="Skinlar Bozori SB"
          width={120}
          height={120}
          className="relative h-[120px] w-[120px] animate-pulseGlow rounded-full object-cover shadow-glow"
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium tracking-wide text-white/80">Skinlar Bozori SB</p>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="sb-shimmer h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-neon to-transparent" />
        </div>
      </div>
    </div>
  );
}
