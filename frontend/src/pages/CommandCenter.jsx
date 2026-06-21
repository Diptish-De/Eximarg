import React, { useState, useEffect } from 'react';
import { useUser, api } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  ArrowLeft, Layout, Building, Users, Tag, Notebook, 
  Chat, Trophy, FileText, CheckCircle, Plus, Trash, Eye, PaperPlaneRight, FileArrowUp,
  Lightning, SealCheck, SignOut, Lock, LockOpen, WarningCircle, Sparkle, Gear, Question,
  ShieldCheck
} from '@phosphor-icons/react';

import Sidebar from '@/components/Sidebar';
import StatsGrid from '@/components/StatsGrid';

export default function CommandCenter() {
  const { currentUser, refreshUser, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');

  // Products state (Digital Dukan)
  const [products, setProducts] = useState([]);
  // Invoices state
  const [invoices, setInvoices] = useState([]);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [showInvoiceWizard, setShowInvoiceWizard] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Level 7 Invoice Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  
  const [sellerName, setSellerName] = useState(currentUser.level_4_company?.company_name || '');
  const [sellerAddress, setSellerAddress] = useState(currentUser.level_1_identity?.address || '');

  const [invoiceProducts, setInvoiceProducts] = useState([]); // Array of { product_id, name, quantity, price }
  const [fobPortLoading, setFobPortLoading] = useState(0);
  const [fobTransport, setFobTransport] = useState(0);
  const [fobDocs, setFobDocs] = useState(0);

  const [cifFreight, setCifFreight] = useState(0);
  const [cifInsurance, setCifInsurance] = useState(0);

  // Extra Documents State
  const [extraDocs, setExtraDocs] = useState([]);

  // Buyer Conversations State (Level 8 stub)
  const [conversations, setConversations] = useState([
    { id: 1, sender: "Global Grain Corp (USA)", lastMessage: "Can you provide basmati certification?", date: "2 mins ago" },
    { id: 2, sender: "London Textiles Ltd", lastMessage: "FOB Mumbai port pricing looks acceptable.", date: "1 hour ago" }
  ]);
  const [aiReplyText, setAiReplyText] = useState('');
  const [improvedReply, setImprovedReply] = useState('');
  const [improvingReply, setImprovingReply] = useState(false);

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

  const currentLevel = currentUser.level || 1;
  const currentXP = currentUser.xp || 0;
  const readiness = currentUser.readiness_score || 0;
  const badges = currentUser.badges || [];
  const subscription = currentUser.subscription;
  const activeMeta = LEVEL_META[currentLevel] || LEVEL_META[9];

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
      return { action: "Send First Invoice", desc: "Create a draft invoice and dispatch it to complete readiness to 100%.", route: "orders" };
    }
    return { action: "Engage with Exporters", desc: "Start conversations with active buyers in the Deal Center.", route: "conversations" };
  };

  const priority = getPriority();

  // Load products, invoices, and documents
  const isDemo = typeof localStorage !== 'undefined' && localStorage.getItem('eximarg_demo') === 'true';

  const loadData = async () => {
    // In demo mode (no backend), skip all API calls and use mock data
    if (isDemo) {
      setProducts([
        { id: 'demo-1', name: 'Basmati Rice (1121 Sella)', hsn: '1006.30', price_min: 850, price_max: 1200, unit: 'MT', moq: 25, origin: 'India' },
        { id: 'demo-2', name: 'Organic Turmeric Powder', hsn: '0910.30', price_min: 120, price_max: 180, unit: 'kg', moq: 500, origin: 'India' },
        { id: 'demo-3', name: 'Cotton Bedsheets (King)', hsn: '6302.21', price_min: 8, price_max: 15, unit: 'piece', moq: 1000, origin: 'India' }
      ]);
      setInvoices([
        { id: 'INV-001', buyer_name: 'Global Grain Corp', total: 21250, status: 'dispatched', date: '2026-06-15' }
      ]);
      setExtraDocs([]);
      return;
    }

    try {
      const prodRes = await api.get('/api/products');
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      const invRes = await api.get('/api/orders');
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
      const docRes = await api.get('/api/profile/extra-documents');
      setExtraDocs(Array.isArray(docRes.data) ? docRes.data : []);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLevelHop = async (lvl) => {
    try {
      const response = await api.post('/api/levels/set-level', { level: lvl });
      toast.success(response.data.message);
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to change level: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Invoice calculations
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

  const addProductToInvoice = (p) => {
    const existingIdx = invoiceProducts.findIndex(item => item.product_id === p.id);
    if (existingIdx !== -1) {
      const updated = [...invoiceProducts];
      updated[existingIdx].quantity += 1;
      setInvoiceProducts(updated);
    } else {
      setInvoiceProducts([...invoiceProducts, {
        product_id: p.id,
        name: p.name,
        quantity: 1,
        price: p.price_min
      }]);
    }
  };

  const updateInvoiceProduct = (index, field, value) => {
    const updated = [...invoiceProducts];
    updated[index][field] = value;
    setInvoiceProducts(updated);
  };

  const removeProductFromInvoice = (index) => {
    setInvoiceProducts(invoiceProducts.filter((_, i) => i !== index));
  };

  // Save/Update Draft Invoice
  const handleSaveDraft = async () => {
    const payload = {
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_address: buyerAddress,
      seller_details: { name: sellerName, address: sellerAddress },
      products: invoiceProducts,
      fob_charges: getFobTotal(),
      cif_charges: getCifTotal(),
      total_amount: getTotalAmount(),
      status: "draft"
    };

    try {
      if (selectedInvoiceId) {
        await api.put(`/api/orders/${selectedInvoiceId}`, payload);
        toast.success('Invoice draft updated!');
      } else {
        const res = await api.post('/api/orders', payload);
        setSelectedInvoiceId(res.data.id);
        toast.success('Invoice draft saved!');
      }
      loadData();
    } catch (e) {
      toast.error('Failed to save draft invoice.');
    }
  };

  // PDF Generation using jsPDF & AutoTable
  const generatePDFBase64 = () => {
    const doc = new jsPDF();
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("EXPORT INVOICE", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Seller: ${sellerName}`, 14, 30);
    doc.text(`Address: ${sellerAddress}`, 14, 35);
    
    doc.text(`Buyer: ${buyerName}`, 120, 30);
    doc.text(`Address: ${buyerAddress}`, 120, 35);
    doc.text(`Email: ${buyerEmail}`, 120, 45);

    const headers = [["Product", "Quantity", "Unit Price ($)", "Total ($)"]];
    const data = invoiceProducts.map(p => [
      p.name,
      p.quantity,
      p.price,
      (p.quantity * p.price).toFixed(2)
    ]);
    
    doc.autoTable({
      head: headers,
      body: data,
      startY: 55,
      theme: 'grid'
    });

    const finalY = doc.previousAutoTable.finalY + 10;
    doc.text(`Subtotal: $${getSubtotal().toFixed(2)}`, 14, finalY);
    doc.text(`FOB Charges: $${getFobTotal().toFixed(2)}`, 14, finalY + 5);
    doc.text(`CIF Charges: $${getCifTotal().toFixed(2)}`, 14, finalY + 10);
    
    doc.setFont("Helvetica", "bold");
    doc.text(`TOTAL AMOUNT: $${getTotalAmount().toFixed(2)}`, 14, finalY + 18);

    return doc.output('datauristring');
  };

  // Send Invoice
  const handleSendInvoice = async () => {
    if (!buyerName || invoiceProducts.length === 0) {
      toast.error('Please complete buyer details and select products before sending.');
      return;
    }
    
    await handleSaveDraft();
    const pdfDataUrl = generatePDFBase64();

    try {
      const targetId = selectedInvoiceId || invoices[invoices.length - 1]?.id;
      const res = await api.post(`/api/orders/${targetId}/send`, { pdf_base64: pdfDataUrl });
      toast.success(`Invoice ${res.data.invoice_number} sent successfully! Earned +100 XP`);
      setShowInvoiceWizard(false);
      setSelectedInvoiceId(null);
      await refreshUser();
      loadData();
    } catch (e) {
      toast.error('Failed to send invoice.');
    }
  };

  const startNewInvoice = () => {
    setBuyerName('Nordic Retail Group GmbH');
    setBuyerEmail('claus.h@nordic-retail.com');
    setBuyerAddress('Kaiserstraße 120-122, 60329 Frankfurt am Main, Germany');
    setInvoiceProducts([
      { product_id: '1', name: 'Handcrafted Organic Cotton Bed Linen - Set of 3 (Indigo Collection)', quantity: 420, price: 25.00 },
      { product_id: '2', name: 'Decorative Silk Cushion Covers - 16x16"', quantity: 150, price: 13.00 }
    ]);
    setFobPortLoading(0);
    setFobTransport(0);
    setFobDocs(0);
    setCifFreight(1000);
    setCifInsurance(150);
    setSelectedInvoiceId(null);
    setCurrentWizardStep(1);
    setShowInvoiceWizard(true);
  };

  const bypassInvoiceWizard = () => {
    setBuyerName('Global Foods Corp LLC (Bypassed)');
    setBuyerEmail('buyer_bypass@globalfoods.com');
    setBuyerAddress('100, Wharf Side, Long Beach, CA, USA');
    
    let selectedProds = [];
    if (products.length > 0) {
      selectedProds = [{ product_id: products[0].id, name: products[0].name, quantity: 100, price: products[0].price_min || 15.5 }];
    } else {
      selectedProds = [{ product_id: 'mock_prod_id', name: 'Premium Basmati Rice', quantity: 100, price: 15.5 }];
    }
    setInvoiceProducts(selectedProds);
    setFobPortLoading(150);
    setFobTransport(250);
    setFobDocs(50);
    setCifFreight(500);
    setCifInsurance(100);
    
    setCurrentWizardStep(6);
    toast.success('Auto-filled invoice details. You can now preview and send the invoice!');
  };

  // Extra documents upload handler
  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/api/profile/extra-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded! Earned +25 XP');
      loadData();
      await refreshUser();
    } catch (err) {
      toast.error('Document upload failed. Ensure size is below 20MB.');
    }
  };

  const handleDocDelete = async (id) => {
    try {
      await api.delete(`/api/profile/extra-document/${id}`);
      toast.success('Document removed.');
      loadData();
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  // Level 8 Conversation AI suggestion
  const improveReplyWithAI = async () => {
    if (!aiReplyText) return;
    setImprovingReply(true);
    try {
      const res = await api.post('/api/ai/suggest', {
        prompt: `improve this reply message for an exporter: "${aiReplyText}"`,
        action_type: 'improve_reply'
      });
      setImprovedReply(res.data.suggestion);
      toast.success('AI refined your proposal message!');
    } catch (err) {
      toast.error('AI suggestion failed');
    } finally {
      setImprovingReply(false);
    }
  };

  const isTabLocked = (tabId) => {
    return currentLevel < 7 && tabId !== 'overview';
  };

  const handleTabClick = (tabId) => {
    if (isTabLocked(tabId)) {
      toast.info(`Bypassed lock for ${tabId}! (Locks are bypassed for developer testing)`);
    }
    setActiveTab(tabId);
    setShowInvoiceWizard(false);
  };

  const handleContinueQuest = () => {
    if (currentLevel < 7) {
      navigate('/wizard');
    } else if (currentLevel === 7) {
      setActiveTab('orders');
      startNewInvoice();
    } else if (currentLevel === 8) {
      setActiveTab('conversations');
    } else if (currentLevel === 9) {
      setActiveTab('deal');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        showInvoiceWizard={showInvoiceWizard}
        currentLevel={currentLevel}
        onLogout={() => { logout(); navigate('/login'); }}
        onNavigateToWizard={() => navigate('/wizard')}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-10 bg-surface/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div className="relative">
              <input 
                className="bg-black/20 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-64 text-white placeholder-on-surface-variant" 
                placeholder="Search orders, docs, or products..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-white">
              <Trophy className="text-yellow-500" size={20} />
              <span>{currentXP} XP</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-primary/35 overflow-hidden flex items-center justify-center bg-primary/20 text-primary font-bold text-xs">
              {currentUser.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Views */}
        <div className="p-10 max-w-7xl mx-auto space-y-8">
          {/* OVERVIEW / DASHBOARD VIEW */}
          {activeTab === 'overview' && !showInvoiceWizard && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Row */}
              <StatsGrid 
                productsCount={products.length}
                extraDocsCount={extraDocs.length}
                invoicesCount={invoices.length}
              />

              {/* Quest Hero Card */}
              <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden bg-gradient-to-br from-surface-container-high/50 to-surface/30">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Lightning size={16} className="animate-pulse" />
                    <span>⚡ YOUR CURRENT QUEST</span>
                  </div>

                  <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-2 leading-tight">
                    Level {currentLevel}: {activeMeta.title}
                  </h2>
                  <p className="text-on-surface-variant text-sm md:text-base max-w-xl">
                    {activeMeta.obj}
                  </p>

                  <div className="space-y-2 max-w-lg">
                    <div className="flex justify-between text-xs font-bold text-primary">
                      <span>Quest Progress</span>
                      <span>{readiness}% Completed</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary progress-shimmer rounded-full" style={{ width: `${readiness}%` }}></div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueQuest}
                    className="px-8 py-3.5 bg-primary-container hover:bg-blue-600 text-white font-bold rounded-full transition-all flex items-center gap-2"
                  >
                    Continue Quest →
                  </button>
                </div>
              </div>

              {/* Priority and Insights Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Growth Path (8 Cols) */}
                <div className="lg:col-span-8 glass-card rounded-[2rem] p-8 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Your Growth Path</h3>
                    <span className="text-primary text-xs font-bold bg-primary/10 px-3 py-1 rounded-full">{readiness}% Complete</span>
                  </div>

                  <div className="relative flex justify-between items-center pt-4">
                    <div className="absolute top-8 left-0 right-0 h-1 bg-white/5 -z-10">
                      <div className="h-full bg-primary" style={{ width: `${readiness}%` }}></div>
                    </div>

                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                      <div 
                        key={lvl} 
                        onClick={() => handleLevelHop(lvl)}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                        title={`Click to hop to Level ${lvl}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 group-hover:scale-110 group-hover:shadow-md ${
                          currentLevel > lvl ? 'bg-primary text-white shadow-lg' : 
                          currentLevel === lvl ? 'bg-surface-container-highest border border-primary text-primary animate-pulse' : 'bg-surface-container-low border border-white/10 text-on-surface-variant'
                        }`}>
                          {currentLevel > lvl ? <CheckCircle size={20} /> : lvl}
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-semibold group-hover:text-primary transition-colors text-center max-w-[70px] truncate">
                          {lvl === 1 && 'Identity'}
                          {lvl === 2 && 'Profile'}
                          {lvl === 3 && 'Verification'}
                          {lvl === 4 && 'Review'}
                          {lvl === 5 && 'Subscription'}
                          {lvl === 6 && 'Catalog'}
                          {lvl === 7 && 'Invoices'}
                          {lvl === 8 && 'Chats'}
                          {lvl === 9 && 'Deal Center'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Priority (4 Cols) */}
                <div className="lg:col-span-4 glass-card rounded-[2rem] p-6 border-l-4 border-l-primary space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <WarningCircle size={16} />
                    <span>Today's Priority</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{priority.action}</h4>
                    <p className="text-on-surface-variant text-xs mt-1">{priority.desc}</p>
                  </div>
                  <button 
                    onClick={handleContinueQuest}
                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Launch Task
                  </button>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="glass-card rounded-[2rem] p-8 space-y-6">
                <h3 className="text-lg font-bold text-white">Recent Activities & Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-white/5">
                        <th className="pb-3 font-semibold">Operation</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {invoices.slice(0, 3).map((inv) => (
                        <tr key={inv.id} className="border-b border-white/5">
                          <td className="py-3 font-bold text-white">Invoice {inv.invoice_number}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === 'sent' ? 'bg-green-950/40 text-green-400' : 'bg-white/5 text-on-surface-variant'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 font-bold">${inv.total_amount?.toFixed(2)}</td>
                        </tr>
                      ))}
                      {invoices.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-on-surface-variant">No transactions yet. Complete quests to unlock operational capabilities!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DIGITAL DUKAN (PRODUCT CATALOG) VIEW */}
          {activeTab === 'dukan' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display font-extrabold text-3xl text-white">Digital Dukan</h2>
                  <p className="text-on-surface-variant text-sm mt-1">Manage and sync your export product listings globally.</p>
                </div>
                <button 
                  onClick={() => navigate('/wizard')}
                  className="px-5 py-2.5 bg-primary-container hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Plus size={16} />
                  Add/Upload Products
                </button>
              </div>

              {products.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-3xl space-y-4">
                  <Tag size={40} className="mx-auto text-on-surface-variant/40" />
                  <p className="text-sm text-on-surface-variant">Your product catalog is empty. Lock level 6 in the Onboarding Wizard to seed your catalog.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div key={p.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
                      <div className="h-44 bg-black/20 flex items-center justify-center relative border-b border-white/5">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={48} className="text-white/10" />
                        )}
                        <span className="absolute top-3 right-3 bg-black/50 text-[10px] text-primary font-bold px-2 py-0.5 rounded-full">{p.sku}</span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{p.name}</h4>
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{p.description || 'No description provided.'}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-on-surface-variant">HSN: {p.hsn_code}</span>
                          <span className="text-sm font-bold text-white">${p.price_min} - ${p.price_max}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS & INVOICES VIEW */}
          {activeTab === 'orders' && !showInvoiceWizard && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-display font-extrabold text-3xl text-white">Orders & Invoices</h2>
                  <p className="text-on-surface-variant text-sm mt-1">Generate dynamic global invoices with automated FOB/CIF billing items.</p>
                </div>
                <button 
                  onClick={startNewInvoice}
                  className="px-5 py-2.5 bg-primary-container hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Plus size={16} />
                  New Export Invoice
                </button>
              </div>

              {invoices.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-3xl space-y-4">
                  <Notebook size={40} className="mx-auto text-on-surface-variant/40" />
                  <p className="text-sm text-on-surface-variant">No invoices generated yet. Click "New Export Invoice" to launch the generator.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">Invoice {inv.invoice_number}</span>
                          <span className="text-xs text-on-surface-variant">({inv.buyer_name})</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant mt-1">Generated: {new Date(inv.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">${inv.total_amount?.toFixed(2)}</span>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                          inv.status === 'sent' ? 'bg-green-950/40 text-green-400 border border-green-900/50' : 'bg-white/5 text-on-surface-variant'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INVOICE WIZARD */}
          {showInvoiceWizard && (
            <div className="space-y-8 animate-fade-in text-left">
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
                  <button 
                    onClick={() => setShowInvoiceWizard(false)}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all"
                    data-testid="close-invoice-wizard"
                  >
                    Cancel
                  </button>
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
                                toast.success("Consolidated shipment added!");
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
                        onClick={handleSendInvoice}
                        className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        data-testid="send-invoice-button"
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
                          <h4 className="font-display font-black text-lg text-slate-800 tracking-tight">EXIMARG TRADING CO.</h4>
                          <p className="text-[8px] text-slate-500 mt-1 max-w-[180px]">Plot 44, SEZ Industrial Estate Gurugram, HR 122018, India</p>
                          <p className="text-[8px] text-slate-500">GSTIN: 07AAACH1234F1Z1</p>
                        </div>
                        <div className="text-right">
                          <h5 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest">COMMERCIAL INVOICE</h5>
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
                          <span className="block font-bold text-green-600 uppercase">Digitally Verified</span>
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
          )}

          {/* DOCUMENTS PANEL */}
          {activeTab === 'documents' && !showInvoiceWizard && (
            <div className="glass-card p-8 rounded-3xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h2 className="font-display font-extrabold text-3xl text-white">Documents Vault</h2>
                  <p className="text-on-surface-variant text-xs mt-1">Manage extra export documentation required by foreign customs.</p>
                </div>
                <div>
                  <label className="px-4 py-2.5 bg-primary-container hover:bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow transition-all">
                    <FileArrowUp size={16} />
                    Upload Document
                    <input
                      type="file"
                      onChange={handleDocUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {extraDocs.length === 0 ? (
                <p className="text-center py-8 text-xs text-on-surface-variant">No additional documents uploaded. Uploading grants +25 XP.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extraDocs.map((doc) => (
                    <div key={doc.id} className="bg-[#031037]/60 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-xs">{doc.filename}</p>
                        <p className="text-[10px] text-on-surface-variant mt-1">Format: {doc.content_type}</p>
                      </div>
                      <div className="flex gap-2">
                        {doc.data_url && (
                          <a href={doc.data_url} download={doc.filename} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white">
                            <Eye size={14} />
                          </a>
                        )}
                        <button onClick={() => handleDocDelete(doc.id)} className="p-2 bg-white/5 hover:bg-red-950/40 rounded-lg text-red-400 hover:text-red-300">
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONVERSATIONS PANEL */}
          {activeTab === 'conversations' && (
            <div className="glass-card p-8 rounded-3xl space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display font-extrabold text-3xl text-white">Buyer Conversations</h2>
                <p className="text-on-surface-variant text-xs mt-1">Review active inquiries from international retail catalog partners and generate AI responses.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Conversations list */}
                <div className="md:col-span-1 border border-white/5 rounded-2xl p-4 space-y-3 bg-black/10">
                  <span className="text-[10px] font-bold text-primary uppercase">Active Chats</span>
                  <div className="space-y-2">
                    {conversations.map(c => (
                      <div key={c.id} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all">
                        <p className="font-bold text-white text-xs">{c.sender}</p>
                        <p className="text-[10px] text-on-surface-variant truncate mt-1">{c.lastMessage}</p>
                        <span className="block text-[8px] text-on-surface-variant/40 mt-1 text-right">{c.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Reply Builder */}
                <div className="md:col-span-2 space-y-4">
                  <div className="glass-card p-6 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-primary uppercase flex items-center gap-1.5">
                      <Sparkle size={14} className="animate-pulse" />
                      AI Proposal Builder
                    </h4>
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-2">Draft Reply Message</label>
                      <textarea
                        value={aiReplyText}
                        onChange={(e) => setAiReplyText(e.target.value)}
                        className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-xs text-white"
                        placeholder="Write a brief response, e.g., 'Yes we have Basmati certifications. Price is 15 FOB Mumbai.'"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={improveReplyWithAI}
                      disabled={improvingReply}
                      className="px-4 py-2 bg-primary-container hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      {improvingReply ? 'Refining message...' : 'Refine with Eximarg AI'}
                    </button>

                    {improvedReply && (
                      <div className="bg-[#031037]/60 border border-white/10 p-4 rounded-xl space-y-2">
                        <span className="block text-[9px] text-secondary uppercase font-bold tracking-wider">Refined Proposal Draft</span>
                        <p className="text-xs text-white whitespace-pre-wrap">{improvedReply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEAL CENTER PANEL */}
          {activeTab === 'deal' && (
            <div className="glass-card p-12 text-center rounded-[2rem] space-y-4 animate-fade-in">
              <Trophy size={48} className="mx-auto text-primary animate-bounce" />
              <h2 className="font-display font-extrabold text-2xl text-white">Deal Center</h2>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Unlock ongoing global logistics tracking, Letter of Credit (LC) escrow verification, and Customs inspection updates. Lock Level 8 to unlock full deal management.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
