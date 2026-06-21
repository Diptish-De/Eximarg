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
import { Building, Sparkle, ArrowRight } from '@phosphor-icons/react';

export function Level2Exporter({ onSubmit, onAskAI }) {
  const [exporterType, setExporterType] = useState('Merchant');
  const [businessModel, setBusinessModel] = useState('B2B');
  const [exportIntent, setExportIntent] = useState('');
  const [operatingSince, setOperatingSince] = useState('2026');

  return (
    <div className="glass-card rounded-2xl p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Building size={24} className="text-primary" />
        <h3 className="font-display font-bold text-lg text-white">Exporter Configuration</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Exporter Type</label>
          <select value={exporterType} onChange={(e) => setExporterType(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm">
            <option>Merchant</option>
            <option>Manufacturer</option>
            <option>Service Exporter</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Business Model</label>
          <select value={businessModel} onChange={(e) => setBusinessModel(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm">
            <option>B2B</option>
            <option>B2C</option>
            <option>D2C Corridor</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Export Focus Commodities</label>
        <input type="text" value={exportIntent} onChange={(e) => setExportIntent(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" placeholder="e.g. Basmati Rice, Organic Cotton, Handicrafts" />
      </div>

      <button onClick={() => onSubmit({ exporterType, businessModel, exportIntent, operatingSince })} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
        Save Exporter Profile <ArrowRight size={16} />
      </button>
    </div>
  );
}
```

---

## Level 3: Business Verification
```jsx
import React, { useState } from 'react';
import { Files, FileArrowUp, ArrowRight } from '@phosphor-icons/react';

export function Level3Verification({ onSubmit }) {
  const [gst, setGst] = useState('');
  const [cin, setCin] = useState('');
  const [iec, setIec] = useState('');
  const [adCode, setAdCode] = useState('');

  return (
    <div className="glass-card rounded-2xl p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Files size={24} className="text-primary" />
        <h3 className="font-display font-bold text-lg text-white">Government Registrations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">GSTIN Number</label>
          <input type="text" value={gst} onChange={(e) => setGst(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" placeholder="15-digit GSTIN" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">CIN (Corporate ID Number)</label>
          <input type="text" value={cin} onChange={(e) => setCin(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" placeholder="21-digit CIN code" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">IEC Code</label>
          <input type="text" value={iec} onChange={(e) => setIec(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" placeholder="Import Export Code" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Bank AD Code</label>
          <input type="text" value={adCode} onChange={(e) => setAdCode(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" placeholder="Authorized Dealer Code" />
        </div>
      </div>

      <button onClick={() => onSubmit({ gst, cin, iec, adCode })} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
        Verify Credentials <ArrowRight size={16} />
      </button>
    </div>
  );
}
```

---

## Level 4: Company Review
```jsx
import React, { useState } from 'react';
import { Building, Lock, ArrowRight } from '@phosphor-icons/react';

export function Level4CompanyReview({ onSubmit, companyData }) {
  const [companyName, setCompanyName] = useState(companyData?.company_name || '');
  const [website, setWebsite] = useState(companyData?.website || '');
  const [tagline, setTagline] = useState(companyData?.tagline || '');

  return (
    <div className="glass-card rounded-2xl p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Building size={24} className="text-primary" />
        <h3 className="font-display font-bold text-lg text-white">Confirm Company Credentials</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Export Company Name</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Company Website</label>
          <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Brand Tagline</label>
          <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-4 py-3 bg-[#031037]/80 rounded-xl border border-white/10 text-white text-sm" />
        </div>
      </div>

      <button onClick={() => onSubmit({ companyName, website, tagline })} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
        Lock Profile & Verify <Lock size={16} />
      </button>
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
