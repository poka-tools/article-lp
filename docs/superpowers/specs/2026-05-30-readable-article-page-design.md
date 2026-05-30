# Readable Article Page Design

## Goal

Make article detail pages easier to read while preserving affiliate CTA click opportunities. The page should feel like a credible career media article first, with conversion panels that support the reader's next action rather than interrupting the reading flow.

## Current Context

The site is a static HTML media site. Article pages are rendered by `article.html`, `assets/articles.js`, and `assets/app.js`; article-specific styling lives in `styles.css`.

The current article page has these strengths:

- Clear article metadata and dynamic rendering.
- A table of contents.
- Sidebar recommendations and author information.
- Header, mid-article, end-of-article, and mobile sticky affiliate CTAs.

The current design problem is that the article detail surface still carries too much dark LP-style treatment. That makes body text, CTAs, and supporting panels feel visually heavy. For long-form career content, the article reading surface should be calmer, lighter, and easier to scan.

## Design Direction

Use a "readability + CTR retention" direction:

- The article reading area becomes light, calm, and text-first.
- Affiliate CTAs remain in the current positions.
- CTA visual treatment becomes a natural article panel rather than an ad-like block.
- Sidebar content remains useful but visually secondary to the article.
- Mobile sticky CTA remains, with enough bottom padding so it does not hide content.

## Page Structure

### 1. Article Shell

The main article card should use a white background, subtle border, and softer shadow. The article page background may keep the broader site background, but the reading surface itself should feel like a white editorial page.

The article layout can keep the two-column desktop structure:

- Main article column.
- Sidebar column.

The main column should be visually dominant. Sidebar boxes should be lighter and less saturated than the previous dark panels.

### 2. Article Header

The header should move from dark gradient to an editorial white header:

- White or near-white background.
- Subtle bottom border.
- Category label and date at the top.
- H1 in dark navy/near-black.
- Description in readable slate gray.
- Eyecatch image below the intro, with a restrained radius and no heavy visual effects.

The H1 should remain strong but not oversized. It should be optimized for multi-line Japanese titles on mobile.

### 3. Article Body Typography

The body should prioritize long-form readability:

- Body text color: dark gray/slate, not pale text on dark background.
- Paragraph font size around 17px on desktop, 16px on mobile.
- Line height around 1.9 for Japanese readability.
- Body width around 760-820px.
- H2 and H3 should be clear but calmer, using dark text and modest accent lines.
- Lists should have comfortable spacing and readable bullet alignment.

Links should remain distinguishable, but avoid overly thick underlines that make paragraphs noisy.

### 4. Table Of Contents

The table of contents should look like a reading aid:

- Light background.
- Clear heading.
- Compact spacing.
- Links in a subdued blue/purple.
- Child entries slightly indented.

It should not compete visually with the article title or CTA.

### 5. Affiliate CTAs

The existing CTA positions should remain:

- Header-adjacent CTA before the TOC.
- Mid-article CTA before the second H2.
- End CTA after the article body.
- Mobile sticky CTA.

Inline CTAs should use a light panel:

- White or very light green/purple-tinted background.
- Dark readable title and body text.
- Clear PR label.
- Green primary button.
- Border and spacing that make it feel integrated into the article.

The CTA should remain visible, but it should not be the darkest or loudest element on the page.

### 6. Sidebar

The sidebar should support reading and conversion without pulling too much attention from the main article:

- White panels.
- Softer borders and shadows.
- Smaller headings.
- Related article list should be scannable.
- Existing affiliate rectangle can remain, but the surrounding panel should feel editorial.

On mobile, sidebar content remains below the article.

### 7. Mobile Behavior

Mobile should prioritize:

- Comfortable side padding.
- H1 not overwhelming the first viewport.
- Body text line length and line height.
- CTA panels stacking cleanly.
- Sticky CTA staying visible but not covering content.

The mobile sticky CTA can remain dark for contrast because it floats above the page, but it should be compact and readable.

## Implementation Boundaries

Expected files to change:

- `styles.css`: article page layout, article header, body typography, TOC, CTA, sidebar, and mobile styles.
- `assets/app.js`: only if a small class or wrapper is needed for styling; avoid changing article rendering behavior.

Do not change:

- Article Markdown content.
- Article metadata in `assets/articles.js`.
- Affiliate link configuration.
- Top page layout, except where shared article styles require harmless consistency fixes.

## Verification

Verification should include:

- Article page renders for a recent slug.
- Article body text is dark on light background.
- CTA panels remain visible and clickable.
- Mobile sticky CTA still appears and can be dismissed.
- Top page and archive still render.
- Existing CTA tests continue to pass.
- A CSS-oriented test should assert that article body and article shell use readable light styles.

## Risks

- Reducing dark visual weight may make the article feel less like the existing top page brand. This is acceptable because article readability is the priority.
- If CTA panels become too subtle, CTR could drop. The green button and repeated placement preserve the conversion path.
- Shared selectors may affect non-article pages. Implementation should scope changes to article page selectors where possible.
