import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Lightning, ShieldCheck, Sparkle, ShoppingBagOpen, Check, ArrowRight } from '@phosphor-icons/react';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const handleCTA = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#07143B] text-[#eeefff] relative overflow-hidden font-sans">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-brand-accent/10 rounded-full blur-[120px]" />

      {/* Header / Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center font-display font-extrabold text-xl text-white shadow-lg shadow-brand-primary/20">
            E
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">EXIMARG</span>
        </div>

        <nav className="flex items-center gap-6">
          {currentUser ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-primary/15"
              data-testid="landing-dashboard-button"
            >
              Launch Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="text-xs font-bold text-brand-textMuted hover:text-white transition-colors"
                data-testid="landing-login-button"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-primary/15"
                data-testid="landing-register-button"
              >
                Join the Quest
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center relative z-10">
        <span className="px-4 py-1.5 bg-brand-primary/15 border border-brand-primary/30 rounded-full text-brand-primary text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-6">
          <Sparkle size={14} className="animate-spin-slow" />
          The Export Operating System
        </span>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Duolingo meets Shopify for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Indian Exporters</span>
        </h1>
        
        <p className="text-brand-textMuted text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Zero to Export-Ready in days. Master foreign customs compliance, construct digital catalogs, and compile trade-legal invoices through a gamified B2B operating workflow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={handleCTA}
            className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 group"
            data-testid="hero-primary-cta"
          >
            Start Your Onboarding Quest
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-8">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-brand-border">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6">
              <Lightning size={24} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Gamified Onboarding</h3>
            <p className="text-brand-textMuted text-sm leading-relaxed">
              Earn XP, badges, and unlock readiness percentages across 6 custom levels guiding you from identity to business checks.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-brand-border">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-6">
              <ShoppingBagOpen size={24} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">Digital Dukan</h3>
            <p className="text-brand-textMuted text-sm leading-relaxed">
              Build or bulk import your global product catalog with customized MOQ tiers, item pricing, and verified HSN structures.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-brand-border">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
              <Sparkle size={24} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">AI Trade Consultant</h3>
            <p className="text-brand-textMuted text-sm leading-relaxed">
              Consult on export codes and draft proposal replies to foreign buyers on-demand.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center border-t border-brand-border/40 relative z-10">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">Flexible Startup Plans</h2>
        <p className="text-brand-textMuted text-sm mb-12 max-w-xl mx-auto">Access customized export levels, higher AI quota calls, and billing sequence automation.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {[
            { name: 'Starter', price: '₹999/mo', calls: '20 AI calls / mo', active: false },
            { name: 'Growth', price: '₹2,999/mo', calls: '200 AI calls / mo', active: true },
            { name: 'Premium', price: '₹9,999/mo', calls: '1000 AI calls / mo', active: false }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`glass-panel p-8 rounded-3xl relative border ${
                plan.active ? 'border-brand-primary shadow-xl shadow-brand-primary/5' : 'border-brand-border'
              }`}
            >
              {plan.active && (
                <span className="absolute -top-3.5 left-6 px-3 py-1 bg-brand-primary text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <h4 className="font-display font-bold text-white text-lg">{plan.name}</h4>
              <p className="font-display font-extrabold text-3xl text-white mt-3">{plan.price}</p>
              <ul className="mt-6 space-y-3 text-xs text-brand-textMuted">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <span>{plan.calls}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <span>Automated Invoicing (FOB/CIF)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <span>Interactive Onboarding Wizards</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-brand-border/40 text-center text-xs text-brand-textMuted relative z-10">
        <p>© 2026 EXIMARG. Built for enterprise exporters scaling globally.</p>
      </footer>
    </div>
  );
}
