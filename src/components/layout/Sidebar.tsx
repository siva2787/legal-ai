import React from 'react';
import {
  LayoutDashboard,
  Camera,
  ClipboardList,
  BarChart3,
  Package,
  FileText,
  Bell,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { LegalMetLogo, AshokaEmblem } from '../common/BrandAssets';

export type NavView =
  | 'dashboard'
  | 'new_inspection'
  | 'my_inspections'
  | 'analytics'
  | 'products'
  | 'reports'
  | 'alerts'
  | 'knowledge_base'
  | 'users_team'
  | 'settings'
  | 'inspection_analysis'
  | 'inspection_review'
  | 'inspection_results'
  | 'inspection_rules'
  | 'inspection_report'
  | 'landing';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onLogout: () => void;
  unreadAlertsCount?: number;
}

export function Sidebar({
  currentView,
  onNavigate,
  onLogout,
  unreadAlertsCount = 3
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_inspection' as NavView, label: 'New Inspection', icon: Camera },
    { id: 'my_inspections' as NavView, label: 'My Inspections', icon: ClipboardList },
    { id: 'analytics' as NavView, label: 'Analytics', icon: BarChart3 },
    { id: 'products' as NavView, label: 'Products', icon: Package },
    { id: 'reports' as NavView, label: 'Reports', icon: FileText },
    { id: 'alerts' as NavView, label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'knowledge_base' as NavView, label: 'Knowledge Base', icon: BookOpen },
    { id: 'users_team' as NavView, label: 'Users & Team', icon: Users },
    { id: 'settings' as NavView, label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      id="sidebar-container"
      className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0 sticky top-0 z-30 overflow-x-hidden"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <LegalMetLogo className="w-10 h-10 shrink-0" />
        <div>
          <div className="font-bold text-slate-900 text-lg leading-tight tracking-tight flex items-center gap-1.5">
            LegalMet <span className="text-blue-600">AI</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium tracking-normal">
            Fair Markets. Trusted India.
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === 'new_inspection' &&
              (currentView === 'inspection_analysis' ||
                currentView === 'inspection_review' ||
                currentView === 'inspection_results' ||
                currentView === 'inspection_rules' ||
                currentView === 'inspection_report'));

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${isActive
                      ? 'bg-white text-blue-600'
                      : 'bg-red-500 text-white'
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stronger Markets, Brighter Bharat — Official Banner */}
      <div className="mx-3 mb-3 rounded-xl border border-slate-200/80 shadow-xs bg-gradient-to-br from-orange-50/60 via-white to-emerald-50/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full border-4 border-blue-900/5"></div>

        <div className="p-3.5 text-center">
          <div className="text-[13px] font-bold text-slate-800 tracking-tight leading-snug">
            Stronger Markets <br />
            <span className="text-blue-700">Brighter Bharat</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 pb-3">
          <AshokaEmblem className="w-6 h-8 shrink-0" />
          <div className="text-[10px] text-slate-600 leading-tight text-left">
            <span className="font-semibold text-slate-800 block">Ministry of Consumer Affairs,</span>
            Food & Public Distribution
            <div className="text-[9px] text-slate-500 font-medium">Government of India</div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-200/60 text-[11px] text-slate-500 bg-white/60">
          <span className="font-medium text-slate-600">v1.0.0</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>
    </aside>
  );
}