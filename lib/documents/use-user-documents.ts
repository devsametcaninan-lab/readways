"use client";

import { useCallback, useEffect, useState } from "react";
import { listUserDocuments } from "./client";
import { DOCUMENTS_UPDATED_EVENT } from "./events";
import type { DocumentListItem } from "./types";

export function useUserDocuments(limit?: number) {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rows = await listUserDocuments(limit);
      setDocuments(rows);
    } catch (err) {
      setDocuments([]);
      setError(err instanceof Error ? err.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onUpdated = () => {
      load();
    };

    window.addEventListener(DOCUMENTS_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(DOCUMENTS_UPDATED_EVENT, onUpdated);
  }, [load]);

  return { documents, loading, error, reload: load };
}
