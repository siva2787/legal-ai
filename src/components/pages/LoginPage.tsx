import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sun,
  Globe,
  ChevronDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { LegalMetLogo, AshokaEmblem, TricolorRibbon } from '../common/BrandAssets';
import { UserProfile } from '../../types';
import loginBg from '../../assets/login-bg.png';

interface LoginPageProps {
  onLoginSuccess: (user?: UserProfile) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('rohinth.k@lm.gov.in');
  const [password, setPassword] = useState('Inspector@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        if (rememberMe) {
          localStorage.setItem('legalmet_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Seamless offline fallback
      onLoginSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-page" className="min-h-screen bg-[#F5F8FC] flex flex-col justify-between font-sans antialiased relative overflow-hidden">
      {/* Decorative blurred leaf accents */}
      <div className="pointer-events-none absolute -left-16 top-24 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl"></div>
      <div className="pointer-events-none absolute -left-10 bottom-0 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl"></div>

      {/* Top Header */}
      <header className="px-8 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <LegalMetLogo className="w-10 h-10 shrink-0" />
          <div>
            <div className="font-bold text-slate-900 text-lg tracking-tight leading-tight flex items-center gap-1.5">
              LegalMet <span className="text-blue-600">AI</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Fair Markets. Trusted India.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button aria-label="Toggle theme" className="p-2 text-slate-500 hover:text-slate-800 rounded-lg transition-colors">
            <Sun className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>English</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <AshokaEmblem className="w-8 h-10 shrink-0" />
            <div className="text-[10px] text-slate-600 leading-tight">
              <span className="text-[9px] text-slate-400 block font-normal">An initiative under</span>
              <span className="font-semibold text-slate-900 block">Ministry of Consumer Affairs,</span>
              Food & Public Distribution
              <div className="text-slate-500">Government of India</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Body Split Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch w-full">
          {/* Left Form Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-slate-200/90 relative flex flex-col justify-center">
            {/* Inspector Portal Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Inspector Portal</span>
            </div>

            <h1 className="text-3xl font-black text-slate-950 tracking-tight mb-2">
              Welcome <span className="text-blue-600">Back</span>
            </h1>
            <p className="text-sm text-slate-500 mb-8">
              Login to continue your inspections
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email / ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Email or Employee ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-id-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your official email or employee ID"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* SSO Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-xs font-medium text-slate-500">
                  Or continue with
                </span>
              </div>

              {/* Government SSO Button */}
              <button
                id="login-sso-btn"
                type="button"
                onClick={onLoginSuccess}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center gap-3 transition-all text-sm"
              >
                <AshokaEmblem className="w-5 h-6 shrink-0" />
                <span>Login with Government SSO</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
              New to LegalMet AI?{' '}
              <a href="#" className="font-semibold text-blue-600 hover:underline">
                Contact your department administrator
              </a>
            </div>
          </div>

          {/* Right Government Visual Showcase */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 min-h-[560px] h-full">
            <img
              src={loginBg}
              alt="For Fair Trade. For Every Citizen. — Ashoka Pillar and national monument"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-8 py-5 border-t border-slate-200/80 bg-white/70 backdrop-blur-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <LegalMetLogo className="w-4 h-4" />
            <span className="font-semibold text-slate-700">LegalMet AI</span>
            <span>| Ministry of Consumer Affairs, Food & Public Distribution</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-800">Help & Support</a>
            <a href="#" className="hover:text-slate-800">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800">Terms of Use</a>
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <TricolorRibbon className="w-4 h-3 rounded-xs overflow-hidden" /> Digital India for Fair Trade
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}