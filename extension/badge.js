// Scalloped sticker, drawn with the DOM API only (no innerHTML anywhere in this extension).
var SVGNS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs) {
  var e = document.createElementNS(SVGNS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function sticker(size, fill, ink, lines) {
  var pts = [], i, a, r;
  for (i = 0; i < 180; i++) {
    a = (i / 180) * Math.PI * 2;
    r = (46 * (1 + 0.06 * Math.cos(12 * a))) / 1.06;
    pts.push((50 + r * Math.cos(a)).toFixed(1) + "," + (50 + r * Math.sin(a)).toFixed(1));
  }
  var s = svgEl("svg", { viewBox: "0 0 100 100", width: size, height: size, "aria-hidden": "true" });
  s.appendChild(svgEl("polygon", { points: pts.join(" "), fill: fill }));
  lines.forEach(function (t, n) {
    var small = lines.length > 1 && n === 0;
    var tx = svgEl("text", {
      x: 50, y: lines.length === 1 ? 63 : small ? 40 : 68, "text-anchor": "middle", fill: ink,
      "font-family": "Impact,Haettenschweiler,Arial Narrow Bold,sans-serif",
      "font-size": small ? 15 : String(t).length > 3 ? 24 : 34
    });
    tx.textContent = String(t);
    s.appendChild(tx);
  });
  return s;
}
