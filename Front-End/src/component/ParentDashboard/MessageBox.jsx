import React from 'react';

const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center justify-between z-50 animate-fade-in" style={{
      backgroundColor: type === 'error' ? '#ef4444' : '#22c55e',
      color: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }}>
      <p className="font-semibold text-lg">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        aria-label="Close message"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default MessageBox;