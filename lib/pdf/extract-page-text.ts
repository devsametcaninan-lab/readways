type PdfTextItem = {
  str?: string;
  transform?: number[];
};

type LayoutTextItem = {
  str: string;
  transform?: number[];
};

function readItemText(item: PdfTextItem): string {
  if (typeof item.str !== "string") {
    return "";
  }

  return item.str;
}

function sortTextItems(items: LayoutTextItem[]): LayoutTextItem[] {
  return [...items].sort((left, right) => {
    const leftY = left.transform?.[5] ?? 0;
    const rightY = right.transform?.[5] ?? 0;
    const yDelta = rightY - leftY;

    if (Math.abs(yDelta) > 4) {
      return yDelta;
    }

    const leftX = left.transform?.[4] ?? 0;
    const rightX = right.transform?.[4] ?? 0;
    return leftX - rightX;
  });
}

export function textItemsToPageText(items: unknown[]): string {
  const textItems: LayoutTextItem[] = [];

  for (const raw of items) {
    if (typeof raw !== "object" || raw === null) {
      continue;
    }

    const item = raw as PdfTextItem;
    const str = readItemText(item);
    if (!str) {
      continue;
    }

    textItems.push({ str, transform: item.transform });
  }

  if (textItems.length === 0) {
    return "";
  }

  const sorted = sortTextItems(textItems);
  const parts: string[] = [];
  let previousY: number | null = null;

  for (const item of sorted) {
    const currentY = item.transform?.[5] ?? 0;

    if (previousY !== null && Math.abs(previousY - currentY) > 8 && parts.length > 0) {
      const last = parts[parts.length - 1];
      if (!last.endsWith("\n")) {
        parts.push("\n");
      }
    }

    parts.push(item.str);
    previousY = currentY;
  }

  return parts.join(" ").replace(/\s+\n\s+/g, "\n").replace(/\s+/g, " ").trim();
}
