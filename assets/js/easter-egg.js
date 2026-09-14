/*
 * Hidden ascii animation. Enter the Konami code anywhere on the site and a
 * bright yellow smiley with an eye patch draws itself in a terminal-style
 * overlay, Ghostty-homepage style: a monospace character grid redrawn every
 * frame so the rim shimmers and the face bobs. Escape or a click dismisses it.
 *
 * Everything is generated here from a few circles and ellipses, so there is no
 * frame data to ship. The black features (eyes, smile, patch, strap) are gaps
 * in the yellow, which on the black overlay reads as black.
 */
(function () {
  "use strict";

  var KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];

  var COLS = 64;
  var ROWS = 32;
  var ASPECT = 2;            // a monospace cell is ~twice as tall as it is wide
  var RADIUS = 13.5;         // face radius in rows
  var CAPTION = "hack the planet";
  var FPS = 12;

  var RIM = "·~+=*%";        // sparse to dense, cycled for the shimmer
  var FILL = "$@";           // interior characters

  var overlay = null;
  var pre = null;
  var caption = null;
  var rafId = 0;
  var startedAt = 0;
  var lastFrame = -1;
  var progress = 0;          // typed characters of the caption
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Deterministic per-cell noise so the shimmer is stable between frames of
  // the same tick and different from cell to cell.
  function noise(x, y, t) {
    var n = Math.sin(x * 12.9898 + y * 78.233 + t * 37.719) * 43758.5453;
    return n - Math.floor(n);
  }

  function insideEllipse(dx, dy, cx, cy, rx, ry) {
    var ex = (dx - cx) / rx;
    var ey = (dy - cy) / ry;
    return ex * ex + ey * ey <= 1;
  }

  // Distance from point (dx,dy) to the segment (x1,y1)-(x2,y2), in row units.
  function segmentDistance(dx, dy, x1, y1, x2, y2) {
    var vx = x2 - x1, vy = y2 - y1;
    var wx = dx - x1, wy = dy - y1;
    var len2 = vx * vx + vy * vy;
    var t = len2 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2)) : 0;
    var px = x1 + t * vx - dx;
    var py = y1 + t * vy - dy;
    return Math.sqrt(px * px + py * py);
  }

  // Which character belongs at a cell for a given tick. Coordinates are in
  // row units with the face centred at the origin; dx already has the cell
  // aspect ratio folded in so circles come out round.
  function cellChar(dx, dy, col, row, tick) {
    var d = Math.sqrt(dx * dx + dy * dy) / RADIUS;

    if (d > 1) {
      // A thin, sparse halo just outside the rim, like Ghostty's sparkles.
      if (d < 1.12 && noise(col, row, Math.floor(tick / 3)) > 0.93) {
        return "·";
      }
      return " ";
    }

    // Black features, drawn as gaps in the yellow.
    var eyeY = -0.28 * RADIUS;
    var eyeX = 0.36 * RADIUS;
    var eyeRx = 0.12 * RADIUS;
    var eyeRy = 0.14 * RADIUS;

    // Viewer's-left eye: a plain black eye.
    if (insideEllipse(dx, dy, -eyeX, eyeY, eyeRx, eyeRy)) return " ";

    // Viewer's-right eye: the patch, a little bigger than the eye it covers.
    var patchRx = eyeRx * 1.5;
    var patchRy = eyeRy * 1.3;
    if (insideEllipse(dx, dy, eyeX, eyeY, patchRx, patchRy)) return " ";

    // Strap: a thin band from the patch's upper edge over the forehead to the
    // far rim, and a short tail from its outer edge to the near rim.
    var strapW = 0.035 * RADIUS;
    if (segmentDistance(dx, dy, eyeX - patchRx * 0.6, eyeY - patchRy * 0.6,
                        -0.6 * RADIUS, -0.8 * RADIUS) < strapW) return " ";
    if (segmentDistance(dx, dy, eyeX + patchRx * 0.8, eyeY,
                        0.99 * RADIUS, -0.2 * RADIUS) < strapW) return " ";

    // Smile: a thick arc, lower part of a circle sitting a bit below centre.
    var sx = dx, sy = dy - 0.12 * RADIUS;
    var sr = Math.sqrt(sx * sx + sy * sy) / (0.58 * RADIUS);
    if (sy > 0.35 * RADIUS * 0.58 && Math.abs(sr - 1) < 0.13) return " ";

    // Yellow face: shimmering rim, mostly solid interior.
    if (d > 0.86) {
      var band = (1 - d) / 0.14;                          // 0 at the edge, 1 inward
      var idx = Math.floor(band * (RIM.length - 1) + noise(col, row, tick) * 1.6);
      idx = Math.max(0, Math.min(RIM.length - 1, idx));
      return RIM.charAt(idx);
    }
    var flicker = noise(col, row, Math.floor(tick / 2));
    return flicker > 0.97 ? "%" : FILL.charAt(flicker > 0.5 ? 1 : 0);
  }

  function renderFrame(tick) {
    var bob = reduceMotion ? 0 : Math.round(Math.sin(tick / 6) * 0.8);
    var cx = (COLS - 1) / 2;
    var cy = (ROWS - 1) / 2 + bob;
    var out = "";
    for (var row = 0; row < ROWS; row++) {
      var line = "";
      for (var col = 0; col < COLS; col++) {
        var dx = (col - cx) / ASPECT;
        var dy = row - cy;
        line += cellChar(dx, dy, col, row, tick);
      }
      out += line.replace(/\s+$/, "") + "\n";
    }
    pre.textContent = out;
  }

  function renderCaption(tick) {
    // Start typing once the face has been up for a moment, one char per tick.
    var typed = reduceMotion ? CAPTION.length : Math.max(0, Math.min(CAPTION.length, tick - 8));
    if (typed !== progress) {
      progress = typed;
      caption.textContent = CAPTION.slice(0, typed);
    }
    caption.classList.toggle("is-done", typed === CAPTION.length);
  }

  function fit() {
    // Size the grid so the whole face fits both ways, with a little margin.
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var byWidth = (vw * 0.92) / (COLS * 0.6);
    var byHeight = (vh * 0.86) / ((ROWS + 3) * 1.2);
    var size = Math.max(6, Math.min(byWidth, byHeight, 22));
    pre.style.fontSize = size + "px";
    caption.style.fontSize = Math.max(12, size * 1.4) + "px";
  }

  function loop(now) {
    var tick = Math.floor((now - startedAt) / (1000 / FPS));
    if (tick !== lastFrame) {
      lastFrame = tick;
      renderFrame(tick);
      renderCaption(tick);
    }
    rafId = window.requestAnimationFrame(loop);
  }

  function build() {
    overlay = document.createElement("div");
    overlay.className = "hack-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "hack the planet");

    pre = document.createElement("pre");
    pre.className = "hack-overlay__grid";
    pre.setAttribute("aria-hidden", "true");

    caption = document.createElement("p");
    caption.className = "hack-overlay__caption";

    overlay.appendChild(pre);
    overlay.appendChild(caption);
    overlay.addEventListener("click", hide);
    document.body.appendChild(overlay);
  }

  function show() {
    if (!overlay) build();
    if (overlay.classList.contains("is-open")) return;
    fit();
    progress = -1;
    lastFrame = -1;
    startedAt = window.performance.now();
    overlay.classList.add("is-open");
    document.documentElement.classList.add("hack-overlay-open");
    window.addEventListener("resize", fit);
    if (reduceMotion) {
      renderFrame(0);
      renderCaption(0);
    } else {
      rafId = window.requestAnimationFrame(loop);
    }
  }

  function hide() {
    if (!overlay || !overlay.classList.contains("is-open")) return;
    window.cancelAnimationFrame(rafId);
    window.removeEventListener("resize", fit);
    overlay.classList.remove("is-open");
    document.documentElement.classList.remove("hack-overlay-open");
  }

  var position = 0;

  function isTyping(target) {
    if (!target) return false;
    var tag = (target.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hide();
      return;
    }
    if (isTyping(event.target)) return;

    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === KONAMI[position]) {
      position++;
      if (position === KONAMI.length) {
        position = 0;
        show();
      }
    } else {
      // Allow the first key of the sequence to restart it immediately.
      position = key === KONAMI[0] ? 1 : 0;
    }
  });
})();
