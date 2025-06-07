// hooks/useIsMobile.js
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // You can adjust this breakpoint as needed

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        // Set initial value
        checkIsMobile();

        // Add event listener for window resize
        window.addEventListener("resize", checkIsMobile);

        // Clean up the event listener
        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    return isMobile;
};