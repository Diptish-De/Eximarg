import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE, STAGGER_CONTAINER, STAGGER_ITEM, JourneyButton, DashCard, Field, FieldSelect, ChipSelect, Modal, Drawer, AnimatedNumber, TiltCard, ToastType, LEVELS } from "./shared";
import { GAME_DATA, RANK_TIERS, getRank, ExportPassportPage, AchievementsPage, QuestsPage, SkillTreePage, BattlePassPage, LeaderboardPage, PowerUpsPage, StoryModePage, DailySpinModal, MiniQuestCard } from "./gamification";
import { FlatWorldMap, OverviewPage, ProductsPage, BuyersPage, OrdersPage, InvoicesPage, DocumentsPage, AIPage, SettingsPage, MyProfilePage, SupportDrawer, ProfileDropdown, NotificationsPanel } from "./pages";

// ── Shared animation wrappers ────────────────────────────────────────────────

function Up({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
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

function FadeIn({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
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

interface Dest { name: string; lat: number; lon: number }

const INDIA = { lat: 20, lon: 78 };

const DESTINATIONS: Dest[] = [
  { name: "Frankfurt",  lat: 50,  lon: 8   },
  { name: "New York",   lat: 41,  lon: -74 },
  { name: "Tokyo",      lat: 35,  lon: 139 },
  { name: "Dubai",      lat: 25,  lon: 55  },
  { name: "London",     lat: 51,  lon: 0   },
  { name: "Sydney",     lat: -34, lon: 151 },
  { name: "Shanghai",   lat: 31,  lon: 121 },
  { name: "São Paulo",  lat: -23, lon: -46 },
];

function slerp(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  t: number,
): [number, number] {
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
  const pts: [number, number][] = [];
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

function GlobeCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let rotation = -INDIA.lon;
    const startTime = performance.now();

    function project(lat: number, lon: number, S: number) {
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

    function draw(now: number) {
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
  { step: "08", title: "Scale Globally",      desc: "Manage payments, GST refunds, and buyer relationships as you grow into new markets.", icon: "◈" },
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleStepClick = (i: number) => {
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

// ── Onboarding Overlay ───────────────────────────────────────────────────────

function OnboardingOverlay({ onSelectPath }: { onSelectPath: (path: "new" | "existing" | "signin") => void }) {
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
            { emoji: "🌱", title: "New to Exporting",   desc: "Guide me from zero. I'll complete every step with EXIMARG.", cta: "Start Level 1 →",   path: "new" as const,      delay: 0.3,  primary: true  },
            { emoji: "🌍", title: "Already Exporting",  desc: "I already have export documents. Help me complete my profile.", cta: "Continue Setup →", path: "existing" as const, delay: 0.38, primary: false },
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

// ── Product screen types ──────────────────────────────────────────────────────

type ScreenType =
  | "landing" | "auth-register" | "auth-login"
  | "dashboard"
  | "level-1" | "level-2" | "level-3" | "level-4" | "level-5" | "level-6"
  | "level-7" | "level-8" | "level-9"
  | "command-center";

// ── ProductScreen wrapper ─────────────────────────────────────────────────────

function ProductScreen({ children, onBack, backLabel = "Back" }: {
  children: React.ReactNode; onBack?: () => void; backLabel?: string;
}) {
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

function AuthScreen({ mode, userPath, onAuth, onToggleMode }: {
  mode: "register" | "login"; userPath: "new" | "existing";
  onAuth: () => void; onToggleMode: () => void;
}) {
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

function WelcomeDashboard({ xp, completedLevels, onStartLevel, onGoToCommandCenter }: {
  xp: number; completedLevels: number[];
  onStartLevel: (n: number) => void; onGoToCommandCenter: () => void;
}) {
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

// ── Upload Zone ───────────────────────────────────────────────────────────────

function UploadZone({ label, hint, wide = false }: { label: string; hint?: string; wide?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => setUploaded((p) => !p)}
      className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-8 px-4 text-center ${wide ? "col-span-2" : ""}`}
      style={{
        borderColor: uploaded ? "#22C55E" : hovered ? "#4875EF" : "rgba(15,23,64,0.12)",
        background: uploaded ? "#F0FDF4" : hovered ? "#EBF0FF" : "#FAFBFF",
      }}
    >
      {uploaded ? (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "#22C55E" }}>
            <span className="text-white text-lg">✓</span>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#16A34A" }}>Uploaded</p>
          <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>Click to replace</p>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: hovered ? "#EBF0FF" : "#F4F6FF" }}>
            <span className="text-xl">⬆</span>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#0F1740" }}>{label}</p>
          {hint && <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>{hint}</p>}
          <p className="text-xs mt-2" style={{ color: "#C8CEDF" }}>Drag & drop or click to browse</p>
        </>
      )}
    </motion.div>
  );
}

// ── Step Card ─────────────────────────────────────────────────────────────────

function StepCard({ icon, title, description, children, onAskAI, completed }: {
  icon: string; title: string; description?: string;
  children: React.ReactNode; onAskAI?: () => void; completed?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-2xl p-6"
      style={{
        background: "#ffffff",
        border: completed ? "1.5px solid #22C55E" : "1px solid rgba(15,23,64,0.08)",
        boxShadow: "0 4px 20px rgba(15,23,64,0.06)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: completed ? "#F0FDF4" : "#F4F6FF" }}>
            {completed ? "✅" : icon}
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight" style={{ color: "#0F1740" }}>{title}</h3>
            {description && <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{description}</p>}
          </div>
        </div>
        {onAskAI && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onAskAI}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0"
            style={{ background: "#EBF0FF", color: "#4875EF", border: "1px solid rgba(72,117,239,0.2)" }}>
            🤖 Ask AI
          </motion.button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// ── Sidebar Card ──────────────────────────────────────────────────────────────

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 2px 12px rgba(15,23,64,0.05)" }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-4"
        style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{title}</p>
      {children}
    </div>
  );
}

// ── Level 1 Content ───────────────────────────────────────────────────────────

function Level1Content({ vals, set }: { vals: Record<string, string>; set: (k: string) => (v: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  return (
    <div className="space-y-5">
      {/* Director Details */}
      <StepCard icon="👤" title="Director Details" description="Personal information as per government records" onAskAI={() => {}}>
        <div className="space-y-4">
          <Field label="Full Name" placeholder="As per PAN card" value={vals.name || ""} onChange={set("name")} hint="Must match exactly with your PAN and Aadhaar" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date of Birth" type="date" placeholder="DD/MM/YYYY" value={vals.dob || ""} onChange={set("dob")} />
            <FieldSelect label="Gender" options={["Male", "Female", "Other", "Prefer not to say"]} value={vals.gender || ""} onChange={set("gender")} />
          </div>
        </div>
      </StepCard>

      {/* Aadhaar Card Upload */}
      <StepCard icon="🪪" title="Aadhaar Card" description="Front and back images required (JPG/PNG, max 5MB)" onAskAI={() => {}}>
        <div className="grid grid-cols-2 gap-4">
          <UploadZone label="Upload Front Side" hint="Show your name, photo and Aadhaar number" />
          <UploadZone label="Upload Back Side" hint="Show your address and QR code" />
        </div>
        <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: "#9BA3C4" }}>
          <span>🔒</span> End-to-end encrypted verification
        </p>
      </StepCard>

      {/* PAN Card Upload */}
      <StepCard icon="📄" title="PAN Card" description="Front side scan clearly showing PAN number" onAskAI={() => {}}>
        <UploadZone label="Upload PAN Card Front" hint="High resolution scans preferred for OCR speed" wide />
        <div className="mt-4">
          <Field label="PAN Number" placeholder="ABCDE1234F" value={vals.pan || ""} onChange={set("pan")} hint="We verify this against your uploaded document" />
        </div>
      </StepCard>

      {/* Contact + OTP */}
      <StepCard icon="📱" title="Contact Verification" description="Verify your Aadhaar-linked mobile number via OTP" onAskAI={() => {}}>
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Aadhaar-linked Mobile" type="tel" placeholder="+91 98765 43210"
                value={phone} onChange={(v) => { setPhone(v); set("phone")(v); }} />
            </div>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setOtpSent(true)}
              disabled={phone.length < 10}
              className="px-4 py-3 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
              style={{
                background: phone.length >= 10 ? "#4875EF" : "#F4F6FF",
                color: phone.length >= 10 ? "#fff" : "#C8CEDF",
                cursor: phone.length >= 10 ? "pointer" : "not-allowed",
              }}>
              {otpSent ? "Resend OTP" : "Send OTP"}
            </motion.button>
          </div>

          {otpSent && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, ease: EASE }}>
              <Field label="Enter 6-digit OTP" placeholder="• • • • • •" value={otp}
                onChange={(v) => { setOtp(v); set("otp")(v); }}
                hint="OTP sent to your Aadhaar-linked number. Valid for 10 minutes." />
            </motion.div>
          )}

          <Field label="Email Address" type="email" placeholder="you@company.com" value={vals.email || ""} onChange={set("email")} hint="Used for all trade communications and notifications" />
        </div>
      </StepCard>
    </div>
  );
}

// ── Level 2 Content ───────────────────────────────────────────────────────────

function Level2Content({ vals, set, chips, setChips }: {
  vals: Record<string, string>;
  set: (k: string) => (v: string) => void;
  chips: string[];
  setChips: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const toggle = (o: string) => setChips((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o]);

  return (
    <div className="space-y-5">
      <StepCard icon="🏭" title="Business Type" description="How do you operate your export business?" onAskAI={() => {}}>
        <div className="grid grid-cols-3 gap-3 mt-1">
          {[
            { key: "Manufacturer", icon: "🏗️", desc: "You produce goods" },
            { key: "Merchant", icon: "🛒", desc: "You source & resell" },
            { key: "Both", icon: "⚡", desc: "You do both" },
          ].map((opt) => (
            <motion.button key={opt.key} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => set("type")(opt.key)}
              className="rounded-xl p-4 text-center transition-all duration-150"
              style={{
                background: vals.type === opt.key ? "#EBF0FF" : "#F8F9FF",
                border: `2px solid ${vals.type === opt.key ? "#4875EF" : "rgba(15,23,64,0.08)"}`,
              }}>
              <div className="text-2xl mb-2">{opt.icon}</div>
              <p className="text-sm font-bold" style={{ color: "#0F1740" }}>{opt.key}</p>
              <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{opt.desc}</p>
            </motion.button>
          ))}
        </div>
      </StepCard>

      <StepCard icon="📦" title="Export Categories" description="Select all product categories you export" onAskAI={() => {}}>
        <ChipSelect label="" options={["Spices & Herbs","Textiles & Fabrics","Machinery","Chemicals","Food Products","Handicrafts","Gems & Jewellery","Leather","Rice & Grains","Pharmaceuticals","Engineering Goods","Agri Produce"]} selected={chips} onToggle={toggle} />
      </StepCard>

      <StepCard icon="📅" title="Business History" description="Tell us about your experience and scale" onAskAI={() => {}}>
        <div className="space-y-4">
          <Field label="Operating Since" placeholder="e.g. 2018" value={vals.since || ""} onChange={set("since")} hint="Year your business started export operations" />
          <FieldSelect label="Monthly Shipment Range" options={["First shipment (new)","1–5 shipments","6–15 shipments","16–30 shipments","30+ shipments"]} value={vals.ships || ""} onChange={set("ships")} />
          <FieldSelect label="Export Intent" options={["Build buyer relationships","Increase order volume","Enter new markets","Launch new product line","Establish brand globally"]} value={vals.intent || ""} onChange={set("intent")} />
        </div>
      </StepCard>

      <StepCard icon="📋" title="AI-Suggested RCMC" description="Based on your categories, EXIMARG recommends these licences" onAskAI={() => {}}>
        <div className="space-y-2 mt-1">
          {[
            { org: "APEDA", desc: "Agricultural & Processed Food", recommended: true },
            { org: "FIEO", desc: "Federation of Indian Export Organisations", recommended: true },
            { org: "FSSAI", desc: "Food Safety Standards (if exporting food)", recommended: chips.includes("Food Products") || chips.includes("Spices & Herbs") },
          ].map((r) => (
            r.recommended && (
              <div key={r.org} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "#F0FDF4", border: "1px solid rgba(22,163,74,0.15)" }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#0F1740" }}>{r.org}</p>
                  <p className="text-xs" style={{ color: "#6B7294" }}>{r.desc}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>Recommended</span>
              </div>
            )
          ))}
        </div>
      </StepCard>
    </div>
  );
}

// ── Level 3 Content ───────────────────────────────────────────────────────────

function Level3Content({ vals, set }: { vals: Record<string, string>; set: (k: string) => (v: string) => void }) {
  const [trustScore, setTrustScore] = useState(0);
  const verified = Object.keys(vals).filter((k) => vals[k] && vals[k].length > 3).length;

  useEffect(() => {
    setTrustScore(Math.min(100, verified * 14));
  }, [verified]);

  return (
    <div className="space-y-5">
      {/* Stage A */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Stage A — Business Verification</p>
        <StepCard icon="🏢" title="Legal Registration" description="Primary government registrations for your export entity" onAskAI={() => {}}>
          <div className="space-y-4">
            <Field label="GST Number" placeholder="27ABCDE1234F1Z5" value={vals.gst || ""} onChange={set("gst")} hint="Mandatory for all export invoices" />
            <Field label="CIN (if applicable)" placeholder="U12345MH2020PTC123456" value={vals.cin || ""} onChange={set("cin")} hint="Corporate Identity Number for registered companies" />
            <Field label="IEC Code" placeholder="AABCE0010M" value={vals.iec || ""} onChange={set("iec")} hint="Importer Exporter Code issued by DGFT — required to export" />
          </div>
        </StepCard>
      </div>

      {/* Stage B */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Stage B — Address & Banking</p>
        <StepCard icon="🏦" title="Banking Details" description="Your export banking information for payments and refunds" onAskAI={() => {}}>
          <div className="space-y-4">
            <Field label="Registered Business Address" placeholder="Full registered address" value={vals.address || ""} onChange={set("address")} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bank Account Number" placeholder="Account number" value={vals.bank || ""} onChange={set("bank")} />
              <Field label="IFSC Code" placeholder="SBIN0001234" value={vals.ifsc || ""} onChange={set("ifsc")} />
            </div>
            <Field label="AD Code" placeholder="Authorised Dealer Code" value={vals.adcode || ""} onChange={set("adcode")} hint="Required for customs clearance. Get from your bank." />
          </div>
        </StepCard>
      </div>

      {/* Stage C */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Stage C — Export Compliance</p>
        <StepCard icon="✅" title="Export Licences" description="Compliance certifications based on your product categories" onAskAI={() => {}}>
          <div className="space-y-3">
            {[
              { label: "RCMC Number", key: "rcmc", hint: "Registration-cum-Membership Certificate from Export Promotion Council" },
              { label: "FSSAI Licence (if applicable)", key: "fssai", hint: "Required for food and agri product exports" },
              { label: "APEDA Registration (if applicable)", key: "apeda", hint: "Agricultural & Processed Food Products Export Development Authority" },
            ].map((f) => (
              <div key={f.key}>
                <Field label={f.label} placeholder="Enter number" value={vals[f.key] || ""} onChange={set(f.key)} hint={f.hint} />
                {vals[f.key] && vals[f.key].length > 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>✓ Verified</span>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </StepCard>
      </div>
    </div>
  );
}

// ── Level 4 Content ───────────────────────────────────────────────────────────

function Level4Content({ vals, set }: { vals: Record<string, string>; set: (k: string) => (v: string) => void }) {
  return (
    <div className="space-y-5">
      <StepCard icon="🏢" title="Company Identity" description="Your brand as international buyers will see it" onAskAI={() => {}}>
        <div className="space-y-4">
          <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-blue-400"
            style={{ borderColor: "rgba(72,117,239,0.25)", background: "#F8F9FF" }}>
            <div className="text-center">
              <div className="text-3xl mb-1">🏢</div>
              <p className="text-xs font-medium" style={{ color: "#9BA3C4" }}>Upload company logo (SVG, PNG, max 2MB)</p>
            </div>
          </div>
          <Field label="Company Name" placeholder="Official registered name" value={vals.company || ""} onChange={set("company")} />
          <Field label="Tagline" placeholder="e.g. Premium Spices from India" value={vals.tagline || ""} onChange={set("tagline")} hint="Optional — shown to buyers on your profile" />
        </div>
      </StepCard>

      <StepCard icon="🌐" title="Online Presence" description="Help buyers discover and trust your company online" onAskAI={() => {}}>
        <div className="space-y-4">
          <Field label="Website" type="url" placeholder="https://yourcompany.com" value={vals.website || ""} onChange={set("website")} />
          <Field label="LinkedIn" type="url" placeholder="https://linkedin.com/company/…" value={vals.linkedin || ""} onChange={set("linkedin")} />
          <Field label="Trademark / Brand Name (optional)" placeholder="Registered trademark if any" value={vals.trademark || ""} onChange={set("trademark")} hint="Helps buyers identify your brand internationally" />
        </div>
      </StepCard>

      {/* Brand Preview */}
      {vals.company && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-2xl p-6"
          style={{ background: "linear-gradient(135deg, #EBF0FF 0%, #F0F4FF 100%)", border: "1.5px solid rgba(72,117,239,0.15)" }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Brand Preview</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold"
              style={{ background: "#4875EF", color: "#fff" }}>
              {vals.company[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740", letterSpacing: "-0.02em" }}>{vals.company}</p>
              {vals.tagline && <p className="text-sm mt-0.5" style={{ color: "#6B7294" }}>{vals.tagline}</p>}
              {vals.website && <p className="text-xs mt-1" style={{ color: "#4875EF" }}>{vals.website}</p>}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Level Sidebar ─────────────────────────────────────────────────────────────

const SIDEBAR_DATA: Record<number, {
  whyMatters: { icon: string; text: string }[];
  tip: string;
  security?: string;
}> = {
  1: {
    whyMatters: [
      { icon: "🏛️", text: "KYC Compliance — Mandatory per SEBI and RBI guidelines for all Indian export activities." },
      { icon: "🏅", text: "Trusted Seller Badge — Verified identities receive trusted seller access in the global marketplace." },
      { icon: "⚡", text: "Faster Processing — OCR-assisted verification typically takes less than 2 hours." },
    ],
    tip: "Ensure all four corners of the document are visible. Avoid glare or flash to ensure the AI can read your details instantly.",
    security: "Your documents are encrypted end-to-end and never shared with third parties without your consent.",
  },
  2: {
    whyMatters: [
      { icon: "🎯", text: "Better Buyer Matches — EXIMARG's AI matches you with buyers based on your exact category and scale." },
      { icon: "📈", text: "Unlock Higher Tier — Accurate profile data unlocks Growth and Premium buyer access." },
      { icon: "🌍", text: "Global Credibility — Verified exporter profiles receive 3x more buyer inquiries." },
    ],
    tip: "Select all categories that apply — even secondary ones. Buyers search across multiple categories when placing large orders.",
  },
  3: {
    whyMatters: [
      { icon: "✅", text: "Legal Compliance — All documents are verified against government databases in real time." },
      { icon: "💰", text: "GST Refund Eligibility — A verified IEC and GST enables you to claim export GST refunds." },
      { icon: "🔒", text: "Buyer Trust — Verified exporters are shown first in buyer search results." },
    ],
    tip: "Your AD Code is issued by your bank's foreign exchange department. It is required for customs clearance of every shipment.",
    security: "All banking information is encrypted using bank-grade security (AES-256).",
  },
  4: {
    whyMatters: [
      { icon: "👁️", text: "First Impression — Your company profile is the first thing buyers see. Make it count." },
      { icon: "🔍", text: "Search Visibility — Profiles with logos and taglines appear higher in buyer search results." },
      { icon: "🤝", text: "Conversion Rate — Complete profiles convert 4x more buyer inquiries into deals." },
    ],
    tip: "Use your brand's official tagline or mission statement. Keep it under 10 words. International buyers appreciate clarity.",
  },
  5: {
    whyMatters: [
      { icon: "🚀", text: "Unlock Features — Each plan unlocks progressively more buyer access and AI tools." },
      { icon: "📊", text: "Scale at Your Pace — Upgrade or downgrade at any time based on your growth." },
      { icon: "💎", text: "Premium Buyers — Growth and Premium plans get access to Fortune 500 buyer inquiries." },
    ],
    tip: "Most exporters start with Growth and upgrade to Premium after their first 5 successful shipments.",
  },
  6: {
    whyMatters: [
      { icon: "🌐", text: "Global Visibility — Your products are instantly visible to 50,000+ verified buyers." },
      { icon: "🤖", text: "AI Matching — Products with complete specs receive 5x more buyer inquiries." },
      { icon: "📦", text: "Export Ready — A complete catalogue enables buyers to place orders without back-and-forth." },
    ],
    tip: "Use professional photos with a white or neutral background. Products with multiple angles receive significantly more inquiries.",
  },
};

// ── LevelScreen ───────────────────────────────────────────────────────────────

function LevelScreen({ levelNum, xp, onComplete, onBack }: {
  levelNum: number; xp: number;
  onComplete: (earnedXp: number) => void; onBack: () => void;
}) {
  const lvl = LEVELS[levelNum - 1];
  const [vals, setVals] = useState<Record<string, string>>({});
  const [chips, setChips] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const set = (k: string) => (v: string) => setVals((p) => ({ ...p, [k]: v }));
  const sidebar = SIDEBAR_DATA[Math.min(levelNum, 6)];

  // ── Completion celebration ──
  if (done) {
    return (
      <ProductScreen>
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-center max-w-sm">
            <motion.div animate={{ rotate: [0, 12, -12, 8, -8, 0] }}
              transition={{ duration: 0.9, delay: 0.15 }} className="text-7xl mb-6">
              {lvl.badge}
            </motion.div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
              Level {levelNum} Complete!
            </h2>
            <p className="text-base mt-3 mb-8" style={{ color: "#6B7294" }}>{lvl.title} — done.</p>
            <div className="flex items-center justify-center gap-10 mb-10">
              <div className="text-center">
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontFamily: "'Fraunces', serif", fontSize: "36px", fontWeight: 700, color: "#F59E0B", letterSpacing: "-0.025em" }}>
                  +{lvl.xp}
                </motion.p>
                <p className="text-xs font-semibold tracking-widest uppercase mt-1" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>XP Earned</p>
              </div>
              <div className="text-center">
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ fontFamily: "'Fraunces', serif", fontSize: "36px", fontWeight: 700, color: "#22C55E", letterSpacing: "-0.025em" }}>
                  {lvl.readiness}%
                </motion.p>
                <p className="text-xs font-semibold tracking-widest uppercase mt-1" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Readiness</p>
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
      {/* Progress bar */}
      <div className="flex items-center gap-2 px-6 md:px-10 pt-6 pb-2">
        {LEVELS.map((l) => (
          <div key={l.number} className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ background: l.number <= levelNum ? lvl.color : "rgba(15,23,64,0.1)" }} />
        ))}
      </div>

      {/* Chapter header */}
      <div className="px-6 md:px-10 pt-4 pb-6 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ background: `${lvl.color}18`, color: lvl.color, fontFamily: "'DM Mono', monospace", border: `1px solid ${lvl.color}30` }}>
            Chapter 0{levelNum} · {lvl.scene}
          </span>
          <span className="text-xs" style={{ color: "#9BA3C4" }}>⏱ {lvl.time}</span>
          <span className="text-xs" style={{ color: "#9BA3C4" }}>⚡ +{lvl.xp} XP</span>
          <span className="text-xs" style={{ color: "#9BA3C4" }}>📈 +{lvl.readiness}% Readiness</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 700, letterSpacing: "-0.025em", color: "#0F1740", lineHeight: 1.15 }}>
          {lvl.title}
        </h1>
        <p className="text-base mt-2" style={{ color: "#6B7294" }}>{lvl.desc}</p>
      </div>

      {/* Two-column body */}
      <div className="px-6 md:px-10 py-8 grid md:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 items-start">

        {/* LEFT: step cards */}
        <div>
          {levelNum === 1 && <Level1Content vals={vals} set={set} />}
          {levelNum === 2 && <Level2Content vals={vals} set={set} chips={chips} setChips={setChips} />}
          {levelNum === 3 && <Level3Content vals={vals} set={set} />}
          {levelNum === 4 && <Level4Content vals={vals} set={set} />}
          {levelNum === 5 && (
            <div className="space-y-5">
              <StepCard icon="⭐" title="Choose Your Plan" description="Select the plan that matches your export ambitions. Upgrade anytime." onAskAI={() => {}}>
                <div className="grid md:grid-cols-3 gap-4 mt-2">
                  {[
                    { name: "Starter", price: "₹0", period: "Free forever", features: ["1 product listing","5 buyer inquiries/mo","Basic analytics","Email support"], highlight: false },
                    { name: "Growth", price: "₹2,999", period: "per month", features: ["25 listings","Unlimited inquiries","AI buyer matching","Document support","Priority support"], highlight: true },
                    { name: "Premium", price: "₹7,999", period: "per month", features: ["Unlimited listings","Dedicated manager","White-label catalogue","Custom invoicing","Trade finance"], highlight: false },
                  ].map((plan) => (
                    <motion.div key={plan.name} whileHover={{ y: -4 }} className="rounded-2xl p-5 cursor-pointer"
                      style={{ background: plan.highlight ? "#0F1740" : "#ffffff", border: `1.5px solid ${plan.highlight ? "transparent" : "rgba(15,23,64,0.08)"}`, boxShadow: plan.highlight ? "0 12px 40px rgba(15,23,64,0.2)" : "0 4px 20px rgba(15,23,64,0.05)" }}
                      onClick={() => setDone(true)}>
                      {plan.highlight && <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#F59E0B", fontFamily: "'DM Mono', monospace" }}>Most Popular</p>}
                      <p className="font-bold mb-1" style={{ color: plan.highlight ? "#fff" : "#0F1740" }}>{plan.name}</p>
                      <p style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 700, color: plan.highlight ? "#fff" : "#0F1740", letterSpacing: "-0.02em" }}>{plan.price}</p>
                      <p className="text-xs mb-4" style={{ color: plan.highlight ? "rgba(255,255,255,0.4)" : "#9BA3C4" }}>{plan.period}</p>
                      <div className="space-y-1.5">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-xs">
                            <span style={{ color: plan.highlight ? "#60A5FA" : "#22C55E" }}>✓</span>
                            <span style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#6B7294" }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </StepCard>
            </div>
          )}
          {levelNum === 6 && (
            <div className="space-y-5">
              <StepCard icon="🛍️" title="Add Your First Product" description="Create your export catalogue. Start with your hero product." onAskAI={() => {}}>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <UploadZone label="Product Photos" hint="Multiple angles, white background" />
                  <UploadZone label="Technical Sheet" hint="Spec sheet, certificates (PDF)" />
                </div>
                <div className="space-y-4">
                  <Field label="Product Name" placeholder="e.g. Premium Basmati Rice 1121" value={vals.product || ""} onChange={set("product")} />
                  <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#EBF0FF", border: "1px solid rgba(72,117,239,0.15)" }}>
                    <span className="text-base">🤖</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "#4875EF" }}>AI HS Code Suggestion</p>
                      <p className="text-sm" style={{ color: "#0F1740" }}>HS Code: <strong>1006.30</strong> — Rice, semi-milled or wholly milled</p>
                      <button className="text-xs font-semibold mt-1.5 hover:opacity-70 transition-opacity" style={{ color: "#4875EF" }}>Apply suggestion →</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Minimum Order Quantity" placeholder="e.g. 500 kg" value={vals.moq || ""} onChange={set("moq")} />
                    <Field label="Price (FOB USD)" placeholder="per MT" value={vals.price || ""} onChange={set("price")} />
                  </div>
                </div>
              </StepCard>
            </div>
          )}
          {levelNum > 6 && (
            <div className="space-y-5">
              <StepCard icon={lvl.badge} title={lvl.title} description={lvl.desc} onAskAI={() => {}}>
                <div className="space-y-4">
                  <Field label="Details" placeholder="Enter relevant information" value={vals.details || ""} onChange={set("details")} />
                </div>
              </StepCard>
            </div>
          )}
        </div>

        {/* RIGHT: contextual sidebar */}
        <div className="space-y-4 md:sticky md:top-20">
          {/* Reward card */}
          <SidebarCard title="Your Reward">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{lvl.badge}</div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{lvl.title} Badge</p>
                <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>Earned on completion</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl p-3 text-center" style={{ background: "#FEF3C7" }}>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 700, color: "#D97706" }}>+{lvl.xp}</p>
                <p className="text-xs" style={{ color: "#9BA3C4" }}>XP Earned</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "#DCFCE7" }}>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 700, color: "#16A34A" }}>+{lvl.readiness - (levelNum > 1 ? LEVELS[levelNum - 2].readiness : 0)}%</p>
                <p className="text-xs" style={{ color: "#9BA3C4" }}>Readiness</p>
              </div>
            </div>
          </SidebarCard>

          {/* Why this matters */}
          {sidebar && (
            <SidebarCard title="Why This Matters">
              <div className="space-y-3">
                {sidebar.whyMatters.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <p className="text-xs leading-relaxed" style={{ color: "#6B7294" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </SidebarCard>
          )}

          {/* Pro Tip */}
          {sidebar?.tip && (
            <SidebarCard title="Pro Tip">
              <p className="text-xs leading-relaxed" style={{ color: "#6B7294" }}>💡 {sidebar.tip}</p>
            </SidebarCard>
          )}

          {/* Security note */}
          {sidebar?.security && (
            <SidebarCard title="Security">
              <p className="text-xs leading-relaxed flex items-start gap-2" style={{ color: "#6B7294" }}>
                <span>🔒</span> {sidebar.security}
              </p>
            </SidebarCard>
          )}

          {/* Ask AI */}
          <SidebarCard title="Ask AI">
            <div className="rounded-xl px-4 py-3 mb-3" style={{ background: "#F4F6FF", border: "1px solid rgba(72,117,239,0.12)" }}>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>e.g. "What documents do I need for Aadhaar verification?"</p>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -1 }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "#EBF0FF", color: "#4875EF", border: "1.5px solid rgba(72,117,239,0.2)" }}>
              🤖 Ask EXIMARG AI
            </motion.button>
          </SidebarCard>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 md:px-10 py-4 flex items-center justify-between"
        style={{ background: "rgba(250,251,255,0.97)", backdropFilter: "blur(12px)", borderColor: "rgba(15,23,64,0.07)" }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>
            +{lvl.xp} XP · +{lvl.readiness}% Readiness
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#C8CEDF" }}>Total after: {xp + lvl.xp} XP</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDone(true)} className="text-xs font-medium transition-opacity hover:opacity-60"
            style={{ color: "#C8CEDF" }}>
            Skip for now
          </button>
          {levelNum !== 5 && (
            <JourneyButton variant="primary" size="md" onClick={() => setDone(true)}>
              {levelNum === 6 ? "Lock Catalogue →" : levelNum === 9 ? "Enter Command Center →" : `Complete Level ${levelNum} →`}
            </JourneyButton>
          )}
        </div>
      </div>
    </ProductScreen>
  );
}

// ── CommandCenter ─────────────────────────────────────────────────────────────

// ── Toast system ─────────────────────────────────────────────────────────────

interface ToastItem { id: number; msg: string; type: ToastType }

function ToastStack({ toasts, remove }: { toasts: ToastItem[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[300] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto"
            style={{
              background: t.type === "success" ? "#0F1740" : t.type === "error" ? "#DC2626" : "#0F1740",
              color: "#fff",
              minWidth: "280px",
              maxWidth: "380px",
            }}
          >
            <span className="text-base flex-shrink-0">
              {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
            </span>
            <p className="text-sm flex-1">{t.msg}</p>
            <button onClick={() => remove(t.id)} className="text-white/50 hover:text-white text-xs ml-2">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Global Search Modal (Ctrl+K) ──────────────────────────────────────────────

const SEARCH_ITEMS = [
  { type: "page",    icon: "🏠", label: "Command Center",     id: "overview"  },
  { type: "page",    icon: "📦", label: "Products",           id: "products"  },
  { type: "page",    icon: "🤝", label: "Buyers",             id: "buyers"    },
  { type: "page",    icon: "📋", label: "Orders",             id: "orders"    },
  { type: "page",    icon: "🧾", label: "Invoices",           id: "invoices"  },
  { type: "page",    icon: "📁", label: "Documents",          id: "documents" },
  { type: "page",    icon: "✨", label: "AI Consultant",      id: "ai"        },
  { type: "page",    icon: "⚙️", label: "Settings",           id: "settings"  },
  { type: "action",  icon: "➕", label: "Add Product",         id: "add-product" },
  { type: "action",  icon: "🧾", label: "Create Invoice",      id: "create-invoice" },
  { type: "action",  icon: "⬆", label: "Upload Document",     id: "upload-doc" },
  { type: "action",  icon: "🤝", label: "Find Buyers",         id: "buyers" },
];

function SearchModal({ open, onClose, onNavigate, onAction }: {
  open: boolean; onClose: () => void;
  onNavigate: (id: string) => void; onAction: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const results = q.length > 0
    ? SEARCH_ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
    : SEARCH_ITEMS.slice(0, 6);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center pt-24 px-4"
      style={{ background: "rgba(15,23,64,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#ffffff", boxShadow: "0 24px 64px rgba(15,23,64,0.25)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <span style={{ color: "#9BA3C4" }}>🔍</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, products, buyers, invoices…"
            className="flex-1 text-sm outline-none bg-transparent" style={{ color: "#0F1740" }} />
          <kbd className="text-xs px-2 py-0.5 rounded" style={{ background: "#F4F6FF", color: "#9BA3C4" }}>Esc</kbd>
        </div>
        <div className="py-2">
          {q.length === 0 && <p className="px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>Quick Access</p>}
          {results.map((r) => (
            <button key={r.id + r.label} onClick={() => { r.type === "action" ? onAction(r.id) : onNavigate(r.id); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50">
              <span className="text-base w-6 text-center">{r.icon}</span>
              <span style={{ color: "#374151" }}>{r.label}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "#F4F6FF", color: "#9BA3C4" }}>
                {r.type === "action" ? "Action" : "Page"}
              </span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: "#9BA3C4" }}>No results for "{q}"</p>
          )}
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 border-t text-xs" style={{ borderColor: "rgba(15,23,64,0.07)", color: "#C8CEDF" }}>
          <span>↑↓ navigate</span><span>↵ select</span><span>Esc close</span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Add Product Wizard ────────────────────────────────────────────────────────

const WIZARD_STEPS = ["Basic Details", "Pricing", "Images", "Specifications", "Export Details"];

function AddProductWizard({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [step, setStep] = useState(0);
  const [vals, setVals] = useState<Record<string, string>>({});
  const set = (k: string) => (v: string) => setVals((p) => ({ ...p, [k]: v }));

  const handleSave = () => { onSave(); onClose(); setStep(0); setVals({}); };

  return (
    <Modal open={open} onClose={onClose} title="Add Product" wide>
      {/* Step indicator */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: i < step ? "#22C55E" : i === step ? "#4875EF" : "#F4F6FF", color: i <= step ? "#fff" : "#9BA3C4" }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium hidden md:block" style={{ color: i === step ? "#0F1740" : "#9BA3C4" }}>{s}</span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <div className="flex-1 h-px w-4" style={{ background: i < step ? "#22C55E" : "rgba(15,23,64,0.1)" }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {step === 0 && <>
          <Field label="Product Name" placeholder="e.g. Premium Basmati Rice 1121" value={vals.name || ""} onChange={set("name")} />
          <FieldSelect label="Category" options={["Rice & Grains","Spices & Herbs","Food Products","Textiles","Machinery","Chemicals","Handicrafts"]} value={vals.cat || ""} onChange={set("cat")} />
          <Field label="Short Description" placeholder="Describe your product in 1–2 sentences" value={vals.desc || ""} onChange={set("desc")} />
        </>}
        {step === 1 && <>
          <Field label="Price (FOB USD)" placeholder="e.g. $480 per MT" value={vals.price || ""} onChange={set("price")} hint="Free On Board — excludes freight" />
          <Field label="Minimum Order Quantity" placeholder="e.g. 500 kg" value={vals.moq || ""} onChange={set("moq")} />
          <FieldSelect label="Currency" options={["USD","EUR","GBP","AED","INR"]} value={vals.currency || ""} onChange={set("currency")} />
        </>}
        {step === 2 && (
          <div className="space-y-3">
            <UploadZone label="Upload Product Photos" hint="JPG, PNG — up to 10 images, max 5MB each" wide />
            <UploadZone label="Upload Technical Sheet" hint="PDF spec sheet, test certificates" wide />
          </div>
        )}
        {step === 3 && <>
          <div className="rounded-xl p-4 flex items-start gap-3 mb-2" style={{ background: "#EBF0FF", border: "1px solid rgba(72,117,239,0.15)" }}>
            <span>🤖</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#4875EF" }}>AI HS Code Suggestion</p>
              <p className="text-sm mt-0.5" style={{ color: "#0F1740" }}>HS Code: <strong>1006.30</strong> — Rice, semi-milled</p>
              <button className="text-xs font-semibold mt-1 hover:opacity-70" style={{ color: "#4875EF" }}>Apply</button>
            </div>
          </div>
          <Field label="HS Code" placeholder="e.g. 1006.30" value={vals.hs || ""} onChange={set("hs")} />
          <Field label="Product Certifications" placeholder="e.g. FSSAI, APEDA, ISO 22000" value={vals.certs || ""} onChange={set("certs")} />
        </>}
        {step === 4 && <>
          <ChipSelect label="Target Export Countries" options={["Germany","USA","UAE","UK","Japan","Australia","Canada","France"]} selected={(vals.countries || "").split(",").filter(Boolean)} onToggle={(o) => { const arr = (vals.countries || "").split(",").filter(Boolean); set("countries")(arr.includes(o) ? arr.filter((x) => x !== o).join(",") : [...arr, o].join(",")); }} />
          <FieldSelect label="Preferred Incoterm" options={["FOB","CIF","EXW","DAP","DDP"]} value={vals.incoterm || ""} onChange={set("incoterm")} />
        </>}
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(15,23,64,0.07)", background: "#FAFBFF" }}>
        <button onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
          className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-gray-100"
          style={{ color: "#6B7294" }}>{step === 0 ? "Cancel" : "← Back"}</button>
        <div className="flex items-center gap-2">
          <button className="text-xs" style={{ color: "#C8CEDF" }} onClick={() => {}}>Save draft</button>
          {step < WIZARD_STEPS.length - 1
            ? <JourneyButton variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>Continue →</JourneyButton>
            : <JourneyButton variant="primary" size="sm" onClick={handleSave}>Add Product ✓</JourneyButton>}
        </div>
      </div>
    </Modal>
  );
}

// ── Buyer Profile Drawer ──────────────────────────────────────────────────────

function BuyerProfileDrawer({ buyer, open, onClose, onToast }: {
  buyer: { name: string; country: string; deals: number; trust: number; status: string } | null;
  open: boolean; onClose: () => void; onToast: (msg: string, type: ToastType) => void;
}) {
  const [tab, setTab] = useState("overview");
  if (!buyer) return null;
  const TABS = ["Overview", "Orders", "Invoices", "Chat", "AI Tips"];
  return (
    <Drawer open={open} onClose={onClose} title={buyer.name}>
      <div className="space-y-5">
        {/* Header card */}
        <div className="rounded-xl p-4" style={{ background: "#F8F9FF", border: "1px solid rgba(15,23,64,0.07)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: "#4875EF", color: "#fff" }}>{buyer.name[0]}</div>
            <div>
              <p className="font-bold" style={{ color: "#0F1740" }}>{buyer.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{buyer.country}</p>
            </div>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: buyer.status === "Active" ? "#DCFCE7" : "#EBF0FF", color: buyer.status === "Active" ? "#16A34A" : "#4875EF" }}>
              {buyer.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center rounded-lg py-2.5" style={{ background: "#fff" }}>
              <p className="font-bold" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740" }}>{buyer.deals}</p>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>Deals</p>
            </div>
            <div className="text-center rounded-lg py-2.5" style={{ background: "#fff" }}>
              <p className="font-bold" style={{ fontFamily: "'Fraunces', serif", color: "#22C55E" }}>{buyer.trust}%</p>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>Trust</p>
            </div>
            <div className="text-center rounded-lg py-2.5" style={{ background: "#fff" }}>
              <p className="font-bold" style={{ fontFamily: "'Fraunces', serif", color: "#4875EF" }}>A+</p>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>Rating</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "✉", label: "Send Email",    action: () => onToast("Email draft opened", "info") },
            { icon: "🧾", label: "Create Invoice", action: () => onToast("Invoice builder opening…", "info") },
            { icon: "📊", label: "Quotation",     action: () => onToast("Quotation generator opened", "info") },
            { icon: "⭐", label: "Mark Favourite",action: () => onToast(`${buyer.name} marked as favourite`, "success") },
          ].map((a) => (
            <motion.button key={a.label} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={a.action}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{ background: "#F4F6FF", border: "1px solid rgba(15,23,64,0.07)", color: "#374151" }}>
              <span>{a.icon}</span>{a.label}
            </motion.button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t.toLowerCase())}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: tab === t.toLowerCase() ? "#4875EF" : "#F4F6FF", color: tab === t.toLowerCase() ? "#fff" : "#6B7294" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="space-y-3">
            {[
              { k: "Company",      v: buyer.name },
              { k: "Country",      v: buyer.country },
              { k: "Last Contact", v: "2 hours ago" },
              { k: "Total Orders", v: String(buyer.deals) },
              { k: "Avg Order",    v: "$18,400" },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
                <p className="text-xs" style={{ color: "#9BA3C4" }}>{r.k}</p>
                <p className="text-sm font-medium" style={{ color: "#374151" }}>{r.v}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "chat" && (
          <div className="space-y-3">
            {[
              { me: false, text: "I need sample container Basmati 1121. Price CIF Hamburg?" },
              { me: true,  text: "Hello! We can offer $520/MT CIF Hamburg. MOQ 20MT. Shall I send a proforma?" },
              { me: false, text: "Yes please. Also need FSSAI certificate." },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm" style={{ background: m.me ? "#4875EF" : "#F4F6FF", color: m.me ? "#fff" : "#374151" }}>{m.text}</div>
              </div>
            ))}
          </div>
        )}
        {(tab === "orders" || tab === "invoices") && (
          <p className="text-sm text-center py-8" style={{ color: "#9BA3C4" }}>No {tab} found for this buyer yet.</p>
        )}
        {tab === "ai tips" && (
          <div className="rounded-xl p-4" style={{ background: "#EBF0FF", border: "1px solid rgba(72,117,239,0.15)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#4875EF" }}>✨ AI Insight</p>
            <p className="text-sm" style={{ color: "#374151" }}>This buyer has a strong track record. Offering Net 30 payment terms could increase your chance of closing by ~35%.</p>
          </div>
        )}
      </div>
    </Drawer>
  );
}

// ── Order Detail Modal ────────────────────────────────────────────────────────

function OrderDetailModal({ order, open, onClose }: {
  order: { id: string; buyer: string; product: string; value: string; date: string; status: string } | null;
  open: boolean; onClose: () => void;
}) {
  const [tab, setTab] = useState("overview");
  if (!order) return null;
  const TABS = ["Overview", "Timeline", "Shipping", "Payments", "Documents"];
  const TIMELINE = [
    { icon: "✅", label: "Order Placed",   date: "Dec 5",  done: true  },
    { icon: "📦", label: "Packed",          date: "Dec 7",  done: true  },
    { icon: "🚢", label: "Shipped",          date: "Dec 10", done: true  },
    { icon: "🛃", label: "Customs Cleared", date: "Dec 14", done: order.status === "Completed" },
    { icon: "🏠", label: "Delivered",       date: "Dec 18", done: order.status === "Completed" },
  ];
  return (
    <Modal open={open} onClose={onClose} title={order.id} wide>
      <div className="px-6 py-4">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[{ l: "Buyer", v: order.buyer }, { l: "Value", v: order.value }, { l: "Status", v: order.status }].map((s) => (
            <div key={s.l} className="rounded-xl p-3" style={{ background: "#F8F9FF" }}>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>{s.l}</p>
              <p className="font-bold text-sm mt-0.5" style={{ color: "#0F1740" }}>{s.v}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t.toLowerCase())}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: tab === t.toLowerCase() ? "#4875EF" : "#F4F6FF", color: tab === t.toLowerCase() ? "#fff" : "#6B7294" }}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-2">
            {[
              { k: "Product",       v: order.product },
              { k: "Buyer",         v: order.buyer },
              { k: "Order Date",    v: order.date },
              { k: "Incoterm",      v: "CIF Hamburg" },
              { k: "Payment",       v: "50% advance + 50% on BL" },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
                <p className="text-xs" style={{ color: "#9BA3C4" }}>{r.k}</p>
                <p className="text-sm font-medium" style={{ color: "#374151" }}>{r.v}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "timeline" && (
          <div className="space-y-4">
            {TIMELINE.map((t, i) => (
              <div key={t.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.done ? "#DCFCE7" : "#F4F6FF" }}>
                  <span className="text-sm">{t.done ? "✓" : t.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: t.done ? "#0F1740" : "#9BA3C4" }}>{t.label}</p>
                  <p className="text-xs" style={{ color: "#C8CEDF" }}>{t.date}, 2024</p>
                </div>
                {t.done && <span className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />}
              </div>
            ))}
          </div>
        )}
        {tab === "documents" && (
          <div className="space-y-2">
            {["Packing List","Commercial Invoice","Bill of Lading","Certificate of Origin"].map((d) => (
              <div key={d} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
                <div className="flex items-center gap-2"><span>📄</span><p className="text-sm" style={{ color: "#374151" }}>{d}</p></div>
                <button className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: "#EBF0FF", color: "#4875EF" }}>Download</button>
              </div>
            ))}
          </div>
        )}
        {(tab === "shipping" || tab === "payments") && (
          <p className="text-sm text-center py-8" style={{ color: "#9BA3C4" }}>Details loading…</p>
        )}
      </div>
      <div className="px-6 pb-5 flex items-center gap-3">
        <JourneyButton variant="primary" size="sm" onClick={onClose}>Update Status</JourneyButton>
        <button className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50" style={{ color: "#6B7294" }}>Download All Docs</button>
      </div>
    </Modal>
  );
}

// ── Upload Document Modal ─────────────────────────────────────────────────────

function UploadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "done">("idle");

  const startUpload = () => {
    setStage("uploading"); setProgress(0);
    const t1 = setInterval(() => setProgress((p) => { if (p >= 70) { clearInterval(t1); setStage("processing"); const t2 = setInterval(() => setProgress((p2) => { if (p2 >= 100) { clearInterval(t2); setStage("done"); } return p2 + 5; }), 80); } return p + 8; }), 100);
  };

  const reset = () => { setStage("idle"); setProgress(0); };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Upload Document">
      <div className="px-6 py-6 space-y-5">
        {stage === "idle" && (
          <>
            <div className="flex items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-blue-400"
              style={{ borderColor: "rgba(72,117,239,0.25)", background: "#F8F9FF" }}
              onClick={startUpload}>
              <div className="text-center">
                <div className="text-3xl mb-2">⬆</div>
                <p className="font-semibold text-sm" style={{ color: "#4875EF" }}>Click to upload or drag & drop</p>
                <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>PDF, JPG, PNG — up to 10MB</p>
              </div>
            </div>
            <FieldSelect label="Document Category" options={["Identity Documents","Business Registration","Compliance & Licences","Invoices & POs","Shipping Documents","Financial Records"]} value="" onChange={() => {}} />
          </>
        )}
        {(stage === "uploading" || stage === "processing") && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1" style={{ color: "#0F1740" }}>document.pdf</p>
                <div className="w-full h-1.5 rounded-full" style={{ background: "#EBF0FF" }}>
                  <motion.div className="h-full rounded-full" style={{ background: "#4875EF", width: `${progress}%` }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
                </div>
                <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>
                  {stage === "uploading" ? `Uploading… ${progress}%` : `AI processing… OCR in progress`}
                </p>
              </div>
            </div>
          </div>
        )}
        {stage === "done" && (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-bold text-lg" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740" }}>Upload Complete</p>
            <p className="text-sm mt-2 mb-4" style={{ color: "#9BA3C4" }}>Document verified and auto-categorized by AI.</p>
            <JourneyButton variant="primary" size="md" className="mx-auto" onClick={() => { onDone(); reset(); onClose(); }}>Done</JourneyButton>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Invoice Builder Modal ─────────────────────────────────────────────────────

function InvoiceBuilderModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [buyer, setBuyer] = useState("Müller GmbH");
  const [product, setProduct] = useState("Premium Basmati Rice 1121");
  const [qty, setQty] = useState("20");
  const [price, setPrice] = useState("480");
  const [currency, setCurrency] = useState("USD");
  const [preview, setPreview] = useState(false);
  const total = (parseFloat(qty || "0") * parseFloat(price || "0")).toLocaleString();

  return (
    <Modal open={open} onClose={onClose} title={preview ? "Invoice Preview" : "Invoice Builder"} wide>
      {!preview ? (
        <>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Buyer / Company" value={buyer} onChange={setBuyer} />
              <FieldSelect label="Currency" options={["USD","EUR","GBP","AED"]} value={currency} onChange={setCurrency} />
            </div>
            <Field label="Product" value={product} onChange={setProduct} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quantity (MT)" value={qty} onChange={setQty} />
              <Field label="Unit Price" value={price} onChange={setPrice} hint="Per MT" />
            </div>
            <div className="rounded-xl p-4" style={{ background: "#F8F9FF", border: "1px solid rgba(15,23,64,0.07)" }}>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: "#6B7294" }}>Subtotal</p>
                <p className="font-bold" style={{ color: "#0F1740" }}>{currency} {total}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm" style={{ color: "#6B7294" }}>Freight (estimated)</p>
                <p className="text-sm" style={{ color: "#9BA3C4" }}>+ Calculated on export</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(15,23,64,0.07)", background: "#FAFBFF" }}>
            <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100" style={{ color: "#6B7294" }}>Cancel</button>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreview(true)} className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: "#EBF0FF", color: "#4875EF" }}>Preview</button>
              <JourneyButton variant="primary" size="sm" onClick={() => { onSave(); onClose(); }}>Create Invoice</JourneyButton>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="px-6 py-5">
            <div className="rounded-xl p-5" style={{ background: "#F8F9FF", border: "1px solid rgba(15,23,64,0.07)" }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="font-bold" style={{ color: "#0F1740" }}>EXIMARG</p>
                  <p className="text-xs" style={{ color: "#9BA3C4" }}>Ravi Exports Pvt. Ltd.</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740" }}>INVOICE</p>
                  <p className="text-xs" style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>INV-2024-048</p>
                </div>
              </div>
              <div className="border-t pt-4 mb-4" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#9BA3C4" }}>Bill To</p>
                <p className="font-semibold text-sm" style={{ color: "#0F1740" }}>{buyer}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#6B7294" }}>{product} × {qty} MT @ {currency} {price}/MT</span>
                <span className="font-bold" style={{ color: "#0F1740" }}>{currency} {total}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(15,23,64,0.07)", background: "#FAFBFF" }}>
            <button onClick={() => setPreview(false)} className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100" style={{ color: "#6B7294" }}>← Edit</button>
            <div className="flex items-center gap-2">
              <button className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: "#EBF0FF", color: "#4875EF" }}>Download PDF</button>
              <JourneyButton variant="primary" size="sm" onClick={() => { onSave(); onClose(); }}>Send to Buyer</JourneyButton>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Logout Confirm Modal ──────────────────────────────────────────────────────

function LogoutModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Sign Out">
      <div className="px-6 py-6 text-center">
        <div className="text-4xl mb-3">👋</div>
        <p className="font-bold text-base mb-2" style={{ color: "#0F1740" }}>Are you sure you want to sign out?</p>
        <p className="text-sm mb-6" style={{ color: "#9BA3C4" }}>You will need to sign in again to access your dashboard.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50" style={{ color: "#6B7294" }}>Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#DC2626", color: "#fff" }}>Sign Out</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Command Center ─────────────────────────────────────────────────────────────

const SIDEBAR_NAV = [
  { icon: "🏠", label: "Command Center",   id: "overview",      section: "business" },
  { icon: "📦", label: "Products",          id: "products",      section: "business" },
  { icon: "🤝", label: "Buyers",            id: "buyers",        section: "business" },
  { icon: "📋", label: "Orders",            id: "orders",        section: "business" },
  { icon: "🧾", label: "Invoices",          id: "invoices",      section: "business" },
  { icon: "📁", label: "Documents",         id: "documents",     section: "business" },
  { icon: "✨", label: "AI Consultant",     id: "ai",            section: "business" },
  { icon: "⚙️", label: "Settings",          id: "settings",      section: "business" },
  { icon: "🗺️", label: "Export Passport",   id: "passport",      section: "journey"  },
  { icon: "🏆", label: "Achievements",      id: "achievements",  section: "journey"  },
  { icon: "🎯", label: "Quests",            id: "quests",        section: "journey"  },
  { icon: "⚔️", label: "Battle Pass",       id: "battle-pass",   section: "journey"  },
  { icon: "🏅", label: "Leaderboard",       id: "leaderboard",   section: "journey"  },
  { icon: "💎", label: "Power-Ups",         id: "power-ups",     section: "journey"  },
  { icon: "🧠", label: "Skill Tree",        id: "skill-tree",    section: "journey"  },
  { icon: "🎬", label: "Story Mode",        id: "story-mode",    section: "journey"  },
];

function TopLoadingBar({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="topbar"
          className="fixed top-0 left-0 z-[400] h-[3px] pointer-events-none"
          style={{
            background: "linear-gradient(to right, #4875EF, #7BA4FF, #60A5FA)",
            boxShadow: "0 0 10px rgba(72,117,239,0.6)",
          }}
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "88%" }}
          exit={{ width: "100%", opacity: 0 }}
          transition={{
            width: { duration: 0.45, ease: "easeOut" },
            opacity: { duration: 0.25, delay: 0.05 },
          }}
        />
      )}
    </AnimatePresence>
  );
}

// ── CommandCenter shell ───────────────────────────────────────────────────────
function CommandCenter({ xp, onBack }: { xp: number; onBack: () => void }) {
  const [page, setPage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ── Toast system ──
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const addToast = (msg: string, type: ToastType = "success") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  // ── Modal states ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [spinOpen, setSpinOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<{ name: string; country: string; deals: number; trust: number; status: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; buyer: string; product: string; value: string; date: string; status: string } | null>(null);

  // ── Global keyboard shortcut ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setProfileOpen(false); setNotifOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = (id: string) => {
    if (id !== page) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 550);
    }
    setPage(id);
    setProfileOpen(false);
  };

  const handleAction = (id: string) => {
    if (id === "add-product") { setAddProductOpen(true); navigate("products"); }
    else if (id === "create-invoice") { setInvoiceOpen(true); navigate("invoices"); }
    else if (id === "upload-doc") { setUploadOpen(true); navigate("documents"); }
    else navigate(id);
  };

  const currentNav = SIDEBAR_NAV.find((n) => n.id === page) ?? SIDEBAR_NAV[0];

  const PageContent = () => {
    switch (page) {
      case "overview":  return <OverviewPage xp={xp} onAction={handleAction} />;
      case "products":  return <ProductsPage addToast={addToast} onAddProduct={() => setAddProductOpen(true)} />;
      case "buyers":    return <BuyersPage addToast={addToast} onSelectBuyer={setSelectedBuyer} />;
      case "orders":    return <OrdersPage addToast={addToast} onSelectOrder={setSelectedOrder} />;
      case "invoices":  return <InvoicesPage addToast={addToast} onNewInvoice={() => setInvoiceOpen(true)} />;
      case "documents": return <DocumentsPage addToast={addToast} onUpload={() => setUploadOpen(true)} />;
      case "ai":        return <AIPage />;
      case "settings":      return <SettingsPage addToast={addToast} />;
      case "profile":       return <MyProfilePage addToast={addToast} />;
      case "passport":      return <ExportPassportPage />;
      case "achievements":  return <AchievementsPage addToast={addToast} />;
      case "quests":        return <QuestsPage addToast={addToast} />;
      case "battle-pass":   return <BattlePassPage />;
      case "leaderboard":   return <LeaderboardPage />;
      case "power-ups":     return <PowerUpsPage addToast={addToast} />;
      case "skill-tree":    return <SkillTreePage addToast={addToast} />;
      case "story-mode":    return <StoryModePage />;
      default:              return <OverviewPage xp={xp} onAction={handleAction} onNavigate={navigate} onSpin={() => setSpinOpen(true)} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }} className="fixed inset-0 z-[150] flex"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F4F6FF", color: "#0F1740" }}>

      <TopLoadingBar active={isLoading} />
      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? "64px" : "224px" }}
        transition={{ duration: 0.3, ease: EASE }}
        className="hidden md:flex flex-col flex-shrink-0 border-r overflow-hidden"
        style={{ background: "#ffffff", borderColor: "rgba(15,23,64,0.08)" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b flex-shrink-0" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#4875EF" }}>
            <span className="text-white text-xs font-bold">E</span>
          </div>
          {!collapsed && <span className="font-bold text-sm whitespace-nowrap" style={{ color: "#0F1740" }}>eximarg</span>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden">
          {/* Business section */}
          {!collapsed && (
            <p className="px-3 pb-1 pt-1 text-xs font-bold tracking-widest uppercase" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>Business</p>
          )}
          {SIDEBAR_NAV.filter((n) => n.section === "business").map((item) => {
            const active = page === item.id;
            return (
              <motion.button key={item.id} onClick={() => navigate(item.id)} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-left transition-all duration-150 relative mb-0.5"
                style={{ background: active ? "#EBF0FF" : "transparent", color: active ? "#4875EF" : "#6B7294" }}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                {active && <motion.div layoutId="sidebar-active" className="absolute left-0 inset-y-1 w-0.5 rounded-full" style={{ background: "#4875EF" }} />}
              </motion.button>
            );
          })}

        </nav>

        {/* Bottom items — Help + Log Out only */}
        <div className="px-2 py-3 space-y-0.5 border-t" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          {[{ icon: "❓", label: "Help Center" }, { icon: "↩", label: "Log Out" }].map((item) => (
            <button key={item.label}
              onClick={item.label === "Log Out" ? () => setLogoutOpen(true) : undefined}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors hover:bg-gray-50"
              style={{ color: "#9BA3C4" }}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed((p) => !p)}
          className="flex items-center justify-center h-10 border-t text-sm transition-colors hover:bg-gray-50"
          style={{ borderColor: "rgba(15,23,64,0.07)", color: "#C8CEDF" }}>
          {collapsed ? "→" : "←"}
        </button>
      </motion.aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top nav */}
        <div className="flex items-center gap-4 px-6 h-14 border-b flex-shrink-0"
          style={{ background: "#ffffff", borderColor: "rgba(15,23,64,0.08)" }}>

          {/* Title */}
          <div className="flex-shrink-0">
            <p className="font-bold text-base" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740", letterSpacing: "-0.02em" }}>
              {currentNav.label}
            </p>
          </div>

          {/* Global search — opens Ctrl+K modal */}
          <div className="flex-1 max-w-sm hidden md:block">
            <button onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 pl-3 pr-3 py-2 rounded-xl text-xs text-left transition-all hover:border-blue-300"
              style={{ background: "#F4F6FF", border: "1.5px solid rgba(15,23,64,0.08)", color: "#C8CEDF" }}>
              <span>🔍</span>
              <span className="flex-1">Search buyers, products, orders…</span>
              <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#ffffff", color: "#C8CEDF", border: "1px solid rgba(15,23,64,0.1)" }}>⌘K</kbd>
            </button>
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                style={{ background: notifOpen ? "#EBF0FF" : "#F4F6FF" }}>
                🔔
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#DC2626" }} />
              </motion.button>
              <AnimatePresence>
                {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
              </AnimatePresence>
            </div>

            {/* AI quick */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPage("ai")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
              style={{ background: "#EBF0FF", color: "#4875EF" }}>
              ✨
            </motion.button>

            {/* Journey panel toggle */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setJourneyOpen((p) => !p)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all"
              style={{ background: journeyOpen ? "#0F1740" : "#F4F6FF", color: journeyOpen ? "#fff" : "#6B7294" }}
              title="Toggle Journey panel">
              🗺️
            </motion.button>

            {/* Profile avatar */}
            <div className="relative">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "#4875EF", color: "#fff" }}>
                R
              </motion.button>
              <AnimatePresence>
                {profileOpen && (
                  <ProfileDropdown
                    xp={xp}
                    onClose={() => setProfileOpen(false)}
                    onNavigate={(p) => { navigate(p); setProfileOpen(false); }}
                    onBack={() => setLogoutOpen(true)}
                    onSupport={() => { setSupportOpen(true); setProfileOpen(false); }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-7">
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }}>
              <PageContent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right Journey Panel ── */}
      <AnimatePresence>
        {journeyOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 216, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="hidden lg:flex flex-col flex-shrink-0 border-l overflow-hidden"
            style={{ background: "#F8F9FF", borderColor: "rgba(15,23,64,0.08)" }}
          >
            {/* ── Hero: circular XP arc + rank ── */}
            <div className="px-4 pt-5 pb-4 flex flex-col items-center border-b"
              style={{ borderColor: "rgba(15,23,64,0.07)", background: "#ffffff" }}>
              {/* SVG circular progress */}
              <div className="relative" style={{ width: 80, height: 80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  {/* Track */}
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#EBF0FF" strokeWidth="6" />
                  {/* Progress arc — 68% of 214px circumference ≈ 145 */}
                  <motion.circle cx="40" cy="40" r="34" fill="none"
                    stroke="url(#xpArc)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray="214" strokeDashoffset="214"
                    animate={{ strokeDashoffset: 214 - 214 * 0.68 }}
                    transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
                    transform="rotate(-90 40 40)" />
                  <defs>
                    <linearGradient id="xpArc" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4875EF" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: "15px", fontWeight: 700, color: "#0F1740", lineHeight: 1 }}>
                    {xp || 1375}
                  </p>
                  <p style={{ fontSize: "8px", color: "#9BA3C4", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>XP</p>
                </div>
              </div>

              {/* Rank title */}
              <p className="text-xs font-bold mt-2 text-center" style={{ color: "#0F1740" }}>
                {getRank(GAME_DATA.level).icon} {getRank(GAME_DATA.level).title}
              </p>
              <p className="text-xs mt-0.5 text-center" style={{ color: "#C8CEDF" }}>1375 / 2000 to next rank</p>

              {/* Streak pill */}
              <motion.button onClick={() => navigate("quests")}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full mt-2.5 text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", color: "#D97706", border: "1px solid rgba(217,119,6,0.2)" }}>
                🔥 {GAME_DATA.streak}-day streak
              </motion.button>
            </div>

            {/* ── Journey nav — list style, colored icons ── */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {SIDEBAR_NAV.filter((n) => n.section === "journey").map((item, idx) => {
                const active = page === item.id;
                // Color coding per item
                const colors = ["#4875EF","#22C55E","#F59E0B","#7C3AED","#EC4899","#059669","#D97706","#DC2626"];
                const color = colors[idx % colors.length];
                const short = item.label
                  .replace("Export ", "").replace("Battle ", "")
                  .replace("Story ", "").replace(" Tree", "")
                  .replace(" Pass", "").replace(" Mode", "");
                return (
                  <motion.button key={item.id}
                    onClick={() => navigate(item.id)}
                    whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: active ? "#ffffff" : "transparent",
                      boxShadow: active ? `0 2px 12px rgba(15,23,64,0.08), inset 3px 0 0 ${color}` : "none",
                    }}>
                    {/* Colored icon badge */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: active ? `${color}18` : "rgba(15,23,64,0.04)" }}>
                      <span style={{ fontSize: "16px" }}>{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{
                        fontSize: "12px",
                        fontWeight: active ? 700 : 500,
                        color: active ? "#0F1740" : "#6B7294",
                        lineHeight: 1.2,
                      }}>
                        {short}
                      </p>
                    </div>
                    {active && (
                      <motion.div layoutId="journey-active-dot"
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: color }} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* ── Footer: spin button ── */}
            <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(15,23,64,0.07)", background: "#ffffff" }}>
              <motion.button onClick={() => setSpinOpen(true)}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(72,117,239,0.35)" }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #4875EF 0%, #7BA4FF 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(72,117,239,0.3)",
                }}>
                🎰 Daily Spin
              </motion.button>
              <p className="text-center text-xs mt-2" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.08em" }}>
                XP · POWER-UPS · BADGES
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(profileOpen || notifOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setProfileOpen(false); setNotifOpen(false); }} />
      )}

      {/* ── Global interactive overlays ── */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} onAction={handleAction} />

      <AddProductWizard open={addProductOpen} onClose={() => setAddProductOpen(false)}
        onSave={() => addToast("Product added successfully! It's now live in your Digital Dukan.", "success")} />

      <BuyerProfileDrawer buyer={selectedBuyer} open={!!selectedBuyer} onClose={() => setSelectedBuyer(null)} onToast={addToast} />

      <OrderDetailModal order={selectedOrder} open={!!selectedOrder} onClose={() => setSelectedOrder(null)} />

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)}
        onDone={() => addToast("Document uploaded and categorized by AI.", "success")} />

      <InvoiceBuilderModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)}
        onSave={() => addToast("Invoice created and sent to buyer.", "success")} />

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={onBack} />
      <SupportDrawer open={supportOpen} onClose={() => setSupportOpen(false)} />
      <DailySpinModal open={spinOpen} onClose={() => setSpinOpen(false)} onToast={addToast} />

      {/* ── Toast notifications ── */}
      <ToastStack toasts={toasts} remove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </motion.div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Features", "Journey", "Pricing", "About"];

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [screen, setScreen] = useState<ScreenType>("landing");
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [userPath, setUserPath] = useState<"new" | "existing">("new");
  const [xp, setXp] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (showOnboarding || screen !== "landing") ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showOnboarding, screen]);

  const handleSelectPath = (path: "new" | "existing" | "signin") => {
    setShowOnboarding(false);
    if (path === "signin") {
      setAuthMode("login"); setScreen("auth-login");
    } else {
      setUserPath(path); setAuthMode("register"); setScreen("auth-register");
    }
  };

  const getLevelNum = () => parseInt((screen as string).split("-")[1] || "1");

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
            onStartLevel={(n) => setScreen(`level-${n}` as ScreenType)}
            onGoToCommandCenter={() => setScreen("command-center")} />
        )}
        {screen.startsWith("level-") && (
          <LevelScreen key={screen} levelNum={getLevelNum()} xp={xp}
            onComplete={(earned) => {
              const n = getLevelNum();
              setXp((p) => p + earned);
              setCompletedLevels((p) => [...new Set([...p, n])]);
              setScreen(n < 9 ? `level-${n + 1}` as ScreenType : "command-center");
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

function RoadmapCard({ m }: { m: typeof MILESTONES[0] }) {
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
