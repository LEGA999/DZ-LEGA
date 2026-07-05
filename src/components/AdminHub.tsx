import React, { useState, useEffect, useRef } from "react";
import { UserProfile, SupportTicket, TicketMessage, AdminChatMessage } from "../types";
import { MessageSquare, Send, ShieldAlert, Sparkles, Check, CheckCircle2, UserCheck, AlertTriangle, Clock, Ban, ArrowRight } from "lucide-react";

interface AdminHubProps {
  currentUser: UserProfile;
  onBackToPlay?: () => void;
}

interface SavedAccount {
  username: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  avatar: string;
  bio: string;
  id: string;
}

export default function AdminHub({ currentUser, onBackToPlay }: AdminHubProps) {
  const [adminMessages, setAdminMessages] = useState<AdminChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "tickets" | "players">("chat");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Admin Messages, Tickets, and Accounts
  useEffect(() => {
    // 1. Admin messages
    const rawMsgs = localStorage.getItem("dz_lega_admin_chat");
    if (rawMsgs) {
      try {
        setAdminMessages(JSON.parse(rawMsgs));
      } catch {
        setAdminMessages([]);
      }
    } else {
      const defaultMsgs: AdminChatMessage[] = [
        {
          id: "1",
          senderName: "Admin_Zaki",
          senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZakiAdmin",
          senderTag: "#0001",
          content: "أهلاً بطاقم إدارة DZ LEGA! هذا هو الشات الجماعي السري للآدمنز والمشرفين.",
          timestamp: "منذ ساعة"
        }
      ];
      setAdminMessages(defaultMsgs);
      localStorage.setItem("dz_lega_admin_chat", JSON.stringify(defaultMsgs));
    }

    // 2. Tickets
    const rawTickets = localStorage.getItem("dz_lega_tickets");
    if (rawTickets) {
      try {
        setTickets(JSON.parse(rawTickets));
      } catch {}
    }

    // 3. Accounts
    const rawAccounts = localStorage.getItem("dz_lega_accounts");
    if (rawAccounts) {
      try {
        setAccounts(JSON.parse(rawAccounts));
      } catch {}
    }
  }, []);

  // Sync mechanism
  useEffect(() => {
    const handleSync = () => {
      const rawTickets = localStorage.getItem("dz_lega_tickets");
      if (rawTickets) {
        try {
          setTickets(JSON.parse(rawTickets));
        } catch {}
      }

      const rawMsgs = localStorage.getItem("dz_lega_admin_chat");
      if (rawMsgs) {
        try {
          setAdminMessages(JSON.parse(rawMsgs));
        } catch {}
      }

      const rawAccounts = localStorage.getItem("dz_lega_accounts");
      if (rawAccounts) {
        try {
          setAccounts(JSON.parse(rawAccounts));
        } catch {}
      }
    };

    window.addEventListener("storage", handleSync);
    const interval = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener("storage", handleSync);
      clearInterval(interval);
    };
  }, []);

  // Auto scroll to bottom in admin chat
  useEffect(() => {
    if (activeSubTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [adminMessages, activeSubTab]);

  const saveAdminMessages = (updated: AdminChatMessage[]) => {
    setAdminMessages(updated);
    localStorage.setItem("dz_lega_admin_chat", JSON.stringify(updated));
  };

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem("dz_lega_tickets", JSON.stringify(updated));
    // Dispatch local event for other tabs
    window.dispatchEvent(new Event("storage"));
  };

  const saveAccounts = (updated: SavedAccount[]) => {
    setAccounts(updated);
    localStorage.setItem("dz_lega_accounts", JSON.stringify(updated));
  };

  // ─── ADMIN GROUP CHAT ACTION ───
  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    setInputText("");

    // Create the standard user message
    const newMsg: AdminChatMessage = {
      id: "admin-msg-" + Date.now().toString(),
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderTag: currentUser.id,
      content: messageContent,
      timestamp: "الآن"
    };

    let updatedMsgs = [...adminMessages, newMsg];

    // Command Checker: /adminmake <id or username>
    if (messageContent.startsWith("/adminmake ") && currentUser.name.toLowerCase() === "king_finixx") {
      const targetQuery = messageContent.substring(11).trim();
      const currentAccounts = [...accounts];

      // Find matching account by id (tag) or username
      const matchedIdx = currentAccounts.findIndex(
        (acc) =>
          acc.id.toLowerCase() === targetQuery.toLowerCase() ||
          acc.username.toLowerCase() === targetQuery.toLowerCase()
      );

      if (matchedIdx !== -1) {
        currentAccounts[matchedIdx].isAdmin = true;
        saveAccounts(currentAccounts);

        // Add a system feedback message to the chat
        const systemMsg: AdminChatMessage = {
          id: "admin-sys-" + Date.now().toString(),
          senderName: "👑 [نظام الرتب]",
          senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SystemAdmin",
          senderTag: "#SYS",
          content: `أمر ترقية ناجح: تم تعيين اللاعب [ ${currentAccounts[matchedIdx].username} ] بآي دي [ ${currentAccounts[matchedIdx].id} ] في رتبة الإدارة العليا من قبل KING_FINIXx! ⚡`,
          timestamp: "الآن"
        };
        updatedMsgs.push(systemMsg);
      } else {
        const errSysMsg: AdminChatMessage = {
          id: "admin-sys-err-" + Date.now().toString(),
          senderName: "⚠️ [خطأ نظام]",
          senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SystemError",
          senderTag: "#SYS",
          content: `فشل الأمر: لم يتم العثور على أي لاعب بالاسم أو الآيدي [ ${targetQuery} ]`,
          timestamp: "الآن"
        };
        updatedMsgs.push(errSysMsg);
      }
    } else if (messageContent.startsWith("/adminmake ") && currentUser.name.toLowerCase() !== "king_finixx") {
      const authSysMsg: AdminChatMessage = {
        id: "admin-sys-auth-" + Date.now().toString(),
        senderName: "⚠️ [حظر رتبة]",
        senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SystemAuth",
        senderTag: "#SYS",
        content: `فشل الأمر: لا تمتلك صلاحية استخدام أمر /adminmake. هذا الأمر مخصص حصرياً للمالك KING_FINIXx! 👑`,
        timestamp: "الآن"
      };
      updatedMsgs.push(authSysMsg);
    }

    saveAdminMessages(updatedMsgs);
  };

  // ─── TICKETS ACTIONS ───
  const handleReplyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicketId) return;

    const updated = tickets.map((t) => {
      if (t.id === selectedTicketId) {
        const replyMsg: TicketMessage = {
          id: "m-reply-" + Date.now().toString(),
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          senderTag: currentUser.id,
          content: ticketReply.trim(),
          timestamp: "الآن",
          isAdmin: true
        };
        return {
          ...t,
          status: "open" as const,
          messages: [...t.messages, replyMsg]
        };
      }
      return t;
    });

    saveTickets(updated);
    setTicketReply("");
  };

  const handleCloseTicket = (ticketId: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const closeMsg: TicketMessage = {
          id: "m-close-" + Date.now().toString(),
          senderName: "🤖 [نظام الإغلاق]",
          senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CloseSystem",
          senderTag: "#SYS",
          content: `تم إغلاق التذكرة وحلها من قبل الإداري [ ${currentUser.name} ].`,
          timestamp: "الآن",
          isAdmin: true
        };
        return {
          ...t,
          status: "closed" as const,
          messages: [...t.messages, closeMsg]
        };
      }
      return t;
    });
    saveTickets(updated);
  };

  const handleReopenTicket = (ticketId: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "open" as const
        };
      }
      return t;
    });
    saveTickets(updated);
  };

  // ─── MODERATION ACTIONS (Timeout, Mute, Ban) ───
  const handleToggleMute = (username: string) => {
    const currentProfilesRaw = localStorage.getItem("community_profiles_moderation");
    let moderatedProfiles: Record<string, { isMuted?: boolean; isBanned?: boolean; timeoutUntil?: string | null }> = {};
    if (currentProfilesRaw) {
      try { moderatedProfiles = JSON.parse(currentProfilesRaw); } catch {}
    }

    const currentMute = !!moderatedProfiles[username]?.isMuted;
    moderatedProfiles[username] = {
      ...moderatedProfiles[username],
      isMuted: !currentMute
    };

    localStorage.setItem("community_profiles_moderation", JSON.stringify(moderatedProfiles));
    window.dispatchEvent(new Event("storage"));
    
    // Add feedback msg to admin chat
    const systemMsg: AdminChatMessage = {
      id: "mod-" + Date.now().toString(),
      senderName: "🛡️ [نظام المراقبة]",
      senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Guard",
      senderTag: "#MOD",
      content: `قام الإداري [ ${currentUser.name} ] بـ ${!currentMute ? "كتم (Mute)" : "إلغاء كتم"} اللاعب [ ${username} ] من الشات العام.`,
      timestamp: "الآن"
    };
    saveAdminMessages([...adminMessages, systemMsg]);
  };

  const handleToggleBan = (username: string) => {
    const currentProfilesRaw = localStorage.getItem("community_profiles_moderation");
    let moderatedProfiles: Record<string, { isMuted?: boolean; isBanned?: boolean; timeoutUntil?: string | null }> = {};
    if (currentProfilesRaw) {
      try { moderatedProfiles = JSON.parse(currentProfilesRaw); } catch {}
    }

    const currentBan = !!moderatedProfiles[username]?.isBanned;
    moderatedProfiles[username] = {
      ...moderatedProfiles[username],
      isBanned: !currentBan
    };

    localStorage.setItem("community_profiles_moderation", JSON.stringify(moderatedProfiles));
    window.dispatchEvent(new Event("storage"));

    const systemMsg: AdminChatMessage = {
      id: "mod-" + Date.now().toString(),
      senderName: "🛡️ [نظام المراقبة]",
      senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Guard",
      senderTag: "#MOD",
      content: `قام الإداري [ ${currentUser.name} ] بـ ${!currentBan ? "حظر (Ban)" : "إلغاء حظر"} اللاعب [ ${username} ] نهائياً.`,
      timestamp: "الآن"
    };
    saveAdminMessages([...adminMessages, systemMsg]);
  };

  const handleApplyTimeout = (username: string) => {
    const currentProfilesRaw = localStorage.getItem("community_profiles_moderation");
    let moderatedProfiles: Record<string, { isMuted?: boolean; isBanned?: boolean; timeoutUntil?: string | null }> = {};
    if (currentProfilesRaw) {
      try { moderatedProfiles = JSON.parse(currentProfilesRaw); } catch {}
    }

    const fiveMinutesLater = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    moderatedProfiles[username] = {
      ...moderatedProfiles[username],
      timeoutUntil: fiveMinutesLater
    };

    localStorage.setItem("community_profiles_moderation", JSON.stringify(moderatedProfiles));
    window.dispatchEvent(new Event("storage"));

    const systemMsg: AdminChatMessage = {
      id: "mod-" + Date.now().toString(),
      senderName: "🛡️ [نظام المراقبة]",
      senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Guard",
      senderTag: "#MOD",
      content: `قام الإداري [ ${currentUser.name} ] بـ إعطاء تيم آوت (Timeout) لمدة 5 دقائق للاعب [ ${username} ].`,
      timestamp: "الآن"
    };
    saveAdminMessages([...adminMessages, systemMsg]);
  };

  const handleRemoveTimeout = (username: string) => {
    const currentProfilesRaw = localStorage.getItem("community_profiles_moderation");
    let moderatedProfiles: Record<string, { isMuted?: boolean; isBanned?: boolean; timeoutUntil?: string | null }> = {};
    if (currentProfilesRaw) {
      try { moderatedProfiles = JSON.parse(currentProfilesRaw); } catch {}
    }

    moderatedProfiles[username] = {
      ...moderatedProfiles[username],
      timeoutUntil: null
    };

    localStorage.setItem("community_profiles_moderation", JSON.stringify(moderatedProfiles));
    window.dispatchEvent(new Event("storage"));

    const systemMsg: AdminChatMessage = {
      id: "mod-" + Date.now().toString(),
      senderName: "🛡️ [نظام المراقبة]",
      senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Guard",
      senderTag: "#MOD",
      content: `قام الإداري [ ${currentUser.name} ] بـ إزالة التيم آوت عن اللاعب [ ${username} ].`,
      timestamp: "الآن"
    };
    saveAdminMessages([...adminMessages, systemMsg]);
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicketId);

  // Helper checking moderation values directly from localStorage
  const getModState = (username: string) => {
    const currentProfilesRaw = localStorage.getItem("community_profiles_moderation");
    if (!currentProfilesRaw) return { isMuted: false, isBanned: false, timeoutActive: false };
    try {
      const data = JSON.parse(currentProfilesRaw);
      const userMod = data[username];
      const timeoutActive = userMod?.timeoutUntil ? new Date(userMod.timeoutUntil) > new Date() : false;
      return {
        isMuted: !!userMod?.isMuted,
        isBanned: !!userMod?.isBanned,
        timeoutActive
      };
    } catch {
      return { isMuted: false, isBanned: false, timeoutActive: false };
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-6 overflow-hidden select-none text-right" dir="rtl">
      
      {/* Sidebar navigation for sub-sections */}
      <div className="w-full md:w-56 bg-[#11131a]/85 border border-white/5 rounded-xl p-4 flex flex-col gap-2 backdrop-blur-md">
        <div className="border-b border-white/[0.04] pb-2 mb-2">
          <span className="text-xs font-black text-[#E6B73A] font-display uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            غرفة التحكم الإدارية
          </span>
          <p className="text-[9px] text-gray-500 mt-0.5">لوحة تحكم خاصة بالآدمن</p>
        </div>

        {/* ↩ Back Button to Main Interface */}
        {onBackToPlay && (
          <button
            onClick={onBackToPlay}
            className="w-full mb-2.5 py-2.5 px-3 text-xs font-black rounded-lg bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 transition-all duration-300 text-center flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="العودة للقائمة الرئيسية"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للقائمة الرئيسية ↩</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab("chat")}
          className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition text-right flex items-center justify-between ${
            activeSubTab === "chat"
              ? "bg-[#E6B73A]/15 text-[#E6B73A] border-r-2 border-[#E6B73A]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>الشات السري الجماعي</span>
          <span className="bg-black/45 px-1.5 py-0.2 rounded text-[8px] font-mono text-gray-400">SECRET</span>
        </button>

        <button
          onClick={() => setActiveSubTab("tickets")}
          className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition text-right flex items-center justify-between ${
            activeSubTab === "tickets"
              ? "bg-[#E6B73A]/15 text-[#E6B73A] border-r-2 border-[#E6B73A]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>تذاكر اللاعبين العامة</span>
          <span className="bg-[#E6B73A]/20 text-[#E6B73A] px-1.5 py-0.2 rounded text-[8px] font-black">
            {tickets.filter(t => t.status === "open").length} نشط
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("players")}
          className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition text-right flex items-center justify-between ${
            activeSubTab === "players"
              ? "bg-[#E6B73A]/15 text-[#E6B73A] border-r-2 border-[#E6B73A]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>مراقبة وإدارة اللاعبين</span>
          <span className="bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded text-[8px] font-black">MOD</span>
        </button>

        {currentUser.name.toLowerCase() === "king_finixx" && (
          <div className="mt-auto bg-amber-500/10 border border-[#E6B73A]/20 rounded-xl p-3 text-right">
            <span className="text-[10px] text-[#E6B73A] font-black block mb-1">صلاحية المالك الملكية 👑</span>
            <p className="text-[8px] text-gray-400 leading-normal">
              بصفتك <strong className="text-white">KING_FINIXx</strong>، اكتب في الشات لتمنح مشرفين جدد الرتبة الفعالة:
              <br />
              <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono block mt-1 text-center">/adminmake &lt;id/user&gt;</code>
            </p>
          </div>
        )}
      </div>

      {/* Main interactive screen column */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* SUBTAB 1: ADMIN SECRET CHAT */}
        {activeSubTab === "chat" && (
          <div className="bg-[#11131a]/85 border border-white/5 rounded-xl flex flex-col overflow-hidden h-full backdrop-blur-md">
            <div className="bg-black/35 px-5 py-3 border-b border-white/[0.04] flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-white">الدردشة الإدارية العسكرية السرية 🛡️</h3>
                <p className="text-[9px] text-gray-500">مشفرة بالكامل بين طاقم الإشراف</p>
              </div>
              {currentUser.name.toLowerCase() === "king_finixx" && (
                <span className="text-[8px] bg-amber-500/20 text-[#E6B73A] border border-[#E6B73A]/30 px-2.5 py-1 rounded font-black uppercase">
                  مالك السيرفر الرئيسي (KING)
                </span>
              )}
            </div>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
              {adminMessages.map((m) => {
                const isSystem = m.senderTag === "#SYS" || m.senderTag === "#MOD";
                return (
                  <div key={m.id} className={`flex gap-3 max-w-[85%] ${isSystem ? "mx-auto w-full max-w-[95%]" : m.senderTag === currentUser.id ? "mr-auto flex-row-reverse" : "ml-auto"}`}>
                    
                    {!isSystem && (
                      <img
                        src={m.senderAvatar}
                        alt="avatar"
                        className="w-8 h-8 rounded-lg bg-black/30 border border-white/5"
                      />
                    )}

                    <div className="flex flex-col gap-1 flex-1">
                      {!isSystem && (
                        <div className="flex items-center gap-1.5 self-start">
                          <span className="text-[10px] font-black text-[#E6B73A]">{m.senderName}</span>
                          <span className="text-[8px] text-gray-500 font-mono">{m.senderTag}</span>
                        </div>
                      )}

                      <div className={`p-3 rounded-xl text-xs leading-relaxed text-right select-text whitespace-pre-line ${
                        isSystem
                          ? "bg-amber-500/5 border border-[#E6B73A]/20 text-[#E6B73A] text-center w-full font-bold"
                          : m.senderTag === currentUser.id
                          ? "bg-amber-500/15 border border-[#E6B73A]/20 text-white"
                          : "bg-black/45 border border-white/5 text-gray-200"
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[8px] text-gray-500 font-mono self-end mt-0.5">{m.timestamp}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendAdminMessage} className="p-3 bg-black/45 border-t border-white/[0.04] flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentUser.name.toLowerCase() === "king_finixx" ? "اكتب رسالة أو أمر ترقية /adminmake <id>..." : "اكتب ردك أو تقريرك هنا للإشراف..."}
                className="flex-1 bg-black/50 border border-white/5 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E6B73A] transition text-right"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 px-5 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال</span>
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 2: GLOBAL PLAYER TICKETS */}
        {activeSubTab === "tickets" && (
          <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden h-full">
            
            {/* Ticket sub-list */}
            <div className="w-full md:w-64 bg-[#11131a]/80 border border-white/5 rounded-xl p-3 flex flex-col overflow-hidden">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block border-b border-white/[0.04] pb-2">جميع التذاكر الواردة</span>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {tickets.length === 0 ? (
                  <span className="text-[10px] text-gray-500 block text-center mt-6">لا توجد تذاكر حالياً</span>
                ) : (
                  tickets.map((t) => {
                    const active = t.id === selectedTicketId;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`p-2.5 rounded-lg border text-right transition cursor-pointer flex flex-col gap-1 ${
                          active
                            ? "bg-[#E6B73A]/15 border-[#E6B73A]/40"
                            : "bg-black/25 border-transparent hover:bg-black/45 hover:border-white/5"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-white truncate max-w-[110px]">{t.title}</span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded font-black ${
                            t.status === "open" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
                          }`}>
                            {t.status === "open" ? "نشط" : "مغلق"}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-500 truncate block">بواسطة: {t.userName}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Ticket detail chat */}
            <div className="flex-1 bg-[#11131a]/85 border border-white/5 rounded-xl flex flex-col overflow-hidden h-full">
              {activeTicket ? (
                <div className="flex flex-col h-full">
                  <div className="bg-black/45 px-4 py-2.5 border-b border-white/[0.04] flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-[#E6B73A]">{activeTicket.title}</h4>
                      <span className="text-[9px] text-gray-500 font-mono">اللاعب: {activeTicket.userName} | {activeTicket.userTag}</span>
                    </div>

                    <div className="flex gap-2">
                      {activeTicket.status === "open" ? (
                        <button
                          onClick={() => handleCloseTicket(activeTicket.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>إغلاق التذكرة وتصنيفها كمحلولة</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReopenTicket(activeTicket.id)}
                          className="bg-amber-500/10 hover:bg-amber-500 text-[#E6B73A] hover:text-black border border-amber-500/20 px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <span>إعادة فتح التذكرة</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
                    {activeTicket.messages.map((m, idx) => {
                      const self = m.senderTag === currentUser.id;
                      return (
                        <div key={idx} className={`flex gap-3 max-w-[85%] ${self ? "mr-auto flex-row-reverse" : "ml-auto"}`}>
                          <img
                            src={m.senderAvatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-lg bg-black/20 flex-shrink-0 border border-white/5"
                          />
                          <div className="flex flex-col gap-1">
                            <span className={`text-[10px] font-bold ${m.isAdmin ? "text-[#E6B73A]" : "text-white"}`}>
                              {m.senderName} {m.isAdmin && <strong className="text-[8px] bg-[#E6B73A]/10 px-1 py-0.2 rounded">طاقم الدعم</strong>}
                            </span>
                            <div className={`p-3 rounded-xl text-xs leading-relaxed text-right select-text whitespace-pre-line ${
                              self
                                ? "bg-amber-500/15 border border-[#E6B73A]/20 text-white"
                                : "bg-black/45 border border-white/5 text-gray-200"
                            }`}>
                              {m.content}
                            </div>
                            <span className="text-[8px] text-gray-500 font-mono mt-0.5">{m.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply box */}
                  <form onSubmit={handleReplyTicket} className="p-3 bg-black/45 border-t border-white/[0.04] flex gap-2">
                    <input
                      type="text"
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      placeholder="اكتب رد طاقم الإدارة للاعب هنا..."
                      className="flex-1 bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E6B73A] transition text-right"
                    />
                    <button
                      type="submit"
                      className="bg-[#E6B73A] hover:bg-[#E6B73A]/80 text-neutral-950 px-4 py-2 rounded-lg text-xs font-black transition"
                    >
                      إرسال الرد للاعب
                    </button>
                  </form>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <span className="text-3xl mb-2">📬</span>
                  <span className="text-xs font-bold text-[#E6B73A]">اختر تذكرة للتحقق وحلها</span>
                  <p className="text-[10px] text-gray-500 mt-1 max-w-xs">
                    هنا تظهر جميع تذاكر الدعم الفني المفتوحة والمغلقة من قبل اللاعبين المسجلين باللانشر.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 3: PLAYER MODERATION & USER DIRECTORY */}
        {activeSubTab === "players" && (
          <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-5 flex flex-col overflow-hidden h-full backdrop-blur-md">
            <div className="border-b border-white/[0.04] pb-3 mb-4">
              <h3 className="text-xs font-black text-white">إدارة وتفتيش رخص وعقوبات اللاعبين 🛡️</h3>
              <p className="text-[9px] text-gray-500">يمكنك فرض أو فك العقوبات الفورية (كتم، حظر، تيم آوت) عن اللاعبين النشطين بالشات والمجتمع.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {accounts.map((acc) => {
                const mod = getModState(acc.username);
                return (
                  <div key={acc.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-xl bg-black/30 border border-white/5"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{acc.username}</span>
                          <span className="text-[10px] font-mono text-[#E6B73A] font-bold">{acc.id}</span>
                          {acc.isAdmin && (
                            <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded font-black border border-red-500/20">
                              مشرف أدمن
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400 block mt-0.5 max-w-sm truncate">{acc.bio}</span>
                      </div>
                    </div>

                    {/* Admin Action triggers */}
                    <div className="flex items-center gap-2">
                      {/* Timeout toggles */}
                      {mod.timeoutActive ? (
                        <button
                          onClick={() => handleRemoveTimeout(acc.username)}
                          className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>إلغاء التيم آوت</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApplyTimeout(acc.username)}
                          className="bg-amber-500/10 hover:bg-amber-500 text-[#E6B73A] hover:text-black border border-amber-500/20 px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                          title="تيم آوت 5 دقائق لمنعه من الكتابة"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>تيم آوت (5د)</span>
                        </button>
                      )}

                      {/* Mute toggles */}
                      <button
                        onClick={() => handleToggleMute(acc.username)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition flex items-center gap-1 ${
                          mod.isMuted
                            ? "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500 hover:text-white"
                            : "bg-white/5 text-gray-400 hover:text-white border-transparent"
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{mod.isMuted ? "إلغاء الكتم" : "كتم (Mute)"}</span>
                      </button>

                      {/* Ban toggles */}
                      <button
                        onClick={() => handleToggleBan(acc.username)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition flex items-center gap-1 ${
                          mod.isBanned
                            ? "bg-red-600 text-white border-transparent"
                            : "bg-black/40 text-red-500 border-red-500/10 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{mod.isBanned ? "إلغاء الحظر" : "حظر (Ban)"}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
