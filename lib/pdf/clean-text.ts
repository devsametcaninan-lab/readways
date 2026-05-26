/**
 * Normalize extracted PDF text: whitespace, line breaks, and broken encoding artifacts.
 */
export function cleanPageText(text: string): string {
  let value = text;

  value = value.replace(/\u0000/g, "");
  value = value.replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");
  value = value.replace(/\uFFFD/g, " ");
  value = value.replace(/\u00AD/g, "");
  value = value.replace(/([^\S\n]+)/g, " ");
  value = value.replace(/ *\n */g, "\n");
  value = value.replace(/\n{3,}/g, "\n\n");

  return value.trim();
}

export function cleanDocumentText(text: string): string {
  let value = cleanPageText(text);

  value = value.replace(/\r\n/g, "\n");
  value = value.replace(/\r/g, "\n");
  value = value.replace(/[ \t]+\n/g, "\n");
  value = value.replace(/\n[ \t]+/g, "\n");
  value = value.replace(/\n{3,}/g, "\n\n");
  value = value.replace(/([^\S\n]{2,})/g, " ");

  return value.trim();
}

export function countMeaningfulCharacters(text: string): number {
  return text.replace(/\s/g, "").length;
}

export function letterRatio(text: string): number {
  const compact = text.replace(/\s/g, "");
  if (!compact) {
    return 0;
  }

  const letters = (compact.match(/[\p{L}\p{N}]/gu) ?? []).length;
  return letters / compact.length;
}
