
import React from 'react';
import { NavigationTab } from '../types';
import { DashboardIcon, PlannerIcon, TicketIcon, UserIcon } from './icons/NavIcons';

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
  const activeClasses = 'text-red-600 dark:text-red-400';
  const inactiveClasses = 'text-gray-500 dark:text-gray-400';

  return (
    <button
      onClick={() => onClick(tab)}
      className="flex flex-col items-center justify-center w-1/4 transition-transform duration-200 ease-in-out transform hover:scale-105"
    >
      <Icon className={`w-7 h-7 mb-1 transition-colors ${isActive ? activeClasses : inactiveClasses}`} />
      <span className={`text-xs font-medium transition-colors ${isActive ? activeClasses : inactiveClasses}`}>
        {label}
      </span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-2 rounded-b-3xl">
      <NavItem tab={NavigationTab.Dashboard} activeTab={activeTab} onClick={setActiveTab} Icon={DashboardIcon} label="Dashboard" />
      <NavItem tab={NavigationTab.Planner} activeTab={activeTab} onClick={setActiveTab} Icon={PlannerIcon} label="Planner" />
      <NavItem tab={NavigationTab.Tickets} activeTab={activeTab} onClick={setActiveTab} Icon={TicketIcon} label="Tickets" />
      <NavItem tab={NavigationTab.Account} activeTab={activeTab} onClick={setActiveTab} Icon={UserIcon} label="Account" />
    </div>
  );
};

export default BottomNavBar;
