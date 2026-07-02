import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { feature } from "topojson-client";
import {
  EASE, STAGGER_CONTAINER, STAGGER_ITEM, JourneyButton, DashCard,
  Field, FieldSelect, ChipSelect, Modal, Drawer, AnimatedNumber, TiltCard,
  ToastType, LEVELS,
} from "./shared";
import { GAME_DATA, RANK_TIERS, getRank, MiniQuestCard } from "./gamification";

// ── INDIA / DESTINATIONS constants (duplicated from App.tsx for FlatWorldMap) ─

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

// ── Flat World Map ───────────────────────────────────────────────────────────

const MAP_W = 860;
const MAP_H = 430;

function ll(lat: number, lon: number): string {
  const x = ((lon + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function ptsToD(pts: [number, number][]): string {
  return pts.map(([lat, lon], i) => `${i === 0 ? "M" : "L"}${ll(lat, lon)}`).join(" ") + "Z";
}

const LAND_MASSES: [number, number][][] = [
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

const INDIA_OUTLINE: [number, number][] = [
  [35,73],[32,78],[28,84],[20,88],[10,79],[8,77],[8,78],[15,72],[23,68],[35,73],
];

function arcD(destLat: number, destLon: number): string {
  const [x1, y1] = [((INDIA.lon + 180) / 360) * MAP_W, ((90 - INDIA.lat) / 180) * MAP_H];
  const [x2, y2] = [((destLon + 180) / 360) * MAP_W, ((90 - destLat) / 180) * MAP_H];
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${((x1 + x2) / 2).toFixed(1)},${((y1 + y2) / 2 - dist * 0.28).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

export function FlatWorldMap() {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((data) => {
        const countries = feature(data, data.objects.countries) as any;
        setGeoData(countries);
      })
      .catch((err) => console.error("Error loading map data:", err));
  }, []);

  const indiaCX = ((INDIA.lon + 180) / 360) * MAP_W;
  const indiaCY = ((90 - INDIA.lat) / 180) * MAP_H;

  const projectPoint = (lon: number, lat: number) => {
    const clampedLat = Math.min(84, Math.max(-55, lat));
    const x = ((lon + 180) / 360) * MAP_W;
    const y = ((90 - clampedLat) / 180) * MAP_H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const getGeoPath = (geometry: any): string => {
    if (!geometry) return "";
    const { type, coordinates } = geometry;

    if (type === "Polygon") {
      return coordinates
        .map((ring: any) => {
          let lastLon = 0;
          return ring
            .map(([lon, lat]: [number, number], idx: number) => {
              let command = "L";
              if (idx === 0) {
                command = "M";
              } else if (Math.abs(lon - lastLon) > 180) {
                command = "M";
              }
              lastLon = lon;
              return `${command}${projectPoint(lon, lat)}`;
            })
            .join(" ") + "Z";
        })
        .join(" ");
    }

    if (type === "MultiPolygon") {
      return coordinates
        .map((polygon: any) =>
          polygon
            .map((ring: any) => {
              let lastLon = 0;
              return ring
                .map(([lon, lat]: [number, number], idx: number) => {
                  let command = "L";
                  if (idx === 0) {
                    command = "M";
                  } else if (Math.abs(lon - lastLon) > 180) {
                    command = "M";
                  }
                  lastLon = lon;
                  return `${command}${projectPoint(lon, lat)}`;
                })
                .join(" ") + "Z";
            })
            .join(" ")
        )
        .join(" ");
    }

    return "";
  };

  const renderCountries = () => {
    if (!geoData) {
      return LAND_MASSES.map((pts, i) => (
        <path key={`fallback-${i}`} d={ptsToD(pts)} fill="rgba(72,117,239,0.12)" stroke="rgba(72,117,239,0.2)" strokeWidth="0.6" />
      ));
    }

    const features = geoData.features.filter((f: any) => f.properties?.name !== "Antarctica" && f.id !== "010");

    return features.map((geo: any, idx: number) => {
      const isIndia = geo.properties?.name === "India" || geo.id === "356" || geo.id === 356;
      const isHovered = hoveredCountry === geo.id;

      let fill = "rgba(72, 117, 239, 0.12)";
      let stroke = "rgba(72, 117, 239, 0.2)";
      let strokeWidth = "0.6";

      if (isIndia) {
        fill = "rgba(245, 158, 11, 0.2)";
        stroke = "#F59E0B";
        strokeWidth = "1";
      } else if (isHovered) {
        fill = "rgba(72, 117, 239, 0.28)";
        stroke = "rgba(72, 117, 239, 0.5)";
        strokeWidth = "0.9";
      }

      return (
        <path
          key={geo.id || idx}
          d={getGeoPath(geo.geometry)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          style={{ transition: "fill 0.2s, stroke 0.2s, stroke-width 0.2s" }}
          onMouseEnter={() => !isIndia && setHoveredCountry(geo.id)}
          onMouseLeave={() => setHoveredCountry(null)}
        />
      );
    });
  };

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
        return <line key={`lat${lat}`} x1={0} y1={y} x2={MAP_W} y2={y} stroke="rgba(72,117,239,0.08)" strokeWidth="0.5" />;
      })}
      {[-120, -60, 0, 60, 120].map((lon) => {
        const x = ((lon + 180) / 360) * MAP_W;
        return <line key={`lon${lon}`} x1={x} y1={0} x2={x} y2={MAP_H} stroke="rgba(72,117,239,0.08)" strokeWidth="0.5" />;
      })}

      {/* Landmasses */}
      {renderCountries()}

      {!geoData && (
        <path d={ptsToD(INDIA_OUTLINE)} fill="rgba(245,158,11,0.2)" stroke="#F59E0B" strokeWidth="1" />
      )}

      {/* Trade arcs — draw in sequence */}
      {DESTINATIONS.map((dest, i) => (
        <motion.path
          key={dest.name}
          d={arcD(dest.lat, dest.lon)}
          fill="none"
          stroke="#4875EF"
          strokeWidth="1.8"
          strokeDasharray="5 3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.2 + i * 0.2, ease: "easeOut" }}
        />
      ))}

      {/* Traveling packets — animate cx/cy along quadratic bezier keyframes */}
      {DESTINATIONS.map((dest, i) => {
        const x1 = ((INDIA.lon + 180) / 360) * MAP_W;
        const y1 = ((90 - INDIA.lat) / 180) * MAP_H;
        const x2 = ((dest.lon + 180) / 360) * MAP_W;
        const y2 = ((90 - dest.lat) / 180) * MAP_H;
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        // Control point (same as arcD)
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2 - dist * 0.28;
        // Sample 5 points along the quadratic bezier t=0,0.25,0.5,0.75,1
        const bx = (t: number) => (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
        const by = (t: number) => (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;
        return (
          <motion.circle
            key={`pkt-${dest.name}`}
            r="3"
            fill="#4875EF"
            initial={{ cx: x1, cy: y1, opacity: 0 }}
            animate={{
              cx: [x1, bx(0.25), bx(0.5), bx(0.75), x2, x2],
              cy: [y1, by(0.25), by(0.5), by(0.75), y2, y2],
              opacity: [0, 1, 1, 1, 0.6, 0],
            }}
            transition={{
              duration: 2.4,
              delay: 0.2 + i * 0.2 + 1.4,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3.5 + i * 0.4,
              times: [0, 0.25, 0.5, 0.75, 0.95, 1],
            }}
          />
        );
      })}

      {/* Destination dots with pulse rings */}
      {DESTINATIONS.map((dest, i) => {
        const dx = ((dest.lon + 180) / 360) * MAP_W;
        const dy = ((90 - dest.lat) / 180) * MAP_H;
        const arrivalDelay = 0.2 + i * 0.2 + 1.3;
        return (
          <motion.g key={dest.name}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: arrivalDelay, ease: [0.34,1.56,0.64,1] }}
          >
            {/* Outer pulse ring */}
            <motion.circle cx={dx} cy={dy} r="5" fill="none" stroke="#4875EF" strokeWidth="1"
              animate={{ r: [5, 12, 5], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            />
            {/* Inner dot */}
            <circle cx={dx} cy={dy} r="4" fill="#4875EF" opacity="0.9" />
            <circle cx={dx} cy={dy} r="2" fill="white" />
            {/* City label */}
            <text x={dx} y={dy - 9} fontSize="8" fill="#4875EF" fillOpacity="0.75" textAnchor="middle"
              style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em" }}>
              {dest.name}
            </text>
          </motion.g>
        );
      })}

      {/* India origin — triple ring pulse */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Three staggered pulse rings */}
        {[0, 0.8, 1.6].map((delay, i) => (
          <motion.circle key={i} cx={indiaCX} cy={indiaCY} r="8" fill="none" stroke="#F59E0B" strokeWidth="1.2"
            animate={{ r: [8, 22, 8], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay }}
          />
        ))}
        {/* Core dot */}
        <circle cx={indiaCX} cy={indiaCY} r="7" fill="#F59E0B" />
        <circle cx={indiaCX} cy={indiaCY} r="4" fill="white" />
        <circle cx={indiaCX} cy={indiaCY} r="2" fill="#F59E0B" />
        <text x={indiaCX} y={indiaCY + 18} fontSize="9" fill="#D97706" textAnchor="middle" fontWeight="700"
          style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
          INDIA
        </text>
      </motion.g>
    </svg>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, cta, onCta }: { icon: string; title: string; desc: string; cta: string; onCta?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>{title}</h3>
      <p className="text-sm mt-2 mb-6 max-w-xs" style={{ color: "#9BA3C4" }}>{desc}</p>
      <JourneyButton variant="primary" size="sm" onClick={onCta}>{cta}</JourneyButton>
    </div>
  );
}

// ── Overview page ─────────────────────────────────────────────────────────────
export function OverviewPage({ xp, onAction, onNavigate, onSpin }: {
  xp: number;
  onAction?: (id: string) => void;
  onNavigate?: (id: string) => void;
  onSpin?: () => void;
}) {
  const ACTIVITY = [
    { icon: "🚢", e: "Shipment #183 departed Mumbai Port",       t: "2h ago"     },
    { icon: "📩", e: "New inquiry from Stockholm, Sweden",        t: "5h ago"     },
    { icon: "✅", e: "Invoice #047 approved — Müller GmbH",      t: "Yesterday"  },
    { icon: "📄", e: "Certificate of Origin issued — FIEO",      t: "Yesterday"  },
    { icon: "🔄", e: "RCMC renewal completed",                    t: "3 days ago" },
  ];

  return (
    <div style={{ maxWidth: "860px" }} className="space-y-8">

      {/* ── Greeting — no card, just space ── */}
      <div className="pt-2">
        <p className="text-xs tracking-[0.25em] uppercase mb-2"
          style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>Good morning</p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Rajesh Kumar
        </h1>
        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
          <span className="text-sm" style={{ color: "#9BA3C4" }}>Ravi Exports Pvt. Ltd.</span>
          <span className="h-3.5 w-px" style={{ background: "rgba(15,23,64,0.12)" }} />
          <span className="text-sm font-semibold" style={{ color: "#7C3AED" }}>
            {getRank(GAME_DATA.level).icon} {getRank(GAME_DATA.level).title}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#DC2626" }}>
            🔥 {GAME_DATA.streak}-day streak
          </span>
        </div>

        {/* Inline key stats — no cards, just numbers */}
        <div className="flex items-center gap-8 mt-6">
          {[
            { label: "Total XP",    value: String(xp || 1375), suffix: " XP", c: "#D97706" },
            { label: "Readiness",   value: "66",  suffix: "%",   c: "#16A34A" },
            { label: "Trust Score", value: "742", suffix: "",    c: "#4875EF" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", fontWeight: 700, color: s.c, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {s.value}<span style={{ fontSize: "16px" }}>{s.suffix}</span>
              </p>
              <p className="text-xs mt-1" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Today's Focus — calm, prominent ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1740" }}>
        <div className="px-7 py-6 flex items-center justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>Today's Focus</p>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Add your first product
            </h3>
            <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Digital Dukan is ready — buyers from 190+ countries are waiting.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <JourneyButton variant="primary" size="sm" onClick={() => onAction?.("add-product")}>
                Add First Product →
              </JourneyButton>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>+200 XP · +11% Readiness</span>
            </div>
          </div>
          <div className="text-6xl opacity-20 flex-shrink-0 hidden md:block">🛍️</div>
        </div>
      </div>

      {/* ── Three essential quick actions ── */}
      <div className="flex items-center gap-3">
        {[
          { icon: "🤝", label: "Find Buyers",    id: "buyers"          },
          { icon: "🧾", label: "Create Invoice", id: "create-invoice"  },
          { icon: "✨", label: "Ask AI",          id: "ai"              },
        ].map((a) => (
          <motion.button key={a.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
            onClick={() => onAction?.(a.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.08)", color: "#6B7294", boxShadow: "0 2px 8px rgba(15,23,64,0.04)" }}>
            <span>{a.icon}</span>{a.label}
          </motion.button>
        ))}
        <div className="flex-1" />
        <motion.button whileTap={{ scale: 0.96 }} onClick={onSpin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "linear-gradient(135deg,#4875EF,#7BA4FF)", color: "#fff" }}>
          🎰 Daily Spin
        </motion.button>
      </div>

      {/* ── Stats — minimal sparkline cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue",   to: 1.8,  dec: 1, pre: "₹", suf: " Cr", delta: "+24% YoY",      c: "#4875EF", spark: [{v:62},{v:75},{v:71},{v:98},{v:122},{v:180}]     },
          { label: "Buyers",    to: 47,   dec: 0, pre: "",  suf: "",    delta: "+8 this month",  c: "#22C55E", spark: [{v:28},{v:31},{v:35},{v:38},{v:42},{v:47}]       },
          { label: "Shipments", to: 183,  dec: 0, pre: "",  suf: "",    delta: "12 in transit",  c: "#F59E0B", spark: [{v:105},{v:118},{v:124},{v:147},{v:162},{v:183}] },
          { label: "Countries", to: 22,   dec: 0, pre: "",  suf: "",    delta: "+3 new",         c: "#7C3AED", spark: [{v:14},{v:15},{v:17},{v:18},{v:20},{v:22}]       },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}>
            <TiltCard>
              <DashCard className="p-5 overflow-hidden">
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>{s.label}</p>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  <AnimatedNumber to={s.to} decimals={s.dec} prefix={s.pre} suffix={s.suf} />
                </p>
                <p className="text-xs font-medium mt-1" style={{ color: s.c }}>↑ {s.delta}</p>
                <div className="mt-3 -mx-1" style={{ height: "40px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={s.spark}>
                      <Line type="monotone" dataKey="v" stroke={s.c} strokeWidth={1.8} dot={false}
                        strokeOpacity={0.65} isAnimationActive animationDuration={1000} animationEasing="ease-out" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </DashCard>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* ── Activity + World Map ── */}
      <div className="grid md:grid-cols-[1.3fr_1fr] gap-5">
        <DashCard className="p-6">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>Recent Activity</p>
          <div>
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-base flex-shrink-0">{a.icon}</span>
                  <span className="text-sm" style={{ color: "#374151" }}>{a.e}</span>
                </div>
                <span className="text-xs ml-4 flex-shrink-0" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>{a.t}</span>
              </div>
            ))}
          </div>
        </DashCard>
        <DashCard className="p-5">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>Global Footprint</p>
          <FlatWorldMap />
        </DashCard>
      </div>
    </div>
  );
}

// ── Products page ─────────────────────────────────────────────────────────────
export function ProductsPage({ addToast, onAddProduct }: { addToast?: (m: string, t: ToastType) => void; onAddProduct?: () => void }) {
  const [search, setSearch] = useState("");
  const SAMPLE = [
    { name: "Premium Basmati Rice 1121", hs: "1006.30", moq: "500 kg", price: "$480/MT", status: "Active",   cat: "Rice & Grains" },
    { name: "Kashmiri Saffron Grade A",  hs: "0910.20", moq: "100 g",  price: "$12.40/g", status: "Active",   cat: "Spices & Herbs" },
    { name: "Darjeeling First Flush Tea",hs: "0902.10", moq: "50 kg",  price: "$6.20/100g",status: "Draft",  cat: "Food Products" },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>Your Products</h2>
          <p className="text-sm mt-0.5" style={{ color: "#9BA3C4" }}>{SAMPLE.length} products · all categories</p>
        </div>
        <JourneyButton variant="primary" size="sm" onClick={onAddProduct}>+ Add Product</JourneyButton>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#9BA3C4" }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, HS codes…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#F4F6FF", border: "1.5px solid rgba(15,23,64,0.08)", color: "#0F1740" }} />
        </div>
        <select className="px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{ background: "#F4F6FF", border: "1.5px solid rgba(15,23,64,0.08)", color: "#6B7294" }}>
          <option>All categories</option>
          <option>Spices & Herbs</option>
          <option>Rice & Grains</option>
        </select>
        <select className="px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{ background: "#F4F6FF", border: "1.5px solid rgba(15,23,64,0.08)", color: "#6B7294" }}>
          <option>All status</option>
          <option>Active</option>
          <option>Draft</option>
        </select>
      </div>

      {/* Product grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {SAMPLE.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())).map((p, i) => (
          <motion.div key={p.name} whileHover={{ y: -3 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}>
            <DashCard>
              <div className="h-36 rounded-t-2xl flex items-center justify-center text-5xl"
                style={{ background: "linear-gradient(135deg,#EBF0FF,#F4F6FF)" }}>
                📦
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="font-bold text-sm leading-tight" style={{ color: "#0F1740" }}>{p.name}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: p.status === "Active" ? "#DCFCE7" : "#F3F4F6", color: p.status === "Active" ? "#16A34A" : "#6B7280" }}>
                    {p.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[{ l: "HS Code", v: p.hs }, { l: "MOQ", v: p.moq }, { l: "Price (FOB)", v: p.price }].map((r) => (
                    <div key={r.l} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#9BA3C4" }}>{r.l}</span>
                      <span className="text-xs font-semibold" style={{ color: "#0F1740", fontFamily: "'DM Mono', monospace" }}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EBF0FF", color: "#4875EF" }}>{p.cat}</span>
                </div>
              </div>
            </DashCard>
          </motion.div>
        ))}

        {/* Add product card */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }}>
          <DashCard className="h-full flex flex-col items-center justify-center py-12 cursor-pointer"
            style={{ border: "2px dashed rgba(72,117,239,0.2)", background: "#FAFBFF", boxShadow: "none" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: "#EBF0FF" }}>+</div>
            <p className="font-semibold text-sm" style={{ color: "#4875EF" }}>Add Product</p>
            <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>+200 XP on completion</p>
          </DashCard>
        </motion.div>
      </div>
    </div>
  );
}

// ── Buyers page ───────────────────────────────────────────────────────────────
export function BuyersPage({ addToast, onSelectBuyer }: { addToast?: (m: string, t: ToastType) => void; onSelectBuyer?: (b: { name: string; country: string; deals: number; trust: number; status: string }) => void }) {
  const BUYERS = [
    { name: "Müller GmbH",     country: "🇩🇪 Germany",     last: "2h ago",     deals: 3, trust: 94, status: "Active"   },
    { name: "Nordic Foods AB", country: "🇸🇪 Sweden",      last: "Yesterday",  deals: 1, trust: 87, status: "New"      },
    { name: "Gulf Traders LLC",country: "🇦🇪 UAE",         last: "3 days ago", deals: 5, trust: 96, status: "Active"   },
    { name: "Sakura Imports",  country: "🇯🇵 Japan",       last: "1 week ago", deals: 2, trust: 91, status: "Inactive" },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>Your Buyers</h2>
          <p className="text-sm mt-0.5" style={{ color: "#9BA3C4" }}>{BUYERS.length} buyers · across 4 countries</p>
        </div>
        <JourneyButton variant="primary" size="sm">+ Add Buyer</JourneyButton>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#9BA3C4" }}>🔍</span>
        <input placeholder="Search buyers by name or country…" className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "#F4F6FF", border: "1.5px solid rgba(15,23,64,0.08)", color: "#0F1740" }} />
      </div>
      <motion.div className="space-y-3" variants={STAGGER_CONTAINER} initial="hidden" animate="show">
        {BUYERS.map((b, i) => (
          <motion.div key={b.name} variants={STAGGER_ITEM} whileHover={{ x: 3 }}>
            <DashCard className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "#4875EF", color: "#fff" }}>{b.name[0]}</div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{b.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{b.country} · Last contact {b.last}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center hidden md:block">
                    <p className="text-xs" style={{ color: "#9BA3C4" }}>Deals</p>
                    <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{b.deals}</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-xs" style={{ color: "#9BA3C4" }}>Trust</p>
                    <p className="font-bold text-sm" style={{ color: "#22C55E" }}>{b.trust}%</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: b.status === "Active" ? "#DCFCE7" : b.status === "New" ? "#EBF0FF" : "#F3F4F6", color: b.status === "Active" ? "#16A34A" : b.status === "New" ? "#4875EF" : "#9CA3AF" }}>
                    {b.status}
                  </span>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => onSelectBuyer?.(b)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#F4F6FF", color: "#6B7294" }}>
                    View →
                  </motion.button>
                </div>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Orders page ───────────────────────────────────────────────────────────────
export function OrdersPage({ addToast, onSelectOrder }: { addToast?: (m: string, t: ToastType) => void; onSelectOrder?: (o: { id: string; buyer: string; product: string; value: string; date: string; status: string }) => void }) {
  const [filter, setFilter] = useState("All");
  const ORDERS = [
    { id: "#ORD-2024-183", buyer: "Müller GmbH",      product: "Basmati Rice 1121",  value: "$22,800", date: "Dec 12, 2024", status: "Completed"  },
    { id: "#ORD-2024-182", buyer: "Gulf Traders LLC",  product: "Kashmiri Saffron",    value: "$4,960",  date: "Dec 10, 2024", status: "Processing" },
    { id: "#ORD-2024-181", buyer: "Nordic Foods AB",   product: "Darjeeling Tea",      value: "$3,100",  date: "Dec 8, 2024",  status: "Pending"    },
    { id: "#ORD-2024-180", buyer: "Sakura Imports",    product: "Basmati Rice 1121",  value: "$18,400", date: "Dec 5, 2024",  status: "Completed"  },
  ];
  const statuses = ["All", "Pending", "Processing", "Completed", "Cancelled"];
  const filtered = filter === "All" ? ORDERS : ORDERS.filter((o) => o.status === filter);
  const statusColor: Record<string, { bg: string; c: string }> = {
    Completed:  { bg: "#DCFCE7", c: "#16A34A" },
    Processing: { bg: "#EBF0FF", c: "#4875EF" },
    Pending:    { bg: "#FEF3C7", c: "#D97706" },
    Cancelled:  { bg: "#FEE2E2", c: "#DC2626" },
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>Orders</h2>
        <p className="text-sm" style={{ color: "#9BA3C4" }}>{ORDERS.length} total orders</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: filter === s ? "#4875EF" : "#F4F6FF", color: filter === s ? "#fff" : "#6B7294" }}>
            {s}
          </button>
        ))}
      </div>
      <motion.div className="space-y-3" variants={STAGGER_CONTAINER} initial="hidden" animate="show" key={filter}>
        {filtered.map((o, i) => (
          <motion.div key={o.id} variants={STAGGER_ITEM}>
            <DashCard className="px-6 py-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#0F1740", fontFamily: "'DM Mono', monospace" }}>{o.id}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{o.buyer} · {o.product}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block">
                    <p className="text-xs" style={{ color: "#9BA3C4" }}>Value</p>
                    <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{o.value}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs" style={{ color: "#9BA3C4" }}>Date</p>
                    <p className="text-xs font-semibold" style={{ color: "#6B7294" }}>{o.date}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: statusColor[o.status]?.bg, color: statusColor[o.status]?.c }}>
                    {o.status}
                  </span>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => onSelectOrder?.(o)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#F4F6FF", color: "#6B7294" }}>View</motion.button>
                </div>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Invoices page ─────────────────────────────────────────────────────────────
export function InvoicesPage({ addToast, onNewInvoice }: { addToast?: (m: string, t: ToastType) => void; onNewInvoice?: () => void }) {
  const [selected, setSelected] = useState(0);
  const INVOICES = [
    { id: "INV-2024-047", buyer: "Müller GmbH",     amount: "$22,800", date: "Dec 12", status: "Paid",    terms: "30% advance + 70% before shipment" },
    { id: "INV-2024-046", buyer: "Gulf Traders LLC", amount: "$4,960",  date: "Dec 10", status: "Pending", terms: "50% advance + 50% on BL" },
    { id: "INV-2024-045", buyer: "Nordic Foods AB",  amount: "$3,100",  date: "Dec 8",  status: "Sent",    terms: "100% advance" },
  ];
  const inv = INVOICES[selected];
  const sc: Record<string, { bg: string; c: string }> = {
    Paid:    { bg: "#DCFCE7", c: "#16A34A" },
    Pending: { bg: "#FEF3C7", c: "#D97706" },
    Sent:    { bg: "#EBF0FF", c: "#4875EF" },
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>Invoice Center</h2>
        <JourneyButton variant="primary" size="sm" onClick={onNewInvoice}>+ New Invoice</JourneyButton>
      </div>
      <div className="grid md:grid-cols-[300px_1fr] gap-5">
        {/* List */}
        <div className="space-y-3">
          {INVOICES.map((inv, i) => (
            <DashCard key={inv.id} className={`px-4 py-4 cursor-pointer transition-all ${selected === i ? "ring-2 ring-blue-400" : ""}`}
              onClick={() => setSelected(i)}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold" style={{ color: "#0F1740", fontFamily: "'DM Mono', monospace" }}>{inv.id}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: sc[inv.status].bg, color: sc[inv.status].c }}>{inv.status}</span>
              </div>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>{inv.buyer}</p>
              <p className="font-bold text-sm mt-1" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740" }}>{inv.amount}</p>
              <p className="text-xs" style={{ color: "#C8CEDF" }}>{inv.date}</p>
            </DashCard>
          ))}
        </div>

        {/* Preview */}
        <DashCard className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "#4875EF", color: "#fff" }}>E</div>
                <span className="font-bold" style={{ color: "#0F1740" }}>EXIMARG</span>
              </div>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>Ravi Exports Pvt. Ltd.</p>
              <p className="text-xs" style={{ color: "#9BA3C4" }}>Mumbai, Maharashtra, India</p>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", fontWeight: 700, color: "#0F1740" }}>INVOICE</p>
              <p className="text-xs font-bold mt-1" style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>{inv.id}</p>
              <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>Date: {inv.date}, 2024</p>
            </div>
          </div>
          <div className="border-t pt-6 mb-6" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Bill To</p>
            <p className="font-bold" style={{ color: "#0F1740" }}>{inv.buyer}</p>
          </div>
          <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid rgba(15,23,64,0.07)" }}>
            <div className="grid grid-cols-4 px-4 py-2.5" style={{ background: "#F4F6FF" }}>
              {["Description", "Qty", "Unit Price", "Total"].map((h) => (
                <p key={h} className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>{h}</p>
              ))}
            </div>
            <div className="grid grid-cols-4 px-4 py-3 border-t" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
              <p className="text-sm" style={{ color: "#0F1740" }}>Basmati Rice 1121</p>
              <p className="text-sm" style={{ color: "#6B7294" }}>20 MT</p>
              <p className="text-sm" style={{ color: "#6B7294" }}>$480/MT</p>
              <p className="text-sm font-bold" style={{ color: "#0F1740" }}>{inv.amount}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs" style={{ color: "#9BA3C4" }}>Payment Terms: {inv.terms}</p>
            <div className="text-right">
              <p className="text-xs" style={{ color: "#9BA3C4" }}>Total Amount</p>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 700, color: "#0F1740" }}>{inv.amount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <JourneyButton variant="primary" size="sm">Download PDF</JourneyButton>
            <JourneyButton variant="ghost-dark" size="sm">Send to Buyer</JourneyButton>
          </div>
        </DashCard>
      </div>
    </div>
  );
}

// ── Documents page ────────────────────────────────────────────────────────────
export function DocumentsPage({ addToast, onUpload }: { addToast?: (m: string, t: ToastType) => void; onUpload?: () => void }) {
  const FOLDERS = [
    { icon: "📋", name: "Identity Documents", count: 3, color: "#4875EF" },
    { icon: "🏢", name: "Business Registration", count: 5, color: "#7C3AED" },
    { icon: "✅", name: "Compliance & Licences", count: 4, color: "#059669" },
    { icon: "🧾", name: "Invoices & POs", count: 12, color: "#D97706" },
    { icon: "🚢", name: "Shipping Documents", count: 8, color: "#DC2626" },
    { icon: "📊", name: "Financial Records", count: 6, color: "#0F1740" },
  ];
  const RECENT = [
    { name: "IEC_Certificate.pdf",     size: "245 KB", date: "Dec 12", icon: "📄", verified: true  },
    { name: "GST_Registration.pdf",    size: "180 KB", date: "Dec 10", icon: "📄", verified: true  },
    { name: "Packing_List_183.pdf",    size: "92 KB",  date: "Dec 8",  icon: "📄", verified: false },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>Document Vault</h2>
        <JourneyButton variant="primary" size="sm" onClick={onUpload}>⬆ Upload</JourneyButton>
      </div>

      {/* Upload zone */}
      <DashCard className="flex items-center justify-center py-8 border-2 border-dashed cursor-pointer transition-all hover:border-blue-400"
        style={{ borderColor: "rgba(72,117,239,0.2)", background: "#FAFBFF", boxShadow: "none" }}
        onClick={onUpload}>
        <div className="text-center">
          <div className="text-3xl mb-2">⬆</div>
          <p className="font-semibold text-sm" style={{ color: "#4875EF" }}>Drag & drop documents here</p>
          <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>PDF, JPG, PNG — up to 10MB per file</p>
        </div>
      </DashCard>

      {/* Folders */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Categories</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FOLDERS.map((f) => (
            <motion.div key={f.name} whileHover={{ y: -2 }}>
              <DashCard className="p-5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${f.color}18` }}>{f.icon}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#0F1740" }}>{f.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{f.count} files</p>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent uploads */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Recent Uploads</p>
        <DashCard>
          {RECENT.map((f, i) => (
            <div key={f.name} className="flex items-center justify-between px-5 py-3.5 border-b last:border-0" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0F1740" }}>{f.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{f.size} · {f.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {f.verified && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>✓ Verified</span>}
                <motion.button whileHover={{ scale: 1.05 }} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#F4F6FF", color: "#6B7294" }}>View</motion.button>
              </div>
            </div>
          ))}
        </DashCard>
      </div>
    </div>
  );
}

// ── AI Trade Consultant page ───────────────────────────────────────────────────
export function AIPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Good morning! I'm your EXIMARG AI Trade Consultant. I can help with HS codes, export compliance, buyer responses, invoice queries, and trade regulations. What would you like to know?" },
  ]);
  const send = () => {
    if (!input.trim()) return;
    setMessages((p) => [...p, { role: "user", text: input }, { role: "ai", text: "Great question! Based on your export profile, I recommend checking the DGFT guidelines for this. Let me pull the latest compliance requirements for your product category..." }]);
    setInput("");
  };
  const PROMPTS = ["What HS code for Basmati Rice?", "How to reply to a Hamburg buyer?", "GST refund for exporters", "IEC renewal process", "Best Incoterms for UAE?"];
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>AI Trade Consultant</h2>
          <p className="text-sm mt-0.5" style={{ color: "#9BA3C4" }}>Powered by EXIMARG Intelligence · Always current</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: "#DCFCE7", color: "#16A34A" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#16A34A" }} /> Online
        </span>
      </div>

      {/* Chat area */}
      <DashCard className="flex-1 flex flex-col overflow-hidden mb-4">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "ai" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0" style={{ background: "#4875EF", color: "#fff" }}>✨</div>
              )}
              <div className="max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{ background: m.role === "user" ? "#4875EF" : "#F4F6FF", color: m.role === "user" ? "#fff" : "#374151" }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested prompts */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => setInput(p)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:bg-blue-50"
              style={{ background: "#EBF0FF", color: "#4875EF", border: "1px solid rgba(72,117,239,0.2)" }}>
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(15,23,64,0.07)" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything about exporting, compliance, buyers…"
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none mt-3"
            style={{ background: "#F4F6FF", border: "1.5px solid rgba(15,23,64,0.08)", color: "#0F1740" }} />
          <motion.button whileTap={{ scale: 0.95 }} onClick={send}
            className="mt-3 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#4875EF", color: "#fff" }}>Send</motion.button>
        </div>
      </DashCard>
    </div>
  );
}

// ── Settings page ─────────────────────────────────────────────────────────────
export function SettingsPage({ addToast }: { addToast?: (m: string, t: ToastType) => void }) {
  const sections = [
    { title: "General", icon: "⚙️", items: [{ label: "Company Name", value: "Ravi Exports Pvt. Ltd." }, { label: "Time Zone", value: "Asia/Kolkata (IST)" }, { label: "Language", value: "English" }] },
    { title: "Notifications", icon: "🔔", items: [{ label: "Buyer Inquiries", value: "toggle" }, { label: "Shipment Updates", value: "toggle" }, { label: "Invoice Reminders", value: "toggle" }] },
    { title: "Security", icon: "🔒", items: [{ label: "Two-Factor Authentication", value: "toggle" }, { label: "Login Alerts", value: "toggle" }] },
    { title: "Billing", icon: "💳", items: [{ label: "Current Plan", value: "Growth · ₹2,999/mo" }, { label: "Next Billing", value: "Jan 1, 2025" }] },
  ];
  return (
    <div className="space-y-5 max-w-2xl">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>Settings</h2>
      {sections.map((s) => (
        <DashCard key={s.title} className="overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
            <span className="text-base">{s.icon}</span>
            <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{s.title}</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
            {s.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-6 py-4">
                <p className="text-sm" style={{ color: "#374151" }}>{item.label}</p>
                {item.value === "toggle" ? (
                  <motion.div whileTap={{ scale: 0.95 }}
                    onClick={() => addToast?.(`${item.label} updated`, "success")}
                    className="w-10 h-5 rounded-full cursor-pointer relative" style={{ background: "#4875EF" }}>
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
                  </motion.div>
                ) : (
                  <p className="text-sm font-medium" style={{ color: "#6B7294" }}>{item.value}</p>
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
            <button onClick={() => addToast?.(`${s.title} settings saved`, "success")}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors hover:bg-blue-50"
              style={{ color: "#4875EF" }}>
              Save {s.title} →
            </button>
          </div>
        </DashCard>
      ))}
      <DashCard className="overflow-hidden" style={{ border: "1px solid rgba(220,38,38,0.15)" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "rgba(220,38,38,0.1)" }}>
          <span>⚠️</span>
          <p className="font-bold text-sm" style={{ color: "#DC2626" }}>Danger Zone</p>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "#374151" }}>Delete Account</p>
            <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>Permanently delete your EXIMARG account and all data.</p>
          </div>
          <button className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: "#FEE2E2", color: "#DC2626" }}>Delete</button>
        </div>
      </DashCard>
    </div>
  );
}

// ── My Profile page ───────────────────────────────────────────────────────────

export function MyProfilePage({ addToast }: { addToast?: (m: string, t: ToastType) => void }) {
  const [name, setName] = useState("Rajesh Kumar");
  const [email, setEmail] = useState("rajesh@raviexports.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [role, setRole] = useState("Founder & Director");
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>My Profile</h2>

      {/* Hero card */}
      <DashCard className="p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: "#4875EF", color: "#fff" }}>R</div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: "#0F1740", color: "#fff" }}>✎</motion.button>
          </div>
          <div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>{name}</p>
            <p className="text-sm mt-0.5" style={{ color: "#6B7294" }}>{role} · Ravi Exports Pvt. Ltd.</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>✓ Verified</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>🏅 Level 6 Bronze</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EBF0FF", color: "#4875EF" }}>Growth Plan</span>
            </div>
          </div>
        </div>
      </DashCard>

      {/* Personal Information */}
      <DashCard className="overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <p className="font-bold text-sm" style={{ color: "#0F1740" }}>Personal Information</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Role / Title" value={role} onChange={setRole} />
          </div>
          <Field label="Email Address" type="email" value={email} onChange={setEmail} />
          <Field label="Mobile Number" type="tel" value={phone} onChange={setPhone} />
          <div className="pt-2">
            <JourneyButton variant="primary" size="sm"
              onClick={() => addToast?.("Profile updated successfully.", "success")}>
              Save Changes →
            </JourneyButton>
          </div>
        </div>
      </DashCard>

      {/* Security */}
      <DashCard className="overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <p className="font-bold text-sm" style={{ color: "#0F1740" }}>Security</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "#374151" }}>Password</p>
              <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>Last changed 30 days ago</p>
            </div>
            <button onClick={() => setShowPwForm((p) => !p)}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors hover:bg-gray-50"
              style={{ color: "#4875EF" }}>
              {showPwForm ? "Cancel" : "Change Password"}
            </button>
          </div>
          {showPwForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25 }} className="space-y-3 pt-2">
              <Field label="Current Password" type="password" placeholder="••••••••" value={currentPw} onChange={setCurrentPw} />
              <Field label="New Password" type="password" placeholder="8+ characters" value={newPw} onChange={setNewPw} />
              <JourneyButton variant="primary" size="sm"
                onClick={() => { setShowPwForm(false); setCurrentPw(""); setNewPw(""); addToast?.("Password updated.", "success"); }}>
                Update Password
              </JourneyButton>
            </motion.div>
          )}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#374151" }}>Two-Factor Authentication</p>
              <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>Add an extra layer of security</p>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={() => addToast?.("2FA enabled.", "success")}
              className="w-10 h-5 rounded-full cursor-pointer relative" style={{ background: "#4875EF" }}>
              <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
            </motion.div>
          </div>
        </div>
      </DashCard>

      {/* Connected Accounts */}
      <DashCard className="overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <p className="font-bold text-sm" style={{ color: "#0F1740" }}>Connected Accounts</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
          {[
            { name: "Google", icon: "G", connected: true,  desc: "rajesh@raviexports.com" },
            { name: "WhatsApp",icon: "💬", connected: true, desc: "+91 98765 43210" },
            { name: "Slack",   icon: "S", connected: false, desc: "Connect for order notifications" },
          ].map((acc) => (
            <div key={acc.name} className="flex items-center justify-between px-6 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: acc.connected ? "#EBF0FF" : "#F4F6FF", color: acc.connected ? "#4875EF" : "#9BA3C4" }}>
                  {acc.icon}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#374151" }}>{acc.name}</p>
                  <p className="text-xs" style={{ color: "#9BA3C4" }}>{acc.desc}</p>
                </div>
              </div>
              <button onClick={() => addToast?.(acc.connected ? `${acc.name} disconnected` : `${acc.name} connected`, "success")}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: acc.connected ? "#FEE2E2" : "#EBF0FF", color: acc.connected ? "#DC2626" : "#4875EF" }}>
                {acc.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

// ── Support Drawer ────────────────────────────────────────────────────────────

export function SupportDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [ticketMsg, setTicketMsg] = useState("");
  const [sent, setSent] = useState(false);
  const ARTICLES = [
    { icon: "📋", title: "How to add your first product", time: "2 min read" },
    { icon: "🧾", title: "Creating and sending invoices", time: "3 min read" },
    { icon: "🛃", title: "Understanding export compliance", time: "5 min read" },
    { icon: "🌍", title: "Finding international buyers", time: "4 min read" },
    { icon: "🔑", title: "Setting up API access", time: "2 min read" },
  ];
  return (
    <Drawer open={open} onClose={onClose} title="Help & Support">
      <div className="space-y-5">
        {/* Search articles */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#9BA3C4" }}>🔍</span>
          <input placeholder="Search help articles…" className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "#F4F6FF", border: "1.5px solid rgba(15,23,64,0.08)", color: "#0F1740" }} />
        </div>

        {/* Featured articles */}
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Help Articles</p>
          <div className="space-y-2">
            {ARTICLES.map((a) => (
              <motion.button key={a.title} whileHover={{ x: 3 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-gray-50"
                style={{ border: "1px solid rgba(15,23,64,0.06)" }}>
                <span className="text-xl flex-shrink-0">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "#0F1740" }}>{a.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{a.time}</p>
                </div>
                <span className="text-sm" style={{ color: "#C8CEDF" }}>›</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl text-center"
            style={{ background: "#EBF0FF", border: "1.5px solid rgba(72,117,239,0.18)" }}>
            <span className="text-2xl">💬</span>
            <p className="text-xs font-semibold" style={{ color: "#4875EF" }}>Chat Support</p>
            <p className="text-xs" style={{ color: "#9BA3C4" }}>Usually replies in 5 min</p>
          </motion.button>
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl text-center"
            style={{ background: "#F8F9FF", border: "1px solid rgba(15,23,64,0.07)" }}>
            <span className="text-2xl">📞</span>
            <p className="text-xs font-semibold" style={{ color: "#0F1740" }}>Book a Call</p>
            <p className="text-xs" style={{ color: "#9BA3C4" }}>Schedule 30-min demo</p>
          </motion.button>
        </div>

        {/* Raise ticket */}
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Raise a Ticket</p>
          {sent ? (
            <div className="text-center py-6 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid rgba(22,163,74,0.15)" }}>
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-sm" style={{ color: "#16A34A" }}>Ticket submitted!</p>
              <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>We'll respond within 4 business hours.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <FieldSelect label="Category" options={["Technical Issue","Billing Query","Feature Request","Compliance Help","Other"]} value="" onChange={() => {}} />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-widest uppercase" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Message</label>
                <textarea value={ticketMsg} onChange={(e) => setTicketMsg(e.target.value)}
                  placeholder="Describe your issue in detail…" rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "#F8F9FF", border: "1.5px solid rgba(15,23,64,0.1)", color: "#0F1740" }} />
              </div>
              <JourneyButton variant="primary" size="sm" className="w-full justify-center"
                onClick={() => ticketMsg.trim() && setSent(true)}>
                Submit Ticket →
              </JourneyButton>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────

export function ProfileDropdown({ xp, onClose, onNavigate, onBack, onSupport }: {
  xp: number;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onBack: () => void;
  onSupport: () => void;
}) {
  const items = [
    { icon: "👤", label: "My Profile",      action: () => onNavigate("profile")   },
    { icon: "🏢", label: "Company Profile", action: () => onNavigate("settings")  },
    { icon: "⭐", label: "Subscription",    action: () => onNavigate("settings")  },
    { icon: "⚙️", label: "Settings",         action: () => onNavigate("settings")  },
    { icon: "💬", label: "Support",          action: onSupport                      },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2, ease: EASE }}
      className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
      style={{ background: "#ffffff", boxShadow: "0 16px 48px rgba(15,23,64,0.16)", border: "1px solid rgba(15,23,64,0.08)" }}>
      {/* Profile card */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)", background: "#F8F9FF" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: "#4875EF", color: "#fff" }}>R</div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#0F1740" }}>Rajesh Kumar</p>
            <p className="text-xs" style={{ color: "#9BA3C4" }}>Ravi Exports Pvt. Ltd.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center rounded-lg py-2" style={{ background: "#EBF0FF" }}>
            <p className="text-xs font-bold" style={{ color: "#4875EF" }}>Growth</p>
            <p className="text-xs" style={{ color: "#9BA3C4" }}>Plan</p>
          </div>
          <div className="text-center rounded-lg py-2" style={{ background: "#FEF3C7" }}>
            <p className="text-xs font-bold" style={{ color: "#D97706" }}>{xp || 1375}</p>
            <p className="text-xs" style={{ color: "#9BA3C4" }}>XP</p>
          </div>
          <div className="text-center rounded-lg py-2" style={{ background: "#DCFCE7" }}>
            <p className="text-xs font-bold" style={{ color: "#16A34A" }}>66%</p>
            <p className="text-xs" style={{ color: "#9BA3C4" }}>Ready</p>
          </div>
        </div>
      </div>
      {/* Menu items */}
      <div className="py-2">
        {items.map((item) => (
          <motion.button key={item.label} whileHover={{ x: 3 }}
            onClick={() => { item.action(); onClose(); }}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 text-left"
            style={{ color: "#374151" }}>
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className="text-xs" style={{ color: "#C8CEDF" }}>›</span>
          </motion.button>
        ))}
      </div>
      <div className="border-t py-2" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
        <motion.button whileHover={{ x: 3 }}
          onClick={onBack}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 text-left"
          style={{ color: "#DC2626" }}>
          <span>↩</span>
          <span className="flex-1">Back to Dashboard</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Notifications panel ───────────────────────────────────────────────────────
export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const NOTIFS = [
    { icon: "📩", title: "New buyer inquiry",         desc: "Müller GmbH from Hamburg is interested in Basmati Rice.", time: "2h ago",     unread: true  },
    { icon: "✅", title: "Invoice approved",           desc: "Invoice #047 has been approved and payment is processing.", time: "5h ago",     unread: true  },
    { icon: "🚢", title: "Shipment departed",          desc: "Shipment #183 has departed Mumbai Port. ETA: Dec 30.",     time: "Yesterday",  unread: false },
    { icon: "🔄", title: "RCMC renewal reminder",      desc: "Your RCMC certificate expires in 30 days.",                time: "2 days ago", unread: false },
    { icon: "🏅", title: "Level 6 complete!",          desc: "You earned 200 XP. Your Digital Dukan is live.",           time: "3 days ago", unread: false },
  ];
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25, ease: EASE }}
      className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
      style={{ background: "#ffffff", boxShadow: "0 16px 48px rgba(15,23,64,0.16)", border: "1px solid rgba(15,23,64,0.08)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
        <p className="font-bold text-sm" style={{ color: "#0F1740" }}>Notifications</p>
        <button onClick={onClose} className="text-xs" style={{ color: "#9BA3C4" }}>Mark all read</button>
      </div>
      <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: "rgba(15,23,64,0.05)" }}>
        {NOTIFS.map((n, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
            style={{ background: n.unread ? "#FAFBFF" : "transparent" }}>
            <span className="text-xl flex-shrink-0">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold" style={{ color: "#0F1740" }}>{n.title}</p>
                {n.unread && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#4875EF" }} />}
              </div>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6B7294" }}>{n.desc}</p>
              <p className="text-xs mt-1" style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
