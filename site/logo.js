// 16×16 pixel mark: H = Sharky, the agent (ink; the gap in its head is the eye), Q = its belly and the
// question it is asking about what the human meant (accent).
export const LOGO = [
  "..........QQQQ..",
  ".........QQQQQQ.",
  ".........QQ..QQ.",
  "............QQQ.",
  "...........QQQ..",
  "......H....QQ...",
  ".....HH.........",
  "H...HHH....QQ...",
  "HH.HHHHHHH.QQ...",
  "HHHHHHHHHHHH....",
  ".HHHHHHHH.HHH...",
  "HHHHHHHHHHHHHH..",
  "HH.HHHHHHHHHH...",
  "H...QQQQQQQ.....",
  ".....HHQQ.......",
  "......H........."
];

export const LOGO_COLORS = {
  light: { ink: "#3f729c", accent: "#4fb3c2", bg: "#e8f6f8" },
  dark: { ink: "#dcf0f7", accent: "#7fd3df", bg: "#0b1d2c" }
};

export function logoPath(ch) {
  let d = "";
  LOGO.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== ch) continue;
      let w = 1;
      while (row[x + w] === ch) w++;
      d += `M${x} ${y}h${w}v1h-${w}z`;
      x += w - 1;
    }
  });
  return d;
}

export function logoSvg({ ink, accent, bg = null, pad = 0, size = null }) {
  const n = 16 + pad * 2;
  const dim = size ? ` width="${size}" height="${size}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${n} ${n}"${dim} shape-rendering="crispEdges">` +
    (bg ? `<rect x="${-pad}" y="${-pad}" width="${n}" height="${n}" fill="${bg}"/>` : "") +
    `<path fill="${ink}" d="${logoPath("H")}"/><path fill="${accent}" d="${logoPath("Q")}"/></svg>`;
}

export function drawLogo(ctx, x0, y0, cell, { ink, accent }) {
  LOGO.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === ".") continue;
      ctx.fillStyle = row[x] === "H" ? ink : accent;
      ctx.fillRect(x0 + x * cell, y0 + y * cell, cell, cell);
    }
  });
}
