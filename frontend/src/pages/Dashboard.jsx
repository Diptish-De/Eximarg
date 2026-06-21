import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Lightning, Trophy, Compass, Star, Briefcase, IdentificationCard, SealCheck, CreditCard, SketchLogo, Invoice, SignOut } from '@phosphor-icons/react';

export default function Dashboard() {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const currentLevel = currentUser.level || 1;
  const currentXP = currentUser.xp || 0;
  const readiness = currentUser.readiness_score || 0;
  const badges = currentUser.badges || [];
  const subscription = currentUser.subscription;

  // Level data metadata
  const LEVEL_META = {
    1: { title: "Identity Verification", obj: "Complete Aadhaar and PAN verification to establish identity", time: "5 mins", xp: "+100 XP", badge: "identity_verified" },
    2: { title: "Exporter Profile", obj: "Set up exporter type, business model, and get RCMC suggestions", time: "8 mins", xp: "+100 XP", badge: "exporter_profile" },
    3: { title: "Business Verification", obj: "Upload GSTIN, CIN, AD code, and calculate verification/trust score", time: "10 mins", xp: "+150 XP", badge: "documents_verified" },
    4: { title: "Company Review", obj: "Lock onboarding levels and confirm your export business credentials", time: "5 mins", xp: "+200 XP", badge: "company_confirmed" },
    5: { title: "Subscription Activation", obj: "Activate Starter, Growth, or Premium subscription to unlock the catalog", time: "3 mins", xp: "+200 XP", badge: "subscriber" },
    6: { title: "Product Catalog", obj: "Add products, upload bulk SKU files, and lock catalog to unlock Command Center", time: "15 mins", xp: "+250 XP", badge: "catalog_uploaded" },
    7: { title: "Buyer Invoices", obj: "Create and dispatch export invoices with atomic sequence numbering", time: "10 mins", xp: "+100 XP", badge: "first_invoice_sent" },
    8: { title: "Buyer Conversations", obj: "Message global buyers and generate AI-assisted email proposals", time: "Ongoing", xp: "--", badge: "conversation_pro" },
    9: { title: "Deal Center", obj: "Track shipments, negotiate letters of credit, and manage pipeline", time: "Ongoing", xp: "--", badge: "deal_closer" }
  };

  const activeMeta = LEVEL_META[currentLevel] || LEVEL_META[9];

  // Rule-based Today's Priority recommendation engine
  const getPriority = () => {
    if (currentLevel < 5) {
      return { action: "Complete Onboarding Wizard", desc: "Finish profile details to unlock subscription levels.", route: "/wizard" };
    }
    if (currentLevel === 5) {
      return { action: "Complete Subscription", desc: "Unlock product catalog and bulk import uploads.", route: "/wizard" };
    }
    if (currentLevel === 6) {
      return { action: "Upload More Products & Lock", desc: "Upload and verify products to lock catalog and activate the Command Center.", route: "/wizard" };
    }
    if (currentLevel >= 7) {
      return { action: "Send First Invoice", desc: "Create a draft invoice and dispatch it to complete readiness to 100%.", route: "/command-center" };
    }
    return { action: "Engage with Exporters", desc: "Start conversations with active buyers in the Deal Center.", route: "/command-center" };
  };

  const priority = getPriority();

  return (
    <div className="min-h-screen pb-16 px-4 md:px-8 relative max-w-7xl mx-auto">
      {/* Top Header */}
      <header className="flex justify-between items-center py-6 border-b border-brand-border mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-lg shadow-brand-primary/20">
            E
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white leading-tight">EXIMARG</h1>
            <span className="text-xs text-brand-textMuted font-semibold tracking-wide uppercase">Export Operating System</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <span className="text-sm font-bold text-white">{currentXP} XP</span>
          </div>

          <div className="flex items-center gap-3 bg-brand-surface/40 px-4 py-2 rounded-xl border border-brand-border">
            <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-sm">
              {currentUser.email[0].toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white leading-none">{currentUser.email}</p>
              <p className="text-[10px] text-brand-textMuted uppercase mt-1 font-semibold">Tier: {subscription || 'Trial'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-3 bg-brand-border/20 border border-brand-border hover:bg-brand-border/40 text-brand-textMuted hover:text-white rounded-xl transition-all"
            data-testid="logout-button"
          >
            <SignOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content Side: Quest Hero & Priorities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Quest Hero Section */}
          <section className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-brand-border/50">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-brand-accent font-bold text-xs uppercase tracking-wider mb-4">
                <Lightning size={16} className="animate-pulse" />
                <span>Your Current Quest</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-2 leading-tight">
                Level {currentLevel}: {activeMeta.title}
              </h2>
              <p className="text-brand-textMuted text-sm md:text-base mb-6 max-w-xl">
                {activeMeta.obj}
              </p>

              {/* Progress and Level stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#031037]/50 border border-brand-border p-4 rounded-2xl">
                  <span className="block text-[10px] text-brand-textMuted uppercase font-bold tracking-wider mb-1">Readiness</span>
                  <span className="text-xl font-bold text-white">{readiness}%</span>
                </div>
                <div className="bg-[#031037]/50 border border-brand-border p-4 rounded-2xl">
                  <span className="block text-[10px] text-brand-textMuted uppercase font-bold tracking-wider mb-1">Time to Complete</span>
                  <span className="text-xl font-bold text-white">{activeMeta.time}</span>
                </div>
                <div className="bg-[#031037]/50 border border-brand-border p-4 rounded-2xl">
                  <span className="block text-[10px] text-brand-textMuted uppercase font-bold tracking-wider mb-1">XP Reward</span>
                  <span className="text-xl font-bold text-white text-green-400">{activeMeta.xp}</span>
                </div>
                <div className="bg-[#031037]/50 border border-brand-border p-4 rounded-2xl">
                  <span className="block text-[10px] text-brand-textMuted uppercase font-bold tracking-wider mb-1">Badge Reward</span>
                  <span className="text-xl font-bold text-white text-brand-accent flex items-center gap-1">
                    <SealCheck size={20} />
                    <span className="truncate text-sm">{activeMeta.badge}</span>
                  </span>
                </div>
              </div>

              {/* Big Quest Action CTA */}
              <button
                onClick={() => navigate(currentLevel >= 7 ? '/command-center' : '/wizard')}
                className="px-8 py-4 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-3 group"
                data-testid="continue-quest-cta"
              >
                Continue Quest →
              </button>
            </div>
          </section>

          {/* Today's Priority Section */}
          <section className="glass-panel p-6 rounded-3xl">
            <h3 className="font-display font-bold text-xl text-white mb-2">Today's Priority</h3>
            <p className="text-brand-textMuted text-xs mb-6">A single recommended action computed to scale your export velocity.</p>

            <div className="bg-[#031037]/60 border border-brand-border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="px-3 py-1 bg-brand-primary/20 border border-brand-primary/40 rounded-full text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                  Recommended
                </span>
                <h4 className="font-display font-bold text-lg text-white mt-2">{priority.action}</h4>
                <p className="text-brand-textMuted text-xs mt-1">{priority.desc}</p>
              </div>

              <button
                onClick={() => navigate(priority.route)}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors whitespace-nowrap"
                data-testid="priority-action-button"
              >
                Launch Task
              </button>
            </div>
          </section>
        </div>

        {/* Right Content Side: Stats & Badges */}
        <div className="space-y-8">
          {/* XP Progress Card */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-display font-bold text-lg text-white mb-4">Export Level Progress</h3>
            <div className="flex justify-between items-center text-xs font-bold text-brand-textMuted mb-2">
              <span>LVL {currentLevel}</span>
              <span>LVL {currentLevel + 1}</span>
            </div>
            
            <div className="w-full bg-[#031037]/60 rounded-full h-3 border border-brand-border overflow-hidden p-[2px]">
              <div
                className="bg-gradient-to-r from-brand-primary to-brand-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${(readiness)}%` }}
              />
            </div>
            <p className="text-[10px] text-brand-textMuted mt-3 font-semibold text-right">
              Profile Readiness: {readiness}%
            </p>
          </div>

          {/* Unlocked Badges Panel */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-display font-bold text-lg text-white mb-4">Earned Badges</h3>
            {badges.length === 0 ? (
              <div className="text-center py-8 text-brand-textMuted">
                <Star size={32} className="mx-auto mb-2 opacity-35" />
                <p className="text-xs">No badges unlocked yet. Start completing quests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, idx) => (
                  <div key={idx} className="bg-[#031037]/50 border border-brand-border px-3 py-3 rounded-2xl flex items-center gap-2">
                    <SealCheck size={20} className="text-brand-accent shrink-0" />
                    <span className="text-[11px] font-bold text-white truncate uppercase tracking-wider">{badge.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
