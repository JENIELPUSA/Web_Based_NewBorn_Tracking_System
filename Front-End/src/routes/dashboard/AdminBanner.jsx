import { motion } from "framer-motion";
import { LayoutDashboard, Rocket } from "lucide-react"; // Example icons, install 'lucide-react'
import { AuthContext } from "../../contexts/AuthContext";
import { useContext } from "react";
function AdminBanner() {
    const {role}=useContext(AuthContext)
  return (
    <motion.div
  initial={{ scale: 0.95, opacity: 0, rotateX: 30 }}
  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  whileHover={{ scale: 1.05, rotateY: 10, filter: "brightness(1.3) drop-shadow(0 0 10px rgba(255, 69, 0, 0.8))" }}
  whileTap={{ scale: 0.9, rotateZ: -5 }}
  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-orange-700 p-8 text-white shadow-[0_4px_10px_rgba(255,69,0,0.5)]"
>
      {/* Background shape/effect */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "0%" }}
        transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
        className="absolute -right-1/4 -top-1/4 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"
      ></motion.div>

      <div className="relative z-10 flex items-center gap-4">
        <motion.div
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: 360, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <Rocket className="h-12 w-12 text-white" /> {/* Use a more dynamic icon */}
        </motion.div>
        <div>
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7, type: "spring", stiffness: 120 }}
            className="text-4xl font-extrabold tracking-tight md:text-5xl"
          >
            Welcome, {role}
          </motion.h1>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7, type: "spring", stiffness: 120 }}
            className="mt-2 text-xl font-light opacity-95 md:text-2xl"
          >
            Your command center awaits.
          </motion.p>
        </div>
      </div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
        className="mt-4 h-1 w-full rounded-full bg-white opacity-20"
      ></motion.div>
    </motion.div>
  );
}

export default AdminBanner;