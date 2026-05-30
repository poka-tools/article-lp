# Affiliate CTR Hybrid CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add strong hybrid affiliate CTAs to article pages: inline conversion panels plus a mobile-only sticky CTA with GTM-friendly click tracking.

**Architecture:** Keep the existing static-site architecture. Extend `assets/app.js` with small CTA rendering and tracking helpers, then insert CTAs during article detail rendering. Add focused CSS in `styles.css` for inline panels and the mobile sticky bar without changing article Markdown or adding a build step.

**Tech Stack:** Static HTML, Vanilla JavaScript, CSS, browser `dataLayer`, local static server for verification.

---

## File Structure

- Modify `assets/app.js`: add CTA copy configuration, affiliate event tracking, inline CTA renderer, mobile sticky CTA renderer, and article-page insertion points.
- Modify `styles.css`: add article CTA panel styles, sticky mobile CTA styles, responsive behavior, and article-page bottom padding on mobile.
- Do not modify `article.html`: `#articleDetail` already provides the stable mount point.
- Do not modify `content/articles/*.md` or `content/lp/*.md`: CTA insertion must be runtime-driven.

## Task 1: Add CTA Rendering And Tracking Helpers

**Files:**
- Modify: `assets/app.js`

- [ ] **Step 1: Add a manual smoke test snippet before implementation**

Open `article.html?slug=2026-05-29-bonus-after-tensyoku-3steps` in the browser console after implementation and run:

```javascript
window.dataLayer = [];
document.querySelector("[data-affiliate-cta-id='article_header']").click();
window.dataLayer[window.dataLayer.length - 1];
```

Expected after implementation:

```javascript
{
  event: "affiliate_cta_click",
  cta_id: "article_header",
  article_slug: "2026-05-29-bonus-after-tensyoku-3steps",
  article_category: "転職ガイド",
  affiliate_slot: "lp"
}
```

- [ ] **Step 2: Add CTA constants and link helper after `PR_SLOT_IMAGES`**

Insert this block after the `PR_SLOT_IMAGES` constant:

```javascript
const ARTICLE_CTA_COPY = {
  default: {
    eyebrow: "PR",
    title: "今の市場価値を無料で確認する",
    body: "転職するか決める前に、年収相場と評価ポイントを把握できます。",
    button: "無料で市場価値を確認"
  },
  "年収アップ": {
    eyebrow: "PR",
    title: "年収が上がる余地を無料で確認する",
    body: "今の経験が転職市場でどう評価されるか、年収相場とあわせて確認できます。",
    button: "年収相場を確認"
  },
  "職務経歴書": {
    eyebrow: "PR",
    title: "職務経歴書で伝えるべき強みを確認する",
    body: "経験の書き方を見直す前に、採用側が評価しやすいポイントを整理できます。",
    button: "無料で相談する"
  },
  "面接対策": {
    eyebrow: "PR",
    title: "面接前に市場評価を確認する",
    body: "転職理由、強み、希望年収を話す前に、自分の市場価値を把握しておけます。",
    button: "面接前に確認"
  },
  "AIスキル": {
    eyebrow: "PR",
    title: "AIスキルが転職市場でどう評価されるか確認する",
    body: "Claude、Codex、生成AI活用経験を年収アップにつながる言葉に整理できます。",
    button: "AIスキル評価を確認"
  }
};

function getArticleCtaCopy(article) {
  return ARTICLE_CTA_COPY[article.category] || ARTICLE_CTA_COPY.default;
}

function getAffiliateLink(slot = "lp") {
  return AFFILIATE_LINKS[slot] || AFFILIATE_LINKS.lp || {};
}
```

- [ ] **Step 3: Add tracking and CTA render helpers after `escapeAttribute`**

Insert this block after `escapeAttribute`:

```javascript
function trackAffiliateCtaClick(article, ctaId, affiliateSlot) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "affiliate_cta_click",
    cta_id: ctaId,
    article_slug: article.slug,
    article_category: article.category,
    affiliate_slot: affiliateSlot
  });
}

function renderArticleCta(article, ctaId, options = {}) {
  const slot = options.slot || "lp";
  const link = getAffiliateLink(slot);
  const copy = getArticleCtaCopy(article);
  const modifier = options.modifier ? ` ${options.modifier}` : "";

  return `
    <aside class="article-conversion-cta${modifier}" aria-label="PR">
      <span class="article-conversion-cta__eyebrow">${escapeHtml(copy.eyebrow)}</span>
      <div class="article-conversion-cta__body">
        <strong>${escapeHtml(copy.title)}</strong>
        <p>${escapeHtml(copy.body)}</p>
      </div>
      <a class="article-conversion-cta__button" href="${escapeAttribute(link.href || "#")}" rel="nofollow sponsored" data-affiliate-cta-id="${escapeAttribute(ctaId)}" data-affiliate-slot="${escapeAttribute(slot)}">
        ${escapeHtml(copy.button)}
      </a>
      <img class="tracking-pixel" width="1" height="1" src="${escapeAttribute(link.pixel || "")}" alt="">
    </aside>
  `;
}

function renderMobileStickyCta(article) {
  const slot = "lp";
  const link = getAffiliateLink(slot);
  const copy = getArticleCtaCopy(article);

  return `
    <div class="mobile-sticky-cta" data-mobile-sticky-cta>
      <div class="mobile-sticky-cta__copy">
        <span>${escapeHtml(copy.eyebrow)}</span>
        <strong>${escapeHtml(copy.title)}</strong>
      </div>
      <a class="mobile-sticky-cta__button" href="${escapeAttribute(link.href || "#")}" rel="nofollow sponsored" data-affiliate-cta-id="mobile_sticky" data-affiliate-slot="${escapeAttribute(slot)}">
        ${escapeHtml(copy.button)}
      </a>
      <button class="mobile-sticky-cta__close" type="button" aria-label="追従CTAを閉じる" data-mobile-sticky-close>×</button>
      <img class="tracking-pixel" width="1" height="1" src="${escapeAttribute(link.pixel || "")}" alt="">
    </div>
  `;
}
```

- [ ] **Step 4: Add CTA initializer after `startPrImageRotation`**

Insert this block after `startPrImageRotation`:

```javascript
function initArticleCtas(article) {
  document.querySelectorAll("[data-affiliate-cta-id]").forEach((link) => {
    if (link.dataset.affiliateCtaBound === "true") return;
    link.dataset.affiliateCtaBound = "true";
    link.addEventListener("click", () => {
      trackAffiliateCtaClick(article, link.dataset.affiliateCtaId, link.dataset.affiliateSlot || "lp");
    });
  });

  const sticky = document.querySelector("[data-mobile-sticky-cta]");
  const close = document.querySelector("[data-mobile-sticky-close]");
  if (sticky && close) {
    close.addEventListener("click", () => {
      sticky.hidden = true;
      document.body.classList.remove("has-mobile-sticky-cta");
    });
    document.body.classList.add("has-mobile-sticky-cta");
  }
}
```

- [ ] **Step 5: Commit Task 1**

```bash
git add assets/app.js
git commit -m "Add article affiliate CTA helpers"
```

Expected: commit succeeds. Do not stage `styles.css` unless Task 2 has already been completed.

## Task 2: Insert CTAs Into Article Detail Rendering

**Files:**
- Modify: `assets/app.js`

- [ ] **Step 1: Replace the second-H2 banner injection in `markdownToHtml`**

Find:

```javascript
      if (h2Count === 2) {
        html.push(`<div class="article-inline-banner">${A8_CAREER_BANNER}</div>`);
      }
```

Replace with:

```javascript
      if (h2Count === 2 && window.currentArticleForCta) {
        html.push(renderArticleCta(window.currentArticleForCta, "article_mid", { modifier: "is-featured" }));
      }
```

- [ ] **Step 2: Add article-specific CTA context in `renderArticleDetail`**

Inside `renderArticleDetail`, after `const article = ...`, add:

```javascript
  window.currentArticleForCta = article;
```

- [ ] **Step 3: Insert header, end, and sticky CTAs in the article detail template**

In `renderArticleDetail`, update the `target.innerHTML` template so it contains:

```javascript
      <div class="article-detail-body">
        ${renderArticleCta(article, "article_header", { modifier: "is-compact" })}
        ${renderArticleToc(markdown)}
        ${markdownToHtml(markdown)}
        ${renderArticleCta(article, "article_end", { modifier: "is-closing" })}
      </div>
      ${renderMobileStickyCta(article)}
```

This replaces the current body block:

```javascript
      <div class="article-detail-body">
        ${renderArticleToc(markdown)}
        ${markdownToHtml(markdown)}
      </div>
```

- [ ] **Step 4: Initialize CTA behavior after affiliate banners render**

In the `try` block of `renderArticleDetail`, after:

```javascript
    renderAffiliateBanners();
```

Add:

```javascript
    initArticleCtas(article);
```

- [ ] **Step 5: Run syntax validation**

```bash
node --check assets/app.js
```

Expected:

```text
```

`node --check` prints no output and exits with code 0.

- [ ] **Step 6: Commit Task 2**

```bash
git add assets/app.js
git commit -m "Insert hybrid CTAs on article pages"
```

Expected: commit succeeds.

## Task 3: Add CTA Styles

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add inline CTA styles after `.article-toc a:hover`**

Insert:

```css
.article-conversion-cta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  margin: 30px 0;
  padding: 22px;
  border: 1px solid rgba(148, 237, 29, 0.38);
  border-radius: 16px;
  background:
    radial-gradient(circle at 94% 18%, rgba(148, 237, 29, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(15, 23, 48, 0.98), rgba(35, 30, 74, 0.94));
  box-shadow: 0 18px 44px rgba(5, 10, 28, 0.24);
}

.article-conversion-cta.is-compact {
  margin-top: 0;
}

.article-conversion-cta.is-featured {
  margin: 38px 0 34px;
  padding: 26px;
}

.article-conversion-cta.is-closing {
  margin-bottom: 0;
}

.article-conversion-cta__eyebrow {
  grid-column: 1 / -1;
  width: fit-content;
  padding: 4px 9px;
  border: 1px solid rgba(148, 237, 29, 0.4);
  border-radius: 999px;
  color: var(--lime);
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}

.article-conversion-cta__body {
  display: grid;
  gap: 8px;
}

.article-conversion-cta__body strong {
  color: #ffffff;
  font-size: clamp(20px, 3vw, 27px);
  line-height: 1.35;
}

.article-conversion-cta__body p {
  margin: 0;
  color: #d8e4ff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.75;
}

.article-conversion-cta__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 999px;
  color: #101827;
  background: var(--lime);
  font-size: 15px;
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 12px 24px rgba(148, 237, 29, 0.24);
}

.article-conversion-cta__button:hover {
  color: #101827;
  transform: translateY(-1px);
}
```

- [ ] **Step 2: Add mobile sticky CTA styles before the first media query**

Insert before `@media (max-width: 1160px)`:

```css
.mobile-sticky-cta {
  display: none;
}
```

- [ ] **Step 3: Add mobile responsive styles inside `@media (max-width: 860px)`**

Inside the `@media (max-width: 860px)` block, add:

```css
  body.has-mobile-sticky-cta .article-page {
    padding-bottom: 104px;
  }

  .article-conversion-cta {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .article-conversion-cta__button {
    width: 100%;
  }

  .mobile-sticky-cta {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: max(12px, env(safe-area-inset-bottom));
    z-index: 80;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 10px;
    align-items: center;
    padding: 12px;
    border: 1px solid rgba(148, 237, 29, 0.42);
    border-radius: 16px;
    background: rgba(12, 18, 38, 0.97);
    box-shadow: 0 16px 42px rgba(0, 0, 0, 0.38);
    backdrop-filter: blur(16px);
  }

  .mobile-sticky-cta[hidden] {
    display: none;
  }

  .mobile-sticky-cta__copy {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  .mobile-sticky-cta__copy span {
    color: var(--lime);
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
  }

  .mobile-sticky-cta__copy strong {
    overflow: hidden;
    color: #ffffff;
    font-size: 13px;
    font-weight: 900;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-sticky-cta__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 13px;
    border-radius: 999px;
    color: #101827;
    background: var(--lime);
    font-size: 12px;
    font-weight: 900;
    text-decoration: none;
    white-space: nowrap;
  }

  .mobile-sticky-cta__close {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
```

- [ ] **Step 4: Add narrow mobile adjustments inside `@media (max-width: 560px)`**

Inside the `@media (max-width: 560px)` block, add:

```css
  .mobile-sticky-cta {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .mobile-sticky-cta__close {
    position: absolute;
    top: -10px;
    right: -6px;
    width: 28px;
    height: 28px;
    background: rgba(12, 18, 38, 0.98);
  }
```

- [ ] **Step 5: Commit Task 3**

```bash
git add styles.css
git commit -m "Style article affiliate CTAs"
```

Expected: commit succeeds. If unrelated pre-existing `styles.css` changes are present, include them only if they are intentional for this feature; otherwise ask before staging.

## Task 4: Verify Behavior In Browser

**Files:**
- No planned source edits. Fix `assets/app.js` or `styles.css` only if verification exposes a defect.

- [ ] **Step 1: Start a local static server**

```bash
python3 -m http.server 4173
```

Expected:

```text
Serving HTTP on 0.0.0.0 port 4173 ...
```

- [ ] **Step 2: Verify desktop article page**

Open:

```text
http://localhost:4173/article.html?slug=2026-05-29-bonus-after-tensyoku-3steps
```

Expected:

- Article body loads.
- Header CTA appears before the table of contents.
- Mid CTA appears before the second `h2`.
- End CTA appears after the article body.
- Mobile sticky CTA is not visible on desktop width.

- [ ] **Step 3: Verify mobile article page**

Use browser device emulation at 390px width.

Expected:

- Sticky CTA appears at the bottom.
- Sticky CTA does not cover the article footer because page bottom padding is present.
- Close button hides sticky CTA.
- Inline CTAs fit within the viewport.

- [ ] **Step 4: Verify click tracking**

In browser console:

```javascript
window.dataLayer = [];
document.querySelector("[data-affiliate-cta-id='article_header']").click();
window.dataLayer[window.dataLayer.length - 1];
```

Expected object:

```javascript
{
  event: "affiliate_cta_click",
  cta_id: "article_header",
  article_slug: "2026-05-29-bonus-after-tensyoku-3steps",
  article_category: "転職ガイド",
  affiliate_slot: "lp"
}
```

- [ ] **Step 5: Verify non-article pages are unaffected**

Open:

```text
http://localhost:4173/
http://localhost:4173/articles.html
```

Expected:

- Top page latest article cards render.
- Archive filters and pagination render.
- No mobile sticky CTA appears on these pages.

- [ ] **Step 6: Final status check**

```bash
git status --short
```

Expected:

```text
```

Only pre-existing unrelated changes may remain. If implementation changes remain unstaged, commit or report them.

