import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import companiesHouseSvg from "@/assets/partners/companies-house.svg";
import govukLogo from "@/assets/partners/govuk.svg";
import govukCrest from "@/assets/partners/govuk-crest.svg";

/**
 * UK LTD Formation hero animation.
 * Concept: a Companies House certificate materialises, a gold wax seal stamps,
 * company name types in, a green "Registered" tick draws itself.
 * Intro sequence ~1.6s, then idle shimmer + floating dust.
 */
const COMPANY_NAME = "DIGIFORMATION LTD";

const UKLtdHero = () => {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? COMPANY_NAME : "");

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i += 1;
        setTyped(COMPANY_NAME.slice(0, i));
        if (i >= COMPANY_NAME.length) clearInterval(t);
      }, 55);
    }, 700);
    return () => clearTimeout(start);
  }, [reduce]);

  return (
    <div
      role="img"
      aria-label="Animated Companies House certificate being sealed and registered"
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden glass shadow-elegant"
      style={{ background: "radial-gradient(ellipse at top, hsl(220 50% 12%) 0%, hsl(220 60% 6%) 70%)" }}
    >
      {/* Official Government Registrar badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/30 shadow-lg">
        <img src={companiesHouseSvg} alt="Companies House" className="h-4 sm:h-5 w-auto object-contain" />
        <span className="text-[10px] font-bold text-slate-800 tracking-wide uppercase">Official Registrar</span>
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/30 shadow-lg">
        <img src={govukLogo} alt="GOV.UK" className="h-3 sm:h-3.5 w-auto object-contain" />
      </div>

      {/* Floating dust idle loop */}
      {!reduce && (
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-amber-200/30"
              style={{
                width: 3,
                height: 3,
                left: `${(i * 53) % 100}%`,
                top: `${(i * 37) % 100}%`,
              }}
              animate={{ y: [-8, 8, -8], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 6 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            />
          ))}
        </div>
      )}

      {/* Certificate */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] aspect-[1/1.25] rounded-md shadow-2xl"
        style={{
          background: "linear-gradient(180deg, #fdfaf2 0%, #f5efe0 100%)",
          boxShadow: "0 20px 60px -10px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-3 border-2 border-double border-[#1a3a5c]/60 rounded-sm" />

        <div className="absolute inset-0 flex flex-col items-center pt-[7%] px-[8%] text-[#1a3a5c]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-1"
          >
            <img
              src={govukCrest}
              alt="Royal Arms"
              className="h-8 sm:h-10 w-auto object-contain opacity-90"
            />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-extrabold text-[#1a3a5c]">
                Companies House
              </span>
              <span className="text-[6px] sm:text-[8px] tracking-wider uppercase opacity-70 text-[#1a3a5c]">
                Cardiff • Edinburgh • Belfast
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-0.5 text-[10px] sm:text-xs font-serif italic opacity-75 font-semibold"
          >
            Certificate of Incorporation
          </motion.div>

          <div className="mt-[12%] w-full text-center font-serif">
            <div className="text-[10px] sm:text-xs opacity-70">This is to certify that</div>
            <div className="mt-2 text-base sm:text-2xl font-bold tracking-wide min-h-[1.4em]">
              {typed}
              {!reduce && typed.length < COMPANY_NAME.length && (
                <motion.span
                  className="inline-block w-[2px] h-[0.9em] align-middle bg-[#1a3a5c] ml-0.5"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
            <div className="mt-3 text-[10px] sm:text-xs opacity-70">is incorporated under the Companies Act 2006</div>
          </div>

          {/* Green tick */}
          <motion.svg
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 14 }}
            viewBox="0 0 48 48"
            className="absolute bottom-[14%] right-[12%] w-10 h-10 sm:w-12 sm:h-12"
          >
            <circle cx="24" cy="24" r="22" fill="hsl(152 65% 42%)" />
            <motion.path
              d="M14 25 L21 32 L34 17"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.55, duration: 0.5, ease: "easeOut" }}
            />
          </motion.svg>
        </div>

        {/* Wax seal */}
        <motion.div
          initial={reduce ? false : { scale: 0, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 1.0, type: "spring", stiffness: 220, damping: 12 }}
          className="absolute bottom-[14%] left-[10%] w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center font-serif text-white shadow-xl"
          style={{
            background: "radial-gradient(circle at 30% 30%, #d4a72c 0%, #a06b1e 70%, #5e3d11 100%)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.5), inset 0 -2px 6px rgba(0,0,0,0.4)",
          }}
        >
          <img src={govukCrest} alt="Royal Crown" className="w-5 h-4 object-contain brightness-200 invert opacity-95" />
          <span className="text-[6px] sm:text-[7px] tracking-widest font-bold mt-0.5">COMPANIES HOUSE</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UKLtdHero;
