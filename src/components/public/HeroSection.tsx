"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Users, Award, CalendarCheck } from "lucide-react";

export function HeroSection() {
  const words = ["Smile", "Confidence", "Health", "Comfort", "Brilliance"];
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
          background: linear-gradient(160deg, #f0fdf8 0%, #ffffff 50%, #f0f9ff 100%);
        }
        @media (min-width: 768px) {
          .bg-mobile-gradient { background: #ffffff; }
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
          color: #10B981;
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
          background: #10B981;
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
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }
        .is-scrolling { animation: none !important; }
      `}</style>

      <section id="hero-section" className="relative min-h-[100vh] w-full overflow-x-hidden pt-20 bg-mobile-gradient">
        <div className="container-custom mx-auto px-[24px] md:px-8 py-12 relative z-10 flex flex-col md:flex-row items-center justify-between min-h-[calc(100vh-80px)]">
          {/* Mobile Image (Normal flow) */}
          <div className="w-full md:hidden order-1 flex justify-center relative pt-4" style={{ paddingBottom: '32px' }}>
            <div className="relative">
              <div 
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
                style={{ width: '110%', height: '110%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)' }}
              />
              <div className="dental-shape shape-circle" />
              <div className="dental-shape shape-rect" />
              <div className="dental-shape shape-diamond" />
              <img id="hero-tooth-mobile" src="/home.jpg" alt="Dental care"
                className="w-full max-w-[320px] relative z-10 animate-image-entrance mix-blend-multiply"
                style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2 order-2 md:order-1 flex flex-col items-start text-left max-w-2xl">
            <span className="animate-text-up delay-label text-primary-green font-bold uppercase block border-l-2 border-primary-green"
              style={{ letterSpacing: '0.12em', paddingLeft: '8px', fontSize: '0.7rem', marginBottom: '12px' }}>
              Trusted Dental Care
            </span>
            <h1 className="animate-text-up delay-headline text-[#0f172a] font-bold tracking-tight w-full max-w-[350px] md:max-w-full text-[2rem] md:text-[2.8rem] lg:text-[4.5rem]"
              style={{ lineHeight: '1.2', marginBottom: '12px' }}>
              Your{' '}
              <span className="word-container">
                <span className={`word-item ${isExiting ? 'word-exit' : 'word-enter active'}`}>
                  {words[index]}
                  <div className="word-underline" />
                </span>
              </span>
              <br /> Starts Here
            </h1>
            <p className="animate-text-up delay-subline text-slate-500 font-medium leading-relaxed text-base md:text-lg lg:text-[1.05rem]"
              style={{ marginBottom: '24px' }}>
              Experience world-class clinical excellence in a luxury environment tailored for your comfort.
            </p>
            <div className="animate-text-up delay-btn w-full md:w-auto" style={{ marginBottom: '32px' }}>
              <button onClick={scrollToBooking}
                className="w-full md:w-auto bg-primary-green text-white rounded-[100px] font-bold text-lg transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 active:shadow-md flex items-center justify-center gap-3 pulse-btn"
                style={{ minHeight: '52px', padding: '14px 32px' }}>
                Book Appointment <ArrowRight size={20} />
              </button>
            </div>
            <div className="animate-text-up delay-btn flex flex-col md:flex-row items-start gap-4 md:gap-6 pt-6 border-t border-slate-100 w-full">
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={18} className="text-primary-green" /><span className="text-xs font-bold uppercase tracking-wider">500+ Patients</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Award size={18} className="text-primary-green" /><span className="text-xs font-bold uppercase tracking-wider">Expert Dentists</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CalendarCheck size={18} className="text-primary-green" /><span className="text-xs font-bold uppercase tracking-wider">Easy Booking</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block w-[320px] lg:w-[420px] order-2 shrink-0" />
        </div>

        <div id="fixed-image-wrapper" className="hidden md:flex fixed top-0 left-0 w-full h-full z-0 pointer-events-none justify-center transition-opacity duration-300">
          <div className="container-custom mx-auto px-[24px] md:px-8 w-full h-full flex items-center justify-between">
            <div className="w-1/2 shrink-0" />
            <div className="w-[320px] lg:w-[420px] flex justify-end items-center h-full relative shrink-0">
              <div className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full glow-desktop-sync"
                style={{ width: '110%', height: '110%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)' }} />
              <div className="dental-shape shape-circle" />
              <div className="dental-shape shape-rect" />
              <div className="dental-shape shape-diamond" />
              <img id="hero-tooth-desktop" src="/home.jpg" alt="Dental care"
                className="pointer-events-auto relative z-10 float-desktop-idle mix-blend-multiply"
                style={{ width: '100%', willChange: 'transform, opacity', background: 'transparent', border: 'none', boxShadow: 'none' }} />
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
