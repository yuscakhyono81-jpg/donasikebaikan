"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-red-50 border border-red-200 rounded-2xl p-6">
        <h2 className="font-bold text-red-700 text-lg mb-3">Server Error — Detail Debug</h2>
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold text-red-600">Message:</p>
            <pre className="bg-red-100 rounded p-2 text-xs text-red-800 whitespace-pre-wrap mt-1">{error.message}</pre>
          </div>
          {error.digest && (
            <div>
              <p className="font-semibold text-red-600">Digest:</p>
              <pre className="bg-red-100 rounded p-2 text-xs text-red-800 mt-1">{error.digest}</pre>
            </div>
          )}
          <div>
            <p className="font-semibold text-red-600">Stack:</p>
            <pre className="bg-red-100 rounded p-2 text-xs text-red-800 whitespace-pre-wrap mt-1 max-h-48 overflow-auto">{error.stack}</pre>
          </div>
        </div>
        <button
          onClick={reset}
          className="mt-4 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
