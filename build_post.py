#!/usr/bin/env python3
"""
build_post.py - Convert a Markdown blog post to the site's HTML format.

Usage:
    python build_post.py path/to/post.md

Writes index.html in the same directory as the input file.

Markdown format
===============

Frontmatter (between --- markers):
    title, date, tagline, description, og_description

Body:
    Standard Markdown: headings, paragraphs, bold, italic, links, lists,
    fenced code blocks, images, tables.

    ## headings become <section> boundaries with IDs.
    Add {toc_subsections} to a ## heading to include that section's
    ### entries in the sidebar TOC.

Extensions:
    ^[text]           Sidenote (margin note on wide screens)
    $...$             Inline math (MathJax)
    $$...$$           Display math (MathJax)
    ## heading {#id}  Assign an explicit reference ID to a section heading
    !label[id]{text}  Label the next image, table, or fenced code block, with optional caption
    !ref[id]          Reference a labeled figure/table/code block or anchored section
    [text](#refId)    Citation link (dotted underline, hover popover)
    Raw HTML lines    Passed through unchanged

References block (anywhere in the body):
    ```references
    [
      {"id": "mamba", "author": "Gu, Dao", "year": "2024",
       "title": "Mamba", "url": "https://arxiv.org/abs/..."}
    ]
    ```

Extra head content (optional, in frontmatter area):
    ```head
    <script src="https://d3js.org/d3.v6.min.js"></script>
    ```
"""

import sys
import os
import re
import json


# ── Frontmatter & special blocks ────────────────────────────────────────────

REF_ID_PATTERN = r'[A-Za-z0-9_:-]+'
BLOCK_LABEL_RE = re.compile(r'^!label\[(' + REF_ID_PATTERN + r')\](?:\{(.*)\})?$')
BLOCK_REF_RE = re.compile(r'!ref\[(' + REF_ID_PATTERN + r')\]')

def parse_frontmatter(text):
    """Extract frontmatter dict and body from the full text."""
    if not text.startswith('---'):
        return {}, text
    end = text.index('---', 3)
    fm_text = text[3:end].strip()
    body = text[end + 3:].strip()
    meta = {}
    for line in fm_text.splitlines():
        if ':' in line:
            key, _, val = line.partition(':')
            meta[key.strip()] = val.strip()
    return meta, body


def extract_fenced(text, label):
    """Extract a fenced block like ```label ... ``` and return (content, remaining_text)."""
    pattern = r'```' + re.escape(label) + r'[ \t]*\n(.*?\n)```'
    m = re.search(pattern, text, re.DOTALL)
    if m:
        content = m.group(1).strip()
        text = text[:m.start()].rstrip('\n') + text[m.end():]
        return content, text
    return None, text


def html_escape(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def html_attr_escape(text):
    return html_escape(text).replace('"', '&quot;')


def parse_block_label(text):
    m = BLOCK_LABEL_RE.match(text)
    if not m:
        return None
    return {
        'id': m.group(1),
        'caption': m.group(2),
    }


def parse_heading_markers(heading, allow_toc_subsections=False):
    """Parse trailing heading markers like {#id} and {toc_subsections}."""
    heading_id = None
    toc_subsections = None
    text = heading.rstrip()

    while True:
        matched = False

        if allow_toc_subsections:
            m = re.search(r'\s*\{toc_subsections(?:\s*=\s*(true|false))?\}\s*$',
                          text, flags=re.IGNORECASE)
            if m:
                flag_raw = m.group(1)
                toc_subsections = True if flag_raw is None else flag_raw.lower() == 'true'
                text = text[:m.start()].rstrip()
                matched = True
                continue

        m = re.search(r'\s*\{#(' + REF_ID_PATTERN + r')\}\s*$', text)
        if m:
            heading_id = m.group(1)
            text = text[:m.start()].rstrip()
            matched = True
            continue

        if not matched:
            break

    return text, heading_id, toc_subsections


# ── Protection: keep math & code from being mangled ─────────────────────────

def protect(text):
    """Replace math, inline code, and code blocks with placeholders."""
    blocks = []

    def save(m):
        raw = m.group(0)
        if raw.startswith('```'):
            blocks.append({'kind': 'code_fence', 'raw': raw, 'label': None, 'caption': None})
        elif raw.startswith('`') and raw.endswith('`'):
            blocks.append({'kind': 'inline_code', 'raw': raw})
        else:
            blocks.append({'kind': 'math', 'raw': raw})
        return '\x00P%d\x00' % (len(blocks) - 1)

    # Fenced code blocks (``` at start of line)
    text = re.sub(r'^```[^\n]*\n.*?^```[ \t]*$', save, text,
                  flags=re.MULTILINE | re.DOTALL)
    # Display math $$...$$
    text = re.sub(r'\$\$.*?\$\$', save, text, flags=re.DOTALL)
    # Inline math $...$
    text = re.sub(r'(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)', save, text)
    # Inline code `...`
    text = re.sub(r'`([^`\n]+)`', save, text)

    return text, blocks


def restore(html, blocks):
    """Put protected blocks back, converting code fences to <pre><code>."""
    for i, block in enumerate(blocks):
        ph = '\x00P%d\x00' % i
        raw = block['raw']
        if raw.startswith('```'):
            lines = raw.split('\n')
            info = lines[0][3:].strip()
            code = '\n'.join(lines[1:-1])
            # Escape HTML inside code
            code = html_escape(code)
            cls = ' class="language-%s"' % info if info else ''
            code_html = '<pre><code%s>%s</code></pre>' % (cls, code)
            label = block.get('label')
            if label:
                caption_text = '__BLOCK_REF__%s__' % label
                custom_caption = block.get('caption')
                if custom_caption:
                    caption_text += ': ' + inline(custom_caption)
                replacement = (
                    '<div class="code-chunk" id="%s" data-block-kind="code">'
                    '%s<p class="code-caption">%s</p></div>'
                ) % (label, code_html, caption_text)
            else:
                replacement = code_html
        elif raw.startswith('`') and raw.endswith('`'):
            inner = raw[1:-1]
            inner = html_escape(inner)
            replacement = '<code>%s</code>' % inner
        else:
            replacement = raw  # math — pass through as-is
        html = html.replace(ph, replacement)
    return html


# ── Inline Markdown ─────────────────────────────────────────────────────────

def _convert_sidenotes(text):
    """Convert sidenotes ^[...], supporting nested [] (e.g. links)."""
    out = []
    i = 0

    while i < len(text):
        if text.startswith('^[', i):
            j = i + 2
            depth = 1
            while j < len(text):
                if text[j] == '[':
                    depth += 1
                elif text[j] == ']':
                    depth -= 1
                    if depth == 0:
                        break
                j += 1

            if depth == 0:
                inner = text[i + 2:j]
                inner_html = inline(inner, allow_sidenotes=False, escape_amp=False)
                out.append('<span class="sidenote">%s</span>' % inner_html)
                i = j + 1
                continue

        out.append(text[i])
        i += 1

    return ''.join(out)


def inline(text, allow_sidenotes=True, escape_amp=True):
    """Convert inline Markdown to HTML."""
    # HTML-escape plain text (but not Markdown syntax chars)
    if escape_amp:
        text = text.replace('&', '&amp;')
    # Sidenotes: ^[text]
    if allow_sidenotes:
        text = _convert_sidenotes(text)
    # Links: [text](url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    # Bold: **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Italic: *text*
    text = re.sub(r'(?<!\w)\*(.+?)\*(?!\w)', r'<em>\1</em>', text)
    return text


# ── Block-level Markdown ────────────────────────────────────────────────────

def placeholder_index(text):
    m = re.match(r'^\x00P(\d+)\x00$', text)
    return int(m.group(1)) if m else None


def split_table_row(line):
    """Split a pipe-table row into cells, honoring escaped pipes."""
    row = line.strip()
    if '|' not in row:
        return None
    if row.startswith('|'):
        row = row[1:]
    if row.endswith('|'):
        row = row[:-1]

    cells = []
    current = []
    i = 0
    while i < len(row):
        if row[i] == '\\' and i + 1 < len(row) and row[i + 1] == '|':
            current.append('|')
            i += 2
            continue
        if row[i] == '|':
            cells.append(''.join(current).strip())
            current = []
            i += 1
            continue
        current.append(row[i])
        i += 1
    cells.append(''.join(current).strip())
    return cells


def parse_table_alignments(line):
    """Parse a Markdown table separator row into per-column alignments."""
    cells = split_table_row(line)
    if not cells:
        return None

    alignments = []
    for cell in cells:
        if not re.match(r'^:?-{3,}:?$', cell):
            return None
        if cell.startswith(':') and cell.endswith(':'):
            alignments.append('center')
        elif cell.endswith(':'):
            alignments.append('right')
        else:
            alignments.append('left')
    return alignments


def table_align_attr(alignment):
    if alignment == 'left':
        return ''
    return ' style="text-align: %s;"' % alignment


def blocks(text, protected_blocks):
    """Convert block-level Markdown to HTML."""
    lines = text.split('\n')
    out = []
    para = []
    i = 0
    pending_label = None

    def flush():
        if para:
            content = inline(' '.join(para))
            out.append('      <p>%s</p>' % content)
            para.clear()

    def flush_pending_label():
        nonlocal pending_label
        if pending_label is not None:
            if pending_label.get('caption') is not None:
                out.append('      <p>!label[%s]{%s}</p>' % (pending_label['id'], pending_label['caption']))
            else:
                out.append('      <p>!label[%s]</p>' % pending_label['id'])
            pending_label = None

    while i < len(lines):
        line = lines[i]
        s = line.strip()

        label = parse_block_label(s)
        if label:
            flush()
            if pending_label is not None:
                flush_pending_label()
            pending_label = label
            i += 1
            continue

        # Blank line → end paragraph
        if not s:
            flush()
            i += 1
            continue

        # Protected block alone on a line (display math or code block)
        if re.match(r'^\x00P\d+\x00$', s):
            flush()
            block_idx = placeholder_index(s)
            block = protected_blocks[block_idx]
            if pending_label and block.get('kind') == 'code_fence':
                block['label'] = pending_label['id']
                block['caption'] = pending_label.get('caption')
                pending_label = None
            elif pending_label:
                flush_pending_label()
            out.append('      ' + s)
            i += 1
            continue

        # Raw HTML passthrough
        if s.startswith('<'):
            flush()
            flush_pending_label()
            out.append('      ' + s)
            i += 1
            continue

        # h2
        if s.startswith('## ') and not s.startswith('### '):
            flush()
            flush_pending_label()
            heading, heading_id, toc_subsections = parse_heading_markers(
                s[3:], allow_toc_subsections=True
            )
            attrs = ''
            if toc_subsections is not None:
                attrs += ' data-toc-subsections="%s"' % ('true' if toc_subsections else 'false')
            if heading_id:
                attrs += ' data-section-id="%s" data-ref-text="%s"' % (
                    heading_id, html_attr_escape(heading)
                )
            out.append('      <h2%s>%s</h2>' % (attrs, inline(heading)))
            i += 1
            continue

        # h3
        if s.startswith('### '):
            flush()
            flush_pending_label()
            heading, heading_id, _ = parse_heading_markers(s[4:])
            attrs = ''
            if heading_id:
                attrs = ' id="%s" data-block-kind="section" data-ref-text="%s"' % (
                    heading_id, html_attr_escape(heading)
                )
            out.append('      <h3%s>%s</h3>' % (attrs, inline(heading)))
            i += 1
            continue

        # h4
        if s.startswith('#### '):
            flush()
            flush_pending_label()
            heading, heading_id, _ = parse_heading_markers(s[5:])
            attrs = ''
            if heading_id:
                attrs = ' id="%s" data-block-kind="section" data-ref-text="%s"' % (
                    heading_id, html_attr_escape(heading)
                )
            out.append('      <h4%s>%s</h4>' % (attrs, inline(heading)))
            i += 1
            continue

        # h5
        if s.startswith('##### '):
            flush()
            flush_pending_label()
            heading, heading_id, _ = parse_heading_markers(s[6:])
            attrs = ''
            if heading_id:
                attrs = ' id="%s" data-block-kind="section" data-ref-text="%s"' % (
                    heading_id, html_attr_escape(heading)
                )
            out.append('      <h5%s>%s</h5>' % (attrs, inline(heading)))
            i += 1
            continue

        # h6
        if s.startswith('###### '):
            flush()
            flush_pending_label()
            heading, heading_id, _ = parse_heading_markers(s[7:])
            attrs = ''
            if heading_id:
                attrs = ' id="%s" data-block-kind="section" data-ref-text="%s"' % (
                    heading_id, html_attr_escape(heading)
                )
            out.append('      <h6%s>%s</h6>' % (attrs, inline(heading)))
            i += 1
            continue

        # Horizontal rule
        if s in ('---', '***', '___'):
            flush()
            flush_pending_label()
            out.append('      <hr>')
            i += 1
            continue

        # Pipe table
        if i + 1 < len(lines):
            header_cells = split_table_row(s)
            alignments = parse_table_alignments(lines[i + 1].strip())
            if (
                header_cells is not None and
                len(header_cells) > 1 and
                alignments is not None and
                len(header_cells) == len(alignments)
            ):
                flush()
                table_wrapper_indent = '      '
                table_indent = '        '
                if pending_label:
                    out.append(
                        '      <div class="table-block" id="%s" data-block-kind="table">'
                        % pending_label['id']
                    )
                    table_wrapper_indent = '        '
                    table_indent = '          '
                out.append('%s<div class="table-wrapper">' % table_wrapper_indent)
                out.append('%s<table>' % table_indent)
                out.append('%s<thead>' % table_indent)
                out.append('%s<tr>' % table_indent)
                for cell, alignment in zip(header_cells, alignments):
                    out.append('%s<th%s>%s</th>' % (
                        table_indent + '  ',
                        table_align_attr(alignment), inline(cell)
                    ))
                out.append('%s</tr>' % table_indent)
                out.append('%s</thead>' % table_indent)
                out.append('%s<tbody>' % table_indent)
                i += 2
                while i < len(lines):
                    row_cells = split_table_row(lines[i].strip())
                    if row_cells is None or len(row_cells) != len(alignments):
                        break
                    out.append('%s<tr>' % table_indent)
                    for cell, alignment in zip(row_cells, alignments):
                        out.append('%s<td%s>%s</td>' % (
                            table_indent + '  ',
                            table_align_attr(alignment), inline(cell)
                        ))
                    out.append('%s</tr>' % table_indent)
                    i += 1
                out.append('%s</tbody>' % table_indent)
                out.append('%s</table>' % table_indent)
                out.append('%s</div>' % table_wrapper_indent)
                if pending_label:
                    raw_caption = pending_label.get('caption')
                    caption_prefix = '__BLOCK_REF__%s__' % pending_label['id']
                    if raw_caption:
                        out.append(
                            '        <p class="plot-caption">%s: %s</p>'
                            % (caption_prefix, inline(raw_caption))
                        )
                    else:
                        out.append('        <p class="plot-caption">%s</p>' % caption_prefix)
                    out.append('      </div>')
                    pending_label = None
                continue

        # Image on its own line: ![caption](src)  or  ![caption](src){width=400 height=260}
        m = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)(\{([^}]+)\})?$', s)
        if m:
            flush()
            cap, src, attrs_raw = m.group(1), m.group(2), m.group(4)
            img_attrs = ''
            # Standalone figures should start below any active right-floated sidenote.
            figure_clear_attr = ' style="clear: right;"'
            if attrs_raw:
                # Parse key=value pairs like width=400 height=260 style="..."
                for pair in re.findall(r'(\w+)=(?:"([^"]+)"|(\S+))', attrs_raw):
                    key = pair[0]
                    val = pair[1] if pair[1] else pair[2]
                    img_attrs += ' %s="%s"' % (key, val)
            if pending_label:
                out.append(
                    '      <div class="figure-block" id="%s" data-block-kind="figure"%s>'
                    % (pending_label['id'], figure_clear_attr)
                )
                out.append('        <div class="plot-container">')
                out.append('          <div class="plot-background-1">')
                out.append('            <img src="%s" alt="%s"%s>' % (src, cap, img_attrs))
                out.append('          </div>')
                out.append('        </div>')
                raw_caption = pending_label.get('caption')
                if raw_caption is None:
                    raw_caption = cap
                caption_text = inline(raw_caption) if raw_caption else ''
                caption_prefix = '__BLOCK_REF__%s__' % pending_label['id']
                if caption_text:
                    out.append('        <p class="plot-caption">%s: %s</p>' % (caption_prefix, caption_text))
                else:
                    out.append('        <p class="plot-caption">%s</p>' % caption_prefix)
                out.append('      </div>')
                pending_label = None
            else:
                out.append('      <div class="plot-container"%s>' % figure_clear_attr)
                out.append('        <div class="plot-background-1">')
                out.append('          <img src="%s" alt="%s"%s>' % (src, cap, img_attrs))
                out.append('        </div>')
                out.append('      </div>')
                if cap:
                    out.append('      <p class="plot-caption">%s</p>' % inline(cap))
            i += 1
            continue

        # Unordered list
        if re.match(r'^[-*]\s', s):
            flush()
            flush_pending_label()
            out.append('      <ul>')
            while i < len(lines) and re.match(r'^\s*[-*]\s', lines[i]):
                item = re.sub(r'^\s*[-*]\s', '', lines[i])
                out.append('        <li>%s</li>' % inline(item.strip()))
                i += 1
            out.append('      </ul>')
            continue

        # Ordered list
        if re.match(r'^\d+\.\s', s):
            flush()
            flush_pending_label()
            out.append('      <ol>')
            while i < len(lines) and re.match(r'^\s*\d+\.\s', lines[i]):
                item = re.sub(r'^\s*\d+\.\s', '', lines[i])
                out.append('        <li>%s</li>' % inline(item.strip()))
                i += 1
            out.append('      </ol>')
            continue

        # Otherwise: paragraph text
        flush_pending_label()
        para.append(s)
        i += 1

    flush()
    flush_pending_label()
    return '\n'.join(out)


def resolve_block_references(html):
    """Turn labeled blocks and anchored sections into links."""
    labels = {}
    figure_count = 0
    table_count = 0
    code_count = 0
    protected_segments = []

    for m in re.finditer(r'<[^>]+\bdata-block-kind="(figure|table|code|section)"[^>]*>', html):
        tag = m.group(0)
        kind_match = re.search(r'\bdata-block-kind="(figure|table|code|section)"', tag)
        id_match = re.search(r'\bid="([^"]+)"', tag)
        ref_text_match = re.search(r'\bdata-ref-text="([^"]*)"', tag)
        if not kind_match or not id_match:
            continue
        label = id_match.group(1)
        kind = kind_match.group(1)
        ref_text = ref_text_match.group(1) if ref_text_match else None
        if label in labels:
            print('Warning: duplicate block label: %s' % label, file=sys.stderr)
            continue
        if kind == 'figure':
            figure_count += 1
            labels[label] = 'Figure %d' % figure_count
        elif kind == 'table':
            table_count += 1
            labels[label] = 'Table %d' % table_count
        elif kind == 'code':
            code_count += 1
            labels[label] = 'Code chunk %d' % code_count
        else:
            labels[label] = ref_text or label

    for label, ref_text in labels.items():
        html = html.replace('__BLOCK_REF__%s__' % label, ref_text)

    def protect_segment(m):
        protected_segments.append(m.group(0))
        return '\x00R%d\x00' % (len(protected_segments) - 1)

    html = re.sub(r'<pre><code\b[^>]*>.*?</code></pre>', protect_segment, html, flags=re.DOTALL)
    html = re.sub(r'<code>.*?</code>', protect_segment, html, flags=re.DOTALL)

    def replace_ref(m):
        label = m.group(1)
        ref_text = labels.get(label)
        if ref_text is None:
            print('Warning: unresolved block reference: %s' % label, file=sys.stderr)
            return m.group(0)
        return '<a href="#%s" class="block-ref">%s</a>' % (label, ref_text)

    html = BLOCK_REF_RE.sub(replace_ref, html)

    for i, segment in enumerate(protected_segments):
        html = html.replace('\x00R%d\x00' % i, segment)

    return html


# ── Section wrapping ────────────────────────────────────────────────────────

def wrap_sections(html):
    """Wrap content between h2 headings in <section id="..."> tags."""
    lines = html.split('\n')
    out = []
    in_section = False

    for line in lines:
        m = re.match(r'^(\s*)<h2([^>]*)>(.*?)</h2>$', line)
        if m:
            indent = m.group(1)
            h2_attrs = m.group(2) or ''
            heading_html = m.group(3)
            heading = re.sub(r'<[^>]+>', '', heading_html)
            section_id_match = re.search(r'\bdata-section-id="([^"]+)"', h2_attrs)
            ref_text_match = re.search(r'\bdata-ref-text="([^"]+)"', h2_attrs)
            section_id = section_id_match.group(1) if section_id_match else heading
            section_ref_text = ref_text_match.group(1) if ref_text_match else heading
            section_attrs = ''
            if re.search(r'\bdata-toc-subsections="true"', h2_attrs):
                section_attrs = ' data-toc-subsections="true"'
            elif re.search(r'\bdata-toc-subsections="false"', h2_attrs):
                section_attrs = ' data-toc-subsections="false"'
            if section_id_match:
                section_attrs += ' data-block-kind="section" data-ref-text="%s"' % section_ref_text
            if in_section:
                out.append('%s</section>\n' % indent)
            out.append('%s<section id="%s"%s>' % (indent, section_id, section_attrs))
            out.append('%s<h2>%s</h2>' % (indent, heading_html))
            in_section = True
        else:
            out.append(line)

    if in_section:
        out.append('      </section>')

    return '\n'.join(out)


def place_reference_list(body_html, has_references):
    """Place the reference list inside the References section when present."""
    if not has_references:
        return body_html, ''

    ref_list_html = '      <ul id="reference-list"></ul>'
    pattern = re.compile(
        r'(?P<open><section\b[^>]*>\s*\n\s*<h2>References</h2>)(?P<body>.*?)(?P<close>\n\s*</section>)',
        re.DOTALL,
    )
    match = pattern.search(body_html)
    if not match:
        return body_html, ref_list_html

    section_body = match.group('body')
    if 'id="reference-list"' in section_body:
        return body_html, ''

    trimmed_body = section_body.rstrip()
    if trimmed_body:
        new_body = trimmed_body + '\n' + ref_list_html
    else:
        new_body = '\n' + ref_list_html

    updated_html = (
        body_html[:match.start()]
        + match.group('open')
        + new_body
        + match.group('close')
        + body_html[match.end():]
    )
    return updated_html, ''


# ── HTML template ───────────────────────────────────────────────────────────

TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-CL61JF076E"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-CL61JF076E');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>__TITLE__ | Chus</title>
    <link rel="stylesheet" href="__REL__/style.css">
    <link rel="stylesheet" href="https://use.typekit.net/znl5vhc.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="icon" href="https://chus.space/favicon.ico?v=2"/>
    <link rel="canonical" href="https://chus.space/__CANONICAL__">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    <meta property="og:type" content="article">
    <meta property="og:title" content="__TITLE__ - Chus Antonanzas">
    <meta name="description" content="__DESCRIPTION__" />
    <meta property="og:description" content="__OG_DESCRIPTION__" />
    <meta property="og:image" content="https://chus.space/static/ogimage.png">
    <meta property="og:url" content="https://chus.space/__CANONICAL__">
    <meta property="og:site_name" content="Chus Antonanzas">
    <meta property="og:locale" content="en_US">
    <script>
      window.MathJax = {
          tex: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$']],
              packages: ['base', 'ams'],
              tags: 'ams',
              tagSide: 'right',
              tagIndent: '0.8em'
          },
          options: {
              ignoreHtmlClass: 'tex2jax_ignore',
              processHtmlClass: 'tex2jax_process'
          }
      };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
__EXTRA_HEAD__</head>

<body>
  <header>
      <nav id="navbar">
        <div class="logo-and-title">
            <a href="/" style="display: flex; align-items: center; text-decoration: none; color: inherit;">
                <h1>Chus Antonanzas</h1>
            </a>
        </div>
        <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
        </ul>
    </nav>
  </header>

  <div id="progress-container">
    <div id="progress-bar"></div>
  </div>

  <div class="content-container entry">
    <article>

    <div class="blog-header">
        <h1>__TITLE__</h1>
__TAGLINE__
        <div class="header-date-links">
            <div class="header-date">
                <span>__DATE__</span>
            </div>
            <div class="social-links">
                <div id="copy-notification" style="display: none;">Copied!</div>
                <a target="_blank" aria-label="X" data-share="x"> <i class="fa-brands fa-x-twitter"></i> </a>
                <a href="#" onclick="copyToClipboard(window.location.href)" aria-label="Copy link"> <i class="fas fa-link"></i></a>
            </div>
        </div>
        <hr>
    </div>

__BODY__

__REFERENCE_LIST__
__BIBTEX__

    </article>
__POST_NAV__
  </div>

<script src="__REL__/src/progress_bar.js"></script>
<script src="__REL__/src/dynamic_share_url.js"></script>
<script src="__REL__/src/copy_bibtex.js"></script>
__REFS_SCRIPT__
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
<script src="__REL__/src/code_highlight.js"></script>
<script src="__REL__/src/sidenotes.js"></script>

</body>
</html>
"""


def build(meta, body_html, references, extra_head, bibtex, rel_root, canonical):
    """Fill the template."""
    title = meta.get('title', 'Untitled')
    date = meta.get('date', '')
    description = meta.get('description', '')
    og_desc = meta.get('og_description', description)
    tagline = meta.get('tagline', '')

    tagline_html = ''
    if tagline:
        tagline_html = '        <p class="tagline">%s</p>' % tagline

    extra_head_html = ''
    if extra_head:
        extra_head_html = '    ' + '\n    '.join(extra_head.strip().splitlines()) + '\n'

    bibtex_html = ''
    if bibtex:
        bibtex_html = (
            '    <h3>Citation</h3>\n'
            '    <p>If this has been useful and you want to cite it, please use the following bibtex.</p>\n'
            '    <div class="bibtex-container">\n'
            '      <button class="bibtex-copy-btn" onclick="copyBibtex()">📋</button>\n'
            '      <pre class="bibtex" id="bibtex-text">\n'
            '%s</pre>\n'
            '    </div>' % bibtex.strip()
        )

    refs_script = ''
    reference_list_html = ''
    if references:
        body_html, reference_list_html = place_reference_list(body_html, True)
        refs_json = json.dumps(references, indent=2, ensure_ascii=False)
        refs_script = '<script>\nconst references = %s;\n</script>\n' % refs_json
        refs_script += '<script src="%s/src/citations.js"></script>' % rel_root

    # Post navigation (prev/next)
    # Frontmatter format: prev: /url | Title   next: /url | Title
    nav_html = ''
    prev_raw = meta.get('prev', '')
    next_raw = meta.get('next', '')
    if prev_raw or next_raw:
        nav_parts = ['    <nav class="post-nav">']
        if prev_raw and '|' in prev_raw:
            url, title_text = [s.strip() for s in prev_raw.split('|', 1)]
            nav_parts.append('      <a class="post-nav-prev" href="%s">' % url)
            nav_parts.append('        <span class="post-nav-label">Previous</span>')
            nav_parts.append('        &larr; %s' % title_text)
            nav_parts.append('      </a>')
        else:
            nav_parts.append('      <span></span>')
        if next_raw and '|' in next_raw:
            url, title_text = [s.strip() for s in next_raw.split('|', 1)]
            nav_parts.append('      <a class="post-nav-next" href="%s">' % url)
            nav_parts.append('        <span class="post-nav-label">Next</span>')
            nav_parts.append('        %s &rarr;' % title_text)
            nav_parts.append('      </a>')
        nav_parts.append('    </nav>')
        nav_html = '\n'.join(nav_parts)

    html = TEMPLATE
    html = html.replace('__TITLE__', title)
    html = html.replace('__DATE__', date)
    html = html.replace('__DESCRIPTION__', description)
    html = html.replace('__OG_DESCRIPTION__', og_desc)
    html = html.replace('__CANONICAL__', canonical)
    html = html.replace('__REL__', rel_root)
    html = html.replace('__TAGLINE__', tagline_html)
    html = html.replace('__EXTRA_HEAD__', extra_head_html)
    html = html.replace('__BODY__', body_html)
    html = html.replace('__REFERENCE_LIST__', reference_list_html)
    html = html.replace('__BIBTEX__', bibtex_html)
    html = html.replace('__POST_NAV__', nav_html)
    html = html.replace('__REFS_SCRIPT__', refs_script)

    return html


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'):
        print((__doc__ or '').strip())
        sys.exit(0)

    md_path = sys.argv[1]
    if not os.path.isfile(md_path):
        print('Error: %s not found' % md_path, file=sys.stderr)
        sys.exit(1)

    with open(md_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    # Parse frontmatter
    meta, body = parse_frontmatter(raw)

    # Extract special blocks
    refs_raw, body = extract_fenced(body, 'references')
    extra_head, body = extract_fenced(body, 'head')
    bibtex_raw, body = extract_fenced(body, 'bibtex')

    references = []
    if refs_raw:
        try:
            references = json.loads(refs_raw)
        except json.JSONDecodeError as e:
            print('Warning: bad references JSON: %s' % e, file=sys.stderr)

    # Protect math & code
    body, protected = protect(body)

    # Convert
    body_html = blocks(body, protected)
    body_html = wrap_sections(body_html)
    body_html = restore(body_html, protected)
    body_html = resolve_block_references(body_html)

    # Compute paths
    md_dir = os.path.dirname(os.path.abspath(md_path))
    root_dir = os.path.dirname(os.path.abspath(__file__))
    rel_root = os.path.relpath(root_dir, md_dir).replace('\\', '/')
    canonical = os.path.relpath(md_dir, root_dir).replace('\\', '/')

    # Build & write
    html = build(meta, body_html, references, extra_head, bibtex_raw, rel_root, canonical)
    out_path = os.path.join(md_dir, 'index.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)

    # Summary
    n_sections = html.count('<section id=')
    n_refs = len(references)
    n_sidenotes = html.count('class="sidenote"')
    print('%s -> %s' % (md_path, out_path))
    print('  %d sections, %d references, %d sidenotes' % (n_sections, n_refs, n_sidenotes))


if __name__ == '__main__':
    main()
