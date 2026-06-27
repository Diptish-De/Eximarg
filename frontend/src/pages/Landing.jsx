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
  User, 
  ShieldCheck, 
  IdentificationCard,
  CreditCard,
  Storefront,
  Users,
  Receipt,
  NavigationArrow,
  Trophy,
  X
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const milestones = [
  { id: 'identity', title: 'Identity', desc: 'Secure verification of director PAN & identity checks.', icon: User, xp: 100, badge: 'Verified Citizen' },
  { id: 'profile', title: 'Exporter Profile', desc: 'Define your target commodities & export business model.', icon: IdentificationCard, xp: 150, badge: 'Global Aspirant' },
  { id: 'verification', title: 'Verification', desc: 'Direct API validation with IEC (Importer Exporter Code) & GST systems.', icon: ShieldCheck, xp: 200, badge: 'Legit business' },
  { id: 'review', title: 'Company Review', desc: 'Automatic background check and entity verification.', icon: FileText, xp: 100, badge: 'Trusted Partner' },
  { id: 'subscription', title: 'Subscription', desc: 'Unlock premium trade lanes and high-volume AI consultation.', icon: CreditCard, xp: 100, badge: 'Pro Exporter' },
  { id: 'dukan', title: 'Digital Dukan', desc: 'Instantly construct your localized B2B global product storefront.', icon: Storefront, xp: 250, badge: 'Merchant King' },
  { id: 'buyer', title: 'First Buyer', desc: 'Connect with verified buyers and manage initial inquiries.', icon: Users, xp: 300, badge: 'Dealmaker' },
  { id: 'invoice', title: 'Invoice', desc: 'Draft compliant commercial invoices, packing lists, and custom declarations.', icon: Receipt, xp: 200, badge: 'Trade Master' },
  { id: 'export', title: 'Global Export', desc: 'Clear customs and track your shipment across international waters.', icon: NavigationArrow, xp: 500, badge: 'Global Exporter' },
  { id: 'premium', title: 'Premium Verified Exporter', desc: 'Unlock top-tier trust ratings and exclusive buyer listings.', icon: Trophy, xp: 1000, badge: 'Elite Exporter' }
];

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const containerRef = useRef(null);
  
  // Chapter 2 Refs
  const chaosSectionRef = useRef(null);
  const chaosCardRefs = useRef([]);
  const orderCardRef = useRef(null);
  
  // Chapter 3 Refs
  const journeySectionRef = useRef(null);
  const timelineProgressRef = useRef(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(-1);
  const [earnedXP, setEarnedXP] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [recentNotification, setRecentNotification] = useState(null);

  const handleCTA = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleScrollToProblem = () => {
    const problemSec = document.getElementById('problem-chapter');
    if (problemSec) {
      problemSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // CHAPTER 2: Chaos to Order Scroll Animation
    const chaosTrigger = ScrollTrigger.create({
      trigger: chaosSectionRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to('.chaos-element', {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    });

    // Chaos cards convergence animation on scroll
    const tlChaos = gsap.timeline({
      scrollTrigger: {
        trigger: chaosSectionRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      }
    });

    // Animate individual chaos cards flying into the center order card
    tlChaos.to(chaosCardRefs.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 0.8,
      opacity: 0,
      stagger: 0.05,
    });

    tlChaos.to(orderCardRef.current, {
      scale: 1.05,
      boxShadow: '0 0 40px rgba(37, 99, 235, 0.4)',
      borderColor: 'rgba(59, 130, 246, 0.8)',
      duration: 0.5,
    }, '-=0.3');

    // CHAPTER 3: Journey Timeline Scroll Animation
    const journeyTrigger = ScrollTrigger.create({
      trigger: journeySectionRef.current,
      start: 'top 40%',
      end: 'bottom 60%',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        if (timelineProgressRef.current) {
          timelineProgressRef.current.style.height = `${progress * 100}%`;
        }

        // Determine which milestone is active
        const index = Math.min(
          Math.floor(progress * milestones.length),
          milestones.length - 1
        );
        
        if (index !== activeMilestoneIndex && progress > 0.02) {
          setActiveMilestoneIndex(index);
          
          // Accumulate XP and unlock badges
          let totalXp = 0;
          let badges = [];
          for (let i = 0; i <= index; i++) {
            totalXp += milestones[i].xp;
            badges.push(milestones[i].badge);
          }
          setEarnedXP(totalXp);
          setUnlockedBadges(badges);

          // Show floating popup notification for unlocking
          setRecentNotification({
            title: milestones[index].title,
            xp: milestones[index].xp,
            badge: milestones[index].badge
          });

          // Auto clear notification after 2.5s
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
      chaosTrigger.kill();
      tlChaos.kill();
      journeyTrigger.kill();
    };
  }, [activeMilestoneIndex]);

  // Compute overall readiness percentage based on timeline progress
  const readinessPercentage = activeMilestoneIndex === -1 
    ? 0 
    : Math.round(((activeMilestoneIndex + 1) / milestones.length) * 100);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030a21] text-[#eeefff] relative overflow-hidden font-sans selection:bg-brand-primary selection:text-white">
      {/* Decorative premium radial gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-brand-primary/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Premium Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#030a21]/60 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center font-display font-extrabold text-lg text-white shadow-lg shadow-brand-primary/20">
              E
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white">EXIMARG</span>
          </div>

          <nav className="flex items-center gap-6">
            {currentUser ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-primary/15"
              >
                Launch Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-xs font-bold text-brand-textMuted hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-primary/15"
                >
                  Start Journey
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* CHAPTER 1: HERO - "The World Is Waiting" */}
      <section className="min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 relative max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Copy */}
          <div className="lg:col-span-6 flex flex-col text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full w-fit">
              <Sparkle size={14} className="text-brand-primary animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-widest text-brand-primary uppercase">The World Is Waiting.</span>
            </div>
            
            <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-[1.05] tracking-tight">
              Your Export <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-accent">
                Journey Starts Here
              </span>
            </h1>
            
            <p className="text-brand-textMuted text-base md:text-lg max-w-xl leading-relaxed">
              Step into the shoes of a global entrepreneur. Scale beyond borders, automate customs verification, construct localized digital shops, and close secure international deals.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={handleCTA}
                className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 group"
                data-testid="hero-primary-cta"
              >
                Start Your Export Journey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleScrollToProblem}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Watch the Journey
              </button>
            </div>
          </div>

          {/* Hero Animated Globe Graphic */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="absolute w-[450px] h-[450px] bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <svg 
              viewBox="0 0 600 600" 
              className="w-full max-w-[500px] h-auto drop-shadow-[0_0_50px_rgba(37,99,235,0.15)]"
            >
              {/* Globe Outline Sphere */}
              <circle cx="300" cy="300" r="220" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
              <circle cx="300" cy="300" r="220" fill="url(#globeGrad)" />
              
              {/* Grid Lines */}
              <path d="M 80 300 A 220 220 0 0 0 520 300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M 120 300 A 220 120 0 0 0 480 300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M 300 80 A 220 220 0 0 0 300 520" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <path d="M 300 80 A 120 220 0 0 0 300 520" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* India Silhouette Glow Indicator */}
              <circle cx="280" cy="270" r="28" fill="rgba(245,158,11,0.15)" className="animate-pulse" />
              <circle cx="280" cy="270" r="8" fill="#F59E0B" />
              <text x="280" y="250" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">INDIA</text>
              
              {/* Export Targets */}
              {/* Target 1: Europe (Germany) */}
              <circle cx="160" cy="180" r="5" fill="#3B82F6" />
              <text x="160" y="165" fill="#eeefff" fontSize="8" textAnchor="middle">Europe</text>

              {/* Target 2: USA */}
              <circle cx="80" cy="220" r="5" fill="#3B82F6" />
              <text x="80" y="205" fill="#eeefff" fontSize="8" textAnchor="middle">USA</text>

              {/* Target 3: UAE */}
              <circle cx="210" cy="240" r="5" fill="#3B82F6" />
              <text x="210" y="228" fill="#eeefff" fontSize="8" textAnchor="middle">UAE</text>

              {/* Target 4: Singapore */}
              <circle cx="390" cy="380" r="5" fill="#3B82F6" />
              <text x="390" y="395" fill="#eeefff" fontSize="8" textAnchor="middle">Singapore</text>

              {/* Animated Shipping Route Paths */}
              {/* Route to Europe */}
              <path 
                d="M 280 270 Q 210 200 160 180" 
                fill="none" 
                stroke="url(#routeGrad1)" 
                strokeWidth="2.5" 
                strokeDasharray="8 4" 
                className="animate-route" 
              />
              
              {/* Route to USA */}
              <path 
                d="M 280 270 C 200 290 120 280 80 220" 
                fill="none" 
                stroke="url(#routeGrad2)" 
                strokeWidth="2.5" 
                strokeDasharray="8 4" 
                className="animate-route" 
              />

              {/* Route to UAE */}
              <path 
                d="M 280 270 Q 240 250 210 240" 
                fill="none" 
                stroke="url(#routeGrad1)" 
                strokeWidth="2.5" 
                strokeDasharray="8 4" 
                className="animate-route" 
              />

              {/* Route to Singapore */}
              <path 
                d="M 280 270 Q 350 330 390 380" 
                fill="none" 
                stroke="url(#routeGrad2)" 
                strokeWidth="2.5" 
                strokeDasharray="8 4" 
                className="animate-route" 
              />

              {/* Animated Cargo Ships (Glow circles traveling along routes) */}
              <circle r="4" fill="#F59E0B">
                <animateMotion 
                  path="M 280 270 Q 210 200 160 180" 
                  dur="6s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <circle r="4" fill="#3B82F6">
                <animateMotion 
                  path="M 280 270 C 200 290 120 280 80 220" 
                  dur="9s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <circle r="4" fill="#10B981">
                <animateMotion 
                  path="M 280 270 Q 350 330 390 380" 
                  dur="8s" 
                  repeatCount="indefinite" 
                />
              </circle>

              {/* Gradient Definitions */}
              <defs>
                <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                  <stop offset="0%" stopColor="#0a2266" />
                  <stop offset="70%" stopColor="#040e30" />
                  <stop offset="100%" stopColor="#02081c" />
                </radialGradient>
                <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>
      </section>

      {/* CHAPTER 2: THE PROBLEM (Chaos to Order) */}
      <section 
        id="problem-chapter"
        ref={chaosSectionRef} 
        className="min-h-screen py-24 px-6 relative flex flex-col justify-center border-t border-brand-border/40"
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Problem Copy */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 relative z-20">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Chapter 2: The Friction</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight">
              Export is complex. Chaos is inevitable.
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base leading-relaxed">
              Unlinked GST filings, missing IEC licenses, expired RCMC credentials, unformatted spreadsheets, and chaotic WhatsApp negotiations. When data is scattered, delays compound.
            </p>
            <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl">
              <p className="text-xs text-brand-textLight font-medium">
                Scroll to see how EXIMARG seamlessly coordinates document verification, structured compliance, and client orders into a unified system.
              </p>
            </div>
          </div>

          {/* Animation Interactive Panel */}
          <div className="lg:col-span-7 h-[450px] relative flex items-center justify-center">
            
            {/* Chaotic documents dispersed around (fly together on scroll) */}
            <div 
              ref={el => chaosCardRefs.current[0] = el}
              className="chaos-element absolute p-4 bg-red-950/40 border border-red-500/30 rounded-2xl shadow-xl w-60 z-30 transform -rotate-12 -translate-x-32 -translate-y-36 opacity-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <Warning className="text-red-400" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-300">Compliance Alert</span>
              </div>
              <p className="text-xs text-red-200">IEC Registration incomplete or mismatched PAN credentials.</p>
            </div>

            <div 
              ref={el => chaosCardRefs.current[1] = el}
              className="chaos-element absolute p-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl shadow-xl w-56 z-30 transform rotate-6 translate-x-36 -translate-y-28 opacity-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-slate-400" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Spreadsheet.xlsx</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Row 42: Error code #REF! in FOB calculation.</p>
            </div>

            <div 
              ref={el => chaosCardRefs.current[2] = el}
              className="chaos-element absolute p-4 bg-[#0a2f1d]/50 border border-green-500/30 rounded-2xl shadow-xl w-64 z-30 transform -rotate-6 -translate-x-28 translate-y-32 opacity-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <WhatsappLogo className="text-green-400" size={18} />
                <span className="text-[10px] font-bold text-green-300 uppercase">WhatsApp Buyer</span>
              </div>
              <p className="text-xs text-green-100">"Please resend packing lists with weight specifications."</p>
            </div>

            <div 
              ref={el => chaosCardRefs.current[3] = el}
              className="chaos-element absolute p-4 bg-brand-surface border border-brand-border rounded-2xl shadow-xl w-52 z-30 transform rotate-12 translate-x-32 translate-y-24 opacity-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-yellow-500">GST Registration</span>
              </div>
              <p className="text-[11px] text-brand-textMuted">RCMC application pending renewal authorization.</p>
            </div>

            {/* Central Unified Ordered Card */}
            <div 
              ref={orderCardRef} 
              className="absolute p-8 bg-[#041138]/90 border border-brand-primary/30 rounded-3xl w-full max-w-[400px] z-10 shadow-2xl transition-all duration-300 backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                    <Sparkle size={18} className="text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">EXIMARG Hub</h4>
                    <p className="text-[9px] text-brand-textMuted">Unified Compliance Status</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
                  Order Restored
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-brand-bg/50 rounded-xl border border-brand-border">
                  <span className="text-xs font-semibold text-brand-textLight">IEC Code API Check</span>
                  <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                    <Check size={12} />
                    Verified
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-brand-bg/50 rounded-xl border border-brand-border">
                  <span className="text-xs font-semibold text-brand-textLight">GSTIN Integration</span>
                  <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                    <Check size={12} />
                    Synced
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-brand-bg/50 rounded-xl border border-brand-border">
                  <span className="text-xs font-semibold text-brand-textLight">RCMC Status Ledger</span>
                  <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                    <Check size={12} />
                    Active
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CHAPTER 3: THE JOURNEY (Duolingo Timeline) */}
      <section 
        ref={journeySectionRef} 
        className="py-24 px-6 relative border-t border-brand-border/40 min-h-screen"
      >
        <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Chapter 3: The Path</span>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3">
            Your Roadmap to Global Trade
          </h2>
          <p className="text-brand-textMuted text-sm md:text-base mt-4 max-w-xl mx-auto">
            Scroll down to advance your exporter journey. Earn XP and unlock milestones as you complete essential regulatory and trade setup tasks.
          </p>
        </div>

        {/* Milestone Vertical Path Container */}
        <div className="max-w-2xl mx-auto relative pt-12 pb-32">
          
          {/* Background Path Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-brand-border" />
          
          {/* Animated Path Line Fill */}
          <div 
            ref={timelineProgressRef}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-1 bg-gradient-to-b from-brand-primary via-indigo-500 to-brand-accent transition-all duration-300 ease-out"
            style={{ height: '0%' }}
          />

          {/* Milestones list */}
          <div className="relative space-y-16">
            {milestones.map((milestone, idx) => {
              const IconComp = milestone.icon;
              const isActive = idx <= activeMilestoneIndex;
              const isCurrent = idx === activeMilestoneIndex;

              return (
                <div 
                  key={milestone.id}
                  className={`flex flex-col md:flex-row items-center gap-6 relative z-10 ${
                    idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Spacer */}
                  <div className="flex-1 hidden md:block" />

                  {/* Milestone Center Circle Node */}
                  <div className="relative">
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                        isCurrent 
                          ? 'bg-gradient-to-tr from-brand-primary to-brand-accent border-white scale-110 shadow-lg shadow-brand-primary/50' 
                          : isActive 
                            ? 'bg-[#041138] border-brand-primary text-brand-primary shadow-md' 
                            : 'bg-brand-bg border-brand-border text-brand-textMuted'
                      }`}
                    >
                      <IconComp size={22} className={isCurrent ? 'text-white animate-pulse' : ''} />
                    </div>
                    {isCurrent && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-500 text-black text-[9px] font-black flex items-center justify-center animate-bounce">
                        ★
                      </span>
                    )}
                  </div>

                  {/* Milestone card content description */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className={`p-5 rounded-2xl border transition-all duration-500 glass-panel ${
                      isCurrent 
                        ? 'border-brand-primary/50 shadow-xl' 
                        : isActive 
                          ? 'border-brand-border/80' 
                          : 'opacity-40 border-transparent'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-display font-bold text-sm text-white">{milestone.title}</h4>
                        <span className="text-[10px] text-yellow-400 font-extrabold bg-yellow-400/10 px-2 py-0.5 rounded-full">
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

      {/* CHAPTER 4: MEET YOUR AI EXPORT CONSULTANT */}
      <section 
        id="ai-chapter"
        className="min-h-screen py-24 px-6 relative border-t border-brand-border/40 flex flex-col justify-center"
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* AI Info & Active Mockup */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Chapter 4: The Assistant</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight">
              Meet Your AI Export Consultant
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base leading-relaxed">
              Quietly sitting beside you. Translating complex customs declarations, drafting polished replies to international queries, and searching global trade codes in real-time.
            </p>

            {/* Simulated Live Chat Console */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-accent/20 relative overflow-hidden bg-brand-bg/85 min-h-[180px] flex flex-col justify-between">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent">AI Advisor Online</span>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-2">
                <p className="text-xs text-brand-textMuted font-mono">
                  &gt; Select an export query card to see my mentorship in action.
                </p>
                <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                  <p className="text-xs font-semibold text-white" id="ai-active-output">
                    "I am ready to help you with HSN lookups, buyer response optimization, and custom regulatory explanations. Click any prompt."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Cards Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { 
                title: 'Suggest HSN Code', 
                desc: 'Instantly map target commodities to international trade categories.',
                prompt: 'Analyzing cargo description: "Handcrafted Brass Vases". Suggested HSN Code: 7419.80.30. Export duty: 0%, Drawback rate: 1.5%.' 
              },
              { 
                title: 'Improve Buyer Reply', 
                desc: 'Generate trade-compliant business correspondence automatically.',
                prompt: 'Drafting reply to Hamburg distributor: "Dear Hans, the CIF prices for organic tea samples have been updated. Standard delivery lead time is 18 days..."'
              },
              { 
                title: 'Explain Export Rules', 
                desc: 'Translate government compliance and APEDA guidelines.',
                prompt: 'Regulatory match: Non-Basmati rice requires APEDA export registration. IEC must be mapped to DGFT portal prior to shipping.'
              },
              { 
                title: 'Generate Invoice', 
                desc: 'Auto-format shipping invoices, packing lists, and drafts.',
                prompt: 'Commercial invoice created successfully. Auto-calculated FOB values: $14,250. Custom packing specifications linked.'
              }
            ].map((card, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  const outEl = document.getElementById('ai-active-output');
                  if (outEl) outEl.innerText = `"${card.prompt}"`;
                }}
                className="glass-panel p-6 rounded-2xl border border-brand-border hover:border-brand-accent/40 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                <h4 className="font-display font-bold text-sm text-white mb-2">{card.title}</h4>
                <p className="text-xs text-brand-textMuted leading-relaxed">{card.desc}</p>
                <span className="text-[10px] text-brand-accent font-bold mt-3 block">Try Prompt &rarr;</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CHAPTER 5: DIGITAL DUKAN (Self-Building Storefront) */}
      <section 
        id="dukan-chapter"
        className="min-h-screen py-24 px-6 relative border-t border-brand-border/40 flex flex-col justify-center bg-brand-bg/25"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Chapter 5: The Storefront</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3">
              Your Digital Dukan builds itself
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-3">
              Watch your inventory arrange itself into a localized, international B2B storefront designed for wholesale buyers.
            </p>
          </div>

          {/* Product Cards Show */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Premium Basmati Rice', 
                hsn: '1006.30.20', 
                moq: '15 Metric Tons', 
                price: '$1,250 / Ton', 
                tag: 'Organic Certified', 
                grad: 'from-amber-500/25 to-transparent' 
              },
              { 
                title: 'Handwoven Silk Rugs', 
                hsn: '5701.10.00', 
                moq: '50 Units', 
                price: '$240 / Unit', 
                tag: 'GI Tagged', 
                grad: 'from-blue-500/25 to-transparent' 
              },
              { 
                title: 'Artisanal Brassware', 
                hsn: '7419.80.30', 
                moq: '100 Units', 
                price: '$45 / Unit', 
                tag: 'Quality Assured', 
                grad: 'from-purple-500/25 to-transparent' 
              }
            ].map((prod, idx) => (
              <div 
                key={idx}
                className="glass-panel rounded-3xl overflow-hidden border border-brand-border hover:border-brand-primary/30 transition-all duration-500 flex flex-col justify-between"
              >
                {/* Image Placeholder area */}
                <div className={`h-48 bg-gradient-to-tr ${prod.grad} flex items-center justify-center p-6 border-b border-brand-border relative`}>
                  <div className="absolute top-4 right-4 px-2 py-1 bg-[#041138]/80 text-yellow-400 text-[9px] font-extrabold rounded-full uppercase border border-yellow-400/20">
                    {prod.tag}
                  </div>
                  <Globe className="text-brand-textMuted/20" size={80} />
                </div>
                
                {/* Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] text-brand-textMuted font-mono">HSN CODE {prod.hsn}</span>
                    <h3 className="font-display font-bold text-lg text-white mt-1">{prod.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-brand-border/40 pt-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-brand-textMuted">Minimum Order</p>
                      <p className="text-xs font-bold text-white mt-0.5">{prod.moq}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-brand-textMuted">FOB Price</p>
                      <p className="text-xs font-bold text-green-400 mt-0.5">{prod.price}</p>
                    </div>
                  </div>
                </div>

                {/* Footer badge */}
                <div className="px-6 py-4 bg-[#041138]/60 border-t border-brand-border flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-textMuted flex items-center gap-1">
                    <Check size={12} className="text-brand-primary" /> Verified Exim Store
                  </span>
                  <span className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer">Inquire Now &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER 6: YOUR FIRST BUYER */}
      <section 
        id="buyer-chapter"
        className="min-h-screen py-24 px-6 relative border-t border-brand-border/40 flex flex-col justify-center bg-brand-bg/5"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Chapter 6: The Transaction</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3">
              Watch Your First Export Happen
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-3">
              Follow the journey of a shipment from India to Hamburg, Germany. Step through the exporter lifecycle.
            </p>
          </div>

          {/* Interactive Stepper Control */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Steps Left List */}
            <div className="lg:col-span-4 space-y-4">
              {[
                { step: 1, title: 'Inquiry Arrives', desc: 'Buyer in Hamburg requests Basmati Rice quotation.' },
                { step: 2, title: 'AI Recommendation', desc: 'System drafts response & suggests pricing structures.' },
                { step: 3, title: 'Invoice Generated', desc: 'Draft compliant commercial packing list & invoice.' },
                { step: 4, title: 'Payment Secured', desc: 'Escrow payment processed & customs clearance authorized.' },
                { step: 5, title: 'Vessel Departs', desc: 'Container leaves India from Nhava Sheva port.' }
              ].map((s, idx) => {
                const [activeStep, setActiveStep] = useState(1);
                return (
                  <div 
                    key={idx}
                    id={`step-btn-${s.step}`}
                    onClick={() => {
                      // Custom click behavior to update step state
                      const outEl = document.getElementById('step-visualizer-card');
                      const descEl = document.getElementById('step-visualizer-desc');
                      const titleEl = document.getElementById('step-visualizer-title');
                      const badgeEl = document.getElementById('step-visualizer-badge');
                      if (outEl && descEl && titleEl && badgeEl) {
                        titleEl.innerText = s.title;
                        descEl.innerText = s.desc;
                        badgeEl.innerText = `STAGE 0${s.step}`;
                        // Remove active class styling from others, add to clicked
                        document.querySelectorAll('.step-trigger-btn').forEach(btn => {
                          btn.classList.remove('border-brand-primary', 'bg-brand-primary/10');
                          btn.classList.add('border-brand-border');
                        });
                        const btn = document.getElementById(`step-btn-${s.step}`);
                        if (btn) {
                          btn.classList.remove('border-brand-border');
                          btn.classList.add('border-brand-primary', 'bg-brand-primary/10');
                        }
                      }
                    }}
                    className={`step-trigger-btn p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      s.step === 1 ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-bg border border-brand-border text-xs font-bold flex items-center justify-center text-brand-textMuted">
                        {s.step}
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">{s.title}</h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visualizer Right Panel */}
            <div className="lg:col-span-8 flex items-center justify-center">
              <div 
                id="step-visualizer-card"
                className="w-full max-w-xl p-8 bg-[#041138]/90 border border-brand-primary/20 rounded-3xl shadow-2xl relative overflow-hidden min-h-[320px] flex flex-col justify-between"
              >
                {/* Header detail */}
                <div className="flex items-center justify-between border-b border-brand-border pb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="text-brand-accent animate-spin-slow" size={20} />
                    <span className="text-[10px] font-extrabold text-brand-textMuted uppercase tracking-widest" id="step-visualizer-badge">
                      STAGE 01
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] font-extrabold rounded-full uppercase border border-green-500/25">
                    Live Story
                  </span>
                </div>

                {/* Body details */}
                <div className="my-6 space-y-4">
                  <h3 className="font-display font-extrabold text-xl text-white" id="step-visualizer-title">
                    Inquiry Arrives
                  </h3>
                  <p className="text-sm text-brand-textMuted leading-relaxed" id="step-visualizer-desc">
                    Buyer in Hamburg requests Basmati Rice quotation. Click on any step on the left to watch the export progress.
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-brand-textMuted">EXIMARG Logistics Tracker</span>
                  <button 
                    onClick={() => navigate('/register')}
                    className="text-xs text-brand-primary font-bold hover:underline"
                  >
                    Simulate Your Trade &rarr;
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CHAPTER 7: COMMAND CENTER (Dashboard Reveal) */}
      <section 
        id="dashboard-chapter"
        className="min-h-screen py-24 px-6 relative border-t border-brand-border/40 flex flex-col justify-center bg-[#020718]"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Chapter 7: The Reward</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3">
              Your Export Command Center
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-3">
              Unlock a unified dashboard built to scale B2B global trades. Inspired by Stripe, engineered for exporters.
            </p>
          </div>

          {/* Stripe-style dashboard mockup */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-brand-border shadow-2xl space-y-6">
            
            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-white uppercase tracking-wider">EXIMARG CMD</span>
                <span className="px-2 py-0.5 bg-brand-primary/15 text-brand-primary text-[9px] font-extrabold rounded-md uppercase">
                  Production Mode
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-brand-textMuted">All Systems Synced</span>
              </div>
            </div>

            {/* Dashboard Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profile Card */}
              <div className="p-5 bg-brand-bg/50 border border-brand-border rounded-2xl space-y-3">
                <p className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Company Identity</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">IEC Code status</span>
                    <span className="text-green-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">GSTIN Link</span>
                    <span className="text-green-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">APEDA Profile</span>
                    <span className="text-green-400 font-bold">COMPLETE</span>
                  </div>
                </div>
              </div>

              {/* Order Flow Tracker */}
              <div className="p-5 bg-brand-bg/50 border border-brand-border rounded-2xl space-y-3">
                <p className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Active Shipments</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">Order #9402</span>
                    <span className="text-brand-accent font-bold">EN ROUTE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">Destination</span>
                    <span className="text-white font-bold">Hamburg, DE</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">ETA Port</span>
                    <span className="text-white font-bold">July 18, 2026</span>
                  </div>
                </div>
              </div>

              {/* Financial Ledger */}
              <div className="p-5 bg-brand-bg/50 border border-brand-border rounded-2xl space-y-3">
                <p className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Financial Overview</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">Total Volume</span>
                    <span className="text-white font-black">$14,250 USD</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">Duty Drawback</span>
                    <span className="text-green-400 font-bold">₹12,400 Claimed</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted">Escrow Status</span>
                    <span className="text-green-400 font-bold">RELEASED</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* CHAPTER 8: GLOBAL REACH */}
      <section 
        id="reach-chapter"
        className="min-h-screen py-24 px-6 relative border-t border-brand-border/40 flex flex-col justify-center bg-brand-bg/10"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Chapter 8: The Expansion</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3">
              Your Global Footprint
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-3">
              Hover over destination regions to see products, shipment volumes, and active trade routes originating from India.
            </p>
          </div>

          {/* Interactive World Map SVG */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-brand-border relative overflow-hidden flex flex-col items-center justify-center">
            
            {/* Country highlights detail info */}
            <div className="absolute top-6 left-6 p-4 bg-[#030a21]/90 border border-brand-primary/20 rounded-2xl max-w-xs z-20">
              <p className="text-[9px] uppercase tracking-wider text-brand-textMuted">Destination Highlight</p>
              <h4 className="font-display font-bold text-sm text-white mt-0.5" id="map-country-name">Hover a Country</h4>
              <p className="text-xs text-brand-accent font-semibold mt-1" id="map-country-desc">Select any glowing marker on the map.</p>
            </div>

            <svg viewBox="0 0 1000 450" className="w-full h-auto max-w-[850px] opacity-90">
              {/* Simplified world silhouette map */}
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

              {/* Germany (Europe) */}
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

              {/* UAE (Middle East) */}
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
              <text x="630" y="212" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle">INDIA</text>

              {/* Connective Paths from India source */}
              <path d="M 630 230 C 580 200 280 180 200 180" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
              <path d="M 630 230 Q 570 180 510 140" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
              <path d="M 630 230 Q 600 220 580 210" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
              <path d="M 630 230 Q 680 260 740 290" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 3" />
            </svg>
          </div>
        </div>
      </section>

      {/* CHAPTER 9: EXPORTER STORIES */}
      <section 
        id="stories-chapter"
        className="min-h-screen py-24 px-6 relative border-t border-brand-border/40 flex flex-col justify-center bg-brand-bg/5"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Chapter 9: The Proof</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mt-3">
              Transformation Stories
            </h2>
            <p className="text-brand-textMuted text-sm md:text-base mt-3">
              See how authentic exporters completed their milestones and scaled from zero to massive global shipment volumes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Rajesh Kumar', 
                industry: 'Textiles (Surat)', 
                desc: 'Scaled artisan fabric sales to European boutique chains.',
                milestones: ['Identity Verified', 'Digital Store Built', '1st Hamburg Buyer', '120 Shipments Completed']
              },
              { 
                name: 'Priya Sharma', 
                industry: 'Organic Spices (Cochin)', 
                desc: 'Synchronized agricultural customs approvals via automated invoices.',
                milestones: ['IEC Auto-Checked', 'APEDA Registered', 'US Buyer Found', '85 Shipments Completed']
              },
              { 
                name: 'Amit Patel', 
                industry: 'Brass Artware (Moradabad)', 
                desc: 'Automated FOB pricing grids to capture Middle East wholesale deals.',
                milestones: ['Entity Setup', 'Dukan Catalog Live', 'UAE Escrow Clear', '210 Shipments Completed']
              }
            ].map((story, idx) => (
              <div 
                key={idx}
                className="glass-panel p-6 rounded-3xl border border-brand-border hover:border-brand-primary/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-extrabold text-lg text-white">{story.name}</h4>
                    <span className="text-[10px] text-brand-primary font-bold">{story.industry}</span>
                  </div>
                  <p className="text-xs text-brand-textMuted leading-relaxed">{story.desc}</p>
                </div>

                <div className="border-t border-brand-border/40 pt-4 mt-6 space-y-3">
                  <p className="text-[9px] uppercase tracking-wider text-brand-textMuted font-bold">Transformation Path</p>
                  <div className="space-y-2">
                    {story.milestones.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-2 text-[10px] text-white">
                        <Check size={12} className="text-brand-primary" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER 10: FINAL SCENE */}
      <section 
        id="final-chapter"
        className="min-h-screen py-32 px-6 relative border-t border-brand-border/40 flex flex-col justify-center bg-[#020512] overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-brand-primary/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Chapter 10: The Launch</span>
          
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
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-brand-primary/30 flex items-center justify-center gap-2 group"
            >
              Start Your Onboarding Quest
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Cinematic cargo ship vector graphic */}
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

        {/* Global Footer inside Chapter 10 */}
        <footer className="absolute bottom-6 left-6 right-6 text-center text-xs text-brand-textMuted border-t border-brand-border/20 pt-6">
          <p>© 2026 EXIMARG. Built for elite exporters scaling globally.</p>
        </footer>
      </section>

      {/* Floating Gamification HUD / Readiness Meter */}
      <div className="fixed bottom-6 right-6 z-40 max-w-sm w-fit pointer-events-none">
        <div className="pointer-events-auto bg-[#041138]/95 border border-brand-border p-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-md">
          {/* Readiness Circle Progress Meter */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                fill="transparent" 
                stroke="#2563EB" 
                strokeWidth="4" 
                strokeDasharray={`${2 * Math.PI * 20}`} 
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - readinessPercentage / 100)}`}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-white">{readinessPercentage}%</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-textMuted">Readiness Index</span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5">{earnedXP} XP Accumulated</p>
          </div>
        </div>
      </div>

      {/* Floating Unlock Toast Notification */}
      <AnimatePresence>
        {recentNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-40 bg-gradient-to-r from-brand-primary to-brand-accent p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-white/80">Milestone Unlocked!</p>
              <h5 className="text-xs font-extrabold text-white">{recentNotification.title}</h5>
              <p className="text-[10px] text-yellow-300 font-bold">Badge: {recentNotification.badge} (+{recentNotification.xp} XP)</p>
            </div>
            <button 
              onClick={() => setRecentNotification(null)}
              className="text-white/60 hover:text-white ml-2 pointer-events-auto"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Embedded Styles for Custom SVG/Motion Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
        .animate-route {
          stroke-dasharray: 8 4;
          animation: dash 3s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
