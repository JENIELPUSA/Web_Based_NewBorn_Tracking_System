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
    const [currentStat, setCurrentStat] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();
    
    // Parallax refs
    const sectionRef = useRef(null);
    const backgroundRef = useRef(null);
    const contentRef = useRef(null);
    const cardsRef = useRef(null);

    const backgrounds = [baground1, baground2, baground3];

    // Scroll-based parallax effects
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });

    // Different elements move at different speeds for depth effect
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const floatingCardsY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    useEffect(() => {
        setIsVisible(true);
        const statInterval = setInterval(() => {
            setCurrentStat((prev) => (prev + 1) % 3);
        }, 3000);

        const imageInterval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % backgrounds.length);
        }, 10000);

        return () => {
            clearInterval(statInterval);
            clearInterval(imageInterval);
        };
    }, [backgrounds.length]);

    const floatingCards = [
        {
            icon: Droplet,
            title: "Blood Type",
            value: "O+",
            color: "bg-[#A9C191] text-white",
            position: "-top-8 -left-12",
            delay: "delay-300",
        },
        {
            icon: Zap,
            title: "Weight",
            value: "3.5 kg",
            color: "bg-[#A9C191] text-white",
            position: "top-1/4 -right-12",
            delay: "delay-500",
        },
        {
            icon: Baby,
            title: "Gender",
            value: "Male",
            color: "bg-[#A9C191] text-white",
            position: "-bottom-8 -right-8",
            delay: "delay-700",
        },
    ];

    return (
        <motion.section 
            ref={sectionRef}
            className="relative min-h-screen overflow-hidden"
            style={{ opacity }}
        >
            {/* Background Carousel with Parallax */}
            <motion.div 
                ref={backgroundRef}
                className="absolute inset-0"
                style={{ 
                    y: backgroundY,
                    scale 
                }}
            >
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
                            backgroundAttachment: "fixed", // Enhanced parallax effect
                        }}
                    />
                ))}
            </motion.div>

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Decorative animated blobs with parallax */}
            <motion.div 
                className="absolute inset-0"
                style={{ y: backgroundY }}
            >
                <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute right-20 top-40 h-96 w-96 animate-pulse rounded-full bg-blue-400/10 blur-3xl delay-1000"></div>
                <div className="delay-2000 absolute bottom-20 left-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
            </motion.div>

            {/* Main Content with Parallax */}
            <motion.div 
                ref={contentRef}
                className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8"
                style={{ y: contentY }}
            >
                <div className="grid min-h-screen items-center gap-16 py-12 lg:grid-cols-2">
                    {/* Left: Text Content */}
                    <motion.div
                        className={`transform space-y-10 transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}
                    >
                        <div className="space-y-8">
                            <motion.h1 
                                className="text-5xl font-black leading-[0.9] tracking-tight text-white md:text-7xl"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <span className="block">Monitor Your</span>
                                <motion.span 
                                    className="block animate-pulse text-[#D4F3B7]"
                                    animate={{ 
                                        scale: [1, 1.05, 1],
                                        textShadow: [
                                            "0 0 20px rgba(212, 243, 183, 0.5)",
                                            "0 0 30px rgba(212, 243, 183, 0.8)", 
                                            "0 0 20px rgba(212, 243, 183, 0.5)"
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
                                className="max-w-2xl text-xl leading-relaxed text-gray-200 md:text-2xl"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                Track your baby's health, height, and weight accurately with our reliable monitoring system. Give your precious baby
                                the <span className="font-semibold text-[#D4F3B7]">perfect start</span> with clear and precise insights.
                            </motion.p>
                        </div>

                        <motion.div 
                            className="flex flex-col gap-6 sm:flex-row"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <button 
                                onClick={() => navigate("/parent-dashboard")}
                                className="group relative overflow-hidden rounded-2xl bg-[#7B8D6A] px-10 py-6 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#D4F3B7]"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    Click Here to Monitor
                                    <Baby className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Right: Transparent Dashboard */}
                    <motion.div
                        ref={cardsRef}
                        className={`relative transform transition-all delay-300 duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
                    >
                        <motion.div 
                            className="group relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="absolute -inset-4 animate-pulse rounded-3xl bg-blue-500/20 opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-100"></div>
                            <div className="relative rounded-3xl border border-white/20 bg-transparent p-1 backdrop-blur-sm">
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10 p-8 backdrop-blur-sm">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold text-white">Analytic Dashboard</h3>
                                            <div className="flex gap-2">
                                                <div className="h-3 w-3 animate-pulse rounded-full bg-[#A9C191]"></div>
                                                <div className="h-3 w-3 animate-pulse rounded-full bg-[#A9C191] delay-300"></div>
                                                <div className="h-3 w-3 animate-pulse rounded-full bg-[#A9C191] delay-500"></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div 
                                                className="rounded-xl border border-[#A9C191] bg-blue-500/10 p-4"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 400 }}
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
                                                transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
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
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <div className="mb-3 flex justify-between">
                                                <span className="text-sm text-blue-100">Growth Chart</span>
                                                <span className="text-xs text-[#A9C191]">+5% this week</span>
                                            </div>
                                            <div className="flex h-16 items-end gap-1">
                                                {[...Array(12)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="flex-1 animate-pulse rounded-sm bg-[#A9C191]"
                                                        style={{
                                                            height: `${30 + Math.random() * 40}%`,
                                                            animationDelay: `${i * 100}ms`,
                                                        }}
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    ></motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Info Cards with Parallax */}
                        <motion.div style={{ y: floatingCardsY }}>
                            {floatingCards.map((card, index) => {
                                const CardIcon = card.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        className={`absolute ${card.position} ${card.delay} transform rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-500 hover:scale-105 hover:shadow-blue-400/30 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                                        whileHover={{ 
                                            scale: 1.1,
                                            rotate: index % 2 === 0 ? 2 : -2,
                                            y: -5
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        animate={{
                                            y: [0, -10, 0],
                                        }}
                                        transition={{
                                            y: {
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: index * 0.5
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div 
                                                className={`h-12 w-12 ${card.color} flex items-center justify-center rounded-xl backdrop-blur-sm`}
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                            >
                                                <CardIcon className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{card.title}</div>
                                                <div className="mt-1 text-xs text-blue-100">{card.value}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default Hero;