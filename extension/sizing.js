// FitForm sizing logic. Plain JS, no dependencies. Shared by the website and the extension.
// Body limits in cm. A size fits when every measurement is at or under its limit.
// top = [chest or bust, waist], bottom = [waist, hip]. null means the brand does not list it.
var CHARTS = {
  Zara: {
    women: {
      top: { XXS: [80, 58], XS: [82, 62], S: [86, 66], M: [90, 70], L: [96, 76], XL: [102, 82] },
      bottom: { XXS: [58, 86], XS: [62, 90], S: [66, 94], M: [70, 98], L: [76, 104], XL: [82, 110] },
      label: {
        XXS: { EU: 32, UK: 4, US: 0, AU: 4 }, XS: { EU: 34, UK: 6, US: 2, AU: 6 }, S: { EU: 36, UK: 8, US: 4, AU: 8 },
        M: { EU: 38, UK: 10, US: 6, AU: 10 }, L: { EU: 40, UK: 12, US: 8, AU: 12 }, XL: { EU: 42, UK: 14, US: 10, AU: 14 }
      },
      labelOn: ["top", "bottom"]
    },
    men: {
      top: { S: [93, null], M: [98, null], L: [103, null], XL: [108, null], XXL: [114, null] },
      bottom: { S: [80, null], M: [88, null], L: [91, null], XL: [101, null] },
      label: {
        S: { EU: 46, UK: 36, US: 36 }, M: { EU: 48, UK: 38, US: 38 }, L: { EU: 50, UK: 40, US: 40 },
        XL: { EU: 52, UK: 42, US: 42 }, XXL: { EU: 54, UK: 44, US: 44 }
      },
      labelOn: ["top"]
    }
  },
  "H&M": {
    women: {
      top: { XS: [80, 64], S: [88, 72], M: [96, 80], L: [104, 88], XL: [116, 100], XXL: [128, 112] },
      bottom: { XS: [64, 88], S: [72, 96], M: [80, 104], L: [88, 112], XL: [100, 122], XXL: [112, 132] },
      label: {
        XS: { EU: "32-34", UK: "6-8", US: "2-4", AU: "6-8" }, S: { EU: "36-38", UK: "10-12", US: "6-8", AU: "10-12" },
        M: { EU: "40-42", UK: "14-16", US: "10-12", AU: "14-16" }, L: { EU: "44-46", UK: "18-20", US: "14-16", AU: "18-20" },
        XL: { EU: "48-50", UK: "22-24", US: "18-20", AU: "22-24" }, XXL: { EU: "52-54", UK: "26-28", US: "22-24", AU: "26-28" }
      },
      labelOn: ["top", "bottom"]
    },
    men: {
      top: { XS: [84, 72], S: [92, 80], M: [100, 88], L: [108, 96], XL: [116, 104], XXL: [124, 112] },
      bottom: { XS: [72, 88], S: [80, 96], M: [88, 104], L: [96, 112], XL: [104, 120], XXL: [112, 128] },
      label: {
        XS: { EU: 42, UK: 32, US: 32 }, S: { EU: "44-46", UK: "34-36", US: "34-36" }, M: { EU: "48-50", UK: "38-40", US: "38-40" },
        L: { EU: "52-54", UK: "42-44", US: "42-44" }, XL: { EU: "56-58", UK: "46-48", US: "46-48" }, XXL: { EU: "60-62", UK: "50-52", US: "50-52" }
      },
      labelOn: ["top"]
    }
  }
};

var UNIVERSAL = {
  // Generic body limits in cm: [bust or chest, waist, hip]. Works for any brand without its own chart.
  women: {
    rows: { 4: [78, 60, 83.5], 6: [80.5, 62.5, 86], 8: [83, 65, 88.5], 10: [88, 70, 93.5], 12: [93, 75, 98.5], 14: [98, 80, 103.5], 16: [103, 85, 108.5], 18: [110.5, 92.5, 116], 20: [113, 98, 122], 22: [119, 104, 128], 24: [125, 110, 134], 26: [131, 116, 140], 28: [137, 122, 146] },
    regions: ["US", "UK", "EU", "AU", "FR", "IT", "JP"],
    values: function (n) { return { US: n - 4, UK: n, EU: n + 28, AU: n, FR: n + 30, IT: n + 32, JP: n + 1 }; },
    letter: function (n) { return n <= 4 ? "XXS" : n <= 6 ? "XS" : n <= 10 ? "S" : n <= 14 ? "M" : n <= 18 ? "L" : n <= 22 ? "XL" : n <= 26 ? "XXL" : "3XL"; }
  },
  men: {
    rows: { XS: [88, 78, 92], S: [93, 83, 97], M: [100, 90, 104], L: [105, 95, 108], XL: [112, 103, 114], XXL: [117, 108, 118], XXXL: [124, 115, 124] },
    regions: ["US", "UK", "EU"],
    labels: {
      XS: { US: 32, UK: 32, EU: 42 }, S: { US: "34-36", UK: "34-36", EU: "44-46" }, M: { US: "38-40", UK: "38-40", EU: "48-50" },
      L: { US: "42-44", UK: "42-44", EU: "52-54" }, XL: { US: 46, UK: 46, EU: 56 }, XXL: { US: 50, UK: 50, EU: 60 }, XXXL: { US: 54, UK: 54, EU: 64 }
    }
  }
};

var SOURCES = [
  { label: "Women worldwide, UK 4 to 18", url: "https://www.asos.com/us/discover/size-charts/women/tshirts-tops/", note: "ASOS body measurements" },
  { label: "Women worldwide, UK 20 to 28", url: "https://www.badrhino.com/womens-size-chart", note: "Retailer size guide with body measurements" },
  { label: "Women's US, UK, EU, AU conversions", url: "https://www.size.ly/conversion-charts/international-size-charts-women", note: "Sizely" },
  { label: "Women's FR, IT, JP conversions", url: "https://clippingexpertasia.com/blog/international-dress-size-chart/", note: "approximate" },
  { label: "Men worldwide, measurements", url: "https://www.didriksons.com/us/size-guide/size-guide-men", note: "Didriksons size guide" },
  { label: "Men's US, UK, EU numbers", url: "https://crosslist.com/size-charts/mens-clothing", note: "Crosslist" },
  { label: "Men's trousers, waist to size", url: "https://www.skatepro.ca/en/a449.htm", note: "Skatepro" },
  { label: "Zara, women and men", url: "https://www.size.ly/size-chart/zara", note: "Sizely, compiled from the official Zara size guide (updated July 2026)" },
  { label: "H&M, women", url: "https://sizecharter.com/brands/h-m/womens", note: "H&M US chart as listed on Sizecharter" },
  { label: "H&M, men", url: "https://sizecharter.com/brands/h-m/mens", note: "H&M US chart as listed on Sizecharter" }
];

var COUNTRY = { au: "AU", nz: "AU", uk: "UK", gb: "UK", ie: "UK", us: "US", ca: "US", jp: "JP", fr: "FR", it: "IT", de: "EU", es: "EU", nl: "EU", at: "EU", be: "EU", pt: "EU", se: "EU", dk: "EU", fi: "EU", pl: "EU", ch: "EU", eu: "EU" };

// Guess which size system a shop uses from its domain or first path segment (zara.com/au/en).
function regionForUrl(host, path) {
  var seg = (path.split("/")[1] || "").slice(0, 2).toLowerCase();
  if (/^\/[a-z]{2}([\/-]|$)/i.test(path) && COUNTRY[seg]) return COUNTRY[seg];
  return COUNTRY[host.split(".").pop()] || "US";
}

// Guess a region from the browser language, e.g. en-AU gives AU.
function regionForLocale(l) { return COUNTRY[((l || "").split("-")[1] || "").toLowerCase()] || "US"; }

var LIMITS = { chest: [60, 160, "bust or chest"], waist: [50, 150, "waist"], hip: [60, 160, "hips"], height: [120, 220, "height"] };

function split(rows) {
  var t = {}, b = {};
  for (var k in rows) { t[k] = [rows[k][0], rows[k][1]]; b[k] = [rows[k][1], rows[k][2]]; }
  return { top: t, bottom: b };
}

function fit(table, vals) {
  var sizes = Object.keys(table), best = -1, gap = 0;
  for (var i = 0; i < vals.length; i++) {
    if (table[sizes[0]][i] == null) continue;
    var k = sizes.findIndex(function (s) { return vals[i] <= table[s][i]; });
    if (k < 0) return { size: null, note: "Above this chart. Check the brand's extended sizes." };
    var g = table[sizes[k]][i] - vals[i];
    if (k > best || (k === best && g < gap)) { best = k; gap = g; }
  }
  var near = gap <= 1.5 && best < sizes.length - 1;
  return { size: sizes[best], note: near ? "Top of this size. Size up for a looser fit." : "" };
}

function worldSize(gender, part, res, body) {
  var U = UNIVERSAL[gender], n = Number(res.size), v;
  if (!res.size) return { letter: null, values: {}, note: res.note };
  if (gender === "women") v = U.values(n);
  else if (part === "top") v = U.labels[res.size];
  else { var w = Math.ceil(body.waist / 2.54 / 2) * 2; v = { US: w, UK: w, EU: w + 16 }; }
  return { letter: gender === "women" ? U.letter(n) : res.size, values: v, note: res.note };
}

function findSizes(gender, m) {
  if (gender !== "women" && gender !== "men") return { error: "Pick women or men." };
  var body = {};
  for (var k in LIMITS) {
    var v = Number(m[k]), L = LIMITS[k];
    if (m[k] === undefined || m[k] === "" || isNaN(v)) return { error: "Add your " + L[2] + "." };
    if (v < L[0] || v > L[1]) return { error: "Your " + L[2] + " should be between " + L[0] + " and " + L[1] + " cm." };
    body[k] = v;
  }
  var u = split(UNIVERSAL[gender].rows);
  var world = {
    regions: UNIVERSAL[gender].regions,
    top: worldSize(gender, "top", fit(u.top, [body.chest, body.waist]), body),
    bottom: worldSize(gender, "bottom", fit(u.bottom, [body.waist, body.hip]), body)
  };
  var brands = Object.keys(CHARTS).map(function (brand) {
    var g = CHARTS[brand][gender], row = { brand: brand };
    row.top = fit(g.top, [body.chest, body.waist]);
    row.bottom = fit(g.bottom, [body.waist, body.hip]);
    ["top", "bottom"].forEach(function (p) {
      var l = row[p].size && g.labelOn.indexOf(p) > -1 && g.label[row[p].size];
      row[p].label = l ? Object.keys(l).map(function (r) { return r + " " + l[r]; }).join(", ") : "";
    });
    return row;
  });
  var lo = gender === "women" ? 160 : 170, hi = gender === "women" ? 176 : 188;
  var length = body.height < lo ? "Look for petite or short lengths." : body.height > hi ? "Look for tall or long lengths." : "";
  return { world: world, brands: brands, length: length };
}
