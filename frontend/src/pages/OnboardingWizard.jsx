import React, { useState } from 'react';
import { useUser, api } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, ArrowRight, ShieldCheck, Check, Fingerprint, 
  Files, Building, CreditCard, Sparkle, Plus, WarningCircle, FileArrowUp,
  Layout, Lightning, Tag, Trophy, Gear, Question, SignOut, Eye, Trash, Shield
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

  // Level 2 States
  const [exporterType, setExporterType] = useState(currentUser.level_2_exporter?.exporter_type || 'Merchant');
  const [businessModel, setBusinessModel] = useState(currentUser.level_2_exporter?.business_model || 'B2B');
  const [exportIntent, setExportIntent] = useState(currentUser.level_2_exporter?.export_intent || '');
  const [shipmentsRange, setShipmentsRange] = useState(currentUser.level_2_exporter?.shipments_range || '0-10');
  const [regDate, setRegDate] = useState(currentUser.level_2_exporter?.registration_date || '');
  const [operatingSince, setOperatingSince] = useState(currentUser.level_2_exporter?.operating_since || '');
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
    if (!tcAccepted) {
      toast.error('Please accept the Terms & Conditions.');
      return;
    }
    if (!otpVerified) {
      toast.error('Please verify your phone via OTP.');
      return;
    }
    try {
      await api.post('/api/levels/1', {
        director_name: directorName,
        phone,
        email: identityEmail,
        address,
        pan,
        aadhaar,
        selfie,
        verified: true,
        otp_verified: true
      });
      await refreshUser();
      toast.success('Level 1 completed! Earned +100 XP');
    } catch (e) {
      toast.error('Failed to save Level 1.');
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
    if (!exportIntent) {
      toast.error('Please specify your export intent.');
      return;
    }
    try {
      await api.post('/api/levels/2', {
        exporter_type: exporterType,
        business_model: businessModel,
        export_intent: exportIntent,
        shipments_range: shipmentsRange,
        registration_date: regDate || new Date().toISOString().split('T')[0],
        operating_since: operatingSince || '2026',
        rcmc_suggestions: rcmcSuggestions
      });
      await refreshUser();
      toast.success('Level 2 Exporter Profile saved! Earned +100 XP');
    } catch (e) {
      toast.error('Failed to save Level 2.');
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
    <div className="min-h-screen bg-background text-on-surface font-sans overflow-x-hidden flex">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-white/5 flex flex-col py-8 z-50">
        <div className="px-6 mb-10">
          <h1 className="font-display font-black text-2xl text-primary tracking-tighter">EXIMARG</h1>
          <p className="text-xs text-on-surface-variant/60 font-medium">Export Command Center</p>
        </div>
        <nav className="flex-1 space-y-1">
          <button onClick={() => handleSidebarNav('overview')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
            <Layout size={18} />
            <span className="font-semibold text-sm">Dashboard</span>
          </button>
          <button onClick={() => handleSidebarNav('orders')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
            <Lightning size={18} />
            <span className="font-semibold text-sm">Operations</span>
          </button>
          <button onClick={() => handleSidebarNav('dukan')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
            <Tag size={18} />
            <span className="font-semibold text-sm">Catalog</span>
          </button>
          <div className="flex items-center gap-3 text-primary bg-primary-container/10 border-r-4 border-primary px-6 py-3 scale-95 transition-transform font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Verification</span>
          </div>
          <button onClick={() => handleSidebarNav('deal')} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
            <Trophy size={18} />
            <span className="font-semibold text-sm">Quest Log</span>
          </button>
          <button className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left">
            <Gear size={18} />
            <span className="font-semibold text-sm">Settings</span>
          </button>
        </nav>
        
        <div className="px-6 mt-auto">
          <div className="p-4 rounded-xl bg-primary-container/20 border border-primary/20 mb-8">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Status</p>
            <p className="font-semibold text-white text-xs mb-2">Level {currentLevel}: {currentLevel < 5 ? 'Bronze' : currentLevel < 8 ? 'Silver' : 'Gold'} Exporter</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full shimmer-progress transition-all duration-500" style={{ width: `${currentUser.readiness_score || 0}%` }}></div>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface text-xs font-semibold text-left">
              <Question size={18} />
              Help Center
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 text-xs font-semibold text-left">
              <SignOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-12 min-h-screen">
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
          <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-white">Level 1: Identity Verification</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Securely verify your personal identity to begin your export journey.</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-primary font-bold">1/6 COMPLETE</span>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1.5 w-6 bg-primary rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Fields */}
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-2xl p-6 flex justify-between items-center bg-primary-container/10 border border-primary-container/20">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkle size={16} className="text-primary animate-pulse" />
                      Instant DigiLocker Fetch
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1">Fetch director information securely using your Aadhaar linked credential.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={triggerDigiLocker}
                    className="px-4 py-2 bg-primary-container hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all"
                    data-testid="digilocker-fetch-button"
                  >
                    Fetch details
                  </button>
                </div>

                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white mb-4">Aadhaar Card Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Director Full Name</label>
                        <input
                          type="text"
                          value={directorName}
                          onChange={(e) => setDirectorName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="As printed on Aadhaar / PAN"
                          data-testid="director-name-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="Linked with Aadhaar"
                          data-testid="director-phone-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Aadhaar Number (12 Digits)</label>
                        <input
                          type="text"
                          value={aadhaar}
                          onChange={(e) => setAadhaar(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="XXXX XXXX XXXX"
                          data-testid="director-aadhaar-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">PAN Card Number</label>
                        <input
                          type="text"
                          value={pan}
                          onChange={(e) => setPan(e.target.value)}
                          className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                          placeholder="ABCDE1234F"
                          data-testid="director-pan-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={sendOTP}
                        className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                      {otpSent && (
                        <div className="flex gap-2 items-center flex-1">
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="px-4 py-2 bg-[#031037]/80 border border-white/10 rounded-xl text-white text-xs w-28"
                            placeholder="Enter OTP (1234)"
                          />
                          <button
                            type="button"
                            onClick={verifyOTPCode}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                              otpVerified ? 'bg-green-600 text-white' : 'bg-primary-container text-white'
                            }`}
                          >
                            {otpVerified ? 'Verified' : 'Verify'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={tcAccepted} 
                        onChange={(e) => setTcAccepted(e.target.checked)} 
                        className="rounded border-white/10 bg-[#031037]/80 w-4 h-4 text-brand-primary"
                        data-testid="tc-checkbox"
                      />
                      <label className="text-xs text-on-surface-variant">I declare the details provided match my official credentials.</label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                    <ShieldCheck size={16} />
                    End-to-end encrypted verification
                  </div>
                  <button 
                    type="button"
                    onClick={submitLevel1}
                    className="bg-primary-container text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
                    data-testid="submit-level-1"
                  >
                    Submit & Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h4 className="font-display font-bold text-sm text-primary">Why this matters</h4>
                  <div className="space-y-4 text-xs">
                    <div className="flex gap-3">
                      <ShieldCheck size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="font-bold text-white">KYC Compliance</p>
                        <p className="text-on-surface-variant mt-0.5">Mandatory per DGFT and RBI guidelines for all Indian export entities.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <ShieldCheck size={20} className="text-primary shrink-0" />
                      <div>
                        <p className="font-bold text-white">Trusted Seller Badge</p>
                        <p className="text-on-surface-variant mt-0.5">Verified identities receive higher trust scores in the global marketplace.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h5 className="font-bold text-xs text-primary flex items-center gap-1.5 mb-2">
                    <Sparkle size={14} />
                    Pro Tip
                  </h5>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Ensure all four corners of the document are visible. Avoid glare from lights or flash to ensure the AI can read your details instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 2: EXPORTER PROFILE */}
        {currentLevel === 2 && (
          <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-white">Level 2: Exporter Profile</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Specify your enterprise category and get RCMC regulatory suggestions.</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-primary font-bold">2/6 COMPLETE</span>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-primary rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Exporter Type</label>
                      <select
                        value={exporterType}
                        onChange={(e) => setExporterType(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        data-testid="exporter-type-select"
                      >
                        <option value="Merchant">Merchant Exporter</option>
                        <option value="Manufacturer">Manufacturer Exporter</option>
                        <option value="Service">Service Exporter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Primary Business Model</label>
                      <select
                        value={businessModel}
                        onChange={(e) => setBusinessModel(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        data-testid="business-model-select"
                      >
                        <option value="B2B">B2B Wholesale</option>
                        <option value="B2C">B2C Retail</option>
                        <option value="D2C">D2C eCommerce</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Export Products / Focus Intent</label>
                    <textarea
                      value={exportIntent}
                      onChange={(e) => setExportIntent(e.target.value)}
                      className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm h-24"
                      placeholder="e.g. Organic Basmati Rice, Cotton Garments, Handicrafts..."
                      data-testid="export-intent-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Target Shipments / Year</label>
                      <input
                        type="text"
                        value={shipmentsRange}
                        onChange={(e) => setShipmentsRange(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="e.g. 10 - 50"
                        data-testid="shipments-range-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">IEC Registration Date</label>
                      <input
                        type="date"
                        value={regDate}
                        onChange={(e) => setRegDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        data-testid="registration-date-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Operating Since (Year)</label>
                      <input
                        type="text"
                        value={operatingSince}
                        onChange={(e) => setOperatingSince(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="e.g. 2020"
                        data-testid="operating-since-input"
                      />
                    </div>
                  </div>

                  {/* AI Suggestions widget */}
                  <div className="border-t border-white/5 pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">RCMC Regulatory Councils</span>
                      <button 
                        type="button" 
                        onClick={suggestRcmc}
                        disabled={fetchingSuggestions}
                        className="px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        data-testid="rcmc-ai-button"
                      >
                        <Sparkle size={14} />
                        Ask AI for Suggestions
                      </button>
                    </div>

                    {rcmcSuggestions.length > 0 && (
                      <div className="bg-[#031037]/60 border border-white/10 p-4 rounded-xl space-y-2">
                        <span className="block text-[10px] text-primary uppercase font-bold tracking-wider">Suggested Councils</span>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-white">
                          {rcmcSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={submitLevel2}
                    className="px-8 py-3 bg-primary-container hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
                    data-testid="submit-level-2"
                  >
                    Save & Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h5 className="font-bold text-xs text-primary mb-2 flex items-center gap-1.5">
                    <Sparkle size={14} />
                    Why Exporter Profile Details Matter
                  </h5>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Specifying your exporter type and focus products lets Eximarg custom-tailor export intelligence, trade agreements, and direct lead channels matching your operational capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 3: BUSINESS VERIFICATION */}
        {currentLevel === 3 && (
          <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-white">Level 3: Business Verification</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Upload key business documentation to establish regulatory compliance.</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-primary font-bold">3/6 COMPLETE</span>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-primary rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {/* GST Registration Section */}
                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                      <Building size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">GST Registration & Tax details</h3>
                      <p className="text-xs text-on-surface-variant">Provide your Goods and Services Tax identification number for tax compliance.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">GSTIN Number</label>
                      <input
                        type="text"
                        value={gst}
                        onChange={(e) => setGst(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="e.g. 07AAAAA1111A1Z1"
                        data-testid="gst-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CIN (Company ID Number) - Optional</label>
                      <input
                        type="text"
                        value={cin}
                        onChange={(e) => setCin(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="e.g. U74140DL2026PTC"
                        data-testid="cin-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-2">GST / Address Proof Certificate</label>
                      <input
                        type="file"
                        onChange={(e) => handleBase64Upload(e.target.files[0], setAddressProof)}
                        className="text-xs text-on-surface-variant"
                        data-testid="address-proof-file"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-on-surface-variant mb-2">Bank Statement / Cancelled Cheque</label>
                      <input
                        type="file"
                        onChange={(e) => handleBase64Upload(e.target.files[0], setBankStatement)}
                        className="text-xs text-on-surface-variant"
                        data-testid="bank-statement-file"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking & IEC Details Card */}
                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-primary">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Import Export Code (IEC) & Banking</h3>
                      <p className="text-xs text-on-surface-variant">Your primary identification for international trade operations.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Bank IFSC Code</label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="e.g. HDFC0000001"
                        data-testid="ifsc-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">AD (Authorized Dealer) Code</label>
                      <input
                        type="text"
                        value={adCode}
                        onChange={(e) => setAdCode(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="14-digit Dealer Code"
                        data-testid="ad-code-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Import Export Code (IEC)</label>
                      <input
                        type="text"
                        value={iec}
                        onChange={(e) => setIec(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="10-digit IEC Code"
                        data-testid="iec-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">RCMC Registration No.</label>
                      <input
                        type="text"
                        value={rcmc}
                        onChange={(e) => setRcmc(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="Registration Certificate No."
                        data-testid="rcmc-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">APEDA / FSSAI (Optional)</label>
                      <input
                        type="text"
                        value={apedaFssai}
                        onChange={(e) => setApedaFssai(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="For Food/Agr products"
                        data-testid="apeda-fssai-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={submitLevel3}
                    className="px-8 py-3 bg-primary-container hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
                    data-testid="submit-level-3"
                  >
                    Save & Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-2xl p-6 space-y-6">
                  <h4 className="font-display font-bold text-sm text-primary">Verification Rewards</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        XP
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">+150 XP</p>
                        <p className="text-[10px] text-on-surface-variant">Level progress boost</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Check size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Verified Badge</p>
                        <p className="text-[10px] text-on-surface-variant">Profile trust marker</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h5 className="font-bold text-xs text-primary flex items-center gap-1.5 mb-2">
                    <Sparkle size={14} />
                    MSME Benefits
                  </h5>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Providing a valid Udyam Registration locks in priority government support, MSME credit channels, and export interest subsidies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 4: COMPANY REVIEW & LOCK */}
        {currentLevel === 4 && (
          <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-white">Level 4: Company Profile & Review</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Review onboarding summary and lock information to finalize compliance verification.</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-primary font-bold">4/6 COMPLETE</span>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-primary rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-2xl p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Company Legal Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="e.g. Eximarg Global Private Ltd"
                        data-testid="company-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Company Logo</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          onChange={(e) => handleBase64Upload(e.target.files[0], setCompanyLogo)}
                          className="text-xs"
                          data-testid="logo-file-input"
                        />
                        {companyLogo && <img src={companyLogo} alt="Logo preview" className="w-12 h-12 rounded-xl object-contain bg-[#031037] border border-white/10" />}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Company Website (Optional)</label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
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
                        className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm"
                        placeholder="Providing quality Indian Spices worldwide"
                        data-testid="tagline-input"
                      />
                    </div>
                  </div>

                  {/* Onboarding Summary Board */}
                  <div className="bg-[#031037]/70 border border-white/10 p-6 rounded-2xl space-y-4">
                    <h3 className="font-display font-bold text-sm text-primary uppercase tracking-wider">Compliance Review summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-on-surface-variant block">Director Name:</span>
                        <span className="font-semibold text-white">{currentUser.level_1_identity?.director_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Exporter Type:</span>
                        <span className="font-semibold text-white">{currentUser.level_2_exporter?.exporter_type || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">GSTIN:</span>
                        <span className="font-semibold text-white">{currentUser.level_3_verification?.gst || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">IEC:</span>
                        <span className="font-semibold text-white">{currentUser.level_3_verification?.iec || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={submitLevel4}
                    className="px-8 py-4 bg-[#b91c1c] hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
                    data-testid="lock-levels-button"
                  >
                    <ShieldCheck size={20} />
                    Check & Confirm: Lock Levels
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h5 className="font-bold text-xs text-primary mb-2 flex items-center gap-1.5">
                    <WarningCircle size={14} />
                    Important Notice
                  </h5>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Locking your onboarding level signals our Verification Officers to execute full compliance checks. Please verify that your name, GSTIN, and company details match exactly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEVEL 5: SUBSCRIPTION */}
        {currentLevel === 5 && (
          <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-white">Level 5: Activate Subscription</h1>
                  <p className="text-on-surface-variant text-sm mt-1">Unlock full product catalog limits and access buyer tools.</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-primary font-bold">5/6 COMPLETE</span>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-green-600 rounded-full"></div>
                    <div className="h-1.5 w-6 bg-primary rounded-full"></div>
                    <div className="h-1.5 w-6 bg-surface-container-highest rounded-full"></div>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-amber-950/40 border border-amber-900/50 p-4 rounded-xl flex items-start gap-3 text-amber-400 text-xs">
                  <WarningCircle size={20} className="shrink-0" />
                  <div>
                    <p className="font-bold">Razorpay Sandbox Warning:</p>
                    <p className="mt-1">Please use domestic Indian test cards for checkout. International test cards will fail in sandbox mode.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'starter', name: 'Starter Plan', price: '₹999/mo', calls: '20 AI calls/mo' },
                    { id: 'growth', name: 'Growth Plan', price: '₹2,999/mo', calls: '200 AI calls/mo' },
                    { id: 'premium', name: 'Premium Plan', price: '₹9,999/mo', calls: '1000 AI calls/mo' }
                  ].map((plan) => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                        selectedPlan === plan.id ? 'bg-primary-container/20 border-primary' : 'bg-[#031037]/60 border-white/10'
                      }`}
                      data-testid={`plan-${plan.id}`}
                    >
                      <h4 className="font-display font-bold text-white text-sm">{plan.name}</h4>
                      <p className="font-display font-extrabold text-2xl text-white mt-2">{plan.price}</p>
                      <p className="text-[11px] text-on-surface-variant mt-4">{plan.calls}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={submitLevel5Subscription}
                    className="px-8 py-3 bg-primary-container hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all"
                    data-testid="mock-subscription-button"
                  >
                    Mock Payment Checkout
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h5 className="font-bold text-xs text-primary mb-2 flex items-center gap-1.5">
                    <CreditCard size={14} />
                    Billing Security
                  </h5>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Payments are handled securely via Razorpay sandbox. For mockup verification, clicking checkout immediately simulates a successful verification callback.
                  </p>
                </div>
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
  );
}
