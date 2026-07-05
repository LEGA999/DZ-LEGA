import React, { useState } from "react";
import { UserProfile } from "../types";
import { ShieldAlert, User, Mail, Lock, Sparkles, CheckCircle } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

interface SavedAccount {
  username: string;
  email: string;
  passwordHash: string; // simulated
  isAdmin: boolean;
  avatar: string;
  bio: string;
  id: string;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Legarp1",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=LegaPlayer",
  "https://api.dicebear.com/7.x/adventure/svg?seed=Raouf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki",
  "https://api.dicebear.com/7.x/bottts/svg?seed=GTA",
  "https://api.dicebear.com/7.x/miniavs/svg?seed=Amine"
];

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getSavedAccounts = (): SavedAccount[] => {
    const raw = localStorage.getItem("dz_lega_accounts");
    if (!raw) {
      // Seed default admin and users
      const defaults: SavedAccount[] = [
        {
          username: "KING_FINIXx",
          email: "king_finixx@dzlega.com",
          passwordHash: "123456", // simple simulated passwords
          isAdmin: true, // Super Admin
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Legarp1",
          bio: "Super Admin & Creator of DZ LEGA 👑",
          id: "#7777"
        },
        {
          username: "Admin_Zaki",
          email: "zaki@dzlega.com",
          passwordHash: "123456",
          isAdmin: true,
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZakiAdmin",
          bio: "مطور ومؤسس خوادم DZ LEGA",
          id: "#0001"
        }
      ];
      localStorage.setItem("dz_lega_accounts", JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const nameTrim = username.trim();
    if (!nameTrim) {
      setError("يرجى إدخال اسم المستخدم");
      return;
    }

    if (password.length < 4) {
      setError("يجب أن تتكون كلمة المرور من 4 أحرف على الأقل");
      return;
    }

    const accounts = getSavedAccounts();

    if (isLogin) {
      // Find matching account
      const found = accounts.find(
        (acc) =>
          acc.username.toLowerCase() === nameTrim.toLowerCase() &&
          acc.passwordHash === password
      );

      if (!found) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة!");
        return;
      }

      // Success
      setSuccess("تم تسجيل الدخول بنجاح! جاري تحويلك...");
      setTimeout(() => {
        onAuthSuccess({
          id: found.id,
          name: found.username,
          avatar: found.avatar,
          bio: found.bio,
          status: "online",
          statusText: found.isAdmin ? "نشط - مشرف" : "نشط باللانشر",
          isAdmin: found.isAdmin
        });
      }, 1200);
    } else {
      // Registration
      const mailTrim = email.trim();
      if (!mailTrim || !mailTrim.includes("@")) {
        setError("يرجى إدخال بريد إلكتروني صالح");
        return;
      }

      const exists = accounts.some(
        (acc) => acc.username.toLowerCase() === nameTrim.toLowerCase()
      );

      if (exists) {
        setError("اسم المستخدم هذا مسجل بالفعل!");
        return;
      }

      // Create new user account
      const randomTag = "#" + Math.floor(1000 + Math.random() * 9000).toString();
      const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
      
      const newAccount: SavedAccount = {
        username: nameTrim,
        email: mailTrim,
        passwordHash: password,
        isAdmin: nameTrim.toLowerCase() === "king_finixx", // automatic super-admin
        avatar: randomAvatar,
        bio: `لاعب جديد مسجل في مجتمع DZ LEGA 🇩🇿`,
        id: randomTag
      };

      const updated = [...accounts, newAccount];
      localStorage.setItem("dz_lega_accounts", JSON.stringify(updated));

      setSuccess("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
      setIsLogin(true);
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#07080B] text-white flex items-center justify-center font-sans select-none overflow-hidden" dir="rtl">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200')" }}>
        <div className="absolute inset-0 bg-black/85" />
        <div className="absolute top-1/4 right-1/4 w-[40%] h-[40%] bg-[#E6B73A]/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] opacity-45" />
      </div>

      {/* Auth Card Layout */}
      <div className="relative z-10 w-full max-w-md p-8 bg-[#11131a]/95 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col gap-6 text-right">
        
        {/* Glow Top Line */}
        <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-l from-transparent via-[#E6B73A] to-transparent rounded-t-2xl" />

        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] bg-[#E6B73A]/10 text-[#E6B73A] font-bold border border-[#E6B73A]/20 px-3 py-1 rounded-full uppercase tracking-wider mb-2 font-display flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#E6B73A]" />
            بوابة تسجيل دخول DZ LEGA
          </span>
          <h2 className="text-4xl font-black bg-gradient-to-br from-[#F5D27A] via-[#E6B73A] to-[#B8912E] bg-clip-text text-transparent font-display tracking-wide drop-shadow-md">
            DZ LEGA V5
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isLogin ? "قم بتسجيل الدخول للولوج إلى اللانشر واللعب" : "أنشئ حساباً جديداً للانضمام لمجتمعنا"}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#E6B73A]" />
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: Amine_Algiers"
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#E6B73A] transition text-right font-semibold"
            />
          </div>

          {/* Email (only on register) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#E6B73A]" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@dzmail.com"
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#E6B73A] transition text-left font-semibold"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#E6B73A]" />
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#E6B73A] transition text-left font-mono"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 font-display font-black text-xs py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-amber-500/10"
          >
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="border-t border-white/[0.04] pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
              setUsername("");
              setEmail("");
              setPassword("");
            }}
            className="text-xs text-gray-400 hover:text-[#E6B73A] transition font-bold"
          >
            {isLogin ? "لا تملك حساباً بعد؟ أنشئ حساباً جديداً" : "تمتلك حساباً بالفعل؟ سجل الدخول هنا"}
          </button>
        </div>

      </div>
    </div>
  );
}
