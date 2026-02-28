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
    fenced code blocks, images.

    ## headings become <section> boundaries with IDs.

Extensions:
    ^[text]           Sidenote (margin note on wide screens)
    $...$             Inline math (MathJax)
    $$...$$           Display math (MathJax)
    [text](#refId)    Citation link (dotted underline, hover popover)
    Raw HTML lines    Passed through unchanged

References block (at end of file):
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


# ── Protection: keep math & code from being mangled ─────────────────────────

def protect(text):
    """Replace math, inline code, and code blocks with placeholders."""
    blocks = []

    def save(m):
        blocks.append(m.group(0))
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
    for i, raw in enumerate(blocks):
        ph = '\x00P%d\x00' % i
        if raw.startswith('```'):
            lines = raw.split('\n')
            info = lines[0][3:].strip()
            code = '\n'.join(lines[1:-1])
            # Escape HTML inside code
            code = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            cls = ' class="language-%s"' % info if info else ''
            replacement = '<pre><code%s>%s</code></pre>' % (cls, code)
        elif raw.startswith('`') and raw.endswith('`'):
            inner = raw[1:-1]
            inner = inner.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            replacement = '<code>%s</code>' % inner
        else:
            replacement = raw  # math — pass through as-is
        html = html.replace(ph, replacement)
    return html


# ── Inline Markdown ─────────────────────────────────────────────────────────

def inline(text):
    """Convert inline Markdown to HTML."""
    # HTML-escape plain text (but not Markdown syntax chars)
    text = text.replace('&', '&amp;')
    # Sidenotes: ^[text]
    text = re.sub(r'\^\[([^\]]+)\]', r'<span class="sidenote">\1</span>', text)
    # Links: [text](url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    # Bold: **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Italic: *text*
    text = re.sub(r'(?<!\w)\*(.+?)\*(?!\w)', r'<em>\1</em>', text)
    return text


# ── Block-level Markdown ────────────────────────────────────────────────────

def blocks(text):
    """Convert block-level Markdown to HTML."""
    lines = text.split('\n')
    out = []
    para = []
    i = 0

    def flush():
        if para:
            content = inline(' '.join(para))
            out.append('      <p>%s</p>' % content)
            para.clear()

    while i < len(lines):
        line = lines[i]
        s = line.strip()

        # Blank line → end paragraph
        if not s:
            flush()
            i += 1
            continue

        # Protected block alone on a line (display math or code block)
        if re.match(r'^\x00P\d+\x00$', s):
            flush()
            out.append('      ' + s)
            i += 1
            continue

        # Raw HTML passthrough
        if s.startswith('<'):
            flush()
            out.append('      ' + s)
            i += 1
            continue

        # h2
        if s.startswith('## ') and not s.startswith('### '):
            flush()
            heading = s[3:]
            out.append('      <h2>%s</h2>' % inline(heading))
            i += 1
            continue

        # h3
        if s.startswith('### '):
            flush()
            heading = s[4:]
            out.append('      <h3>%s</h3>' % inline(heading))
            i += 1
            continue

        # Horizontal rule
        if s in ('---', '***', '___'):
            flush()
            out.append('      <hr>')
            i += 1
            continue

        # Image on its own line: ![caption](src)  or  ![caption](src){width=400 height=260}
        m = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)(\{([^}]+)\})?$', s)
        if m:
            flush()
            cap, src, attrs_raw = m.group(1), m.group(2), m.group(4)
            img_attrs = ''
            if attrs_raw:
                # Parse key=value pairs like width=400 height=260 style="..."
                for pair in re.findall(r'(\w+)=(?:"([^"]+)"|(\S+))', attrs_raw):
                    key = pair[0]
                    val = pair[1] if pair[1] else pair[2]
                    img_attrs += ' %s="%s"' % (key, val)
            out.append('      <div class="plot-container">')
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
            out.append('      <ol>')
            while i < len(lines) and re.match(r'^\s*\d+\.\s', lines[i]):
                item = re.sub(r'^\s*\d+\.\s', '', lines[i])
                out.append('        <li>%s</li>' % inline(item.strip()))
                i += 1
            out.append('      </ol>')
            continue

        # Otherwise: paragraph text
        para.append(s)
        i += 1

    flush()
    return '\n'.join(out)


# ── Section wrapping ────────────────────────────────────────────────────────

def wrap_sections(html):
    """Wrap content between h2 headings in <section id="..."> tags."""
    lines = html.split('\n')
    out = []
    in_section = False

    for line in lines:
        m = re.match(r'^(\s*)<h2>(.*?)</h2>$', line)
        if m:
            indent = m.group(1)
            heading = re.sub(r'<[^>]+>', '', m.group(2))
            if in_section:
                out.append('%s</section>\n' % indent)
            out.append('%s<section id="%s">' % (indent, heading))
            out.append(line)
            in_section = True
        else:
            out.append(line)

    if in_section:
        out.append('      </section>')

    return '\n'.join(out)


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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
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
                <a target="_blank" aria-label="Twitter"> <i class="fab fa-twitter-square"></i> </a>
                <a href="#" onclick="copyToClipboard(window.location.href)" aria-label="Copy link"> <i class="fas fa-link"></i></a>
            </div>
        </div>
        <hr>
    </div>

__BODY__

    <ul id="reference-list"></ul>

    </article>
__POST_NAV__
  </div>

<script src="__REL__/src/progress_bar.js"></script>
<script src="__REL__/src/dynamic_share_url.js"></script>
<script src="__REL__/src/copy_bibtex.js"></script>
__REFS_SCRIPT__
<script src="__REL__/src/sidenotes.js"></script>

</body>
</html>
"""


def build(meta, body_html, references, extra_head, rel_root, canonical):
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

    refs_script = ''
    if references:
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

    references = []
    if refs_raw:
        try:
            references = json.loads(refs_raw)
        except json.JSONDecodeError as e:
            print('Warning: bad references JSON: %s' % e, file=sys.stderr)

    # Protect math & code
    body, protected = protect(body)

    # Convert
    body_html = blocks(body)
    body_html = wrap_sections(body_html)
    body_html = restore(body_html, protected)

    # Compute paths
    md_dir = os.path.dirname(os.path.abspath(md_path))
    root_dir = os.path.abspath('.')
    rel_root = os.path.relpath(root_dir, md_dir).replace('\\', '/')
    canonical = os.path.relpath(md_dir, root_dir).replace('\\', '/')

    # Build & write
    html = build(meta, body_html, references, extra_head, rel_root, canonical)
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
