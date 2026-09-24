import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlowingEarth from "@/components/GlowingEarth";

const headlines = [
  { pre: "Establish Your", accent: "UK & US Company", post: "in Days" },
  { pre: "Bespoke", accent: "Software & Web Development", post: "for Global Scale" },
  { pre: "Over", accent: "500+ Companies", post: "Successfully Formed Worldwide" },
  { pre: "Next-Gen", accent: "AI Agents & 3D Interactive Web", post: "Solutions" },
  { pre: "Banking, Payments &", accent: "Corporate Compliance", post: "— All In One Place" },
];

const DigiHero = () => {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentHeadline = headlines[headlineIndex];

  // Pre-calculate full headline string and split points
  const { fullText, preEnd, accentEnd } = useMemo(() => {
    const pre = currentHeadline.pre ? `${currentHeadline.pre} ` : "";
    const accent = currentHeadline.accent;
    const post = currentHeadline.post ? ` ${currentHeadline.post}` : "";
    const full = `${pre}${accent}${post}`;
    return {
      fullText: full,
      preEnd: pre.length,
      accentEnd: pre.length + accent.length,
    };
  }, [currentHeadline]);

  // Typewriter effect state loop
  useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCharIndex(fullText.length);
      const timer = setInterval(() => {
        setHeadlineIndex((prev) => (prev + 1) % headlines.length);
      }, 4000);
      return () => clearInterval(timer);
    }

    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (charIndex < fullText.length) {
        timeout = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 42); // Typing speed
      } else {
        // Finished typing full sentence — pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2400); // 2.4s pause on full text
      }
    } else {
      // Deleting phase
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, 22); // Fast delete speed
      } else {
        // Finished deleting — switch to next headline
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setHeadlineIndex((prev) => (prev + 1) % headlines.length);
        }, 350);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, fullText.length, headlines.length]);

  // Slice segments based on current typed character count
  const displayedPre = fullText.slice(0, Math.min(charIndex, preEnd));
  const displayedAccent = charIndex > preEnd ? fullText.slice(preEnd, Math.min(charIndex, accentEnd)) : "";
  const displayedPost = charIndex > accentEnd ? fullText.slice(accentEnd, charIndex) : "";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

      {/* floating orbs — source spec */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl animate-float" aria-hidden />
      <div className="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-accent/20 blur-3xl animate-float" aria-hidden style={{ animationDelay: "2s" }} />

      {/* Rotating glowing earth — sits behind headline */}
      <GlowingEarth />

      <div className="container mx-auto px-4 py-20 relative z-10 text-center">
        {/* Top Feature Pill Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mt-8 md:mt-16 mb-8 border border-primary/30 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-foreground/90">
            Company Formation • Software Engineering • Web Development • AI Agents • Banking
          </span>
        </div>

        <div className="relative">
          {/* Subtle glow behind the headline */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[200%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.55)_0%,hsl(var(--accent)/0.25)_30%,transparent_70%)] blur-3xl animate-hero-glow" />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[130%] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.45),transparent_70%)] blur-2xl animate-hero-glow-slow" />

          {/* Animated Typewriter Main Title */}
          <h1
            className="relative text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-bold leading-[1.08] mb-8 min-h-[3.6em] sm:min-h-[2.5em] lg:min-h-[2.2em] flex items-center justify-center animate-fade-up"
            style={{ animationDelay: "0.1s" }}
            aria-label={fullText}
          >
            <span className="sr-only">{fullText}</span>
            <span aria-hidden="true" className="inline">
              {displayedPre}
              {displayedAccent && (
                <span className="headline-accent-shimmer text-gradient">
                  {displayedAccent}
                </span>
              )}
              {displayedPost}
              {/* Glowing Typewriter Cursor */}
              <span
                className="inline-block w-[3px] md:w-[4px] h-[0.85em] ml-1.5 align-middle bg-primary animate-pulse rounded-full shadow-[0_0_14px_hsl(var(--primary))]"
                aria-hidden="true"
              />
            </span>
          </h1>
        </div>

        <style>{`
          @keyframes hero-glow {
            0%, 100% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
            50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.08); }
          }
          @keyframes hero-glow-slow {
            0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
            50%      { opacity: 1;   transform: translate(-50%, -50%) scale(0.95); }
          }
          .animate-hero-glow      { animation: hero-glow 5s ease-in-out infinite; }
          .animate-hero-glow-slow { animation: hero-glow-slow 8s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .animate-hero-glow, .animate-hero-glow-slow { animation: none; }
          }
        `}</style>

        {/* Narrative Subtitle mentioning Software & Web Development */}
        <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed opacity-90 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          From UK &amp; US corporate formation and verified business banking to bespoke software engineering, modern web development, and autonomous AI agents — DigiFormation delivers the complete infrastructure you need to launch and scale globally.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button asChild variant="hero" size="lg" className="rounded-full w-full sm:w-auto">
            <Link to="/uk-services/uk-ltd-formation/choose-jurisdiction">
              Register UK Company <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="hero" size="lg" className="rounded-full w-full sm:w-auto">
            <Link to="/usa-services/us-llc-formation/choose-state">
              Register USA Company <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="ghostGlow" size="lg" className="rounded-full w-full sm:w-auto">
            <Link to="/software-development">
              <Code2 className="w-4 h-4 mr-1 text-primary" /> Software &amp; Web Dev
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
};

export default DigiHero;
