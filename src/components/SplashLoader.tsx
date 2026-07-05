import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface SplashLoaderProps {
  onComplete: () => void;
}

const loadingSteps = [
  { threshold: 0.0, label: "تحميل الموارد..." },
  { threshold: 0.28, label: "جاري الاتصال بالسيرفر..." },
  { threshold: 0.58, label: "تحضير بيئة اللعب..." },
  { threshold: 0.83, label: "جاري التحقق من الملفات..." },
  { threshold: 0.96, label: "اكتمل التحميل..." },
];

export default function SplashLoader({ onComplete }: SplashLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("تحميل الموارد...");

  // Keep a mutable ref to the latest onComplete callback to avoid restarting the interval on re-renders
  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 3 + 1; // Randomly increment progress
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          onCompleteRef.current();
        }, 800);
      }

      setProgress(Math.floor(currentProgress));

      // Update the label based on progress threshold
      const currentRatio = currentProgress / 100;
      let matchedLabel = loadingSteps[0].label;
      for (const step of loadingSteps) {
        if (currentRatio >= step.threshold) {
          matchedLabel = step.label;
        }
      }
      setLabel(matchedLabel);
    }, 150);

    return () => clearInterval(interval);
  }, []); // Run only once on mount, preventing any reset/looping

  return (
    <div className="fixed inset-0 bg-[#0A0B0F] flex flex-col items-center justify-between py-12 px-6 select-none overflow-hidden text-right" dir="rtl">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Launcher Top Line */}
      <div className="w-full max-w-xl flex items-center justify-between border-b border-white/5 pb-4 opacity-40">
        <span className="font-mono text-[10px] text-gray-500">SYSTEM: VERIFICATION_OK</span>
        <span className="font-sans text-[10px] text-gray-500">بوابة الجزائر للعب الواقعي</span>
      </div>

      {/* Centered Golden Logo */}
      <div className="flex flex-col items-center justify-center my-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative text-center"
        >
          {/* Glowing back-logo effect */}
          <div className="absolute inset-0 text-[110px] font-extrabold tracking-widest text-amber-500/10 blur-xl">
            DZ
          </div>

          <h1 className="text-[100px] font-black tracking-wider leading-none bg-gradient-to-br from-[#F5D27A] via-[#E6B73A] to-[#B8912E] bg-clip-text text-transparent font-display select-none">
            DZ
          </h1>
        </motion.div>

        <motion.h2
          initial={{ letterSpacing: "2px", opacity: 0 }}
          animate={{ letterSpacing: "8px", opacity: 0.6 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-xs font-bold text-[#8089A0] font-sans mt-2 mr-[-8px] tracking-[8px] uppercase text-center"
        >
          LEGA ROLE PLAY
        </motion.h2>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xs font-black text-[#FF4D62] tracking-[6px] mr-[-6px] font-display mt-2 uppercase"
        >
          V5
        </motion.div>
      </div>

      {/* Progress Section */}
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Animated label */}
        <motion.div
          key={label}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="text-xs font-sans text-[#8089A0] mb-3 font-medium h-5"
        >
          {label}
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-full h-[5px] bg-white/5 rounded-full overflow-hidden relative border border-white/[0.02]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#B8912E] via-[#E6B73A] to-[#F5D27A] rounded-full shadow-[0_0_10px_rgba(230,183,58,0.5)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="font-mono text-xs text-[#E6B73A] mt-2 font-semibold">
          {progress}%
        </div>
      </div>
    </div>
  );
}
