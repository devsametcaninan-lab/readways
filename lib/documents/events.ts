export const DOCUMENTS_UPDATED_EVENT = "readways:documents-updated";

export function notifyDocumentsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DOCUMENTS_UPDATED_EVENT));
}
