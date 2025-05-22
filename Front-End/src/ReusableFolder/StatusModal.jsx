import { motion } from "framer-motion";

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirmDelete,
}) {
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full relative text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-red-200"
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl"
          >
            ⚠️
          </motion.div>
        </motion.div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          Are you sure?
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          This action cannot be undone. Are you sure you want to delete this item?
        </p>
    
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-300 transition duration-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-500 transition duration-300 focus:outline-none"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  ) : null;
}