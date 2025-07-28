
import React from 'react';

interface SidebarTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'overview', label: 'Overview' },
    { id: 'notes', label: 'Notes' },
    { id: 'qa', label: 'Q&A' },
    { id: 'ai', label: 'AI Assistant' }
  ];

  return (
    <div className="border-b border-[#3e4143]">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 px-3 py-3 text-xs font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fdb606]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
