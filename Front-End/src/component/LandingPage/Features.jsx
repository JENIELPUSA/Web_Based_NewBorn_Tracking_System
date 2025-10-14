import React, { useState, useEffect } from "react";
import { Activity, Baby, BarChart3, BellRing, Heart, Shield, Smartphone, Users, ArrowRight, CheckCircle, TrendingUp, Zap } from "lucide-react";

const Features = () => {
    const [visibleCards, setVisibleCards] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);

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
            { threshold: 0.2 },
        );

        document.querySelectorAll(".feature-card").forEach((card) => {
            observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: <BarChart3 className="h-8 w-8" />,
            title: "Growth Analytics",
            description: "Beautiful interactive charts showing your baby's development progress over time.",
            highlights: ["New born growth charts", "Milestone tracking", "Trend analysis"],
            color: "from-[#7B8D6A]  to-[#7B8D6A]",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            iconColor: "text-emerald-500", // 🟢 Green
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: "Family Collaboration",
            description: "Share access with caregivers, grandparents, and healthcare providers seamlessly and securely.",
            highlights: ["Role-based access", "Care team integration", "Real-time updates", "Secure sharing"],
            color: "from-[#7B8D6A]  to-[#7B8D6A] ",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            iconColor: "text-amber-500", // 🟠 Amber
        },
        {
            icon: <BellRing className="h-8 w-8" />,
            title: "Smart Notifications",
            description: "Intelligent alerts and reminders that learn your routine and send notifications when you need them most.",
            highlights: ["Smart scheduling", "Custom alerts", "Quiet mode", "Emergency notifications"],
            color: "from-[#7B8D6A]  to-[#7B8D6A]",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            iconColor: "text-blue-500", // 🟣 Violet
        },
    ];
    return (
        <section
            id="features"
            className="relative overflow-hidden bg-white py-20"
        >
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute left-20 top-40 h-96 w-96 animate-pulse rounded-full bg-blue-100 blur-3xl"></div>
                <div className="absolute bottom-40 right-20 h-80 w-80 animate-pulse rounded-full bg-blue-50 blur-3xl delay-1000"></div>
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-50 blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-20 text-center">
                    <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-800">
                        <Activity className="h-5 w-5 text-[#7B8D6A] " />
                        Comprehensive Care Features
                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#7B8D6A] "></div>
                    </div>

                    <h2 className="mb-8 text-4xl font-black leading-tight text-black md:text-6xl">
                        Everything You Need for
                        <span className="mt-2 block text-[#7B8D6A] ">Complete Care</span>
                    </h2>

                    <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-700 md:text-2xl">
                        Our platform combines medical-grade monitoring with intuitive design to help you track every aspect of your newborn's
                        development and health.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            data-index={index}
                            className={`feature-card group relative transform cursor-pointer rounded-2xl border border-gray-200 bg-white p-8 shadow-md transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-200 ${
                                visibleCards.includes(index) ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                            }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-r ${feature.color} -z-10 rounded-2xl opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100`}
                            ></div>

                            <div className="mb-8">
                                <div
                                    className={`relative h-20 w-20 ${feature.bgColor} flex items-center justify-center rounded-2xl border ${feature.borderColor} transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <div className={`${feature.iconColor}`}>{feature.icon}</div>
                                    {hoveredCard === index && (
                                        <div className="absolute -inset-2 animate-ping rounded-3xl bg-blue-200 opacity-50"></div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-black transition-colors group-hover:text-white">{feature.title}</h3>
                                <p className="text-lg leading-relaxed text-gray-600 transition-colors group-hover:text-white">
                                    {feature.description}
                                </p>

                                <div className="space-y-3">
                                    {feature.highlights.map((highlight, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <CheckCircle className={`h-4 w-4 ${feature.iconColor} flex-shrink-0`} />
                                            <span className="text-gray-700 transition-colors group-hover:text-white">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="absolute right-8 top-8 transform opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                                <ArrowRight className={`h-6 w-6 ${feature.iconColor}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
