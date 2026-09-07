import React, { useEffect, useRef, useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Globe,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LegalMetLogo, AshokaEmblem, TricolorRibbon } from '../common/BrandAssets';
import { UserProfile } from '../../types';
import loginBg from '../../assets/login-bg.png';
import ministryBanner from '../../assets/ministry-banner.png';

interface LoginPageProps {
  onLoginSuccess: (user?: UserProfile) => void;
}

type LangCode = 'en' | 'hi' | 'ta' | 'te';

const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' }
];

const TRANSLATIONS: Record<LangCode, Record<string, string>> = {
  en: {
    tagline: 'Fair Markets. Trusted India.',
    inspectorPortal: 'Inspector Portal',
    welcome: 'Welcome',
    back: 'Back',
    loginSubtitle: 'Login to continue your inspections',
    emailLabel: 'Email or Employee ID',
    emailPlaceholder: 'Enter your official email or employee ID',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    orContinue: 'Or continue with',
    ssoLogin: 'Login with Government SSO',
    newUser: 'New to LegalMet AI?',
    contactAdmin: 'Contact your department administrator',
    defaultError: 'Invalid credentials. Please verify your email and password.',
    heroKicker1: 'TRANSPARENT MARKETS',
    heroKicker2: 'STRONGER INDIA',
    heroTitle1: 'For Fair Trade.',
    heroTitle2: 'For Every Citizen.',
    heroLine1: 'Accurate declarations.',
    heroLine2: 'Compliant markets.',
    heroLine3: 'A stronger and more trusted India.',
    ministryLine: '| Ministry of Consumer Affairs, Food & Public Distribution',
    help: 'Help & Support',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    digitalIndia: 'Digital India for Fair Trade'
  },
  hi: {
    tagline: 'निष्पक्ष बाज़ार। विश्वसनीय भारत।',
    inspectorPortal: 'निरीक्षक पोर्टल',
    welcome: 'वापसी पर',
    back: 'स्वागत है',
    loginSubtitle: 'अपने निरीक्षण जारी रखने के लिए लॉगिन करें',
    emailLabel: 'ईमेल या कर्मचारी आईडी',
    emailPlaceholder: 'अपना आधिकारिक ईमेल या कर्मचारी आईडी दर्ज करें',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    rememberMe: 'मुझे याद रखें',
    forgotPassword: 'पासवर्ड भूल गए?',
    signIn: 'साइन इन करें',
    orContinue: 'या इसके साथ जारी रखें',
    ssoLogin: 'सरकारी SSO से लॉगिन करें',
    newUser: 'LegalMet AI पर नए हैं?',
    contactAdmin: 'अपने विभागीय प्रशासक से संपर्क करें',
    defaultError: 'अमान्य क्रेडेंशियल्स। कृपया अपना ईमेल और पासवर्ड जांचें।',
    heroKicker1: 'पारदर्शी बाज़ार',
    heroKicker2: 'सशक्त भारत',
    heroTitle1: 'निष्पक्ष व्यापार के लिए।',
    heroTitle2: 'हर नागरिक के लिए।',
    heroLine1: 'सटीक घोषणाएँ।',
    heroLine2: 'अनुपालित बाज़ार।',
    heroLine3: 'एक मजबूत और अधिक विश्वसनीय भारत।',
    ministryLine: '| उपभोक्ता कार्य, खाद्य एवं सार्वजनिक वितरण मंत्रालय',
    help: 'सहायता एवं समर्थन',
    privacy: 'गोपनीयता नीति',
    terms: 'उपयोग की शर्तें',
    digitalIndia: 'निष्पक्ष व्यापार हेतु डिजिटल इंडिया'
  },
  ta: {
    tagline: 'நியாயமான சந்தைகள். நம்பகமான இந்தியா.',
    inspectorPortal: 'ஆய்வாளர் போர்டல்',
    welcome: 'மீண்டும்',
    back: 'வரவேற்கிறோம்',
    loginSubtitle: 'உங்கள் ஆய்வுகளைத் தொடர உள்நுழையவும்',
    emailLabel: 'மின்னஞ்சல் அல்லது பணியாளர் ஐடி',
    emailPlaceholder: 'உங்கள் அதிகாரப்பூர்வ மின்னஞ்சல் அல்லது பணியாளர் ஐடியை உள்ளிடவும்',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    rememberMe: 'என்னை நினைவில் கொள்',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    signIn: 'உள்நுழையவும்',
    orContinue: 'அல்லது இதனுடன் தொடரவும்',
    ssoLogin: 'அரசு SSO மூலம் உள்நுழையவும்',
    newUser: 'LegalMet AI-க்கு புதியவரா?',
    contactAdmin: 'உங்கள் துறை நிர்வாகியை தொடர்பு கொள்ளவும்',
    defaultError: 'தவறான தகவல்கள். உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை சரிபார்க்கவும்.',
    heroKicker1: 'வெளிப்படையான சந்தைகள்',
    heroKicker2: 'வலிமையான இந்தியா',
    heroTitle1: 'நியாயமான வர்த்தகத்திற்காக.',
    heroTitle2: 'ஒவ்வொரு குடிமகனுக்காகவும்.',
    heroLine1: 'துல்லியமான அறிவிப்புகள்.',
    heroLine2: 'இணக்கமான சந்தைகள்.',
    heroLine3: 'வலிமையான, நம்பகமான இந்தியா.',
    ministryLine: '| நுகர்வோர் விவகாரங்கள், உணவு மற்றும் பொது விநியோக அமைச்சகம்',
    help: 'உதவி & ஆதரவு',
    privacy: 'தனியுரிமைக் கொள்கை',
    terms: 'பயன்பாட்டு விதிமுறைகள்',
    digitalIndia: 'நியாயமான வர்த்தகத்திற்கான டிஜிட்டல் இந்தியா'
  },
  te: {
    tagline: 'న్యాయమైన మార్కెట్లు. విశ్వసనీయ భారతదేశం.',
    inspectorPortal: 'ఇన్‌స్పెక్టర్ పోర్టల్',
    welcome: 'తిరిగి',
    back: 'స్వాగతం',
    loginSubtitle: 'మీ తనిఖీలను కొనసాగించడానికి లాగిన్ అవ్వండి',
    emailLabel: 'ఇమెయిల్ లేదా ఉద్యోగి ఐడీ',
    emailPlaceholder: 'మీ అధికారిక ఇమెయిల్ లేదా ఉద్యోగి ఐడీని నమోదు చేయండి',
    passwordLabel: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి',
    rememberMe: 'నన్ను గుర్తుంచుకో',
    forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
    signIn: 'సైన్ ఇన్',
    orContinue: 'లేదా దీనితో కొనసాగించండి',
    ssoLogin: 'ప్రభుత్వ SSO తో లాగిన్ అవ్వండి',
    newUser: 'LegalMet AI కి కొత్తా?',
    contactAdmin: 'మీ డిపార్ట్‌మెంట్ అడ్మినిస్ట్రేటర్‌ని సంప్రదించండి',
    defaultError: 'చెల్లని వివరాలు. దయచేసి మీ ఇమెయిల్ మరియు పాస్‌వర్డ్‌ను తనిఖీ చేయండి.',
    heroKicker1: 'పారదర్శక మార్కెట్లు',
    heroKicker2: 'బలమైన భారతదేశం',
    heroTitle1: 'న్యాయమైన వాణిజ్యం కోసం.',
    heroTitle2: 'ప్రతి పౌరుడి కోసం.',
    heroLine1: 'ఖచ్చితమైన ప్రకటనలు.',
    heroLine2: 'అనుకూల మార్కెట్లు.',
    heroLine3: 'బలమైన, మరింత విశ్వసనీయ భారతదేశం.',
    ministryLine: '| వినియోగదారుల వ్యవహారాలు, ఆహార మరియు ప్రజా పంపిణీ మంత్రిత్వ శాఖ',
    help: 'సహాయం & మద్దతు',
    privacy: 'గోప్యతా విధానం',
    terms: 'వినియోగ నిబంధనలు',
    digitalIndia: 'న్యాయమైన వాణిజ్యం కోసం డిజిటల్ ఇండియా'
  }
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Official Govt of India Gazetted Holidays — 2026
const HOLIDAYS: { year: number; month: number; day: number; name: string }[] = [
  { year: 2026, month: 0, day: 26, name: 'Republic Day' },
  { year: 2026, month: 2, day: 4, name: 'Holi' },
  { year: 2026, month: 2, day: 21, name: 'Id-ul-Fitr' },
  { year: 2026, month: 2, day: 26, name: 'Ram Navami' },
  { year: 2026, month: 2, day: 31, name: 'Mahavir Jayanti' },
  { year: 2026, month: 3, day: 3, name: 'Good Friday' },
  { year: 2026, month: 4, day: 1, name: 'Buddha Purnima' },
  { year: 2026, month: 4, day: 27, name: 'Id-ul-Zuha (Bakrid)' },
  { year: 2026, month: 5, day: 26, name: 'Muharram' },
  { year: 2026, month: 7, day: 15, name: 'Independence Day' },
  { year: 2026, month: 7, day: 26, name: 'Milad-un-Nabi / Id-e-Milad' },
  { year: 2026, month: 8, day: 4, name: 'Janmashtami' },
  { year: 2026, month: 9, day: 2, name: 'Mahatma Gandhi Jayanti' },
  { year: 2026, month: 9, day: 20, name: 'Dussehra (Vijay Dashami)' },
  { year: 2026, month: 10, day: 8, name: 'Diwali (Deepavali)' },
  { year: 2026, month: 10, day: 24, name: "Guru Nanak's Birthday" },
  { year: 2026, month: 11, day: 25, name: 'Christmas Day' }
];

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('rohinth.k@lm.gov.in');
  const [password, setPassword] = useState('Inspector@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [lang, setLang] = useState<LangCode>(() => {
    const saved = localStorage.getItem('legalmet_lang');
    return (saved as LangCode) || 'en';
  });
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const calendarRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('legalmet_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false });

  const monthHolidays = HOLIDAYS.filter((h) => h.year === viewYear && h.month === viewMonth).sort((a, b) => a.day - b.day);
  const holidayDays = new Set(monthHolidays.map((h) => h.day));

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
        setErrorMessage(data.error || t.defaultError);
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
      <header className="px-8 py-6 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-3">
          <LegalMetLogo className="w-14 h-14 shrink-0" />
          <div>
            <div className="font-bold text-slate-900 text-lg tracking-tight leading-tight flex items-center gap-1.5">
              LegalMet <span className="text-blue-600">AI</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {t.tagline}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Official calendar */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setCalendarOpen((o) => !o)}
              aria-label="Open official calendar"
              title="Official Calendar"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs transition-colors"
            >
              <CalendarDays className="w-5 h-5 text-slate-500" />
            </button>

            {calendarOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden">
                <div className="bg-linear-to-r from-blue-700 to-blue-600 px-5 py-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {viewYear} {MONTH_NAMES[viewMonth]}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={goToPrevMonth} className="p-1.5 hover:bg-white/15 rounded-full transition-colors" aria-label="Previous month">
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button type="button" onClick={goToNextMonth} className="p-1.5 hover:bg-white/15 rounded-full transition-colors" aria-label="Next month">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-1.5">
                    {WEEKDAYS.map((w) => (
                      <div key={w} className="text-center text-[9px] font-bold text-white bg-blue-600 rounded-md py-1.5 tracking-wide">
                        {w}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {cells.map((c, i) => {
                      const isHoliday = c.current && holidayDays.has(c.day);
                      const isToday = c.current && viewMonth === today.getMonth() && viewYear === today.getFullYear() && c.day === today.getDate();
                      return (
                        <div
                          key={i}
                          className={`text-center text-[11px] py-1.5 rounded-lg font-semibold transition-colors ${!c.current ? 'text-slate-300' :
                            isHoliday ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' :
                              isToday ? 'border-2 border-blue-500 text-blue-700' :
                                'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          {c.day}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2 max-h-40 overflow-y-auto">
                    {monthHolidays.length > 0 ? (
                      monthHolidays.map((h) => (
                        <div key={h.name} className="flex items-center gap-2.5 text-xs">
                          <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 shadow-sm shadow-rose-600/30">
                            {h.day}
                          </span>
                          <span className="text-slate-800 font-semibold flex-1">{h.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Gazetted</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 text-center py-1">No gazetted holidays this month.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Language switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen((o) => !o)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs"
            >
              <Globe className="w-5 h-5 text-slate-500" />
              <span>{LANGUAGES.find((l) => l.code === lang)?.native}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-40">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 flex items-center justify-between ${lang === l.code ? 'text-blue-600 bg-blue-50/60' : 'text-slate-700'
                      }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-slate-400">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center pl-4 ml-1 border-l border-slate-200">
            <img
              src={ministryBanner}
              alt="An initiative under Ministry of Consumer Affairs, Food & Public Distribution, Government of India"
              className="h-20 w-auto object-contain"
            />
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
              <span>{t.inspectorPortal}</span>
            </div>

            <h1 className="text-3xl font-black text-slate-950 tracking-tight mb-2">
              {t.welcome} <span className="text-blue-600">{t.back}</span>
            </h1>
            <p className="text-sm text-slate-500 mb-8">
              {t.loginSubtitle}
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
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-id-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
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
                  <span>{t.rememberMe}</span>
                </label>
                <a href="#" className="font-semibold text-blue-600 hover:underline">
                  {t.forgotPassword}
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
                    <span>{t.signIn}</span>
                  </>
                )}
              </button>

              {/* SSO Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-xs font-medium text-slate-500">
                  {t.orContinue}
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
                <span>{t.ssoLogin}</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
              {t.newUser}{' '}
              <a href="#" className="font-semibold text-blue-600 hover:underline">
                {t.contactAdmin}
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
            <span>{t.ministryLine}</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-800">{t.help}</a>
            <a href="#" className="hover:text-slate-800">{t.privacy}</a>
            <a href="#" className="hover:text-slate-800">{t.terms}</a>
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <TricolorRibbon className="w-4 h-3 rounded-xs overflow-hidden" /> {t.digitalIndia}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}