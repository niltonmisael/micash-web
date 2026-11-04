"use client";

import { useCallback, useEffect, useState } from "react";

/** Seconds left until `until`; 0 when it has passed. */
export function useCountdown(initialSeconds = 0) {
  const [until, setUntil] = useState(() => (initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : 0));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [until]);

  const start = useCallback((seconds: number) => {
    setNow(Date.now());
    setUntil(Date.now() + seconds * 1000);
  }, []);

  const startUntil = useCallback((date: Date) => {
    setNow(Date.now());
    setUntil(date.getTime());
  }, []);

  return { secondsLeft: Math.max(0, Math.ceil((until - now) / 1000)), start, startUntil };
}

export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
