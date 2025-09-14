import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Heart, Shield, Award, TrendingUp, CheckCircle } from "lucide-react";
import image1 from "../../assets/newborn1.jpg";
import image2 from "../../assets/newborn2.jpg";
import image3 from "../../assets/newborn3.jpg";
import image4 from "../../assets/newborn4.jpg";

const slides = [
    {
        image: image1,
        alt: "A parent gently holding a baby's hand.",
    },
    {
        image: image2,
        alt: "A baby smiling happily while lying down.",
    },
    {
        image: image3,
        alt: "A baby being measured by a healthcare provider.",
    },
    {
        image: image4,
        alt: "A parent tracking their baby's health on a smartphone.",
    },
];

const reasons = [
    {
        icon: <Heart className="h-6 w-6 text-blue-600" />,
        title: "Early Detection of Issues",
        description: "Regular monitoring helps identify any health or development concerns early, allowing for timely intervention.",
    },
    {
        icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
        title: "Track Growth and Development",
        description: "Monitor your baby's weight, height, and milestones to ensure they are growing well and on the right track.",
    },
    {
        icon: <Shield className="h-6 w-6 text-blue-600" />,
        title: "Better Doctor Communication",
        description: "Provide accurate data to your pediatrician during check-ups, enabling them to offer more informed care.",
    },
    {
        icon: <Award className="h-6 w-6 text-blue-600" />,
        title: "Peace of Mind",
        description: "Reduce worry by keeping a complete health record of your baby, giving you confidence as a parent.",
    },
];

const CarouselSection = () => {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef(null);
    const totalSlides = slides.length;

    const nextSlide = () => {
        setCurrent((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    };

    useEffect(() => {
        if (!isHovered) {
            intervalRef.current = setInterval(nextSlide, 5000);
        }
        return () => intervalRef.current && clearInterval(intervalRef.current);
    }, [isHovered]);

    const handleMouseEnter = () => {
        setIsHovered(true);
        intervalRef.current && clearInterval(intervalRef.current);
    };

    const handleMouseLeave = () => setIsHovered(false);

    return (
        <section className="relative overflow-hidden bg-blue-50 py-20">
            <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
                <div className="flex w-full flex-col items-center gap-16 lg:flex-row lg:gap-8">
                    {/* Left side: Image Carousel */}
                    <div
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 lg:w-1/2"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${current * 100}%)` }}
                        >
                            {slides.map((slide, index) => (
                                <img
                                    key={index}
                                    src={slide.image}
                                    alt={slide.alt}
                                    className="h-[500px] w-full flex-shrink-0 object-cover"
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/30 p-2 text-white hover:bg-white/50 focus:outline-none"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/30 p-2 text-white hover:bg-white/50 focus:outline-none"
                        >
                            <ArrowRight className="h-6 w-6" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrent(index)}
                                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                        current === index ? "w-6 bg-blue-600" : "bg-gray-300"
                                    }`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Importance of Tracking */}
                    <div className="flex w-full flex-col justify-center lg:w-1/2">
                        <div className="space-y-6 text-center lg:text-left">
                            <h2 className="text-3xl font-bold leading-tight text-black md:text-4xl">
                                Why Monitoring Your Baby's Health is Important
                            </h2>
                            <p className="text-lg leading-relaxed text-gray-700">
                                Using BabyTracker goes beyond organizing data. It gives you the tools to make informed decisions about your baby's
                                health, weight, and height.
                            </p>
                        </div>
                        <div className="mt-12 space-y-8">
                            {reasons.map((reason, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                                        {reason.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-black">{reason.title}</h3>
                                        <p className="mt-2 text-gray-600">{reason.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CarouselSection;
