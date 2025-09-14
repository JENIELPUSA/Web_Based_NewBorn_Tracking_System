import React, { useState, useEffect } from "react";
import { Baby, Menu, X, Shield, Star, ArrowRight, User } from "lucide-react";
import AuthFormModal from "../Login/login";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const trustBadges = [
    { icon: Shield, text: "HIPAA", color: "text-green-600" },
    { icon: Star, text: "4.9★", color: "text-yellow-500" },
  ];

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "border-b border-gray-200 bg-blue-50/95 shadow-2xl shadow-blue-500/10 backdrop-blur-xl"
            : "border-b border-gray-100 bg-blue-50/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="group relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Baby className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-blue-400 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-20"></div>
              </div>
              <div>
                <h1 className="cursor-pointer text-2xl font-black text-black transition-colors group-hover:text-blue-600">
                  New Born Tracking System
                </h1>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-4 lg:flex">
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-xl border border-blue-300 px-6 py-2 font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:bg-blue-300 hover:text-black"
              >
                Log In
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="rounded-xl border border-gray-200 p-3 text-gray-700 backdrop-blur-sm transition-all duration-300 hover:bg-gray-100 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`overflow-hidden transition-all duration-300 lg:hidden ${
              isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-gray-200 py-6">
              <nav className="flex flex-col gap-6">
                {/* Trust Badges */}
                <div className="flex justify-center gap-4 border-b border-gray-200 pb-4">
                  {trustBadges.map((badge, index) => {
                    const BadgeIcon = badge.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-4 py-2"
                      >
                        <BadgeIcon className={`h-4 w-4 ${badge.color}`} />
                        <span className="text-sm font-medium text-gray-700">{badge.text}</span>
                      </div>
                    );
                  })}
                </div>

              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal rendered at root for proper center */}
      <AuthFormModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Header;
