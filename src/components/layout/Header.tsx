import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  user: UserProfile;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  unreadCount?: number;
}

export function Header({ user, onNavigate, onLogout, unreadCount = 3 }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header id="main-header" className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, inspections, rules, or anything..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg pl-9 pr-14 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-sm shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          aria-label="Toggle theme"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Sun className="w-4 h-4" />
        </button>

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
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm border border-blue-200">
              {user.name.split(' ').map((n) => n[0]).join('')}
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
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                <div className="text-[11px] text-blue-600 font-medium mt-0.5">ID: {user.employee_id}</div>
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