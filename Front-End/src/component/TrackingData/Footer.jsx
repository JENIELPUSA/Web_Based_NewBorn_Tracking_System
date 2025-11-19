import React from 'react';
import { Heart, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6 mt-8">
            <div className="max-w-6xl mx-auto px-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-[#7B8D6A]" />
                            NeoCare System
                        </h3>
                        <p className="text-gray-300 text-sm">
                            A comprehensive system for tracking family health, 
                            vaccinations, and child growth.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3">Contact Info</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-300">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>Naval Biliran</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>(02) 8123-4567</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>neo@CareSystem.ph</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4 text-center">
                    <p className="text-gray-400 text-sm">
                        © 2025 NeoCare System. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;