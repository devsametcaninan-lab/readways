export const ONBOARDING_COPY = {
  welcome: {
    title: "Welcome to ReadWays",
    description:
      "Upload a PDF and learn vocabulary in context — tap words while you read, save what matters, and review with flashcards.",
    primaryCta: "Upload your first PDF",
    dismiss: "Got it"
  },
  libraryEmptyLead:
    "Upload a document and build vocabulary while you read.",
  reader: {
    dismiss: "Got it",
    hints: [
      {
        id: "word",
        text: "Tap a word to see its meaning in context."
      },
      {
        id: "phrase",
        text: "Select a phrase like “come on” to explain it together."
      },
      {
        id: "save",
        text: "Save useful words to review later."
      }
    ] as const
  },
  flashcards: {
    title: "Rate your recall",
    description:
      "Hard brings a card back soon. Good uses the normal schedule. Easy waits longer before you see it again.",
    dismiss: "Got it"
  }
} as const;

export const ONBOARDING_STORAGE_KEY = "readways:onboarding:v1";
