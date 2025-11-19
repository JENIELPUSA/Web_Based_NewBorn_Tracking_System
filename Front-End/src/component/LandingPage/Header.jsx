import React, { useState, useEffect } from "react";
import { Baby, Menu, X, Shield, Star, ArrowRight, User } from "lucide-react";
import AuthFormModal from "../Login/login";
import headicon from "../../assets/Login.png";

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
                    <div className="flex items-center justify-between py-3 sm:py-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="group relative">
                                <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-white shadow-xl transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
                                    <img
                                        src={headicon}
                                        alt="NeoCare System"
                                        className="h-8 w-8 object-contain sm:h-10 sm:w-10"
                                    />
                                </div>
                                <div className="absolute -inset-1.5 rounded-2xl bg-[#7B8D6A] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-20 sm:-inset-2"></div>
                            </div>

                            <div>
                                <h1 className="cursor-pointer text-xl font-black text-[#7B8D6A] transition-colors duration-200 sm:text-2xl">
                                    NeoCare System
                                </h1>
                            </div>
                        </div>

                        {/* Desktop CTA - ONLY on lg and up */}
                        <div className="hidden items-center gap-4 lg:flex">
                            <button
                                onClick={() => setShowLogin(true)}
                                className="rounded-xl border border-[#7B8D6A]/70 px-5 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:bg-[#7B8D6A]/60 hover:text-white sm:px-6"
                            >
                                Log In
                            </button>
                        </div>

                        {/* Mobile Menu Button - no Login button here anymore */}
                        <div className="lg:hidden">
                            <button
                                className="rounded-xl border border-gray-200 p-2 text-gray-700 backdrop-blur-sm transition-all duration-300 hover:bg-gray-100 sm:p-3"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`overflow-hidden transition-all duration-300 lg:hidden ${
                            isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                        <div className="border-t border-gray-200 py-4">
                            <nav className="flex flex-col items-center gap-4">
                                {/* Log In button ONLY inside mobile menu */}
                                <button
                                    onClick={() => {
                                        setShowLogin(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full max-w-xs rounded-xl border border-[#7B8D6A]/70 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:bg-[#7B8D6A]/60 hover:text-white sm:px-6 sm:py-3"
                                >
                                    Log In
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            <AuthFormModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
            />
        </>
    );
};

export default Header;