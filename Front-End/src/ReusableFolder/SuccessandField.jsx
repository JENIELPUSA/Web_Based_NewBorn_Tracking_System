import { useState } from "react";
import { motion } from "framer-motion";

export default function StatusModal({ isOpen, onClose, status = "success" }) {
  const isSuccess = status === "success";

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full ${
            isSuccess ? "bg-green-200" : "bg-red-200"
          }`}
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl"
          >
            {isSuccess ? "✅" : "❌"}
          </motion.div>
        </motion.div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">
          {isSuccess ? "Successfully Accepted!" : "Action Failed!"}
        </h2>

        <p className="text-gray-600 text-sm mb-6">
          {isSuccess
            ? "Your request has been successfully accepted and processed."
            : "Oops! Something went wrong. Please try again later."}
        </p>
        <button
          onClick={onClose}
          className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-pink-500 transition duration-300 w-full focus:outline-none"
        >
          Got it
        </button>
      </motion.div>
    </div>
  ) : null;
}