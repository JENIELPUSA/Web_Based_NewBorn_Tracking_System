import React from "react";
import { Users, CheckCircle, Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: Twitter, href: "#twitter" },
    { icon: Facebook, href: "#facebook" },
    { icon: Instagram, href: "#instagram" },
    { icon: Linkedin, href: "#linkedin" },
  ];

  return (
    <footer className="relative bg-blue-50 py-12 sm:py-16">
      {/* 🔹 Blue line sa itaas */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#7B8D6A] rounded-t"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-start lg:justify-between lg:gap-12 lg:text-left">
          {/* Brand Section */}
          <div className="flex flex-col items-center gap-4 lg:items-start lg:max-w-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B8D6A] shadow-lg sm:h-12 sm:w-12 sm:rounded-2xl">
                <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black sm:text-2xl">NeoCare System</h3>
                <p className="text-[#7B8D6A] font-semibold text-sm sm:text-base">Newborn Health Monitoring</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm sm:text-base">
              Monitor your baby's health, weight, and height with{" "}
              <span className="font-semibold text-[#7B8D6A]">accuracy and confidence</span>.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {socialLinks.map((social, idx) => {
              const SocialIcon = social.icon;
              return (
                <a
                  key={idx}
                  href={social.href}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-110 sm:rounded-xl sm:p-2"
                >
                  <SocialIcon className="h-4 w-4 text-gray-700 sm:h-5 sm:w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Legal Section */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center sm:mt-12">
          <div className="flex flex-col items-center gap-2 text-gray-600 text-xs sm:flex-row sm:justify-center sm:gap-4 sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#7B8D6A] sm:h-4 sm:w-4" />
              <span>© 2025 NeoCare System. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;