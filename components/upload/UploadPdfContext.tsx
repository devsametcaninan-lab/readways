"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import UploadPdfModal from "./UploadPdfModal";

type UploadPdfContextValue = {
  openUpload: () => void;
  closeUpload: () => void;
};

const UploadPdfContext = createContext<UploadPdfContextValue | null>(null);

export function useUploadPdf() {
  const ctx = useContext(UploadPdfContext);
  if (!ctx) {
    throw new Error("useUploadPdf must be used within UploadPdfProvider");
  }
  return ctx;
}

export function UploadPdfProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openUpload = useCallback(() => setIsOpen(true), []);
  const closeUpload = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ openUpload, closeUpload }), [openUpload, closeUpload]);

  return (
    <UploadPdfContext.Provider value={value}>
      {children}
      <UploadPdfModal open={isOpen} onClose={closeUpload} />
    </UploadPdfContext.Provider>
  );
}
