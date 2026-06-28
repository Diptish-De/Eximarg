import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// ── Shared animation wrappers ────────────────────────────────────────────────

function Up({ children, delay = 0, className = "", }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "", }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Globe Canvas Component ───────────────────────────────────────────────────



const INDIA = { lat: 20, lon: 78 };

const DESTINATIONS = [
  { name: "Frankfurt",  lat: 50,  lon: 8   },
  { name: "New York",   lat: 41,  lon: -74 },
  { name: "Tokyo",      lat: 35,  lon: 139 },
  { name: "Dubai",      lat: 25,  lon: 55  },
  { name: "London",     lat: 51,  lon: 0   },
  { name: "Sydney",     lat: -34, lon: 151 },
  { name: "Shanghai",   lat: 31,  lon: 121 },
  { name: "São Paulo",  lat: -23, lon: -46 },
];

function slerp(lat1, lon1, lat2, lon2, t) {
  const φ1 = (lat1 * Math.PI) / 180, λ1 = (lon1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180, λ2 = (lon2 * Math.PI) / 180;
  const v1 = [Math.cos(φ1) * Math.cos(λ1), Math.cos(φ1) * Math.sin(λ1), Math.sin(φ1)];
  const v2 = [Math.cos(φ2) * Math.cos(λ2), Math.cos(φ2) * Math.sin(λ2), Math.sin(φ2)];
  const d = Math.min(1, Math.max(-1, v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]));
  const omega = Math.acos(d);
  if (omega < 0.001) return [lat1, lon1];
  const so = Math.sin(omega);
  const a = Math.sin((1 - t) * omega) / so;
  const b = Math.sin(t * omega) / so;
  const vt = [a*v1[0]+b*v2[0], a*v1[1]+b*v2[1], a*v1[2]+b*v2[2]];
  return [
    (Math.asin(Math.min(1, Math.max(-1, vt[2]))) * 180) / Math.PI,
    (Math.atan2(vt[1], vt[0]) * 180) / Math.PI,
  ];
}

const ARC_STEPS = 120;
const ARC_PATHS = DESTINATIONS.map((d) => {
  const pts = [];
  for (let i = 0; i <= ARC_STEPS; i++) {
    pts.push(slerp(INDIA.lat, INDIA.lon, d.lat, d.lon, i / ARC_STEPS));
  }
  return pts;
});

// Animation cycle per line (seconds)
const CYCLE = 5.2;
const GROW_END  = 0.42;
const HOLD_END  = 0.72;
const FADE_END  = 0.90;

function GlobeCanvas({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId;
    let rotation = -INDIA.lon;
    const startTime = performance.now();

    function project(lat, lon, S) {
      const R = S * 0.41;
      const φ = (lat * Math.PI) / 180;
      const λ = ((lon + rotation) * Math.PI) / 180;
      return {
        x: S / 2 + R * Math.cos(φ) * Math.sin(λ),
        y: S / 2 - R * Math.sin(φ),
        depth: Math.cos(φ) * Math.cos(λ),
        R,
      };
    }

    function draw(now) {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.offsetWidth;
      if (!cssW) { rafId = requestAnimationFrame(draw); return; }
      if (canvas.width !== cssW * DPR || canvas.height !== cssW * DPR) {
        canvas.width = cssW * DPR;
        canvas.height = cssW * DPR;
      }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const S = cssW;
      const R = S * 0.41;
      const cx = S / 2, cy = S / 2;
      const t = (now - startTime) / 1000;

      ctx.clearRect(0, 0, S, S);

      // Outer atmosphere
      const atm = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.3);
      atm.addColorStop(0, "rgba(72,117,239,0.35)");
      atm.addColorStop(0.5, "rgba(72,117,239,0.1)");
      atm.addColorStop(1, "rgba(72,117,239,0)");
      ctx.fillStyle = atm;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2); ctx.fill();

      // Dark sphere
      const sph = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.22, R * 0.05, cx, cy, R);
      sph.addColorStop(0, "#1E3566");
      sph.addColorStop(0.55, "#0C1C45");
      sph.addColorStop(1, "#050E2A");
      ctx.fillStyle = sph;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

      // Grid latitudes
      for (const lat of [-60, -30, 0, 30, 60]) {
        ctx.beginPath(); let pen = false;
        for (let lon = -180; lon <= 181; lon += 1.2) {
          const p = project(lat, lon, S);
          if (p.depth > 0) { pen ? ctx.lineTo(p.x, p.y) : (ctx.moveTo(p.x, p.y), (pen = true)); } else pen = false;
        }
        ctx.strokeStyle = lat === 0 ? "rgba(100,150,255,0.22)" : "rgba(100,150,255,0.1)";
        ctx.lineWidth = lat === 0 ? 0.8 : 0.5; ctx.stroke();
      }
      // Grid longitudes
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath(); let pen = false;
        for (let lat = -88; lat <= 88; lat += 1.2) {
          const p = project(lat, lon, S);
          if (p.depth > 0) { pen ? ctx.lineTo(p.x, p.y) : (ctx.moveTo(p.x, p.y), (pen = true)); } else pen = false;
        }
        ctx.strokeStyle = "rgba(100,150,255,0.1)"; ctx.lineWidth = 0.5; ctx.stroke();
      }

      // Trade arcs
      ARC_PATHS.forEach((pts, i) => {
        const elapsed = t - i * 0.7;
        if (elapsed < 0) return;
        const phase = (elapsed % CYCLE) / CYCLE;
        let progress = 0, alpha = 0;
        if (phase < GROW_END) { progress = phase / GROW_END; alpha = Math.min(1, progress * 4); }
        else if (phase < HOLD_END) { progress = 1; alpha = 1; }
        else if (phase < FADE_END) { progress = 1; alpha = 1 - (phase - HOLD_END) / (FADE_END - HOLD_END); }
        if (alpha <= 0) return;
        const drawn = Math.floor(progress * pts.length);

        ctx.beginPath(); let pen = false;
        for (let j = 0; j <= drawn && j < pts.length; j++) {
          const p = project(pts[j][0], pts[j][1], S);
          if (p.depth > 0.06) { pen ? ctx.lineTo(p.x, p.y) : (ctx.moveTo(p.x, p.y), (pen = true)); } else pen = false;
        }
        ctx.strokeStyle = `rgba(96,191,255,${alpha * 0.9})`; ctx.lineWidth = Math.max(1, S * 0.004); ctx.lineCap = "round"; ctx.stroke();

        if (progress < 1 && drawn > 0 && drawn < pts.length) {
          const hp = project(pts[drawn][0], pts[drawn][1], S);
          if (hp.depth > 0.06) {
            ctx.beginPath(); ctx.arc(hp.x, hp.y, S * 0.008, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150,220,255,${alpha})`; ctx.fill();
          }
        }

        if (progress > 0.88) {
          const dest = DESTINATIONS[i];
          const dp = project(dest.lat, dest.lon, S);
          if (dp.depth > 0.06) {
            const a2 = alpha * Math.min(1, (progress - 0.88) / 0.12);
            const dotR = S * 0.008;
            const pv = Math.sin(t * 3.5 + i * 1.4) * 0.5 + 0.5;
            ctx.beginPath(); ctx.arc(dp.x, dp.y, dotR * 2 + pv * dotR * 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(96,191,255,${a2 * 0.2 * (1 - pv)})`; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.arc(dp.x, dp.y, dotR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150,220,255,${a2})`; ctx.fill();
            if (a2 > 0.5) {
              const fs = Math.max(8, S * 0.022);
              ctx.font = `${fs}px "DM Mono", monospace`;
              ctx.fillStyle = `rgba(150,200,255,${a2 * 0.7})`;
              ctx.textAlign = dp.x < cx ? "right" : "left";
              ctx.fillText(dest.name, dp.x + (dp.x < cx ? -dotR * 2 : dotR * 2), dp.y + fs * 0.35);
            }
          }
        }
      });

      ctx.restore();

      // Edge rim glow
      const rim = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
      rim.addColorStop(0, "rgba(72,117,239,0)");
      rim.addColorStop(0.85, "rgba(80,130,255,0)");
      rim.addColorStop(1, "rgba(110,160,255,0.45)");
      ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(110,160,255,0.55)"; ctx.lineWidth = 1.5; ctx.stroke();

      // India dot — 3 pulsing rings
      const ip = project(INDIA.lat, INDIA.lon, S);
      if (ip.depth > 0.05) {
        const dotR = S * 0.013;
        const glow = ctx.createRadialGradient(ip.x, ip.y, 0, ip.x, ip.y, dotR * 6);
        glow.addColorStop(0, "rgba(245,158,11,0.65)");
        glow.addColorStop(0.5, "rgba(245,158,11,0.1)");
        glow.addColorStop(1, "rgba(245,158,11,0)");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ip.x, ip.y, dotR * 6, 0, Math.PI * 2); ctx.fill();
        for (let r = 0; r < 3; r++) {
          const ph = ((t * 1.4 + r * 0.33) % 1);
          ctx.beginPath(); ctx.arc(ip.x, ip.y, dotR * (1.5 + ph * 5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245,158,11,${0.55 * (1 - ph)})`; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(ip.x, ip.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = "#F59E0B"; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = Math.max(1, S * 0.003); ctx.stroke();
        const fs = Math.max(8, S * 0.024);
        ctx.font = `600 ${fs}px "DM Mono", monospace`;
        ctx.fillStyle = "rgba(245,190,80,0.9)"; ctx.textAlign = "center";
        ctx.fillText("INDIA", ip.x, ip.y + dotR * 3.5);
      }

      rotation += 0.022;
      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return <canvas ref={canvasRef} className={`w-full aspect-square ${className}`} />;
}

// ── Flat World Map ───────────────────────────────────────────────────────────

const MAP_W = 860;
const MAP_H = 430;

function ll(lat, lon) {
  const x = ((lon + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function ptsToD(pts) {
  return pts.map(([lat, lon], i) => `${i === 0 ? "M" : "L"}${ll(lat, lon)}`).join(" ") + "Z";
}

const LAND_MASSES = [
  // North America
  [[72,-140],[72,-82],[62,-64],[47,-53],[25,-80],[8,-77],[8,-83],[15,-87],[22,-105],[30,-117],[48,-124],[60,-138],[72,-140]],
  // South America
  [[12,-72],[0,-50],[-5,-35],[-20,-40],[-34,-57],[-55,-68],[-50,-75],[-22,-75],[0,-78],[10,-75],[12,-72]],
  // Europe
  [[71,28],[58,5],[44,-1],[36,-5],[36,8],[38,23],[42,28],[47,30],[55,22],[58,26],[64,27],[68,18],[71,28]],
  // Africa
  [[37,-5],[37,15],[22,38],[11,44],[-12,42],[-35,20],[-35,27],[-17,37],[5,10],[15,-17],[37,-5]],
  // Asia (main body, India region included)
  [[72,25],[72,142],[50,145],[35,140],[23,120],[10,104],[0,104],[-8,116],[10,100],[22,92],[22,86],[8,77],[8,68],[22,58],[30,48],[40,50],[38,42],[42,28],[72,25]],
  // Australia
  [[-16,124],[-14,136],[-16,145],[-28,154],[-38,148],[-42,146],[-38,140],[-30,115],[-22,114],[-16,124]],
  // Greenland
  [[83,-45],[83,-18],[76,-18],[70,-24],[65,-42],[68,-52],[72,-55],[76,-55],[83,-45]],
  // Japan
  [[34,130],[40,141],[45,141],[43,145],[43,141],[34,130]],
  // UK
  [[50,-5],[58,-3],[58,0],[51,2],[50,-5]],
];

const INDIA_OUTLINE = [
  [35,73],[32,78],[28,84],[20,88],[10,79],[8,77],[8,78],[15,72],[23,68],[35,73],
];

function arcD(destLat, destLon) {
  const [x1, y1] = [((INDIA.lon + 180) / 360) * MAP_W, ((90 - INDIA.lat) / 180) * MAP_H];
  const [x2, y2] = [((destLon + 180) / 360) * MAP_W, ((90 - destLat) / 180) * MAP_H];
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${((x1 + x2) / 2).toFixed(1)},${((y1 + y2) / 2 - dist * 0.28).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function FlatWorldMap() {
  const indiaCX = ((INDIA.lon + 180) / 360) * MAP_W;
  const indiaCY = ((90 - INDIA.lat) / 180) * MAP_H;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label="World map showing trade routes from India"
    >
      {/* Ocean */}
      <rect width={MAP_W} height={MAP_H} fill="#EBF4FF" rx="12" />

      {/* Grid lines */}
      {[-60, -30, 0, 30, 60].map((lat) => {
        const y = ((90 - lat) / 180) * MAP_H;
        return <line key={`lat${lat}`} x1={0} y1={y} x2={MAP_W} y2={y} stroke="rgba(72,117,239,0.1)" strokeWidth="0.6" />;
      })}
      {[-120, -60, 0, 60, 120].map((lon) => {
        const x = ((lon + 180) / 360) * MAP_W;
        return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={MAP_H} stroke="rgba(72,117,239,0.1)" strokeWidth="0.6" />;
      })}

      {/* Landmasses */}
      {LAND_MASSES.map((pts, i) => (
        <path key={i} d={ptsToD(pts)} fill="rgba(72,117,239,0.13)" stroke="rgba(72,117,239,0.22)" strokeWidth="0.7" />
      ))}

      {/* India highlight */}
      <path d={ptsToD(INDIA_OUTLINE)} fill="rgba(245,158,11,0.22)" stroke="#F59E0B" strokeWidth="1.2" />

      {/* Trade arcs */}
      {DESTINATIONS.map((dest, i) => (
        <motion.path
          key={dest.name}
          d={arcD(dest.lat, dest.lon)}
          fill="none"
          stroke="#4875EF"
          strokeWidth="1.6"
          strokeDasharray="5 3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.65 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, delay: 0.3 + i * 0.18, ease: "easeOut" }}
        />
      ))}

      {/* Destination dots */}
      {DESTINATIONS.map((dest, i) => {
        const dx = ((dest.lon + 180) / 360) * MAP_W;
        const dy = ((90 - dest.lat) / 180) * MAP_H;
        return (
          <motion.g key={dest.name}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.3 + i * 0.18 + 1.4 }}
          >
            <circle cx={dx} cy={dy} r="5" fill="#4875EF" opacity="0.85" />
            <text x={dx} y={dy - 7} fontSize="9" fill="#4875EF" fillOpacity="0.7" textAnchor="middle"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {dest.name}
            </text>
          </motion.g>
        );
      })}

      {/* India origin */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.circle cx={indiaCX} cy={indiaCY} r="14" fill="rgba(245,158,11,0.15)"
          animate={{ r: [10, 18, 10], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx={indiaCX} cy={indiaCY} r="6" fill="#F59E0B" />
        <circle cx={indiaCX} cy={indiaCY} r="6" fill="none" stroke="white" strokeWidth="1.5" />
        <text x={indiaCX} y={indiaCY + 17} fontSize="10" fill="#D97706" textAnchor="middle" fontWeight="600"
          style={{ fontFamily: "'DM Mono', monospace" }}>
          INDIA
        </text>
      </motion.g>
    </svg>
  );
}

// ── Hero Visual (product card stack) ────────────────────────────────────────

function HeroVisual() {
  return (
    <FadeIn delay={0.3} className="relative flex justify-center items-start pt-4 md:pt-0">
      <div className="relative w-full max-w-[420px]">

        {/* Background card — stats dashboard, peeking above */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute top-0 left-6 right-0 rounded-2xl px-5 py-4"
          style={{
            background: "#F4F6FF",
            border: "1px solid rgba(72,117,239,0.13)",
            boxShadow: "0 2px 16px rgba(15,23,64,0.06)",
          }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}
          >
            Live Dashboard
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { n: "₹1.8 Cr", l: "Revenue" },
              { n: "47",      l: "Buyers"  },
              { n: "22",      l: "Countries" },
            ].map((s) => (
              <div key={s.l} className="text-center rounded-xl py-2" style={{ background: "rgba(72,117,239,0.07)" }}>
                <p className="font-bold text-sm" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740" }}>{s.n}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{s.l}</p>
              </div>
            ))}
          </div>
          {/* Mini activity bar */}
          <div className="flex items-center gap-1.5">
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <span className="text-xs" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Shipment #183 en route to Hamburg</span>
          </div>
        </motion.div>

        {/* Main journey card — front */}
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mt-20 rounded-2xl p-6"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(15,23,64,0.07)",
            boxShadow: "0 24px 60px rgba(15,23,64,0.13), 0 4px 16px rgba(15,23,64,0.06)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>
                Your Journey
              </p>
              <p className="font-bold text-base" style={{ color: "#0F1740" }}>3 of 8 steps complete</p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "rgba(72,117,239,0.1)", color: "#4875EF" }}
            >
              38%
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full mb-5" style={{ background: "#EBF0FF" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(to right, #4875EF, #7BA4FF)" }}
              initial={{ width: "0%" }}
              whileInView={{ width: "38%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2.5">
            {[
              { label: "Business Identity",  done: true  },
              { label: "IEC Registration",   done: true  },
              { label: "Company Profile",    done: true  },
              { label: "Product Catalogue",  done: false, active: true },
              { label: "Buyer Discovery",    done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: s.done ? "#4875EF" : s.active ? "#EBF0FF" : "transparent",
                    border: s.done ? "none" : s.active ? "2px solid #4875EF" : "2px solid rgba(15,23,64,0.12)",
                    color: s.done ? "#fff" : "transparent",
                  }}
                >
                  {s.done ? "✓" : ""}
                </div>
                <span
                  className="text-sm flex-1"
                  style={{ color: s.done ? "#0F1740" : s.active ? "#4875EF" : "#C8CEDF", fontWeight: s.active ? 600 : 400 }}
                >
                  {s.label}
                </span>
                {s.active && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#EBF0FF", color: "#4875EF" }}>
                    Up next
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(72,117,239,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 group"
            style={{ background: "#4875EF", color: "#fff", boxShadow: "0 3px 12px rgba(72,117,239,0.3)" }}
          >
            <span>Continue Your Journey</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </motion.button>
        </motion.div>

        {/* Floating badge — top right */}
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 -right-3 md:-right-8 rounded-xl px-4 py-2.5 shadow-xl z-20"
          style={{ background: "#0F1740", boxShadow: "0 8px 24px rgba(15,23,64,0.28)" }}
        >
          <p className="text-white text-xs font-semibold whitespace-nowrap">🎉 First buyer found!</p>
          <p className="text-white/50 text-xs">Hamburg, Germany</p>
        </motion.div>

        {/* Floating badge — bottom left */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-4 -left-3 md:-left-8 rounded-xl px-4 py-2.5 shadow-lg z-20"
          style={{ background: "#fff", border: "1px solid rgba(15,23,64,0.08)", boxShadow: "0 8px 24px rgba(15,23,64,0.10)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#22C55E" }}>↑ Shipment departed</p>
          <p className="text-xs" style={{ color: "#9BA3C4" }}>Container: MSKU 483291</p>
        </motion.div>

      </div>
    </FadeIn>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────

const MILESTONES = [
  { step: "01", title: "Business Identity",   desc: "Register your exporter profile — PAN, Aadhar, bank details, all in one guided flow.", icon: "◈" },
  { step: "02", title: "IEC & Verification",  desc: "Obtain your Importer Exporter Code and RCMC through our step-by-step compliance wizard.", icon: "◎" },
  { step: "03", title: "Company Profile",     desc: "Build a verified export profile that international buyers trust at first glance.", icon: "▣" },
  { step: "04", title: "Product Catalogue",   desc: "List your products with export-ready specs, certifications, and pricing in multiple currencies.", icon: "◆" },
  { step: "05", title: "Buyer Discovery",     desc: "AI matches your products to qualified buyers across 190+ countries, filtered by country and order size.", icon: "◉" },
  { step: "06", title: "Invoicing & Docs",    desc: "Generate commercial invoices, packing lists, certificates of origin — correctly, every time.", icon: "▤" },
  { step: "07", title: "Shipment Tracking",   desc: "Book freight, generate AWBs, and track every container from Mumbai to Munich in real time.", icon: "◎" },
  { step: "08", title: "Scale Globally",      desc: "Manage payments, GST refunds, and buyer relationships grow into new markets.", icon: "◈" },
];

const DASHBOARD_STATS = [
  { label: "Total Revenue",  value: "₹1.8 Cr",  delta: "+24%",          up: true  },
  { label: "Active Buyers",  value: "47",        delta: "+8 this month", up: true  },
  { label: "Shipments",      value: "183",       delta: "12 in transit", up: true  },
  { label: "Countries",      value: "22",        delta: "+3 new",        up: true  },
];

const ACTIVITY = [
  { event: "Shipment #183 departed Mumbai",          time: "2h ago",     dot: "#4875EF" },
  { event: "New buyer inquiry — Stockholm, Sweden",  time: "5h ago",     dot: "#4875EF" },
  { event: "Invoice #047 approved by Müller GmbH",   time: "Yesterday",  dot: "#22C55E" },
  { event: "Certificate of Origin issued — FIEO",    time: "Yesterday",  dot: "#22C55E" },
  { event: "RCMC renewal completed",                 time: "3 days ago", dot: "#22C55E" },
];

// ── First Buyer Story data ───────────────────────────────────────────────────

const TRADE_STEPS = [
  {
    label: "INQUIRY ARRIVES",
    desc: "Hamburg Wholesale GmbH requests custom basmati grades.",
    dot: "#F59E0B",
  },
  {
    label: "AI REPLY DRAFTED",
    desc: "Claude drafts professional trade spec & pricing.",
    dot: "#F59E0B",
  },
  {
    label: "PROFORMA INVOICE",
    desc: "Eximarg compiles invoice, packing lists, & trade declarations.",
    dot: "#F59E0B",
  },
  {
    label: "PAYMENT SECURED",
    desc: "Escrow deposit confirmed. No escrow trade margin.",
    dot: "#F59E0B",
  },
  {
    label: "VESSEL DEPARTS",
    desc: "Nhava Sheva at Mumbai port. Bound for Hamburg.",
    dot: "#F59E0B",
  },
];

const TRADE_CARDS = [
  {
    title: "Inquiry Received",
    rows: [
      { label: "FROM", value: "Hamburg Wholesale GmbH", mono: false },
      { label: "SUBJECT", value: "Basmati Rice — CIF Hamburg Port", mono: false },
      { label: "MESSAGE", value: "\"I need a sample container of Basmati 1121 India Rice. Please quote CIF Hamburg Port. Urgent.\"", mono: false },
    ],
    statusLabel: null,
    statusValue: null,
  },
  {
    title: "AI Consultation Output",
    rows: [
      { label: "STATUS", value: "Draft Ready", mono: true },
      { label: "OUTPUT", value: "Drafting CIF price proposal based on FOB $1,000.00 per MT... Auto-calculated ocean freight: $180/MT. APEDA compliance checks passed. HS Code 1006.30 verified.", mono: false },
    ],
    statusLabel: "STATUS",
    statusValue: "Draft Ready",
  },
  {
    title: "Proforma Invoice Created",
    rows: [
      { label: "EXPORTER", value: "Ravi Exports Pvt. Ltd., Karnal", mono: false },
      { label: "INVOICE NO.", value: "INV-2024-044", mono: true },
      { label: "TOTAL VALUE", value: "$44,756 FOB  (+$1,974 Ocean Freight = $46,730 CIF)", mono: false },
      { label: "STATUS", value: "CONFIRMED", mono: true },
    ],
    statusLabel: "STATUS",
    statusValue: "CONFIRMED",
  },
  {
    title: "Escrow Payment Secured",
    rows: [
      { label: "STATUS", value: "Wire Confirmed", mono: true },
      { label: "AMOUNT", value: "USD 46,730 deposited to EXIMARG Escrow Trade Wallet.", mono: false },
      { label: "NOTE", value: "Clearance authorized. Goods released for shipment preparation.", mono: false },
    ],
    statusLabel: "STATUS",
    statusValue: "Wire Confirmed",
  },
  {
    title: "Nhava Sheva Port Dispatch",
    rows: [
      { label: "STATUS", value: "NOW: DEPARTED", mono: true },
      { label: "CONTAINER", value: "MSKU 7841293 — 20ft Reefer", mono: true },
      { label: "UPDATE", value: "Container loaded. Vessel cleared customs. Left Nhava Sheva port, Mumbai. Live logistics tracker active.", mono: false },
    ],
    statusLabel: "STATUS",
    statusValue: "NOW: DEPARTED",
  },
];

// ── First Buyer Story component ──────────────────────────────────────────────

function FirstBuyerStory() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % TRADE_STEPS.length);
    }, 3200);
  };

  useEffect(() => {
    if (!paused) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  const handleStepClick = (i) => {
    setActive(i);
    startTimer();
  };

  const card = TRADE_CARDS[active];

  return (
    <section
      className="relative py-14 px-6 md:px-16 xl:px-24 overflow-hidden"
      style={{ background: "#FFFAEB" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Subtle warm dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <div className="relative text-center mb-10 max-w-2xl mx-auto">
        <Up>
          <p
            className="text-xs font-bold tracking-[0.28em] uppercase mb-4"
            style={{ color: "#D97706", fontFamily: "'DM Mono', monospace" }}
          >
            Live Transaction Flow
          </p>
        </Up>
        <Up delay={0.08}>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#0F1740",
              lineHeight: 1.1,
            }}
          >
            Germany discovers<br />your product.
          </h2>
        </Up>
        <Up delay={0.15}>
          <p className="text-base mt-4 leading-relaxed" style={{ color: "#6B7294" }}>
            Watch your Basmati Rice transaction flow from initial buyer discovery
            in Hamburg directly to port loading.
          </p>
        </Up>
      </div>

      {/* Body: steps + card */}
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-[38%_62%] gap-10 items-start">

        {/* ── Left: step list ── */}
        <div className="flex flex-col gap-0">
          {TRADE_STEPS.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                className="text-left flex items-start gap-4 px-4 py-3 rounded-xl transition-all duration-300 group"
                style={{
                  background: isActive ? "#ffffff" : "transparent",
                  boxShadow: isActive ? "0 2px 16px rgba(15,23,64,0.08)" : "none",
                  border: isActive ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                {/* Indicator */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                  <div
                    className="w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0"
                    style={{
                      background: isActive ? "#F59E0B" : isDone ? "#86EFAC" : "rgba(15,23,64,0.15)",
                      boxShadow: isActive ? "0 0 0 4px rgba(245,158,11,0.2)" : "none",
                    }}
                  />
                  {i < TRADE_STEPS.length - 1 && (
                    <div
                      className="w-px transition-all duration-500"
                      style={{
                        height: "32px",
                        background: isDone ? "rgba(134,239,172,0.5)" : "rgba(15,23,64,0.1)",
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 pb-2">
                  <p
                    className="text-xs font-bold tracking-[0.2em] uppercase mb-1 transition-colors duration-200"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: isActive ? "#D97706" : isDone ? "#16A34A" : "#9BA3C4",
                    }}
                  >
                    {step.label}
                  </p>
                  <p
                    className="text-sm leading-snug transition-colors duration-200"
                    style={{ color: isActive ? "#374151" : "#9BA3C4", fontWeight: isActive ? 500 : 400 }}
                  >
                    {step.desc}
                  </p>
                </div>

                {/* Progress bar for active */}
                {isActive && !paused && (
                  <motion.div
                    key={active}
                    className="absolute bottom-0 left-0 h-0.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.2, ease: "linear" }}
                    style={{ background: "#F59E0B", position: "relative", marginTop: "auto" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Right: animated card ── */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,64,0.07)",
                boxShadow: "0 12px 48px rgba(15,23,64,0.1)",
              }}
            >
              {/* Card top bar */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: "rgba(15,23,64,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>
                    Order #1
                  </span>
                  <span
                    className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{ background: "#FEF3C7", color: "#D97706", fontFamily: "'DM Mono', monospace" }}
                  >
                    Transaction Flow
                  </span>
                </div>
                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {TRADE_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === active ? "16px" : "6px",
                        height: "6px",
                        background: i === active ? "#F59E0B" : i < active ? "#86EFAC" : "rgba(15,23,64,0.12)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-6">
                <h3
                  className="mb-5"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#0F1740",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.title}
                </h3>

                <div className="space-y-3">
                  {card.rows.map((row, i) => (
                    <div
                      key={i}
                      className="rounded-lg px-4 py-3"
                      style={{ background: "#F8F9FF", border: "1px solid rgba(15,23,64,0.05)" }}
                    >
                      <p
                        className="text-xs font-bold tracking-[0.18em] uppercase mb-1"
                        style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}
                      >
                        {row.label}
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: row.label === "STATUS" ? "#D97706" : "#374151",
                          fontFamily: row.mono ? "'DM Mono', monospace" : "inherit",
                          fontWeight: row.label === "STATUS" ? 700 : 400,
                        }}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card footer */}
              <div
                className="flex items-center justify-between px-6 py-4 border-t"
                style={{ borderColor: "rgba(15,23,64,0.06)", background: "#FAFBFF" }}
              >
                <p
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}
                >
                  Logistics Flow
                </p>
                <button
                  className="text-sm font-semibold transition-colors duration-200 hover:opacity-70"
                  style={{ color: "#D97706" }}
                >
                  Simulate Your Trade →
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Readiness XP badge — bottom right corner */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-5 -right-4 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,64,0.07)",
              boxShadow: "0 8px 24px rgba(15,23,64,0.1)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "#FEF3C7", color: "#D97706" }}
            >
              {active === TRADE_STEPS.length - 1 ? "100" : `${active * 25}`}
              <br />
              <span className="text-[8px]">XP</span>
            </div>
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}
              >
                Readiness Index
              </p>
              <p className="text-xs font-semibold" style={{ color: "#D97706" }}>
                {active === TRADE_STEPS.length - 1 ? "100" : active * 25} XP Earned
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Journey Button ──────────────────────────────────────────────────────────

function JourneyButton({ children,
  onClick,
  variant = "primary",
  size = "md",
  className = "", }) {
  const pad = { sm: "px-5 py-2", md: "px-7 py-3.5", lg: "px-10 py-4" }[size];
  const txt = { sm: "text-sm", md: "text-sm", lg: "text-base" }[size];

  const baseStyle =
    variant === "primary"
      ? { background: "#4875EF", color: "#fff", boxShadow: "0 4px 20px rgba(72,117,239,0.38)" }
      : variant === "ghost-dark"
      ? { background: "transparent", color: "#0F1740" }
      : { background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" };

  return (
    <motion.button
      onClick={onClick}
      whileHover={variant === "primary"
        ? { y: -2, boxShadow: "0 10px 32px rgba(72,117,239,0.52)" }
        : { opacity: 0.75 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={`rounded-full font-semibold flex items-center gap-2 group ${pad} ${txt} ${className}`}
      style={baseStyle}
    >
      <span>{typeof children === "string" ? children.replace(" →", "") : children}</span>
      {typeof children === "string" && children.includes("→") && (
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
      )}
    </motion.button>
  );
}

// ── Onboarding Overlay ───────────────────────────────────────────────────────

function OnboardingOverlay({ onSelectPath }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)" }}
    >
      {/* Close */}
      <motion.button
        onClick={() => onSelectPath("signin")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
        style={{ background: "rgba(15,23,64,0.07)", color: "#6B7294" }}
      >
        ✕
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -12 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.08 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
          className="flex justify-center mb-8"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "#4875EF", boxShadow: "0 8px 24px rgba(72,117,239,0.35)" }}
          >
            <span className="text-white text-xl font-bold">E</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.22 }}
        >
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#0F1740",
              lineHeight: 1.1,
            }}
          >
            Welcome to EXIMARG
          </h2>
          <p className="text-lg mt-3 mb-12" style={{ color: "#6B7294" }}>
            Let's build your export business together.
          </p>
        </motion.div>

        {/* Path cards */}
        <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
          {[
            { emoji: "🌱", title: "New to Exporting",   desc: "Guide me from zero. I'll complete every step with EXIMARG.", cta: "Start Level 1 →",   path: "new",      delay: 0.3,  primary: true  },
            { emoji: "🌍", title: "Already Exporting",  desc: "I already have export documents. Help me complete my profile.", cta: "Continue Setup →", path: "existing", delay: 0.38, primary: false },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: card.delay }}
              whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(15,23,64,0.1)" }}
              className="rounded-2xl p-6 text-left cursor-pointer transition-shadow"
              style={{
                background: card.primary ? "#EBF0FF" : "#ffffff",
                border: card.primary
                  ? "1.5px solid rgba(72,117,239,0.25)"
                  : "1.5px solid rgba(15,23,64,0.08)",
                boxShadow: "0 4px 20px rgba(15,23,64,0.06)",
              }}
            >
              <div className="text-4xl mb-4">{card.emoji}</div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "#0F1740", fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em" }}
              >
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B7294" }}>
                {card.desc}
              </p>
              <JourneyButton
                variant="primary"
                size="sm"
                onClick={() => onSelectPath(card.path)}
                className="w-full justify-center"
              >
                {card.cta}
              </JourneyButton>
            </motion.div>
          ))}
        </div>

        {/* Sign in */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm"
          style={{ color: "#9BA3C4" }}
        >
          Already have an account?{" "}
          <button
            onClick={() => onSelectPath("signin")}
            className="font-semibold transition-colors hover:opacity-70"
            style={{ color: "#4875EF" }}
          >
            Sign In
          </button>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ── Product screen types & level data ────────────────────────────────────────



const LEVELS = [
  { number: 1, title: "Identity",      scene: "Identity & Trust",       badge: "🪪", color: "#4875EF", xp: 100, readiness: 11,  time: "5 min",  desc: "Verify your identity with Aadhaar and PAN to establish trust with international buyers." },
  { number: 2, title: "Profile",       scene: "Business Identity",      badge: "🏭", color: "#7C3AED", xp: 150, readiness: 22,  time: "8 min",  desc: "Build your exporter profile — business type, categories, and shipment capacity." },
  { number: 3, title: "Verification",  scene: "Legal & Compliance",     badge: "✅", color: "#059669", xp: 200, readiness: 33,  time: "10 min", desc: "Verify your business with GST, IEC, and bank details to unlock buyer trust." },
  { number: 4, title: "Review",        scene: "Profile Review",         badge: "🔍", color: "#D97706", xp: 75,  readiness: 44,  time: "3 min",  desc: "Review and confirm your complete exporter profile before publishing to buyers." },
  { number: 5, title: "Subscription",  scene: "Your Growth Stage",      badge: "⭐", color: "#4875EF", xp: 50,  readiness: 55,  time: "2 min",  desc: "Choose the plan that matches your export ambitions. Upgrade anytime." },
  { number: 6, title: "Catalog",       scene: "Digital Dukan",          badge: "🛍️", color: "#DC2626", xp: 200, readiness: 66,  time: "12 min", desc: "Add your first product and build your export catalogue for global buyers." },
  { number: 7, title: "Invoices",      scene: "Export Documentation",   badge: "📃", color: "#059669", xp: 150, readiness: 77,  time: "6 min",  desc: "Set up your invoice templates and documentation workflow for smooth exports." },
  { number: 8, title: "Deals",         scene: "First Buyer",            badge: "🤝", color: "#F59E0B", xp: 200, readiness: 88,  time: "8 min",  desc: "Connect with your first verified buyer and initiate your first trade conversation." },
  { number: 9, title: "Deal Center",   scene: "Trade Operations",       badge: "🌐", color: "#0F1740", xp: 250, readiness: 100, time: "10 min", desc: "Activate your full trade dashboard and launch global operations from one place." },
];

// ── Shared form components ────────────────────────────────────────────────────

function Field({ label, type = "text", placeholder = "", value, onChange, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
        style={{ background: "#F8F9FF", border: `1.5px solid ${focused ? "#4875EF" : "rgba(15,23,64,0.1)"}`, color: "#0F1740", boxShadow: focused ? "0 0 0 3px rgba(72,117,239,0.1)" : "none" }} />
      {hint && <p className="text-xs" style={{ color: "#9BA3C4" }}>{hint}</p>}
    </div>
  );
}

function FieldSelect({ label, options, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 appearance-none"
        style={{ background: "#F8F9FF", border: `1.5px solid ${focused ? "#4875EF" : "rgba(15,23,64,0.1)"}`, color: value ? "#0F1740" : "#9BA3C4" }}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ChipSelect({ label, options, selected, onToggle }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <motion.button key={o} type="button" whileTap={{ scale: 0.95 }} onClick={() => onToggle(o)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
              style={{ background: active ? "#4875EF" : "#F4F6FF", color: active ? "#fff" : "#6B7294", border: `1.5px solid ${active ? "#4875EF" : "rgba(15,23,64,0.1)"}` }}>
              {o}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── ProductScreen wrapper ─────────────────────────────────────────────────────

function ProductScreen({ children, onBack, backLabel = "Back" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: EASE }}
      className="fixed inset-0 z-[150] overflow-y-auto"
      style={{ background: "#FAFBFF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-10 h-14 border-b"
        style={{ background: "rgba(250,251,255,0.95)", backdropFilter: "blur(12px)", borderColor: "rgba(15,23,64,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#4875EF" }}>
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-sm" style={{ color: "#0F1740" }}>eximarg</span>
        </div>
        {onBack && (
          <button onClick={onBack} className="text-sm font-medium flex items-center gap-1.5 transition-opacity hover:opacity-60" style={{ color: "#6B7294" }}>
            ← {backLabel}
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// ── AuthScreen ────────────────────────────────────────────────────────────────

function AuthScreen({ mode, userPath, onAuth, onToggleMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const isReg = mode === "register";

  return (
    <ProductScreen>
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE }} className="w-full max-w-md">
          <div className="rounded-2xl px-8 py-10"
            style={{ background: "#ffffff", boxShadow: "0 24px 64px rgba(15,23,64,0.1), 0 4px 16px rgba(15,23,64,0.05)", border: "1px solid rgba(15,23,64,0.06)" }}>
            <div className="mb-8">
              {userPath === "new" && isReg && (
                <p className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>Level 1 begins after this</p>
              )}
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(24px,4vw,32px)", fontWeight: 700, letterSpacing: "-0.025em", color: "#0F1740", lineHeight: 1.2 }}>
                {isReg ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-sm mt-2" style={{ color: "#6B7294" }}>
                {isReg ? "Your export journey starts here." : "Sign in to continue your journey."}
              </p>
            </div>

            <motion.button whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(15,23,64,0.1)" }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold mb-6"
              style={{ background: "#ffffff", border: "1.5px solid rgba(15,23,64,0.12)", color: "#0F1740" }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(15,23,64,0.08)" }} />
              <span className="text-xs font-medium" style={{ color: "#C8CEDF" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(15,23,64,0.08)" }} />
            </div>

            <div className="space-y-4">
              {isReg && <Field label="Full Name" placeholder="Rajesh Kumar" value={name} onChange={setName} />}
              <Field label="Email" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
              <Field label="Password" type="password" placeholder="8+ characters" value={password} onChange={setPassword} />
            </div>

            <JourneyButton variant="primary" size="md" className="w-full justify-center mt-6" onClick={onAuth}>
              {isReg ? "Create Account →" : "Sign In →"}
            </JourneyButton>

            <p className="text-center text-sm mt-5" style={{ color: "#9BA3C4" }}>
              {isReg ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={onToggleMode} className="font-semibold hover:opacity-70" style={{ color: "#4875EF" }}>
                {isReg ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>
          <p className="text-center text-xs mt-5" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>
            No credit card · Free to start · Guided from day one
          </p>
          <p className="text-center mt-4">
            <button
              onClick={onAuth}
              className="text-xs font-medium transition-opacity hover:opacity-60"
              style={{ color: "#C8CEDF" }}
            >
              Skip sign-in for now →
            </button>
          </p>
        </motion.div>
      </div>
    </ProductScreen>
  );
}

// ── WelcomeDashboard ──────────────────────────────────────────────────────────

function WelcomeDashboard({ xp, completedLevels, onStartLevel, onGoToCommandCenter }) {
  const next = Math.min(...[1,2,3,4,5,6,7,8,9].filter((n) => !completedLevels.includes(n)));
  const allDone = completedLevels.length === 9;
  const pct = Math.round((completedLevels.length / 6) * 100);

  return (
    <ProductScreen>
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12">
        <Up>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>Your Journey</p>
        </Up>
        <Up delay={0.06}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#0F1740", lineHeight: 1.1 }}>
            {allDone ? "Journey Complete." : "Good morning."}
          </h1>
          <p className="text-lg mt-3" style={{ color: "#6B7294" }}>
            {allDone ? "Your export business is ready. Enter the Command Center." : "Your export journey continues. One step at a time."}
          </p>
        </Up>

        {/* XP bar */}
        <Up delay={0.12}>
          <div className="rounded-2xl p-6 mt-8 mb-6" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 4px 20px rgba(15,23,64,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Readiness Index</p>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>{pct}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Total XP</p>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 700, color: "#F59E0B", letterSpacing: "-0.02em" }}>{xp} XP</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "#EBF0FF" }}>
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(to right, #4875EF, #7BA4FF)" }}
                initial={{ width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: EASE, delay: 0.3 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "#9BA3C4" }}>{completedLevels.length} of 9 levels complete</p>
          </div>
        </Up>

        {/* Next quest */}
        <Up delay={0.18}>
          {allDone ? (
            <motion.div whileHover={{ y: -2 }} className="rounded-2xl p-8 mb-6 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#0F1740 0%,#1C3B8A 100%)", boxShadow: "0 12px 40px rgba(15,23,64,0.25)" }}
              onClick={onGoToCommandCenter}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>Ready</p>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>Enter the Command Center</h3>
              <p className="text-sm mt-2 mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>Your export business is fully set up. Start trading.</p>
              <JourneyButton variant="ghost-light" size="md" onClick={onGoToCommandCenter}>Launch Dashboard →</JourneyButton>
            </motion.div>
          ) : (
            <div className="rounded-2xl p-6 mb-6"
              style={{ background: "#EBF0FF", border: "1.5px solid rgba(72,117,239,0.2)", boxShadow: "0 4px 20px rgba(72,117,239,0.1)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>Up Next</p>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>
                    Level {next}: {LEVELS[next - 1].title}
                  </h3>
                  <div className="flex items-center gap-4 my-4">
                    {[{ icon: "⏱", t: LEVELS[next-1].time }, { icon: "⚡", t: `+${LEVELS[next-1].xp} XP` }, { icon: "📈", t: `+${LEVELS[next-1].readiness}% Ready` }].map((s) => (
                      <span key={s.t} className="text-xs flex items-center gap-1" style={{ color: "#6B7294" }}>{s.icon} {s.t}</span>
                    ))}
                  </div>
                  <JourneyButton variant="primary" size="md" onClick={() => onStartLevel(next)}>Begin Level {next} →</JourneyButton>
                </div>
                <div className="text-4xl w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#ffffff", boxShadow: "0 4px 16px rgba(15,23,64,0.08)" }}>
                  {LEVELS[next - 1].badge}
                </div>
              </div>
            </div>
          )}
        </Up>

        {/* Journey map */}
        <Up delay={0.24}>
          <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 4px 20px rgba(15,23,64,0.06)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Journey Map</p>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
              {LEVELS.map((lvl) => {
                const done = completedLevels.includes(lvl.number);
                const active = lvl.number === next && !allDone;
                return (
                  <motion.div key={lvl.number} whileHover={done || active ? { y: -2 } : {}}
                    className="text-center cursor-pointer" onClick={() => !done ? onStartLevel(lvl.number) : undefined}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 transition-all"
                      style={{ background: done ? lvl.color : active ? "#EBF0FF" : "#F4F6FF", opacity: done || active ? 1 : 0.4, boxShadow: done ? `0 4px 14px ${lvl.color}40` : active ? "0 0 0 2px rgba(72,117,239,0.3)" : "none" }}>
                      {done ? "✓" : lvl.badge}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: done ? "#0F1740" : active ? "#4875EF" : "#C8CEDF" }}>
                      {`0${lvl.number}`}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{lvl.title.split(" ")[0]}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Up>
      </div>
    </ProductScreen>
  );
}

// ── LevelScreen ───────────────────────────────────────────────────────────────

function LevelScreen({ levelNum, xp, onComplete, onBack }) {
  const lvl = LEVELS[levelNum - 1];
  const [vals, setVals] = useState>({});
  const [chips, setChips] = useState([]);
  const [done, setDone] = useState(false);
  const set = (k) => (v) => setVals((p) => ({ ...p, [k]: v }));

  if (done) {
    return (
      <ProductScreen>
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }} className="text-center max-w-sm">
            <motion.div animate={{ rotate: [0, 10, -10, 8, -8, 0] }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl mb-6">{lvl.badge}</motion.div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
              Level {levelNum} Complete!
            </h2>
            <p className="text-base mt-3 mb-6" style={{ color: "#6B7294" }}>{lvl.title} verified.</p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  style={{ fontFamily: "'Fraunces', serif", fontSize: "32px", fontWeight: 700, color: "#F59E0B" }}>+{lvl.xp}</motion.p>
                <p className="text-xs" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>XP EARNED</p>
              </div>
              <div className="text-center">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  style={{ fontFamily: "'Fraunces', serif", fontSize: "32px", fontWeight: 700, color: "#22C55E" }}>{lvl.readiness}%</motion.p>
                <p className="text-xs" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>READINESS</p>
              </div>
            </div>
            <JourneyButton variant="primary" size="md" className="mx-auto" onClick={() => onComplete(lvl.xp)}>
              {levelNum < 9 ? `Continue to Level ${levelNum + 1} →` : "Enter Command Center →"}
            </JourneyButton>
          </motion.div>
        </div>
      </ProductScreen>
    );
  }

  return (
    <ProductScreen onBack={onBack} backLabel="Dashboard">
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-10">
        {/* Progress segments */}
        <div className="flex items-center gap-2 mb-8">
          {LEVELS.map((l) => (
            <div key={l.number} className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{ background: l.number <= levelNum ? lvl.color : "rgba(15,23,64,0.1)" }} />
          ))}
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ background: `${lvl.color}18`, color: lvl.color, fontFamily: "'DM Mono', monospace", border: `1px solid ${lvl.color}30` }}>
              Level 0{levelNum} · {lvl.scene}
            </span>
            <span className="text-xs" style={{ color: "#9BA3C4" }}>⏱ {lvl.time} · ⚡ +{lvl.xp} XP</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", color: "#0F1740", lineHeight: 1.15 }}>
            {lvl.title}
          </h1>
          <p className="text-base mt-3" style={{ color: "#6B7294" }}>{lvl.desc}</p>
        </div>

        {/* Level content */}
        <div className="space-y-5">
          {levelNum === 1 && <>
            {/* Section: Personal Identity */}
            <div className="pb-2">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Director Details</p>
              <div className="space-y-4">
                <Field label="Full Name" placeholder="As per PAN card" value={vals.name||""} onChange={set("name")} hint="Must match exactly with your PAN card" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date of Birth" type="date" placeholder="DD/MM/YYYY" value={vals.dob||""} onChange={set("dob")} />
                  <FieldSelect label="Gender" options={["Male","Female","Other"]} value={vals.gender||""} onChange={set("gender")} />
                </div>
              </div>
            </div>

            {/* Section: PAN Verification */}
            <div className="pb-2">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>PAN Verification</p>
              <div className="space-y-4">
                <Field label="PAN Number" placeholder="ABCDE1234F" value={vals.pan||""} onChange={set("pan")} hint="10-character Permanent Account Number" />
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#F0FDF4", border: "1px solid rgba(5,150,105,0.15)" }}>
                  <span className="text-lg mt-0.5">🔒</span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#059669" }}>Secure Verification</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#6B7294" }}>Your PAN is verified directly with the Income Tax Department. We never store raw PAN data.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Aadhaar Verification */}
            <div className="pb-2">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Aadhaar Verification</p>
              <div className="space-y-4">
                <Field label="Aadhaar Number" placeholder="1234 5678 9012" value={vals.aadhaar||""} onChange={set("aadhaar")} hint="12-digit Aadhaar linked to your registered mobile" />
                <Field label="Aadhaar-linked Mobile" type="tel" placeholder="+91 98765 43210" value={vals.phone||""} onChange={set("phone")} hint="OTP will be sent to this number for verification" />
                {vals.phone && vals.phone.length >= 10 && (
                  <div className="flex items-center gap-3">
                    <Field label="Enter OTP" placeholder="6-digit OTP" value={vals.otp||""} onChange={set("otp")} />
                    <div className="pt-6">
                      <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
                        style={{ background: "#EBF0FF", color: "#4875EF", border: "1.5px solid rgba(72,117,239,0.2)" }}>
                        Send OTP
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Contact */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Contact Details</p>
              <div className="space-y-4">
                <Field label="Email Address" type="email" placeholder="you@company.com" value={vals.email||""} onChange={set("email")} hint="Official email — used for all trade communications" />
                <Field label="Director Photo" type="file" placeholder="" value={""} onChange={() => {}} hint="Clear passport-size photo (JPG or PNG, max 2MB)" />
              </div>
            </div>
          </>}
          {levelNum === 2 && <>
            <FieldSelect label="Business Type" options={["Manufacturer","Merchant Exporter","Both"]} value={vals.type||""} onChange={set("type")} />
            <ChipSelect label="Export Categories" options={["Spices","Textiles","Machinery","Chemicals","Food Products","Handicrafts","Gems & Jewellery","Leather","Rice & Grains","Pharmaceuticals"]} selected={chips} onToggle={(o) => setChips((p) => p.includes(o) ? p.filter((x) => x!==o) : [...p,o])} />
            <Field label="Operating Since" placeholder="e.g. 2018" value={vals.since||""} onChange={set("since")} />
            <FieldSelect label="Monthly Shipment Range" options={["1–5 shipments","6–15 shipments","16–30 shipments","30+ shipments"]} value={vals.ships||""} onChange={set("ships")} />
          </>}
          {levelNum === 3 && <>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Legal</p>
            <Field label="GST Number" placeholder="27ABCDE1234F1Z5" value={vals.gst||""} onChange={set("gst")} hint="From GST portal" />
            <Field label="IEC Code" placeholder="AABCE0010M" value={vals.iec||""} onChange={set("iec")} hint="Importer Exporter Code from DGFT" />
            <p className="text-xs font-semibold tracking-widest uppercase pt-2" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Business</p>
            <Field label="Registered Address" placeholder="Full registered business address" value={vals.address||""} onChange={set("address")} />
            <Field label="Bank Account Number" value={vals.bank||""} onChange={set("bank")} />
            <Field label="IFSC Code" placeholder="SBIN0001234" value={vals.ifsc||""} onChange={set("ifsc")} />
          </>}
          {levelNum === 4 && <>
            <div className="flex items-center justify-center h-24 rounded-2xl border-2 border-dashed" style={{ borderColor: "rgba(72,117,239,0.25)", background: "#F8F9FF" }}>
              <div className="text-center"><p className="text-2xl mb-1">🏢</p><p className="text-xs font-medium" style={{ color: "#9BA3C4" }}>Upload company logo</p></div>
            </div>
            <Field label="Company Name" placeholder="Official registered name" value={vals.company||""} onChange={set("company")} />
            <Field label="Tagline" placeholder="e.g. Premium Spices from India" value={vals.tagline||""} onChange={set("tagline")} hint="Optional — shown to buyers" />
            <Field label="Website" type="url" placeholder="https://yourcompany.com" value={vals.website||""} onChange={set("website")} />
            <Field label="LinkedIn" type="url" placeholder="https://linkedin.com/company/…" value={vals.linkedin||""} onChange={set("linkedin")} />
          </>}
          {levelNum === 5 && (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Starter",  price: "₹0",     period: "Free forever", color: "#6B7294", features: ["1 product listing","5 buyer inquiries/mo","Basic analytics","Email support"], highlight: false },
                { name: "Growth",   price: "₹2,999", period: "per month",     color: "#4875EF", features: ["25 product listings","Unlimited buyer inquiries","AI buyer matching","IEC & document support","Priority support"], highlight: true },
                { name: "Premium",  price: "₹7,999", period: "per month",     color: "#7C3AED", features: ["Unlimited listings","Dedicated account manager","White-label catalogue","Custom invoicing","Trade finance support"], highlight: false },
              ].map((plan) => (
                <motion.div key={plan.name} whileHover={{ y: -4 }} className="rounded-2xl p-6 cursor-pointer"
                  style={{ background: plan.highlight ? "#0F1740" : "#ffffff", border: `1.5px solid ${plan.highlight ? "transparent" : "rgba(15,23,64,0.08)"}`, boxShadow: plan.highlight ? "0 12px 40px rgba(15,23,64,0.2)" : "0 4px 20px rgba(15,23,64,0.05)" }}
                  onClick={() => setDone(true)}>
                  {plan.highlight && <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#F59E0B", fontFamily: "'DM Mono', monospace" }}>Most Popular</p>}
                  <p className="font-bold mb-1" style={{ color: plan.highlight ? "#fff" : "#0F1740" }}>{plan.name}</p>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 700, color: plan.highlight ? "#fff" : "#0F1740", letterSpacing: "-0.02em" }}>{plan.price}</p>
                  <p className="text-xs mb-5" style={{ color: plan.highlight ? "rgba(255,255,255,0.4)" : "#9BA3C4" }}>{plan.period}</p>
                  <div className="space-y-2">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <span style={{ color: plan.highlight ? "#60A5FA" : "#22C55E" }}>✓</span>
                        <span style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#6B7294" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {levelNum === 6 && <>
            <div className="flex items-center justify-center h-32 rounded-2xl border-2 border-dashed" style={{ borderColor: "rgba(72,117,239,0.25)", background: "#F8F9FF" }}>
              <div className="text-center"><p className="text-3xl mb-1">📸</p><p className="text-xs font-medium" style={{ color: "#9BA3C4" }}>Upload product photos</p></div>
            </div>
            <Field label="Product Name" placeholder="e.g. Premium Basmati Rice 1121" value={vals.product||""} onChange={set("product")} />
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#EBF0FF", border: "1px solid rgba(72,117,239,0.15)" }}>
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#4875EF" }}>AI Suggestion</p>
                <p className="text-sm" style={{ color: "#0F1740" }}>HS Code: <strong>1006.30</strong> — Rice, semi-milled or wholly milled</p>
                <button className="text-xs font-semibold mt-1 hover:opacity-70" style={{ color: "#4875EF" }}>Apply suggestion</button>
              </div>
            </div>
            <Field label="Minimum Order Quantity" placeholder="e.g. 500 kg" value={vals.moq||""} onChange={set("moq")} />
            <Field label="Price (FOB)" placeholder="USD per MT" value={vals.price||""} onChange={set("price")} hint="Free on Board — excludes freight" />
          </>}

          {levelNum === 7 && <>
            <div className="pb-2">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Invoice Template</p>
              <div className="space-y-4">
                <Field label="Company Letterhead Name" placeholder="As it appears on invoices" value={vals.letterhead||""} onChange={set("letterhead")} />
                <Field label="Invoice Prefix" placeholder="e.g. INV-2024-" value={vals.prefix||""} onChange={set("prefix")} hint="Auto-appended to invoice numbers" />
                <FieldSelect label="Default Currency" options={["USD","EUR","GBP","AED","JPY","SGD"]} value={vals.currency||""} onChange={set("currency")} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Payment Terms</p>
              <div className="space-y-4">
                <FieldSelect label="Default Payment Terms" options={["30% advance, 70% before shipment","50% advance, 50% on BL","100% advance","LC at sight","DP — Documents against Payment"]} value={vals.terms||""} onChange={set("terms")} />
                <Field label="Bank Details for Invoice" placeholder="Bank name, account number, SWIFT" value={vals.bankdetails||""} onChange={set("bankdetails")} hint="Shown at the bottom of every invoice" />
              </div>
            </div>
          </>}

          {levelNum === 8 && <>
            <div className="pb-2">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Buyer Preferences</p>
              <div className="space-y-4">
                <ChipSelect label="Target Markets" options={["Germany","USA","UAE","UK","Japan","Australia","Canada","France","Netherlands","Singapore"]} selected={chips} onToggle={(o) => setChips((p) => p.includes(o) ? p.filter((x) => x!==o) : [...p,o])} />
                <FieldSelect label="Preferred Buyer Type" options={["Wholesale Distributor","Retail Chain","Industrial Buyer","Government Tender","Supermarket / Hypermarket"]} value={vals.buyertype||""} onChange={set("buyertype")} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>First Inquiry</p>
              <div className="rounded-xl p-5" style={{ background: "#EBF0FF", border: "1.5px solid rgba(72,117,239,0.2)" }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#4875EF", color: "#fff", flexShrink: 0 }}>M</div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#0F1740" }}>Müller GmbH · Hamburg, Germany</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6B7294" }}>"We are looking for premium Basmati rice suppliers. Interested in CIF Hamburg pricing for 20MT trial order."</p>
                  </div>
                </div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#4875EF" }}>🤖 AI-matched based on your catalogue</p>
                <p className="text-xs" style={{ color: "#9BA3C4" }}>Respond within 24 hours to increase conversion by 3x</p>
              </div>
              <div className="mt-4">
                <Field label="Your Reply" placeholder="Write your introductory message to the buyer..." value={vals.reply||""} onChange={set("reply")} hint="Keep it professional — this is your first impression" />
              </div>
            </div>
          </>}

          {levelNum === 9 && <>
            <div className="pb-2">
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Command Center Access</p>
              <div className="rounded-xl p-5 mb-4" style={{ background: "linear-gradient(135deg, #0F1740 0%, #1C3B8A 100%)", border: "none" }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Mono', monospace" }}>You have earned</p>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 700, color: "#F59E0B", letterSpacing: "-0.02em" }}>{[100,150,200,75,50,200,150,200].reduce((a,b)=>a+b,0) + 250} XP</p>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>across 9 completed levels</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Export Dashboard", desc: "Revenue, shipments, buyers — all in one view", icon: "🏠" },
                  { label: "Order Management", desc: "Track every deal from inquiry to delivery", icon: "📦" },
                  { label: "AI Buyer Matching", desc: "Continuous buyer discovery across 190+ countries", icon: "🤝" },
                  { label: "Document Automation", desc: "Invoices, packing lists, certificates — generated instantly", icon: "📄" },
                  { label: "Global Trade Map", desc: "Visualize your export footprint in real time", icon: "🌐" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)" }}>
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#0F1740" }}>{f.label}</p>
                      <p className="text-xs" style={{ color: "#9BA3C4" }}>{f.desc}</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>Unlocked</span>
                  </div>
                ))}
              </div>
            </div>
          </>}
        </div>

        {/* Sticky footer */}
        <div
          className="sticky bottom-0 left-0 right-0 mt-10 -mx-6 md:-mx-10 px-6 md:px-10 py-4 flex items-center justify-between"
          style={{ background: "rgba(250,251,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(15,23,64,0.07)" }}
        >
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-semibold" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>
                +{lvl.xp} XP · +{lvl.readiness}% Readiness
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#C8CEDF" }}>Total after: {xp + lvl.xp} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDone(true)}
              className="text-xs font-medium transition-opacity hover:opacity-60"
              style={{ color: "#C8CEDF" }}
            >
              Skip for now
            </button>
            {levelNum !== 5 && (
              <JourneyButton variant="primary" size="md" onClick={() => setDone(true)}>
                {levelNum === 6 ? "Lock Catalogue →"
                  : levelNum === 9 ? "Enter Command Center →"
                  : `Complete Level ${levelNum} →`}
              </JourneyButton>
            )}
          </div>
        </div>
      </div>
    </ProductScreen>
  );
}

// ── CommandCenter ─────────────────────────────────────────────────────────────

const CC_NAV = [
  { icon: "🏠", label: "Overview" }, { icon: "📦", label: "Products" },
  { icon: "🤝", label: "Buyers" },   { icon: "📄", label: "Orders" },
  { icon: "📃", label: "Invoices" }, { icon: "🗂", label: "Documents" },
  { icon: "💬", label: "AI Chat" },
];

function CommandCenter({ xp, onBack }) {
  const [activeNav, setActiveNav] = useState(0);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }} className="fixed inset-0 z-[150] flex"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F4F6FF" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r" style={{ background: "#ffffff", borderColor: "rgba(15,23,64,0.08)" }}>
        <div className="flex items-center gap-2.5 px-6 h-14 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#4875EF" }}>
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-bold text-sm" style={{ color: "#0F1740" }}>eximarg</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {CC_NAV.map((item, i) => (
            <button key={item.label} onClick={() => setActiveNav(i)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150"
              style={{ background: activeNav === i ? "#EBF0FF" : "transparent", color: activeNav === i ? "#4875EF" : "#6B7294" }}>
              <span className="text-base">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <div className="rounded-xl px-4 py-3" style={{ background: "#F4F6FF" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Total XP</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 700, color: "#F59E0B" }}>{xp} XP</p>
          </div>
        </div>
      </aside>
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 md:px-10 h-14 border-b flex-shrink-0"
          style={{ background: "#ffffff", borderColor: "rgba(15,23,64,0.08)" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>
            {CC_NAV[activeNav].label}
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-xs font-medium hover:opacity-60 transition-opacity" style={{ color: "#9BA3C4" }}>← Dashboard</button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#4875EF", color: "#fff" }}>R</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Revenue", value: "₹1.8 Cr", delta: "+24%", c: "#4875EF" },
              { label: "Active Buyers", value: "47",       delta: "+8 this month", c: "#22C55E" },
              { label: "Shipments",     value: "183",      delta: "12 in transit",  c: "#F59E0B" },
              { label: "Countries",     value: "22",       delta: "+3 new",         c: "#7C3AED" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 2px 12px rgba(15,23,64,0.05)" }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{s.label}</p>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{s.value}</p>
                <p className="text-xs font-medium mt-1.5" style={{ color: s.c }}>↑ {s.delta}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 2px 12px rgba(15,23,64,0.05)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Recent Activity</p>
              {[
                { e: "Shipment #183 departed Mumbai",          t: "2h ago",     d: "#4875EF" },
                { e: "New buyer inquiry — Stockholm",          t: "5h ago",     d: "#4875EF" },
                { e: "Invoice #047 approved by Müller GmbH",  t: "Yesterday",  d: "#22C55E" },
                { e: "Certificate of Origin issued — FIEO",   t: "Yesterday",  d: "#22C55E" },
                { e: "RCMC renewal completed",                 t: "3 days ago", d: "#22C55E" },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: a.d }} /><span className="text-sm" style={{ color: "#374151" }}>{a.e}</span>
                  </div>
                  <span className="text-xs ml-4 flex-shrink-0" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{a.t}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 2px 12px rgba(15,23,64,0.05)" }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Global Footprint</p>
              <FlatWorldMap />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Features", "Journey", "Pricing", "About"];

export default function Landing() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("register");
  const [userPath, setUserPath] = useState("new");
  const [xp, setXp] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (showOnboarding || screen !== "landing") ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showOnboarding, screen]);

  const handleSelectPath = (path) => {
    setShowOnboarding(false);
    if (path === "signin") {
      setAuthMode("login"); setScreen("auth-login");
    } else {
      setUserPath(path); setAuthMode("register"); setScreen("auth-register");
    }
  };

  const getLevelNum = () => parseInt((screen).split("-")[1] || "1");

  return (
    <div
      className="antialiased overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0F1740" }}
    >
      {/* ══ PRODUCT SCREENS ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {(screen === "auth-register" || screen === "auth-login") && (
          <AuthScreen key="auth" mode={authMode} userPath={userPath}
            onAuth={() => setScreen("dashboard")}
            onToggleMode={() => {
              const next = authMode === "register" ? "login" : "register";
              setAuthMode(next);
              setScreen(next === "register" ? "auth-register" : "auth-login");
            }} />
        )}
        {screen === "dashboard" && (
          <WelcomeDashboard key="dashboard" xp={xp} completedLevels={completedLevels}
            onStartLevel={(n) => setScreen(`level-${n}`)}
            onGoToCommandCenter={() => setScreen("command-center")} />
        )}
        {screen.startsWith("level-") && (
          <LevelScreen key={screen} levelNum={getLevelNum()} xp={xp}
            onComplete={(earned) => {
              const n = getLevelNum();
              setXp((p) => p + earned);
              setCompletedLevels((p) => [...new Set([...p, n])]);
              setScreen(n < 9 ? `level-${n + 1}` : "command-center");
            }}
            onBack={() => setScreen("dashboard")} />
        )}
        {screen === "command-center" && (
          <CommandCenter key="cc" xp={xp} onBack={() => setScreen("dashboard")} />
        )}
      </AnimatePresence>

      {/* ══ ONBOARDING OVERLAY ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingOverlay onSelectPath={handleSelectPath} />
        )}
      </AnimatePresence>

      {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          height: navScrolled ? "56px" : "64px",
          background: navScrolled ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(14px)",
          borderBottom: navScrolled ? "1px solid rgba(15,23,64,0.08)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 md:px-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#4875EF" }}>
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: "#0F1740" }}>eximarg</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium transition-colors duration-200 hover:opacity-60"
                style={{ color: "#0F1740", textDecoration: "none" }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <JourneyButton variant="ghost-dark" size="sm" onClick={() => setShowOnboarding(true)}>
              Sign In
            </JourneyButton>
            <JourneyButton variant="primary" size="sm" onClick={() => setShowOnboarding(true)}>
              Start Journey →
            </JourneyButton>
          </div>

          {/* Mobile menu toggle */}
          <motion.button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg"
            onClick={() => setMobileOpen((p) => !p)}
            style={{ background: mobileOpen ? "#EBF0FF" : "transparent" }}
            whileTap={{ scale: 0.92 }}
          >
            <motion.span
              className="block h-0.5 w-5 rounded-full"
              style={{ background: "#0F1740", transformOrigin: "center" }}
              animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
            />
            <motion.span
              className="block h-0.5 w-5 rounded-full"
              style={{ background: "#0F1740" }}
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.18 }}
            />
            <motion.span
              className="block h-0.5 w-5 rounded-full"
              style={{ background: "#0F1740", transformOrigin: "center" }}
              animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
            />
          </motion.button>
        </div>

        {/* Mobile dropdown panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute top-full left-4 right-4 mt-2 rounded-2xl overflow-hidden shadow-xl"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,64,0.08)",
                boxShadow: "0 16px 48px rgba(15,23,64,0.12)",
              }}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link}
                  href="#"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center px-6 py-4 text-sm font-medium border-b"
                  style={{
                    color: "#0F1740",
                    borderColor: "rgba(15,23,64,0.06)",
                    textDecoration: "none",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </motion.a>
              ))}
              <div className="px-4 py-4 flex flex-col gap-3">
                <button
                  className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{ color: "#0F1740" }}
                  onClick={() => { setMobileOpen(false); setShowOnboarding(true); }}
                >
                  Sign In
                </button>
                <button
                  className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "#4875EF", color: "#fff" }}
                  onClick={() => { setMobileOpen(false); setShowOnboarding(true); }}
                >
                  Start Journey →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center min-h-screen pt-20 pb-16 px-6 md:px-16 xl:px-24 overflow-hidden"
        style={{ background: "#ffffff" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 72% 50%, rgba(72,117,239,0.07) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-8 xl:gap-16 items-center">

          {/* Left — copy */}
          <div>
            <Up>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1.5 rounded-full"
                style={{ background: "#EBF0FF", color: "#4875EF", fontFamily: "'DM Mono', monospace" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4875EF" }} />
                Export Operating System
              </div>
            </Up>
            <Up delay={0.08}>
              <h1
                className="leading-[1.05] mb-6"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "clamp(42px, 5.5vw, 72px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#0F1740",
                }}
              >
                Your Export{" "}
                <em className="not-italic" style={{ color: "#4875EF" }}>Journey</em>
                <br />Starts Here.
              </h1>
            </Up>
            <Up delay={0.16}>
              <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: "#6B7294", fontWeight: 400 }}>
                EXIMARG guides Indian businesses from their first IEC to their
                hundredth shipment — every document, every buyer, every milestone,
                in one platform.
              </p>
            </Up>
            <Up delay={0.24}>
              <div className="flex flex-wrap items-center gap-3">
                <JourneyButton variant="primary" size="md" onClick={() => setShowOnboarding(true)}>
                  Start Your Journey →
                </JourneyButton>
                <motion.button
                  whileHover={{ opacity: 0.65 }}
                  className="text-sm font-medium flex items-center gap-1.5"
                  style={{ color: "#6B7294", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    document.getElementById("roadmap-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore the Journey ↓
                </motion.button>
              </div>
            </Up>
            <Up delay={0.32}>
              <div className="flex items-center gap-6 mt-10">
                {[
                  { n: "1,200+", l: "Exporters" },
                  { n: "190+",   l: "Countries" },
                  { n: "₹80 Cr+",l: "Export value" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="font-bold text-lg" style={{ color: "#0F1740", lineHeight: 1.2 }}>{s.n}</p>
                    <p className="text-xs font-medium" style={{ color: "#9BA3C4" }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </Up>
          </div>

          {/* Right — Product visual */}
          <HeroVisual />
        </div>
      </section>

      {/* ══ CHALLENGE ════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 md:px-16 xl:px-24 overflow-hidden" style={{ background: "#EBEBEB" }}>
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(15,23,64,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-[42%_58%] gap-8 items-start">

          {/* ── Left: copy ── */}
          <div className="pt-4 md:pt-12">
            <Up>
              <p
                className="text-xs font-bold tracking-[0.28em] uppercase mb-5"
                style={{ color: "#DC2626", fontFamily: "'DM Mono', monospace" }}
              >
                Chapter 2: The Chaos
              </p>
            </Up>
            <Up delay={0.08}>
              <h2
                className="leading-tight mb-6"
                style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(38px, 5vw, 58px)", fontWeight: 700, letterSpacing: "-0.03em", color: "#0F1740" }}
              >
                Exporting feels<br />overwhelming.
              </h2>
            </Up>
            <Up delay={0.16}>
              <p className="text-base leading-relaxed mb-8 max-w-sm" style={{ color: "#5A6070", lineHeight: 1.75 }}>
                Unlinked GST filings, missing IEC registrations, pending RCMC
                approvals, raw WhatsApp chats, and complex spreadsheets.
                Everything is scattered. Chaos blocks your global growth.
              </p>
            </Up>
            <Up delay={0.26}>
              <div
                className="rounded-xl px-5 py-4 max-w-sm"
                style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.14)" }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "#B91C1C" }}>
                  As you scroll, EXIMARG pulls these scattered pieces together,
                  organizing compliance into complete structural order.
                </p>
              </div>
            </Up>
          </div>

          {/* ── Right: scattered chaos ── */}
          <div className="relative" style={{ height: "560px" }}>

            {/* ① Compliance Status */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              style={{ position: "absolute", top: 72, left: 24, width: 268 }}
            >
              <motion.div
                animate={{ y: [0, -8, 4, -3, 0], rotate: ["-2.5deg", "-0.5deg", "-3.8deg", "-2deg", "-2.5deg"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#ffffff", borderRadius: 14, boxShadow: "0 8px 32px rgba(15,23,64,0.13)", border: "1px solid rgba(15,23,64,0.07)" }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#4875EF" }}>⚡</span>
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#0F1740", fontFamily: "'DM Mono', monospace" }}>Compliance Status</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>READY</span>
                </div>
                {[
                  { label: "IEC Registration", status: "Complete", c: "#16A34A", bg: "#DCFCE7" },
                  { label: "RCMC Licence",      status: "Pending…", c: "#D97706", bg: "#FEF3C7" },
                  { label: "GSTIN Link",         status: "Synced",   c: "#16A34A", bg: "#DCFCE7" },
                  { label: "AD Code",            status: "Missing",  c: "#DC2626", bg: "#FEE2E2" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
                    <span className="text-xs" style={{ color: "#5A6070" }}>{r.label}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: r.bg, color: r.c }}>{r.status}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ② WhatsApp query */}
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.22 }}
              style={{ position: "absolute", top: 188, left: 80, width: 238 }}
            >
              <motion.div
                animate={{ y: [0, 6, -3, 2, 0], x: [0, 4, -2, 1, 0], rotate: ["2deg", "3.5deg", "1deg", "2.5deg", "2deg"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 6px 24px rgba(15,23,64,0.14)", border: "1px solid rgba(15,23,64,0.07)", overflow: "hidden" }}
              >
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#DCFCE7" }}>
                  <span className="text-sm">💬</span>
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#15803D", fontFamily: "'DM Mono', monospace" }}>WhatsApp Query</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm italic" style={{ color: "#374151" }}>"Is the container weight certificate ready?"</p>
                  <p className="text-xs mt-1.5" style={{ color: "#9BA3C4" }}>Buyer · Hamburg · 2h ago</p>
                </div>
              </motion.div>
            </motion.div>

            {/* ③ Email rejection */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
              style={{ position: "absolute", top: 8, right: 10, width: 210 }}
            >
              <motion.div
                animate={{ y: [0, -5, 3, -2, 0], x: [0, -4, 2, -1, 0], rotate: ["-3.5deg", "-5.5deg", "-2deg", "-4deg", "-3.5deg"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 6px 20px rgba(15,23,64,0.12)", border: "1px solid rgba(220,38,38,0.18)", padding: "14px 16px" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "#DC2626", fontFamily: "'DM Mono', monospace" }}>✉ DGFT Portal</p>
                <p className="text-xs font-medium mb-1.5" style={{ color: "#0F1740" }}>IEC application rejected</p>
                <p className="text-xs leading-relaxed" style={{ color: "#9BA3C4" }}>3 documents still missing. Resubmit within 7 days or application will be cancelled.</p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#DC2626" }} />
                  <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>Urgent action required</span>
                </div>
              </motion.div>
            </motion.div>

            {/* ④ Spreadsheet fragment */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: EASE, delay: 0.3 }}
              style={{ position: "absolute", top: 300, right: 14, width: 200 }}
            >
              <motion.div
                animate={{ y: [0, 5, -1, 3, 0], x: [0, 3, -1, 2, 0], rotate: ["4deg", "2.5deg", "5.5deg", "3.5deg", "4deg"] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#ffffff", borderRadius: 10, boxShadow: "0 4px 16px rgba(15,23,64,0.11)", border: "1px solid rgba(15,23,64,0.07)", overflow: "hidden" }}
              >
                <div className="px-3 py-2 border-b flex items-center gap-1.5" style={{ background: "#F0FDF4", borderColor: "rgba(15,23,64,0.06)" }}>
                  <span className="text-xs">📄</span>
                  <span className="text-xs font-semibold" style={{ color: "#166534" }}>Packing List v7 — DRAFT</span>
                </div>
                {["Item 1: Saffron 2kg ✓", "Item 2: Weight cert ✗", "Item 3: HS Code ???", "Item 4: Batch no. ✗"].map((row, i) => (
                  <div key={i} className="px-3 py-1.5 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.04)" }}>
                    <span className="text-xs" style={{ color: row.includes("✓") ? "#16A34A" : row.includes("✗") ? "#DC2626" : "#D97706", fontFamily: "'DM Mono', monospace" }}>{row}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ⑤ Readiness badge */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.38 }}
              style={{ position: "absolute", bottom: 24, right: 4 }}
            >
              <motion.div
                animate={{ y: [0, -4, 2, -1, 0], x: [0, 3, -1, 2, 0], rotate: ["1deg", "2.5deg", "0deg", "1.5deg", "1deg"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 6px 20px rgba(15,23,64,0.12)", border: "1px solid rgba(15,23,64,0.07)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: "#FEE2E2", color: "#DC2626" }}>0%</div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Readiness Index</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "#DC2626" }}>0 XP Earned</p>
                </div>
              </motion.div>
            </motion.div>

            {/* ⑥ LC Terms chip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.34 }}
              style={{ position: "absolute", bottom: 108, left: 8 }}
            >
              <motion.div
                animate={{ y: [0, 5, -4, 2, 0], x: [0, -5, 3, -2, 0], rotate: ["-3deg", "-6deg", "-1deg", "-4deg", "-3deg"] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#FEF3C7", borderRadius: 8, border: "1px solid rgba(217,119,6,0.2)", padding: "6px 12px" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#92400E" }}>LC Terms unclear?? 🤔</p>
              </motion.div>
            </motion.div>

            {/* ⑦ Which Port chip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.14 }}
              style={{ position: "absolute", top: 28, left: 200 }}
            >
              <motion.div
                animate={{ x: [0, -6, 4, -2, 0], y: [0, -5, 3, -1, 0], rotate: ["6deg", "9deg", "4deg", "7deg", "6deg"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#EBF0FF", borderRadius: 8, border: "1px solid rgba(72,117,239,0.18)", padding: "6px 12px" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#3730A3" }}>Which port?? 🚢</p>
              </motion.div>
            </motion.div>

            {/* ⑧ Freight chip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.42 }}
              style={{ position: "absolute", top: 410, left: 50 }}
            >
              <motion.div
                animate={{ x: [-2, 6, -4, 2, -2], y: [0, 4, -2, 3, 0], rotate: ["-5deg", "-2deg", "-7deg", "-4deg", "-5deg"] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "#FEE2E2", borderRadius: 8, border: "1px solid rgba(220,38,38,0.2)", padding: "6px 12px" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#991B1B" }}>Freight forwarder?? 📦</p>
              </motion.div>
            </motion.div>

            {/* CHAOS watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0 }}>
              <p className="font-black uppercase tracking-widest" style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(52px, 8vw, 88px)", color: "rgba(15,23,64,0.04)", transform: "rotate(-12deg)" }}>
                CHAOS
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ══ ROADMAP ══════════════════════════════════════════════════════════ */}
      <section id="roadmap-section" className="relative py-28 px-6" style={{ background: "#EBF0FF" }}>
        <div className="text-center mb-20">
          <Up>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>Step by Step</p>
          </Up>
          <Up delay={0.08}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", color: "#0F1740" }}>
              Your Guided Roadmap
            </h2>
          </Up>
          <Up delay={0.14}>
            <p className="text-base mt-4 max-w-lg mx-auto" style={{ color: "#6B7294" }}>
              Eight milestones, each unlocking the next. No guesswork, no missed deadlines.
            </p>
          </Up>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2" style={{ width: "2px", background: "rgba(72,117,239,0.18)" }} />
          <div className="space-y-6">
            {MILESTONES.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={m.step}
                  initial={{ opacity: 0, x: isLeft ? -28 : 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-32px" }}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
                  className="relative grid items-center"
                  style={{ gridTemplateColumns: "1fr 56px 1fr" }}
                >
                  {isLeft ? (
                    <motion.div
                      className="pr-6 flex justify-end"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 + 0.15 }}
                    >
                      <RoadmapCard m={m} />
                    </motion.div>
                  ) : <div />}
                  <div className="flex flex-col items-center z-10 relative">
                    {/* Pulsing outer ring */}
                    <motion.div
                      className="absolute rounded-full"
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.06 + 0.1 }}
                      animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                      style={{ width: 40, height: 40, background: "rgba(72,117,239,0.25)" }}
                    />
                    {/* Step dot */}
                    <motion.div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs z-10"
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.06 + 0.08 }}
                      style={{ background: "#4875EF", color: "#fff", boxShadow: "0 0 0 4px rgba(72,117,239,0.2), 0 4px 16px rgba(72,117,239,0.4)", fontFamily: "'DM Mono', monospace" }}
                    >
                      {m.step}
                    </motion.div>
                  </div>
                  {!isLeft ? (
                    <motion.div
                      className="pl-6"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 + 0.15 }}
                    >
                      <RoadmapCard m={m} />
                    </motion.div>
                  ) : <div />}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FIRST BUYER STORY ════════════════════════════════════════════════ */}
      <FirstBuyerStory />

      {/* ══ GLOBAL FOOTPRINT ═════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 md:px-16 xl:px-24 overflow-hidden" style={{ background: "#FFF8E8" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <Up>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: "#D97706", fontFamily: "'DM Mono', monospace" }}>Act VIII</p>
              </Up>
              <Up delay={0.08}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", color: "#0F1740" }}>
                  Your Global Footprint
                </h2>
              </Up>
            </div>
            <Up delay={0.12}>
              <p className="text-base max-w-xs" style={{ color: "#6B7294" }}>
                From one city in India to cities across the world — EXIMARG maps every connection you build.
              </p>
            </Up>
          </div>

          <FadeIn delay={0.2}>
            <div className="rounded-2xl overflow-hidden p-6 md:p-10" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.06)", boxShadow: "0 8px 40px rgba(15,23,64,0.07)" }}>
              {/* Globe centered */}
              <FlatWorldMap />

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mt-8 pt-6 border-t" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
                {[
                  { n: "190+",    l: "Countries" },
                  { n: "8",       l: "Active trade routes" },
                  { n: "₹80 Cr+", l: "Export value" },
                  { n: "1,200+",  l: "Active exporters" },
                ].map((s) => (
                  <div key={s.l} className="text-center py-2">
                    <p className="font-bold text-xl" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740", letterSpacing: "-0.02em" }}>{s.n}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#9BA3C4" }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ COMMAND CENTER ═══════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 md:px-16 xl:px-24" style={{ background: "#F4F6FF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Up>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>Act VII</p>
            </Up>
            <Up delay={0.08}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", color: "#0F1740" }}>
                The Command Center
              </h2>
            </Up>
            <Up delay={0.14}>
              <p className="text-base mt-4 max-w-lg mx-auto" style={{ color: "#6B7294" }}>
                Revenue, buyers, shipments, compliance — all in one clean dashboard.
              </p>
            </Up>
          </div>

          <FadeIn delay={0.2}>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 24px 80px rgba(15,23,64,0.12)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: "#0F1740", borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#4875EF" }}>
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                  <span className="text-white/70 text-sm font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>EXIMARG — Export Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
                  <span className="text-white/40 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 divide-x" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
                {DASHBOARD_STATS.map((s, i) => (
                  <div key={s.label} className="px-6 py-6 border-b" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{s.label}</p>
                    <motion.p
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em", lineHeight: 1.1 }}
                    >
                      {s.value}
                    </motion.p>
                    <p className="text-xs font-medium mt-1.5" style={{ color: "#22C55E" }}>↑ {s.delta}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 py-5">
                <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>Recent Activity</p>
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.dot }} />
                      <span className="text-sm" style={{ color: "#3D4B6E" }}>{a.event}</span>
                    </div>
                    <span className="text-xs flex-shrink-0 ml-6" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-center min-h-screen py-40 px-6 overflow-hidden"
        style={{ background: "#0C1340" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(72,117,239,0.2) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Up>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-8" style={{ color: "rgba(72,117,239,0.7)", fontFamily: "'DM Mono', monospace" }}>The Invitation</p>
          </Up>
          <Up delay={0.1}>
            <h2
              className="text-white leading-tight mb-8"
              style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(44px, 8vw, 96px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.0 }}
            >
              The World Is Waiting<br className="hidden md:block" />
              For What You{" "}
              <em className="not-italic" style={{ color: "#4875EF" }}>Export.</em>
            </h2>
          </Up>
          <Up delay={0.2}>
            <p className="text-lg leading-relaxed mb-12 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              One platform. Eight milestones. Your first shipment — and every shipment after it.
            </p>
          </Up>
          <Up delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <JourneyButton variant="primary" size="lg" onClick={() => setShowOnboarding(true)}>
                Start Your Journey →
              </JourneyButton>
              <JourneyButton
                variant="ghost-light"
                size="lg"
                onClick={() => document.getElementById("roadmap-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore the Journey
              </JourneyButton>
            </div>
          </Up>
          <Up delay={0.4}>
            <p className="text-xs font-medium mt-8" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>
              No credit card · No setup fee · Guided from day one
            </p>
          </Up>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer
        className="py-8 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4 border-t"
        style={{ background: "#080D24", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#4875EF" }}>
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>eximarg</span>
        </div>
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
          The Export Operating System · India's Gateway to Global Trade
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>© 2024</p>
      </footer>
    </div>
  );
}

// ── Roadmap card ─────────────────────────────────────────────────────────────

function RoadmapCard({ m }) {
  return (
    <div
      className="rounded-xl px-5 py-4 max-w-[260px] transition-shadow duration-200 hover:shadow-md"
      style={{ background: "#ffffff", border: "1px solid rgba(72,117,239,0.1)", boxShadow: "0 2px 12px rgba(15,23,64,0.06)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5" style={{ color: "#4875EF", opacity: 0.6 }}>{m.icon}</span>
        <div>
          <p className="font-semibold text-sm leading-snug mb-1.5" style={{ color: "#0F1740" }}>{m.title}</p>
          <p className="text-xs leading-relaxed" style={{ color: "#6B7294" }}>{m.desc}</p>
        </div>
      </div>
    </div>
  );
}
