// src/components/AdminSyncButton.tsx
import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { useAuth } from "../lib/auth";
import { syncProjects } from "../lib/api";

type ResultItem = {
  language: string;
  status: "ok" | "error";
  syncedCount?: number;
  message?: string;
};

export default function AdminSyncButton({ onComplete }: { onComplete?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [languagesText, setLanguagesText] = useState("javascript,python,java");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Basic guard: only allow when logged in. Replace with role check if you have roles.
  const allowed = !!user;

  const handleOpen = () => {
    setResults(null);
    setError(null);
    setOpen(true);
  };

  const handleRun = async () => {
    if (!allowed) {
      setError("You must be signed in as an admin to run this.");
      return;
    }

    const languages = languagesText.split(",").map((s) => s.trim()).filter(Boolean);
    setRunning(true);
    setResults(null);
    setError(null);

    try {
      const payload = { languages };
      const res = await syncProjects(languages.length ? languages : undefined);
      const backendResults = res?.results || [];
      const mapped = backendResults.map((r: any) => ({
        language: r.language,
        status: r.status,
        syncedCount: r.syncedCount,
        message: r.message,
      }));
      setResults(mapped);
      // notify parent to refetch
      if (onComplete) onComplete();
    } catch (err: any) {
      console.error("Sync error:", err);
      setError(err?.message || "Sync failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div>
        <Button variant="secondary" onClick={handleOpen} disabled={!allowed}>
          Full Sync
        </Button>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} size="md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Trigger Full GitHub Sync</h3>

          {!allowed && (
            <div className="p-3 mb-4 bg-yellow-900/40 text-yellow-200 rounded">Sign in as an admin to run this.</div>
          )}

          <label className="block text-sm text-gray-400 mb-1">Languages (comma separated)</label>
          <input
            value={languagesText}
            onChange={(e) => setLanguagesText(e.target.value)}
            className="w-full mb-3 p-3 rounded bg-[#0b0f14] border border-gray-800/50 text-gray-200"
            placeholder="javascript, typescript, python"
          />

          <div className="flex gap-3 items-center">
            <Button variant="primary" onClick={handleRun} disabled={running || !allowed}>
              {running ? "Running..." : "Start Full Sync"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={running}>
              Close
            </Button>
          </div>

          <div className="mt-4">
            {running && <div className="text-sm text-gray-400">Sync in progress — this may take a while...</div>}

            {error && (
              <div className="mt-3 p-3 bg-red-900/40 text-red-200 rounded text-sm">
                Error: {error}
              </div>
            )}

            {results && (
              <div className="mt-3 space-y-2">
                <div className="text-sm text-gray-400">Results:</div>
                {results.map((r) => (
                  <div key={r.language} className="p-3 bg-[#0b0f14] rounded border border-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-200 font-medium">{r.language}</div>
                      <div className={`text-xs px-2 py-0.5 rounded ${r.status === "ok" ? "bg-green-700/30 text-green-300" : "bg-red-700/30 text-red-300"}`}>
                        {r.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {r.syncedCount !== undefined ? `${r.syncedCount} repos synced` : r.message || "No details"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
