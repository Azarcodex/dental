"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Users, Award, CalendarCheck } from "lucide-react";

export function HeroSection() {
  const words = ["Smile", "Health", "Comfort", "Brilliance"];
  const [index, setIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Rotating text logic
  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setIsExiting(false);
      }, 380);
    }, 3380);
    
    return () => clearInterval(interval);
  }, []);

  // Main scroll & resize animation controller
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const desktopImg = document.getElementById('hero-tooth-desktop');
    const hero = document.getElementById('hero-section');
    const fixedWrapper = document.getElementById('fixed-image-wrapper');
    if (!desktopImg || !hero) return;

    let isMobile = window.innerWidth < 768;
    let scrollHandler: any = null;

    const applyScroll = () => {
      const rect = hero.getBoundingClientRect();
      const heroHeight = hero.offsetHeight;
      
      const scrolledThrough = Math.max(0, -rect.top);
      const progress = Math.min(scrolledThrough / heroHeight, 1);

      const translateY = progress * 200; 
      const rotate = progress * 15;  
      const scale = 1 + progress * 0.12; 
      const opacity = 1 - progress * 0.4; 

      desktopImg.style.transform = `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`;
      desktopImg.style.opacity = opacity.toString();

      // Pause idle animation when scrolling
      if (scrolledThrough > 30) {
        desktopImg.classList.add('is-scrolling');
      } else {
        desktopImg.classList.remove('is-scrolling');
      }

      if (fixedWrapper) {
        if (progress >= 1) {
          fixedWrapper.style.opacity = '0';
          fixedWrapper.style.pointerEvents = 'none';
        } else {
          fixedWrapper.style.opacity = '1';
        }
      }
    };

    const resetStyles = () => {
      desktopImg.style.transform = '';
      desktopImg.style.opacity = '';
      desktopImg.classList.remove('is-scrolling');
      if (fixedWrapper) {
        fixedWrapper.style.opacity = '0';
      }
    };

    const handleResize = () => {
      const currentlyMobile = window.innerWidth < 768;
      
      if (currentlyMobile !== isMobile) {
        isMobile = currentlyMobile;
        
        if (isMobile) {
          if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
          }
          resetStyles();
        } else {
          if (!scrollHandler) {
            scrollHandler = () => applyScroll();
            window.addEventListener('scroll', scrollHandler, { passive: true });
          }
          applyScroll();
        }
      } else if (!isMobile) {
         applyScroll();
      }
    };

    window.addEventListener('resize', handleResize);

    if (!isMobile) {
      scrollHandler = () => applyScroll();
      window.addEventListener('scroll', scrollHandler, { passive: true });
      applyScroll();
    } else {
      resetStyles();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
      }
    };
  }, []);

  // Scroll indicator fade out
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;
    const handleScroll = () => {
      indicator.style.opacity = window.scrollY > 80 ? '0' : '1';
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile Animation Handoff
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mobileImg = document.getElementById('hero-tooth-mobile');
    if (!mobileImg) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      mobileImg.classList.add('float-mobile-idle');
      mobileImg.classList.remove('animate-image-entrance');
      return;
    }

    const handleAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName === 'imageDropIn') {
        mobileImg.classList.remove('animate-image-entrance');
        mobileImg.classList.add('float-mobile-idle');
      }
    };
    
    mobileImg.addEventListener('animationend', handleAnimationEnd);
    return () => mobileImg.removeEventListener('animationend', handleAnimationEnd);
  }, []);

  const scrollToBooking = () => {
    const booking = document.getElementById("booking");
    if (booking) {
      booking.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{`
        .bg-mobile-gradient {
          background: transparent;
        }
        @media (min-width: 768px) {
          .bg-mobile-gradient { background: transparent; }
        }

        /* Rotating Headline Word */
        .word-container {
          display: inline-block;
          position: relative;
          overflow: hidden;
          vertical-align: bottom;
          min-width: 140px;
          height: 1.2em;
        }
        @media (min-width: 768px) { .word-container { min-width: 180px; } }
        @media (min-width: 1024px) { .word-container { min-width: 380px; } }

        .word-item {
          display: block;
          color: #C49228;
          font-style: italic;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          line-height: 1.2em;
        }

        .word-underline {
          position: absolute;
          bottom: 4px;
          left: 0;
          height: 3px;
          background: #C49228;
          border-radius: 2px;
          width: 0%;
        }
        .active .word-underline {
          animation: underlineGrow 350ms ease-out forwards;
        }

        @keyframes underlineGrow {
          from { width: 0%; }
          to { width: 100%; }
        }

        @media (prefers-reduced-motion: no-preference) {
          .word-exit { animation: wordExit 380ms ease-in forwards; }
          .word-enter { animation: wordEnter 380ms ease-out forwards; }
          @keyframes wordExit {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-110%); opacity: 0; }
          }
          @keyframes wordEnter {
            from { transform: translateY(110%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .animate-text-up { animation: textFadeUp 0.5s ease-out both; }
          .delay-label { animation-delay: 0.3s; }
          .delay-headline { animation-delay: 0.5s; }
          .delay-subline { animation-delay: 0.7s; }
          .delay-btn { animation-delay: 0.9s; }
          @keyframes textFadeUp {
            0% { opacity: 0; transform: translateY(16px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes imageDropIn {
            0% { opacity: 0; transform: translateY(-30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-image-entrance { animation: imageDropIn 0.8s ease-out forwards; }
        }

        @media (prefers-reduced-motion: reduce) {
          .word-exit { opacity: 0; transition: opacity 200ms; }
          .word-enter { opacity: 1; transition: opacity 200ms; }
        }

        /* Pendulum Animations */
        .float-desktop-idle {
          animation: toothPendulum 6s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .glow-desktop-sync {
          animation: glowSync 6s ease-in-out infinite;
          transform-origin: center center;
        }
        @keyframes toothPendulum {
          0%, 50%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-14px) rotate(8deg) scale(1.03); }
          75% { transform: translateY(-10px) rotate(-6deg) scale(1.02); }
        }
        @keyframes glowSync {
          0%, 50%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          25% { transform: translate(-50%, -50%) rotate(4deg) scale(1.05); }
          75% { transform: translate(-50%, -50%) rotate(-3deg) scale(1.03); }
        }

        .float-mobile-idle {
          animation: toothPendulumMobile 6s ease-in-out infinite;
          transform-origin: center bottom;
        }
        @keyframes toothPendulumMobile {
          0%, 50%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-8px) rotate(5deg) scale(1.02); }
          75% { transform: translateY(-6px) rotate(-5deg) scale(1.01); }
        }

        /* Floating Shapes */
        .dental-shape { position: absolute; pointer-events: none; z-index: 5; }
        .shape-circle {
          width: 16px; height: 16px; background: #D1FAE5; border-radius: 50%;
          top: 0; right: 0; animation: floatCircle 4s ease-in-out infinite;
        }
        .shape-rect {
          width: 8px; height: 24px; background: #DBEAFE; border-radius: 4px;
          bottom: 0; left: 0; animation: spinRect 8s linear infinite;
        }
        .shape-diamond {
          width: 12px; height: 12px; background: rgba(16, 185, 129, 0.4);
          transform: rotate(45deg); top: 50%; left: -20px;
          animation: pulseDiamond 2.5s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .shape-circle { width: 10px; height: 10px; }
          .shape-rect { width: 5px; height: 15px; }
          .shape-diamond { width: 8px; height: 8px; }
        }
        @keyframes floatCircle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes spinRect { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseDiamond {
          0%, 100% { transform: rotate(45deg) scale(1); }
          50% { transform: rotate(45deg) scale(1.4); }
        }

        .pulse-btn { animation: pulseBtn 2.5s infinite; }
        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196, 146, 40, 0.3); }
          50% { box-shadow: 0 0 0 10px rgba(196, 146, 40, 0); }
        }
        .is-scrolling { animation: none !important; }
      `}</style>

      <section id="hero-section" className="relative min-h-[100vh] w-full overflow-x-hidden pt-20 flex items-center justify-center">
        {/* Cinematic Background Image for Hero Only */}
        <div 
          className="absolute inset-0 z-0 opacity-60 pointer-events-none"
          style={{
            backgroundImage: 'url(/bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Subtle depth gradient overlay to blend into the pure black theme below */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/20 to-black pointer-events-none" />

        <div className="container-custom mx-auto px-[24px] md:px-8 py-12 relative z-10 flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)]">
          
          <div className="w-full flex flex-col items-center max-w-4xl mt-12 md:mt-0">
            <span className="animate-text-up delay-label text-[#C49228] font-bold uppercase block border-b-2 border-[#C49228]"
              style={{ letterSpacing: '0.2em', paddingBottom: '8px', fontSize: '0.75rem', marginBottom: '24px' }}>
              Trusted Dental Care
            </span>
            <h1 className="animate-text-up delay-headline text-white font-bold tracking-tight w-full text-[2.5rem] md:text-[4rem] lg:text-[5.5rem]"
              style={{ lineHeight: '1.1', marginBottom: '24px' }}>
              Your{' '}
              <span className="word-container">
                <span className={`word-item ${isExiting ? 'word-exit' : 'word-enter active'}`}>
                  {words[index]}
                  <div className="word-underline" />
                </span>
              </span>
              <br /> Starts Here
            </h1>
            <p className="animate-text-up delay-subline text-slate-300 font-light leading-relaxed text-base md:text-xl lg:text-[1.25rem] max-w-2xl"
              style={{ marginBottom: '40px' }}>
              Experience world-class clinical excellence in a luxury environment tailored for your comfort.
            </p>
            <div className="animate-text-up delay-btn w-full md:w-auto" style={{ marginBottom: '48px' }}>
              <button onClick={scrollToBooking}
                className="btn-premium-primary pulse-btn flex items-center justify-center gap-3 w-full md:w-auto px-8"
                style={{ minHeight: '56px', fontSize: '1.1rem' }}>
                Book Appointment <ArrowRight size={20} />
              </button>
            </div>
            <div className="animate-text-up delay-btn flex flex-wrap justify-center items-center gap-6 md:gap-12 pt-8 border-t border-white/10 w-full max-w-3xl">
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={20} className="text-[#C49228]" /><span className="text-xs md:text-sm font-bold uppercase tracking-wider">500+ Patients</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Award size={20} className="text-[#C49228]" /><span className="text-xs md:text-sm font-bold uppercase tracking-wider">Expert Dentists</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarCheck size={20} className="text-[#C49228]" /><span className="text-xs md:text-sm font-bold uppercase tracking-wider">Easy Booking</span>
              </div>
            </div>
          </div>
        </div>

        <div id="scroll-indicator" className="hidden md:flex flex-col items-center gap-[6px] absolute bottom-[32px] left-1/2 -translate-x-1/2 z-20 transition-opacity duration-400">
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#9ca3af' }}>SCROLL</span>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, #9ca3af, transparent)', animation: 'scrollLine 1.5s ease-in-out infinite' }} />
        </div>
      </section>
    </>
  );
}
