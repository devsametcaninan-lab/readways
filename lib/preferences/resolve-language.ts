import type { DocumentLanguage } from "@/lib/language/document-language";
import {
  mapSettingsLanguageToApiPreference,
  resolveFinalExplanationLanguage
} from "@/lib/ai-dictionary/explanation-language";
import type { DefaultExplanationLanguage } from "./types";

export function resolveExplanationLanguage(
  preference: DefaultExplanationLanguage,
  documentLanguage: string | null | undefined
): DocumentLanguage {
  return resolveFinalExplanationLanguage(
    mapSettingsLanguageToApiPreference(preference),
    documentLanguage
  );
}
