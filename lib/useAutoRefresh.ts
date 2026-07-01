import { useEffect, useRef } from 'react';

/**
 * Polls a callback every `intervalMs` ms AND on window focus.
 * Works with Next.js + Vercel — no WebSockets needed.
 */
export function useAutoRefresh(callback: () => void, intervalMs = 15000) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    // Run immediately on mount
    cbRef.current();

    // Poll on interval
    const id = setInterval(() => cbRef.current(), intervalMs);

    // Also refresh on tab focus
    const onFocus = () => cbRef.current();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [intervalMs]);
}
