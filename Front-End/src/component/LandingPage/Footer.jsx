import React from "react";
import { Users, CheckCircle, Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: Twitter, href: "#twitter" },
    { icon: Facebook, href: "#facebook" },
    { icon: Instagram, href: "#instagram" },
    { icon: Linkedin, href: "#linkedin" },
    { icon: Github, href: "#github" },
  ];

  return (
    <footer className="relative bg-blue-50 py-16">
      {/* 🔹 Blue line sa itaas */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#7B8D6A] rounded-t"></div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Brand Section */}
        <div className="flex flex-col items-center lg:items-start gap-6 mb-12 text-center lg:text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7B8D6A] shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">NeoCare System</h3>
              <p className="text-[#7B8D6A] font-semibold">Newborn Health Monitoring</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-md">
            Monitor your baby's health, weight, and height with{" "}
            <span className="font-semibold text-[#7B8D6A]">accuracy and confidence</span>.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center lg:justify-start gap-4 mb-8">
          {socialLinks.map((social, idx) => {
            const SocialIcon = social.icon;
            return (
              <a
                key={idx}
                href={social.href}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-transform hover:scale-110"
              >
                <SocialIcon className="h-5 w-5 text-gray-700" />
              </a>
            );
          })}
        </div>

        {/* Legal Section */}
        <div className="border-t border-gray-200 pt-6 text-center text-gray-600 text-sm">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
            <CheckCircle className="h-4 w-4 text-[#7B8D6A]" />
            <span>© 2025 NeoCare System. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
