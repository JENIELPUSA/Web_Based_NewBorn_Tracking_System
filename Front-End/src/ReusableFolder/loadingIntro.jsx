import { motion } from "framer-motion";
import { Syringe } from "lucide-react"; // Import Syringe icon from Lucide

const VaccineLoading = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center space-y-8 text-white">
        {/* Syringe Icon */}
        <motion.div
          className="relative text-6xl"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <Syringe />

          {/* Syringe Needle and Plunger Animation */}
          <motion.div
            className="absolute left-1/2 top-16 h-16 w-6 origin-bottom"
            style={{ transform: "translateX(-50%)" }}
            animate={{
              y: [0, 20, 0],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
          </motion.div>
        </motion.div>

        {/* Liquid Drops Animation */}
        <motion.div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
                opacity: [0, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.p
          className="text-xl font-medium tracking-wide"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Administering Vaccine...
        </motion.p>
      </div>
    </div>
  );
};

export default VaccineLoading;
