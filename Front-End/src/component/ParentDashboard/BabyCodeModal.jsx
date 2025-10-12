import React, { useState } from "react";

const BabyCodeModal = ({ isOpen, onClose, onSave }) => {
  const [babyCodeNumber, setBabyCodeNumber] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!babyCodeNumber.trim()) {
      alert("Please enter a valid Baby Code Number");
      return;
    }
    onSave(babyCodeNumber);
    setBabyCodeNumber("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Enter Baby Code Number</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={babyCodeNumber}
            onChange={(e) => setBabyCodeNumber(e.target.value)}
            placeholder="e.g. BBN-2025-001"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BabyCodeModal;
