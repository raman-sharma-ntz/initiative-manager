"use client";

import { useState } from "react";

type Props = {
  compact?: boolean;
};

const GoogleExportPanel = ({ compact = false }: Props) => {
  const [destination, setDestination] = useState<"drive" | "sheets">("drive");
  const [fileName, setFileName] = useState("teams-export.xlsx");
  const [spreadsheetTitle, setSpreadsheetTitle] = useState("Teams Export");
  const [folderId, setFolderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleExport = async () => {
    setError("");
    setResult("");
    setLoading(true);

    try {
      const response = await fetch("/api/google/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          fileName,
          spreadsheetTitle,
          folderId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Google export failed.");
      }

      if (destination === "drive") {
        setResult(`Uploaded to Drive: ${payload.file?.webViewLink || payload.file?.id || "success"}`);
      } else {
        setResult(`Created Sheet: ${payload.sheet?.spreadsheetUrl || payload.sheet?.spreadsheetId || "success"}`);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Google export failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white/85 p-4 shadow-[0_14px_35px_rgba(16,32,15,0.08)] md:p-5">
      <p className="mb-2 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">Google Export</p>
      <h3 className={`font-['Bricolage_Grotesque'] tracking-[-0.02em] ${compact ? "text-xl" : "text-2xl"}`}>Drive / Sheets via Clerk OAuth</h3>
      <p className="mt-2 text-sm text-[var(--ink-2)]">
        Uses the signed-in user&apos;s Google OAuth connection from Clerk. If Google is not connected, the API returns a guided error.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select
          className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          value={destination}
          onChange={(event) => setDestination(event.target.value as "drive" | "sheets")}
        >
          <option value="drive">Upload XLSX to Drive</option>
          <option value="sheets">Create Google Sheet</option>
        </select>

        <input
          className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          value={destination === "drive" ? fileName : spreadsheetTitle}
          onChange={(event) => {
            if (destination === "drive") {
              setFileName(event.target.value);
            } else {
              setSpreadsheetTitle(event.target.value);
            }
          }}
          placeholder={destination === "drive" ? "File name" : "Spreadsheet title"}
        />
      </div>

      <input
        className="mt-3 w-full rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
        value={folderId}
        onChange={(event) => setFolderId(event.target.value)}
        placeholder="Optional Drive folder id"
      />

      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="mt-4 w-full rounded-xl border border-black/10 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] disabled:opacity-70"
      >
        {loading ? "Exporting..." : destination === "drive" ? "Upload to Drive" : "Create in Sheets"}
      </button>

      {result ? <p className="mt-3 text-sm text-[var(--brand-strong)]">{result}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
};

export default GoogleExportPanel;
