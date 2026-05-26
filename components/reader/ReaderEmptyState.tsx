import AppStateCard, { AppStatePage } from "@/components/app/AppStateCard";

export default function ReaderEmptyState() {
  return (
    <AppStatePage>
      <div className="w-full max-w-md">
        <AppStateCard
          icon="reader"
          title="No document open"
          description="Choose a PDF from your library to read and save vocabulary in context."
          action={{ label: "Go to Library", href: "/library" }}
        />
      </div>
    </AppStatePage>
  );
}
