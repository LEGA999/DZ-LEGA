import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, LogOut, Shield, Heart, DollarSign, MessageSquare, Award, User, Briefcase, Bell } from "lucide-react";

interface SimulatedGameProps {
  nickname: string;
  serverIp: string;
  serverName: string;
  onExit: () => void;
}

const JOBS = [
  { id: "police", name: "الشرطة الجزائرية 👮", pay: "4,500 DA", desc: "فرض الأمن، حماية المواطنين، وملاحقة المخالفين للقانون." },
  { id: "ems", name: "الحماية المدنية 🚑", pay: "4,000 DA", desc: "إسعاف المصابين، إطفاء الحرائق، وإنقاذ الأرواح في الحالات الطارئة." },
  { id: "mechanic", name: "ميكانيكي سيارات 🔧", pay: "3,500 DA", desc: "تصليح وتعديل السيارات للزبائن في ورشة اللعبة." },
  { id: "taxi", name: "سائق طاكسي 🚕", pay: "3,000 DA", desc: "نقل اللاعبين بين أحياء وشوارع المدينة لقاء أجر مجزي." },
  { id: "gang", name: "عصابة أحياء 🔫", pay: "عمل حر", desc: "السيطرة على الأحياء، صفقات مشبوهة، ومواجهة العصابات المنافسة." }
];

const INITIAL_MESSAGES = [
  { sender: "[إعلان السيرفر]", text: "مرحباً بكم في DZ LEGA ROLE PLAY V5! يرجى احترام قوانين الـ RolePlay وعدم التخريب.", isSystem: true },
  { sender: "Admin_Zaki", text: "يا شباب، الرجاء عدم استعمال سيارات الحماية المدنية لغير غرضها.", isAdmin: true },
  { sender: "Yassine_Constantinois", text: "كاش خدمة يا جماعة؟ راني حاب ندبر خدمة ميكانيكي." },
  { sender: "Amine_Algiers", text: "الشرطة راهم دايرين باريير (حاجز أمني) في طريق المطار، ردو بالكم!" },
  { sender: "Lieutenant_Mehdi", text: "رخصتك وبطاقة التعريف من فضلك يا مواطن، راك تسير بسرعة مفرطة.", isJob: true }
];

const AUTO_RESPONSES = [
  "يا جماعة كاش واحد يبيع طوموبيل Sultan نقية؟",
  "تعالوا لورشة التصليح في وسط المدينة، رانا دايرين تخفيضات!",
  "وين راهم الحماية المدنية؟ كاين أكسيدون خطير عند لوتوروت!",
  "يا أدمن كاين واحد راه يخرب بالـ Non-RP في الكوميسارية!",
  "راني رايح لخدمة الطاكسي، لي حاب كاش توصيلة يعيطلي.",
  "الشرطة راهم ينظمو حركة المرور، يعطيهم الصحة.",
  "كاش كلان حاب يدير تحالف في أحياء الجسر؟"
];

const NPC_NAMES = [
  "Karim_Oranais",
  "Sofiane_Annabi",
  "Chawki_Setif",
  "Fouad_Kabyle",
  "Riad_Constantine",
  "Imad_Tlemceni",
  "Abdou_Blidi"
];

export default function SimulatedGame({ nickname, serverIp, serverName, onExit }: SimulatedGameProps) {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("جاري تشغيل محرك اللعبة...");
  const [jobSelected, setJobSelected] = useState(false);
  const [selectedJob, setSelectedJob] = useState(JOBS[0]);
  
  // Game Hud State
  const [health, setHealth] = useState(100);
  const [armor, setArmor] = useState(50);
  const [money, setMoney] = useState(15000);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulated connection loading
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setLoading(false), 600);
      }
      setLoadingProgress(Math.floor(p));
      if (p < 30) setLoadingText("جاري الاتصال بـ " + serverIp + "...");
      else if (p < 60) setLoadingText("تحميل ميزات ومجسمات خريطة الجزائر...");
      else if (p < 90) setLoadingText("التحقق من حساب اللاعب " + nickname + "...");
      else setLoadingText("تأمين الاتصال والدخول إلى اللوبي...");
    }, 120);

    return () => clearInterval(interval);
  }, [serverIp, nickname]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, jobSelected, loading]);

  // Simulate NPC chat activity
  useEffect(() => {
    if (loading || !jobSelected) return;

    const interval = setInterval(() => {
      const randomName = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
      const randomMsg = AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)];
      
      setMessages(prev => [...prev, { sender: randomName, text: randomMsg }]);
    }, 7000); // add new NPC message every 7 seconds

    return () => clearInterval(interval);
  }, [loading, jobSelected]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMsg = { sender: nickname, text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate instant reaction from an Admin or bot after 1-2 seconds
    setTimeout(() => {
      const responses = [
        `مرحباً بك يا ${nickname}! منور السيرفر اليوم كـ ${selectedJob.name}.`,
        "يا شباب شوفو الرول بلاي الممتاز لي يدير فيه " + nickname,
        "الله يبارك، سيرفر DZ LEGA دايماً جامع الأحباب.",
        "بالتوفيق لك في مهامك الجديدة!"
      ];
      const botResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { sender: "Server_Bot", text: botResponse, isAdmin: true }]);
    }, 1500);
  };

  const handleSelectJob = (job: typeof JOBS[0]) => {
    setSelectedJob(job);
    setJobSelected(true);
    setMessages(prev => [
      ...prev,
      { sender: "[وظيفتك]", text: `لقد اخترت وظيفة: ${job.name}. راتبك الأساسي هو ${job.pay}.`, isSystem: true }
    ]);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 font-sans text-right select-none z-50 flex flex-col justify-between" dir="rtl">
      <AnimatePresence mode="wait">
        {/* 1. Simulated Loading Screen */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-[#11131a] to-[#0A0B0F] z-50 flex flex-col justify-between p-8"
          >
            {/* Ambient glows */}
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex justify-between items-center text-xs text-neutral-500 border-b border-neutral-800 pb-3">
              <span>SAMP CLIENT SIMULATION v5.0</span>
              <span>DZ LEGA ROLEPLAY</span>
            </div>

            <div className="my-auto max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 px-4">
              {/* GTA SA Style Art Frame */}
              <div className="w-64 h-64 md:w-80 md:h-80 border-4 border-amber-500/30 rounded-lg overflow-hidden shadow-2xl relative bg-neutral-900 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10" />
                <div className="absolute bottom-4 right-4 left-4 z-20 text-right">
                  <span className="text-xs text-amber-500 font-bold uppercase font-mono">DZ LEGA LIFE</span>
                  <h3 className="text-lg font-black text-white mt-1">الرول بلاي الحقيقي بالهوية الجزائرية</h3>
                </div>
                {/* SVG Mocking a GTA Artwork */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-amber-900/60 p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🚗</div>
                    <span className="text-xl font-bold text-amber-400 font-display">DZ LEGA V5</span>
                    <p className="text-xs text-neutral-400 mt-2">عشاق محاكاة الواقع الجزائري</p>
                  </div>
                </div>
              </div>

              {/* Server info and progress */}
              <div className="flex-1 flex flex-col justify-center text-right">
                <h2 className="text-3xl font-extrabold text-amber-400 font-display mb-3">DZ LEGA ROLE PLAY V5</h2>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                  مرحباً بك مجدداً يا <strong className="text-white">{nickname}</strong>.
                  أنت الآن تتصل بأكبر تجمع جزائري للعب الواقعي المعتمد على بيئة GTA SA. استمتع بوظيفتك، وتواصل مع اللاعبين، وشارع نحو النجاح المالي والاجتماعي!
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-400">{loadingText}</span>
                    <span className="text-amber-500 font-mono">{loadingProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/30">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full transition-all duration-150"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-neutral-600">
              جميع الحقوق محفوظة لسيرفر DZ LEGA 2026. ساخته Flutter وتمت المحاكاة عبر React.
            </div>
          </motion.div>
        )}

        {/* 2. Job Selector (If not selected) */}
        {!loading && !jobSelected && (
          <motion.div
            key="job-selector"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-[#0c0d12]/95 z-40 flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="bg-[#161922] border border-amber-500/20 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
              <div className="text-center mb-6">
                <span className="text-xs text-amber-500 font-bold tracking-widest uppercase">تخصيص الهوية</span>
                <h2 className="text-2xl font-black text-white mt-1">اختر وظيفتك في الولاية 🇩🇿</h2>
                <p className="text-xs text-neutral-400 mt-2">هذه الوظيفة ستحدد راتبك والمهام التي ستخوضها داخل السيرفر</p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {JOBS.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    className="w-full flex items-center justify-between p-4 bg-black/40 hover:bg-amber-500/5 hover:border-amber-500/30 border border-neutral-800 rounded-lg text-right transition group"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-white group-hover:text-amber-400 transition">{job.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1">{job.desc}</p>
                    </div>
                    <div className="text-left flex-shrink-0 mr-4">
                      <span className="text-xs text-neutral-500 block">الراتب الأساسي</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">{job.pay}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
                <button
                  onClick={onExit}
                  className="text-xs text-neutral-500 hover:text-white transition"
                >
                  إلغاء الخروج والعودة لللانشر
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Simulated Game Screen HUD & Chat */}
      {!loading && jobSelected && (
        <div className="relative w-full h-full bg-[#1b1e2a] overflow-hidden flex flex-col justify-between">
          {/* Mock Ingame Environment / 3D Background Canvas (Styled CSS gradient to simulate GTA) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-[#1b1d28] to-[#252839] pointer-events-none">
            {/* Sun Glow */}
            <div className="absolute top-10 right-20 w-44 h-44 bg-amber-400/20 rounded-full blur-[80px]" />
            {/* Road/Sky divider line */}
            <div className="absolute bottom-1/3 left-0 right-0 h-40 bg-gradient-to-b from-[#11131a] to-[#07080b]" />
            {/* Vector wireframe to simulate buildings */}
            <div className="absolute bottom-1/3 left-0 right-0 h-[2px] bg-neutral-800/30" />
            <div className="absolute bottom-0 left-10 w-96 h-80 border-t border-r border-neutral-800/20 rounded-tr-3xl" />
            <div className="absolute bottom-0 right-24 w-80 h-96 border-t border-l border-neutral-800/20 rounded-tl-3xl" />
          </div>

          {/* GAME TOP BAR */}
          <div className="relative z-10 bg-black/60 backdrop-blur-md border-b border-white/5 py-3 px-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                {serverName}
              </span>
              <span className="text-xs text-neutral-400 hidden sm:inline">
                اللاعب: <strong className="text-white font-mono">{nickname}</strong>
              </span>
              <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded">
                الوظيفة: <strong className="text-amber-400">{selectedJob.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Alert indicator */}
              <div className="flex items-center gap-1.5 text-xs text-[#E6B73A] animate-pulse">
                <Bell className="w-3.5 h-3.5" />
                <span>حالة السيرفر مستقرة</span>
              </div>

              {/* Exit Game Simulation */}
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition border border-red-600/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج من اللعبة</span>
              </button>
            </div>
          </div>

          {/* GAME BODY GRID */}
          <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 p-4 gap-4 overflow-hidden">
            
            {/* LEFT COLUMN: Chat Window (SAMP style) */}
            <div className="md:col-span-5 flex flex-col justify-end h-full overflow-hidden max-w-lg">
              <div className="bg-black/70 border border-white/5 rounded-lg flex flex-col h-[320px] shadow-2xl">
                {/* Chat Header */}
                <div className="bg-white/[0.02] border-b border-white/5 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    علبة المحادثات (Chat Log)
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500">T / ENTER</span>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-right">
                  {messages.map((msg, i) => {
                    let textClass = "text-white";
                    if (msg.isSystem) textClass = "text-[#E6B73A] font-bold";
                    else if (msg.isAdmin) textClass = "text-[#FF4D62] font-semibold";
                    else if (msg.isJob) textClass = "text-sky-400";
                    else if (msg.sender === nickname) textClass = "text-emerald-300";

                    return (
                      <div key={i} className="text-xs font-sans leading-relaxed break-words bg-white/[0.01] hover:bg-white/[0.03] p-1.5 rounded transition">
                        <span className="font-bold text-[#8089A0] font-mono ml-1">
                          {msg.sender}:
                        </span>
                        <span className={textClass}>{msg.text}</span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Form Input */}
                <form onSubmit={handleSendMessage} className="border-t border-white/5 p-2 bg-black/40 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالة للدردشة مع اللاعبين..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 text-right font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 p-1.5 rounded transition flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* CENTER/SPACER */}
            <div className="md:col-span-4 flex items-center justify-center">
              {/* Floating notification to play */}
              <div className="bg-black/50 border border-white/5 rounded-full px-4 py-2 text-xs text-white backdrop-blur-sm animate-bounce">
                💬 اكتب في الشات لتلقي ردود تفاعلية من اللاعبين الآخرين!
              </div>
            </div>

            {/* RIGHT COLUMN: Character HUD (Health, armor, weapon, money) */}
            <div className="md:col-span-3 flex flex-col items-end gap-4 h-full">
              {/* GTA SA Stat Bars */}
              <div className="bg-black/75 border border-white/5 rounded-lg p-4 w-full max-w-[240px] shadow-2xl text-right">
                <span className="text-[10px] text-neutral-500 font-mono block">HUD ACTIVE</span>
                <h3 className="text-sm font-black text-amber-500 mt-0.5">مؤشرات اللاعب</h3>
                
                {/* Health */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span>صحة اللاعب (HP)</span>
                    <span className="font-mono">{health}/100</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${health}%` }}
                    />
                  </div>
                </div>

                {/* Armor */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span>الدرع الواقي (Kevlar)</span>
                    <span className="font-mono">{armor}/100</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300"
                      style={{ width: `${armor}%` }}
                    />
                  </div>
                </div>

                {/* Money */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] text-neutral-400">الرصيد المالي:</span>
                  <span className="text-emerald-400 font-extrabold text-base font-mono">
                    {money.toLocaleString()} DA
                  </span>
                </div>
              </div>

              {/* Weapon / Tool slot */}
              <div className="bg-black/75 border border-white/5 rounded-lg p-3 w-full max-w-[240px] flex items-center justify-between shadow-2xl">
                <div>
                  <span className="text-[10px] text-neutral-500 block">سلوت السلاح / الأداة</span>
                  <span className="text-xs font-bold text-white block mt-0.5">هاتف ذكي (Phone)</span>
                </div>
                <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center text-2xl">
                  📱
                </div>
              </div>

              {/* Active Jobs Widget */}
              <div className="bg-black/75 border border-white/5 rounded-lg p-3 w-full max-w-[240px] shadow-2xl text-right">
                <span className="text-[10px] text-neutral-500 block">معلومات الوظيفة</span>
                <span className="text-xs font-bold text-white block mt-1">الرتبة: متدرب جديد</span>
                <span className="text-[11px] text-neutral-400 block mt-1">الراتب القادم في غضون 10 دقائق</span>
                <button
                  onClick={() => setMoney(m => m + 4000)}
                  className="w-full mt-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-1.5 rounded transition flex items-center justify-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>استلام الراتب فوراً</span>
                </button>
              </div>

            </div>

          </div>

          {/* GAME BOTTOM MINIMAP & LOCATION */}
          <div className="relative z-10 p-4 border-t border-white/5 bg-black/40 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Simulated circular Minimap */}
              <div className="w-16 h-16 rounded-full border-2 border-amber-500 bg-neutral-900 overflow-hidden relative shadow-lg flex-shrink-0">
                <div className="absolute top-2 right-4 w-4 h-4 bg-blue-500/30 rounded-full" />
                <div className="absolute bottom-3 left-3 w-6 h-6 bg-green-500/20 rounded-lg transform rotate-45" />
                {/* Yellow player indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_#E6B73A]" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">الموقع الحالي</span>
                <strong className="text-xs text-white block">وسط مدينة لوس سانتوس (شوارع الجزائر)</strong>
                <span className="text-[10px] text-neutral-400 block font-mono">X: 124.52 | Y: -412.83 | Z: 12.04</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
              <div className="text-center px-3 border-l border-white/5">
                <span className="text-[10px] text-neutral-500 block">عدد المتصلين</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">148 / 500</span>
              </div>
              <div className="text-center px-3 border-l border-white/5">
                <span className="text-[10px] text-neutral-500 block">البينغ (Ping)</span>
                <span className="text-xs font-bold text-white font-mono">45 ms</span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] text-neutral-500 block">رقم الآيدي (ID)</span>
                <span className="text-xs font-bold text-[#FF4D62] font-mono">28</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
