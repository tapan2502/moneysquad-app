import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    const target = (typeof globalThis !== 'undefined'
      ? (globalThis as { frameworkReady?: () => void })
      : undefined) ??
      ((typeof global !== 'undefined' ? (global as { frameworkReady?: () => void }) : undefined));

    target?.frameworkReady?.();
  });
}
