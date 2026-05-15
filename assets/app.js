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

const ARCHIVE_PAGE_SIZE = 10;
const PR_SLOT_IMAGES = {
  top: ["assets/images/top-image-pr.png"],
  lp: ["assets/images/pr-image-lp.png"],
  side: ["pr-image.webp"],
  under: [
    "assets/images/uander-image.png"
  ]
};

function getPrImage(slot) {
  const images = PR_SLOT_IMAGES[slot] || PR_SLOT_IMAGES.lp;
  return images[Math.floor(Math.random() * images.length)];
}

function renderPrBanner(className, slot) {
  return `
    <div class="affiliate-banner ${className}" aria-label="PR">
      <a href="https://px.a8.net/svt/ejp?a8mat=45A1MT+45FTMA+5P1E+5ZEMP" rel="nofollow sponsored">
        <img width="1619" height="971" alt="エンジニア転職のキャリア相談PR" src="${getPrImage(slot)}">
      </a>
      <img class="tracking-pixel" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=45A1MT+45FTMA+5P1E+5ZEMP" alt="">
    </div>
  `;
}

function renderSidePrBanner() {
  return `
    <div class="affiliate-banner is-rectangle" aria-label="PR">
      <a href="https://px.a8.net/svt/ejp?a8mat=45A1MT+45FTMA+5P1E+5YZ75" rel="nofollow sponsored">
        <img width="300" height="250" alt="20代から30代エンジニア向けキャリア相談PR" src="${getPrImage("side")}">
      </a>
      <img class="tracking-pixel" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=45A1MT+45FTMA+5P1E+5YZ75" alt="">
    </div>
  `;
}

const A8_BANNERS = {
  compact: `
    <div class="affiliate-banner is-compact" aria-label="PR">
      <span>PR</span>
      <a href="https://px.a8.net/svt/ejp?a8mat=45A1MT+45FTMA+5P1E+5Z6WX" rel="nofollow sponsored">
        <img width="100" height="60" alt="エンジニア向け転職サービスの広告" src="https://www25.a8.net/svt/bgt?aid=250731461251&wid=001&eno=01&mid=s00000026573001004000&mc=1">
      </a>
      <img class="tracking-pixel" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=45A1MT+45FTMA+5P1E+5Z6WX" alt="">
    </div>
  `,
  rectangle: () => renderSidePrBanner(),
  slim: `
    <div class="affiliate-banner is-slim" aria-label="PR">
      <a href="https://px.a8.net/svt/ejp?a8mat=45A1MT+45FTMA+5P1E+5ZEMP" rel="nofollow sponsored">
        <img width="2241" height="702" alt="エンジニア転職の市場価値を確認するPR" src="assets/images/uander-image.png">
      </a>
      <img class="tracking-pixel" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=45A1MT+45FTMA+5P1E+5ZEMP" alt="">
    </div>
  `,
  wide: () => renderPrBanner("is-tensyoku", "lp"),
  lp: () => renderPrBanner("is-tensyoku", "lp"),
  tensyoku: () => renderPrBanner("is-tensyoku", "under"),
  top: () => renderPrBanner("is-top-pr", "top"),
  under: () => renderPrBanner("is-tensyoku", "under")
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
      html.push(`<div class="article-inline-banner">${A8_BANNERS.tensyoku()}</div>`);
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
      <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt || article.title)}">
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
      <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt || article.title)}">
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
        <img src="${escapeHtml(article.image)}" alt="">
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

  document.title = `${article.title} | エンジニア転職ラボ`;
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
        <img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.alt || article.title)}">
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
