const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadAppContext() {
  const code = fs.readFileSync(path.join(__dirname, "..", "assets", "app.js"), "utf8");
  const context = {
    console,
    URL,
    window: {
      AFFILIATE_LINKS: {
        lp: {
          href: "https://example.com/lp",
          pixel: "https://example.com/pixel.gif"
        }
      },
      dataLayer: [],
      setInterval: () => 0
    },
    document: {
      addEventListener: () => {},
      head: {
        querySelector: () => null
      },
      querySelector: () => null,
      querySelectorAll: () => []
    }
  };

  vm.createContext(context);
  vm.runInContext(`${code}
window.__testHooks = {
  getArticleCtaCopy,
  renderArticleCta,
  renderMobileStickyCta,
  trackAffiliateCtaClick,
  markdownToHtml
};`, context);
  return context;
}

test("renders category-aware affiliate CTA markup", () => {
  const context = loadAppContext();
  const article = {
    slug: "salary-test",
    category: "年収アップ"
  };

  const html = context.window.__testHooks.renderArticleCta(article, "article_header", {
    modifier: "is-compact"
  });

  assert.match(html, /article-conversion-cta is-compact/);
  assert.match(html, /年収が上がる余地を無料で確認する/);
  assert.match(html, /data-affiliate-cta-id="article_header"/);
  assert.match(html, /href="https:\/\/example\.com\/lp"/);
  assert.match(html, /src="https:\/\/example\.com\/pixel\.gif"/);
});

test("renders mobile sticky CTA markup", () => {
  const context = loadAppContext();
  const article = {
    slug: "ai-test",
    category: "AIスキル"
  };

  const html = context.window.__testHooks.renderMobileStickyCta(article);

  assert.match(html, /mobile-sticky-cta/);
  assert.match(html, /AIスキルが転職市場でどう評価されるか確認する/);
  assert.match(html, /data-affiliate-cta-id="mobile_sticky"/);
  assert.match(html, /data-mobile-sticky-close/);
});

test("pushes affiliate CTA click events to dataLayer", () => {
  const context = loadAppContext();
  const article = {
    slug: "event-test",
    category: "転職ガイド"
  };

  context.window.__testHooks.trackAffiliateCtaClick(article, "article_mid", "lp");

  assert.deepEqual({ ...context.window.dataLayer.at(-1) }, {
    event: "affiliate_cta_click",
    cta_id: "article_mid",
    article_slug: "event-test",
    article_category: "転職ガイド",
    affiliate_slot: "lp"
  });
});

test("injects a mid-article CTA before the second h2", () => {
  const context = loadAppContext();
  context.window.currentArticleForCta = {
    slug: "mid-test",
    category: "転職ガイド"
  };

  const html = context.window.__testHooks.markdownToHtml([
    "# Title",
    "",
    "## First section",
    "Body",
    "",
    "## Second section",
    "Body"
  ].join("\n"));

  assert.match(html, /data-affiliate-cta-id="article_mid"/);
  assert.ok(
    html.indexOf('data-affiliate-cta-id="article_mid"') < html.indexOf('id="section-2"'),
    "mid CTA should be inserted before the second h2"
  );
});

test("does not inject the legacy top image banner after markdown h1", () => {
  const context = loadAppContext();
  context.window.currentArticleForCta = {
    slug: "top-test",
    category: "転職ガイド"
  };

  const html = context.window.__testHooks.markdownToHtml([
    "# Title",
    "",
    "Lead paragraph"
  ].join("\n"));

  assert.doesNotMatch(html, /article-top-cta/);
});
