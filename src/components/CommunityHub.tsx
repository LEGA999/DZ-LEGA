import React, { useState, useEffect } from "react";
import { UserProfile, CommunityPost } from "../types";
import { MessageSquare, Heart, Send, User, Search, Award, Users, ShieldAlert, Sparkles } from "lucide-react";

interface CommunityHubProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Legarp1",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=LegaPlayer",
  "https://api.dicebear.com/7.x/adventure/svg?seed=Raouf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki",
  "https://api.dicebear.com/7.x/bottts/svg?seed=GTA",
  "https://api.dicebear.com/7.x/miniavs/svg?seed=Amine"
];

const SIMULATED_PLAYERS: UserProfile[] = [
  { id: "#2026", name: "Karim_Oranais", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim", bio: "قائد شرطة الجزائر العاصمة في السيرفر. القوانين تطبق على الجميع!", status: "in_game", statusText: "يلعب حالياً في DZ LEGA V5" },
  { id: "#0001", name: "Admin_Zaki", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZakiAdmin", bio: "مطور ومؤسس خوادم DZ LEGA. تواصل معي في الديسكورد لأي استفسار.", status: "online", statusText: "متصل باللانشر" },
  { id: "#3190", name: "Amine_Algiers", avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Amine", bio: "أفضل ميكانيكي ومعدل سيارات في مدينة لوس سانتوس. ورشتي مفتوحة للجميع.", status: "away", statusText: "خارج اللعبة حالياً" },
  { id: "#4821", name: "Lieutenant_Mehdi", avatar: "https://api.dicebear.com/7.x/adventure/svg?seed=Mehdi", bio: "رتبة ملازم أول في الدرك الوطني. نبحث دائماً عن محترفي الرول بلاي.", status: "in_game", statusText: "يلعب حالياً في DZ LEGA V5" },
  { id: "#9999", name: "Riad_Constantine", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riad", bio: "لاعب قديم وهاوي سباقات وتفحيط. من يريد تحدي فليتفضل!", status: "online", statusText: "متصل" }
];

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "1",
    userId: "sim-1",
    userName: "Admin_Zaki",
    userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZakiAdmin",
    userTag: "#0001",
    content: "مرحباً بالجميع في الإصدار الجديد DZ LEGA V5! قمنا بإضافة نظام بيئي متكامل وسيارات محاكية للواقع الجزائري تماماً 🇩🇿. أخبرونا بآرائكم واقتراحاتكم هنا!",
    timestamp: "منذ ساعتين",
    likes: 42,
    likedByMe: false
  },
  {
    id: "2",
    userId: "sim-2",
    userName: "Karim_Oranais",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim",
    userTag: "#2026",
    content: "تنبيه للاعبي السيرفر: غداً ستكون هناك دورية مرورية كبرى وتفتيش رخص القيادة بمدخل المدينة. يرجى تجهيز وثائقكم لضمان رول بلاي واقعي وممتع.",
    timestamp: "منذ 4 ساعات",
    likes: 18,
    likedByMe: false
  },
  {
    id: "3",
    userId: "sim-3",
    userName: "Amine_Algiers",
    userAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Amine",
    userTag: "#3190",
    content: "اليوم قمت بتعديل سيارة Sultan مخصصة للدرك الوطني وطلعت خرافية! سأقوم بمشاركتها معكم قريباً في الديسكورد 🚗🔥.",
    timestamp: "منذ يوم",
    likes: 29,
    likedByMe: false
  }
];

export default function CommunityHub({ currentUser, onUpdateProfile }: CommunityHubProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<UserProfile | null>(null);
  
  // Moderation state tracking
  const [moderationData, setModerationData] = useState<Record<string, { isMuted?: boolean; isBanned?: boolean; timeoutUntil?: string | null }>>({});
  const [modError, setModError] = useState<string | null>(null);

  // Sync moderation data
  useEffect(() => {
    const handleSync = () => {
      const raw = localStorage.getItem("community_profiles_moderation");
      if (raw) {
        try {
          setModerationData(JSON.parse(raw));
        } catch {}
      }
    };
    handleSync();
    window.addEventListener("storage", handleSync);
    const interval = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener("storage", handleSync);
      clearInterval(interval);
    };
  }, []);

  const getModState = (username: string) => {
    const userMod = moderationData[username];
    const timeoutActive = userMod?.timeoutUntil ? new Date(userMod.timeoutUntil) > new Date() : false;
    return {
      isMuted: !!userMod?.isMuted,
      isBanned: !!userMod?.isBanned,
      timeoutActive,
      timeoutUntil: userMod?.timeoutUntil
    };
  };

  const handleToggleMute = (username: string) => {
    const updated = {
      ...moderationData,
      [username]: {
        ...moderationData[username],
        isMuted: !getModState(username).isMuted
      }
    };
    setModerationData(updated);
    localStorage.setItem("community_profiles_moderation", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const handleToggleBan = (username: string) => {
    const updated = {
      ...moderationData,
      [username]: {
        ...moderationData[username],
        isBanned: !getModState(username).isBanned
      }
    };
    setModerationData(updated);
    localStorage.setItem("community_profiles_moderation", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const handleApplyTimeout = (username: string) => {
    const fiveMinutesLater = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const updated = {
      ...moderationData,
      [username]: {
        ...moderationData[username],
        timeoutUntil: fiveMinutesLater
      }
    };
    setModerationData(updated);
    localStorage.setItem("community_profiles_moderation", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const handleRemoveTimeout = (username: string) => {
    const updated = {
      ...moderationData,
      [username]: {
        ...moderationData[username],
        timeoutUntil: null
      }
    };
    setModerationData(updated);
    localStorage.setItem("community_profiles_moderation", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };
  
  // Load community posts from local storage or fallback to default ones
  useEffect(() => {
    const savedPosts = localStorage.getItem("community_posts");
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (_) {
        setPosts(INITIAL_POSTS);
      }
    } else {
      setPosts(INITIAL_POSTS);
      localStorage.setItem("community_posts", JSON.stringify(INITIAL_POSTS));
    }
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setModError(null);

    const mod = getModState(currentUser.name);

    if (mod.isBanned) {
      setModError("عذراً، لقد تم حظرك نهائياً من قبل الإدارة من استخدام المنتدى والسيرفر!");
      return;
    }
    if (mod.isMuted) {
      setModError("عذراً، أنت مكتوم (Mute) حالياً من قبل الإدارة، لا يمكنك النشر!");
      return;
    }
    if (mod.timeoutActive) {
      const remaining = mod.timeoutUntil
        ? Math.ceil((new Date(mod.timeoutUntil).getTime() - Date.now()) / 1000)
        : 0;
      setModError(`لا يمكنك النشر حالياً بسبب وجود عقوبة تيم آوت نشطة! متبقي: ${remaining} ثانية.`);
      return;
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      userId: "user-current",
      userName: currentUser.name || "لاعب_جديد",
      userAvatar: currentUser.avatar,
      userTag: currentUser.id,
      content: inputText.trim(),
      timestamp: "الآن",
      likes: 0,
      likedByMe: false
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem("community_posts", JSON.stringify(updated));
    setInputText("");
  };

  const handleLikePost = (postId: string) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        const liked = !post.likedByMe;
        return {
          ...post,
          likedByMe: liked,
          likes: liked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    });
    setPosts(updated);
    localStorage.setItem("community_posts", JSON.stringify(updated));
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-6 overflow-hidden select-none text-right" dir="rtl">
      
      {/* LEFT COLUMN: Community Feed & Posting Box */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        {/* Search & Statistics Box */}
        <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E6B73A] animate-pulse" />
            <div>
              <h3 className="text-sm font-black text-white font-display">منتدى ومجتمع DZ LEGA</h3>
              <p className="text-[10px] text-gray-400">تفاعل وتواصل مع أكثر من 14,000 لاعب مسجل</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="البحث عن منشور أو لاعب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-lg pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-[#E6B73A] transition text-right"
            />
          </div>
        </div>

        {/* Posting Form */}
        <form onSubmit={handleCreatePost} className="bg-[#161922]/90 border border-white/10 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-md">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar}
              alt="My avatar"
              className="w-10 h-10 rounded-lg border border-[#E6B73A]/30 bg-black/40 flex-shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="شارك بأي إعلان، منشور، أو رغبة في العثور على مجموعة لعب..."
                className="w-full bg-black/30 border border-white/5 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E6B73A] transition resize-none h-20 text-right font-sans"
              />
              {modError && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-500/20 p-2 rounded-lg text-right flex items-center justify-between">
                  <span>⚠️ {modError}</span>
                  <button type="button" onClick={() => setModError(null)} className="text-[10px] text-gray-500 hover:text-white mr-2">إخفاء</button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-mono">اللاعب: {currentUser.name || "Amine"} | {currentUser.id}</span>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 font-display font-black text-xs px-5 py-2 rounded-lg transition-all duration-200 shadow-md shadow-amber-500/10 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر المنشور</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Scrollable Feed List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
          {filteredPosts.length === 0 ? (
            <div className="h-44 bg-black/20 border border-white/5 rounded-xl flex flex-col items-center justify-center text-center p-6">
              <span className="text-xs text-gray-500">لم يتم العثور على منشورات توافق بحثك.</span>
              <span className="text-[10px] text-[#E6B73A] mt-1">كن أول من ينشر في المنتدى الآن!</span>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#11131a]/80 border border-white/5 hover:border-white/10 p-4 rounded-xl flex gap-3 transition backdrop-blur-sm"
              >
                <img
                  src={post.userAvatar}
                  alt={post.userName}
                  className="w-10 h-10 rounded-lg bg-black/20 flex-shrink-0 border border-white/5 cursor-pointer"
                  onClick={() => {
                    const found = SIMULATED_PLAYERS.find(p => p.name === post.userName) || {
                      id: post.userTag,
                      name: post.userName,
                      avatar: post.userAvatar,
                      bio: "لاعب مشارك في مجتمع DZ LEGA RP الممتاز.",
                      status: "online",
                      statusText: "متصل"
                    } as UserProfile;
                    setSelectedPlayer(found);
                  }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-black text-xs text-white hover:text-[#E6B73A] transition cursor-pointer"
                          onClick={() => {
                            const found = SIMULATED_PLAYERS.find(p => p.name === post.userName) || {
                              id: post.userTag,
                              name: post.userName,
                              avatar: post.userAvatar,
                              bio: "لاعب مشارك في مجتمع DZ LEGA RP الممتاز.",
                              status: "online",
                              statusText: "متصل"
                            } as UserProfile;
                            setSelectedPlayer(found);
                          }}
                        >
                          {post.userName}
                        </span>
                        <span className="font-mono text-[9px] text-gray-500">{post.userTag}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-sans mt-0.5 block">{post.timestamp}</span>
                    </div>

                    {/* Like button */}
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        post.likedByMe
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-white/5 text-gray-400 hover:text-white border border-transparent"
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${post.likedByMe ? "fill-current" : ""}`} />
                      <span>{post.likes}</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-200 mt-2.5 leading-relaxed text-right whitespace-pre-line select-text">
                    {post.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Directory of Online Players & Detail View */}
      <div className="w-full md:w-80 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* My Profile Quick Preview Card */}
        <div className="bg-gradient-to-b from-[#1c1d24] to-[#11131a] border border-[#E6B73A]/20 rounded-xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
          {/* Gold highlight flare */}
          <div className="absolute top-0 right-0 w-16 h-1 bg-gradient-to-l from-[#E6B73A] to-transparent" />
          
          <h3 className="text-xs font-bold text-[#E6B73A] uppercase tracking-wider mb-3 font-display">بروفايلي الخاص</h3>

          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt="Avatar"
              className="w-12 h-12 rounded-xl bg-black/30 border border-[#E6B73A]/40 flex-shrink-0"
            />
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white truncate">{currentUser.name || "لاعب_جديد"}</span>
                <span className="font-mono text-[10px] text-[#E6B73A] font-bold">{currentUser.id}</span>
              </div>
              <span className="text-[10px] text-emerald-400 block font-sans mt-0.5">● {currentUser.statusText || "نشط باللانشر"}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mt-3 border-t border-white/[0.04] pt-2.5 italic">
            {currentUser.bio || "لا توجد حالة شخصية مكتوبة حالياً."}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px] text-gray-500 font-mono">
            <div className="bg-black/35 p-1.5 rounded-lg border border-white/5">
              <span>الحالة: {currentUser.status === "online" ? "نشط" : "يلعب"}</span>
            </div>
            <div className="bg-black/35 p-1.5 rounded-lg border border-white/5">
              <span>السيرفر: 188.165</span>
            </div>
          </div>
        </div>

        {/* Other Active Users directory list */}
        <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-4 flex-1 flex flex-col overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white font-display flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#E6B73A]" />
              اللاعبون النشطون باللانشر
            </span>
            <span className="text-[9px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">
              {SIMULATED_PLAYERS.length} متصل
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {SIMULATED_PLAYERS.map((player) => (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center gap-2.5 ${
                  selectedPlayer?.id === player.id
                    ? "bg-amber-500/10 border-[#E6B73A]/40"
                    : "bg-black/20 border-transparent hover:bg-black/35 hover:border-white/5"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-9 h-9 rounded-lg border border-white/5 bg-black/20"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#11131a] ${
                      player.status === "online"
                        ? "bg-emerald-400"
                        : player.status === "in_game"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-gray-500"
                    }`}
                  />
                </div>
                
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">{player.name}</span>
                    <span className="font-mono text-[9px] text-gray-500">{player.id}</span>
                  </div>
                  <span className="text-[9px] text-gray-400 truncate block font-sans mt-0.5">
                    {player.statusText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* POPUP MODAL: Interactive Player Profile Detail Card */}
      {selectedPlayer && (() => {
        const isSelf = selectedPlayer.name === currentUser.name;
        const playerMod = getModState(selectedPlayer.name);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir="rtl">
            <div className="bg-[#161922] border border-[#E6B73A]/30 rounded-xl p-6 max-w-sm w-full relative shadow-2xl">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-4 left-4 text-gray-500 hover:text-white transition text-xs font-bold font-mono"
              >
                إغلاق [X]
              </button>

              <div className="flex flex-col items-center text-center mt-3">
                <img
                  src={selectedPlayer.avatar}
                  alt={selectedPlayer.name}
                  className="w-16 h-16 rounded-2xl bg-black/40 border border-[#E6B73A]/30 shadow-lg"
                />
                <h3 className="text-base font-black text-white font-display mt-3 flex items-center gap-1">
                  {selectedPlayer.name}
                  <span className="text-xs font-mono text-[#E6B73A] font-bold">{selectedPlayer.id}</span>
                </h3>
                
                <span className={`text-[10px] font-bold mt-1.5 px-3 py-1 rounded-full ${
                  playerMod.isBanned
                    ? "bg-red-600/20 text-red-400 border border-red-600/30"
                    : playerMod.isMuted
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : selectedPlayer.status === "online"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : selectedPlayer.status === "in_game"
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                }`}>
                  {playerMod.isBanned
                    ? "محظور من السيرفر ❌"
                    : playerMod.isMuted
                    ? "مكتوم الإرسال 🔇"
                    : playerMod.timeoutActive
                    ? "تحت التيم آوت ⏳"
                    : selectedPlayer.statusText}
                </span>

                <div className="w-full mt-4 bg-black/30 border border-white/5 rounded-xl p-4 text-right">
                  <span className="text-[9px] text-gray-500 font-bold block mb-1 font-display">السيرة الذاتية (Bio)</span>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans font-medium">
                    {selectedPlayer.bio}
                  </p>
                </div>

                {/* Admin moderation controls */}
                {currentUser.isAdmin && !isSelf && (
                  <div className="w-full mt-4 bg-red-500/5 border border-red-500/15 rounded-xl p-3 text-right">
                    <span className="text-[9px] text-[#E6B73A] font-black block mb-2 font-display">لوحة تحكم المشرف 🛡️</span>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <button
                        onClick={() => {
                          if (playerMod.timeoutActive) handleRemoveTimeout(selectedPlayer.name);
                          else handleApplyTimeout(selectedPlayer.name);
                        }}
                        className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
                          playerMod.timeoutActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {playerMod.timeoutActive ? "فك التيم آوت" : "تيم آوت (5د)"}
                      </button>

                      <button
                        onClick={() => handleToggleMute(selectedPlayer.name)}
                        className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
                          playerMod.isMuted
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-black/30 text-gray-400 border-white/5"
                        }`}
                      >
                        {playerMod.isMuted ? "فك الكتم" : "كتم (Mute)"}
                      </button>

                      <button
                        onClick={() => handleToggleBan(selectedPlayer.name)}
                        className={`px-2 py-1 rounded text-[9px] font-bold border transition ${
                          playerMod.isBanned
                            ? "bg-red-600 text-white border-transparent"
                            : "bg-black/30 text-red-500 border-red-500/10"
                        }`}
                      >
                        {playerMod.isBanned ? "فك الحظر" : "حظر (Ban)"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat action simulator */}
                <button
                  onClick={() => {
                    setInputText(`@${selectedPlayer.name} `);
                    setSelectedPlayer(null);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 font-display font-black text-xs py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>إرسال إشارة في المنتدى</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}


    </div>
  );
}
