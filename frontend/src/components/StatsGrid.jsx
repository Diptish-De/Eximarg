import React from 'react';
import { Tag, FileText, Notebook } from '@phosphor-icons/react';

export default function StatsGrid({ productsCount, extraDocsCount, invoicesCount }) {
  const stats = [
    {
      label: 'Active Products',
      value: productsCount,
      icon: Tag,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      label: 'Compliant Docs',
      value: extraDocsCount + 3,
      icon: FileText,
      bgColor: 'bg-tertiary/10',
      iconColor: 'text-primary'
    },
    {
      label: 'Processed Invoices',
      value: invoicesCount,
      icon: Notebook,
      bgColor: 'bg-secondary/10',
      iconColor: 'text-primary'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className="glass-card p-6 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group"
          >
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1 text-white group-hover:text-primary transition-colors">
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.iconColor} group-hover:scale-110 transition-transform`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
