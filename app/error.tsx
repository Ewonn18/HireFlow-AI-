"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error in production
    if (process.env.NODE_ENV === "production") {
      // You can send to external error tracking service here (e.g., Sentry)
      console.error("Application error:", error);
    } else {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
          500
        </h1>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
