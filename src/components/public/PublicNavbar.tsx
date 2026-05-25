"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "Doctors", href: "#doctors" },
  { name: "Reviews", href: "#reviews" },
  { name: "Contact", href: "#contact" },
];

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Simple intersection observer logic
      const sections = ["home", "services", "doctors", "reviews", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    if (elem) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = elem.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#000000]",
        mounted && isScrolled
          ? "border-b border-white/5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
          : "py-6",
      )}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group no-underline">
          <img 
            src="/logo.jpg" 
            alt="Clinic Logo" 
            className="h-16 md:h-20 w-auto max-w-[280px] object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-screen brightness-110" 
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={cn(
                  "relative text-sm font-bold transition-all duration-300 py-2",
                  isActive
                    ? "text-[#C49228]"
                    : "text-slate-300 hover:text-[#C49228]",
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C49228] rounded-full animate-in fade-in zoom-in-50 duration-500" />
                )}
              </a>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="hidden lg:block">
          <button
            onClick={() =>
              document
                .getElementById("booking")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="btn-premium-primary flex items-center gap-2.5 group"
          >
            {/* Premium Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite] transition-transform duration-1000" />

            <span className="relative z-10 tracking-tight">
              Book Appointment
            </span>
            <ArrowRight
              size={20}
              className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300 ease-out"
            />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-white bg-white/5 shadow-sm border border-white/10 rounded-xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-500 ease-in-out origin-top",
          isOpen
            ? "scale-y-100 opacity-100"
            : "scale-y-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="p-8 flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-2xl font-black text-white hover:text-[#C49228] transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => {
              document
                .getElementById("booking")
                ?.scrollIntoView({ behavior: "smooth" });
              setIsOpen(false);
            }}
            className="w-full btn-premium-primary"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </nav>
  );
}
