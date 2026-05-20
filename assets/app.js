function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(date) {
  return date.replaceAll("-", ".");
}

const AFFILIATE_LINKS = window.AFFILIATE_LINKS || {};
const ARCHIVE_PAGE_SIZE = 10;
const CATEGORY_DEFAULT_IMAGES = {
  "転職ガイド": "assets/images/image7.png"
};
const PR_SLOT_IMAGES = {
  top: [
    "assets/images/pr-image-top.png",
    "assets/images/pr-image-to2.png"
  ],
  lp: [
    "assets/images/pr-image-lp.png",
    "assets/images/pr-image-lp2.png"
  ],
  side: ["pr-image.webp"],
  under: [
    "assets/images/pr-image-under.png"
  ]
};

const UNDER_BANNER = `
  <div class="affiliate-banner is-slim" aria-label="PR">
    <a href="${(AFFILIATE_LINKS.under || AFFILIATE_LINKS.lp || {}).href || "#"}" rel="nofollow sponsored">
      <img width="2241" height="702" alt="エンジニア転職の市場価値を確認するPR" src="assets/images/pr-image-under.png">
    </a>
    <img class="tracking-pixel" width="1" height="1" src="${(AFFILIATE_LINKS.under || AFFILIATE_LINKS.lp || {}).pixel || ""}" alt="">
  </div>
`;

const SITE_BASE_URL = "https://poka-tools.github.io/article-lp/";

function absoluteAssetUrl(path) {
  if (!path) return `${SITE_BASE_URL}assets/images/eyecatch-ai-era-engineer-skills.webp`;
  const cleanPath = String(path).split("?")[0];
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) return cleanPath;
  return new URL(cleanPath, SITE_BASE_URL).href;
}

function getArticleImage(article) {
  return CATEGORY_DEFAULT_IMAGES[article.category] || article.image;
}

function setMetaContent(selector, content) {
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute("content", content);
}

function updateArticleMeta(article) {
  const title = `${article.title} | エンジニア転職ラボ`;
  const description = article.description || "エンジニア転職、AIスキル、職務経歴書、面接対策、年収アップの記事です。";
  const url = `${SITE_BASE_URL}article.html?slug=${encodeURIComponent(article.slug)}`;
  const image = absoluteAssetUrl(getArticleImage(article));

  document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', url);
  setMetaContent('meta[property="og:image"]', image);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
  setMetaContent('meta[name="twitter:image"]', image);

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", url);
}

function getPrImage(slot) {
  const images = PR_SLOT_IMAGES[slot] || PR_SLOT_IMAGES.lp;
  return images[Math.floor(Math.random() * images.length)];
}

function renderPrBanner(className, slot) {
  const link = AFFILIATE_LINKS[slot] || AFFILIATE_LINKS.lp || {};
  const images = PR_SLOT_IMAGES[slot] || PR_SLOT_IMAGES.lp;
  const rotationAttrs = images.length > 1
    ? ` data-pr-slot="${slot}" data-pr-images="${images.join("|")}"`
    : "";
  return `
    <div class="affiliate-banner ${className}" aria-label="PR">
      <a href="${link.href || "#"}" rel="nofollow sponsored">
        <img width="1619" height="971" alt="エンジニア転職のキャリア相談PR" src="${getPrImage(slot)}"${rotationAttrs}>
      </a>
      <img class="tracking-pixel" width="1" height="1" src="${link.pixel || ""}" alt="">
    </div>
  `;
}

function renderSidePrBanner() {
  const link = AFFILIATE_LINKS.side || {};
  return `
    <div class="affiliate-banner is-rectangle" aria-label="PR">
      <a href="${link.href || "#"}" rel="nofollow sponsored">
        <img width="300" height="250" alt="20代から30代エンジニア向けキャリア相談PR" src="${getPrImage("side")}">
      </a>
      <img class="tracking-pixel" width="1" height="1" src="${link.pixel || ""}" alt="">
    </div>
  `;
}

const A8_BANNERS = {
  compact: `
    <div class="affiliate-banner is-compact" aria-label="PR">
      <span>PR</span>
      <a href="${(AFFILIATE_LINKS.compact || {}).href || "#"}" rel="nofollow sponsored">
        <img width="100" height="60" alt="エンジニア向け転職サービスの広告" src="${(AFFILIATE_LINKS.compact || {}).image || ""}">
      </a>
      <img class="tracking-pixel" width="1" height="1" src="${(AFFILIATE_LINKS.compact || {}).pixel || ""}" alt="">
    </div>
  `,
  rectangle: () => renderSidePrBanner(),
  under: () => UNDER_BANNER,
  lp: () => renderPrBanner("is-tensyoku", "lp"),
  slim: () => UNDER_BANNER,
  wide: () => renderPrBanner("is-tensyoku", "lp"),
  tensyoku: () => renderPrBanner("is-tensyoku", "lp"),
  top: () => renderPrBanner("is-top-pr", "top"),
  under: UNDER_BANNER
};
const A8_CAREER_BANNER = A8_BANNERS.wide;
const A8_CAREER_SIDEBAR_BANNER = A8_BANNERS.rectangle;
const A8_CAREER_COMPACT_BANNER = A8_BANNERS.compact;

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function isSafeLinkHref(href) {
  if (href.startsWith("#")) return true;
  if (href.startsWith("http://") || href.startsWith("https://")) return true;
  if (href.startsWith("//")) return false;
  if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false;
  return /^[\w./?=&%+#-]+$/.test(href);
}

function initMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
    nav.classList.toggle("is-open", !isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "メニューを開く");
      nav.classList.remove("is-open");
    });
  });
}

function renderAffiliateBanners() {
  document.querySelectorAll("[data-affiliate-banner='career']").forEach((target) => {
    const variant = target.dataset.affiliateVariant || "wide";
    const banner = A8_BANNERS[variant] || A8_CAREER_BANNER;
    target.innerHTML = typeof banner === "function" ? banner() : banner;
  });
  startPrImageRotation();
}

function startPrImageRotation() {
  document.querySelectorAll("img[data-pr-images]").forEach((image) => {
    if (image.dataset.prRotationStarted === "true") return;

    const images = image.dataset.prImages.split("|").filter(Boolean);
    if (images.length < 2) return;

    image.dataset.prRotationStarted = "true";
    let index = Math.max(0, images.indexOf(image.getAttribute("src")));

    window.setInterval(() => {
      index = (index + 1) % images.length;
      image.setAttribute("src", images[index]);
    }, 6000);
  });
}

function renderInlineMarkdown(value) {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text, href) => {
      if (!isSafeLinkHref(href)) return match;
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      const rel = isExternal ? ' rel="nofollow sponsored"' : "";
      const target = isExternal ? ' target="_blank"' : "";
      return `<a href="${escapeAttribute(href)}"${target}${rel}>${text}</a>`;
    });
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listOpen = false;
  let h2Count = 0;
  let h3Count = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      continue;
    }

    if (line.startsWith("# ")) {
      if (listOpen) html.push("</ul>");
      listOpen = false;
      html.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      if (listOpen) html.push("</ul>");
      listOpen = false;
      h2Count += 1;
      h3Count = 0;
      html.push(`<h2 id="section-${h2Count}">${renderInlineMarkdown(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      if (listOpen) html.push("</ul>");
      listOpen = false;
      h3Count += 1;
      html.push(`<h3 id="section-${h2Count}-${h3Count}">${renderInlineMarkdown(line.slice(4))}</h3>`);
    } else if (line === "{{A8_CAREER_BANNER}}") {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<div class="article-inline-banner">${A8_CAREER_BANNER}</div>`);
    } else if (line === "{{PR_TENSYOKU_BANNER}}") {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<div class="article-inline-banner">${A8_BANNERS.lp()}</div>`);
    } else if (line.startsWith("- ")) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
    } else {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<p>${renderInlineMarkdown(line)}</p>`);
    }
  }

  if (listOpen) html.push("</ul>");
  return html.join("");
}

function extractArticleToc(markdown) {
  let h2Count = 0;
  let h3Count = 0;

  return markdown
    .split(/\r?\n/)
    .map((rawLine) => rawLine.trim())
    .reduce((items, line) => {
      if (line.startsWith("## ")) {
        h2Count += 1;
        h3Count = 0;
        items.push({
          id: `section-${h2Count}`,
          level: 2,
          title: line.slice(3)
        });
      } else if (line.startsWith("### ")) {
        h3Count += 1;
        items.push({
          id: `section-${h2Count}-${h3Count}`,
          level: 3,
          title: line.slice(4)
        });
      }
      return items;
    }, []);
}

function renderArticleToc(markdown) {
  const tocItems = extractArticleToc(markdown);
  if (!tocItems.length) return "";

  return `
    <nav class="article-toc" aria-label="記事の目次">
      <strong>目次</strong>
      <ol>
        ${tocItems.map((item) => `
          <li class="${item.level === 3 ? "is-child" : ""}">
            <a href="#${escapeAttribute(item.id)}">${renderInlineMarkdown(item.title)}</a>
          </li>
        `).join("")}
      </ol>
    </nav>
  `;
}

function renderArticleCards() {
  const target = document.getElementById("articleCards");
  if (!target || !window.SITE_ARTICLES) return;

  const limit = Number(target.dataset.limit || window.SITE_ARTICLES.length);
  const articles = window.SITE_ARTICLES
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);

  target.innerHTML = articles.map((article) => `
    <a class="article-card" href="${escapeHtml(article.href)}">
      <img src="${escapeHtml(getArticleImage(article))}" alt="${escapeHtml(article.alt || article.title)}">
      <div>
        <span class="label ${escapeHtml(article.label)}">${escapeHtml(article.category)}</span>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.description)}</p>
        <time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>
      </div>
    </a>
  `).join("");
}

function renderArchiveCards(category = "all", page = 1) {
  const list = document.getElementById("archiveList");
  const filters = document.getElementById("archiveFilters");
  const pagination = document.getElementById("archivePagination");
  if (!list || !filters || !pagination || !window.SITE_ARTICLES) return;

  const categories = ["all", ...new Set(window.SITE_ARTICLES.map((article) => article.category))];
  filters.innerHTML = categories.map((item) => `
    <button type="button" class="${item === category ? "is-active" : ""}" data-category="${escapeHtml(item)}">
      ${item === "all" ? "すべて" : escapeHtml(item)}
    </button>
  `).join("");

  const articles = window.SITE_ARTICLES
    .filter((article) => category === "all" || article.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.max(1, Math.ceil(articles.length / ARCHIVE_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * ARCHIVE_PAGE_SIZE;
  const visibleArticles = articles.slice(start, start + ARCHIVE_PAGE_SIZE);

  list.innerHTML = visibleArticles.map((article) => `
    <a class="archive-card" href="${escapeHtml(article.href)}">
      <img src="${escapeHtml(getArticleImage(article))}" alt="${escapeHtml(article.alt || article.title)}">
      <div>
        <div class="archive-meta">
          <span class="label ${escapeHtml(article.label)}">${escapeHtml(article.category)}</span>
          <time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>
        </div>
        <strong>${escapeHtml(article.title)}</strong>
        <p>${escapeHtml(article.description)}</p>
        ${article.sourceName ? `<span class="source-chip">公式: ${escapeHtml(article.sourceName)}</span>` : ""}
      </div>
    </a>
  `).join("");

  pagination.innerHTML = `
    <button type="button" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">前へ</button>
    <div class="archive-pages">
      ${Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;
        return `
          <button type="button" class="${pageNumber === currentPage ? "is-active" : ""}" data-page="${pageNumber}">
            ${pageNumber}
          </button>
        `;
      }).join("")}
    </div>
    <button type="button" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">次へ ➤</button>
  `;

  filters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => renderArchiveCards(button.dataset.category, 1));
  });

  pagination.querySelectorAll("button[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      renderArchiveCards(category, Number(button.dataset.page));
    });
  });
}

function renderAiNews() {
  const target = document.getElementById("aiNewsGrid");
  if (!target || !window.SITE_ARTICLES) return;

  const news = window.SITE_ARTICLES
    .filter((article) => article.category === "AI最新情報")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  target.innerHTML = news.map((article) => `
    <article class="news-card">
      <span>${escapeHtml(article.sourceName || article.category)}</span>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.officialSummary || article.description)}</p>
      ${article.meaning ? `<strong>つまり: ${escapeHtml(article.meaning)}</strong>` : ""}
      <div class="news-links">
        <a class="news-link-primary" href="${escapeHtml(article.href)}">要約を読む</a>
        ${article.sourceUrl ? `<a class="news-link-secondary" href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noopener noreferrer">公式URL</a>` : ""}
      </div>
    </article>
  `).join("");
}

function renderRelatedArticles(currentSlug) {
  const target = document.getElementById("relatedArticles");
  if (!target || !window.SITE_ARTICLES) return;

  target.innerHTML = window.SITE_ARTICLES
    .filter((article) => article.slug !== currentSlug)
    .slice(0, 6)
    .map((article) => `
      <a href="${escapeHtml(article.href)}">
        <img src="${escapeHtml(getArticleImage(article))}" alt="">
        <span>${escapeHtml(article.category)}</span>
        <strong>${escapeHtml(article.title)}</strong>
      </a>
    `)
    .join("");
}

async function renderArticleDetail() {
  const target = document.getElementById("articleDetail");
  if (!target || !window.SITE_ARTICLES) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const article = window.SITE_ARTICLES.find((item) => item.slug === slug) || window.SITE_ARTICLES[0];

  updateArticleMeta(article);
  renderRelatedArticles(article.slug);

  try {
    const response = await fetch(`${article.content}?v=20260515-18`);
    if (!response.ok) throw new Error("Article not found");
    const markdown = await response.text();
    target.innerHTML = `
      <header class="article-detail-header">
        <span class="label ${escapeHtml(article.label)}">${escapeHtml(article.category)}</span>
        <p class="article-meta">公開日 ${formatDate(article.date)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p>${escapeHtml(article.description)}</p>
        <img src="${escapeHtml(getArticleImage(article))}" alt="${escapeHtml(article.alt || article.title)}">
      </header>
      ${article.sourceUrl ? `
        <aside class="official-source-box">
          <span>公式情報</span>
          <strong>${escapeHtml(article.sourceName || "公式サイト")}</strong>
          <p>${escapeHtml(article.officialSummary || article.description)}</p>
          ${article.meaning ? `<p><b>つまり:</b> ${escapeHtml(article.meaning)}</p>` : ""}
          <a href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noopener noreferrer">公式URLを開く</a>
        </aside>
      ` : ""}
      <div class="article-detail-body">
        ${renderArticleToc(markdown)}
        ${markdownToHtml(markdown)}
      </div>
    `;
    renderAffiliateBanners();
  } catch (error) {
    target.innerHTML = "<h1>記事を読み込めませんでした</h1><p>時間をおいて再度お試しください。</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  renderAffiliateBanners();
  renderArticleCards();
  renderAiNews();
  renderArchiveCards();
  renderArticleDetail();
});
