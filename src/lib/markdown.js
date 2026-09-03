/**
 * Minimal, dependency-free Markdown renderer (safe subset).
 *
 * Supports the subset used by lesson files:
 *   headings (#..####), paragraphs, **bold**, *italic*, `inline code`,
 *   fenced code blocks (```), unordered/ordered lists, blockquotes, links,
 *   horizontal rules.
 *
 * All HTML in the source is escaped before rendering, so lesson files
 * cannot inject markup. Not a full CommonMark implementation — by design.
 */

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function inline(text) {
  // Pull inline code out first so its content survives later transforms.
  const codes = [];
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });

  out = out
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    );

  return out.replace(/\u0000(\d+)\u0000/g, (_, index) => `<code>${codes[Number(index)]}</code>`);
}

/** Render Markdown to an HTML string. */
export function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let listTag = null;

  const closeList = () => {
    if (listTag) {
      html.push(`</${listTag}>`);
      listTag = null;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      closeList();
      i += 1;
      continue;
    }

    // Fenced code block.
    if (line.startsWith('```')) {
      closeList();
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence
      html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    // Headings.
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // Lists.
    const unordered = line.match(/^\s*[-*]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (unordered || ordered) {
      const tag = unordered ? 'ul' : 'ol';
      if (listTag !== tag) {
        closeList();
        html.push(`<${tag}>`);
        listTag = tag;
      }
      html.push(`<li>${inline((unordered ?? ordered)[1])}</li>`);
      i += 1;
      continue;
    }

    // Blockquote.
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      i += 1;
      continue;
    }

    // Horizontal rule.
    if (/^\s*([-*_]){3,}\s*$/.test(line)) {
      closeList();
      html.push('<hr />');
      i += 1;
      continue;
    }

    // Paragraph.
    closeList();
    html.push(`<p>${inline(line)}</p>`);
    i += 1;
  }

  closeList();
  return html.join('\n');
}
