import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Unified dark / purple “premium” backdrop for Steam economy icons (object-contain inside).
 */
export function SkinImageViewport({ children, className = '' }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#0a0612] ring-1 ring-neon/20 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_45%,rgba(88,28,135,0.35),transparent_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.55))]"
        aria-hidden
      />
      <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}
