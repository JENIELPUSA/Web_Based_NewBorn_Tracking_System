import React, { useEffect, useState } from 'react';

function UnderMaintenance() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`
      min-h-screen flex items-center justify-center bg-gray-100 p-4 text-center
      transition-opacity duration-1000 ease-out
      ${isVisible ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="
        bg-white rounded-lg shadow-xl p-8 max-w-md w-full
        transform transition-transform duration-700 ease-out
        scale-95 hover:scale-100
      ">
        <div className="
          text-6xl mb-6 flex items-center justify-center
          animate-spin-slow
        ">
          ⚙️
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Under Maintenance</h1>
        <p className="text-lg text-gray-600 mb-2">
          We're currently performing some essential updates to our website.
          We'll be back online shortly!
        </p>
        <p className="text-md text-gray-500">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
}

export default UnderMaintenance;