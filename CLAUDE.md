# CLAUDE.md

This file provides guidance to LLM Agents (Claude Code, Codex, Gemini, Gemini, etc.) when working with code in this repository.

## Project Overview

Static personal website and technical blog (chus.space). No build system, no framework — pure HTML, CSS, and vanilla JavaScript. Deployed on GitHub Pages with the repo root as the publish directory.

## Development

```bash
python server.py        # Local dev server at http://localhost:8000 (with cache-busting headers)
```

There is no build step, no package manager, no linter, and no test suite. Changes are verified manually in the browser.

## Architecture

- **Single stylesheet**: `style.css` — all site-wide styles live here
- **Pages**: Each page is a standalone `index.html` with its own hardcoded navbar, meta tags, and analytics snippet
- **Blog posts**: Located at `blog/<year>/<post-name>/index.html`, each with a companion Markdown source `<post-name>.md` in the same directory
- **Shared JS utilities**: `src/` contains `progress_bar.js`, `dynamic_share_url.js`, `copy_bibtex.js`, `citations.js`, `sidenotes.js`
- **D3.js visualizations**: `src/viz/2024/` — each blog post's interactive figures are in separate JS files
- **Static assets**: `static/` for images (headshot, OG image)
- **External dependencies** (loaded via CDN, not installed): MathJax, D3.js, Math.js, FontAwesome, Typekit fonts
- **LLM discoverability**: `llms.txt` at the root lists all content with links to Markdown sources; `robots.txt` allows all crawlers

## Key Constraint: Hardcoded Navbar

The navbar is duplicated in every HTML file. There is no shared template or include system. When modifying navigation, every HTML page must be updated individually.

## Blog Post Features

### Sidebar TOC

`src/progress_bar.js` builds a fixed table-of-contents in the left margin from `<section>` elements. It highlights the active section on scroll and supports click-to-navigate. Hidden below 1200px viewport width.

### Citations

Blog posts define a `references` array in an inline `<script>` tag, then load `src/citations.js`. The script builds the numbered reference list at the bottom and hooks up hover popovers on all inline citation links (`<a href="#refId">`).

- Inline citations use `<a href="#refId">Author (year)</a>` where `refId` matches an entry in the `references` array.
- Citation links are auto-styled with a dotted underline to distinguish them from regular links.
- Hovering shows a popover with the full reference. The popover stays open when the cursor moves into it (text is selectable).

### Sidenotes

Margin notes that appear beside the text on wide screens (>1200px) and collapse to inline blocks with a left border on narrower screens. Load `src/sidenotes.js` in the blog post.

Usage — place a `<span class="sidenote">` inline at the point where the reference number should appear:

```html
<p>Some claim here<span class="sidenote">Clarification or aside that appears in the margin.</span> and the text continues.</p>
```

The script auto-numbers all sidenotes and inserts superscript markers.

## Creating a New Blog Post

Write a Markdown file and convert it to HTML:

```bash
python build_post.py blog/2025/my-post/post.md
# → writes blog/2025/my-post/index.html
```

Then add the post to the homepage (`index.html`), `sitemap.xml`, and `llms.txt`.

### Markdown format

```markdown
---
title: My Post Title
date: March 15, 2025
tagline: Optional italic subtitle under the title.
description: SEO meta description.
og_description: OpenGraph description (falls back to description).
prev: /blog/2024/ssm_1_context | Introduction to SSMs
next: /blog/2024/ssm_3_mambas | Mamba and Mamba-2
---

## First Section

Regular paragraph with **bold**, *italic*, and [links](https://example.com).

Inline math $x = y$ and display math:

$$E = mc^2$$

A citation to [Mamba (2024)](#mamba) gets a dotted underline and hover popover.

A sidenote^[This appears in the right margin on wide screens.] inline in text.

![Figure caption](../../../static/2025/fig.png){width=400 height=260}

## References

```references
[
  {"id": "mamba", "author": "Gu, Dao", "year": "2024",
   "title": "Mamba", "url": "https://arxiv.org/abs/2312.00752"}
]
```​
```

Extra `<script>` tags (D3.js, math.js, etc.) go in a `` ```head `` block in the markdown — they're injected into `<head>`. A `` ```bibtex `` block renders the bibtex citation container with a copy button.

### Manual alternative

You can also create `index.html` directly using an existing post as a template. Update `<title>`, `<link rel="canonical">`, and `<meta>` tags for SEO.
