import React, { useState, useEffect } from "react";
import { UserProfile, SupportTicket, TicketMessage } from "../types";
import { MessageSquare, Send, Plus, Trash2, CheckCircle2, ShieldAlert, Sparkles, FolderLock } from "lucide-react";

interface SupportHubProps {
  currentUser: UserProfile;
}

const CATEGORIES = [
  { id: "tech", label: "مشكلة تقنية / اتصال" },
  { id: "player", label: "شكوى على لاعب (رول بلاي)" },
  { id: "account", label: "استفسار عن الحساب / متجر" },
  { id: "other", label: "أخرى" }
];

export default function SupportHub({ currentUser }: SupportHubProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  
  // Create ticket fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("tech");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Active chat view inside ticket
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("dz_lega_tickets");
    if (raw) {
      try {
        setTickets(JSON.parse(raw));
      } catch {
        setTickets([]);
      }
    } else {
      // Seed default tickets
      const defaultTickets: SupportTicket[] = [
        {
          id: "t-1",
          userId: "#4821",
          userName: "Lieutenant_Mehdi",
          userTag: "#4821",
          title: "مشكلة في رخصة القيادة بالسيرفر",
          description: "السلام عليكم، لقد اشتريت رخصة قيادة من قسم الشرطة ولكنها لم تظهر في قائمتي الشخصية (/licenses). يرجى المساعدة.",
          status: "open",
          createdAt: "منذ يومين",
          messages: [
            {
              id: "m-1",
              senderName: "Lieutenant_Mehdi",
              senderAvatar: "https://api.dicebear.com/7.x/adventure/svg?seed=Mehdi",
              senderTag: "#4821",
              content: "السلام عليكم، لقد اشتريت رخصة قيادة من قسم الشرطة ولكنها لم تظهر في قائمتي الشخصية (/licenses). يرجى المساعدة.",
              timestamp: "منذ يومين",
              isAdmin: false
            },
            {
              id: "m-2",
              senderName: "Admin_Zaki",
              senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ZakiAdmin",
              senderTag: "#0001",
              content: "وعليكم السلام ورحمة الله، مرحباً بك ملازم مهدي. سنقوم بالتحقق من قاعدة البيانات الآن وتعويضك فوراً.",
              timestamp: "منذ يوم",
              isAdmin: true
            }
          ]
        }
      ];
      setTickets(defaultTickets);
      localStorage.setItem("dz_lega_tickets", JSON.stringify(defaultTickets));
    }
  }, []);

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem("dz_lega_tickets", JSON.stringify(updated));
    // Trigger storage event so admin dashboard can sync immediately if open
    window.dispatchEvent(new Event("storage"));
  };

  // Sync state periodically from localStorage in case Admin replies
  useEffect(() => {
    const handleSync = () => {
      const raw = localStorage.getItem("dz_lega_tickets");
      if (raw) {
        try {
          setTickets(JSON.parse(raw));
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

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    const catLabel = CATEGORIES.find(c => c.id === category)?.label || "أخرى";

    const newTicket: SupportTicket = {
      id: "t-" + Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userTag: currentUser.id,
      title: title.trim(),
      description: `${catLabel} - ${description.trim()}`,
      status: "open",
      createdAt: "الآن",
      messages: [
        {
          id: "msg-" + Date.now().toString(),
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          senderTag: currentUser.id,
          content: description.trim(),
          timestamp: "الآن",
          isAdmin: false
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    
    // reset form
    setTitle("");
    setDescription("");
    setShowCreate(false);
    setActiveTicketId(newTicket.id);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;

    const updated = tickets.map(t => {
      if (t.id === activeTicketId) {
        const newMsg: TicketMessage = {
          id: "m-reply-" + Date.now().toString(),
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          senderTag: currentUser.id,
          content: replyText.trim(),
          timestamp: "الآن",
          isAdmin: !!currentUser.isAdmin
        };
        return {
          ...t,
          status: "open" as const, // re-open or keep open
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    saveTickets(updated);
    setReplyText("");
  };

  // Regular members must only see their own tickets
  const myTickets = tickets.filter(t => t.userId === currentUser.id);
  const activeTicket = tickets.find(t => t.id === activeTicketId);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-6 overflow-hidden select-none text-right" dir="rtl">
      
      {/* List / Left panel */}
      <div className="w-full md:w-80 bg-[#11131a]/85 border border-white/5 rounded-xl p-4 flex flex-col overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
          <div>
            <h3 className="text-xs font-black text-[#E6B73A] font-display uppercase tracking-wider">تذاكر الدعم الفني الخاص بك</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">الدعم الفني متاح 24/7 لمساعدتكم</p>
          </div>
          <button
            onClick={() => {
              setShowCreate(true);
              setActiveTicketId(null);
            }}
            className="p-1.5 rounded-lg bg-[#E6B73A]/10 text-[#E6B73A] hover:bg-[#E6B73A] hover:text-black transition"
            title="فتح تذكرة جديدة"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tickets container */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {myTickets.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-black/10 rounded-lg border border-dashed border-white/5">
              <FolderLock className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-[11px] text-gray-500 font-bold">لا توجد تذاكر دعم مفتوحة حالياً.</span>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 text-[10px] text-[#E6B73A] underline hover:text-[#E6B73A]/80 font-bold"
              >
                اضغط هنا لفتح تذكرة جديدة
              </button>
            </div>
          ) : (
            myTickets.map((t) => {
              const isActive = t.id === activeTicketId;
              const lastMsg = t.messages[t.messages.length - 1];
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTicketId(t.id);
                    setShowCreate(false);
                  }}
                  className={`p-3 rounded-lg border text-right transition cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? "bg-amber-500/10 border-[#E6B73A]/40"
                      : "bg-black/20 border-transparent hover:bg-black/35 hover:border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white truncate max-w-[140px]">{t.title}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${
                      t.status === "open"
                        ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    }`}>
                      {t.status === "open" ? "قيد المراجعة" : "مغلقة"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate leading-relaxed">
                    {lastMsg ? lastMsg.content : t.description}
                  </p>
                  <span className="text-[8px] text-gray-500 font-mono self-end">{t.createdAt}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel Content (Create or Active Chat) */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {showCreate ? (
          <div className="bg-[#11131a]/85 border border-white/5 rounded-xl p-6 flex flex-col overflow-y-auto h-full backdrop-blur-md">
            <div className="border-b border-white/[0.04] pb-3 mb-4">
              <h3 className="text-sm font-black text-white font-display flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E6B73A] animate-pulse" />
                إنشاء تذكرة تواصل ودعم فني جديدة
              </h3>
              <p className="text-[10px] text-gray-400">تذكرتك تظهر لك وللأدمن فقط بشكل خاص ومحمي بالكامل 🔒</p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">عنوان التذكرة باختصار</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مشكلة في شحن حسابي أو مشكلة تقنية بالدخول"
                  className="w-full bg-black/45 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E6B73A] transition text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">نوع الشكوى / القسم</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-3 text-[10px] font-bold rounded-lg border transition text-center ${
                        category === cat.id
                          ? "bg-amber-500/15 border-amber-500 text-amber-500"
                          : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">تفاصيل المشكلة (يرجى تقديم أكبر قدر من المعلومات)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل مشكلتك هنا، مع كتابة اسمك في اللعبة وأي إثباتات أو معلومات مفيدة..."
                  className="w-full bg-black/45 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#E6B73A] transition h-32 resize-none text-right font-sans"
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-400/5 p-3 rounded-lg border border-red-500/10 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 font-display font-black text-xs py-3 rounded-xl transition shadow-lg shadow-amber-500/10"
                >
                  إرسال التذكرة للتحقق
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-6 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        ) : activeTicket ? (
          <div className="bg-[#11131a]/80 border border-white/5 rounded-xl flex flex-col overflow-hidden h-full backdrop-blur-md">
            {/* Ticket Header */}
            <div className="bg-black/30 px-5 py-3 border-b border-white/[0.04] flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white leading-none mb-1">{activeTicket.title}</h3>
                <span className="text-[9px] text-gray-500 font-mono">الرقم المرجعي: {activeTicket.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                  activeTicket.status === "open" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
                }`}>
                  {activeTicket.status === "open" ? "نشط - قيد المراجعة" : "مغلق"}
                </span>
              </div>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {activeTicket.messages.map((m, idx) => {
                const selfMsg = m.senderTag === currentUser.id;
                return (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${selfMsg ? "mr-auto flex-row-reverse" : "ml-auto"}`}>
                    <img
                      src={m.senderAvatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-lg bg-black/20 flex-shrink-0 border border-white/5"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 self-start">
                        <span className={`text-[10px] font-black ${m.isAdmin ? "text-[#E6B73A]" : "text-white"}`}>
                          {m.senderName} {m.isAdmin && <strong className="text-[9px] bg-[#E6B73A]/10 px-1 py-0.2 rounded">إشراف</strong>}
                        </span>
                        <span className="text-[8px] text-gray-500 font-mono">{m.senderTag}</span>
                      </div>

                      <div className={`p-3 rounded-xl text-xs leading-relaxed text-right select-text whitespace-pre-line ${
                        selfMsg
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
            </div>

            {/* Send Reply box */}
            {activeTicket.status === "open" ? (
              <form onSubmit={handleSendReply} className="p-3 bg-black/40 border-t border-white/[0.04] flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك أو استفسارك هنا..."
                  className="flex-1 bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E6B73A] transition text-right"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#E6B73A] to-[#B8912E] hover:from-[#F5D27A] hover:to-[#E6B73A] text-neutral-950 px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>رد</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-black/25 text-center text-xs text-gray-500 border-t border-white/[0.04]">
                هذه التذكرة مغلقة حالياً. لا يمكنك إرسال ردود جديدة.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full bg-[#11131a]/40 border border-white/5 rounded-xl flex flex-col items-center justify-center text-center p-6">
            <span className="text-3xl mb-2">📥</span>
            <span className="text-xs font-black text-[#E6B73A] font-display">مرحباً بك في مركز الدعم الفني</span>
            <span className="text-[10px] text-gray-500 mt-1 max-w-sm leading-relaxed">
              اختر إحدى التذاكر من القائمة الجانبية لقراءة ردود الإدارة ومتابعتها، أو قم بإنشاء تذكرة جديدة.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
