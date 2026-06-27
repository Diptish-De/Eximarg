import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowDown,
  User,
  IdentificationCard,
  ShieldCheck,
  Storefront,
  Users,
  Trophy,
  X
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const milestones = [
  { id: 'identity', title: 'Identity', desc: 'Secure verification of director PAN & identity checks.', icon: User, xp: 100, badge: 'Verified Citizen' },
  { id: 'profile', title: 'Exporter Profile', desc: 'Define your target commodities & export business model.', icon: IdentificationCard, xp: 150, badge: 'Global Aspirant' },
  { id: 'verification', title: 'Verification', desc: 'Direct API validation with IEC & GST systems.', icon: ShieldCheck, xp: 200, badge: 'Legit business' },
  { id: 'company', title: 'Company Review', desc: 'Automatic background check and entity verification.', icon: FileText, xp: 100, badge: 'Trusted Partner' },
  { id: 'catalog', title: 'Digital Catalog', desc: 'Instantly construct your localized B2B global product storefront.', icon: Storefront, xp: 250, badge: 'Merchant King' },
  { id: 'buyer', title: 'First Buyer', desc: 'Connect with verified buyers and manage initial inquiries.', icon: Users, xp: 300, badge: 'Dealmaker' }
];

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const mainContainerRef = useRef(null);
  const globeContainerRef = useRef(null);
  
  // Chapter 2 Refs
  const chaosSectionRef = useRef(null);
  const chaosCardsRef = useRef([]);

  // Chapter 3 Refs
  const journeySectionRef = useRef(null);
  const timelineProgressRef = useRef(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(-1);
  const [earnedXP, setEarnedXP] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [recentNotification, setRecentNotification] = useState(null);
  const [isLightBg, setIsLightBg] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

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
    // Background Color evolution based on scroll progress:
    // Midnight Blue -> Industrial Grey -> Royal Blue -> Warm White
    const bgTrigger = ScrollTrigger.create({
      trigger: mainContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (mainContainerRef.current) {
          let r, g, b;
          if (progress < 0.16) {
            const factor = progress / 0.16;
            const color1 = [2, 6, 23]; // Midnight Blue
            const color2 = [24, 27, 34]; // Industrial Grey
            r = Math.round(color1[0] + (color2[0] - color1[0]) * factor);
            g = Math.round(color1[1] + (color2[1] - color1[1]) * factor);
            b = Math.round(color1[2] + (color2[2] - color1[2]) * factor);
            setIsLightBg(false);
          } else if (progress < 0.32) {
            const factor = (progress - 0.16) / 0.16;
            const color2 = [24, 27, 34]; // Industrial Grey
            const color3 = [12, 27, 64]; // Royal Blue
            r = Math.round(color2[0] + (color3[0] - color2[0]) * factor);
            g = Math.round(color2[1] + (color3[1] - color2[1]) * factor);
            b = Math.round(color2[2] + (color3[2] - color2[2]) * factor);
            setIsLightBg(false);
          } else if (progress < 0.48) {
            const factor = (progress - 0.32) / 0.16;
            const color3 = [12, 27, 64]; // Royal Blue
            const color4 = [249, 246, 240]; // Warm White
            r = Math.round(color3[0] + (color4[0] - color3[0]) * factor);
            g = Math.round(color3[1] + (color4[1] - color3[1]) * factor);
            b = Math.round(color3[2] + (color4[2] - color3[2]) * factor);
            if (progress > 0.45) {
              setIsLightBg(true);
            } else {
              setIsLightBg(false);
            }
          } else if (progress < 0.64) {
            const factor = (progress - 0.48) / 0.16;
            const color4 = [249, 246, 240]; // Warm White
            const color5 = [41, 35, 18]; // Golden Port Lights
            r = Math.round(color4[0] + (color5[0] - color4[0]) * factor);
            g = Math.round(color4[1] + (color5[1] - color4[1]) * factor);
            b = Math.round(color4[2] + (color5[2] - color4[2]) * factor);
            if (progress > 0.58) {
              setIsLightBg(false);
            } else {
              setIsLightBg(true);
            }
          } else if (progress < 0.80) {
            const factor = (progress - 0.64) / 0.16;
            const color5 = [41, 35, 18]; // Golden Port Lights
            const color6 = [3, 7, 18]; // Deep Space Dark
            r = Math.round(color5[0] + (color6[0] - color5[0]) * factor);
            g = Math.round(color5[1] + (color6[1] - color5[1]) * factor);
            b = Math.round(color5[2] + (color6[2] - color5[2]) * factor);
            setIsLightBg(false);
          } else {
            const factor = (progress - 0.80) / 0.20;
            const color6 = [3, 7, 18]; // Deep Space Dark
            const color7 = [11, 15, 25]; // Premium Dark
            r = Math.round(color6[0] + (color7[0] - color6[0]) * factor);
            g = Math.round(color6[1] + (color7[1] - color6[1]) * factor);
            b = Math.round(color6[2] + (color7[2] - color6[2]) * factor);
            setIsLightBg(false);
          }
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

    // Chapter 3 timeline path scroll-drawing and unlocking logic
    const journeyTrigger = ScrollTrigger.create({
      trigger: journeySectionRef.current,
      start: 'top 30%',
      end: 'bottom 70%',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        if (timelineProgressRef.current) {
          timelineProgressRef.current.style.height = `${progress * 100}%`;
        }

        // Calculate active index
        const index = Math.min(
          Math.floor(progress * milestones.length),
          milestones.length - 1
        );

        if (index !== activeMilestoneIndex && progress > 0.02) {
          setActiveMilestoneIndex(index);

          // Sum total XP and badges unlocked
          let totalXp = 0;
          let badges = [];
          for (let i = 0; i <= index; i++) {
            totalXp += milestones[i].xp;
            badges.push(milestones[i].badge);
          }
          setEarnedXP(totalXp);
          setUnlockedBadges(badges);

          // Trigger toast notification
          setRecentNotification({
            title: milestones[index].title,
            xp: milestones[index].xp,
            badge: milestones[index].badge
          });

          // Automatically clear notifications
          setTimeout(() => {
            setRecentNotification(prev => {
              if (prev && prev.title === milestones[index].title) {
                return null;
              }
              return prev;
            });
          }, 2500);
        } else if (progress <= 0.02) {
          setActiveMilestoneIndex(-1);
          setEarnedXP(0);
          setUnlockedBadges([]);
          setRecentNotification(null);
        }
      }
    });

    return () => {
      bgTrigger.kill();
      globeTimeline.kill();
      chaosTimeline.kill();
      journeyTrigger.kill();
    };
  }, [activeMilestoneIndex]);

  return (
    <div 
      ref={mainContainerRef} 
      className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-500 selection:bg-brand-primary selection:text-white ${
        isLightBg ? 'text-stone-900' : 'text-[#eeefff]'
      }`}
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
      <section className="min-h-screen flex flex-col justify-center items-center px-6 relative max-w-5xl mx-auto z-10 text-center">
        
        {/* Hero Content */}
        <div className="flex flex-col items-center space-y-6 max-w-3xl">
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
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
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

        {/* Centered Hero Globe */}
        <div ref={globeContainerRef} className="mt-12 flex items-center justify-center relative w-full max-w-[400px]">
          <div className="absolute w-[350px] h-[350px] bg-brand-primary/5 rounded-full blur-[70px] pointer-events-none" />
          <svg 
            viewBox="0 0 600 600" 
            className="w-full h-auto drop-shadow-[0_0_60px_rgba(37,99,235,0.12)]"
          >
            {/* Globe sphere gradient with spinning lines */}
            <g className="animate-spin-slow origin-center">
              <circle cx="300" cy="300" r="220" fill="url(#globeAtmosphere)" />
              
              {/* Latitude/Longitude lines */}
              <circle cx="300" cy="300" r="220" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <path d="M 80 300 A 220 220 0 0 0 520 300" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              <path d="M 120 300 A 220 120 0 0 0 480 300" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              <path d="M 300 80 A 220 220 0 0 0 300 520" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              <path d="M 300 80 A 120 220 0 0 0 300 520" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
            </g>
            
            {/* India glow pointer - remains stable while lines rotate beneath to keep focus */}
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

      {/* CHAPTER 3: YOUR GUIDE APPEARS */}
      <section 
        ref={journeySectionRef} 
        className="py-32 px-6 relative border-t border-brand-border/20 min-h-screen"
      >
        <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest font-mono">Chapter 3: The Pathway</span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3 leading-tight">
            Your Guided Roadmap
          </h2>
          <p className="text-brand-textMuted text-sm md:text-base mt-4 max-w-xl mx-auto">
            Scroll down to advance your exporter status. Unlock essential regulatory identity milestones as you scale.
          </p>
        </div>

        {/* Vertical Timeline container */}
        <div className="max-w-2xl mx-auto relative pt-12 pb-24">
          
          {/* Background Path line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-brand-border/40" />
          
          {/* Active drawing path */}
          <div 
            ref={timelineProgressRef}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 bg-gradient-to-b from-brand-primary via-indigo-400 to-brand-accent transition-all duration-300 ease-out"
            style={{ height: '0%' }}
          />

          <div className="relative space-y-16">
            {milestones.map((milestone, idx) => {
              const IconComponent = milestone.icon;
              const isActive = idx <= activeMilestoneIndex;
              const isCurrent = idx === activeMilestoneIndex;

              return (
                <div 
                  key={milestone.id}
                  className={`flex flex-col md:flex-row items-center gap-6 relative z-10 ${
                    idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Alternating layout spacing spacer */}
                  <div className="flex-1 hidden md:block" />

                  {/* Milestone Node Badge */}
                  <div className="relative">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                        isCurrent 
                          ? 'bg-gradient-to-tr from-brand-primary to-indigo-500 border-white scale-110 shadow-lg shadow-brand-primary/30' 
                          : isActive 
                            ? 'bg-[#0c1224] border-brand-primary text-brand-primary' 
                            : 'bg-[#020617] border-brand-border/80 text-brand-textMuted'
                      }`}
                    >
                      <IconComponent size={20} className={isCurrent ? 'text-white animate-pulse' : ''} />
                    </div>
                  </div>

                  {/* Details Card */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className={`p-5 rounded-2xl border transition-all duration-500 glass-panel ${
                      isCurrent 
                        ? 'border-brand-primary/50 shadow-xl bg-[#0c1b40]/80' 
                        : isActive 
                          ? 'border-brand-border' 
                          : 'opacity-30 border-transparent'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">{milestone.title}</h4>
                        <span className="text-[9px] text-yellow-400 font-extrabold bg-yellow-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          +{milestone.xp} XP
                        </span>
                      </div>
                      <p className="text-xs text-brand-textMuted leading-relaxed">{milestone.desc}</p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CHAPTER 4: YOUR DIGITAL DUKAN */}
      <section 
        id="dukan-scene"
        className="min-h-screen py-32 px-6 relative border-t border-stone-200 flex flex-col justify-center transition-colors duration-500"
      >
        {/* Soft shadow warm glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[30vw] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-20">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest font-mono">Chapter 4: The Showroom</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl mt-3 leading-tight text-stone-900">
              Your Digital Dukan
            </h2>
            <p className="text-stone-600 text-sm md:text-base mt-4">
              Watch your wholesale commodities align onto self-building digital shelves, illuminated and prepared for international buyer scrutiny.
            </p>
          </div>

          {/* Self-building showroom shelves layout */}
          <div className="space-y-16">
            
            {/* Shelf Line 1 */}
            <div className="border-b-2 border-stone-300 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              
              {/* Product 1: Silk Carpets */}
              <div className="group flex flex-col justify-between p-6 bg-stone-50 border border-stone-200 rounded-2xl hover:shadow-2xl hover:border-amber-400/40 transition-all duration-500 transform hover:-translate-y-2">
                <div className="space-y-4">
                  <div className="h-40 bg-stone-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-extrabold rounded-full uppercase tracking-wider">
                      GI Tagged
                    </span>
                    <Globe size={48} className="text-stone-300 group-hover:scale-115 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-stone-400">HSN Code 5701.10.00</span>
                    <h4 className="font-display font-bold text-base text-stone-900 mt-1">Handwoven Silk Carpets</h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">Luxury knotting from Gujarat, curated for custom flooring distributors.</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-200/60 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">MOQ</span>
                    <span className="text-xs font-bold text-stone-800">50 Units</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">Target Demand</span>
                    <span className="text-xs font-bold text-amber-600">Germany, USA</span>
                  </div>
                </div>
              </div>

              {/* Product 2: Assam Tea */}
              <div className="group flex flex-col justify-between p-6 bg-stone-50 border border-stone-200 rounded-2xl hover:shadow-2xl hover:border-amber-400/40 transition-all duration-500 transform hover:-translate-y-2">
                <div className="space-y-4">
                  <div className="h-40 bg-stone-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-extrabold rounded-full uppercase tracking-wider">
                      APEDA Certified
                    </span>
                    <Globe size={48} className="text-stone-300 group-hover:scale-115 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-stone-400">HSN Code 0902.40.20</span>
                    <h4 className="font-display font-bold text-base text-stone-900 mt-1">Organic Assam Tea</h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">Single-estate orthodox leaf grades packaged for luxury global brands.</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-200/60 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">MOQ</span>
                    <span className="text-xs font-bold text-stone-800">500 kg</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">Target Demand</span>
                    <span className="text-xs font-bold text-amber-600">UK, Singapore</span>
                  </div>
                </div>
              </div>

              {/* Product 3: Brassware */}
              <div className="group flex flex-col justify-between p-6 bg-stone-50 border border-stone-200 rounded-2xl hover:shadow-2xl hover:border-amber-400/40 transition-all duration-500 transform hover:-translate-y-2">
                <div className="space-y-4">
                  <div className="h-40 bg-stone-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-extrabold rounded-full uppercase tracking-wider">
                      Quality Assured
                    </span>
                    <Globe size={48} className="text-stone-300 group-hover:scale-115 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-stone-400">HSN Code 7419.80.30</span>
                    <h4 className="font-display font-bold text-base text-stone-900 mt-1">Artisanal Brassware</h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">Traditional sand-cast engraved vases crafted by Moradabad artisans.</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-200/60 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">MOQ</span>
                    <span className="text-xs font-bold text-stone-800">100 Units</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">Target Demand</span>
                    <span className="text-xs font-bold text-amber-600">UAE, France</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* CHAPTER 5: FIRST BUYER */}
      <section 
        id="buyer-scene"
        className="min-h-screen py-32 px-6 relative border-t border-brand-border/20 flex flex-col justify-center transition-colors duration-500"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="max-w-6xl mx-auto w-full">
          
          <div className="text-center max-w-xl mx-auto mb-20">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">Chapter 5: The Deal</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3 leading-tight">
              Germany discovers your product.
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-4">
              Watch your Basmati Rice transaction flow from initial buyer discovery in Hamburg directly to port loading.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Stepper Selection */}
            <div className="lg:col-span-5 space-y-4">
              {[
                { id: 1, title: 'Inquiry Arrives', desc: 'Hamburg Wholesale Gmbh requests custom basmati grades.' },
                { id: 2, title: 'AI Reply Drafted', desc: 'Consultant drafts professional trade specs & pricing.' },
                { id: 3, title: 'Proforma Invoice', desc: 'Create compliant invoice, packing lists, & trade declarations.' },
                { id: 4, title: 'Payment Secured', desc: 'Buyer deposits $18,750 into escrow trade ledger.' },
                { id: 5, title: 'Vessel Departs', desc: 'Shipment loaded at Mumbai port leaves for Hamburg.' }
              ].map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    activeStep === s.id 
                      ? 'border-amber-500/50 bg-amber-500/10 shadow-lg' 
                      : 'border-brand-border hover:border-brand-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${
                      activeStep === s.id 
                        ? 'bg-amber-500 text-[#020617] border-amber-500' 
                        : 'bg-brand-bg text-brand-textMuted border-brand-border'
                    }`}>
                      {s.id}
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{s.title}</h4>
                      <p className="text-[11px] text-brand-textMuted mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stepper Visualizer screen */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-xl p-8 bg-[#0c1224]/90 border border-brand-border rounded-3xl shadow-2xl relative min-h-[360px] flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-amber-500 animate-spin-slow" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-textMuted font-mono">
                      STAGE 0{activeStep}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[9px] font-black rounded-full uppercase tracking-wider">
                    Transaction Live
                  </span>
                </div>

                {/* Card Main Info */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  {activeStep === 1 && (
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-lg text-white">Inquiry Received</h3>
                      <div className="p-4 bg-brand-bg/60 border border-brand-border rounded-xl font-mono text-[11px] space-y-2 text-stone-200">
                        <p className="text-amber-400">FROM: Hamburg_Wholesale_Gmbh</p>
                        <p>&gt; "Request sample container Basmati 1121 Sella Rice. Price CIF Hamburg Port."</p>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-lg text-white">AI Consultation Output</h3>
                      <div className="p-4 bg-brand-bg/60 border border-brand-border rounded-xl font-mono text-[11px] space-y-2 text-stone-200">
                        <p className="text-green-400">STATUS: Draft Ready</p>
                        <p>&gt; "Drafting CIF price proposal based on HSN 1006.30... Auto-calculated ocean freight and APEDA compliance checks passed."</p>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-lg text-white">Proforma Invoice Created</h3>
                      <div className="p-4 bg-brand-bg/60 border border-brand-border rounded-xl font-mono text-[11px] space-y-1 text-stone-200">
                        <p className="text-amber-400">EXIMARG DIGITAL LEDGER</p>
                        <p>Invoice #: EXP-2026-904</p>
                        <p>Total Value: $18,750 USD (FOB $17,200 + Ocean Freight)</p>
                        <p className="text-green-400 font-bold">STATUS: COMPLIANT</p>
                      </div>
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-lg text-white">Escrow Payment Secured</h3>
                      <div className="p-4 bg-brand-bg/60 border border-brand-border rounded-xl font-mono text-[11px] space-y-2 text-stone-200">
                        <p className="text-green-400">STATUS: Wire Confirmed</p>
                        <p>&gt; "$18,750 USD deposited in EXIMARG Escrow Trade Wallet. Clearance authorized."</p>
                      </div>
                    </div>
                  )}

                  {activeStep === 5 && (
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-lg text-white"> Nhava Sheva Port Dispatch</h3>
                      <div className="p-4 bg-brand-bg/60 border border-brand-border rounded-xl font-mono text-[11px] space-y-2 text-stone-200">
                        <p className="text-amber-400">VESSEL NAME: MAERSK INTEGRITY</p>
                        <p>&gt; "Container loaded. Vessel cleared customs. Left Nhava Sheva port, Mumbai. Live logistics tracker active."</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-brand-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Logistics Flow</span>
                  <button 
                    onClick={handleCTA}
                    className="text-xs text-amber-500 font-bold hover:underline"
                  >
                    Simulate Your Trade &rarr;
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CHAPTER 6: GLOBAL REACH */}
      <section 
        id="reach-scene"
        className="min-h-screen py-32 px-6 relative border-t border-brand-border/20 flex flex-col justify-center"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-20">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest font-mono">Chapter 6: The Expansion</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3 leading-tight">
              Your Global Footprint
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-4">
              Hover over destination markers to see products, FOB shipment values, and active trade routes originating from India.
            </p>
          </div>

          {/* Interactive World Map SVG */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-brand-border relative overflow-hidden flex flex-col items-center justify-center bg-[#030712]/40">
            
            {/* Country highlights detail info */}
            <div className="absolute top-6 left-6 p-4 bg-[#030a21]/90 border border-brand-primary/20 rounded-2xl max-w-xs z-20">
              <p className="text-[9px] uppercase tracking-wider text-brand-textMuted font-mono">Destination Highlight</p>
              <h4 className="font-display font-bold text-sm text-white mt-0.5" id="map-country-name">Hover a Country</h4>
              <p className="text-xs text-brand-accent font-semibold mt-1" id="map-country-desc">Select any glowing marker on the map.</p>
            </div>

            <svg viewBox="0 0 1000 450" className="w-full h-auto max-w-[850px] opacity-90">
              {/* USA */}
              <circle 
                cx="200" cy="180" r="18" 
                fill="rgba(37,99,235,0.15)" 
                className="cursor-pointer hover:fill-brand-primary/45 transition-colors"
                onMouseEnter={() => {
                  document.getElementById('map-country-name').innerText = 'United States (USA)';
                  document.getElementById('map-country-desc').innerText = 'Top Exports: Brass Artware ($12,450 FOB). 18 days transit.';
                }}
              />
              <circle cx="200" cy="180" r="5" fill="#3B82F6" className="pointer-events-none" />

              {/* Germany */}
              <circle 
                cx="510" cy="140" r="18" 
                fill="rgba(37,99,235,0.15)" 
                className="cursor-pointer hover:fill-brand-primary/45 transition-colors"
                onMouseEnter={() => {
                  document.getElementById('map-country-name').innerText = 'Germany (DE)';
                  document.getElementById('map-country-desc').innerText = 'Top Exports: Organic Basmati Rice (15 Tons). 22 days transit.';
                }}
              />
              <circle cx="510" cy="140" r="5" fill="#3B82F6" className="pointer-events-none" />

              {/* UAE */}
              <circle 
                cx="580" cy="210" r="18" 
                fill="rgba(37,99,235,0.15)" 
                className="cursor-pointer hover:fill-brand-primary/45 transition-colors"
                onMouseEnter={() => {
                  document.getElementById('map-country-name').innerText = 'United Arab Emirates (UAE)';
                  document.getElementById('map-country-desc').innerText = 'Top Exports: Handwoven Silk Rugs ($24,000 FOB). 6 days transit.';
                }}
              />
              <circle cx="580" cy="210" r="5" fill="#3B82F6" className="pointer-events-none" />

              {/* Singapore */}
              <circle 
                cx="740" cy="290" r="18" 
                fill="rgba(37,99,235,0.15)" 
                className="cursor-pointer hover:fill-brand-primary/45 transition-colors"
                onMouseEnter={() => {
                  document.getElementById('map-country-name').innerText = 'Singapore (SG)';
                  document.getElementById('map-country-desc').innerText = 'Top Exports: Premium Tea Blends (500 kg). 9 days transit.';
                }}
              />
              <circle cx="740" cy="290" r="5" fill="#3B82F6" className="pointer-events-none" />

              {/* India Source Hub */}
              <circle cx="630" cy="230" r="12" fill="rgba(245,158,11,0.2)" className="animate-pulse" />
              <circle cx="630" cy="230" r="6" fill="#F59E0B" />
              <text x="630" y="212" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">INDIA</text>

              {/* Connective Paths */}
              <path d="M 630 230 C 580 200 280 180 200 180" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
              <path d="M 630 230 Q 570 180 510 140" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
              <path d="M 630 230 Q 600 220 580 210" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
              <path d="M 630 230 Q 680 260 740 290" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
            </svg>
          </div>
        </div>
      </section>

      {/* CHAPTER 7: THE COMMAND CENTER */}
      <section 
        id="dashboard-scene"
        className="min-h-screen py-32 px-6 relative border-t border-brand-border/20 flex flex-col justify-center"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vw] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-20">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest font-mono">Chapter 7: The Reward</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3 leading-tight">
              The Command Center
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-4">
              Your entire B2B global trade ecosystem, consolidated into a single premium interface. Everything you earned, unified.
            </p>
          </div>

          {/* Stripe-style Dashboard Grid Showcase */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-brand-border/80 shadow-2xl space-y-8 bg-[#0b0f19]/60 backdrop-blur-md">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white uppercase tracking-widest font-mono">EXIMARG Dashboard</span>
                <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[9px] font-black rounded-md uppercase tracking-wider">
                  Live Exporter Status
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Port Channels Online</span>
              </div>
            </div>

            {/* Dashboard Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Widget 1: Profile */}
              <div className="p-5 bg-brand-bg/40 border border-brand-border rounded-xl space-y-4">
                <p className="text-[9px] text-brand-textMuted uppercase font-black tracking-wider">Identity & Compliance</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">IEC Code Status</span>
                    <span className="text-green-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">GSTIN Link</span>
                    <span className="text-green-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Entity Verification</span>
                    <span className="text-green-400 font-bold">PASSED</span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Catalog */}
              <div className="p-5 bg-brand-bg/40 border border-brand-border rounded-xl space-y-4">
                <p className="text-[9px] text-brand-textMuted uppercase font-black tracking-wider">Digital Showcase</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Basmati Rice HSN</span>
                    <span className="text-white font-bold">1006.30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Assam Tea HSN</span>
                    <span className="text-white font-bold">0902.40</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Active Storefront</span>
                    <span className="text-brand-primary font-bold">eximarg.com/shop</span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Live Order Log */}
              <div className="p-5 bg-brand-bg/40 border border-brand-border rounded-xl space-y-4">
                <p className="text-[9px] text-brand-textMuted uppercase font-black tracking-wider">Logistics Ledger</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Hamburg Order #904</span>
                    <span className="text-amber-500 font-bold">PORT LAUNCH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Vessel</span>
                    <span className="text-white font-bold">Maersk Integrity</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Clearance Ledger</span>
                    <span className="text-green-400 font-bold">CLEARED</span>
                  </div>
                </div>
              </div>

              {/* Widget 4: Financial ledger */}
              <div className="p-5 bg-brand-bg/40 border border-brand-border rounded-xl space-y-4">
                <p className="text-[9px] text-brand-textMuted uppercase font-black tracking-wider">Financial Overview</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Escrow Account</span>
                    <span className="text-green-400 font-bold">$18,750 USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">GST Drawback Claim</span>
                    <span className="text-amber-500 font-bold">₹12,400 Claimed</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-textMuted">Escrow Status</span>
                    <span className="text-green-400 font-bold">SECURED</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FINAL CHAPTER: THE JOURNEY'S HORIZON */}
      <section 
        id="final-scene"
        className="min-h-screen py-32 px-6 relative border-t border-brand-border/20 flex flex-col justify-center bg-[#020512] overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest font-mono">The Conclusion</span>
          
          <h2 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-tight">
            The World Is Waiting <br />
            For What You Export.
          </h2>

          <p className="text-brand-textMuted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Your export onboarding quest starts today. Stop dealing with messy paperwork and build your global empire.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button 
              onClick={handleCTA}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-brand-primary/30 flex items-center justify-center gap-2 group"
            >
              Start Your Onboarding Quest
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Cinematic container cargo ship vector graphic */}
          <div className="pt-16 flex items-center justify-center opacity-40">
            <svg viewBox="0 0 600 120" className="w-full max-w-[500px]">
              {/* Sea waves line */}
              <path d="M 0 100 Q 150 90 300 100 T 600 100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <path d="M 0 110 Q 150 100 300 110 T 600 110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              
              {/* Cargo Ship silhouette hull */}
              <path d="M 120 100 L 150 75 L 420 75 L 450 100 Z" fill="#041138" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              
              {/* Containers stacked */}
              <rect x="180" y="55" width="40" height="20" fill="rgba(37,99,235,0.4)" stroke="rgba(255,255,255,0.1)" />
              <rect x="225" y="55" width="45" height="20" fill="rgba(99,102,241,0.4)" stroke="rgba(255,255,255,0.1)" />
              <rect x="275" y="55" width="40" height="20" fill="rgba(16,185,129,0.4)" stroke="rgba(255,255,255,0.1)" />
              <rect x="320" y="55" width="45" height="20" fill="rgba(245,158,11,0.4)" stroke="rgba(255,255,255,0.1)" />
              
              <rect x="200" y="35" width="45" height="20" fill="rgba(37,99,235,0.5)" stroke="rgba(255,255,255,0.1)" />
              <rect x="250" y="35" width="40" height="20" fill="rgba(16,185,129,0.5)" stroke="rgba(255,255,255,0.1)" />
              <rect x="295" y="35" width="45" height="20" fill="rgba(245,158,11,0.5)" stroke="rgba(255,255,255,0.1)" />
            </svg>
          </div>
        </div>

        {/* Global Footer inside Final Chapter */}
        <footer className="absolute bottom-6 left-6 right-6 text-center text-xs text-brand-textMuted border-t border-brand-border/20 pt-6">
          <p>© 2026 EXIMARG. Built for elite exporters scaling globally.</p>
        </footer>
      </section>

      {/* Floating HUD Readiness Gauge */}
      <div className="fixed bottom-6 right-6 z-40 max-w-sm w-fit pointer-events-none">
        <div className="pointer-events-auto bg-[#020617]/95 border border-brand-border/80 p-4 rounded-xl shadow-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle 
                cx="20" 
                cy="20" 
                r="16" 
                fill="transparent" 
                stroke="#2563EB" 
                strokeWidth="3" 
                strokeDasharray={`${2 * Math.PI * 16}`} 
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - (activeMilestoneIndex === -1 ? 0 : Math.round(((activeMilestoneIndex + 1) / milestones.length) * 100)) / 100)}`}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute text-[8px] font-black text-white">
              {activeMilestoneIndex === -1 ? 0 : Math.round(((activeMilestoneIndex + 1) / milestones.length) * 100)}%
            </span>
          </div>
          <div>
            <span className="text-[8px] font-black text-brand-textMuted uppercase tracking-widest block">Readiness Index</span>
            <p className="text-xs font-bold text-white mt-0.5">{earnedXP} XP Earned</p>
          </div>
        </div>
      </div>

      {/* Floating Unlock Toast Notification */}
      <AnimatePresence>
        {recentNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-40 bg-gradient-to-r from-brand-primary to-indigo-500 p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-white/80 tracking-widest">Milestone Unlocked</p>
              <h5 className="text-xs font-extrabold text-white">{recentNotification.title}</h5>
              <p className="text-[9px] text-yellow-300 font-bold">Badge: {recentNotification.badge}</p>
            </div>
            <button 
              onClick={() => setRecentNotification(null)}
              className="text-white/60 hover:text-white ml-2 pointer-events-auto"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spinSlow 40s linear infinite;
        }
      `}} />
    </div>
  );
}
