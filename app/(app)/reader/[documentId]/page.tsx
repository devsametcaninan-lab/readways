import ReaderDocumentMissing from "@/components/reader/ReaderDocumentMissing";
import ReaderDocumentUnavailable from "@/components/reader/ReaderDocumentUnavailable";
import ReaderView from "@/components/reader/ReaderView";
import { getReaderDocumentForUser } from "@/lib/documents/server";

export default async function ReaderDocumentPage({
  params
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const result = await getReaderDocumentForUser(documentId);

  if (result.kind === "not_found") {
    return <ReaderDocumentMissing documentId={documentId} />;
  }

  if (result.kind === "unavailable") {
    return (
      <ReaderDocumentUnavailable
        documentId={documentId}
        status={result.status}
        failureCode={result.failureCode}
      />
    );
  }

  return <ReaderView document={result.document} />;
}
