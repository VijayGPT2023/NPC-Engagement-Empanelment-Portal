"use client";

import { useCallback, useState } from "react";

interface GuardedSubmitOptions {
  /** Confirmation message shown before submitting (if set) */
  confirmMessage?: string;
  /** Callback on success */
  onSuccess?: (result: unknown) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Prevents duplicate form submissions by tracking in-flight state.
 * Optionally shows a confirmation dialog before submitting.
 *
 * @returns { submit, isSubmitting, error, reset }
 */
export function useGuardedSubmit(options: GuardedSubmitOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = useCallback(
    async (action: () => Promise<unknown>) => {
      // Prevent duplicate submissions
      if (isSubmitting || submitted) return;

      // Optional confirmation
      if (options.confirmMessage) {
        const confirmed = window.confirm(options.confirmMessage);
        if (!confirmed) return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await action();
        setSubmitted(true);
        options.onSuccess?.(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        options.onError?.(err instanceof Error ? err : new Error(message));
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, submitted, options]
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    setSubmitted(false);
  }, []);

  return { submit, isSubmitting, error, submitted, reset };
}
