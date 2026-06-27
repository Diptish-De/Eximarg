import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  Globe, 
  Warning, 
  WhatsappLogo, 
  FileText, 
  Check, 
  Sparkle, 
  ArrowDown
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const mainContainerRef = useRef(null);
  const globeContainerRef = useRef(null);
  
  // Chapter 2 Refs
  const chaosSectionRef = useRef(null);
  const chaosCardsRef = useRef([]);

  const handleCTA = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleScrollDown = () => {
    const chaosSec = document.getElementById('chaos-scene');
    if (chaosSec) {
      chaosSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Background Color interpolation based on Scroll Position (Midnight Blue -> Industrial Grey)
    const bgTrigger = ScrollTrigger.create({
      trigger: mainContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        // Interpolate background color from #020617 (Midnight) to #181b22 (Industrial Grey)
        if (mainContainerRef.current) {
          const color1 = [2, 6, 23]; // rgb for #020617
          const color2 = [24, 27, 34]; // rgb for #181b22
          
          const r = Math.round(color1[0] + (color2[0] - color1[0]) * progress);
          const g = Math.round(color1[1] + (color2[1] - color1[1]) * progress);
          const b = Math.round(color1[2] + (color2[2] - color1[2]) * progress);
          
          mainContainerRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
      }
    });

    // Globe rotation on scroll
    const globeTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: mainContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      }
    });

    if (globeContainerRef.current) {
      globeTimeline.to(globeContainerRef.current, {
        rotation: 140,
        scale: 0.9,
        opacity: 0.25,
        y: 100,
        ease: 'none',
      });
    }

    // Chaos documents movement on scroll
    const chaosTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: chaosSectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      }
    });

    // Spread the chaotic elements out, then pull them into a neat grid
    chaosTimeline.to(chaosCardsRef.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      stagger: 0.05,
    });

    return () => {
      bgTrigger.kill();
      globeTimeline.kill();
      chaosTimeline.kill();
    };
  }, []);

  return (
    <div 
      ref={mainContainerRef} 
      className="min-h-screen text-[#eeefff] relative overflow-hidden font-sans transition-colors duration-300 selection:bg-brand-primary selection:text-white"
      style={{ backgroundColor: '#020617' }}
    >
      {/* Stars Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Premium Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#020617]/40 border-b border-brand-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-indigo-500 flex items-center justify-center font-display font-extrabold text-sm text-white shadow-lg shadow-brand-primary/10">
              E
            </div>
            <span className="font-display font-bold text-sm tracking-widest text-white uppercase">EXIMARG</span>
          </div>

          <nav className="flex items-center gap-6">
            {currentUser ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-brand-primary to-indigo-500 hover:opacity-90 text-white text-[10px] font-extrabold rounded-lg tracking-wider transition-all uppercase shadow-md shadow-brand-primary/15"
              >
                Launch Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-[10px] font-extrabold uppercase tracking-wider text-brand-textMuted hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-gradient-to-r from-brand-primary to-indigo-500 hover:opacity-95 text-white text-[10px] font-extrabold rounded-lg tracking-wider transition-all uppercase shadow-md shadow-brand-primary/15"
                >
                  Start Journey
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* CHAPTER 1: THE WORLD IS WAITING */}
      <section className="min-h-screen flex flex-col justify-center px-6 relative max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-6 flex flex-col text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full w-fit">
              <Sparkle size={14} className="text-brand-primary animate-pulse" />
              <span className="text-[9px] font-extrabold tracking-widest text-brand-primary uppercase">The World Is Waiting</span>
            </div>
            
            <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-[1.05] tracking-tight">
              Your Export <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-accent">
                Journey Starts Here.
              </span>
            </h1>
            
            <p className="text-brand-textMuted text-sm md:text-base max-w-xl leading-relaxed">
              From your first export document to your first international shipment. One guided, cinematic experience mapping your business directly to the global stage.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={handleCTA}
                className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-brand-primary/25 flex items-center justify-center gap-2 group"
                data-testid="hero-primary-cta"
              >
                Start Your Export Journey
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleScrollDown}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Watch the Journey
              </button>
            </div>
          </div>

          {/* Hero Globe */}
          <div ref={globeContainerRef} className="lg:col-span-6 flex items-center justify-center relative">
            <div className="absolute w-[450px] h-[450px] bg-brand-primary/5 rounded-full blur-[90px] pointer-events-none" />
            <svg 
              viewBox="0 0 600 600" 
              className="w-full max-w-[480px] h-auto drop-shadow-[0_0_60px_rgba(37,99,235,0.12)]"
            >
              {/* Globe sphere gradient */}
              <circle cx="300" cy="300" r="220" fill="url(#globeAtmosphere)" />
              
              {/* Latitude/Longitude lines */}
              <path d="M 80 300 A 220 220 0 0 0 520 300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M 120 300 A 220 120 0 0 0 480 300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M 300 80 A 220 220 0 0 0 300 520" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M 300 80 A 120 220 0 0 0 300 520" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* India glow pointer */}
              <circle cx="290" cy="280" r="25" fill="rgba(245,158,11,0.15)" className="animate-pulse" />
              <circle cx="290" cy="280" r="6" fill="#F59E0B" />
              
              {/* Routes to Hamburg, USA, UAE */}
              <path d="M 290 280 Q 210 200 170 190" fill="none" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="6 3" className="animate-route" />
              <path d="M 290 280 C 200 300 130 280 90 230" fill="none" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="6 3" className="animate-route" />
              <path d="M 290 280 Q 250 260 220 250" fill="none" stroke="url(#routeGrad)" strokeWidth="2" strokeDasharray="6 3" className="animate-route" />

              {/* Cargo dots moving */}
              <circle r="3.5" fill="#F59E0B">
                <animateMotion path="M 290 280 Q 210 200 170 190" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle r="3.5" fill="#3B82F6">
                <animateMotion path="M 290 280 C 200 300 130 280 90 230" dur="8s" repeatCount="indefinite" />
              </circle>

              <defs>
                <radialGradient id="globeAtmosphere" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                  <stop offset="0%" stopColor="#081e59" />
                  <stop offset="70%" stopColor="#030b21" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={handleScrollDown}>
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-brand-textMuted">Scroll to Begin</span>
          <ArrowDown size={14} className="animate-bounce mt-1 text-brand-primary" />
        </div>
      </section>

      {/* CHAPTER 2: CHAOS */}
      <section 
        id="chaos-scene"
        ref={chaosSectionRef} 
        className="min-h-screen py-32 px-6 relative flex flex-col justify-center border-t border-brand-border/20"
      >
        {/* Paper texture overlay for industrial scene */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px]" />

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Copy description */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 relative z-20">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Chapter 2: The Chaos</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight">
              Exporting feels overwhelming.
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base leading-relaxed">
              Unlinked GST filings, missing IEC registrations, pending RCMC approvals, raw WhatsApp chats, and complex spreadsheets. Everything is scattered. Chaos blocks your global growth.
            </p>
            <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-200">
                As you scroll, EXIMARG pulls these scattered pieces together, organizing compliance into complete structural order.
              </p>
            </div>
          </div>

          {/* Interactive Chaos Visualizer */}
          <div className="lg:col-span-7 h-[480px] relative flex items-center justify-center">
            
            {/* Chaotic documents scattered in warehouse space */}
            <div 
              ref={el => chaosCardsRef.current[0] = el}
              className="absolute p-4 bg-red-950/50 border border-red-500/40 rounded-xl shadow-2xl w-60 z-30 transform -rotate-12 -translate-x-32 -translate-y-28 opacity-70 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <Warning className="text-red-400" size={16} />
                <span className="text-[9px] font-black uppercase text-red-300">IEC Mismatch</span>
              </div>
              <p className="text-[11px] text-red-200">Director details do not match PAN verification records.</p>
            </div>

            <div 
              ref={el => chaosCardsRef.current[1] = el}
              className="absolute p-4 bg-slate-900/90 border border-slate-700/60 rounded-xl shadow-2xl w-56 z-30 transform rotate-8 translate-x-32 -translate-y-20 opacity-70 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-slate-400" size={16} />
                <span className="text-[9px] font-black uppercase text-slate-300">Spreadsheet.xls</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Row 31: #VALUE! error in pricing computation.</p>
            </div>

            <div 
              ref={el => chaosCardsRef.current[2] = el}
              className="absolute p-4 bg-[#0a2e1d]/90 border border-green-500/40 rounded-xl shadow-2xl w-64 z-30 transform -rotate-6 -translate-x-24 translate-y-28 opacity-70 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <WhatsappLogo className="text-green-400" size={16} />
                <span className="text-[9px] font-black uppercase text-green-300">WhatsApp Query</span>
              </div>
              <p className="text-[11px] text-green-100">"Is the container weight certificate ready?"</p>
            </div>

            {/* Central Unified Structure (visible when chaos flies in) */}
            <div className="absolute p-6 bg-[#0c1224] border border-brand-primary/30 rounded-2xl w-full max-w-[380px] z-10 shadow-2xl text-left">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkle className="text-brand-primary" size={16} />
                  <span className="text-[10px] font-extrabold uppercase text-white tracking-widest">Compliance Status</span>
                </div>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] font-extrabold rounded-full uppercase border border-green-500/20">
                  Ready
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-[#030712]/50 border border-brand-border rounded-lg text-xs">
                  <span className="text-brand-textMuted">IEC License API</span>
                  <span className="text-green-400 font-bold flex items-center gap-1"><Check size={12} /> Sync Complete</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#030712]/50 border border-brand-border rounded-lg text-xs">
                  <span className="text-brand-textMuted">GSTIN Link</span>
                  <span className="text-green-400 font-bold flex items-center gap-1"><Check size={12} /> Synced</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Global CSS animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }
        .animate-route {
          stroke-dasharray: 6 3;
          animation: dash 2.5s linear infinite;
        }
      `}} />
    </div>
  );
}
