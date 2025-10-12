import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, User, Heart, Shield, Activity } from "lucide-react";
import banner1 from "../../assets/imagebanner1.png";
import banner2 from "../../assets/imagebanner3.png";
import banner3 from "../../assets/imagebanner2.png";
import banner4 from "../../assets/imagebanner5.png";
import { AuthContext } from "../../contexts/AuthContext";

function NewBornTrackingBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { role } = useContext(AuthContext);

    const slides = [
        {
            icon: User,
            title: `Welcome ${role}`,
            subtitle: "Your Dashboard",
            bgImage: banner2, 
            overlayColor: "bg-gradient-to-br from-pink-400/20 to-rose-500/50",
            description: "Welcome to your dashboard. You can freely explore more features.",
        },
        {
            icon: User,
            title: "Welcome Little One",
            subtitle: "Comprehensive newborn care tracking",
            bgImage: banner1,
            overlayColor: "bg-gradient-to-br from-pink-400/20 to-rose-500/50",
            description: "Monitor your baby's health journey from day one",
        },
        {
            icon: Heart,
            title: "Care with Love",
            subtitle: "Track vital signs & wellness",
            bgImage: banner3,
            overlayColor: "bg-gradient-to-br from-purple-400/20 to-pink-500/30",
            description: "Real-time health monitoring for peace of mind",
        },
        {
            icon: Activity,
            title: "Growth Milestones",
            subtitle: "Document every precious moment",
            bgImage: banner1,
            overlayColor: "bg-gradient-to-br from-blue-400/20 to-cyan-500/30",
            description: "Track height and weight, and overall development",
        },
        {
            icon: Shield,
            title: "Safe & Secure",
            subtitle: "Protected health records",
            bgImage: banner4,
            overlayColor: "bg-gradient-to-br from-orange-400/20 to-emerald-500/30",
            description: "Keep your baby's data safe and private"
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const current = slides[currentSlide];
    const IconComponent = current.icon;

    return (
        <div className="relative w-full">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                style={{ minHeight: "320px" }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="relative h-full w-full"
                        style={{
                            backgroundImage: `url(${current.bgImage})`,
                            backgroundSize: "100% 100%",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            minHeight: "320px",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        {/* Overlay gradient */}
                        <div className={`absolute inset-0 ${current.overlayColor}`} />

                        {/* Floating circles & hearts */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl"
                        />

                        {/* Floating hearts decoration */}
                        <motion.div
                            animate={{ y: [-20, -40, -20], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute right-20 top-10 text-white opacity-30"
                        >
                            <Heart
                                className="h-8 w-8"
                                fill="currentColor"
                            />
                        </motion.div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-white md:flex-row md:gap-8 md:p-12">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="flex-shrink-0"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                "0 0 20px rgba(255,255,255,0.3)",
                                                "0 0 40px rgba(255,255,255,0.6)",
                                                "0 0 20px rgba(255,255,255,0.3)",
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="rounded-full bg-white/20 p-6 backdrop-blur-sm"
                                    >
                                        <IconComponent
                                            className="h-16 w-16 text-white md:h-20 md:w-20"
                                            strokeWidth={1.5}
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Text */}
                            <div className="flex-1 text-center drop-shadow-lg md:text-left">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="mb-2 text-4xl font-bold md:text-5xl lg:text-6xl"
                                >
                                    {current.title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="mb-3 text-xl font-light opacity-95 md:text-2xl"
                                >
                                    {current.subtitle}
                                </motion.p>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="text-base opacity-90 md:text-lg"
                                >
                                    {current.description}
                                </motion.p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 origin-left bg-white/40"
                            style={{ width: "100%" }}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${
                                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
                            }`}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default NewBornTrackingBanner;
