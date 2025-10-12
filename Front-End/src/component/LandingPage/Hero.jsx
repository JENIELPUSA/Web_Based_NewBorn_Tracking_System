import React, { useState, useEffect } from "react";
import { 
  Baby, 
  Users, 
  TrendingUp, 
  Droplet, 
  Zap 
} from "lucide-react"; // ✅ Lahat ng icons na kailangan, nandito na sa simula
import { useNavigate } from "react-router-dom";
import baground1 from "../../assets/HERO1.png";
import baground2 from "../../assets/HERO2.png";
import baground3 from "../../assets/HERO3.png";

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStat, setCurrentStat] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();

    const backgrounds = [baground1, baground2, baground3];

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
            color: "bg-blue-500/70 text-blue-300",
            position: "-top-8 -left-12",
            delay: "delay-300",
        },
        {
            icon: Zap,
            title: "Weight",
            value: "3.5 kg",
            color: "bg-blue-500/70 text-blue-300",
            position: "top-1/4 -right-12",
            delay: "delay-500",
        },
        {
            icon: Baby,
            title: "Gender",
            value: "Male",
            color: "bg-blue-500/70 text-blue-300",
            position: "-bottom-8 -right-8",
            delay: "delay-700",
        },
    ];

    return (
        <section className="relative min-h-screen overflow-hidden">
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
                        }}
                    />
                ))}
            </div>

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Decorative animated blobs */}
            <div className="absolute inset-0">
                <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute right-20 top-40 h-96 w-96 animate-pulse rounded-full bg-blue-400/10 blur-3xl delay-1000"></div>
                <div className="delay-2000 absolute bottom-20 left-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
                <div className="grid min-h-screen items-center gap-16 py-12 lg:grid-cols-2">
                    {/* Left: Text Content */}
                    <div
                        className={`transform space-y-10 transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}
                    >
                        <div className="space-y-8">
                            <h1 className="text-5xl font-black leading-[0.9] tracking-tight text-white md:text-7xl">
                                <span className="block">Monitor Your</span>
                                <span className="block animate-pulse text-blue-300">NewBorn's</span>
                                <span className="block">Health Journey</span>
                            </h1>
                            <p className="max-w-2xl text-xl leading-relaxed text-gray-200 md:text-2xl">
                                Track your baby's health, height, and weight accurately with our reliable monitoring system. Give your precious baby
                                the <span className="font-semibold text-blue-300">perfect start</span> with clear and precise insights.
                            </p>
                        </div>

                        <div className="flex flex-col gap-6 sm:flex-row">
                            <button 
                                onClick={() => navigate("/parent-dashboard")}
                                className="group relative overflow-hidden rounded-2xl bg-blue-600 px-10 py-6 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    Click Here to Monitor
                                    <Baby className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Transparent Dashboard */}
                    <div
                        className={`relative transform transition-all delay-300 duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
                    >
                        <div className="group relative">
                            <div className="absolute -inset-4 animate-pulse rounded-3xl bg-blue-500/20 opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-100"></div>
                            <div className="relative rounded-3xl border border-white/20 bg-transparent p-1 backdrop-blur-sm">
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10 p-8 backdrop-blur-sm">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold text-white">Analytic Dashboard</h3>
                                            <div className="flex gap-2">
                                                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-300"></div>
                                                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-400 delay-300"></div>
                                                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 delay-500"></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-xl border border-blue-300/50 bg-blue-500/10 p-4">
                                                <div className="mb-2 flex items-center gap-3">
                                                    <Users className="h-5 w-5 text-blue-300" />
                                                    <span className="text-sm font-semibold text-blue-100">Total Babies</span>
                                                </div>
                                                <div className="text-2xl font-bold text-blue-200">120</div>
                                            </div>

                                            <div className="rounded-xl border border-blue-300/50 bg-blue-500/10 p-4">
                                                <div className="mb-2 flex items-center gap-3">
                                                    <TrendingUp className="h-5 w-5 text-blue-300" />
                                                    <span className="text-sm font-semibold text-blue-100">Height</span>
                                                </div>
                                                <div className="text-2xl font-bold text-blue-200">65 cm</div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                            <div className="mb-3 flex justify-between">
                                                <span className="text-sm text-blue-100">Growth Chart</span>
                                                <span className="text-xs text-blue-300">+5% this week</span>
                                            </div>
                                            <div className="flex h-16 items-end gap-1">
                                                {[...Array(12)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 animate-pulse rounded-sm bg-blue-400/90"
                                                        style={{
                                                            height: `${30 + Math.random() * 40}%`,
                                                            animationDelay: `${i * 100}ms`,
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Info Cards */}
                        {floatingCards.map((card, index) => {
                            const CardIcon = card.icon;
                            return (
                                <div
                                    key={index}
                                    className={`absolute ${card.position} ${card.delay} transform rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-500 hover:scale-105 hover:shadow-blue-400/30 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 ${card.color} flex items-center justify-center rounded-xl backdrop-blur-sm`}>
                                            <CardIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{card.title}</div>
                                            <div className="mt-1 text-xs text-blue-100">{card.value}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;