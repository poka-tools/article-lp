# Affiliate CTR Hybrid CTA Design

## Goal

Reduce article-page bounce risk while increasing affiliate click-through rate. The first implementation should prioritize affiliate clicks, but it must still keep the reading experience credible enough for a career advice media site.

## Current Context

The site is a static HTML media site. Article metadata lives in `assets/articles.js`, article bodies are fetched as Markdown from `content/articles/` and `content/lp/`, and rendering happens in `assets/app.js`.

The existing article page already has:

- Sidebar affiliate banner.
- Inline affiliate banner injection after article headings.
- Article metadata and OGP updates at runtime.
- Related articles sidebar.

The selected direction is a strong hybrid CTA pattern:

- Inline CTA blocks inside article content.
- A mobile-only sticky CTA at the bottom of the viewport.
- Basic GTM/GA4-friendly click events through `dataLayer`.

## Design

### 1. CTA Placement

Article pages should receive the following CTA placements:

- Header-adjacent CTA: a compact CTA directly after the article header summary, before the body content.
- Mid-article CTA: a larger CTA around the second major section. The existing Markdown renderer already injects ad content before the second `h2`; this should be refined into a clearer conversion block.
- End-of-article CTA: a closing CTA after the rendered Markdown body, before or near related article suggestions.
- Mobile sticky CTA: a bottom fixed CTA visible only on article detail pages on mobile-sized viewports.

The sticky CTA must not display on desktop. It should avoid covering important content by adding bottom padding to the article page only when present.

### 2. CTA Messaging

The default CTA should target the site's primary affiliate intent:

- Primary message: "今の市場価値を無料で確認する"
- Supporting message: "転職するか決める前に、年収相場と評価ポイントを把握できます。"
- Button text: "無料で市場価値を確認"

The messaging should be direct, career-focused, and consistent with the existing site copy. It should not overpromise guaranteed salary increases.

### 3. Category Awareness

The first implementation can use one default CTA for all article categories, but the code should leave a small boundary for later category-specific text.

Future category variants may include:

- `年収アップ`: salary and market-value framing.
- `職務経歴書`: resume review and experience wording framing.
- `面接対策`: interview preparation framing.
- `AIスキル`: AI skill market-value framing.

This should not require changing article Markdown files.

### 4. Click Tracking

CTA clicks should push a GTM-compatible event into `window.dataLayer` when available.

Event name:

- `affiliate_cta_click`

Suggested event fields:

- `cta_id`: stable placement ID, such as `article_header`, `article_mid`, `article_end`, or `mobile_sticky`.
- `article_slug`: current article slug.
- `article_category`: current article category.
- `affiliate_slot`: link slot such as `lp`, `top`, or `under`.

The click should still navigate normally if `dataLayer` is not present.

### 5. User Experience Constraints

The mobile sticky CTA should:

- Be readable on narrow screens.
- Use one primary button and short supporting text.
- Respect safe-area insets where possible.
- Include a small close button so users can dismiss it during a session.
- Stay hidden after dismissal until the page is reloaded.

Inline CTA blocks should:

- Look like conversion panels, not random ad images.
- Include clear "PR" labeling.
- Use the existing affiliate URL and tracking pixel through `assets/affiliate-links.js`.
- Avoid creating duplicate nested card layouts.

### 6. Implementation Boundaries

Expected files to change:

- `assets/app.js`: CTA rendering, tracking helper, article-page insertion points.
- `styles.css`: CTA block and mobile sticky styles.
- Potentially `article.html`: only if a stable mount point is needed.

Do not change article Markdown content for this first pass.
Do not replace the current affiliate-link configuration.
Do not introduce a build step in this change.

## Verification

Manual and automated checks should cover:

- Article detail page renders successfully for a recent article slug.
- Inline CTAs appear in the intended positions.
- Mobile sticky CTA appears on mobile viewport and not desktop viewport.
- Dismiss button hides the sticky CTA.
- Affiliate links still use configured A8 URLs.
- Clicking CTA pushes `affiliate_cta_click` into `dataLayer`.
- Existing archive and top page rendering still work.

## Risks

- Too many CTA surfaces can reduce perceived trust. This is accepted because the user selected a strong CTR-first hybrid direction.
- Runtime-rendered article pages still have SEO limitations. This design improves conversion behavior but does not solve static article generation.
- Without live analytics validation, CTR improvement can only be inferred from placement and tracking readiness. GA4/GTM review should follow deployment.
