// ─────────────────────────────────────────────
//  CONFIG — Update these when your token launches
// ─────────────────────────────────────────────
const CONFIG = {
  tokenAddress: "0xcomingsoon",

  // Optional: DexScreener pair address (overrides tokenAddress for chart)
  dexScreenerPair: "",

  // Uniswap swap page — auto-built from tokenAddress if left empty
  pumpFunUrl: "",

  twitter: "https://x.com/millycat_x",
  telegram: "https://t.me/millycathood",
};

const PLACEHOLDER_CA = "COMING_SOON — paste your token address in script.js";

function getChartId() {
  return CONFIG.dexScreenerPair || CONFIG.tokenAddress;
}

function getPumpFunUrl() {
  if (CONFIG.pumpFunUrl) return CONFIG.pumpFunUrl;
  if (CONFIG.tokenAddress) {
    return `https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=${CONFIG.tokenAddress}&chain=mainnet`;
  }
  return "https://app.uniswap.org/swap?inputCurrency=ETH&chain=mainnet";
}

function buildDexScreenerEmbedUrl(id) {
  const params = new URLSearchParams({
    embed: "1",
    loadChartSettings: "0",
    trades: "0",
    tabs: "0",
    info: "0",
    chartLeftToolbar: "0",
    chartDefaultOnMobile: "1",
    chartTheme: "dark",
    chartStyle: "1",
    chartType: "usd",
    interval: "15",
  });
  return `https://dexscreener.com/ethereum/${id}?${params.toString()}`;
}

function initContract() {
  const display = document.getElementById("ca-display");
  const copyBtn = document.getElementById("copy-ca");
  const toast = document.getElementById("copy-toast");
  const address = CONFIG.tokenAddress || PLACEHOLDER_CA;

  display.textContent = address;

  copyBtn.addEventListener("click", async () => {
    if (!CONFIG.tokenAddress) {
      toast.textContent = "Token address not set yet!";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
      return;
    }

    try {
      await navigator.clipboard.writeText(CONFIG.tokenAddress);
      copyBtn.classList.add("copied");
      copyBtn.querySelector("span").textContent = "Copied!";
      toast.textContent = "Contract address copied!";
      toast.classList.add("show");

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.querySelector("span").textContent = "Copy";
        toast.classList.remove("show");
      }, 2500);
    } catch {
      toast.textContent = "Copy failed — select and copy manually.";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
    }
  });
}

function initChart() {
  const iframe = document.getElementById("dexscreener-embed");
  const placeholder = document.getElementById("chart-placeholder");
  const link = document.getElementById("dexscreener-link");
  const chartId = getChartId();

  if (!chartId) {
    iframe.classList.add("hidden");
    placeholder.classList.remove("hidden");
    link.href = "https://dexscreener.com/ethereum";
    link.textContent = "Browse Ethereum pairs on DexScreener →";
    return;
  }

  iframe.src = buildDexScreenerEmbedUrl(chartId);
  link.href = `https://dexscreener.com/ethereum/${chartId}`;
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const header = document.querySelector(".site-header");

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initSocialLinks() {
  const pumpUrl = getPumpFunUrl();

  document.querySelectorAll("[data-pumpfun]").forEach((el) => {
    el.href = pumpUrl;
  });

  document.querySelectorAll("[data-telegram]").forEach((el) => {
    el.href = CONFIG.telegram;
  });

  document.querySelectorAll("[data-twitter]").forEach((el) => {
    el.href = CONFIG.twitter;
  });
}

function initReveals() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
  );

  nodes.forEach((el) => io.observe(el));
}

function initPawTrail() {
  const field = document.getElementById("paw-field");
  if (!field) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduced || !finePointer) return;

  let last = 0;
  const gap = 70;

  const onMove = (e) => {
    const now = performance.now();
    if (now - last < gap) return;
    last = now;

    const paw = document.createElement("img");
    paw.src = "asset/paw.svg";
    paw.alt = "";
    paw.className = "trail-paw";
    const rot = (Math.random() * 50 - 25).toFixed(1);
    paw.style.setProperty("--rot", `${rot}deg`);
    paw.style.left = `${e.clientX - 11}px`;
    paw.style.top = `${e.clientY - 11}px`;
    field.appendChild(paw);
    setTimeout(() => paw.remove(), 1100);
  };

  window.addEventListener("pointermove", onMove, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initContract();
  initChart();
  initNav();
  initSocialLinks();
  initReveals();
  initPawTrail();
});
