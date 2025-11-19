import React, { useState, useEffect } from "react";
import { Activity, BarChart3, BellRing, Users, ArrowRight, CheckCircle } from "lucide-react";

const Features = () => {
    const [visibleCards, setVisibleCards] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.dataset.index);
                        setVisibleCards((prev) => [...prev, index]);
                    }
                });
            },
            { threshold: 0.1 },
        );

        document.querySelectorAll(".feature-card").forEach((card) => {
            observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />,
            title: "Growth Analytics",
            description: "Beautiful interactive charts showing your baby's development progress over time.",
            highlights: ["New born growth charts", "Milestone tracking", "Trend analysis"],
            color: "from-[#7B8D6A] to-[#7B8D6A]",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            iconColor: "text-emerald-500",
        },
        {
            icon: <Users className="h-6 w-6 sm:h-8 sm:w-8" />,
            title: "Family Collaboration",
            description: "Share access with caregivers, grandparents, and healthcare providers seamlessly and securely.",
            highlights: ["Role-based access", "Care team integration", "Real-time updates", "Secure sharing"],
            color: "from-[#7B8D6A] to-[#7B8D6A]",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            iconColor: "text-amber-500",
        },
        {
            icon: <BellRing className="h-6 w-6 sm:h-8 sm:w-8" />,
            title: "Smart Notifications",
            description: "Intelligent alerts and reminders that learn your routine and send notifications when you need them most.",
            highlights: ["Smart scheduling", "Custom alerts", "Quiet mode", "Emergency notifications"],
            color: "from-[#7B8D6A] to-[#7B8D6A]",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            iconColor: "text-blue-500",
        },
    ];

    return (
        <section
            id="features"
            className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20"
        >
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute left-4 top-20 h-48 w-48 animate-pulse rounded-full bg-blue-100 blur-2xl sm:left-10 sm:top-40 sm:h-64 sm:w-64 sm:blur-3xl lg:left-20 lg:h-96 lg:w-96"></div>
                <div className="absolute bottom-20 right-4 h-40 w-40 animate-pulse rounded-full bg-blue-50 blur-2xl delay-1000 sm:bottom-40 sm:right-10 sm:h-56 sm:w-56 sm:blur-3xl lg:right-20 lg:h-80 lg:w-80"></div>
                <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-50 blur-2xl sm:h-[400px] sm:w-[400px] sm:blur-3xl lg:h-[600px] lg:w-[600px]"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-12 text-center sm:mb-16 lg:mb-20">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-800 sm:mb-6 sm:gap-3 sm:px-6 sm:py-3 sm:text-sm">
                        <Activity className="h-4 w-4 text-[#7B8D6A] sm:h-5 sm:w-5" />
                        Comprehensive Care Features
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7B8D6A] sm:h-2 sm:w-2"></div>
                    </div>

                    <h2 className="mb-4 text-2xl font-black leading-tight text-black sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                        Everything You Need for
                        <span className="mt-1 block text-[#7B8D6A] sm:mt-2">Complete Care</span>
                    </h2>

                    <p className="mx-auto max-w-4xl text-sm leading-relaxed text-gray-700 sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                        Our platform combines medical-grade monitoring with intuitive design to help you track every aspect of your newborn's
                        development and health.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            data-index={index}
                            className={`feature-card group relative transform cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-200 sm:rounded-2xl sm:p-8 ${
                                visibleCards.includes(index) ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                            }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                            onMouseEnter={() => !isMobile && setHoveredCard(index)}
                            onMouseLeave={() => !isMobile && setHoveredCard(null)}
                            onTouchStart={() => isMobile && setHoveredCard(index)}
                            onTouchEnd={() => isMobile && setHoveredCard(null)}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-r ${feature.color} -z-10 rounded-xl opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl`}
                            ></div>

                            <div className="mb-4 sm:mb-6 lg:mb-8">
                                <div
                                    className={`relative h-14 w-14 ${feature.bgColor} flex items-center justify-center rounded-xl border ${feature.borderColor} transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16 lg:h-20 lg:w-20 lg:rounded-2xl`}
                                >
                                    <div className={feature.iconColor}>{feature.icon}</div>
                                    {hoveredCard === index && (
                                        <div className="absolute -inset-1 animate-ping rounded-2xl bg-blue-200 opacity-50 sm:-inset-2"></div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <h3 className="text-lg font-bold text-black transition-colors group-hover:text-white sm:text-xl lg:text-2xl">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-600 transition-colors group-hover:text-white sm:text-base lg:text-lg">
                                    {feature.description}
                                </p>

                                <div className="space-y-2 sm:space-y-3">
                                    {feature.highlights.map((highlight, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm"
                                        >
                                            <CheckCircle className={`h-3 w-3 ${feature.iconColor} flex-shrink-0 sm:h-4 sm:w-4`} />
                                            <span className="text-gray-700 transition-colors group-hover:text-white">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="absolute right-4 top-4 transform opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
                                <ArrowRight className={`h-4 w-4 ${feature.iconColor} sm:h-5 sm:w-5 lg:h-6 lg:w-6`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;