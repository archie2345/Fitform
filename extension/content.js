(function () {
  if (window.top !== window) return;
  const BRANDS = { "zara.com": "Zara", "hm.com": "H&M" };
  const BRAND = Object.entries(BRANDS).find(([h]) => location.hostname.endsWith(h))?.[1];

  // Read-only check for product-page metadata. Reads at most the first 50 KB of each JSON-LD block.
  function looksLikeShop() {
    if (BRAND) return true;
    if (document.querySelector('meta[property="og:type"][content*="product" i]')) return true;
    return [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => /"@type"\s*:\s*"Product"/.test((s.textContent || "").slice(0, 50000)));
  }

  const CSS = `
  :host{all:initial}
  *{box-sizing:border-box}
  .wrap{position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font:14px/1.4 system-ui,-apple-system,sans-serif;color:#3b2a20}
  .cond{font-family:Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif;font-weight:400;text-transform:uppercase}
  .panel{width:272px;background:#f7f1ea;border:1.5px solid #6b4a35;border-radius:20px;padding:16px}
  .panel[hidden]{display:none}
  .top{display:flex;justify-content:space-between;align-items:center}
  .logo{font:800 24px/1 "Cooper Black","Rockwell Extra Bold",Georgia,serif;color:#6b4a35;letter-spacing:-.03em}
  .x{background:none;border:0;font-size:22px;line-height:1;color:#6b4a35;cursor:pointer}
  h2{font-size:34px;line-height:.95;margin:12px 0}
  .tags{display:flex;gap:6px;flex-wrap:wrap}
  .tag{background:#6b4a35;color:#fff;border-radius:99px;padding:5px 16px;font-size:20px}
  .st{display:flex;gap:4px;margin:10px 0 2px}
  .st svg:nth-child(odd){transform:rotate(-7deg)}.st svg:nth-child(even){transform:rotate(6deg)}
  p{margin:6px 0 0;font-size:13px;color:#8a6a55}
  .fab{border:0;background:none;padding:0;cursor:pointer}
  button:focus-visible{outline:2px solid #3b2a20;outline-offset:2px;border-radius:99px}`;

  function make(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function mount(content, fabLines) {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "closed" });
    try { const s = new CSSStyleSheet(); s.replaceSync(CSS); root.adoptedStyleSheets = [s]; } catch (e) { return; }
    const wrap = make("div", "wrap"), panel = make("div", "panel");
    panel.hidden = true;
    const top = make("div", "top"), close = make("button", "x", "\u00d7");
    close.setAttribute("aria-label", "Close");
    top.append(make("span", "logo", "fitform"), close);
    panel.append(top, content);
    const fab = make("button", "fab");
    fab.setAttribute("aria-label", "FitForm size");
    fab.setAttribute("aria-expanded", "false");
    fab.appendChild(sticker(64, "#6b4a35", "#f7f1ea", fabLines));
    const toggle = open => { panel.hidden = !open; fab.setAttribute("aria-expanded", String(open)); };
    fab.addEventListener("click", () => toggle(panel.hidden));
    close.addEventListener("click", () => toggle(false));
    root.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });
    wrap.append(panel, fab);
    root.appendChild(wrap);
    document.documentElement.appendChild(host);
  }

  chrome.storage.local.get("profile", ({ profile }) => {
    if (!looksLikeShop()) return;
    const box = make("div");
    const p = profile && typeof profile === "object" ? profile : null;
    const r = p ? findSizes(p.gender, p) : { error: "none" };
    if (r.error) {
      box.append(make("h2", "cond", "Add your measurements"), make("p", null, "Click the FitForm icon in your toolbar. It takes a minute."));
      return mount(box, ["f"]);
    }
    const reg = regionForUrl(location.hostname, location.pathname), w = r.world;
    box.appendChild(make("h2", "cond", "Your size here"));
    const tags = make("div", "tags");
    tags.append(make("span", "tag cond", `Top: ${w.top.letter || "n/a"}`), make("span", "tag cond", `Bottom: ${w.bottom.letter || "n/a"}`));
    box.appendChild(tags);
    const st = make("div", "st");
    [["top", "#6b4a35", "#f7f1ea"], ["bottom", "#b08968", "#ffffff"]].forEach(([part, fill, ink]) => {
      if (w[part].values[reg] != null) st.appendChild(sticker(78, fill, ink, [`${reg} ${part}`, w[part].values[reg]]));
    });
    box.appendChild(st);
    const note = w.top.note || w.bottom.note;
    if (note) box.appendChild(make("p", null, note));
    const b = BRAND && r.brands.find(x => x.brand === BRAND);
    if (b) box.appendChild(make("p", null, `This brand's own chart: top ${b.top.size || "n/a"}, bottom ${b.bottom.size || "n/a"}.`));
    box.appendChild(make("p", null, "Estimate from your measurements. Stays in your browser."));
    mount(box, ["top", w.top.letter || "?"]);
  });
})();
