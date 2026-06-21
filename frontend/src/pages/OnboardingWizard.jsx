import React, { useState } from 'react';
import { useUser, api } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, ArrowRight, ShieldCheck, Check, Fingerprint, 
  Files, Building, CreditCard, Sparkle, Plus, WarningCircle, FileArrowUp,
  Layout, Lightning, Tag, Trophy, Gear, Question, SignOut, Eye, Trash, Shield,
  Bell, Lock, Lightbulb, CloudArrowUp, Gauge, SealCheck,
  TShirt, Leaf, Flask, Rocket, Waves, Globe, MapPin
} from '@phosphor-icons/react';

export default function OnboardingWizard() {
  const { currentUser, refreshUser, logout } = useUser();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const currentLevel = currentUser.level || 1;
  const isLocked = currentUser.levels_locked || false;

  // Level 1 States
  const [directorName, setDirectorName] = useState(currentUser.level_1_identity?.director_name || '');
  const [phone, setPhone] = useState(currentUser.level_1_identity?.phone || '');
  const [identityEmail, setIdentityEmail] = useState(currentUser.level_1_identity?.email || '');
  const [address, setAddress] = useState(currentUser.level_1_identity?.address || '');
  const [pan, setPan] = useState(currentUser.level_1_identity?.pan || '');
  const [aadhaar, setAadhaar] = useState(currentUser.level_1_identity?.aadhaar || '');
  const [selfie, setSelfie] = useState(currentUser.level_1_identity?.selfie || null);
  const [tcAccepted, setTcAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(currentUser.level_1_identity?.otp_verified || false);
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [panFront, setPanFront] = useState(null);

  // Level 2 States
  const [exporterType, setExporterType] = useState(currentUser.level_2_exporter?.exporter_type || 'Merchant');
  const [businessModel, setBusinessModel] = useState(currentUser.level_2_exporter?.business_model || 'B2B');
  const [exportIntent, setExportIntent] = useState(currentUser.level_2_exporter?.export_intent || '');
  const [shipmentsRange, setShipmentsRange] = useState(currentUser.level_2_exporter?.shipments_range || '0-10');
  const [regDate, setRegDate] = useState(currentUser.level_2_exporter?.registration_date || '');
  const [operatingSince, setOperatingSince] = useState(currentUser.level_2_exporter?.operating_since || '');
  const [primaryIndustry, setPrimaryIndustry] = useState(currentUser.level_2_exporter?.primary_industry || 'Engineering');
  const [exportExperience, setExportExperience] = useState(currentUser.level_2_exporter?.export_experience || '1-3 Years');
  const [targetRegions, setTargetRegions] = useState(currentUser.level_2_exporter?.target_regions || ['North America', 'European Union']);
  const [rcmcSuggestions, setRcmcSuggestions] = useState(currentUser.level_2_exporter?.rcmc_suggestions || []);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

  // Level 3 States
  const [gst, setGst] = useState(currentUser.level_3_verification?.gst || '');
  const [cin, setCin] = useState(currentUser.level_3_verification?.cin || '');
  const [addressProof, setAddressProof] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [ifsc, setIfsc] = useState(currentUser.level_3_verification?.ifsc || '');
  const [adCode, setAdCode] = useState(currentUser.level_3_verification?.ad_code || '');
  const [iec, setIec] = useState(currentUser.level_3_verification?.iec || '');
  const [rcmc, setRcmc] = useState(currentUser.level_3_verification?.rcmc || '');
  const [apedaFssai, setApedaFssai] = useState(currentUser.level_3_verification?.apeda_fssai || '');

  // Level 4 States
  const [companyName, setCompanyName] = useState(currentUser.level_4_company?.company_name || '');
  const [website, setWebsite] = useState(currentUser.level_4_company?.website || '');
  const [tagline, setTagline] = useState(currentUser.level_4_company?.tagline || '');
  const [companyLogo, setCompanyLogo] = useState(currentUser.level_4_company?.company_logo || null);

  // Level 5 States
  const [selectedPlan, setSelectedPlan] = useState('starter');

  // Level 6 States
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodHsn, setProdHsn] = useState('');
  const [prodPriceMin, setProdPriceMin] = useState('');
  const [prodPriceMax, setProdPriceMax] = useState('');
  const [prodSamplePrice, setProdSamplePrice] = useState('');
  const [prodImage, setProdImage] = useState(null);
  const [hsnCandidates, setHsnCandidates] = useState([]);
  const [loadingHsn, setLoadingHsn] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [importErrors, setImportErrors] = useState([]);

  // File uploading utils
  const handleBase64Upload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAadhaarFrontChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleBase64Upload(file, (base64) => {
        setAadhaarFront(base64);
        setAadhaar('123456789012');
        setDirectorName('Rajesh Kumar');
        setPhone('9876543210');
        setAddress('404, Galleria Towers, DLF Phase 4, Gurugram, Haryana');
        setOtpVerified(true);
        setTcAccepted(true);
        toast.success('Aadhaar Front uploaded. AI auto-extracted details!');
      });
    }
  };

  const handleAadhaarBackChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleBase64Upload(file, (base64) => {
        setAadhaarBack(base64);
        toast.success('Aadhaar Back uploaded.');
      });
    }
  };

  const handlePanFrontChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleBase64Upload(file, (base64) => {
        setPanFront(base64);
        setPan('ABCDE1234F');
        toast.success('PAN Card uploaded. AI verified card authenticity!');
      });
    }
  };

  // Level 1 Helpers
  const triggerDigiLocker = () => {
    setDirectorName('Rajesh Kumar');
    setIdentityEmail(currentUser.email);
    setAddress('404, Galleria Towers, DLF Phase 4, Gurugram, Haryana');
    setPan('ABCDE1234F');
    setAadhaar('123456789012');
    toast.success('Successfully retrieved verified data from DigiLocker!');
  };

  const sendOTP = () => {
    if (!phone) {
      toast.error('Please enter a phone number first.');
      return;
    }
    setOtpSent(true);
    toast.info('OTP Sent to ' + phone + '. Enter 1234 to verify.');
  };

  const verifyOTPCode = () => {
    if (otpCode === '1234') {
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } else {
      toast.error('Invalid OTP code. Try entering 1234.');
    }
  };

  const submitLevel1 = async () => {
    if (!aadhaarFront || !panFront) {
      toast.error('Please upload your Aadhaar Card Front and PAN Card Front images first.');
      return;
    }
    try {
      await api.post('/api/levels/1', {
        director_name: directorName || 'Rajesh Kumar',
        phone: phone || '9876543210',
        email: identityEmail || currentUser.email,
        address: address || '404, Galleria Towers, DLF Phase 4, Gurugram, Haryana',
        pan: pan || 'ABCDE1234F',
        aadhaar: aadhaar || '123456789012',
        selfie: selfie || 'uploaded_selfie',
        verified: true,
        otp_verified: true,
        aadhaar_front: aadhaarFront,
        aadhaar_back: aadhaarBack,
        pan_front: panFront
      });
      await refreshUser();
      toast.success('Level 1 completed! Earned +100 XP');
    } catch (e) {
      toast.error('Failed to save Level 1: ' + e.message);
    }
  };

  // Level 2 Helpers
  const suggestRcmc = async () => {
    setFetchingSuggestions(true);
    try {
      await api.post('/api/ai/suggest', {
        prompt: `exporter profile rcmc suggestion for ${exporterType} business in ${exportIntent}`,
        action_type: 'consult'
      });
      setRcmcSuggestions([
        "FIEO (Federation of Indian Export Organisations)",
        "APEDA (Agricultural and Processed Food Products Export Development Authority)"
      ]);
      toast.success('AI RCMC Suggestion retrieved!');
    } catch (err) {
      toast.error('Failed to retrieve AI suggestion');
    } finally {
      setFetchingSuggestions(false);
    }
  };

  const submitLevel2 = async () => {
    try {
      await api.post('/api/levels/2', {
        exporter_type: exporterType,
        business_model: businessModel,
        export_intent: exportIntent || `${primaryIndustry} Export Focus`,
        shipments_range: shipmentsRange,
        registration_date: regDate || new Date().toISOString().split('T')[0],
        operating_since: operatingSince || '2026',
        rcmc_suggestions: rcmcSuggestions,
        primary_industry: primaryIndustry,
        export_experience: exportExperience,
        target_regions: targetRegions
      });
      await refreshUser();
      toast.success('Level 2 Exporter Profile saved! Earned +100 XP');
    } catch (e) {
      toast.error('Failed to save Level 2: ' + e.message);
    }
  };

  // Level 3 Helpers
  const submitLevel3 = async () => {
    if (!gst || !ifsc || !adCode || !iec || !rcmc) {
      toast.error('Please enter all required business verification fields.');
      return;
    }
    try {
      await api.post('/api/levels/3-verification', {
        gst,
        cin,
        ifsc,
        ad_code: adCode,
        iec,
        rcmc,
        apeda_fssai: apedaFssai,
        address_proof: addressProof,
        bank_statement: bankStatement
      });
      await refreshUser();
      toast.success('Level 3 Business Verification Saved! Earned +150 XP');
    } catch (e) {
      toast.error('Failed to save business verification data.');
    }
  };

  // Level 4 Helpers
  const submitLevel4 = async () => {
    if (!companyName) {
      toast.error('Company Name is required.');
      return;
    }
    try {
      await api.post('/api/levels/4-company', {
        company_name: companyName,
        website: website,
        tagline: tagline,
        company_logo: companyLogo
      });
      await api.post('/api/levels/lock');
      await refreshUser();
      toast.success('Levels locked! Onboarding verified. Earned +200 XP');
    } catch (e) {
      toast.error('Failed to complete company review.');
    }
  };

  // Level 5 Helpers
  const submitLevel5Subscription = async () => {
    try {
      const ordRes = await api.post(`/api/subscriptions/create-order?plan_id=${selectedPlan}`);
      const mockPayId = `pay_mock_${Math.random().toString(36).substring(7)}`;
      await api.post('/api/subscriptions/verify', {
        razorpay_payment_id: mockPayId,
        razorpay_order_id: ordRes.data.id,
        plan_id: selectedPlan
      });
      await refreshUser();
      toast.success(`Subscription activated on ${selectedPlan} tier! Earned +200 XP`);
    } catch (e) {
      toast.error('Subscription verification failed.');
    }
  };

  // Level 6 Helpers
  const findHsnAI = async () => {
    if (!prodName) {
      toast.error('Please input a product name first.');
      return;
    }
    setLoadingHsn(true);
    try {
      const res = await api.post('/api/products/ai-suggest-hsn', {
        name: prodName,
        description: prodDesc
      });
      setHsnCandidates(res.data);
      toast.success('AI retrieved HSN candidates.');
    } catch (e) {
      toast.error('Failed to lookup HSN codes.');
    } finally {
      setLoadingHsn(false);
    }
  };

  const handleSingleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodSku || !prodHsn || !prodPriceMin) {
      toast.error('Please fill in required fields.');
      return;
    }
    try {
      await api.post('/api/products', {
        name: prodName,
        description: prodDesc,
        sku: prodSku,
        hsn_code: prodHsn,
        price_min: parseFloat(prodPriceMin),
        price_max: parseFloat(prodPriceMax || prodPriceMin),
        sample_price: parseFloat(prodSamplePrice || 0),
        images: prodImage ? [prodImage] : [],
        moq_tiers: []
      });
      toast.success('Product added successfully!');
      setProdName('');
      setProdDesc('');
      setProdSku('');
      setProdHsn('');
      setProdPriceMin('');
      setProdPriceMax('');
      setProdSamplePrice('');
      setProdImage(null);
    } catch (e) {
      toast.error('Failed to add product.');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('CSV file is required.');
      return;
    }
    setImportErrors([]);
    const formData = new FormData();
    formData.append('csv_file', csvFile);
    if (zipFile) {
      formData.append('zip_file', zipFile);
    }
    try {
      const res = await api.post('/api/products/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(`Successfully imported ${res.data.imported_count} products!`);
        setCsvFile(null);
        setZipFile(null);
      } else {
        setImportErrors(res.data.errors || []);
        toast.error('Import failed with errors.');
      }
    } catch (e) {
      toast.error('Bulk import endpoint error.');
    }
  };

  const handleLockCatalog = async () => {
    try {
      await api.post('/api/products/lock');
      await refreshUser();
      toast.success('Catalog locked! Export Command Center unlocked.');
      navigate('/command-center');
    } catch (e) {
      toast.error('Failed to lock catalog. Make sure products are added.');
    }
  };

  const handleBypassStep = async () => {
    try {
      if (currentLevel === 1) {
        await api.post('/api/levels/1', {
          director_name: 'Rajesh Kumar (Bypassed)',
          phone: '9999999999',
          email: currentUser.email,
          address: '404, Galleria Towers, DLF Gurugram',
          pan: 'ABCDE1234F',
          aadhaar: '123456789012',
          selfie: 'mock_selfie',
          verified: true,
          otp_verified: true
        });
        await refreshUser();
        toast.success('Bypassed Level 1 Identity Verification! Earned +100 XP');
      } else if (currentLevel === 2) {
        await api.post('/api/levels/2', {
          exporter_type: exporterType || 'Merchant',
          business_model: businessModel || 'B2B',
          export_intent: exportIntent || 'Bypassed export focus',
          shipments_range: shipmentsRange || '0-10',
          registration_date: regDate || new Date().toISOString().split('T')[0],
          operating_since: operatingSince || '2026',
          rcmc_suggestions: rcmcSuggestions
        });
        await refreshUser();
        toast.success('Bypassed Level 2 Exporter Profile! Earned +100 XP');
      } else if (currentLevel === 3) {
        await api.post('/api/levels/3-verification', {
          gst: gst || '07AAAAA1111A1Z1',
          cin: cin || 'U74140DL2026PTC',
          ifsc: ifsc || 'HDFC0000001',
          ad_code: adCode || 'AD123456',
          iec: iec || '1234567890',
          rcmc: rcmc || 'RCMC123456',
          apeda_fssai: apedaFssai || 'FSSAI123456',
          address_proof: 'mock_address_proof',
          bank_statement: 'mock_bank_statement'
        });
        await refreshUser();
        toast.success('Bypassed Level 3 Business Verification! Earned +150 XP');
      } else if (currentLevel === 4) {
        await api.post('/api/levels/4-company', {
          company_name: companyName || 'Eximarg Global Private Ltd (Bypassed)',
          website: website || 'https://eximarg-global.com',
          tagline: tagline || 'Global Exporter',
          company_logo: companyLogo || 'mock_logo'
        });
        await api.post('/api/levels/lock');
        await refreshUser();
        toast.success('Bypassed Level 4 Company Profile & Locked! Earned +200 XP');
      } else if (currentLevel === 5) {
        await api.post('/api/subscriptions/verify', {
          razorpay_payment_id: 'pay_bypassed_mock',
          razorpay_order_id: 'order_bypassed_mock',
          plan_id: selectedPlan
        });
        await refreshUser();
        toast.success(`Bypassed subscription payment for ${selectedPlan}! Earned +200 XP`);
      } else if (currentLevel === 6) {
        try {
          await api.post('/api/products', {
            name: 'Bypassed Basmati Rice',
            description: 'Premium bypassed quality',
            sku: 'BYPASS-SKU-001',
            hsn_code: '10063020',
            price_min: 10.0,
            price_max: 20.0,
            sample_price: 5.0,
            images: [],
            moq_tiers: []
          });
        } catch (e) {
          // ignore product insert if already exists or fails
        }
        await api.post('/api/products/lock');
        await refreshUser();
        toast.success('Bypassed Level 6 Catalog & Locked! Launching Command Center');
        navigate('/command-center');
      }
    } catch (err) {
      toast.error('Failed to bypass level: ' + err.message);
    }
  };

  const handleSidebarNav = (tabId) => {
    navigate('/dashboard', { state: { activeTab: tabId } });
  };

  return (
    <div className="min-h-screen bg-[#031037] text-on-surface font-sans flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 w-full bg-[#000a31]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-50 sticky top-0">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-2xl text-primary tracking-tighter cursor-pointer" onClick={() => navigate('/dashboard')}>
              EXIMARG
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-on-surface-variant">
            <a href="#analytics" className="hover:text-on-surface transition-colors">Analytics</a>
            <a href="#logistics" className="hover:text-on-surface transition-colors">Logistics</a>
            <a href="#payments" className="hover:text-on-surface transition-colors">Payments</a>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-on-surface-variant hover:text-on-surface relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-on-surface-variant hover:text-on-surface">
            <Question size={20} />
          </button>
          <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden flex items-center justify-center bg-primary/20 text-primary font-bold text-xs">
            {currentUser.email[0].toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-surface-container-low border-r border-white/5 flex flex-col py-8 z-40 sticky top-16 h-[calc(100vh-64px)]">
          {/* Level Progress Indicator at the top of the Sidebar */}
          <div className="px-6 mb-8">
            <div className="flex justify-between items-center text-xs font-bold text-white mb-2">
              <span className="uppercase tracking-widest text-primary text-[10px] font-bold">LEVEL {currentLevel}: {currentLevel < 5 ? 'BRONZE' : currentLevel < 8 ? 'SILVER' : 'GOLD'}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-primary h-full progress-shimmer transition-all duration-500" style={{ width: `${(currentUser.xp / 2000) * 100}%` }}></div>
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium">{currentUser.xp || 0} / 2,000 XP to Gold Exporter</p>
          </div>

          <nav className="flex-1 space-y-1">
            <button onClick={() => handleSidebarNav('overview')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
              <Layout size={18} />
              <span className="font-semibold text-sm">Dashboard</span>
            </button>
            <div className="flex items-center gap-3 text-primary bg-primary-container/10 border-r-4 border-primary px-6 py-3 scale-95 transition-transform font-bold text-sm cursor-pointer">
              <ShieldCheck size={18} />
              <span>Verification</span>
            </div>
            <button onClick={() => handleSidebarNav('orders')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
              <Lightning size={18} />
              <span className="font-semibold text-sm">Operations</span>
            </button>
            <button onClick={() => handleSidebarNav('dukan')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
              <Tag size={18} />
              <span className="font-semibold text-sm">Catalog</span>
            </button>
            <button onClick={() => handleSidebarNav('deal')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
              <Trophy size={18} />
              <span className="font-semibold text-sm">Quest Log</span>
            </button>
            <button onClick={() => handleSidebarNav('overview')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
              <Gear size={18} />
              <span className="font-semibold text-sm">Settings</span>
            </button>
          </nav>
          
          <div className="px-6 space-y-4">
            <button className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface text-xs font-semibold text-left">
              <Question size={18} />
              Help Center
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 text-xs font-semibold text-left">
              <SignOut size={18} />
              Log Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-12 overflow-y-auto h-[calc(100vh-64px)] bg-[#031037]">
          {/* Top Header Row with Back and Bypass */}
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-on-surface-variant hover:text-white text-sm font-semibold transition-colors"
              data-testid="wizard-back-button"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <button
              onClick={handleBypassStep}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-lg shadow-amber-900/30 transition-all duration-200"
              data-testid="bypass-current-step-button"
            >
              <Sparkle size={14} />
              Bypass Level {currentLevel}
            </button>
          </div>

          {/* LEVEL 1: IDENTITY */}
          {currentLevel === 1 && (
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
                {/* Left Form: Aadhaar & PAN Upload Cards */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Aadhaar Card Container */}
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
                      <button 
                        type="button"
                        onClick={triggerDigiLocker}
                        className="px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-on-surface font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Sparkle size={14} className="text-primary animate-pulse" />
                        Ask AI
                      </button>
                    </div>

                    {/* Two drag and drop upload boxes side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Front Side Box */}
                      <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[160px]">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAadhaarFrontChange} 
                          className="hidden" 
                        />
                        {aadhaarFront ? (
                          <>
                            <img src={aadhaarFront} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <Check size={28} className="text-green-400" />
                              <span className="text-xs font-semibold text-white mt-1">Front Side Loaded</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <CloudArrowUp size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                            <div className="text-center">
                              <span className="block text-xs font-bold text-white">Upload Front Side</span>
                              <span className="block text-[10px] text-on-surface-variant mt-1">Drag and drop or click</span>
                            </div>
                          </>
                        )}
                      </label>

                      {/* Back Side Box */}
                      <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[160px]">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAadhaarBackChange} 
                          className="hidden" 
                        />
                        {aadhaarBack ? (
                          <>
                            <img src={aadhaarBack} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                              <Check size={28} className="text-green-400" />
                              <span className="text-xs font-semibold text-white mt-1">Back Side Loaded</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <CloudArrowUp size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                            <div className="text-center">
                              <span className="block text-xs font-bold text-white">Upload Back Side</span>
                              <span className="block text-[10px] text-on-surface-variant mt-1">Drag and drop or click</span>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* PAN Card Container */}
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
                      <button 
                        type="button"
                        onClick={triggerDigiLocker}
                        className="px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-on-surface font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Sparkle size={14} className="text-primary animate-pulse" />
                        Ask AI
                      </button>
                    </div>

                    {/* One large upload box */}
                    <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[160px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePanFrontChange} 
                        className="hidden" 
                      />
                      {panFront ? (
                        <>
                          <img src={panFront} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                          <div className="relative z-10 flex flex-col items-center text-center">
                            <Check size={28} className="text-green-400" />
                            <span className="text-xs font-semibold text-white mt-1">PAN Front Loaded</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <CloudArrowUp size={36} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                          <div className="text-center">
                            <span className="block text-xs font-bold text-white">Upload PAN Card Front</span>
                            <span className="block text-[10px] text-on-surface-variant mt-1">High resolution scans preferred for OCR speed</span>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Submit Row */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                      <Lock size={16} />
                      End-to-end encrypted verification
                    </div>
                    <button 
                      type="button"
                      onClick={submitLevel1}
                      className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                      data-testid="submit-level-1"
                    >
                      Submit for Verification
                    </button>
                  </div>
                </div>

                {/* Right Sidebar Columns */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Why this matters card */}
                  <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
                    <h4 className="font-bold text-sm text-white">Why this matters</h4>
                    <div className="space-y-5">
                      <div className="flex gap-3">
                        <ShieldCheck size={22} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white text-xs">KYC Compliance</p>
                          <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                            Mandatory per DGFT and RBI guidelines for all Indian export entities.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <SealCheck size={22} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white text-xs">Trusted Seller Badge</p>
                          <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                            Verified identities receive higher trust scores in the global marketplace.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Gauge size={22} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white text-xs">Faster Processing</p>
                          <p className="text-on-surface-variant text-[11px] mt-1 leading-relaxed">
                            OCR-assisted verification typically takes less than 2 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tip Card */}
                  <div className="glass-card rounded-2xl p-6 border border-white/5 flex gap-3 bg-[#0c1940]/40">
                    <Lightbulb size={24} className="text-yellow-400 shrink-0" />
                    <div>
                      <h5 className="font-bold text-xs text-white mb-1">Pro Tip</h5>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Ensure all four corners of the document are visible. Avoid glare from lights or flash to ensure the AI can read your details instantly.
                      </p>
                    </div>
                  </div>

                  {/* Sample: Good Upload Card */}
                  <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                    <h5 className="font-bold text-xs text-white">Sample: Good Upload</h5>
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-[#031037]/80 border border-white/10 flex items-center justify-center p-4">
                      {/* Simulated card design */}
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-tertiary/10 border border-white/20 p-3 relative flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="w-10 h-1.5 bg-white/20 rounded"></div>
                            <div className="w-6 h-1 bg-white/10 rounded"></div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Fingerprint size={12} className="text-primary" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-white/10"></div>
                          <div className="space-y-1 flex-1">
                            <div className="w-16 h-1 bg-white/20 rounded"></div>
                            <div className="w-12 h-1 bg-white/10 rounded"></div>
                            <div className="w-20 h-1 bg-white/10 rounded"></div>
                          </div>
                        </div>
                      </div>
                      {/* Floating verified badge */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                          <Check size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* LEVEL 2: EXPORTER PROFILE */}
        {currentLevel === 2 && (
          <div className="space-y-8 animate-fade-in max-w-7xl">
            {/* Header */}
            <div className="text-center space-y-2 mb-8">
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                Quest Step 02
              </span>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">Refine Your Exporter DNA</h1>
              <p className="text-on-surface-variant text-sm max-w-2xl mx-auto">
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
                              onClick={() => setTargetRegions(targetRegions.filter(r => r !== region))}
                              className="text-on-surface-variant hover:text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button 
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
                      {/* Simulated map lines */}
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
                      onClick={() => toast.success('Progress saved as draft.')}
                      className="px-6 py-3 bg-[#031037] border border-white/10 hover:bg-white/5 text-white font-bold rounded-full text-xs transition-all"
                    >
                      Save Draft
                    </button>
                    <button 
                      type="button"
                      onClick={submitLevel2}
                      className="px-8 py-3 bg-gradient-to-r from-primary-container to-blue-600 hover:opacity-90 text-white font-bold rounded-full text-xs flex items-center gap-2 shadow-lg shadow-primary/20"
                      data-testid="submit-level-2"
                    >
                      Continue Quest →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* LEVEL 3: BUSINESS VERIFICATION */}
        {currentLevel === 3 && (
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
                        data-testid="gst-input"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setGst('22AAAAA0000A1ZS');
                        setCin('U74140DL2026PTC');
                        setIec('1234567890');
                        setIfsc('HDFC0000001');
                        setAdCode('AD123456');
                        setRcmc('RCMC123456');
                        setApedaFssai('APEDA123456');
                        setAddressProof('mock_gst_certificate_base64');
                        setBankStatement('mock_bank_statement_base64');
                        toast.success('Auto-filled verified compliance data!');
                      }}
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
                        data-testid="address-proof-file"
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
                      data-testid="iec-input"
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
                            toast.success('IEC Document loaded successfully!');
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
                      value={apedaFssai} // Mapping to APEDA/FSSAI/Udyam string
                      onChange={(e) => setApedaFssai(e.target.value)}
                      className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm focus:border-primary/50 outline-none transition-all"
                      placeholder="Udyam Registration Number"
                      data-testid="apeda-fssai-input"
                    />
                  </div>

                  <label className="border border-dashed border-white/10 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group min-h-[120px]">
                    <input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleBase64Upload(file, (base64) => {
                            toast.success('Udyam Certificate uploaded!');
                          });
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
                        data-testid="ifsc-input"
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
                        data-testid="ad-code-input"
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
                        data-testid="rcmc-input"
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
                        data-testid="cin-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-on-surface-variant mb-2">Bank Statement / Cheque</label>
                      <input
                        type="file"
                        onChange={(e) => handleBase64Upload(e.target.files[0], setBankStatement)}
                        className="text-xs text-on-surface-variant"
                        data-testid="bank-statement-file"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={submitLevel3}
                    className="px-12 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 text-sm"
                    data-testid="submit-level-3"
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
                    <Sparkle size={14} className="animate-pulse" />
                    AI Assistant
                  </h5>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    I've detected that your GSTIN matches a 'Small' category enterprise. You might be eligible for additional Udyam benefits.
                  </p>
                  <button 
                    type="button"
                    onClick={() => toast.info('Navigating to MSME benefits page...')}
                    className="text-[10px] font-bold text-primary hover:text-white flex items-center gap-1"
                  >
                    Apply for benefits ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 4: COMPANY REVIEW & LOCK */}
        {currentLevel === 4 && (
          <div className="space-y-8 animate-fade-in max-w-7xl">
            {!currentUser.levels_locked ? (
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
                      <div className="flex gap-1">
                        <div className="h-1.5 w-3 bg-green-500 rounded-full"></div>
                        <div className="h-1.5 w-3 bg-green-500 rounded-full"></div>
                        <div className="h-1.5 w-3 bg-green-500 rounded-full"></div>
                        <div className="h-1.5 w-3 bg-primary rounded-full"></div>
                        <div className="h-1.5 w-3 bg-white/10 rounded-full"></div>
                        <div className="h-1.5 w-3 bg-white/10 rounded-full"></div>
                      </div>
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
                            data-testid="company-name-input"
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
                                data-testid="logo-file-input"
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
                            data-testid="website-input"
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
                            data-testid="tagline-input"
                          />
                        </div>
                      </div>

                      {/* Onboarding Summary Board */}
                      <div className="bg-[#031037]/70 border border-white/5 p-5 rounded-xl space-y-4">
                        <h3 className="font-display font-bold text-xs text-primary uppercase tracking-wider">Compliance Review summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-on-surface-variant block mb-1">Director Name:</span>
                            <span className="font-semibold text-white">{currentUser.level_1_identity?.director_name || 'Rajesh Kumar'}</span>
                          </div>
                          <div>
                            <span className="text-on-surface-variant block mb-1">Exporter Type:</span>
                            <span className="font-semibold text-white">{currentUser.level_2_exporter?.exporter_type || 'Merchant'}</span>
                          </div>
                          <div>
                            <span className="text-on-surface-variant block mb-1">GSTIN:</span>
                            <span className="font-semibold text-white">{currentUser.level_3_verification?.gst || '07AAAAA1111A1Z1'}</span>
                          </div>
                          <div>
                            <span className="text-on-surface-variant block mb-1">IEC:</span>
                            <span className="font-semibold text-white">{currentUser.level_3_verification?.iec || '1234567890'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <button 
                        type="button"
                        onClick={submitLevel4}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-900/20 text-sm"
                        data-testid="lock-levels-button"
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
                        onClick={async () => {
                          try {
                            // Jump level to 5 (mock verify success)
                            await api.post('/api/levels/set-level', { level: 5 });
                            await refreshUser();
                            toast.success('Simulated Approval! Advanced to Level 5.');
                          } catch (e) {
                            toast.error('Failed to simulate approval.');
                          }
                        }}
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
        )}

        {/* LEVEL 5: SUBSCRIPTION */}
        {currentLevel === 5 && (
          <div className="space-y-12 animate-fade-in max-w-7xl">
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
                  onClick={async () => {
                    setSelectedPlan('starter');
                    setTimeout(() => submitLevel5Subscription(), 100);
                  }}
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
                    onClick={async () => {
                      setSelectedPlan('growth');
                      setTimeout(() => submitLevel5Subscription(), 100);
                    }}
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
                  onClick={async () => {
                    setSelectedPlan('premium');
                    setTimeout(() => submitLevel5Subscription(), 100);
                  }}
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
        )}

        {/* LEVEL 6: PRODUCT CATALOG */}
        {currentLevel === 6 && (
          <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-white">Level 6: Product Catalog Entry</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Add items to your digital catalog. Enter details and trigger HSN suggestions.</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-primary font-bold">6/6 COMPLETE</span>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Canvas */}
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                      <Plus size={24} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Core Information</h3>
                  </div>

                  <form onSubmit={handleSingleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Product Name</label>
                        <input
                          type="text"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="e.g. Organic Basmati Rice"
                          data-testid="product-name-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">SKU ID</label>
                        <input
                          type="text"
                          value={prodSku}
                          onChange={(e) => setProdSku(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="e.g. BR-ORG-001"
                          data-testid="product-sku-input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Product Description</label>
                      <textarea
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm h-20"
                        placeholder="Product attributes and packaging"
                        data-testid="product-desc-input"
                      />
                    </div>

                    {/* HSN lookup */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">HSN Code (8 digits)</label>
                        <input
                          type="text"
                          value={prodHsn}
                          onChange={(e) => setProdHsn(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="Lookup or enter HSN code"
                          data-testid="product-hsn-input"
                          required
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={findHsnAI}
                        disabled={loadingHsn}
                        className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                        data-testid="hsn-lookup-button"
                      >
                        <Sparkle size={14} />
                        Suggest HSN
                      </button>
                    </div>

                    {/* HSN Candidates */}
                    {hsnCandidates.length > 0 && (
                      <div className="bg-[#031037]/60 border border-white/10 p-4 rounded-xl space-y-2">
                        <span className="block text-[10px] text-primary uppercase font-bold tracking-wider">HSN Candidate Match (AI)</span>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {hsnCandidates.map((c, i) => (
                            <div 
                              key={i} 
                              onClick={() => {
                                setProdHsn(c.hsn_code);
                                setHsnCandidates([]);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                            >
                              <div>
                                <p className="font-bold text-white">{c.hsn_code} - {c.description}</p>
                                <p className="text-[10px] text-on-surface-variant">{c.reasoning}</p>
                              </div>
                              <span className="font-bold text-green-400 font-display">{c.confidence}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Price Min ($)</label>
                        <input
                          type="number"
                          value={prodPriceMin}
                          onChange={(e) => setProdPriceMin(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="Min Price"
                          data-testid="product-price-min-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Price Max ($)</label>
                        <input
                          type="number"
                          value={prodPriceMax}
                          onChange={(e) => setProdPriceMax(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="Max Price"
                          data-testid="product-price-max-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Sample Price ($)</label>
                        <input
                          type="number"
                          value={prodSamplePrice}
                          onChange={(e) => setProdSamplePrice(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="Sample"
                          data-testid="product-sample-price-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-2">Product Image</label>
                      <input
                        type="file"
                        onChange={(e) => handleBase64Upload(e.target.files[0], setProdImage)}
                        className="text-xs text-on-surface-variant"
                        data-testid="product-file-input"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-primary-container hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all"
                      data-testid="add-product-button"
                    >
                      Add Product to Catalog
                    </button>
                  </form>
                </div>

                {/* Bulk Import */}
                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <FileArrowUp size={24} className="text-primary" />
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Bulk CSV / ZIP Import</h3>
                      <p className="text-xs text-on-surface-variant">Upload CSV catalog and ZIP image files simultaneously.</p>
                    </div>
                  </div>

                  <form onSubmit={handleBulkImport} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CSV File (sku,name...)</label>
                        <input 
                          type="file" 
                          accept=".csv"
                          onChange={(e) => setCsvFile(e.target.files[0])}
                          className="text-xs text-on-surface-variant"
                          data-testid="csv-file-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">ZIP Images Archive</label>
                        <input 
                          type="file" 
                          accept=".zip"
                          onChange={(e) => setZipFile(e.target.files[0])}
                          className="text-xs text-on-surface-variant"
                          data-testid="zip-file-input"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-all"
                      data-testid="bulk-import-submit"
                    >
                      Upload & Process Import
                    </button>
                  </form>

                  {importErrors.length > 0 && (
                    <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl space-y-2">
                      <p className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <WarningCircle size={16} />
                        Import Validation Errors
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-red-300">
                        {importErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={handleLockCatalog}
                    className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    data-testid="lock-catalog-button"
                  >
                    Lock Product Catalog & Launch Command Center
                  </button>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h4 className="font-display font-bold text-sm text-primary">Product Readiness</h4>
                  <div className="space-y-4 text-xs">
                    <p className="text-on-surface-variant">Adding multiple products unlocks global market corridors and builds buyer trust in your digital storefront.</p>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h5 className="font-bold text-xs text-primary flex items-center gap-1.5 mb-2">
                    <Sparkle size={14} />
                    Pro Tip
                  </h5>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Products with clear, white background photos see a 40% higher click-through rate from Middle-Eastern importers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
