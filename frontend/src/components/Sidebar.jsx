import React from 'react';
import { 
  Layout, Lightning, Tag, ShieldCheck, Trophy, Chat, Question, SignOut, LockOpen 
} from '@phosphor-icons/react';

export default function Sidebar({ 
  activeTab, 
  handleTabClick, 
  showInvoiceWizard, 
  currentLevel, 
  onLogout, 
  onNavigateToWizard 
}) {
  const isTabLocked = (tabId) => {
    return currentLevel < 7 && tabId !== 'overview';
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: Layout, showLock: false },
    { id: 'orders', label: 'Operations', icon: Lightning, showLock: true },
    { id: 'dukan', label: 'Catalog', icon: Tag, showLock: true },
    { id: 'wizard-link', label: 'Verification', icon: ShieldCheck, showLock: false, action: onNavigateToWizard },
    { id: 'deal', label: 'Quest Log', icon: Trophy, showLock: false },
    { id: 'conversations', label: 'Conversations', icon: Chat, showLock: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-white/5 flex flex-col py-8 z-50">
      <div className="px-8 mb-10">
        <h1 className="text-headline-md font-headline-md font-black text-primary tracking-tighter">EXIMARG</h1>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Export Command Center</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = item.id === 'wizard-link' ? false : 
            (item.id === 'orders' ? (activeTab === 'orders' || showInvoiceWizard) : activeTab === item.id);

          if (item.action) {
            return (
              <button 
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 px-6 py-3 transition-all duration-200 text-left"
              >
                <Icon size={18} />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            );
          }

          return (
            <button 
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-6 py-3 transition-all duration-200 text-left ${
                isSelected ? 'text-primary bg-primary-container/10 border-r-4 border-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              {item.showLock && isTabLocked(item.id) && <LockOpen size={14} className="text-green-400" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-6 space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary-container to-tertiary-container relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-white/70 uppercase">Exporter Rank</p>
            <p className="text-white font-bold">Level {currentLevel}: {currentLevel < 5 ? 'Bronze' : currentLevel < 8 ? 'Silver' : 'Gold'}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
            <Trophy size={60} />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-2 py-2 text-sm text-left">
            <Question size={18} />
            <span>Help Center</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 text-on-surface-variant hover:text-red-400 px-2 py-2 text-sm text-left">
            <SignOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
