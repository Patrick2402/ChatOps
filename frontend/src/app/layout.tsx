"use client";

import type { Metadata } from "next";
import "./globals.css";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show navbar on dashboard
  if (pathname === "/dashboard") return null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-xl">🚀</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              ChatOps
            </span>
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a
              href="#features"
              className="text-gray-600 hover:text-indigo-600 transition-colors relative group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all"></span>
            </a>
            <a
              href="#demo"
              className="text-gray-600 hover:text-indigo-600 transition-colors relative group"
            >
              Demo
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all"></span>
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-indigo-600 transition-colors relative group"
            >
              Prices
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all"></span>
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 transition-colors relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all"></span>
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Sign in
            </motion.a>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all font-medium"
            >
              Sign up
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#demo"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Demo
                </a>
                <a
                  href="#pricing"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Prices
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <a
                    href="/login"
                    className="block text-center text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Sign in
                  </a>
                  <a
                    href="/register"
                    className="block text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl shadow-lg font-medium"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

const Footer = () => {
  const pathname = usePathname();

  // Don't show footer on dashboard
  if (pathname === "/dashboard") return null;

  return (
    <footer className="bg-gradient-to-b from-white via-gray-50 to-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">🚀</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                ChatOps Control
              </span>
            </div>
            <p className="text-gray-600 max-w-md mb-4">
             Automate AWS infrastructure management directly from Slack.
             Simply, fast i safe.
            </p>
            <div className="flex gap-3">
              {["twitter", "github", "linkedin", "discord"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-gray-200 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-all group"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Products</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Prices</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Demo</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Comapny</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Career</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-medium text-gray-700">ChatOps Control</span>. 
            All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Policy Privacy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms and Conditions
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <head>
        <title>ChatOps Control – Automate AWS with Slack</title>
        <meta name="description" content="Zarządzaj infrastrukturą AWS bez wychodzenia ze Slacka." />
      </head>
      <body className="font-sans antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}