import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, Settings, LogOut, CheckCircle2, X, LayoutDashboard, Camera, ClipboardList, BarChart3, Package, FileText, BookOpen, Users, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { UserProfile, InspectionRecord } from '../../types';

interface HeaderProps {
  user: UserProfile;
  inspections?: InspectionRecord[];
  onNavigate: (view: any) => void;
  onViewReport?: (inspectionId: string) => void;
  onLogout: () => void;
  unreadCount?: number;
}

const SEARCH_INDEX = [
  { id: 'dashboard', label: 'Dashboard', keywords: 'home overview stats', icon: LayoutDashboard },
  { id: 'new_inspection', label: 'New Inspection', keywords: 'scan camera upload start', icon: Camera },
  { id: 'my_inspections', label: 'My Inspections', keywords: 'inspection history records', icon: ClipboardList },
  { id: 'analytics', label: 'Analytics', keywords: 'charts stats reports data', icon: BarChart3 },
  { id: 'products', label: 'Products', keywords: 'nutritious food earthybite brand', icon: Package },
  { id: 'reports', label: 'Reports', keywords: 'documents pdf export', icon: FileText },
  { id: 'alerts', label: 'Alerts', keywords: 'notifications warnings', icon: Bell },
  { id: 'knowledge_base', label: 'Knowledge Base', keywords: 'rules help docs', icon: BookOpen },
  { id: 'users_team', label: 'Users & Team', keywords: 'team members inspectors', icon: Users },
  { id: 'settings', label: 'Settings', keywords: 'preferences profile', icon: Settings }
];

export function Header({ user, inspections = [], onNavigate, onViewReport, onLogout, unreadCount = 3 }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const navMatches = (q
      ? SEARCH_INDEX.filter((item) => item.label.toLowerCase().includes(q) || item.keywords.includes(q))
      : SEARCH_INDEX
    ).map((item) => ({
      kind: 'nav' as const,
      id: item.id,
      icon: item.icon,
      title: item.label,
      subtitle: 'Page'
    }));

    if (!q) {
      return navMatches;
    }

    const inspectionMatches = inspections
      .filter((insp) => {
        const productName = (insp.product_context?.product_name || '').toLowerCase();
        const brand = (insp.product_context?.brand || '').toLowerCase();
        const number = (insp.inspection_number || '').toLowerCase();
        const dateStr = insp.created_at ? new Date(insp.created_at).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        }).toLowerCase() : '';
        const dateOnly = insp.created_at ? new Date(insp.created_at).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }).toLowerCase() : '';
        const status = (insp.compliance_summary?.overall_status || '').toLowerCase().replace('_', ' ');
        return (
          productName.includes(q) ||
          brand.includes(q) ||
          number.includes(q) ||
          dateStr.includes(q) ||
          dateOnly.includes(q) ||
          status.includes(q)
        );
      })
      .slice(0, 8)
      .map((insp) => {
        const status = insp.compliance_summary?.overall_status;
        const isCompliant = status === 'COMPLIANT';
        const isReview = status === 'REVIEW_REQUIRED';
        return {
          kind: 'inspection' as const,
          id: insp.id,
          icon: isCompliant ? ShieldCheck : isReview ? Clock : AlertTriangle,
          title: insp.product_context?.product_name || 'Untitled Product',
          subtitle: `${insp.inspection_number || ''} · ${insp.product_context?.brand || 'Unknown Brand'} · ${insp.created_at ? new Date(insp.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}`,
          statusColor: isCompliant ? 'text-emerald-600' : isReview ? 'text-amber-600' : 'text-rose-600'
        };
      });

    return [...inspectionMatches, ...navMatches];
  }, [searchQuery, inspections]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectResult = (item: (typeof results)[number]) => {
    if (item.kind === 'inspection') {
      onViewReport?.(item.id);
    } else {
      onNavigate(item.id);
    }
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) selectResult(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSearch(false);
    }
  };

  return (
    <header id="main-header" className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-2xl flex items-center" ref={searchWrapRef}>
        <div className="relative w-full">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products, inspections, rules, or anything..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg pl-9 pr-9 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              id="search-submit-btn"
              onClick={() => results[activeIndex] && selectResult(results[activeIndex])}
              className="shrink-0 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200 transition-colors"
            >
              Search
            </button>
          </div>

          {showSearch && searchQuery.trim() && (results.length > 0 ? (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
              {results.some((r) => r.kind === 'inspection') && (
                <div className="px-3.5 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Inspections
                </div>
              )}
              {results.map((item, idx) => {
                const Icon = item.icon;
                if (idx > 0 && results[idx - 1].kind === 'inspection' && item.kind === 'nav') {
                  return (
                    <React.Fragment key={item.kind + item.id}>
                      <div className="px-3.5 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide border-t border-slate-100">
                        Pages
                      </div>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => selectResult(item)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left ${idx === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${idx === activeIndex ? 'text-blue-600' : ((item as any).statusColor || 'text-slate-400')}`} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                        </div>
                      </button>
                    </React.Fragment>
                  );
                }
                return (
                  <button
                    key={item.kind + item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => selectResult(item)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left ${idx === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${idx === activeIndex ? 'text-blue-600' : ((item as any).statusColor || 'text-slate-400')}`} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 px-3.5 py-3 text-sm text-slate-400">
              No results for "{searchQuery}"
            </div>
          ))}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <button
          id="header-notification-btn"
          onClick={() => onNavigate('alerts')}
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold leading-none rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Inspector Profile Pill */}
        <div className="relative">
          <button
            id="profile-dropdown-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm border border-blue-200 overflow-hidden shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name.split(' ').map((n) => n[0]).join('')}</span>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-900 leading-tight">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {user.role}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 text-sm">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm border border-blue-200 overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name.split(' ').map((n) => n[0]).join('')}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="text-[11px] text-blue-600 font-medium mt-0.5">ID: {user.employee_id}</div>
                </div>
              </div>

              <button
                id="menu-profile-btn"
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('settings');
                }}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Inspector Profile</span>
              </button>

              <button
                id="menu-settings-btn"
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('settings');
                }}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings & Preferences</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                id="menu-logout-btn"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}