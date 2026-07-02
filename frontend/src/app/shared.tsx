import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

export type ToastType = "success" | "error" | "info";

// ── Animation utilities ───────────────────────────────────────────────────────

export const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};
export const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.38, ease: [0.22,1,0.36,1] } },
};

export function AnimatedNumber({
  to, prefix = "", suffix = "", decimals = 0, duration = 1300,
}: { to: number; prefix?: string; suffix?: string; decimals?: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      setVal(parseFloat((eased * to).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, decimals]);
  return <>{prefix}{decimals > 0 ? val.toFixed(decimals) : val.toLocaleString("en-IN")}{suffix}</>;
}

export function TiltCard({
  children, className = "", style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState("");

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 9;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -9;
    setTf(`perspective(700px) rotateX(${y}deg) rotateY(${x}deg) scale(1.025)`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTf("")}
      style={{
        transform: tf || "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)",
        transition: tf ? "transform 0.08s ease-out" : "transform 0.45s ease-out",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ── Journey Button ──────────────────────────────────────────────────────────

export function JourneyButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost-light" | "ghost-dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
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

// ── Shared card ───────────────────────────────────────────────────────────────
export function DashCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: "#ffffff", border: "1px solid rgba(15,23,64,0.07)", boxShadow: "0 2px 16px rgba(15,23,64,0.05)", ...style }}>
      {children}
    </div>
  );
}

// ── Shared form components ────────────────────────────────────────────────────

export function Field({ label, type = "text", placeholder = "", value, onChange, hint }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; hint?: string;
}) {
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

export function FieldSelect({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
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

export function ChipSelect({ label, options, selected, onToggle }: {
  label: string; options: string[]; selected: string[]; onToggle: (o: string) => void;
}) {
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

// ── Modal wrapper ─────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, wide = false }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,64,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25, ease: EASE }}
        className={`w-full rounded-2xl overflow-hidden ${wide ? "max-w-3xl" : "max-w-lg"}`}
        style={{ background: "#ffffff", boxShadow: "0 24px 64px rgba(15,23,64,0.2)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-gray-100"
            style={{ color: "#9BA3C4" }}>✕</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "75vh" }}>{children}</div>
      </motion.div>
    </div>
  );
}

// ── Drawer wrapper ────────────────────────────────────────────────────────────

export function Drawer({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[190]" style={{ background: "rgba(15,23,64,0.4)", backdropFilter: "blur(2px)" }}
            onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed right-0 top-0 bottom-0 z-[195] flex flex-col"
            style={{ width: "min(520px,100vw)", background: "#ffffff", boxShadow: "-16px 0 48px rgba(15,23,64,0.12)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(15,23,64,0.07)" }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", fontWeight: 700, color: "#0F1740", letterSpacing: "-0.02em" }}>{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: "#9BA3C4" }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Product screen types & level data ────────────────────────────────────────

export const LEVELS = [
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
