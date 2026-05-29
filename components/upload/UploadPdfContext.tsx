"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const openUpload = useCallback(() => setIsOpen(true), []);
  const closeUpload = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!pathname.startsWith("/library")) {
      return;
    }

    if (searchParams.get("upload") !== "1") {
      return;
    }

    setIsOpen(true);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("upload");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const value = useMemo(() => ({ openUpload, closeUpload }), [openUpload, closeUpload]);

  return (
    <UploadPdfContext.Provider value={value}>
      {children}
      <UploadPdfModal open={isOpen} onClose={closeUpload} />
    </UploadPdfContext.Provider>
  );
}
