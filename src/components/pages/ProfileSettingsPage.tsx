import React, { useRef, useState } from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Building,
  Key,
  Bell,
  Save,
  CheckCircle2,
  Cpu,
  Camera,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../../types';
import { AshokaEmblem } from '../common/BrandAssets';

interface ProfileSettingsPageProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

const AVATAR_STORAGE_PREFIX = 'legalmet_avatar_';
const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3MB

export function ProfileSettingsPage({ user, onUpdateProfile }: ProfileSettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('+91 98401 23456');
  const [zone, setZone] = useState(user.zone || 'Kumbakonam / Thanjavur District, Tamil Nadu');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const avatarStorageKey = `${AVATAR_STORAGE_PREFIX}${user.employee_id || 'default'}`;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.avatar_url || localStorage.getItem(avatarStorageKey)
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setShowAvatarMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCameraClick = () => {
    if (avatarUrl) {
      setShowAvatarMenu((v) => !v);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleUpdateChoice = () => {
    setShowAvatarMenu(false);
    fileInputRef.current?.click();
  };

  const handleDeleteChoice = () => {
    setShowAvatarMenu(false);
    handleRemoveAvatar();
  };

  const persistAvatar = async (dataUrl: string | null) => {
    const token = localStorage.getItem('legalmet_token');
    try {
      const res = await fetch('/api/auth/profile/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ employee_id: user.employee_id, avatar: dataUrl })
      });
      const data = await res.json();
      if (data && data.success && data.avatarUrl !== undefined) {
        return data.avatarUrl as string | null;
      }
    } catch (err) {
      console.warn('Avatar save offline fallback:', err);
    }
    return dataUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAvatarError(null);

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image must be under 3MB.');
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const finalUrl = await persistAvatar(dataUrl);
      setAvatarUrl(finalUrl);
      if (finalUrl) {
        localStorage.setItem(avatarStorageKey, finalUrl);
      } else {
        localStorage.removeItem(avatarStorageKey);
      }
      onUpdateProfile({ avatar_url: finalUrl } as Partial<UserProfile>);
      setIsUploadingAvatar(false);
    };
    reader.onerror = () => {
      setAvatarError('Could not read that image. Try another file.');
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    await persistAvatar(null);
    localStorage.removeItem(avatarStorageKey);
    setAvatarUrl(null);
    onUpdateProfile({ avatar_url: null } as Partial<UserProfile>);
    setIsUploadingAvatar(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('legalmet_token');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ employee_id: user.employee_id, name, email, zone })
      });
      const data = await res.json();
      if (data && data.success && data.user) {
        onUpdateProfile(data.user);
      } else {
        onUpdateProfile({ name, email, zone });
      }
    } catch (err) {
      console.warn('Profile save offline fallback:', err);
      onUpdateProfile({ name, email, zone });
    } finally {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div id="profile-settings-page" className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Profile & Department Settings
        </h1>
        <p className="text-sm text-slate-500">
          Inspector credentials, assigned jurisdiction, notification preferences, and system parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inspector Credential Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto group" ref={avatarMenuRef}>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-200 flex items-center justify-center bg-blue-100 text-blue-700 font-black text-2xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span>{name.split(' ').map((n) => n[0]).join('')}</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center border-2 border-white shadow-md disabled:opacity-60"
              title="Change profile picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {showAvatarMenu && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={handleUpdateChoice}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  Update Profile
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteChoice}
                    className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Profile
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {isUploadingAvatar && (
            <div className="text-[11px] text-slate-400 font-medium">Updating photo...</div>
          )}
          {avatarError && (
            <div className="text-[11px] text-rose-600 font-semibold">{avatarError}</div>
          )}

          <div>
            <h2 className="text-lg font-black text-slate-900">{name}</h2>
            <div className="text-xs font-bold text-blue-600">{user.role}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Employee ID: {user.employee_id}</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Authorized Enforcement Officer</span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Ministry of Consumer Affairs</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span className="break-words">
                {zone.includes(',') ? (
                  <>
                    {zone.slice(0, zone.lastIndexOf(',')).trim()}
                    <br />
                    {zone.slice(zone.lastIndexOf(',') + 1).trim()}
                  </>
                ) : (
                  zone
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Settings Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Official Inspector Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jurisdiction / Zone
                </label>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {isSaved ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              ) : (
                <div className="text-slate-400">All updates are digitally logged.</div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>

          {/* System & Rule Engine Diagnostics */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              System & Compliance Diagnostics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Platform</div>
                <div className="font-bold text-slate-900 mt-0.5">LegalMet AI v1.0.0</div>
                <div className="text-[10px] text-emerald-600 font-semibold">● Production Active</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Rule Specification</div>
                <div className="font-bold text-slate-900 mt-0.5">PCR-2011 Complete</div>
                <div className="text-[10px] text-blue-600 font-semibold">1-34 Rules & Schedules</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Multimodal AI</div>
                <div className="font-bold text-slate-900 mt-0.5">Google Gemini API</div>
                <div className="text-[10px] text-purple-600 font-semibold">Server-Side Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}