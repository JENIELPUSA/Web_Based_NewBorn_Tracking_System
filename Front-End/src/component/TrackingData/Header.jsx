import React from 'react';
import { Heart } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-[#7B8D6A] text-white shadow-lg">
            <div className="max-w-6xl mx-auto px-3 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-3 md:mb-0">
                        <div className="bg-white p-2 rounded-lg mr-3">
                            <Heart className="w-6 h-6 text-[#7B8D6A]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">NeoCare System</h1>
                            <p className="text-blue-100 text-sm">Newborn Health Monitoring</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;