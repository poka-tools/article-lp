# Readable Article Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert article detail pages to a light, readable editorial layout while preserving existing affiliate CTA placements.

**Architecture:** Keep the existing `article.html` and runtime article rendering. Implement the design with scoped `styles.css` changes for `.article-page`, `.article-detail`, `.article-detail-header`, `.article-detail-body`, `.article-toc`, sidebar panels, and mobile behavior. Add CSS tests that assert the article shell and body use readable light styles.

**Tech Stack:** Static HTML, Vanilla JavaScript, CSS, Node.js built-in test runner.

---

## File Structure

- Modify `styles.css`: article shell, header, body typography, TOC, sidebar panels, and mobile article styles.
- Modify `tests/article-cta-css.test.js`: add CSS assertions for readable article styles.
- Do not change Markdown content.
- Do not change affiliate links or CTA placement logic in `assets/app.js`.

## Task 1: Add Readability CSS Tests

**Files:**
- Modify: `tests/article-cta-css.test.js`

- [ ] **Step 1: Add failing tests**

Append this test to `tests/article-cta-css.test.js`:

```javascript
test("article page uses light readable editorial styles", () => {
  const detailRule = extractRule(".article-detail");
  const headerRule = extractRule(".article-detail-header");
  const bodyTextRule = extractRule(".article-detail-body p,\\n.article-detail-body li");
  const sidebarRule = extractRule(".article-side section");

  assert.match(detailRule, /background:\s*#ffffff;/);
  assert.match(headerRule, /background:\s*#ffffff;/);
  assert.match(headerRule, /border-bottom:\s*1px solid #e5edf7;/);
  assert.match(bodyTextRule, /color:\s*#334155;/);
  assert.match(bodyTextRule, /line-height:\s*1\.9;/);
  assert.match(sidebarRule, /background:\s*#ffffff;/);
});
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
node --test tests/article-cta-css.test.js
```

Expected: FAIL because `.article-detail`, `.article-detail-header`, body text, and sidebar still use dark or older styles.

## Task 2: Convert Article Page To Light Editorial Surface

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Replace article shell and header styles**

Update the existing article page block to use:

```css
.article-page {
  width: min(1180px, calc(100% - 40px));
  margin: 34px auto 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 26px;
  align-items: start;
}

.article-detail {
  overflow: hidden;
  border: 1px solid #dce5f6;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}

.article-side section {
  border: 1px solid #dce5f6;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.article-detail-header {
  padding: clamp(26px, 5vw, 46px);
  background: #ffffff;
  border-bottom: 1px solid #e5edf7;
}
```

- [ ] **Step 2: Replace header typography and image styles**

Use:

```css
.article-detail-header h1 {
  max-width: 820px;
  margin: 0;
  color: #111827;
  font-size: clamp(30px, 4.2vw, 48px);
  line-height: 1.32;
  letter-spacing: 0;
}

.article-detail-header p:last-of-type {
  max-width: 760px;
  margin: 16px 0 24px;
  color: #475569;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.8;
}

.article-detail-header img {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: none;
}
```

- [ ] **Step 3: Replace body typography styles**

Use:

```css
.article-detail-body {
  max-width: 800px;
  margin: 0 auto;
  padding: clamp(30px, 5vw, 54px);
}

.article-detail-body h2 {
  margin: 46px 0 16px;
  padding-left: 14px;
  border-left: 4px solid var(--lime);
  color: #111827;
  font-size: clamp(23px, 3vw, 30px);
  line-height: 1.45;
}

.article-detail-body h3 {
  margin: 32px 0 12px;
  color: #1f2937;
  font-size: 21px;
  line-height: 1.5;
}

.article-detail-body p,
.article-detail-body li {
  color: #334155;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.9;
}

.article-detail-body p {
  margin: 0 0 22px;
}
```

- [ ] **Step 4: Soften links and TOC**

Use:

```css
.article-detail-body a {
  color: #4b32c8;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

.article-toc {
  margin: 0 0 34px;
  padding: 20px;
  border: 1px solid #dce5f6;
  border-radius: 14px;
  background: #f8fafc;
}
```

- [ ] **Step 5: Add mobile readability overrides**

Inside `@media (max-width: 560px)`, add:

```css
  .article-page {
    width: min(100% - 24px, 1180px);
    margin-top: 24px;
  }

  .article-detail-header {
    padding: 24px 20px;
  }

  .article-detail-header h1 {
    font-size: 29px;
    line-height: 1.35;
  }

  .article-detail-header p:last-of-type {
    font-size: 15.5px;
  }

  .article-detail-body {
    padding: 26px 20px 34px;
  }

  .article-detail-body p,
  .article-detail-body li {
    font-size: 16px;
    line-height: 1.9;
  }
```

- [ ] **Step 6: Run tests**

Run:

```bash
node --test tests/article-cta-css.test.js tests/article-cta.test.js
node --check assets/app.js
```

Expected: both test files pass and `node --check` exits 0.

## Task 3: Manual Verification

**Files:**
- No planned source edits.

- [ ] **Step 1: Verify article page in browser**

Open:

```text
http://localhost:4173/article.html?slug=2026-05-29-bonus-after-tensyoku-3steps
```

Expected:

- Article surface is white and readable.
- Header is white with dark title and gray summary.
- Body text is dark on light background.
- Inline CTA panels remain visible and not overly dark.
- Sidebar panels are white and secondary.

- [ ] **Step 2: Verify top and archive pages**

Open:

```text
http://localhost:4173/
http://localhost:4173/articles.html
```

Expected: pages still render and do not show article-only styling regressions.

