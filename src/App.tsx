import React, { useState, useEffect, useRef } from "react";
import SplashLoader from "./components/SplashLoader";
import SimulatedGame from "./components/SimulatedGame";
import CommunityHub from "./components/CommunityHub";
import AuthScreen from "./components/AuthScreen";
import SupportHub from "./components/SupportHub";
import AdminHub from "./components/AdminHub";
import { AddServerDialog, GamePathDialog, ConnectDialog, EditProfileDialog } from "./components/Dialogs";
import { ServerInfo, SettingsState, UserProfile } from "./types";
import {
  Sparkles,
  MessageSquare,
  Compass,
  ShieldAlert,
  Wifi,
  Globe,
  Send,
  Gamepad2,
  Info,
  Server,
  Settings,
  User,
  Volume2,
  VolumeX,
  Play,
  Monitor,
  Calendar,
  Layers,
  ChevronLeft,
  X,
  Plus,
  Heart,
  Trash2,
  ListFilter,
  ArrowUp
} from "lucide-react";

const kDiscordUrl = "https://discord.gg/gPkqK5wtQd";
const kWebsiteUrl = "https://dzlegarp-s5site.lovable.app/";

const DEFAULT_SERVERS: ServerInfo[] = [
  { name: "DZ LEGA", ip: "13.41.225.249", port: 23025 }
];

const DEFAULT_SETTINGS: SettingsState = {
  language: "العربية",
  fpsCap: 144,
  quality: "مرتفع",
  volume: 0.5,
  notifications: true,
  autoConnect: false
};

const DEFAULT_PROFILE: UserProfile = {
  id: "#7777",
  name: "KING_FINIXx",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Legarp1",
  bio: "عاشق لـ RolePlay الواقعي ومجتمع DZ LEGA V5 الجزائري 🇩🇿.",
  status: "online",
  statusText: "متصل باللانشر",
  isAdmin: true
};

// Preset audio default loop (Beautiful atmospheric cinematic game background)
const DEFAULT_TRACK_URL = "https://codeskulptor-demos.commondatastorage.googleapis.com/desolate_land.mp3";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<"play" | "servers" | "community" | "support" | "admin" | "settings">("play");
  
  // App Core State
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gamePath, setGamePath] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [myProfile, setMyProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Shared News & Reactions State
  const [newsContent, setNewsContent] = useState<string>("مرحباً بكم في لانشر DZ LEGA V5 الجزائري الرسمي 🇩🇿! ترقبوا افتتاح السيرفر الجديد قريباً.");
  const [newsReactions, setNewsReactions] = useState<string[]>([]);
  const [editingNews, setEditingNews] = useState<string>("");
  const [isUpdatingNews, setIsUpdatingNews] = useState(false);

  // Dialog & Drawer UI state
  const [showAddServer, setShowAddServer] = useState(false);
  const [showGamePath, setShowGamePath] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Authentication Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Background Audio State
  const [musicUrl, setMusicUrl] = useState<string>(DEFAULT_TRACK_URL);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulated Game Session State
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch servers and news from backend
  const fetchServersAndNews = async () => {
    try {
      const serversRes = await fetch("/api/servers");
      if (serversRes.ok) {
        const data = await serversRes.json();
        setServers(data.servers);
      }

      const newsRes = await fetch("/api/news");
      if (newsRes.ok) {
        const data = await newsRes.json();
        setNewsContent(data.content);
        setNewsReactions(data.reactions);
      }
    } catch (err) {
      console.error("Error fetching collaborative data:", err);
    }
  };

  // Initialize and load saved state from LocalStorage
  useEffect(() => {
    // 1. Initial collaborative fetch
    fetchServersAndNews();

    // Setup periodic polling to keep all players synchronized (every 4s)
    const syncInterval = setInterval(fetchServersAndNews, 4000);

    // 2. Load active selected index
    setSelectedIndex(0);

    // 3. Load game path
    const storedPath = localStorage.getItem("gta_sa_path");
    if (storedPath) {
      setGamePath(storedPath);
    }

    // 4. Load Active Logged In Session
    const storedActiveUser = localStorage.getItem("dz_lega_logged_in_user");
    if (storedActiveUser) {
      try {
        const u = JSON.parse(storedActiveUser);
        setCurrentUser(u);
        setMyProfile(u);
      } catch (_) {
        setCurrentUser(null);
      }
    }

    // 5. Load settings
    let initialVolume = DEFAULT_SETTINGS.volume;
    const storedSettings = localStorage.getItem("launcher_settings");
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        if (parsed.volume !== undefined) {
          initialVolume = parsed.volume;
        }
      } catch (_) {
        setSettings(DEFAULT_SETTINGS);
      }
    }

    // 6. Load customized music URL
    const storedMusic = localStorage.getItem("launcher_music_url") || DEFAULT_TRACK_URL;
    setMusicUrl(storedMusic);

    // Setup background audio instance
    const audio = new Audio(storedMusic);
    audio.loop = true;
    audio.volume = initialVolume;
    audioRef.current = audio;

    return () => {
      clearInterval(syncInterval);
      audio.pause();
    };
  }, []);

  // Update audio volume when setting changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings.volume]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        console.log("Audio play blocked by browser autoplay policy.");
      });
    }
    setMusicPlaying(!musicPlaying);
  };

  const handleUpdateMusicUrl = (newUrl: string) => {
    setMusicUrl(newUrl);
    localStorage.setItem("launcher_music_url", newUrl);
    if (audioRef.current) {
      const wasPlaying = musicPlaying;
      audioRef.current.pause();
      audioRef.current.src = newUrl;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch((e) => {
          console.log("Audio play blocked by browser:", e);
        });
      }
    }
  };

  // Save servers to localStorage on modification
  const saveServersList = (newList: ServerInfo[]) => {
    setServers(newList);
    localStorage.setItem("saved_servers", JSON.stringify(newList));
  };

  const handleSelectServer = (idx: number) => {
    setSelectedIndex(idx);
    localStorage.setItem("selected_server_index", idx.toString());
  };

  const handleAddServer = async (newServer: ServerInfo) => {
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newServer,
          isAdmin: currentUser?.isAdmin || false
        })
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers);
        setSelectedIndex(data.servers.length - 1);
      } else {
        const errData = await res.json();
        console.error(errData.error || "فشل إضافة السيرفر");
      }
    } catch (err) {
      console.error(err);
    }
    setShowAddServer(false);
  };

  const handleRemoveServer = async (idxToRemove: number) => {
    try {
      const res = await fetch("/api/servers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index: idxToRemove,
          isAdmin: currentUser?.isAdmin || false
        })
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers);
        if (selectedIndex === idxToRemove) {
          handleSelectServer(0);
        } else if (selectedIndex > idxToRemove) {
          handleSelectServer(selectedIndex - 1);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNews = async (content: string) => {
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          isAdmin: currentUser?.isAdmin || false
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNewsContent(data.content);
        setNewsReactions(data.reactions);
        setIsUpdatingNews(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHeart = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/news/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id || currentUser.name })
      });
      if (res.ok) {
        const data = await res.json();
        setNewsReactions(data.reactions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGamePath = (path: string) => {
    setGamePath(path);
    localStorage.setItem("gta_sa_path", path);
    setShowGamePath(false);
  };

  const handleConnectPressed = () => {
    if (!gamePath) {
      setShowGamePath(true);
      return;
    }
    setShowConnect(true);
  };

  const handleLaunchGame = (selectedNickname: string) => {
    // Update profile name
    const updatedProfile = { ...myProfile, name: selectedNickname };
    setMyProfile(updatedProfile);
    localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("last_nickname", selectedNickname);
    
    // Stop soundtrack during gameplay simulation
    if (audioRef.current && musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
    
    setShowConnect(false);
    setIsPlaying(true);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setMyProfile(updated);
    setCurrentUser(updated);
    localStorage.setItem("dz_lega_logged_in_user", JSON.stringify(updated));
    setShowEditProfile(false);
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    setMyProfile(profile);
    localStorage.setItem("dz_lega_logged_in_user", JSON.stringify(profile));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("dz_lega_logged_in_user");
    setActiveTab("play");
  };

  const handleUpdateSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    localStorage.setItem("launcher_settings", JSON.stringify(newSettings));
  };

  const openUrl = (url: string) => {
    window.open(url, "_blank");
  };

  const handleBackToPlay = () => {
    setActiveTab("play");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const activeServer = servers[selectedIndex] || DEFAULT_SERVERS[0];

  // Check if current user is banned
  const isBanned = (() => {
    if (!currentUser) return false;
    try {
      const stored = localStorage.getItem("community_profiles_moderation");
      if (stored) {
        const parsed = JSON.parse(stored);
        const userMod = parsed[currentUser.name];
        return userMod?.isBanned || false;
      }
    } catch (_) {}
    return false;
  })();

  if (showSplash) {
    return <SplashLoader onComplete={() => setShowSplash(false)} />;
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (isBanned) {
    return (
      <div className="fixed inset-0 bg-[#07080B] text-white flex flex-col items-center justify-center font-sans p-6 text-center select-none" dir="rtl">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200')" }} />
        <div className="relative z-10 max-w-md bg-[#161922] border border-red-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-red-600/15 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
            🚫
          </div>
          <h2 className="text-2xl font-black text-white font-display mb-2">تم حظر حسابك بالكامل ❌</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            تم تطبيق عقوبة الحظر الإداري الشامل على اللاعب <strong className="text-red-400">{currentUser.name}</strong> بسبب مخالفة قوانين المجتمع وسيرفر DZ LEGA V5.
          </p>
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-right mb-6 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between"><span className="text-gray-500">اسم اللاعب:</span> <span className="text-white">{currentUser.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">الرقم التعريفي ID:</span> <span className="text-[#E6B73A]">{currentUser.id}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">حالة الاتصال:</span> <span className="text-red-400">محظور (BANNED)</span></div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 font-display font-black text-xs py-3 rounded-xl transition shadow-lg shadow-amber-500/10"
          >
            تسجيل الخروج والعودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <SimulatedGame
        nickname={myProfile.name}
        serverIp={activeServer.ip}
        serverName={activeServer.name}
        onExit={() => setIsPlaying(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#07080B] text-white flex flex-col font-sans select-none overflow-hidden" dir="rtl">
      
      {/* 🔮 FiveM Style Immersive Glowing Backdrop */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200')" }}>
        <div className="absolute inset-0 bg-[#07080B]/90" />
        {/* Soft Golden Flares and Moving Linear Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E6B73A]/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-[140px]" />
        
        {/* Subtle high-tech overlay grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      </div>

      {/* CORE LAYOUT */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        
        {/* ==========================================
            FIVEM TOP NAVIGATION BAR
            ========================================== */}
        <header className="relative z-50 px-6 py-1.5 border-b border-white/[0.04] bg-black/40 backdrop-blur-md flex justify-between items-center text-right h-14 shrink-0">
          
          {/* Right Logo & Branding */}
          <div className="flex items-center gap-2.5">
            <span className="font-display font-black text-xl tracking-wider text-[#E6B73A] drop-shadow-[0_0_10px_rgba(230,183,58,0.4)]">
              DZLEGA
            </span>
            <span className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] text-gray-400 font-bold tracking-widest font-sans">V5 LAUNCHER</span>
            {activeTab !== "play" && (
              <>
                <span className="h-4 w-[1px] bg-white/10" />
                <button
                  onClick={handleBackToPlay}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 hover:scale-105 border border-[#E6B73A]/40 rounded-lg text-[10px] font-black transition-all duration-300 transform active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer animate-pulse"
                  title="العودة للقائمة الرئيسية"
                >
                  <ArrowUp className="w-3.5 h-3.5 animate-bounce text-neutral-950 font-bold" />
                  <span>الرئيسية ↩</span>
                </button>
              </>
            )}
          </div>

          {/* Center Tabs selector (FiveM Exact Layout) */}
          <nav className="flex items-center gap-1.5 h-full">
            {[
              { id: "play", label: "اللعب", desc: "PLAY" },
              { id: "servers", label: "الخوادم", desc: "SERVERS" },
              { id: "community", label: "المجتمع والدردشة", desc: "COMMUNITY" },
              { id: "support", label: "الدعم الفني والشكاوى", desc: "SUPPORT" },
              ...(currentUser?.isAdmin ? [{ id: "admin", label: "غرفة المشرفين 🛡️", desc: "ADMIN" }] : []),
              { id: "settings", label: "الإعدادات", desc: "SETTINGS" }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 h-11 flex flex-col items-center justify-center relative transition group`}
                >
                  <span className={`text-xs font-bold font-display transition-all ${
                    active ? "text-[#E6B73A] scale-105" : "text-gray-400 group-hover:text-white"
                  }`}>
                    {tab.label}
                  </span>
                  <span className="text-[8px] font-mono text-gray-500 tracking-wider block font-medium leading-none mt-0.5">
                    {tab.desc}
                  </span>

                  {/* Active highlight line exactly like FiveM */}
                  {active ? (
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#E6B73A] shadow-[0_0_8px_#E6B73A]" />
                  ) : (
                    <div className="absolute bottom-0 left-1/2 right-1/2 h-[2px] bg-[#E6B73A]/0 group-hover:left-2 group-hover:right-2 group-hover:bg-[#E6B73A]/25 transition-all duration-200" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Left: Active Customizable Profile badge */}
          <div className="flex items-center gap-3">
            {/* Music Wave visualizer + toggle button */}
            <button
              onClick={toggleMusic}
              className={`p-2 rounded-lg bg-white/5 border border-white/5 hover:border-[#E6B73A]/20 transition flex items-center gap-1.5 cursor-pointer ${
                musicPlaying ? "text-[#E6B73A]" : "text-gray-400"
              }`}
              title="موسيقى الخلفية"
            >
              {musicPlaying ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  {/* Small animated bar audio waves */}
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-2 bg-[#E6B73A] animate-bounce" />
                    <span className="w-0.5 h-3 bg-[#E6B73A] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-0.5 h-1.5 bg-[#E6B73A] animate-bounce [animation-delay:0.4s]" />
                  </span>
                </>
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Profile trigger card */}
            <div
              onClick={() => setShowEditProfile(true)}
              className="flex items-center gap-2.5 bg-black/45 border border-white/5 hover:border-[#E6B73A]/40 px-3 py-1.5 rounded-lg transition cursor-pointer select-none group"
              title="اضغط لتعديل بروفايلك"
            >
              <img
                src={myProfile.avatar}
                alt="My profile pic"
                className="w-7 h-7 rounded-md bg-black/20 border border-[#E6B73A]/30 group-hover:border-[#E6B73A]"
              />
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-xs font-black text-white group-hover:text-[#E6B73A] transition">{myProfile.name || "لاعب_جديد"}</span>
                  <span className="text-[9px] font-mono font-bold text-[#E6B73A]">{myProfile.id}</span>
                </div>
                <span className="text-[8px] text-emerald-400 block mt-0.5 font-bold font-sans">● {myProfile.status === "online" ? "متصل" : "خارج اللعبة"}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 text-red-400 hover:text-white transition flex items-center justify-center cursor-pointer text-[10px] font-bold font-display"
              title="تسجيل الخروج"
            >
              <span>تسجيل خروج</span>
            </button>
          </div>
        </header>

        {/* ==========================================
            TAB DYNAMIC VIEWS
            ========================================== */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* 1. PLAY TAB */}
          {activeTab === "play" && (
            <div className="absolute inset-0">
              <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
              {/* Central banner and main play action */}
              <div className="flex-1 flex flex-col justify-center items-center p-6 text-center relative z-10">
                <div className="absolute w-80 h-80 bg-[#E6B73A]/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Giant Golden FiveM Style Title */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] bg-[#E6B73A]/10 text-[#E6B73A] font-bold border border-[#E6B73A]/20 px-3 py-1 rounded-full uppercase tracking-wider mb-2 font-display">
                    الخادم الجزائري الرسمي المعتمد
                  </span>
                  
                  <h2 className="text-8xl font-black bg-gradient-to-br from-[#F5D27A] via-[#E6B73A] to-[#B8912E] bg-clip-text text-transparent font-display drop-shadow-[0_5px_15px_rgba(0,0,0,0.7)] tracking-wide">
                    DZ LEGA
                  </h2>
                  <h3 className="text-sm font-bold text-gray-400 font-sans mt-1 tracking-[8px] mr-[-8px] uppercase">
                    ROLE PLAY COMMUNITY
                  </h3>
                  <div className="text-xs font-black text-[#FF4D62] tracking-[6px] mr-[-6px] font-display mt-2 uppercase">
                    V5 SERVER LAUNCHER
                  </div>
                </div>

                {/* Simulated Server Statistics widget */}
                <div className="mt-8 flex gap-6 bg-black/45 border border-white/5 p-4 rounded-xl backdrop-blur-sm max-w-md w-full">
                  <div className="flex-1 text-center border-l border-white/5">
                    <span className="text-[10px] text-gray-500 block">اللاعبون المتصلون</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">148 / 500</span>
                  </div>
                  <div className="flex-1 text-center border-l border-white/5">
                    <span className="text-[10px] text-gray-500 block">البينغ المتوسط</span>
                    <span className="text-base font-extrabold text-white font-mono mt-0.5 block">45 ms</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[10px] text-gray-500 block">الأدمن المتصلون</span>
                    <span className="text-base font-extrabold text-[#E6B73A] mt-0.5 block">6 نشطين</span>
                  </div>
                </div>

                {/* Main Action Connect Button */}
                <div className="mt-8">
                  <button
                    onClick={handleConnectPressed}
                    className="group relative px-12 py-4 bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 font-display font-black text-base rounded-xl transition-all duration-300 transform hover:scale-[1.04] shadow-2xl shadow-amber-500/25 active:scale-[0.98] flex items-center gap-3"
                  >
                    <span className="text-xl">⚡</span>
                    <span>اتصال بـ {activeServer.name}</span>
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => openUrl(kDiscordUrl)}
                    className="flex items-center gap-1.5 px-4_5 py-2 bg-black/45 border border-white/5 hover:border-indigo-500/30 rounded-lg text-xs text-indigo-400 hover:text-indigo-300 font-bold transition shadow-md"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>Discord</span>
                  </button>

                  <button
                    onClick={() => openUrl(kWebsiteUrl)}
                    className="flex items-center gap-1.5 px-4_5 py-2 bg-black/45 border border-white/5 hover:border-amber-500/30 rounded-lg text-xs text-[#E6B73A] hover:text-[#E6B73A]/80 font-bold transition shadow-md"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>الموقع الرسمي</span>
                  </button>

                  <button
                    onClick={() => setShowGamePath(true)}
                    className={`flex items-center gap-1.5 px-4_5 py-2 bg-black/45 border rounded-lg text-xs font-bold transition shadow-md ${
                      gamePath ? "border-emerald-500/20 text-emerald-400" : "border-white/5 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>{gamePath ? "تم ربط اللعبة ✓" : "تحديد مسار اللعبة"}</span>
                  </button>
                </div>
              </div>

              {/* Side Server Quick Switcher Sidebar */}
              <div className="w-full md:w-64 bg-black/60 border-r border-white/5 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Server className="w-4 h-4 text-[#E6B73A]" />
                        التبديل بين السيرفرات
                      </span>
                      {currentUser?.isAdmin && (
                        <button
                          onClick={() => setShowAddServer(true)}
                          className="p-1 rounded bg-[#E6B73A]/10 text-[#E6B73A] hover:bg-[#E6B73A] hover:text-black transition"
                          title="إضافة سيرفر جديد (خاص بالأدمن)"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {servers.map((server, i) => {
                        const selected = selectedIndex === i;
                        return (
                          <div
                            key={i}
                            onClick={() => handleSelectServer(i)}
                            className={`p-2.5 rounded-lg border text-right transition cursor-pointer flex justify-between items-center ${
                              selected
                                ? "bg-[#E6B73A]/15 border-[#E6B73A]/40"
                                : "bg-black/30 border-transparent hover:bg-black/50 hover:border-white/5"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <span className={`text-xs font-bold block truncate ${selected ? "text-[#E6B73A]" : "text-white"}`}>
                                {server.name}
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono block mt-0.5">
                                {server.ip}:{server.port}
                              </span>
                            </div>
                            {servers.length > 1 && currentUser?.isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveServer(i);
                                }}
                                className="p-1 rounded opacity-100 hover:text-red-400 text-gray-500 transition"
                                title="حذف السيرفر"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* News & Announcements Box (مربع الأخبار) */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-right">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#E6B73A] font-extrabold uppercase tracking-wider font-display flex items-center gap-1">
                          <span>📢</span> الأخبار والإعلانات
                        </span>
                      </div>
                      {currentUser?.isAdmin && (
                        <button
                          onClick={() => {
                            setEditingNews(newsContent);
                            setIsUpdatingNews(!isUpdatingNews);
                          }}
                          className="text-[9px] bg-[#E6B73A]/10 text-[#E6B73A] px-1.5 py-0.5 rounded hover:bg-[#E6B73A] hover:text-black transition font-bold"
                        >
                          {isUpdatingNews ? "إلغاء" : "تعديل"}
                        </button>
                      )}
                    </div>

                    {isUpdatingNews ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingNews}
                          onChange={(e) => setEditingNews(e.target.value)}
                          className="w-full text-xs p-2 bg-black/50 border border-[#E6B73A]/30 rounded-lg text-white font-sans text-right placeholder-gray-500 focus:outline-none focus:border-[#E6B73A]"
                          rows={3}
                          placeholder="اكتب الخبر هنا كأدمن..."
                        />
                        <button
                          onClick={() => handleUpdateNews(editingNews)}
                          className="w-full bg-[#E6B73A] text-black font-bold text-[10px] py-1 rounded hover:bg-[#F5D27A] transition"
                        >
                          نشر الخبر للجميع
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {newsContent || "لا توجد أخبار جديدة حالياً."}
                        </p>
                        
                        <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.04] pt-2">
                          <span className="text-[8px] text-gray-500 font-sans">
                            بواسطة: الإدارة 🛡️
                          </span>
                          
                          {/* Heart Reaction Button */}
                          <button
                            onClick={handleToggleHeart}
                            disabled={!currentUser}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition text-[10px] font-bold ${
                              currentUser
                                ? "hover:bg-white/5 cursor-pointer"
                                : "opacity-50 cursor-not-allowed"
                            } ${
                              currentUser && newsReactions.includes(currentUser.id || currentUser.name)
                                ? "text-red-500 bg-red-500/10"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                            title={currentUser ? "تفاعل بقلب" : "يجب تسجيل الدخول للتفاعل"}
                          >
                            <Heart
                              className={`w-3 h-3 ${
                                currentUser && newsReactions.includes(currentUser.id || currentUser.name)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                            <span className="font-mono text-[10px]">{newsReactions.length}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-right mt-4">
                  <span className="text-[9px] text-[#E6B73A] font-bold block mb-1">الربط التلقائي</span>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    بمجرد تحديد مسار اللعبة، سيقوم اللانشر بالاتصال تلقائياً عبر نظام SAMP/GTA SA لربطك بالولاية رقم 5.
                  </p>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* 2. SERVERS LIST TAB */}
          {activeTab === "servers" && (
            <div className="absolute inset-0">
              <div className="w-full h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
              
              {/* Left Side: Server Card Grid */}
              <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">قائمة السيرفرات المتاحة</h3>
                    <p className="text-[10px] text-gray-400">اختر السيرفر الذي ترغب باللعب فيه للدخول الفوري</p>
                  </div>
                  {currentUser?.isAdmin && (
                    <button
                      onClick={() => setShowAddServer(true)}
                      className="bg-[#E6B73A]/10 hover:bg-[#E6B73A] text-[#E6B73A] hover:text-black border border-[#E6B73A]/20 transition text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة سيرفر يدوي</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
                  {servers.map((server, i) => {
                    const selected = selectedIndex === i;
                    return (
                      <div
                        key={i}
                        onClick={() => handleSelectServer(i)}
                        className={`bg-[#11131a]/85 border p-4 rounded-xl flex items-center justify-between gap-4 transition cursor-pointer hover:border-white/10 ${
                          selected ? "border-[#E6B73A]/40 bg-gradient-to-l from-[#E6B73A]/5 to-transparent" : "border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                            selected ? "bg-[#E6B73A]/20 text-[#E6B73A]" : "bg-white/5 text-gray-400"
                          }`}>
                            🇩🇿
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${selected ? "text-[#E6B73A]" : "text-white"}`}>{server.name}</h4>
                            <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">{server.ip}:{server.port}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <span className="text-[9px] text-gray-500 block">البينغ</span>
                            <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">{selected ? "45 ms" : "55 ms"}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[9px] text-gray-500 block">السعة</span>
                            <span className="text-xs font-bold text-white font-mono mt-0.5 block">{selected ? "148 / 500" : "0 / 250"}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectServer(i);
                              handleConnectPressed();
                            }}
                            className="bg-white/5 hover:bg-[#E6B73A] text-gray-300 hover:text-black font-bold text-[10px] px-3.5 py-1.5 rounded transition uppercase"
                          >
                            اتصال
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Active Server detailed specifications card */}
              <div className="w-full md:w-80 bg-[#11131a]/90 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-full backdrop-blur-md">
                <div>
                  <h3 className="text-xs font-bold text-[#E6B73A] tracking-wider uppercase mb-3 font-display">تفاصيل السيرفر النشط</h3>
                  
                  <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-center mb-4">
                    <span className="text-xs font-extrabold text-white block">{activeServer.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{activeServer.ip}:{activeServer.port}</span>
                  </div>

                  <div className="space-y-2.5 text-right">
                    <div className="flex justify-between items-center border-b border-white/[0.04] pb-1.5">
                      <span className="text-[10px] text-gray-400">نمط اللعب:</span>
                      <span className="text-xs font-bold text-[#E6B73A]">العالم الواقعي (RolePlay)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.04] pb-1.5">
                      <span className="text-[10px] text-gray-400">إصدار SAMP:</span>
                      <span className="text-xs font-bold text-white font-mono">0.3.7-R4</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.04] pb-1.5">
                      <span className="text-[10px] text-gray-400">الحماية:</span>
                      <span className="text-xs font-bold text-emerald-400">مفعلة (SAMP-AC)</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5">
                      <span className="text-[10px] text-gray-400">الموقع الجغرافي:</span>
                      <span className="text-xs font-bold text-white">الجزائر (خادم محلي سريع)</span>
                    </div>
                  </div>

                  <div className="mt-5 bg-white/[0.01] border border-white/5 rounded-lg p-3">
                    <span className="text-[10px] text-[#E6B73A] font-bold block mb-1">تعليمات هامة:</span>
                    <p className="text-[9px] text-gray-400 leading-normal">
                      للانضمام للسيرفر يرجى اختيار اسم بالصيغة الصحيحة (الاسم_اللقب) مثل <strong className="text-white">Amine_Algiers</strong> لتجنب طردك تلقائياً وتسهيل تحميل المودات والمجسمات.
                    </p>
                    <button
                      onClick={handleConnectPressed}
                      className="mt-3 text-[10px] bg-white/5 hover:bg-[#E6B73A] text-gray-400 hover:text-neutral-950 font-bold px-3 py-1.5 rounded transition"
                    >
                      تشغيل الطور
                    </button>
                  </div>
                </div>

                <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-4 text-right">
                  <h4 className="text-xs font-bold text-white font-display mb-1">🔧 نظام تعديل السيارات الجزائرية</h4>
                  <p className="text-[10px] text-gray-400 leading-normal">تعديل حصري لسيارات Dacia, Renault, Peugeot التي تم إقحامها في البيئة الجزائرية.</p>
                  <button
                    onClick={() => openUrl(kWebsiteUrl)}
                    className="mt-3 text-[10px] bg-white/5 hover:bg-[#E6B73A] text-gray-400 hover:text-neutral-950 font-bold px-3 py-1.5 rounded transition"
                  >
                    استعراض التعديلات
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* 3. COMMUNITY TAB */}
          {activeTab === "community" && (
            <div className="absolute inset-0">
              <CommunityHub currentUser={myProfile} onUpdateProfile={handleSaveProfile} />
            </div>
          )}

          {/* 4. SUPPORT HUB TAB */}
          {activeTab === "support" && (
            <div className="absolute inset-0">
              <SupportHub currentUser={myProfile} />
            </div>
          )}

          {/* 5. ADMIN HUB TAB */}
          {activeTab === "admin" && currentUser?.isAdmin && (
            <div className="absolute inset-0">
              <AdminHub currentUser={myProfile} onBackToPlay={handleBackToPlay} />
            </div>
          )}

          {/* 5. SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="absolute inset-0 overflow-y-auto p-6">
              <div className="w-full max-w-4xl mx-auto space-y-6">
              
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-[#E6B73A]" />
                  إعدادات وتفضيلات اللانشر
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">اضبط تفضيلات الصوت، الصورة، وجودة الأداء التي تناسب جهازك</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                
                {/* Graphics & Performance box */}
                <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-black text-[#E6B73A] uppercase tracking-wide border-b border-white/[0.04] pb-2 font-display">الأداء وجودة الصورة</h4>
                  
                  {/* FPS CAP */}
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <span className="text-xs font-bold text-white block">حد معدل الإطارات (FPS)</span>
                      <span className="text-[9px] text-gray-500 font-mono block">FPS Rate Cap</span>
                    </div>
                    <div className="flex gap-1 bg-black/45 border border-white/10 rounded-lg p-0.5">
                      {[30, 60, 120, 144, 240].map((fps) => (
                        <button
                          key={fps}
                          onClick={() => handleUpdateSettings({ ...settings, fpsCap: fps })}
                          className={`px-2 py-1 text-[10px] font-bold rounded transition ${
                            settings.fpsCap === fps ? "bg-[#E6B73A]/20 text-[#E6B73A]" : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {fps}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Graphics quality */}
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <span className="text-xs font-bold text-white block">جودة الرسومات والمجسمات</span>
                      <span className="text-[9px] text-gray-500 font-mono block">Graphics Quality</span>
                    </div>
                    <div className="flex gap-1 bg-black/45 border border-white/10 rounded-lg p-0.5">
                      {["منخفض", "متوسط", "مرتفع", "فائق"].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleUpdateSettings({ ...settings, quality: q })}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded transition ${
                            settings.quality === q ? "bg-[#E6B73A]/20 text-[#E6B73A]" : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sound & Notifications box */}
                <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-black text-[#E6B73A] uppercase tracking-wide border-b border-white/[0.04] pb-2 font-display">الأصوات والإشعارات</h4>
                  
                  {/* Volume Slider */}
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <span className="text-xs font-bold text-white block">صوت موسيقى اللانشر ({Math.floor(settings.volume * 100)}%)</span>
                      <span className="text-[9px] text-gray-500 font-mono block">Soundtrack Volume</span>
                    </div>
                    <div className="flex items-center gap-2 w-36">
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.volume}
                        onChange={(e) => handleUpdateSettings({ ...settings, volume: parseFloat(e.target.value) })}
                        className="w-full accent-[#E6B73A] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Auto connection toggle */}
                  <div className="flex items-center justify-between pb-2">
                    <div>
                      <span className="text-xs font-bold text-white block">تفعيل الإشعارات باللانشر</span>
                      <span className="text-[9px] text-gray-500 font-mono block">App Notifications</span>
                    </div>
                    <button
                      onClick={() => handleUpdateSettings({ ...settings, notifications: !settings.notifications })}
                      className={`w-10 h-6 rounded-full p-1 transition ${
                        settings.notifications ? "bg-[#E6B73A]" : "bg-white/10"
                      } flex items-center`}
                    >
                      <div className={`w-4 h-4 bg-black rounded-full transition-all duration-200 ${
                        settings.notifications ? "translate-x-4 mr-auto" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Soundtrack customizer box */}
              <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-5 space-y-4 text-right">
                <h4 className="text-xs font-black text-[#E6B73A] uppercase tracking-wide border-b border-white/[0.04] pb-2 font-display flex items-center gap-2">
                  <span>🎵</span>
                  <span>موسيقى اللانشر والخلفية</span>
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  اختر إحدى النغمات الحماسية الهادئة المتاحة، أو قم بلصق رابط الموسيقى المفضل لديك (رابط مباشر بصيغة MP3) لتخصيص نغمات اللانشر كما تحب!
                </p>

                {/* Music presets */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold block">النغمات الافتراضية المقترحة:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { name: "سينمائية حماسية (الافتراضية)", url: "https://codeskulptor-demos.commondatastorage.googleapis.com/desolate_land.mp3" },
                      { name: "دقات حماسية هادئة (Retro Chill)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
                      { name: "موسيقى ملحمية (Guitar Theme)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
                    ].map((track, idx) => {
                      const isSelected = musicUrl === track.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleUpdateMusicUrl(track.url)}
                          className={`p-2.5 rounded-lg border text-xs font-bold text-right transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#E6B73A]/15 border-[#E6B73A]/40 text-[#E6B73A]"
                              : "bg-black/35 border-white/5 text-gray-400 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <span className="block truncate w-full">{track.name}</span>
                          {isSelected ? (
                            <span className="text-[9px] text-[#E6B73A] mt-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#E6B73A] rounded-full animate-ping" />
                              <span>نشطة حالياً</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-gray-500 mt-1">اضغط للتفعيل</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom music input */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-gray-500 font-bold block">رابط موسيقى مخصص (MP3 مباشر):</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={musicUrl}
                      onChange={(e) => handleUpdateMusicUrl(e.target.value)}
                      placeholder="https://example.com/music.mp3"
                      dir="ltr"
                      className="flex-1 bg-black/45 border border-white/10 focus:border-[#E6B73A]/50 rounded-lg px-3 py-2 text-xs font-mono text-gray-300 outline-none transition"
                    />
                    {musicUrl !== "https://codeskulptor-demos.commondatastorage.googleapis.com/desolate_land.mp3" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMusicUrl("https://codeskulptor-demos.commondatastorage.googleapis.com/desolate_land.mp3")}
                        className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs px-3 py-2 rounded-lg transition font-bold cursor-pointer"
                      >
                        الافتراضي
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-amber-500/90 block mt-1 leading-normal">
                    💡 <strong>تلميح:</strong> ضع أي رابط MP3 مباشر وسيقوم المشغل بتشغيله تلقائياً وتكراره لملاءمة الجو الحماسي والهادئ لولاية الجزائر!
                  </span>
                </div>
              </div>

              {/* Launcher path settings */}
              <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-5 text-right">
                <h4 className="text-xs font-black text-white font-display mb-1">ربط مسار ملف اللعبة الرئيسي</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  يحتاج اللانشر لربط مسار المجلد الصحيح الذي يحتوي على ملف <strong className="text-white">gta_sa.exe</strong> لتأمين نقل إحداثيات الدخول المباشر إلى الخادم.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <div className="bg-black/30 border border-white/5 px-3 py-2 rounded-lg text-xs font-mono flex-1 text-left w-full truncate">
                    {gamePath || "لم يتم ربط اللعبة حالياً"}
                  </div>
                  <button
                    onClick={() => setShowGamePath(true)}
                    className="bg-[#E6B73A] hover:bg-[#E6B73A]/80 text-neutral-950 font-display font-black text-xs px-5 py-2.5 rounded-lg transition"
                  >
                    استعراض وتحديد المجلد
                  </button>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-600 font-mono">
                LAUNCHER v5.0.1 (STABLE) | BUILD TIME: 2026 | POWERED BY REACT & TAILWIND
              </div>

            </div>
            </div>
          )}

        </div>
        
        {/* ==========================================
            FIVEM FOOTER COMPACT WIDGETS
            ========================================== */}
        <footer className="h-10 border-t border-white/[0.04] bg-black/60 px-6 flex items-center justify-between text-right z-10 shrink-0">
          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
            <span>PING: <strong className="text-emerald-400">45ms</strong></span>
            <span>Uptime: 99.9%</span>
            <span>LAN: LOCAL_HOST_AUTO</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>بوابة اللعب التفاعلية DZ LEGA V5 مفعّلة ومحمية ✓</span>
          </div>
        </footer>

      </div>

      {/* DIALOG LAYERS */}
      {showAddServer && (
        <AddServerDialog
          onClose={() => setShowAddServer(false)}
          onSubmit={handleAddServer}
        />
      )}

      {showGamePath && (
        <GamePathDialog
          onClose={() => setShowGamePath(false)}
          onSelect={handleSaveGamePath}
        />
      )}

      {showConnect && (
        <ConnectDialog
          server={activeServer}
          savedNickname={myProfile.name}
          onClose={() => setShowConnect(false)}
          onConnect={handleLaunchGame}
        />
      )}

      {showEditProfile && (
        <EditProfileDialog
          profile={myProfile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

    </div>
  );
}
