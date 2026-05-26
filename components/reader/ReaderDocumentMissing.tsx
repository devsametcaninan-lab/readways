import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";

export default function ReaderDocumentMissing() {
  return (
    <AppStatePage>
      <div className="w-full max-w-md">
        <AppStateCard
          variant="warning"
          icon="document"
          title="Document not found"
          description="This document isn't in your library, or you may not have access to it. Open another PDF from your library to keep reading."
          action={{ label: "Back to Library", href: "/library" }}
        />
      </div>
    </AppStatePage>
  );
}
