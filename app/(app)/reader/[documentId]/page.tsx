import StoredReaderPage from "@/components/reader/StoredReaderPage";

export default function ReaderDocumentPage({
  params
}: {
  params: Promise<{ documentId: string }>;
}) {
  return <StoredReaderPage params={params} />;
}
