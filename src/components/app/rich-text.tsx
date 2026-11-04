/**
 * The Markdown subset the AI uses in answers (bold, lists, headings), rendered as React elements —
 * never as HTML, so an answer can't inject markup. Same rules as the mobile app (src/utils/richText.ts).
 */

type Segment = { text: string; bold: boolean };
type Block = { kind: "paragraph" | "bullet"; marker?: string; segments: Segment[] };

const BULLET = /^[-*•]\s+/;
const NUMBERED = /^(\d+[.)])\s+/;
const HEADING = /^#{1,6}\s+/;

function parseInline(text: string, bold = false): Segment[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index) => ({
      text: part.replace(/\*([^*\s][^*]*?)\*/g, "$1"),
      bold: bold || index % 2 === 1,
    }))
    .filter((segment) => segment.text);
}

export function parseRichText(text: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line || /^(-{3,}|\*{3,})$/.test(line)) continue;

    if (HEADING.test(line)) {
      blocks.push({ kind: "paragraph", segments: parseInline(line.replace(HEADING, ""), true) });
      continue;
    }
    const numbered = line.match(NUMBERED);
    if (numbered) {
      blocks.push({
        kind: "bullet",
        marker: numbered[1],
        segments: parseInline(line.slice(numbered[0].length)),
      });
      continue;
    }
    if (BULLET.test(line)) {
      blocks.push({ kind: "bullet", segments: parseInline(line.replace(BULLET, "")) });
      continue;
    }
    blocks.push({ kind: "paragraph", segments: parseInline(line) });
  }
  return blocks;
}

function Inline({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.bold ? (
          <strong key={i} className="font-semibold">
            {s.text}
          </strong>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

export function RichText({ text }: { text: string }) {
  const blocks = parseRichText(text);
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, i) =>
        block.kind === "bullet" ? (
          <p key={i} className="flex gap-2 pl-1">
            <span aria-hidden className="shrink-0">
              {block.marker ?? "•"}
            </span>
            <span>
              <Inline segments={block.segments} />
            </span>
          </p>
        ) : (
          <p key={i}>
            <Inline segments={block.segments} />
          </p>
        ),
      )}
    </div>
  );
}
