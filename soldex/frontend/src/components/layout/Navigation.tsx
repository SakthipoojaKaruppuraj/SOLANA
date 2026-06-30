import React from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowPathIcon,
  SquaresPlusIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Swap", path: "/", icon: ArrowPathIcon },
  { name: "Liquidity", path: "/liquidity", icon: SquaresPlusIcon },
  { name: "Analytics", path: "/analytics", icon: ChartBarIcon },
  { name: "About", path: "/about", icon: InformationCircleIcon },
];

/**
 * Navigation component displaying a vertical sidebar on desktop and a sticky bottom tab bar on mobile.
 */
export const Navigation: React.FC = () => {
  return (
    <>
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-card-border shrink-0 p-4 space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </aside>

      {/* Bottom Bar - Mobile Layout */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-card-border flex items-center justify-around py-2 shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center space-y-0.5 font-medium text-xs transition-all duration-150 ${
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
