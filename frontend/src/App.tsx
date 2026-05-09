/**
 * Main application component with routing and layout.
Tab based navigation (routes to appropriate comp based on tab) 
*/
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { ResearchHistory } from './components/ResearchHistory';
import { Settings } from './components/Settings';
import type { TabType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  // Load saved tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('mara_active_tab') as TabType;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('mara_active_tab', tab);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      <div className={activeTab === 'chat' ? 'h-full flex flex-col' : 'hidden'}>
        <ChatInterface />
      </div>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'history' && <ResearchHistory />}
      {activeTab === 'settings' && <Settings />}
    </Layout>
  );
};

export default App;
