const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

function extractRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return match ? match[1] : "";
}

test("article conversion CTA uses a light readable panel", () => {
  const ctaRule = extractRule(".article-conversion-cta");
  const titleRule = extractRule(".article-conversion-cta__body strong");
  const bodyRule = extractRule(".article-conversion-cta__body p");

  assert.match(ctaRule, /background:\s*#ffffff;/);
  assert.match(titleRule, /color:\s*var\(--navy\);/);
  assert.match(bodyRule, /color:\s*#45536b;/);
});

test("article page uses light readable editorial styles", () => {
  const detailRule = extractRule(".article-detail");
  const headerRule = extractRule(".article-detail-header");
  const bodyTextRule = extractRule(".article-detail-body p,\n.article-detail-body li");
  const sidebarRule = extractRule(".article-side section");

  assert.match(detailRule, /background:\s*#ffffff;/);
  assert.match(headerRule, /background:\s*#ffffff;/);
  assert.match(headerRule, /border-bottom:\s*1px solid #e5edf7;/);
  assert.match(bodyTextRule, /color:\s*#334155;/);
  assert.match(bodyTextRule, /line-height:\s*1\.9;/);
  assert.match(sidebarRule, /background:\s*#ffffff;/);
});
