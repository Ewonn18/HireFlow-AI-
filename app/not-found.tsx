import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Page not found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
