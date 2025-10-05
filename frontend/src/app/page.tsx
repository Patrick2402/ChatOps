"use client";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
    >
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
        Automatyzuj <span className="text-indigo-600">AWS</span> przez Slacka
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Uruchamiaj komendy, monitoruj infrastrukturę i reaguj na alerty — wszystko w jednym miejscu.
      </p>
      <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition">
        Zacznij teraz
      </button>
    </motion.section>
  );
}
