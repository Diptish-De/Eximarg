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
import { ShieldCheck, Check, Lightning, MapPin, Shield, Gauge, Trophy, Gear, Building, Waves, CreditCard } from '@phosphor-icons/react';

export function Level5Subscription({ onSubmit }) {
  const [selectedPlan, setSelectedPlan] = useState('growth');

  const handleActivate = (planId) => {
    setSelectedPlan(planId);
    onSubmit(planId);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl text-left">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          <ShieldCheck size={12} />
          Enterprise Ready
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white">Level 5: Subscription Activation</h1>
        <p className="text-on-surface-variant text-sm md:text-base max-w-3xl mx-auto font-medium">
          Scale your export operations with the velocity of Indian global commerce. Choose the engine that fits your growth.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* TIER 1: Silver */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 bg-[#031037]/40 flex flex-col justify-between space-y-8 relative hover:border-primary/20 transition-all duration-300">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Tier I</span>
              <h3 className="text-2xl font-black text-white mt-1">Silver</h3>
              <p className="text-xs text-on-surface-variant mt-1">Foundational Export Tools</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-xs text-on-surface-variant">/mo</span>
            </div>

            <ul className="space-y-4 text-xs">
              <li className="flex items-center gap-2.5 text-white">
                <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                  <Check size={10} />
                </div>
                <span>Standard HSN Lookup</span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                  <Check size={10} />
                </div>
                <span>Basic Order Tracking</span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                  <Check size={10} />
                </div>
                <span>Community Support</span>
              </li>
              <li className="flex items-center gap-2.5 text-on-surface-variant/50">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                <span>No Trust Score Boost</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleActivate('starter')}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all border border-white/10"
          >
            Current Plan
          </button>
        </div>

        {/* TIER 2: Gold (Most Popular) */}
        <div className="glass-card rounded-3xl p-8 border-2 border-primary bg-[#06143c] flex flex-col justify-between space-y-8 relative shadow-2xl shadow-primary/10">
          <span className="absolute -top-3.5 right-6 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-full">
            Most Popular
          </span>

          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Tier II</span>
              <h3 className="text-2xl font-black text-white mt-1">Gold</h3>
              <p className="text-xs text-on-surface-variant mt-1">Accelerated Global Scale</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$149</span>
              <span className="text-xs text-on-surface-variant">/mo</span>
            </div>

            <ul className="space-y-4 text-xs">
              <li className="flex items-center gap-2.5 text-white">
                <Lightning size={16} className="text-primary shrink-0 animate-pulse" />
                <span>AI HSN Suggestion <strong className="text-[9px] font-normal text-on-surface-variant block">Automated classification engine</strong></span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <MapPin size={16} className="text-primary shrink-0" />
                <span>Live Logistics Tracking</span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <Shield size={16} className="text-primary shrink-0" />
                <span>Trust Score Boost (Level 1)</span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <Gauge size={16} className="text-primary shrink-0" />
                <span>24/7 Priority Access</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <div className="flex justify-between text-[9px] font-bold text-on-surface-variant mb-1">
                <span>XP Progress towards Platinum</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleActivate('growth')}
              className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-primary/20"
              data-testid="mock-subscription-button"
            >
              Activate Gold
            </button>
          </div>
        </div>

        {/* TIER 3: Platinum */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 bg-[#031037]/40 flex flex-col justify-between space-y-8 relative hover:border-primary/20 transition-all duration-300">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Tier III</span>
              <h3 className="text-2xl font-black text-white mt-1">Platinum</h3>
              <p className="text-xs text-on-surface-variant mt-1">Enterprise Sovereign Control</p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$499</span>
              <span className="text-xs text-on-surface-variant">/mo</span>
            </div>

            <ul className="space-y-4 text-xs">
              <li className="flex items-center gap-2.5 text-white">
                <Trophy size={16} className="text-primary shrink-0" />
                <span>Max Trust Score Boost</span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <Gear size={16} className="text-primary shrink-0" />
                <span>Custom ERP Integration</span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <ShieldCheck size={16} className="text-primary shrink-0" />
                <span>Dedicated Trade Compliance Officer</span>
              </li>
              <li className="flex items-center gap-2.5 text-white">
                <Building size={16} className="text-primary shrink-0" />
                <span>Unlimited Team Seats</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleActivate('premium')}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all border border-white/10"
          >
            Talk to Enterprise
          </button>
        </div>

      </div>

      {/* Footer rights & links */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-on-surface-variant font-medium pt-4">
        <span>© 2024 EXIMARG Technologies. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
      </div>

      {/* Next-Gen Export Intelligence Section */}
      <div className="space-y-6 pt-12 border-t border-white/5">
        <h3 className="text-center font-display font-extrabold text-xl md:text-2xl text-white">
          Next-Gen Export Intelligence
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#031037]/20 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Lightning size={18} />
            </div>
            <h4 className="font-bold text-white text-xs">AI HSN Suggestion</h4>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Instant, legally-compliant Harmonized System codes for your global inventory.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#031037]/20 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Waves size={18} />
            </div>
            <h4 className="font-bold text-white text-xs">Live Logistics</h4>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Real-time port and sea tracking with predictive delay alerts.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#031037]/20 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck size={18} />
            </div>
            <h4 className="font-bold text-white text-xs">Trust Score Boost</h4>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Verified credentials that increase buyer confidence by up to 40%.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#031037]/20 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard size={18} />
            </div>
            <h4 className="font-bold text-white text-xs">Trade Finance</h4>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Unlock credit lines based on your trade performance history.
            </p>
          </div>
        </div>
      </div>

      {/* Trusted Logos Section */}
      <div className="space-y-4 pt-8 text-center">
        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block">
          Trusted by Global Exporters
        </span>
        <div className="flex flex-wrap justify-center items-center gap-10 opacity-30 text-white font-display font-black text-sm tracking-widest py-2">
          <span>TECHSHIP</span>
          <span>INDUSCO</span>
          <span>MODERNLOG</span>
          <span>GLOBALSENSE</span>
        </div>
      </div>

    </div>
  );
}
```

---

## Level 6: Product Catalog (Digital Dukan)
```jsx
import React, { useState } from 'react';
import { Plus, FileArrowUp, Check, Globe, Sparkle, Lightbulb, WarningCircle } from '@phosphor-icons/react';

export function Level6ProductCatalog({ onAddProduct, onBulkImport, onLockCatalog, productsList }) {
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodHsn, setProdHsn] = useState('');
  const [prodPriceMin, setProdPriceMin] = useState('');
  const [prodImage, setProdImage] = useState(null);
  const [prodCategory, setProdCategory] = useState('Apparel & Accessories');
  const [prodSubCategory, setProdSubCategory] = useState('Handbags');
  const [prodMoq, setProdMoq] = useState('100 Units');
  const [prodCif, setProdCif] = useState('0.00');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [enableSmartInsights, setEnableSmartInsights] = useState(false);

  // Bulk files
  const [csvFile, setCsvFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);

  const handleBase64Upload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddClick = () => {
    if (!prodName || !prodPriceMin || !prodHsn) return;
    const generatedSku = prodSku || 'SKU-' + prodName.substring(0,3).toUpperCase() + '-' + Math.random().toString(36).substring(7).toUpperCase();
    onAddProduct({
      name: prodName,
      description: prodDesc,
      sku: generatedSku,
      hsn_code: prodHsn,
      price: parseFloat(prodPriceMin),
      image: prodImage
    });
    setProdName('');
    setProdDesc('');
    setProdSku('');
    setProdHsn('');
    setProdPriceMin('');
    setProdImage(null);
  };

  const handlePublishClick = () => {
    if (prodName && prodPriceMin && prodHsn) {
      const generatedSku = prodSku || 'SKU-' + prodName.substring(0,3).toUpperCase() + '-' + Math.random().toString(36).substring(7).toUpperCase();
      onAddProduct({
        name: prodName,
        description: prodDesc,
        sku: generatedSku,
        hsn_code: prodHsn,
        price: parseFloat(prodPriceMin),
        image: prodImage
      });
    }
    onLockCatalog();
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-7xl">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded-full">
              Level 6 Task
            </span>
            <span className="text-xs text-on-surface-variant font-semibold">Step 2 of 4</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white mt-2">Build Your Digital Dukan</h1>
          <p className="text-on-surface-variant text-sm mt-1">High-fidelity product creation optimized for international buyers. Globalize your inventory with one click.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBulkModal(true)} 
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all border border-white/10 flex items-center gap-2"
          >
            <FileArrowUp size={16} />
            Bulk Upload
          </button>
          <button 
            onClick={handlePublishClick} 
            className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center shadow-lg shadow-primary/20"
          >
            Publish to Storefront
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Core Information Card */}
          <div className="glass-card rounded-2xl p-8 space-y-6 border border-white/5 bg-[#031037]/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Plus size={18} />
              </div>
              <h3 className="font-display font-bold text-sm text-white">Core Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                  placeholder="e.g. Premium Handcrafted Leather Satchel"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">Category</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Apparel & Accessories"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">Sub-category</label>
                  <input
                    type="text"
                    value={prodSubCategory}
                    onChange={(e) => setProdSubCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Handbags"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">Product Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm h-32 focus:border-primary/50 outline-none transition-all resize-none"
                  placeholder="Describe the materials, craftsmanship, and unique value propositions..."
                />
              </div>
            </div>
          </div>

          {/* Export Logistics & Compliance Card */}
          <div className="glass-card rounded-2xl p-8 space-y-6 border border-white/5 bg-[#031037]/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Globe size={18} />
              </div>
              <h3 className="font-display font-bold text-sm text-white">Export Logistics & Compliance</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">HSN Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prodHsn}
                      onChange={(e) => setProdHsn(e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                      placeholder="XXXX XX XX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">MOQ Tier (Minimum Order Quantity)</label>
                  <input
                    type="text"
                    value={prodMoq}
                    onChange={(e) => setProdMoq(e.target.value)}
                    className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="100 Units"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">FOB Price ($/Unit)</label>
                  <input
                    type="number"
                    value={prodPriceMin}
                    onChange={(e) => setProdPriceMin(e.target.value)}
                    className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">CIF Quote (Estimated)</label>
                  <input
                    type="text"
                    value={prodCif}
                    onChange={(e) => setProdCif(e.target.value)}
                    className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Gallery Card */}
          <div className="glass-card rounded-2xl p-8 space-y-6 border border-white/5 bg-[#031037]/40">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkle size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Product Gallery</h3>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Max 5MB per image. 4K resolution supported.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Add Media Box */}
              <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all min-h-[120px] group">
                <input 
                  type="file" 
                  onChange={(e) => handleBase64Upload(e.target.files[0], setProdImage)} 
                  className="hidden" 
                />
                <Plus size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-bold text-white">Add Media</span>
              </label>

              {/* Box 2: Handbag Preview */}
              <div className="relative rounded-xl overflow-hidden aspect-square bg-[#031037] border border-white/10 flex items-center justify-center min-h-[120px]">
                {prodImage ? (
                  <img src={prodImage} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-transparent p-3 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-primary uppercase">MOCKUP IMAGE</span>
                    <div className="flex items-center justify-center flex-1">
                      <svg className="w-10 h-10 text-primary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 9V7a6 6 0 0 1 12 0v2m-14 0h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
                      </svg>
                    </div>
                    <span className="text-[8px] text-on-surface-variant">White background suggested</span>
                  </div>
                )}
              </div>

              {/* Box 3: Leather texture mockup */}
              <div className="relative rounded-xl overflow-hidden aspect-square bg-[#031037] border border-white/10 flex items-center justify-center min-h-[120px]">
                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-transparent p-3 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-primary/60 uppercase">TEXTURE</span>
                  <div className="flex items-center justify-center flex-1">
                    <svg className="w-10 h-10 text-primary/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16v16H4z M12 4v16 M4 12h16" />
                    </svg>
                  </div>
                  <span className="text-[8px] text-on-surface-variant">Secondary detail</span>
                </div>
              </div>

              {/* Box 4: Placeholder */}
              <div className="rounded-xl bg-[#031037]/40 border border-white/5 flex items-center justify-center min-h-[120px] text-on-surface-variant text-base font-bold">
                •••
              </div>
            </div>
          </div>

          {/* Add Product Submit Row */}
          <div className="flex justify-start pt-4 border-t border-white/10">
            <button 
              type="button" 
              onClick={handleAddClick}
              className="px-6 py-3 bg-[#0c1940] hover:bg-[#12245c] text-primary hover:text-white border border-primary/20 hover:border-primary/50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              Add Product to Catalog
            </button>
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Product Readiness Card */}
          <div className="glass-card rounded-2xl p-6 space-y-6 border border-white/5 bg-[#031037]/40">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant">Product Readiness</h4>
              <div className="text-right">
                <span className="block text-lg font-black text-primary">
                  {Math.round(
                    ( (prodName ? 1 : 0) + 
                      (prodHsn ? 1 : 0) + 
                      (prodImage ? 1 : 0) + 
                      (prodPriceMin ? 1 : 0) ) * 25
                  )}%
                </span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Ready</span>
              </div>
            </div>

            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full progress-shimmer transition-all duration-300" 
                style={{ 
                  width: `${
                    ( (prodName ? 1 : 0) + 
                      (prodHsn ? 1 : 0) + 
                      (prodImage ? 1 : 0) + 
                      (prodPriceMin ? 1 : 0) ) * 25
                  }%` 
                }}
              ></div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-white">
                {prodName ? (
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                    <Check size={10} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/10"></div>
                )}
                <span className={prodName ? "font-semibold" : "text-on-surface-variant"}>Basic details added</span>
              </div>

              <div className="flex items-center gap-2.5 text-white">
                {prodHsn ? (
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                    <Check size={10} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/10"></div>
                )}
                <span className={prodHsn ? "font-semibold" : "text-on-surface-variant"}>Compliance docs linked</span>
              </div>

              <div className="flex items-center gap-2.5 text-white">
                {prodImage ? (
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                    <Check size={10} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/10"></div>
                )}
                <span className={prodImage ? "font-semibold" : "text-on-surface-variant"}>Add 2 more HD photos</span>
              </div>

              <div className="flex items-center gap-2.5 text-white">
                {prodPriceMin ? (
                  <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                    <Check size={10} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/10"></div>
                )}
                <span className={prodPriceMin ? "font-semibold" : "text-on-surface-variant"}>Optimize FOB pricing</span>
              </div>
            </div>
          </div>

          {/* Export AI Assistant Card */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-[#0c1940]/40 space-y-4">
            <h5 className="font-bold text-xs text-primary flex items-center gap-1.5">
              <Sparkle size={14} className="animate-pulse" />
              Export AI Assistant
            </h5>
            <p className="text-xs text-on-surface-variant italic leading-relaxed bg-[#031037]/60 p-3 rounded-xl border border-white/5">
              "Based on your category, US buyers typically look for 'Sustainable Sourcing' certs. Would you like to add one?"
            </p>
            <button 
              type="button" 
              onClick={() => {
                setEnableSmartInsights(!enableSmartInsights);
              }}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all border border-white/10"
            >
              {enableSmartInsights ? "Smart Insights Enabled" : "Enable Smart Insights"}
            </button>
          </div>

          {/* Pro Tip Card */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex gap-3 bg-[#0c1940]/40">
            <Lightbulb size={24} className="text-yellow-400 shrink-0" />
            <div>
              <h5 className="font-bold text-xs text-white mb-1">Pro Tip</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Products with White Backgrounds see a 40% higher click-through rate from Middle-Eastern importers.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bulk CSV / ZIP Import Modal Overlay */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full border border-white/10 space-y-6 relative animate-fade-in">
            <button 
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white text-lg font-bold"
            >
              ×
            </button>

            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <FileArrowUp size={24} className="text-primary" />
              <div>
                <h3 className="font-display font-bold text-lg text-white">Bulk CSV / ZIP Import</h3>
                <p className="text-xs text-on-surface-variant">Upload CSV catalog and ZIP image files simultaneously.</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              onBulkImport({ csvFile, zipFile });
              setShowBulkModal(false);
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CSV File (sku,name...)</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="text-xs text-on-surface-variant w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">ZIP Images Archive</label>
                <input 
                  type="file" 
                  accept=".zip"
                  onChange={(e) => setZipFile(e.target.files[0])}
                  className="text-xs text-on-surface-variant w-full"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
              >
                Upload & Process Import
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
```

---

## Level 7: Buyer Invoices
```jsx
import React, { useState } from 'react';
import { 
  Notebook, FileText, Plus, Check, Users, CheckCircle, PaperPlaneRight, ShieldCheck, Question 
} from '@phosphor-icons/react';

export function Level7Invoices({ onSendInvoice, products = [] }) {
  const [buyerName, setBuyerName] = useState('Nordic Retail Group GmbH');
  const [buyerEmail, setBuyerEmail] = useState('claus.h@nordic-retail.com');
  const [buyerAddress, setBuyerAddress] = useState('Kaiserstraße 120-122, 60329 Frankfurt am Main, Germany');
  const [invoiceProducts, setInvoiceProducts] = useState([
    { product_id: '1', name: 'Handcrafted Organic Cotton Bed Linen - Set of 3 (Indigo Collection)', quantity: 420, price: 25.00 },
    { product_id: '2', name: 'Decorative Silk Cushion Covers - 16x16"', quantity: 150, price: 13.00 }
  ]);

  const [fobPortLoading, setFobPortLoading] = useState(0);
  const [fobTransport, setFobTransport] = useState(0);
  const [fobDocs, setFobDocs] = useState(0);
  const [cifFreight, setCifFreight] = useState(1000);
  const [cifInsurance, setCifInsurance] = useState(150);

  const getSubtotal = () => {
    return invoiceProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  };
  const getFobTotal = () => {
    return parseFloat(fobPortLoading || 0) + parseFloat(fobTransport || 0) + parseFloat(fobDocs || 0);
  };
  const getCifTotal = () => {
    return parseFloat(cifFreight || 0) + parseFloat(cifInsurance || 0);
  };
  const getTotalAmount = () => {
    return getSubtotal() + getFobTotal() + getCifTotal();
  };

  const handleSend = () => {
    onSendInvoice({
      buyerName,
      buyerEmail,
      buyerAddress,
      products: invoiceProducts,
      fob_charges: getFobTotal(),
      cif_charges: getCifTotal(),
      total_amount: getTotalAmount(),
      status: "sent"
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-7xl">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded-full">
              Orders
            </span>
            <span className="text-xs text-on-surface-variant font-semibold">/ Invoice Dispatch Wizard</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white mt-2">Dispatch Final Documentation</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <ShieldCheck size={12} />
            FEMA Compliance Active
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Sections */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Identify Recipient */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-[#031037]/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  1
                </div>
                <h3 className="font-display font-bold text-sm text-white">Identify Recipient</h3>
              </div>
              <Users size={20} className="text-on-surface-variant/40" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">VERIFIED FOREIGN BUYER</label>
                <select 
                  value={buyerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBuyerName(val);
                    if (val === 'Nordic Retail Group GmbH') {
                      setBuyerEmail('claus.h@nordic-retail.com');
                      setBuyerAddress('Kaiserstraße 120-122, 60329 Frankfurt am Main, Germany');
                      setInvoiceProducts([
                        { product_id: '1', name: 'Handcrafted Organic Cotton Bed Linen - Set of 3 (Indigo Collection)', quantity: 420, price: 25.00 },
                        { product_id: '2', name: 'Decorative Silk Cushion Covers - 16x16"', quantity: 150, price: 13.00 }
                      ]);
                      setCifFreight(1000);
                      setCifInsurance(150);
                    } else if (val === 'Global Foods Corp LLC') {
                      setBuyerEmail('info@globalfoods.com');
                      setBuyerAddress('100, Wharf Side, Long Beach, CA, USA');
                      setInvoiceProducts([
                        { product_id: '1', name: 'Premium Basmati Rice', quantity: 200, price: 15.50 }
                      ]);
                      setCifFreight(800);
                      setCifInsurance(120);
                    } else {
                      setBuyerEmail('import@londontextiles.co.uk');
                      setBuyerAddress('24 Baker St, London, UK');
                      setInvoiceProducts([
                        { product_id: '2', name: 'Silk Accessories', quantity: 120, price: 35.00 }
                      ]);
                      setCifFreight(900);
                      setCifInsurance(130);
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                >
                  <option value="Nordic Retail Group GmbH">Nordic Retail Group GmbH (VAT: DE98231)</option>
                  <option value="Global Foods Corp LLC">Global Foods Corp LLC (VAT: US99123)</option>
                  <option value="London Textiles Ltd">London Textiles Ltd (VAT: GB55231)</option>
                </select>
              </div>

              <div className="bg-[#0c1940]/60 border border-primary/20 rounded-xl p-4 flex gap-3 text-xs text-on-surface-variant">
                <Question size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  Dispatching to <strong className="text-white">{buyerEmail || 'claus.h@nordic-retail.com'}</strong>. This buyer is cleared for immediate dispatch.
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Consolidated Shipments */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-[#031037]/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  2
                </div>
                <h3 className="font-display font-bold text-sm text-white">Consolidated Shipments</h3>
              </div>
            </div>

            <div className="space-y-3">
              {/* Shipment 1 */}
              <div className="bg-[#031037]/80 border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">SHP-2023-9941</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Handcrafted Textiles • 420 Units</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white text-xs">$12,450.00</p>
                    <p className="text-[9px] text-on-surface-variant">FOB Mumbai</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                    <CheckCircle size={14} />
                  </div>
                </div>
              </div>

              {/* Shipment 2 */}
              <div className="bg-[#031037]/40 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">SHP-2023-8821</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Silk Accessories • 150 Units</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white text-xs">$4,200.00</p>
                    <p className="text-[9px] text-on-surface-variant">EXW Delhi</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (invoiceProducts.length <= 2) {
                        setInvoiceProducts([
                          ...invoiceProducts,
                          { product_id: '3', name: 'Premium Silk Accessories & Scarves', quantity: 150, price: 28.00 }
                        ]);
                      }
                    }}
                    className="w-5 h-5 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 flex items-center justify-center text-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Review & Dispatch */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-[#031037]/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                3
              </div>
              <h3 className="font-display font-bold text-sm text-white">Review & Dispatch</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 bg-[#031037]/60 border border-white/5 rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1" />
                <div>
                  <p className="font-bold text-white text-xs">Attach Certificate of Origin</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Digitally signed by Chamber of Commerce</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 bg-[#031037]/60 border border-white/5 rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1" />
                <div>
                  <p className="font-bold text-white text-xs">Courier Tracking (DHL)</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Auto-notify buyer upon pickup</p>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleSend}
                className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <PaperPlaneRight size={16} />
                Dispatch Export Invoice
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: LIVE DOCUMENT PREVIEW */}
        <div className="lg:col-span-5 space-y-4">
          <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">
            LIVE DOCUMENT PREVIEW
          </span>

          <div className="bg-white text-black p-8 rounded-3xl shadow-2xl space-y-6 text-left border border-white/10 relative min-h-[600px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Invoice Title */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display font-black text-slate-800 text-lg tracking-tight">EXIMARG TRADING CO.</h4>
                  <p className="text-[8px] text-slate-500 mt-1 max-w-[180px]">Plot 44, SEZ Industrial Estate Gurugram, HR 122018, India</p>
                  <p className="text-[8px] text-slate-500">GSTIN: 07AAACH1234F1Z1</p>
                </div>
                <div className="text-right">
                  <h5 className="font-display font-bold text-slate-400 text-sm uppercase tracking-widest">COMMERCIAL INVOICE</h5>
                  <p className="text-xs font-black text-slate-800 mt-1">#INV-2023-XM-0941</p>
                  <p className="text-[9px] text-slate-500">Date: 24 Oct 2023</p>
                </div>
              </div>

              {/* Consignee & Shipment row */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-[9px]">
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider text-[8px] mb-1">CONSIGNEE (BILL TO)</span>
                  <p className="font-bold text-slate-800">{buyerName || 'Nordic Retail Group GmbH'}</p>
                  <p className="text-slate-500 whitespace-pre-wrap mt-0.5">{buyerAddress || 'Kaiserstraße 120-122\n60329 Frankfurt am Main\nGermany'}</p>
                  <p className="text-slate-500">VAT: {buyerName === 'Nordic Retail Group GmbH' ? 'DE98231200' : 'US99123'}</p>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider text-[8px] mb-1">SHIPMENT DETAILS</span>
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <td className="text-slate-400 pr-2">Port of Loading:</td>
                        <td className="font-bold text-slate-800">Nhava Sheva (INNSA)</td>
                      </tr>
                      <tr>
                        <td className="text-slate-400 pr-2">Port of Discharge:</td>
                        <td className="font-bold text-slate-800">Hamburg (DEHAM)</td>
                      </tr>
                      <tr>
                        <td className="text-slate-400 pr-2">Incoterms:</td>
                        <td className="font-bold text-slate-800">CIF Hamburg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Table */}
              <div className="border-t border-slate-100 pt-4">
                <table className="w-full text-left text-[9px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[8px] text-slate-400 uppercase font-bold">
                      <th className="pb-2">HS Code</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceProducts.map((p, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 text-slate-500">{i === 0 ? '6302.21' : '6307.90'}</td>
                        <td className="py-2 font-medium text-slate-800 max-w-[150px] truncate">{p.name}</td>
                        <td className="py-2 text-right text-slate-700">{p.quantity}</td>
                        <td className="py-2 text-right text-slate-700">${p.price?.toFixed(2)}</td>
                        <td className="py-2 text-right font-bold text-slate-800">${(p.quantity * p.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculation summary */}
            <div className="border-t border-slate-100 pt-4 flex flex-col items-end text-[9px] space-y-1">
              <div className="flex justify-between w-48 text-slate-500">
                <span>Subtotal (FOB Value):</span>
                <span className="font-semibold text-slate-800">${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-slate-500">
                <span>Freight & Insurance:</span>
                <span className="font-semibold text-slate-800">${(cifFreight + cifInsurance).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 font-bold text-slate-800 border-t border-dashed border-slate-200 pt-1.5 text-xs">
                <span className="text-primary">Total Amount Payable:</span>
                <span className="text-primary">${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>

            {/* Document Verification Footer */}
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[8px] text-slate-400">
              <div>
                <span className="block font-bold uppercase tracking-wider text-slate-400 mb-0.5">BANK DETAILS</span>
                <p>Standard Chartered Bank, IFSC: SCBL0034211</p>
                <p>A/C: 4421 9920 1102 3349</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="block font-bold text-green-600 uppercase font-bold">Digitally Verified</span>
                  <span className="text-[7px]">FEMA Compliant ID: XM-9941</span>
                </div>
                {/* Simulated QR Code */}
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-[6px]">
                  QR
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
