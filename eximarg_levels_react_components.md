# EXIMARG 7 Levels React Components

This document contains the clean, modularized React component code for all 7 levels of the EXIMARG Export Operating System. You can copy these code snippets directly to import or use them in your Stitch project.

---

## Level 1: Identity Verification
```jsx
import React, { useState } from 'react';
import { Fingerprint, CreditCard, Sparkle, CloudArrowUp, ShieldCheck, SealCheck, Gauge, Lightbulb, Lock, Check } from '@phosphor-icons/react';

export function Level1Identity({ onSubmit, onAskAI, defaultEmail = '' }) {
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panFront, setPanFront] = useState(null);

  const handleBase64Upload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAadhaarFrontChange = (e) => {
    const file = e.target.files[0];
    if (file) handleBase64Upload(file, setAadhaarFront);
  };

  const handleAadhaarBackChange = (e) => {
    const file = e.target.files[0];
    if (file) handleBase64Upload(file, setAadhaarBack);
  };

  const handlePanFrontChange = (e) => {
    const file = e.target.files[0];
    if (file) handleBase64Upload(file, setPanFront);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Level 1: Identity Verification</h1>
          <p className="text-on-surface-variant text-sm mt-1">Securely verify your personal identity to begin your export journey.</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-white font-bold uppercase tracking-wider">1/4 COMPLETE</span>
          <div className="flex gap-1.5 mt-2">
            <div className="h-1.5 w-6 bg-primary rounded-full"></div>
            <div className="h-1.5 w-6 bg-white/10 rounded-full"></div>
            <div className="h-1.5 w-6 bg-white/10 rounded-full"></div>
            <div className="h-1.5 w-6 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Aadhaar */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Aadhaar Card</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Front and back images required (JPEG/PNG, max 5MB)</p>
                </div>
              </div>
              <button onClick={onAskAI} className="px-4 py-1.5 bg-white/5 border border-white/10 text-xs text-on-surface font-semibold rounded-lg flex items-center gap-1.5 transition-all">
                <Sparkle size={14} className="text-primary animate-pulse" /> Ask AI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[160px]">
                <input type="file" accept="image/*" onChange={handleAadhaarFrontChange} className="hidden" />
                {aadhaarFront ? (
                  <>
                    <img src={aadhaarFront} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <Check size={28} className="text-green-400 z-10" />
                    <span className="text-xs font-semibold text-white mt-1 z-10">Front Side Loaded</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUp size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    <span className="block text-xs font-bold text-white">Upload Front Side</span>
                  </>
                )}
              </label>

              <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[160px]">
                <input type="file" accept="image/*" onChange={handleAadhaarBackChange} className="hidden" />
                {aadhaarBack ? (
                  <>
                    <img src={aadhaarBack} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <Check size={28} className="text-green-400 z-10" />
                    <span className="text-xs font-semibold text-white mt-1 z-10">Back Side Loaded</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUp size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    <span className="block text-xs font-bold text-white">Upload Back Side</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* PAN */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">PAN Card</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Front side scan clearly showing PAN number</p>
                </div>
              </div>
              <button onClick={onAskAI} className="px-4 py-1.5 bg-white/5 border border-white/10 text-xs text-on-surface font-semibold rounded-lg flex items-center gap-1.5 transition-all">
                <Sparkle size={14} className="text-primary animate-pulse" /> Ask AI
              </button>
            </div>

            <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[160px]">
              <input type="file" accept="image/*" onChange={handlePanFrontChange} className="hidden" />
              {panFront ? (
                <>
                  <img src={panFront} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  <Check size={28} className="text-green-400 z-10" />
                  <span className="text-xs font-semibold text-white mt-1 z-10">PAN Front Loaded</span>
                </>
              ) : (
                <>
                  <CloudArrowUp size={36} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  <span className="block text-xs font-bold text-white">Upload PAN Card Front</span>
                </>
              )}
            </label>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <Lock size={16} /> End-to-end encrypted verification
            </div>
            <button onClick={() => onSubmit({ aadhaarFront, aadhaarBack, panFront })} className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all">
              Submit for Verification
            </button>
          </div>
        </div>

        {/* Right Info panels */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
            <h4 className="font-bold text-sm text-white">Why this matters</h4>
            <div className="space-y-5">
              <div className="flex gap-3">
                <ShieldCheck size={22} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-xs">KYC Compliance</p>
                  <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">Mandatory per DGFT and RBI guidelines for all Indian export entities.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <SealCheck size={22} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-xs">Trusted Seller Badge</p>
                  <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">Verified identities receive higher trust scores in the global marketplace.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Gauge size={22} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-xs">Faster Processing</p>
                  <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">OCR-assisted verification typically takes less than 2 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Level 2: Exporter Profile
```jsx
import React, { useState } from 'react';
import { 
  Building, TShirt, Leaf, Flask, Rocket, Waves, Globe, MapPin, Question, Check, Gear 
} from '@phosphor-icons/react';

export function Level2Exporter({ onSubmit, defaultData = {} }) {
  const [primaryIndustry, setPrimaryIndustry] = useState(defaultData.primary_industry || 'Engineering');
  const [exportExperience, setExportExperience] = useState(defaultData.export_experience || '1-3 Years');
  const [targetRegions, setTargetRegions] = useState(defaultData.target_regions || ['North America', 'European Union']);

  const handleSave = () => {
    onSubmit({
      primary_industry: primaryIndustry,
      export_experience: exportExperience,
      target_regions: targetRegions,
      exporter_type: defaultData.exporter_type || 'Merchant',
      business_model: defaultData.business_model || 'B2B',
      export_intent: defaultData.export_intent || `${primaryIndustry} Export Focus`,
      shipments_range: defaultData.shipments_range || '0-10',
      registration_date: defaultData.registration_date || new Date().toISOString().split('T')[0],
      operating_since: defaultData.operating_since || '2026'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
          Quest Step 02
        </span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">Refine Your Exporter DNA</h1>
        <p className="text-on-surface-variant text-sm max-w-2xl mx-auto font-medium">
          Help us calibrate your Export Command Center by selecting your industry expertise and operational scale.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Progress Card */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">Your Progress</h4>
            
            <div className="space-y-4">
              {/* Identity (Completed) */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <Check size={14} />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Identity</p>
                  <p className="text-[10px] text-green-400">Completed</p>
                </div>
              </div>

              {/* Exporter Profile (In Progress) */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-primary text-primary flex items-center justify-center text-xs font-bold animate-pulse">
                  02
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Exporter Profile</p>
                  <p className="text-[10px] text-primary">In Progress</p>
                </div>
              </div>

              {/* Market Strategy (Upcoming) */}
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-6 h-6 rounded-full bg-surface-container-low border border-white/10 text-on-surface-variant flex items-center justify-center text-xs font-bold">
                  03
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Market Strategy</p>
                  <p className="text-[10px] text-on-surface-variant">Upcoming</p>
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1">
                <span>XP Earned</span>
                <span>450 / 1000</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Content: Interactive Options */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Primary Industry */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Building size={18} className="text-primary" />
              Primary Industry
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'Textiles', label: 'Textiles', icon: TShirt },
                { id: 'Agri-Products', label: 'Agri-Products', icon: Leaf },
                { id: 'Engineering', label: 'Engineering', icon: Gear },
                { id: 'Chemicals', label: 'Chemicals', icon: Flask }
              ].map((ind) => {
                const Icon = ind.icon;
                const isSel = primaryIndustry === ind.id;
                return (
                  <div 
                    key={ind.id}
                    onClick={() => setPrimaryIndustry(ind.id)}
                    className={`glass-card p-6 rounded-2xl border cursor-pointer flex flex-col items-center justify-center gap-3 text-center transition-all ${
                      isSel ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-white/5 bg-surface-container-low hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSel ? 'bg-primary/25 text-white' : 'bg-white/5 text-on-surface-variant'
                    }`}>
                      <Icon size={24} />
                    </div>
                    <span className={`text-xs font-bold ${isSel ? 'text-white' : 'text-on-surface-variant'}`}>{ind.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Experience */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Rocket size={18} className="text-primary" />
              Export Experience
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'New Exporter', label: 'New Exporter', desc: 'Just starting the journey. Ready to learn the ropes of global trade.', icon: Rocket },
                { id: '1-3 Years', label: '1-3 Years', desc: 'Established domestic player scaling to international horizons.', icon: Waves },
                { id: '5+ Years', label: '5+ Years', desc: 'High-volume veteran looking for velocity and optimization.', icon: Globe }
              ].map((exp) => {
                const Icon = exp.icon;
                const isSel = exportExperience === exp.id;
                return (
                  <div 
                    key={exp.id}
                    onClick={() => setExportExperience(exp.id)}
                    className={`glass-card p-6 rounded-2xl border cursor-pointer flex flex-col gap-3 transition-all ${
                      isSel ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]' : 'border-white/5 bg-surface-container-low hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSel ? 'bg-primary/20 text-white' : 'bg-white/5 text-on-surface-variant'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isSel ? 'text-white' : 'text-on-surface-variant'}`}>{exp.label}</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{exp.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Markets */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              Target Markets
            </h3>

            <div className="glass-card rounded-2xl border border-white/5 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span className="block text-xs font-bold text-on-surface-variant">Select Regions</span>
                <div className="flex flex-wrap gap-2">
                  {targetRegions.map((region) => (
                    <div key={region} className="px-3 py-1.5 bg-[#031037] border border-white/10 rounded-full text-xs font-semibold text-white flex items-center gap-2">
                      <span>{region}</span>
                      <button 
                        type="button"
                        onClick={() => setTargetRegions(targetRegions.filter(r => r !== region))}
                        className="text-on-surface-variant hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      const newReg = prompt('Enter a target region (e.g. Middle East, Latin America):');
                      if (newReg) setTargetRegions([...targetRegions, newReg]);
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs font-semibold text-white flex items-center gap-1.5"
                  >
                    + Add Region
                  </button>
                </div>
              </div>

              {/* Global corridor active graphic panel */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-[#031037]/80 border border-white/10 flex items-center justify-center p-4">
                <div className="w-full h-full border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="absolute inset-0 opacity-10 flex flex-wrap gap-1 p-2 justify-center">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-white rounded-full"></div>
                    ))}
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <MapPin size={24} className="text-primary animate-bounce" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 bg-[#000a31]/90 px-3 py-1 rounded-full border border-white/10">
                      GLOBAL CORRIDOR ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-medium">
              <Question size={14} />
              You can always update these preferences later in Settings.
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-primary-container to-blue-600 hover:opacity-90 text-white font-bold rounded-full text-xs flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                Continue Quest →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
```

---

## Level 3: Business Verification
```jsx
import React, { useState } from 'react';
import { 
  Building, Globe, Files, FileArrowUp, CreditCard, ArrowRight, ShieldCheck, Check, Trophy, SealCheck, Sparkle, Lightning, CloudArrowUp
} from '@phosphor-icons/react';

export function Level3Verification({ onSubmit, defaultData = {} }) {
  const [gst, setGst] = useState(defaultData.gst || '');
  const [cin, setCin] = useState(defaultData.cin || '');
  const [iec, setIec] = useState(defaultData.iec || '');
  const [ifsc, setIfsc] = useState(defaultData.ifsc || '');
  const [adCode, setAdCode] = useState(defaultData.ad_code || '');
  const [rcmc, setRcmc] = useState(defaultData.rcmc || '');
  const [apedaFssai, setApedaFssai] = useState(defaultData.apeda_fssai || '');
  const [addressProof, setAddressProof] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);

  const handleBase64Upload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAutoFill = () => {
    setGst('22AAAAA0000A1ZS');
    setCin('U74140DL2026PTC');
    setIec('1234567890');
    setIfsc('HDFC0000001');
    setAdCode('AD123456');
    setRcmc('RCMC123456');
    setApedaFssai('APEDA123456');
    setAddressProof('mock_gst_certificate_base64');
    setBankStatement('mock_bank_statement_base64');
  };

  const handleSave = () => {
    onSubmit({
      gst,
      cin,
      iec,
      ifsc,
      ad_code: adCode,
      rcmc,
      apeda_fssai: apedaFssai,
      address_proof: addressProof,
      bank_statement: bankStatement
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Level 3: Business Verification</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Complete your corporate compliance profile to unlock global trading capabilities and earn your verified status.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#000a31]/60 px-4 py-2 rounded-xl border border-white/5">
          <ShieldCheck size={18} className="text-primary" />
          <span className="text-xs text-white font-bold uppercase tracking-wider">3/6 COMPLETE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Center Content: Verification Cards */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* GST Registration Card */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">GST Registration</h3>
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold uppercase tracking-wider rounded-full">
                      Ready
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Provide your Goods and Services Tax identification number for tax compliance.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                  placeholder="Enter GSTIN (e.g., 22AAAAA0000A1ZS)"
                />
              </div>
              <button 
                type="button"
                onClick={handleAutoFill}
                className="px-4 py-3 bg-[#0c1940] hover:bg-[#12245c] text-primary hover:text-white border border-primary/20 hover:border-primary/50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0"
              >
                <Lightning size={14} className="animate-pulse" />
                Auto-fill
              </button>
            </div>

            {/* GST Upload & Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[140px]">
                <input 
                  type="file" 
                  onChange={(e) => handleBase64Upload(e.target.files[0], setAddressProof)} 
                  className="hidden" 
                />
                {addressProof ? (
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <Check size={28} className="text-green-400" />
                    <span className="text-xs font-semibold text-white mt-1">GST Certificate Loaded</span>
                  </div>
                ) : (
                  <>
                    <CloudArrowUp size={28} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    <div className="text-center">
                      <span className="block text-xs font-bold text-white">Upload Certificate</span>
                      <span className="block text-[10px] text-on-surface-variant mt-1">PDF, JPG up to 5MB</span>
                    </div>
                  </>
                )}
              </label>

              {/* Mock certificate visual preview container */}
              <div className="relative rounded-xl overflow-hidden bg-[#031037]/80 border border-white/10 flex items-center justify-center p-2 h-[140px]">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-transparent border border-white/5 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="w-12 h-2 bg-white/20 rounded"></div>
                      <div className="w-8 h-1 bg-white/10 rounded"></div>
                    </div>
                    <ShieldCheck size={16} className="text-primary" />
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between items-center text-[8px] text-on-surface-variant">
                    <span>REGISTRATION CERTIFICATE</span>
                    <span className="text-green-400 font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Import Export Code (IEC) Card */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Globe size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Import Export Code (IEC)</h3>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Your primary identification for international trade operations.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={iec}
                onChange={(e) => setIec(e.target.value)}
                className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                placeholder="10-digit IEC Code (e.g. 1234567890)"
              />
            </div>

            <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[120px]">
              <input 
                type="file" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleBase64Upload(file, (base64) => {
                      setIec(iec || '1234567890');
                    });
                  }
                }} 
                className="hidden" 
              />
              <Files size={28} className="text-on-surface-variant group-hover:text-primary transition-colors" />
              <div className="text-center">
                <span className="block text-xs font-bold text-white">Drop IEC Document Here</span>
                <span className="block text-[10px] text-on-surface-variant mt-1">or click to browse from your device</span>
              </div>
            </label>
          </div>

          {/* Udyam Certificate Card */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Udyam Certificate</h3>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">MSME registration to unlock government benefits and priority support.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={apedaFssai}
                onChange={(e) => setApedaFssai(e.target.value)}
                className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                placeholder="Udyam Registration Number"
              />
            </div>

            <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[120px]">
              <input 
                type="file" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleBase64Upload(file, (base64) => {});
                  }
                }} 
                className="hidden" 
              />
              <FileArrowUp size={28} className="text-on-surface-variant group-hover:text-primary transition-colors" />
              <div className="text-center">
                <span className="block text-xs font-bold text-white">Upload Certificate</span>
              </div>
            </label>
          </div>

          {/* Collapsible Card: Additional Registrations & Banking */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Banking & Additional Registrations
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-xs"
                  placeholder="e.g. HDFC0000001"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">AD Code</label>
                <input
                  type="text"
                  value={adCode}
                  onChange={(e) => setAdCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-xs"
                  placeholder="Authorized Dealer Code"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">RCMC Number</label>
                <input
                  type="text"
                  value={rcmc}
                  onChange={(e) => setRcmc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-xs"
                  placeholder="Registration Certificate No."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant mb-2">CIN (Company ID Number)</label>
                <input
                  type="text"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-xs"
                  placeholder="e.g. U74140DL2026PTC"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant mb-2">Bank Statement / Cheque</label>
                <input
                  type="file"
                  onChange={(e) => handleBase64Upload(e.target.files[0], setBankStatement)}
                  className="text-xs text-on-surface-variant"
                />
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="px-12 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 text-sm"
            >
              Next: Company Review
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Sidebar Columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Rewards Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Trophy size={14} className="text-primary" />
              Verification Rewards
            </h4>
            
            <div className="space-y-4">
              {/* XP Boost */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  +
                </div>
                <div>
                  <p className="font-bold text-white text-xs">+250 XP</p>
                  <p className="text-[10px] text-on-surface-variant">Level progress boost</p>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <SealCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Verified Badge</p>
                  <p className="text-[10px] text-on-surface-variant">Profile trust marker</p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="bg-[#031037]/60 border border-white/5 rounded-xl p-4 space-y-3">
              <p className="text-[11px] text-on-surface-variant italic leading-relaxed">
                "Verified businesses see a 40% increase in buyer inquiries on the global marketplace."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[9px]">
                  RK
                </div>
                <span className="text-[10px] font-bold text-white">Rahul K., Exporter</span>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">
              Verification Checklist
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-white">
                <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                  <Check size={10} />
                </div>
                <span className="font-semibold">Tax Documents Uploaded</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <div className="w-4 h-4 rounded-full border border-white/10"></div>
                <span>Operational Address</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <div className="w-4 h-4 rounded-full border border-white/10"></div>
                <span>Bank Statement</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                <div className="w-4 h-4 rounded-full border border-white/10"></div>
                <span>Signatory Validation</span>
              </div>
            </div>
          </div>

          {/* AI Assistant card */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-[#0c1940]/40 space-y-3">
            <h5 className="font-bold text-xs text-primary flex items-center gap-1.5">
              <Sparkle size={14} />
              AI Assistant
            </h5>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              I've detected that your GSTIN matches a 'Small' category enterprise. You might be eligible for additional Udyam benefits.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
```

---

## Level 4: Company Review
```jsx
import React, { useState } from 'react';
import { 
  Building, Lock, ArrowRight, ShieldCheck, Check, Trophy, SealCheck, Sparkle, Lightning, WarningCircle, Gauge 
} from '@phosphor-icons/react';

export function Level4CompanyReview({ onSubmit, onSimulateApproval, defaultData = {}, isLocked = false, currentUserData = {} }) {
  const [companyName, setCompanyName] = useState(defaultData.company_name || '');
  const [website, setWebsite] = useState(defaultData.website || '');
  const [tagline, setTagline] = useState(defaultData.tagline || '');
  const [companyLogo, setCompanyLogo] = useState(defaultData.company_logo || null);

  const handleBase64Upload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSubmit({ companyName, website, tagline, companyLogo });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {!isLocked ? (
        // STATE 1: UNLOCKED - FORM VIEW
        <>
          <header className="mb-8 border-b border-white/5 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-3xl text-white">Level 4: Company Profile & Review</h1>
                <p className="text-on-surface-variant text-sm mt-1">Review onboarding summary and lock information to finalize compliance verification.</p>
              </div>
              <div className="flex items-center gap-2 bg-[#000a31]/60 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-xs text-primary font-bold">4/6 COMPLETE</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Company Legal Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                      placeholder="e.g. Eximarg Global Private Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Company Logo</label>
                    <div className="flex items-center gap-4">
                      <label className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-bold rounded-xl cursor-pointer transition-all">
                        Choose File
                        <input
                          type="file"
                          onChange={(e) => handleBase64Upload(e.target.files[0], setCompanyLogo)}
                          className="hidden"
                        />
                      </label>
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo preview" className="w-12 h-12 rounded-xl object-contain bg-[#031037] border border-white/10" />
                      ) : (
                        <span className="text-xs text-on-surface-variant">No file chosen</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Company Website (Optional)</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                      placeholder="https://eximarg-global.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                      placeholder="Providing quality Indian Spices worldwide"
                    />
                  </div>
                </div>

                {/* Onboarding Summary Board */}
                <div className="bg-[#031037]/70 border border-white/5 p-5 rounded-xl space-y-4">
                  <h3 className="font-display font-bold text-xs text-primary uppercase tracking-wider">Compliance Review summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-on-surface-variant block mb-1">Director Name:</span>
                      <span className="font-semibold text-white">{currentUserData.director_name || 'Rajesh Kumar'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block mb-1">Exporter Type:</span>
                      <span className="font-semibold text-white">{currentUserData.exporter_type || 'Merchant'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block mb-1">GSTIN:</span>
                      <span className="font-semibold text-white">{currentUserData.gst || '07AAAAA1111A1Z1'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block mb-1">IEC:</span>
                      <span className="font-semibold text-white">{currentUserData.iec || '1234567890'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={handleSave}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-900/20 text-sm"
                >
                  <ShieldCheck size={20} />
                  Check & Confirm: Lock Levels
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h5 className="font-bold text-xs text-primary mb-2 flex items-center gap-1.5">
                  <WarningCircle size={16} />
                  Important Notice
                </h5>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Locking your onboarding level signals our Verification Officers to execute full compliance checks. Please verify that your name, GSTIN, and company details match exactly.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        // STATE 2: LOCKED - VERIFICATION JOURNEY VIEW
        <>
          <header className="mb-8 border-b border-white/5 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/15 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded-full">
                    Level 4
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">• 3 of 5 Milestones Completed</span>
                </div>
                <h1 className="font-display font-extrabold text-3xl text-white mt-2">Level 4: Company Review</h1>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-[#0c1940] px-3.5 py-1.5 rounded-full border border-primary/20">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Review in Progress</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-medium">Estimated Completion: <strong className="text-white">24-48 Hours</strong></span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Timeline */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-base">Verification Journey</h3>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-primary">68%</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Total Progress</span>
                  </div>
                </div>

                {/* Vertical Steps Timeline */}
                <div className="relative pl-8 space-y-8">
                  {/* Connecting Line */}
                  <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-white/5">
                    <div className="h-[68%] bg-primary rounded"></div>
                  </div>

                  {/* Step 1: Entity Validation */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute -left-8 w-6.5 h-6.5 rounded-full bg-primary flex items-center justify-center text-white border border-primary z-10">
                      <Check size={12} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">Entity Validation</h4>
                        <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-bold uppercase rounded">
                          Completed 2h ago
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Company registration and GST credentials have been verified against national databases.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Compliance Check */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute -left-8 w-6.5 h-6.5 rounded-full bg-primary flex items-center justify-center text-white border border-primary z-10 animate-pulse">
                      <Lightning size={12} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm">Compliance Check & Documentation</h4>
                        <span className="text-primary text-[8px] font-bold uppercase tracking-wider">Active Review</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Our compliance engine is currently scanning your uploaded balance sheets and export licenses for regulatory alignment.
                      </p>
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-primary h-full progress-shimmer" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: AML Screening */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute -left-8 w-6.5 h-6.5 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant border border-white/10 z-10">
                      <Lock size={12} />
                    </div>
                    <div className="opacity-50">
                      <h4 className="font-bold text-white text-sm">AML Screening</h4>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Final automated screening against international trade sanctions and money laundering watchlists.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Level 4 Certification */}
                  <div className="relative flex items-start gap-4">
                    <div className="absolute -left-8 w-6.5 h-6.5 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant border border-white/10 z-10">
                      <Trophy size={12} />
                    </div>
                    <div className="opacity-50">
                      <h4 className="font-bold text-white text-sm">Level 4 Certification</h4>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Issuance of your Silver Exporter badge and activation of increased credit limits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Score Card */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0c1940]/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Gauge size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">Earn +450 Trust Score</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Boost your global ranking upon completion</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[8px] font-bold border border-primary/10">1</div>
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[8px] font-bold border border-primary/10">2</div>
                    <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-primary text-[8px] font-bold border border-primary/10">12+</div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">12 other Indian exporters are in review today.</span>
                </div>
              </div>
            </div>

            {/* Right Sidebar Columns */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* While You Wait */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                  <Sparkle size={14} className="text-primary" />
                  While You Wait
                </h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-[#031037]/60 border border-white/5 hover:border-primary/30 rounded-xl transition-all cursor-pointer">
                    <h5 className="font-bold text-white text-xs">Explore Digital Dukan</h5>
                    <p className="text-[10px] text-on-surface-variant mt-1">Start setting up your virtual storefront for the UAE market.</p>
                  </div>
                  <div className="p-3 bg-[#031037]/60 border border-white/5 hover:border-primary/30 rounded-xl transition-all cursor-pointer">
                    <h5 className="font-bold text-white text-xs">Prep Smart Invoices</h5>
                    <p className="text-[10px] text-on-surface-variant mt-1">Standardize your billing format for automated clearance.</p>
                  </div>
                  <div className="p-3 bg-[#031037]/60 border border-white/5 hover:border-primary/30 rounded-xl transition-all cursor-pointer">
                    <h5 className="font-bold text-white text-xs">Export Academy</h5>
                    <p className="text-[10px] text-on-surface-variant mt-1">Learn about new trade tariffs for textile exports in 2024.</p>
                  </div>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">Need help?</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Our Verification Officers might call you from a verified +91 number if any documents need re-uploading.
                </p>
                <button 
                  type="button" 
                  onClick={onSimulateApproval}
                  className="w-full py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-primary/20"
                >
                  Simulate Review Approval
                </button>
              </div>

              {/* Global Reach Corridor Stats */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent space-y-2">
                <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">Global Reach</span>
                <h5 className="font-display font-extrabold text-2xl text-white">142 Active Corridors</h5>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Eximarg currently supports verified exports to 42 countries.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Level 5: Subscription Activation
```jsx
import React, { useState } from 'react';
import { CreditCard, Sparkle } from '@phosphor-icons/react';

export function Level5Subscription({ onSubmit }) {
  const [selectedPlan, setSelectedPlan] = useState('growth');

  const plans = [
    { id: 'starter', name: 'Starter Plan', price: '₹999/mo', desc: '50 AI calls/mo + Custom Invoicing' },
    { id: 'growth', name: 'Growth Plan', price: '₹2,999/mo', desc: '200 AI calls/mo + Bulk Catalog Import' },
    { id: 'premium', name: 'Premium Plan', price: '₹7,999/mo', desc: 'Unlimited AI + Letters of Credit verification' }
  ];

  return (
    <div className="glass-card rounded-2xl p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <CreditCard size={24} className="text-primary" />
        <h3 className="font-display font-bold text-lg text-white">Select Export Tier</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div 
            key={p.id} 
            onClick={() => setSelectedPlan(p.id)}
            className={`border rounded-2xl p-6 cursor-pointer transition-all ${
              selectedPlan === p.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-white/5 bg-[#031037]/40 hover:bg-[#031037]/60'
            }`}
          >
            <h4 className="font-bold text-white text-sm">{p.name}</h4>
            <p className="text-xl font-black text-primary mt-2">{p.price}</p>
            <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <button onClick={() => onSubmit(selectedPlan)} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
        Activate Export Subscription <Sparkle size={16} />
      </button>
    </div>
  );
}
```

---

## Level 6: Product Catalog (Digital Dukan)
```jsx
import React, { useState } from 'react';
import { Tag, Plus, FileArrowUp, Check } from '@phosphor-icons/react';

export function Level6ProductCatalog({ onAddProduct, onBulkImport, onLockCatalog, productsList }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [hsn, setHsn] = useState('');
  const [price, setPrice] = useState('');

  const handleSingleProduct = (e) => {
    e.preventDefault();
    onAddProduct({ name, sku, hsn, price: parseFloat(price) });
    setName(''); setSku(''); setHsn(''); setPrice('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl">
      <div className="lg:col-span-8 space-y-6">
        
        {/* Add Product Form */}
        <div className="glass-card rounded-2xl p-8 space-y-6">
          <h3 className="font-bold text-white text-base">Add Single Product</h3>
          <form onSubmit={handleSingleProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" required />
            <input type="text" placeholder="SKU Code" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" required />
            <input type="text" placeholder="HSN Code" value={hsn} onChange={(e) => setHsn(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" required />
            <input type="number" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" required />
            <button type="submit" className="md:col-span-2 py-3 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
              <Plus size={16} /> Add Product to Catalog
            </button>
          </form>
        </div>

        {/* Products List */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
          <h4 className="font-bold text-sm text-white">Catalog Inventory ({productsList.length})</h4>
          <div className="divide-y divide-white/5">
            {productsList.map((p, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-on-surface-variant mt-0.5">SKU: {p.sku} | HSN: {p.hsn_code || p.hsn}</p>
                </div>
                <span className="font-bold text-primary">${p.price_min || p.price}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onLockCatalog} className="w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
          Lock Catalog & Continue <Check size={16} />
        </button>
      </div>
    </div>
  );
}
```

---

## Level 7: Buyer Invoices
```jsx
import React, { useState } from 'react';
import { Notebook, FileText, Plus, Check } from '@phosphor-icons/react';

export function Level7Invoices({ onSendInvoice, products = [] }) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSend = () => {
    onSendInvoice({
      buyerName,
      buyerEmail,
      items: [{ product_id: selectedProduct, quantity: parseInt(quantity, 10) }]
    });
  };

  return (
    <div className="glass-card rounded-2xl p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Notebook size={24} className="text-primary" />
        <h3 className="font-display font-bold text-lg text-white">Create Export Invoice</h3>
      </div>

      <div className="space-y-4">
        <input type="text" placeholder="Buyer Company Name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" />
        <input type="email" placeholder="Buyer Contact Email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" />

        <div className="grid grid-cols-2 gap-4">
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm">
            <option value="">Select Catalog Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</p>)}
          </select>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" placeholder="Quantity" />
        </div>
      </div>

      <button onClick={handleSend} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
        Dispatch Export Invoice <Check size={16} />
      </button>
    </div>
  );
}
```
