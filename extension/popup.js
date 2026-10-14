const $ = s => document.querySelector(s), f = $("#f");
const EX = { women: { chest: 90, waist: 72, hip: 97, height: 165 }, men: { chest: 100, waist: 85, hip: 100, height: 178 } };
const LABEL = { chest: g => (g === "women" ? "Bust" : "Chest"), waist: () => "Waist", hip: () => "Hips", height: () => "Height" };
const FIELDS = ["chest", "waist", "hip", "height"];

function hints() {
  const g = f.gender.value;
  FIELDS.forEach(k => { f[k].placeholder = `${LABEL[k](g)}, e.g. ${EX[g][k]}`; });
}
f.addEventListener("change", hints);
hints();

document.querySelectorAll("nav button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("nav button").forEach(x => x.classList.toggle("on", x === b));
  ["size", "world", "measure"].forEach(t => { $("#tab-" + t).hidden = t !== b.dataset.tab; });
}));

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function render(p) {
  const r = findSizes(p.gender, p), box = $("#result"), world = $("#world");
  box.textContent = "";
  if (r.error) { box.appendChild(el("p", "err", r.error)); return false; }
  const reg = regionForLocale(navigator.language), w = r.world;

  box.appendChild(el("h2", "cond", "Your size"));
  const tags = el("div", "tags");
  tags.appendChild(el("span", "tag cond", `Top: ${w.top.letter || "n/a"}`));
  tags.appendChild(el("span", "tag cond", `Bottom: ${w.bottom.letter || "n/a"}`));
  box.appendChild(tags);

  const st = el("div", "stickers");
  [["top", "#6b4a35", "#f7f1ea"], ["bottom", "#b08968", "#ffffff"]].forEach(([part, fill, ink]) => {
    if (w[part].values[reg] != null) st.appendChild(sticker(84, fill, ink, [`${reg} ${part}`, w[part].values[reg]]));
  });
  box.appendChild(st);
  const note = w.top.note || w.bottom.note;
  if (note) box.appendChild(el("p", "note", note));
  if (r.length) box.appendChild(el("p", "note", r.length));

  world.textContent = "";
  const head = el("div", "row head");
  ["Region", "Top", "Bottom"].forEach(t => head.appendChild(el("span", null, t)));
  world.appendChild(head);
  w.regions.forEach(g => {
    const row = el("div", "row cond");
    [g, w.top.values[g] ?? "", w.bottom.values[g] ?? ""].forEach(t => row.appendChild(el("span", null, String(t))));
    world.appendChild(row);
  });
  return true;
}

function clean(src) {
  const p = { gender: src.gender === "men" ? "men" : "women" };
  FIELDS.forEach(k => { p[k] = Number(src[k]); });
  return p;
}

chrome.storage.local.get("profile", ({ profile }) => {
  if (!profile) return;
  const p = clean(profile);
  if (findSizes(p.gender, p).error) return;
  f.gender.value = p.gender;
  FIELDS.forEach(k => { f[k].value = p[k]; });
  hints();
  render(p);
});

f.addEventListener("submit", e => {
  e.preventDefault();
  const p = clean(Object.fromEntries(new FormData(f)));
  if (render(p)) chrome.storage.local.set({ profile: p });
});
