"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Throttles an action to prevent rapid repeated execution.
 * Returns [throttledFn, isThrottled].
 */
export function useThrottledAction(
  delayMs = 2000
): [(action: () => Promise<void>) => Promise<void>, boolean] {
  const [isThrottled, setIsThrottled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(
    async (action: () => Promise<void>) => {
      if (isThrottled) return;
      setIsThrottled(true);
      try {
        await action();
      } finally {
        timerRef.current = setTimeout(() => {
          setIsThrottled(false);
        }, delayMs);
      }
    },
    [isThrottled, delayMs]
  );

  return [execute, isThrottled];
}
