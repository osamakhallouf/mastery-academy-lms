"use client";

/**
 * Segment-level error boundary. Shows a generic message to users;
 * internal error details are never exposed. Logging is server-side only.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-semibold text-slate-800">
        Something went wrong
      </h2>
      <p className="max-w-md text-center text-sm text-slate-600">
        We couldn’t complete your request. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}
