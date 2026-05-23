"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatFileSize } from "@/lib/format";

type UploadState = "empty" | "selected" | "uploading" | "ready";

type UploadPdfModalProps = {
  open: boolean;
  onClose: () => void;
};

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function UploadPdfModal({ open, onClose }: UploadPdfModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("empty");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState("empty");
    setFile(null);
    setProgress(0);
    setIsDragging(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state !== "uploading") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, state]);

  useEffect(() => {
    if (state !== "uploading") return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const step = prev < 70 ? 8 + Math.random() * 10 : 4 + Math.random() * 6;
        return Math.min(100, Math.round(prev + step));
      });
    }, 220);

    return () => window.clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (state === "uploading" && progress >= 100) {
      const timeout = window.setTimeout(() => setState("ready"), 350);
      return () => window.clearTimeout(timeout);
    }
  }, [state, progress]);

  const handleFile = (next: File) => {
    if (!isPdfFile(next)) {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    setFile(next);
    setState("selected");
    setProgress(0);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) handleFile(picked);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const startUpload = () => {
    if (!file) return;
    setState("uploading");
    setProgress(0);
  };

  const handleOpenReader = () => {
    onClose();
    router.push("/reader/demo");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-pdf-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={state === "uploading" ? undefined : onClose}
        disabled={state === "uploading"}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#12141d] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upload-pdf-title" className="text-xl font-medium tracking-tight text-white md:text-2xl">
              Upload PDF
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Add a document to your library and open it in the reader.
            </p>
          </div>
          {state !== "uploading" && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/[0.12] px-2.5 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
            >
              Close
            </button>
          )}
        </div>

        {state === "ready" ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
              <svg className="h-5 w-5 text-accentSoft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-white">Ready to read</p>
            <p className="mt-2 text-sm text-zinc-400">
              {file?.name} is in your library. Parsing is simulated for now.
            </p>
            <button
              type="button"
              onClick={handleOpenReader}
              className="mt-6 w-full rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
            >
              Open in Reader
            </button>
          </div>
        ) : (
          <>
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                if (state !== "uploading") setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={state === "uploading" ? undefined : onDrop}
              className={`mt-6 rounded-xl border border-dashed px-6 py-10 text-center transition ${
                isDragging
                  ? "border-accent/40 bg-accent/[0.06] shadow-[0_0_32px_rgba(124,140,255,0.12)]"
                  : "border-white/[0.16] bg-[#0e1016] hover:border-white/[0.2]"
              } ${state === "uploading" ? "pointer-events-none opacity-80" : ""}`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03]">
                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-zinc-300">
                {state === "empty" ? "Drag and drop your PDF here" : "Drop a different PDF to replace"}
              </p>
              <p className="mt-1 text-[12px] text-zinc-500">PDF files only · Max 25 MB (mock limit)</p>
              {state !== "uploading" && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.06]"
                >
                  Choose file
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={onInputChange}
                disabled={state === "uploading"}
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-400/90">{error}</p>}

            {file && (
              <div className="mt-4 rounded-xl border border-white/[0.12] bg-[#0e1016] px-4 py-3.5">
                <p className="truncate text-sm font-medium text-zinc-100">{file.name}</p>
                <p className="mt-1 text-[12px] text-zinc-500">{formatFileSize(file.size)}</p>
              </div>
            )}

            {state === "uploading" && (
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
                  <div
                    className="h-full rounded-full bg-accent/80 transition-[width] duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {state === "selected" && (
              <button
                type="button"
                onClick={startUpload}
                className="mt-6 w-full rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
              >
                Start upload
              </button>
            )}

            {state === "empty" && (
              <p className="mt-4 text-center text-[12px] text-zinc-600">
                Your file stays on this device until backend upload is added.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
