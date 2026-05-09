/**
 * Main layout component with navigation sidebar.
 */
import React from 'react';
import type { TabType } from '../types';

interface LayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'chat', label: 'Research Chat' },
    { id: 'history', label: 'History' },
    { id: 'dashboard', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            MARA
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-Agent Research Assistant
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <p>Version 1.0.0</p>
          <p className="mt-1">Powered by LangGraph</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
};