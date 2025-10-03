
import React from 'react';
import { NavigationTab } from '../types';
import { HomeIcon, TrainIcon, TicketIcon, PromotionIcon, UserIcon, PlannerIcon } from './icons/NavIcons';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

const NavItem: React.FC<{
  tab: NavigationTab;
  activeTab: NavigationTab;
  onClick: (tab: NavigationTab) => void;
  Icon: React.ElementType;
  label: string;
}> = ({ tab, activeTab, onClick, Icon, label }) => {
  const isActive = activeTab === tab;

  return (
    <button
      onClick={() => onClick(tab)}
        className={`flex items-center justify-center py-2 px-2 gap-2 w-[130px] ${
        isActive 
          ? 'bg-blue-600 rounded-full shadow-md border border-blue-500/30' 
          : ''
      }`}
    >
      <Icon 
        className={`w-7 h-7 ${
          isActive 
            ? 'text-white' 
            : 'text-gray-500 dark:text-gray-400'
        }`} 
      />
      <span 
        className={`text-sm font-medium ${
          isActive 
            ? 'text-white opacity-100' 
            : 'opacity-0 absolute'
        }`}
      >
        {label}
      </span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-2 py-2 rounded-b-3xl">
      <NavItem tab={NavigationTab.Dashboard} activeTab={activeTab} onClick={setActiveTab} Icon={HomeIcon} label="Beranda" />
      <NavItem tab={NavigationTab.Planner} activeTab={activeTab} onClick={setActiveTab} Icon={PlannerIcon} label="Perjalanan" />
      <NavItem tab={NavigationTab.Tickets} activeTab={activeTab} onClick={setActiveTab} Icon={TicketIcon} label="Tiket" />
      <NavItem tab={NavigationTab.Account} activeTab={activeTab} onClick={setActiveTab} Icon={UserIcon} label="Akun" />
    </div>
  );
};

export default BottomNavBar;
