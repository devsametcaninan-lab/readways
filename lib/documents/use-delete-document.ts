"use client";

import { safeUserFacingMessage } from "@/lib/api/client-error";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/ToastProvider";
import { deleteDocument } from "@/lib/documents/client";
import { notifyDocumentsUpdated } from "@/lib/documents/events";
import { localizeUserMessage } from "@/lib/i18n/localize-user-message";
import { useI18n } from "@/lib/i18n/provider";

export function useDeleteDocument() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { t } = useI18n();
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

        toast.success(t("app.documentDeletedToast"));

        if (result.storageWarning) {
          toast.error(localizeUserMessage(result.storageWarning, t));
        }

        return true;
      } catch (err) {
        toast.error(
          localizeUserMessage(
            safeUserFacingMessage(
              err instanceof Error ? err.message : null,
              t("toast.deleteDocumentFailed")
            ),
            t
          )
        );
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [pathname, router, t, toast]
  );

  return {
    deletingId,
    isDeleting: (documentId: string) => deletingId === documentId,
    deleteDocumentById
  };
}
