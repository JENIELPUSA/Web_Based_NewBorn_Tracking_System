import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Baby, 
  Users, 
  TrendingUp, 
  Droplet, 
  Zap 
} from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import baground1 from "../../assets/HERO1.jpg";
import baground2 from "../../assets/HERO2.jpg";
import baground3 from "../../assets/HERO3.jpg";

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    
    const sectionRef = useRef(null);
    const backgroundRef = useRef(null);
    const contentRef = useRef(null);
    const cardsRef = useRef(null);

    const backgrounds = [baground1, baground2, baground3];

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Parallax effects (only on desktop)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const floatingCardsY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    useEffect(() => {
        setIsVisible(true);
        const imageInterval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % backgrounds.length);
        }, 8000);

        return () => clearInterval(imageInterval);
    }, [backgrounds.length]);

    return (
        <motion.section 
            ref={sectionRef}
            className="relative min-h-screen overflow-hidden"
            style={{ opacity: isMobile ? 1 : opacity }}
        >
            {/* Background Carousel */}
            <div className="absolute inset-0">
                {backgrounds.map((bg, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentImageIndex ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                            backgroundImage: `url(${bg})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundAttachment: isMobile ? "scroll" : "fixed",
                        }}
                    />
                ))}
            </div>

            {/* Enhanced Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/60 lg:bg-black/60"></div>

            {/* Decorative Blobs (hidden on mobile) */}
            {!isMobile && (
                <motion.div style={{ y: backgroundY }}>
                    <div className="absolute left-10 top-10 h-60 w-60 animate-pulse rounded-full bg-blue-500/10 blur-3xl lg:left-20 lg:top-20 lg:h-72 lg:w-72"></div>
                    <div className="absolute right-10 top-20 h-72 w-72 animate-pulse rounded-full bg-blue-400/10 blur-3xl delay-1000 lg:right-20 lg:top-40 lg:h-96 lg:w-96"></div>
                    <div className="delay-2000 absolute bottom-10 left-1/4 h-52 w-52 animate-pulse rounded-full bg-blue-500/10 blur-3xl lg:bottom-20 lg:h-64 lg:w-64"></div>
                </motion.div>
            )}

            {/* Main Content */}
            <motion.div 
                ref={contentRef}
                className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8 lg:pt-16"
                style={{ y: isMobile ? 0 : contentY }}
            >
                <div className="flex min-h-[90vh] items-center lg:min-h-screen">
                    <div className="grid w-full items-center gap-8 py-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 lg:py-12">
                        {/* Left: Text Content */}
                        <motion.div
                            className={`space-y-6 text-center lg:text-left ${
                                isVisible ? "opacity-100" : "opacity-0"
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="space-y-4 sm:space-y-6">
                                <motion.h1 
                                    className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl"
                                    style={{ lineHeight: '1.1' }}
                                >
                                    <span className="block">Monitor Your</span>
                                    <motion.span 
                                        className="block text-[#D4F3B7] mt-2 lg:mt-1"
                                        animate={{ 
                                            textShadow: isMobile ? [] : [
                                                "0 0 15px rgba(212, 243, 183, 0.5)",
                                                "0 0 25px rgba(212, 243, 183, 0.8)", 
                                                "0 0 15px rgba(212, 243, 183, 0.5)"
                                            ]
                                        }}
                                        transition={{ 
                                            duration: 2, 
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        NewBorn's
                                    </motion.span>
                                    <span className="block">Health Journey</span>
                                </motion.h1>
                                <motion.p 
                                    className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-200 sm:text-xl lg:mx-0 lg:text-xl"
                                >
                                    Track your baby's health, height, and weight accurately with our reliable monitoring system. Give your precious baby
                                    the <span className="font-semibold text-[#D4F3B7]">perfect start</span> with clear and precise insights.
                                </motion.p>
                            </div>

                            <motion.div 
                                className="flex justify-center lg:justify-start"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <button 
                                    onClick={() => navigate("/parent-dashboard")}
                                    className="w-full max-w-sm rounded-xl bg-[#7B8D6A] px-6 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#D4F3B7]/30 sm:px-8 sm:py-5 lg:w-auto lg:max-w-none"
                                >
                                    <span className="flex items-center justify-center">
                                        Click Here to Monitor
                                        <Users className="ml-3 h-5 w-5" />
                                    </span>
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* Right: Dashboard - Hidden on mobile, visible on lg and up */}
                        <motion.div
                            className="hidden lg:block relative"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <motion.div 
                                className="group relative"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="absolute -inset-3 rounded-3xl bg-blue-500/20 opacity-60 blur-xl"></div>
                                <div className="relative rounded-3xl border border-white/20 bg-transparent p-1 backdrop-blur-sm">
                                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10 p-6 backdrop-blur-sm">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-white">Analytic Dashboard</h3>
                                                <div className="flex gap-2">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div 
                                                            key={i}
                                                            className="h-3 w-3 animate-pulse rounded-full bg-[#A9C191]"
                                                            style={{ animationDelay: `${i * 300}ms` }}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <motion.div 
                                                    className="rounded-xl border border-[#A9C191] bg-blue-500/10 p-4"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <Users className="h-5 w-5 text-[#A9C191]" />
                                                        <span className="text-sm font-semibold text-[#A9C191]">Total Babies</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-[#A9C191]">120</div>
                                                </motion.div>

                                                <motion.div 
                                                    className="rounded-xl border border-[#A9C191] bg-blue-500/10 p-4"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <TrendingUp className="h-5 w-5 text-[#A9C191]" />
                                                        <span className="text-sm font-semibold text-[#A9C191]">Height</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-[#A9C191]">65 cm</div>
                                                </motion.div>
                                            </div>

                                            <motion.div 
                                                className="rounded-xl border border-white/10 bg-white/5 p-4"
                                            >
                                                <div className="mb-3 flex justify-between">
                                                    <span className="text-sm text-blue-100">Growth Chart</span>
                                                    <span className="text-xs text-[#A9C191]">+5% this week</span>
                                                </div>
                                                <div className="flex h-16 items-end gap-1">
                                                    {[...Array(12)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 rounded-sm bg-[#A9C191]"
                                                            style={{ height: `${20 + Math.random() * 50}%` }}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Cards - only on desktop */}
                            <motion.div style={{ y: floatingCardsY }}>
                                {[
                                    { icon: Droplet, title: "Blood Type", value: "O+", pos: "-top-6 -left-8" },
                                    { icon: Zap, title: "Weight", value: "3.5 kg", pos: "top-1/4 -right-8" },
                                    { icon: Baby, title: "Gender", value: "Male", pos: "-bottom-6 -right-6" },
                                ].map((card, idx) => {
                                    const CardIcon = card.icon;
                                    return (
                                        <motion.div
                                            key={idx}
                                            className={`absolute ${card.pos} rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-lg`}
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ 
                                                y: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }
                                            }}
                                            whileHover={{ scale: 1.05, y: -4 }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-10 w-10 bg-[#A9C191] flex items-center justify-center rounded-lg">
                                                    <CardIcon className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{card.title}</div>
                                                    <div className="text-[10px] text-blue-100">{card.value}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default Hero;