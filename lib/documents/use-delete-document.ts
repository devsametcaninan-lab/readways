"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
import { deleteDocument } from "@/lib/documents/client";
import { notifyDocumentsUpdated } from "@/lib/documents/events";

export function useDeleteDocument() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteDocumentById = useCallback(
    async (documentId: string) => {
      setDeletingId(documentId);

      try {
        const result = await deleteDocument(documentId);

        notifyDocumentsUpdated();

        if (pathname === `/reader/${documentId}`) {
          router.push("/library");
        }

        toast.success("Document deleted");

        if (result.storageWarning) {
          toast.error(result.storageWarning);
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not delete document. Please try again.";
        toast.error(message);
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [pathname, router, toast]
  );

  return {
    deletingId,
    isDeleting: (documentId: string) => deletingId === documentId,
    deleteDocumentById
  };
}
