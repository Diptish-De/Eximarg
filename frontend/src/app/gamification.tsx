import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EASE, STAGGER_CONTAINER, STAGGER_ITEM, JourneyButton, DashCard,
  Modal, ToastType,
} from "./shared";

// ── Gamification data ────────────────────────────────────────────────────────

export const RANK_TIERS = [
  { min: 1, max: 2, icon: "🌱", title: "Local Seller",       color: "#22C55E" },
  { min: 3, max: 4, icon: "🧭", title: "Emerging Exporter",  color: "#4875EF" },
  { min: 5, max: 6, icon: "⚓", title: "Trade Navigator",    color: "#7C3AED" },
  { min: 7, max: 8, icon: "🌐", title: "Global Merchant",    color: "#D97706" },
  { min: 9, max: 99, icon: "👑", title: "Export Master",      color: "#DC2626" },
];
export const getRank = (level: number) =>
  RANK_TIERS.find((t) => level >= t.min && level <= t.max) ?? RANK_TIERS[0];

export const GAME_DATA = {
  streak: 12,
  trustScore: 742,
  trustDelta: +8,
  level: 6,
  passportCountries: [
    { name: "Germany",  flag: "🇩🇪", product: "Basmati Rice",    date: "Dec 12", value: "$22,800", rotate: -3 },
    { name: "UAE",      flag: "🇦🇪", product: "Kashmiri Saffron",date: "Nov 5",  value: "$4,960",  rotate: 2  },
    { name: "Sweden",   flag: "🇸🇪", product: "Darjeeling Tea",  date: "Oct 20", value: "$3,100",  rotate: -1 },
    { name: "Japan",    flag: "🇯🇵", product: "Basmati Rice",    date: "Sep 14", value: "$18,400", rotate: 3  },
  ],
  achievements: [
    { id: "first_step",    icon: "🌱", title: "First Step",         desc: "Complete Level 1",                 unlocked: true,  date: "Nov 1",  color: "#22C55E" },
    { id: "maiden_voyage", icon: "✈️", title: "Maiden Voyage",      desc: "First shipment departed",          unlocked: true,  date: "Nov 15", color: "#4875EF" },
    { id: "speed_trader",  icon: "⚡", title: "Speed Trader",        desc: "Reply to buyer in under 1 hour",  unlocked: true,  date: "Nov 20", color: "#F59E0B" },
    { id: "streak_7",      icon: "🔥", title: "7-Day Streak",        desc: "Active 7 consecutive days",       unlocked: true,  date: "Dec 1",  color: "#DC2626" },
    { id: "five_country",  icon: "🌍", title: "Five Country Club",   desc: "Export to 5 countries",           unlocked: false, progress: 4, total: 5 },
    { id: "doc_veteran",   icon: "📄", title: "Document Veteran",    desc: "Upload 25 documents",             unlocked: false, progress: 18, total: 25 },
    { id: "trusted_partner",icon: "🤝",title: "Trusted Partner",     desc: "Buyer places 3+ repeat orders",  unlocked: false, progress: 2, total: 3 },
    { id: "crore_club",    icon: "💰", title: "Crore Club",          desc: "₹1 Cr+ in total revenue",        unlocked: false, progress: 180, total: 100 },
    { id: "verified_master",icon: "🏅",title: "Verified Master",     desc: "All compliance docs verified",    unlocked: false, progress: 7, total: 10 },
  ],
  quests: {
    daily: [
      { id: "reply", icon: "💬", title: "Reply to a buyer inquiry", xp: 50,  progress: 0, total: 1, done: false },
      { id: "doc",   icon: "📄", title: "Upload one document",      xp: 30,  progress: 1, total: 1, done: true  },
      { id: "price", icon: "💰", title: "Update a product price",   xp: 20,  progress: 0, total: 1, done: false },
    ],
    weekly: [
      { id: "products", icon: "📦", title: "Add 3 new products",        xp: 300, progress: 1, total: 3, done: false },
      { id: "buyers",   icon: "🤝", title: "Reach out to 5 new buyers", xp: 200, progress: 2, total: 5, done: false },
      { id: "shipment", icon: "🚢", title: "Complete a shipment",        xp: 500, progress: 0, total: 1, done: false },
    ],
    oneTime: [
      { id: "uae",   icon: "🇦🇪", title: "First export to UAE",       xp: 200, badge: "Gulf Pioneer",  done: true  },
      { id: "bigdeal",icon: "💰", title: "Invoice over $10,000",      xp: 300, badge: "Big Deal",       done: false },
    ],
  },
  battlePass: {
    season: "The Spice Route", theme: "🌶️", tier: 7, maxTier: 15,
    xpCurrent: 840, xpNeeded: 1200, isPremium: true,
    rewards: [
      { tier: 1,  free: "🎫 Catalogue Boost", premium: "⚡ 2× XP Day" },
      { tier: 3,  free: "📊 Analytics Unlock", premium: "🔍 Buyer Spotlight" },
      { tier: 5,  free: "🌐 3 Buyer Intros",   premium: "🚀 Featured 72h" },
      { tier: 7,  free: "📈 Market Report",    premium: "💎 Express AI 7d" },
      { tier: 10, free: "🏆 Season Badge",     premium: "👑 Gold Exporter Title" },
      { tier: 15, free: "🎖 Spice Route Badge",premium: "🌟 Diamond Rank" },
    ],
  },
  powerUps: [
    { icon: "🚀", name: "Catalogue Boost",  desc: "Top placement for 48h", expires: "23h 14m", active: true, color: "#4875EF" },
    { icon: "⚡", name: "Express AI",        desc: "5× AI queries today",   charges: 5,  active: false, color: "#F59E0B" },
    { icon: "🔍", name: "Buyer Spotlight",   desc: "AI picks top 3 buyers", charges: 3,  active: false, color: "#7C3AED" },
    { icon: "💰", name: "XP Multiplier",     desc: "2× XP for 24h",         active: false, color: "#22C55E" },
  ],
  leaderboard: [
    { rank: 1,  name: "Exporter A",   cat: "Rice & Grains",  ships: 342, rev: "₹4.2 Cr", isYou: false },
    { rank: 2,  name: "Exporter B",   cat: "Spices & Herbs", ships: 298, rev: "₹3.8 Cr", isYou: false },
    { rank: 3,  name: "Exporter C",   cat: "Textiles",       ships: 271, rev: "₹3.1 Cr", isYou: false },
    { rank: 4,  name: "Ravi Exports", cat: "Rice & Grains",  ships: 183, rev: "₹1.8 Cr", isYou: true  },
    { rank: 5,  name: "Exporter E",   cat: "Machinery",      ships: 156, rev: "₹1.5 Cr", isYou: false },
    { rank: 6,  name: "Exporter F",   cat: "Food Products",  ships: 134, rev: "₹1.2 Cr", isYou: false },
  ],
  storySteps: [
    { icon: "📩", title: "Buyer Found",         text: "A buyer in Hamburg just discovered your Basmati Rice. This is the moment you've been preparing for.", action: "Read their message" },
    { icon: "✍️", title: "Write Your Reply",    text: "First impressions matter. Keep it professional and confident. Our AI has drafted a reply for you.", action: "Send reply with AI" },
    { icon: "🧾", title: "Proforma Invoice",    text: "The buyer asked for a formal quote. Generate a proforma invoice in seconds.", action: "Generate invoice" },
    { icon: "🚢", title: "Book Freight",         text: "Your order is confirmed. Time to move. Book cargo space from Mumbai to Hamburg.", action: "Book with freight partner" },
    { icon: "🌊", title: "Container at Sea",    text: "Your container is loaded. Sailing from Mumbai Port. ETA Hamburg: 18 days. Your first export is real.", action: "Track live" },
  ],
};

// ── Export Passport Page ──────────────────────────────────────────────────────

// Per-country stamp ink colors
const STAMP_PALETTE: Record<string, { ink: string; bg: string }> = {
  Germany:  { ink: "#1a3a8f", bg: "#EEF2FF" },
  UAE:      { ink: "#065f46", bg: "#ECFDF5" },
  Sweden:   { ink: "#7c2d12", bg: "#FFF7ED" },
  Japan:    { ink: "#831843", bg: "#FDF2F8" },
};

function PassportStamp({ country, index }: { country: typeof GAME_DATA.passportCountries[0]; index: number }) {
  const { ink, bg } = STAMP_PALETTE[country.name] ?? { ink: "#1e3a5f", bg: "#EFF6FF" };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: country.rotate * 3 }}
      animate={{ opacity: 1, scale: 1, rotate: country.rotate }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.12 }}
      whileHover={{ scale: 1.06, rotate: 0, zIndex: 10 }}
      className="relative cursor-pointer select-none"
      style={{ transform: `rotate(${country.rotate}deg)` }}
    >
      {/* Stamp body */}
      <div className="relative flex flex-col items-center justify-center px-5 py-5 rounded-lg"
        style={{
          background: bg,
          border: `3px solid ${ink}`,
          /* Perforated edge via dashed inset box-shadow */
          boxShadow: `0 0 0 5px ${bg}, 0 0 0 7px ${ink}22, 4px 6px 24px ${ink}22`,
          minWidth: "140px",
          minHeight: "160px",
        }}>

        {/* Watermark text across stamp */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-lg">
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "0.35em",
            color: ink,
            opacity: 0.07,
            transform: "rotate(-30deg)",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}>EXIMARG VERIFIED</p>
        </div>

        {/* Top arc label */}
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "8px",
          fontWeight: 800,
          letterSpacing: "0.3em",
          color: ink,
          opacity: 0.5,
          textTransform: "uppercase",
          marginBottom: "8px",
        }}>
          EXPORT · VERIFIED
        </p>

        {/* Country flag — large */}
        <div style={{ fontSize: "42px", lineHeight: 1, marginBottom: "8px" }}>{country.flag}</div>

        {/* Country name */}
        <p style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "15px",
          fontWeight: 700,
          color: ink,
          letterSpacing: "-0.01em",
          textAlign: "center",
          lineHeight: 1.1,
        }}>{country.name.toUpperCase()}</p>

        {/* Divider line */}
        <div style={{ width: "100%", height: "1px", background: ink, opacity: 0.2, margin: "8px 0" }} />

        {/* Date */}
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: ink, opacity: 0.55, letterSpacing: "0.1em" }}>
          {country.date.toUpperCase()}
        </p>

        {/* Value */}
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: "13px", fontWeight: 700, color: ink, marginTop: "3px" }}>
          {country.value}
        </p>

        {/* Product */}
        <p style={{ fontSize: "8px", color: ink, opacity: 0.4, marginTop: "2px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
          {country.product.toUpperCase()}
        </p>

        {/* Ink smudge effect — subtle radial overlay */}
        <div className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 30% 20%, ${ink}08, transparent 70%)` }} />
      </div>

      {/* Ink bleed shadow (makes it look printed) */}
      <div className="absolute inset-0 rounded-lg pointer-events-none"
        style={{ boxShadow: `2px 3px 0 ${ink}18`, zIndex: -1 }} />
    </motion.div>
  );
}

export function ExportPassportPage() {
  const countries = GAME_DATA.passportCountries;
  const emptySlots = Math.max(0, 6 - countries.length);

  return (
    <div className="max-w-3xl space-y-7">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
            Export Passport
          </h2>
          <p className="text-sm mt-1" style={{ color: "#9BA3C4" }}>
            {countries.length} countries · {10 - countries.length} stamps until World Traveller
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#EBF0FF", color: "#4875EF" }}>
          {countries.length} / 10
        </span>
      </div>

      {/* Passport booklet */}
      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(15,23,64,0.15)" }}>

        {/* Cover — dark teal like a real Indian passport */}
        <div className="relative px-8 py-7 flex items-center justify-between overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0A2D1F 0%, #0F4C35 50%, #0A2D1F 100%)" }}>
          {/* Subtle embossed pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)" }} />
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-1"
              style={{ color: "rgba(255,220,100,0.6)", fontFamily: "'DM Mono', monospace" }}>Export Operating System</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 700, color: "#F5E6A0", letterSpacing: "0.02em" }}>
              EXPORT PASSPORT
            </p>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,220,100,0.4)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
              EXIMARG · REPUBLIC OF INDIA
            </p>
          </div>
          <div className="relative z-10 text-right">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 ml-auto"
              style={{ border: "2px solid rgba(245,230,160,0.35)", background: "rgba(245,230,160,0.08)" }}>
              <span style={{ fontSize: "28px" }}>🌐</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(245,230,160,0.4)", fontFamily: "'DM Mono', monospace" }}>
              Rajesh Kumar<br />Ravi Exports Pvt. Ltd.
            </p>
          </div>
        </div>

        {/* Stamps page — cream paper */}
        <div className="px-8 py-8"
          style={{ background: "linear-gradient(180deg, #FDFAF4 0%, #FAF7EE 100%)", borderTop: "3px solid rgba(15,23,64,0.06)" }}>
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-6"
            style={{ color: "#C8CEDF", fontFamily: "'DM Mono', monospace" }}>
            Stamps of Record
          </p>

          {/* Stamps grid — let them breathe */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {countries.map((c, i) => (
              <PassportStamp key={c.name} country={c} index={i} />
            ))}
            {Array(emptySlots).fill(null).map((_, i) => (
              <div key={`empty-${i}`}
                className="flex flex-col items-center justify-center rounded-lg"
                style={{
                  minHeight: "160px",
                  border: "2px dashed rgba(15,23,64,0.1)",
                  background: "rgba(15,23,64,0.02)",
                }}>
                <span style={{ fontSize: "24px", opacity: 0.18 }}>🌍</span>
                <p className="text-xs mt-2" style={{ color: "#D4D8E2", fontFamily: "'DM Mono', monospace" }}>Pending</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* World Traveller progress */}
      <DashCard className="p-5">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "#FEF3C7" }}>🏆</div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: "#0F1740" }}>World Traveller</p>
            <p className="text-xs mt-0.5 mb-2" style={{ color: "#9BA3C4" }}>
              Export to 10 countries to unlock this exclusive badge. {10 - countries.length} more to go.
            </p>
            <div className="w-full h-1.5 rounded-full" style={{ background: "#EBF0FF" }}>
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(to right,#4875EF,#7BA4FF)" }}
                initial={{ width: "0%" }} animate={{ width: `${(countries.length / 10) * 100}%` }}
                transition={{ duration: 1, ease: EASE, delay: 0.4 }} />
            </div>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 700, color: "#4875EF" }}>
            {countries.length}<span style={{ fontSize: "12px", opacity: 0.4 }}>/10</span>
          </span>
        </div>
      </DashCard>
    </div>
  );
}

// ── Achievements Page ─────────────────────────────────────────────────────────

export function AchievementsPage({ addToast }: { addToast?: (m: string, t: ToastType) => void }) {
  const earned = GAME_DATA.achievements.filter((a) => a.unlocked).length;
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
          Achievements
        </h2>
        <span className="text-sm font-semibold" style={{ color: "#9BA3C4" }}>{earned}/{GAME_DATA.achievements.length} earned</span>
      </div>

      {/* Earned */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Earned</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAME_DATA.achievements.filter((a) => a.unlocked).map((a, i) => (
            <motion.div key={a.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              onClick={() => addToast?.(`${a.title} — earned ${a.date}`, "success")}
            >
              <DashCard className="p-5 text-center cursor-pointer"
                style={{ border: `2px solid ${a.color ?? "#4875EF"}22`, background: `${a.color ?? "#4875EF"}08` }}>
                <div className="text-4xl mb-2">{a.icon}</div>
                <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{a.title}</p>
                <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>{a.desc}</p>
                <p className="text-xs mt-2 font-semibold" style={{ color: a.color ?? "#4875EF" }}>{a.date}</p>
              </DashCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Locked */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>In Progress</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAME_DATA.achievements.filter((a) => !a.unlocked).map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}>
              <DashCard className="p-5 text-center" style={{ opacity: 0.65 }}>
                <div className="text-4xl mb-2 grayscale">{a.icon}</div>
                <p className="font-bold text-sm" style={{ color: "#6B7294" }}>{a.title}</p>
                <p className="text-xs mt-1" style={{ color: "#C8CEDF" }}>{a.desc}</p>
                {"progress" in a && a.total && (
                  <>
                    <div className="w-full h-1.5 rounded-full mt-3" style={{ background: "#EBF0FF" }}>
                      <div className="h-full rounded-full" style={{ background: "#4875EF", width: `${Math.min(100, (a.progress! / a.total) * 100)}%` }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>{a.progress}/{a.total}</p>
                  </>
                )}
              </DashCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Quests Page ───────────────────────────────────────────────────────────────

export function QuestsPage({ addToast }: { addToast?: (m: string, t: ToastType) => void }) {
  const [tab, setTab] = useState<"daily" | "weekly" | "oneTime">("daily");
  const [claimed, setClaimed] = useState<Set<string>>(new Set(["doc"]));
  const quests = GAME_DATA.quests[tab];

  const claim = (id: string, xp: number) => {
    setClaimed((p) => new Set([...p, id]));
    addToast?.(`Quest complete! +${xp} XP earned.`, "success");
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-end justify-between">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
          Active Quests
        </h2>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
          🔥 {GAME_DATA.streak}-day streak active
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(["daily", "weekly", "oneTime"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: tab === t ? "#4875EF" : "#F4F6FF", color: tab === t ? "#fff" : "#6B7294" }}>
            {t === "daily" ? "Daily" : t === "weekly" ? "Weekly" : "One-Time"}
          </button>
        ))}
      </div>

      {/* Quest list */}
      <motion.div key={tab} variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-3">
        {quests.map((q: any) => {
          const done = claimed.has(q.id) || q.done;
          const pct = q.total ? Math.min(100, ((q.progress || 0) / q.total) * 100) : 0;
          return (
            <motion.div key={q.id} variants={STAGGER_ITEM}>
              <DashCard className={`px-5 py-4 ${done ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl mt-0.5">{q.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: done ? "#9BA3C4" : "#0F1740" }}>{q.title}</p>
                      {q.badge && <p className="text-xs mt-0.5" style={{ color: "#4875EF" }}>Unlocks: {q.badge} badge</p>}
                      {q.total && q.total > 1 && (
                        <>
                          <div className="w-full h-1.5 rounded-full mt-2" style={{ background: "#EBF0FF" }}>
                            <motion.div className="h-full rounded-full" style={{ background: "#4875EF", width: `${pct}%` }}
                              initial={{ width: "0%" }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: EASE }} />
                          </div>
                          <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>{q.progress}/{q.total}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
                      +{q.xp} XP
                    </span>
                    {done ? (
                      <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>✓ Done</span>
                    ) : (pct >= 100 || q.total === 1) ? (
                      <JourneyButton variant="primary" size="sm" onClick={() => claim(q.id, q.xp)}>Claim →</JourneyButton>
                    ) : null}
                  </div>
                </div>
              </DashCard>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Skill Tree Page ───────────────────────────────────────────────────────────

export function SkillTreePage({ addToast }: { addToast?: (m: string, t: ToastType) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const PATHS = [
    { id: "food",     icon: "🌾", title: "Food & Agri",        color: "#22C55E", unlocks: ["APEDA AI templates", "Agri buyer pool", "FSSAI compliance kit", "Commodity price alerts"] },
    { id: "textiles", icon: "🧵", title: "Textiles & Crafts",  color: "#7C3AED", unlocks: ["Textile AI templates", "EU buyer network", "Fabric compliance docs", "Fashion trade insights"] },
    { id: "machinery",icon: "⚙️", title: "Machinery & Chem",  color: "#4875EF", unlocks: ["Industrial AI templates", "B2B machinery buyers", "BIS compliance kit", "Technical spec builder"] },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
          Skill Tree
        </h2>
        <p className="text-sm mt-1" style={{ color: "#9BA3C4" }}>Choose your export specialization. This unlocks AI tools, buyers, and compliance kits specific to your industry.</p>
      </div>

      {/* Core node */}
      <div className="flex justify-center">
        <div className="rounded-2xl px-8 py-4 text-center" style={{ background: "#0F1740", color: "#fff" }}>
          <div className="text-2xl mb-1">🚀</div>
          <p className="font-bold text-sm">Core Exporter</p>
          <p className="text-xs mt-0.5 opacity-50">Level 6</p>
        </div>
      </div>

      {/* Connector lines */}
      <div className="flex justify-center">
        <svg width="600" height="40" viewBox="0 0 600 40">
          <line x1="300" y1="0" x2="100" y2="40" stroke="rgba(15,23,64,0.15)" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="300" y1="0" x2="300" y2="40" stroke="rgba(15,23,64,0.15)" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="300" y1="0" x2="500" y2="40" stroke="rgba(15,23,64,0.15)" strokeWidth="2" strokeDasharray="4 3" />
        </svg>
      </div>

      {/* Specialization paths */}
      <div className="grid grid-cols-3 gap-4">
        {PATHS.map((p) => (
          <motion.div key={p.id} whileHover={{ y: -4 }}
            onClick={() => { setSelected(p.id === selected ? null : p.id); addToast?.(`${p.title} path selected! Unlocking specialized features…`, "success"); }}
            className="rounded-2xl p-5 cursor-pointer transition-all"
            style={{
              background: selected === p.id ? `${p.color}15` : "#ffffff",
              border: `2px solid ${selected === p.id ? p.color : "rgba(15,23,64,0.08)"}`,
              boxShadow: selected === p.id ? `0 8px 24px ${p.color}25` : "0 2px 12px rgba(15,23,64,0.05)",
            }}>
            <div className="text-3xl mb-3 text-center">{p.icon}</div>
            <p className="font-bold text-sm text-center mb-3" style={{ color: "#0F1740" }}>{p.title}</p>
            <div className="space-y-1.5">
              {p.unlocks.map((u) => (
                <div key={u} className="flex items-center gap-2 text-xs" style={{ color: selected === p.id ? "#374151" : "#9BA3C4" }}>
                  <span style={{ color: p.color }}>✓</span>{u}
                </div>
              ))}
            </div>
            {selected === p.id && (
              <div className="mt-4 text-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: p.color, color: "#fff" }}>Active Path</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Battle Pass Page ──────────────────────────────────────────────────────────

export function BattlePassPage() {
  const bp = GAME_DATA.battlePass;
  const pct = Math.round((bp.xpCurrent / bp.xpNeeded) * 100);

  return (
    <div className="space-y-6">
      {/* Season banner */}
      <div className="rounded-2xl px-8 py-7 flex items-center justify-between overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,#0F1740 0%,#1C3B8A 60%,#2D5CA8 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>Current Season</p>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.025em" }}>
            {bp.theme} {bp.season}
          </h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Tier {bp.tier} of {bp.maxTier} · Season ends Dec 31</p>
        </div>
        <div className="relative z-10 text-right">
          <p className="text-4xl mb-1">{bp.theme}</p>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#F59E0B", color: "#fff" }}>⭐ Premium</span>
        </div>
      </div>

      {/* XP to next tier */}
      <DashCard className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Progress to Tier {bp.tier + 1}</p>
          <p className="text-xs font-bold" style={{ color: "#4875EF" }}>{bp.xpCurrent}/{bp.xpNeeded} XP</p>
        </div>
        <div className="w-full h-2.5 rounded-full" style={{ background: "#EBF0FF" }}>
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(to right,#4875EF,#7BA4FF)" }}
            initial={{ width: "0%" }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 }} />
        </div>
      </DashCard>

      {/* Tier rewards */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Tier Rewards</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {bp.rewards.map((r) => {
            const done = r.tier <= bp.tier;
            const active = r.tier === bp.tier;
            return (
              <div key={r.tier} className="rounded-xl overflow-hidden" style={{
                opacity: done ? 1 : 0.5,
                border: active ? "2px solid #4875EF" : "1px solid rgba(15,23,64,0.08)",
                boxShadow: active ? "0 0 0 4px rgba(72,117,239,0.15)" : "none",
              }}>
                <div className="px-3 py-2 text-center" style={{ background: active ? "#EBF0FF" : done ? "#F0FDF4" : "#F8F9FF" }}>
                  <p className="text-xs font-bold" style={{ color: active ? "#4875EF" : done ? "#16A34A" : "#9BA3C4" }}>Tier {r.tier}</p>
                </div>
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-xs text-center" style={{ color: "#6B7294" }}>{r.free}</p>
                  <div className="border-t pt-1.5" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
                    <p className="text-xs font-semibold text-center" style={{ color: "#F59E0B" }}>{r.premium}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard Page ──────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const [cat, setCat] = useState("Rice & Grains");
  const cats = ["Rice & Grains", "Spices & Herbs", "Textiles", "Machinery", "Food Products"];

  return (
    <div className="max-w-2xl space-y-5">
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
        Leaderboard
      </h2>

      {/* Your rank banner */}
      <div className="rounded-2xl px-6 py-4 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg,#EBF0FF,#F0F4FF)", border: "1.5px solid rgba(72,117,239,0.2)" }}>
        <div className="text-3xl">📈</div>
        <div>
          <p className="font-bold text-sm" style={{ color: "#0F1740" }}>You are in the <span style={{ color: "#4875EF" }}>top 12%</span> of Rice & Grain exporters in India</p>
          <p className="text-xs mt-0.5" style={{ color: "#6B7294" }}>Rank #4 of 1,200+ exporters in your category · This month</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: cat === c ? "#4875EF" : "#F4F6FF", color: cat === c ? "#fff" : "#6B7294" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Rankings */}
      <DashCard className="overflow-hidden">
        {GAME_DATA.leaderboard.map((e, i) => (
          <motion.div key={e.rank} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center justify-between px-6 py-4 border-b last:border-0"
            style={{
              borderColor: "rgba(15,23,64,0.05)",
              background: e.isYou ? "rgba(72,117,239,0.06)" : "transparent",
            }}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{
                  background: e.rank === 1 ? "#F59E0B" : e.rank === 2 ? "#9BA3C4" : e.rank === 3 ? "#CD7F32" : "#F4F6FF",
                  color: e.rank <= 3 ? "#fff" : "#6B7294",
                }}>
                {e.rank <= 3 ? ["🥇","🥈","🥉"][e.rank - 1] : `#${e.rank}`}
              </div>
              <div>
                <p className="font-bold text-sm flex items-center gap-2" style={{ color: e.isYou ? "#4875EF" : "#0F1740" }}>
                  {e.name} {e.isYou && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#EBF0FF", color: "#4875EF" }}>You</span>}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{e.cat}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-xs" style={{ color: "#9BA3C4" }}>Shipments</p>
                <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{e.ships}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#9BA3C4" }}>Revenue</p>
                <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{e.rev}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </DashCard>
    </div>
  );
}

// ── Power-Ups Page ────────────────────────────────────────────────────────────

export function PowerUpsPage({ addToast }: { addToast?: (m: string, t: ToastType) => void }) {
  const [inventory, setInventory] = useState(GAME_DATA.powerUps.map((p) => ({ ...p })));

  const activate = (name: string) => {
    setInventory((prev) => prev.map((p) => p.name === name ? { ...p, active: true } : p));
    addToast?.(`${name} activated! Boost is now live.`, "success");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
          Power-Ups
        </h2>
        <span className="text-xs" style={{ color: "#9BA3C4" }}>Earn by completing quests & streaks</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {inventory.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}>
            <DashCard className="p-5" style={{
              border: p.active ? `2px solid ${p.color}` : "1px solid rgba(15,23,64,0.07)",
              boxShadow: p.active ? `0 4px 20px ${p.color}30` : "0 2px 12px rgba(15,23,64,0.05)",
            }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{p.icon}</div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#0F1740" }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9BA3C4" }}>{p.desc}</p>
                    {p.active && p.expires && (
                      <p className="text-xs mt-1 font-semibold" style={{ color: p.color }}>⏱ {p.expires} remaining</p>
                    )}
                    {"charges" in p && !p.active && (
                      <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>{p.charges} charges available</p>
                    )}
                  </div>
                </div>
                {p.active ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${p.color}20`, color: p.color }}>Active</span>
                ) : (
                  <JourneyButton variant="primary" size="sm" onClick={() => activate(p.name)}>Activate</JourneyButton>
                )}
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>

      {/* How to earn */}
      <DashCard className="p-5">
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>How to Earn More</p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { how: "Complete a daily quest", reward: "🚀 Catalogue Boost" },
            { how: "Maintain 7-day streak",  reward: "⚡ Express AI" },
            { how: "Complete a level",       reward: "🔍 Buyer Spotlight" },
          ].map((e) => (
            <div key={e.how} className="rounded-xl p-3 text-center" style={{ background: "#F8F9FF", border: "1px solid rgba(15,23,64,0.07)" }}>
              <p className="text-xs font-semibold" style={{ color: "#0F1740" }}>{e.reward}</p>
              <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>{e.how}</p>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

// ── Story Mode Page ───────────────────────────────────────────────────────────

export function StoryModePage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const current = GAME_DATA.storySteps[step];

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-8xl">🌏</motion.div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.03em" }}>
          Your First Export Is Real.
        </h2>
        <p className="text-lg max-w-lg" style={{ color: "#6B7294" }}>
          A container carrying your products left Mumbai Port bound for Hamburg, Germany. This is just the beginning.
        </p>
        <div className="flex items-center gap-4">
          <JourneyButton variant="primary" size="md" onClick={() => { setStep(0); setDone(false); }}>Replay Story</JourneyButton>
          <JourneyButton variant="ghost-dark" size="md">View Live Tracker</JourneyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: "#4875EF", fontFamily: "'DM Mono', monospace" }}>
          Story Mode — First Export
        </p>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.025em" }}>
          Your Export Journey Begins
        </h2>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2">
        {GAME_DATA.storySteps.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
            style={{ background: i <= step ? "#4875EF" : "rgba(15,23,64,0.1)" }} />
        ))}
      </div>

      {/* Story card */}
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.4, ease: EASE }}>
          <DashCard className="p-8 text-center">
            <div className="text-6xl mb-5">{current.icon}</div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>
              {current.title}
            </h3>
            <p className="text-base mt-4 leading-relaxed max-w-md mx-auto" style={{ color: "#6B7294" }}>
              {current.text}
            </p>
            <div className="mt-8">
              <JourneyButton variant="primary" size="md" className="mx-auto"
                onClick={() => step < GAME_DATA.storySteps.length - 1 ? setStep((s) => s + 1) : setDone(true)}>
                {current.action} →
              </JourneyButton>
            </div>
          </DashCard>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-xs" style={{ color: "#C8CEDF" }}>
        Step {step + 1} of {GAME_DATA.storySteps.length}
      </p>
    </div>
  );
}

// ── Daily Spin Modal ──────────────────────────────────────────────────────────

const SPIN_PRIZES = [
  { label: "+50 XP",            icon: "⚡", color: "#F59E0B" },
  { label: "Catalogue Boost",   icon: "🚀", color: "#4875EF" },
  { label: "+100 XP",           icon: "⚡", color: "#F59E0B" },
  { label: "Express AI",        icon: "✨", color: "#7C3AED" },
  { label: "+30 XP",            icon: "⚡", color: "#F59E0B" },
  { label: "+200 XP",           icon: "💰", color: "#22C55E" },
  { label: "Buyer Spotlight",   icon: "🔍", color: "#DC2626" },
  { label: "+75 XP",            icon: "⚡", color: "#F59E0B" },
];

export function DailySpinModal({ open, onClose, onToast }: { open: boolean; onClose: () => void; onToast: (m: string, t: ToastType) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof SPIN_PRIZES[0] | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const spin = () => {
    if (spinning || hasSpun) return;
    setSpinning(true);
    setResult(null);
    const idx = Math.floor(Math.random() * SPIN_PRIZES.length);
    const spinDeg = 360 * 5 + (360 / SPIN_PRIZES.length) * (SPIN_PRIZES.length - idx) - (360 / SPIN_PRIZES.length / 2);
    setRotation((r) => r + spinDeg + Math.random() * 30);
    setTimeout(() => {
      setSpinning(false);
      setHasSpun(true);
      setResult(SPIN_PRIZES[idx]);
      onToast(`🎉 You won: ${SPIN_PRIZES[idx].label}!`, "success");
    }, 2500);
  };

  const segAngle = 360 / SPIN_PRIZES.length;

  return (
    <Modal open={open} onClose={onClose} title="Daily Trade Brief">
      <div className="px-6 py-6 text-center space-y-5">
        <p className="text-sm" style={{ color: "#6B7294" }}>
          Good morning, Rajesh. Your Basmati Rice got <strong style={{ color: "#0F1740" }}>3 new views</strong> from Hamburg overnight.
          Spin to earn today's reward!
        </p>

        {/* Spin wheel */}
        <div className="flex justify-center items-center relative" style={{ height: "220px" }}>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-2xl" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>▼</div>

          {/* Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="rounded-full border-4 border-white shadow-xl overflow-hidden"
            style={{ width: "200px", height: "200px", boxShadow: "0 8px 32px rgba(15,23,64,0.2)" }}>
            <svg viewBox="0 0 200 200" width="200" height="200">
              {SPIN_PRIZES.map((prize, i) => {
                const startAngle = (i * segAngle - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180);
                const x1 = 100 + 100 * Math.cos(startAngle);
                const y1 = 100 + 100 * Math.sin(startAngle);
                const x2 = 100 + 100 * Math.cos(endAngle);
                const y2 = 100 + 100 * Math.sin(endAngle);
                const midAngle = ((i + 0.5) * segAngle - 90) * (Math.PI / 180);
                const tx = 100 + 60 * Math.cos(midAngle);
                const ty = 100 + 60 * Math.sin(midAngle);
                const colors = ["#EBF0FF","#DCFCE7","#FEF3C7","#F3E8FF","#FEE2E2","#DCFCE7","#EBF0FF","#FEF3C7"];
                return (
                  <g key={i}>
                    <path d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} fill={colors[i]} stroke="white" strokeWidth="1" />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="9"
                      style={{ fontFamily: "'DM Mono', monospace", fill: "#0F1740" }}>
                      {prize.icon}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="14" fill="#0F1740" />
              <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="white">E</text>
            </svg>
          </motion.div>
        </div>

        {result ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1.5px solid rgba(22,163,74,0.2)" }}>
            <div className="text-3xl mb-1">{result.icon}</div>
            <p className="font-bold" style={{ fontFamily: "'Fraunces', serif", color: "#0F1740" }}>You won: {result.label}!</p>
            <p className="text-xs mt-1" style={{ color: "#9BA3C4" }}>Added to your account. Come back tomorrow for another spin.</p>
          </motion.div>
        ) : (
          <motion.button whileHover={!hasSpun ? { scale: 1.04 } : {}} whileTap={!hasSpun ? { scale: 0.97 } : {}}
            onClick={spin} disabled={spinning || hasSpun}
            className="px-10 py-3.5 rounded-full text-sm font-semibold transition-all mx-auto"
            style={{
              background: hasSpun ? "#F4F6FF" : "#4875EF",
              color: hasSpun ? "#9BA3C4" : "#fff",
              boxShadow: hasSpun ? "none" : "0 4px 20px rgba(72,117,239,0.4)",
              cursor: hasSpun ? "not-allowed" : "pointer",
            }}>
            {spinning ? "Spinning…" : hasSpun ? "Come back tomorrow" : "Spin to Earn →"}
          </motion.button>
        )}
      </div>
    </Modal>
  );
}

// ── Mini Quest Card (for Overview) ────────────────────────────────────────────

export function MiniQuestCard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const daily = GAME_DATA.quests.daily;
  const done = daily.filter((q) => q.done).length;
  return (
    <DashCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#9BA3C4", fontFamily: "'DM Mono', monospace" }}>Daily Quests</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#0F1740" }}>{done}/{daily.length} completed today</p>
        </div>
        <button onClick={() => onNavigate("quests")} className="text-xs font-semibold hover:opacity-70" style={{ color: "#4875EF" }}>View all →</button>
      </div>
      <div className="space-y-2.5">
        {daily.map((q) => (
          <div key={q.id} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: q.done ? "#22C55E" : "#F4F6FF", border: q.done ? "none" : "1.5px solid rgba(15,23,64,0.1)" }}>
              <span className="text-xs" style={{ color: q.done ? "#fff" : "#C8CEDF" }}>{q.done ? "✓" : ""}</span>
            </div>
            <span className="text-xs flex-1" style={{ color: q.done ? "#9BA3C4" : "#374151", textDecoration: q.done ? "line-through" : "none" }}>
              {q.title}
            </span>
            <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>+{q.xp} XP</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t flex items-center gap-3" style={{ borderColor: "rgba(15,23,64,0.06)" }}>
        <span className="text-sm">🔥</span>
        <p className="text-xs" style={{ color: "#374151" }}>
          <strong style={{ color: "#DC2626" }}>{GAME_DATA.streak}-day streak</strong> · Keep it going for bonus XP
        </p>
      </div>
    </DashCard>
  );
}
