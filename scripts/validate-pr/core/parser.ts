import { slugifySectionTitle } from "./utils";
import type { ParsedPrBody, ParsedSection } from "./types";

const SECTION_HEADING_PATTERN = /^##\s+(.+)$/m;

export function parsePrBody(raw: string): ParsedPrBody {
  const normalized = raw.replace(/\r\n/g, "\n");
  const hasHtmlComments = /<!--[\s\S]*?-->/.test(normalized);

  if (!SECTION_HEADING_PATTERN.test(normalized)) {
    return {
      sections: [],
      hasHtmlComments,
      raw: normalized,
    };
  }

  const parts = normalized.split(/^##\s+/m).filter(Boolean);
  const sections: ParsedSection[] = parts.map((part) => {
    const newlineIndex = part.indexOf("\n");
    const title = newlineIndex === -1 ? part.trim() : part.slice(0, newlineIndex).trim();
    const body = newlineIndex === -1 ? "" : part.slice(newlineIndex + 1);
    const trimmedBody = body.replace(/^\n/, "").replace(/\n$/, "");

    return {
      id: slugifySectionTitle(title),
      title,
      body: trimmedBody,
      raw: `## ${title}\n${trimmedBody}`,
    };
  });

  return {
    sections,
    hasHtmlComments,
    raw: normalized,
  };
}
