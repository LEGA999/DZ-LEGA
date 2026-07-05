import React, { useState } from "react";
import { X, Plus, FolderOpen, Play, Check, AlertCircle } from "lucide-react";
import { ServerInfo } from "../types";

// ─── Add Server Dialog ───
interface AddServerDialogProps {
  onClose: () => void;
  onSubmit: (server: ServerInfo) => void;
}

export function AddServerDialog({ onClose, onSubmit }: AddServerDialogProps) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState(7777);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("الرجاء إدخال اسم السيرفر");
      return;
    }
    if (!ip.trim()) {
      setError("الرجاء إدخال عنوان الـ IP");
      return;
    }
    if (!port || port <= 0 || port > 65535) {
      setError("المنفذ يجب أن يكون بين 1 و 65535");
      return;
    }

    onSubmit({ name: name.trim(), ip: ip.trim(), port });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#161922] border border-amber-500/20 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-500 mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-amber-500 font-display">إضافة سيرفر جديد</h3>
          <p className="text-xs text-gray-400 mt-1">أضف خادم اللعب المفضل لديك يدويًا</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">اسم السيرفر</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: DZ LEGA V5"
              className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">عنوان IP</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="مثال: 188.165.192.24"
              className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition text-left font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">المنفذ (Port)</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 0)}
              placeholder="7777"
              className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition text-left font-mono"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/5 p-2.5 rounded-lg border border-red-500/10">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 text-sm font-bold py-2.5 rounded-lg transition shadow-lg shadow-amber-500/10"
            >
              إضافة السيرفر
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold py-2.5 rounded-lg transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Game Path Dialog ───
interface GamePathDialogProps {
  onClose: () => void;
  onSelect: (path: string) => void;
}

export function GamePathDialog({ onClose, onSelect }: GamePathDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickFolder = () => {
    setBusy(true);
    setError(null);

    // Simulate folder choice delay
    setTimeout(() => {
      setBusy(false);
      // Simulate successful directory select with gta_sa.exe
      onSelect("C:\\Program Files (x86)\\GTA San Andreas\\gta_sa.exe");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#161922] border border-amber-500/20 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-500 mb-4">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-amber-500 font-display">تحديد مسار اللعبة</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            الرجاء اختيار المجلد الذي يحتوي على ملف لعبة <strong className="text-white">gta_sa.exe</strong> لتأمين اقتران اللانشر بمحرك اللعبة بشكل صحيح.
          </p>

          {error && (
            <div className="mt-3 text-xs text-red-400 bg-red-400/5 p-2.5 rounded-lg border border-red-500/10">
              {error}
            </div>
          )}

          <div className="w-full mt-6 space-y-2">
            <button
              onClick={handlePickFolder}
              disabled={busy}
              className="w-full bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 text-sm font-bold py-3 rounded-lg transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? (
                <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FolderOpen className="w-4 h-4" />
                  <span>استعراض المجلد</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={busy}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold py-2.5 rounded-lg transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Connect Dialog ───
interface ConnectDialogProps {
  server: ServerInfo;
  savedNickname: string;
  onClose: () => void;
  onConnect: (nickname: string) => void;
}

export function ConnectDialog({ server, savedNickname, onClose, onConnect }: ConnectDialogProps) {
  const [nickname, setNickname] = useState(savedNickname || "");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("الرجاء إدخال اسم اللاعب");
      return;
    }
    if (nickname.length < 3 || nickname.length > 20) {
      setError("الاسم يجب أن يكون بين 3 و 20 حرفًا");
      return;
    }

    setConnecting(true);
    setTimeout(() => {
      onConnect(nickname.trim());
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#161922] border border-amber-500/20 rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Glow Header Accent Line */}
        <div className="h-[3px] bg-gradient-to-r from-transparent via-[#E6B73A] to-transparent w-full" />

        <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="text-4xl mb-2">🎮</div>
            <h3 className="text-md font-bold text-amber-500 font-display text-center">{server.name}</h3>
            <span className="font-mono text-xs text-gray-400 mt-1">{server.ip}:{server.port}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">اسم اللاعب (Nickname)</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Player_Name"
                className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition text-left font-mono"
                autoFocus
              />
              <span className="text-[10px] text-gray-500 mt-1 block">ملاحظة: استعمل الصيغة الاسم_اللقب (مثل: Amine_Algiers)</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/5 p-2.5 rounded-lg border border-red-500/10">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold py-3 rounded-lg transition border border-white/5"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={connecting}
                className="flex-[2] bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 text-xs font-black py-3 rounded-lg transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>دخول السيرفر</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Profile Dialog ───
import { UserProfile } from "../types";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Legarp1",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=LegaPlayer",
  "https://api.dicebear.com/7.x/adventure/svg?seed=Raouf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki",
  "https://api.dicebear.com/7.x/bottts/svg?seed=GTA",
  "https://api.dicebear.com/7.x/miniavs/svg?seed=Amine"
];

interface EditProfileDialogProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export function EditProfileDialog({ profile, onClose, onSave }: EditProfileDialogProps) {
  const [name, setName] = useState(profile.name || "");
  const [tag, setTag] = useState(profile.id || "");
  const [avatar, setAvatar] = useState(profile.avatar || PRESET_AVATARS[0]);
  const [bio, setBio] = useState(profile.bio || "");
  const [status, setStatus] = useState(profile.status || "online");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("الرجاء إدخال اسمك المستعار");
      return;
    }
    
    // Ensure tag starts with '#'
    let finalTag = tag.trim();
    if (finalTag && !finalTag.startsWith("#")) {
      finalTag = "#" + finalTag;
    } else if (!finalTag) {
      finalTag = "#" + Math.floor(1000 + Math.random() * 9000).toString();
    }

    let finalAvatar = avatar;
    if (customAvatarUrl.trim()) {
      finalAvatar = customAvatarUrl.trim();
    }

    let statusText = "متصل";
    if (status === "in_game") statusText = "يلعب حالياً في DZ LEGA V5";
    else if (status === "away") statusText = "خارج اللعبة";

    onSave({
      id: finalTag,
      name: name.trim(),
      avatar: finalAvatar,
      bio: bio.trim(),
      status,
      statusText
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#161922] border border-amber-500/20 rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-5">
          <img
            src={customAvatarUrl.trim() ? customAvatarUrl.trim() : avatar}
            alt="Current avatar"
            className="w-16 h-16 rounded-xl bg-black/30 border-2 border-amber-500/50 p-0.5 shadow-lg shadow-amber-500/5"
            onError={(e) => {
              // fallback if custom URL fails
              (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
            }}
          />
          <h3 className="text-md font-bold text-amber-500 font-display mt-2">تخصيص بروفايلك الخاص</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">اصنع هويتك المذهلة لتظهر في المجتمع النشط</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">الاسم المستعار</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: Amine_Constantine"
                className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">الآيدي المميز (Tag ID)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="#1337"
                className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition text-left font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">اختر من الأفاتارات الجاهزة</label>
            <div className="flex gap-2 flex-wrap justify-center bg-black/20 p-2 rounded-lg border border-white/5">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    setAvatar(av);
                    setCustomAvatarUrl(""); // clear custom input
                  }}
                  className={`w-10 h-10 rounded-lg bg-black/30 border overflow-hidden p-0.5 transition ${
                    avatar === av && !customAvatarUrl
                      ? "border-amber-500 scale-105 shadow-md shadow-amber-500/10"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={av} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">أو ضع رابط صورتك الخاصة (URL)</label>
            <input
              type="text"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              placeholder="https://example.com/my-photo.png"
              className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition text-left font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">حالتك الشخصية (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب شيئاً عن نفسك، كلانك، أو رتبتك المفضلة..."
              className="w-full bg-black/45 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition h-14 resize-none text-right font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">الحالة الحالية</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "online", label: "نشط 🟢" },
                { key: "away", label: "خمول 🟡" },
                { key: "in_game", label: "يلعب 🔴" }
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setStatus(st.key as any)}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition ${
                    status === st.key
                      ? "bg-amber-500/15 border-amber-500 text-amber-500"
                      : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-400/5 p-2.5 rounded-lg border border-red-500/10">
              {error}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 text-xs font-black py-2.5 rounded-lg transition shadow-lg shadow-amber-500/10"
            >
              حفظ وتطبيق التغييرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold py-2 rounded-lg transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

