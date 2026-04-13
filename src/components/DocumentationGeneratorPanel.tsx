"use client";

import { useMemo, useState } from "react";
import type { Ticket } from "../types/models";

type Props = {
  tickets: Ticket[];
};

const DocumentationGeneratorPanel = ({ tickets }: Props) => {
  const [title, setTitle] = useState("Implementation Notes");
  const [context, setContext] = useState("");
  const [format, setFormat] = useState<"markdown" | "html" | "json" | "text">("markdown");
  const [ticketId, setTicketId] = useState("");
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [driveFolderId, setDriveFolderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const ticketOptions = useMemo(() => tickets.slice(0, 50), [tickets]);

  const handleGenerate = async () => {
    setError("");
    setOutput("");
    setLoading(true);

    try {
      const response = await fetch("/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          context,
          format,
          ticketId,
          uploadToDrive,
          driveFolderId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Documentation generation failed.");
      }

      setOutput(JSON.stringify(payload, null, 2));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Documentation generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white/85 p-4 shadow-[0_14px_35px_rgba(16,32,15,0.08)] md:p-5">
      <p className="mb-2 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">AI Documentation</p>
      <h3 className="font-['Bricolage_Grotesque'] text-2xl tracking-[-0.02em]">Generate docs in any format</h3>
      <p className="mt-2 text-sm text-[var(--ink-2)]">
        Generate markdown, html, json, or plain text. Optionally attach output to a ticket and upload to Google Drive.
      </p>

      <div className="mt-4 grid gap-3">
        <input
          className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Doc title"
        />
        <textarea
          className="min-h-32 rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Context, acceptance criteria, technical constraints, links, role-specific notes"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <select className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={format} onChange={(event) => setFormat(event.target.value as "markdown" | "html" | "json" | "text") }>
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="text">Text</option>
          </select>
          <select className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]" value={ticketId} onChange={(event) => setTicketId(event.target.value)}>
            <option value="">No ticket attachment</option>
            {ticketOptions.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>{ticket.title}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--ink-2)]">
          <input type="checkbox" checked={uploadToDrive} onChange={(event) => setUploadToDrive(event.target.checked)} />
          Upload generated documentation to Google Drive
        </label>
        {uploadToDrive ? (
          <input
            className="rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            value={driveFolderId}
            onChange={(event) => setDriveFolderId(event.target.value)}
            placeholder="Optional Drive folder id"
          />
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 w-full rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] disabled:opacity-70"
      >
        {loading ? "Generating..." : "Generate Documentation"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {output ? <pre className="mt-3 overflow-x-auto rounded-xl bg-[#0f1710] p-4 text-xs text-white/85">{output}</pre> : null}
    </section>
  );
};

export default DocumentationGeneratorPanel;
