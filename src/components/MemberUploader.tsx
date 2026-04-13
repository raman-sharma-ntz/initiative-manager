"use client";

import { useState } from "react";
import { bulkUploadMembersAction } from "../app/admin/members/member-actions";
import { AppUser } from "../types/models";

const MemberUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Partial<AppUser>[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const parsedData = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const member: any = {};
        headers.forEach((header, i) => {
          if (header === "skills") {
            member[header] = values[i] ? values[i].split(";").map(s => s.trim()) : [];
          } else {
            member[header] = values[i];
          }
        });
        return member;
      });
      
      setPreview(parsedData);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    setIsUploading(true);
    setMessage(null);

    const result = await bulkUploadMembersAction(preview);
    
    setIsUploading(false);
    if (result.success) {
      setMessage({ type: "success", text: result.message || "Upload successful!" });
      setPreview([]);
      setFile(null);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to upload members." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-dashed border-black/10 bg-white/50 p-8 text-center transition-colors hover:border-[var(--brand)]/50">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="member-csv-upload"
        />
        <label
          htmlFor="member-csv-upload"
          className="cursor-pointer inline-flex flex-col items-center"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--ink-1)]">
            {file ? file.name : "Select CSV Team List"}
          </span>
          <p className="mt-1 text-xs text-[var(--ink-2)]">Expected columns: name, email, role, department, skills (semi-colon separated)</p>
        </label>
      </div>

      {preview.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-[0_12px_30px_rgba(16,32,15,0.06)]">
          <div className="px-6 py-4 border-b border-black/5 bg-white/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--ink-1)]">Preview ({preview.length} members)</h3>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Import to Directory"}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-black/5">
                <tr>
                  <th className="px-6 py-3 font-semibold text-[var(--ink-2)]">Name</th>
                  <th className="px-6 py-3 font-semibold text-[var(--ink-2)]">Email</th>
                  <th className="px-6 py-3 font-semibold text-[var(--ink-2)]">Dept</th>
                  <th className="px-6 py-3 font-semibold text-[var(--ink-2)]">Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {preview.map((m, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 text-[var(--ink-1)] whitespace-nowrap">{m.name}</td>
                    <td className="px-6 py-3 text-[var(--ink-2)] whitespace-nowrap">{m.email}</td>
                    <td className="px-6 py-3 text-[var(--ink-2)] whitespace-nowrap">{m.department}</td>
                    <td className="px-6 py-3 font-mono text-[10px] text-[var(--ink-3)]">
                      {m.skills?.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {message && (
        <div className={`rounded-xl p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default MemberUploader;
