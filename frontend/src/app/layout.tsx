import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatOps Control – Automatyzuj AWS przez Slacka",
  description: "Zarządzaj infrastrukturą AWS bez wychodzenia ze Slacka.",
};

const Navbar = () => (
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/60">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-semibold text-gray-900">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          ChatOps
        </span>
      </div>
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
        <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Funkcje</a>
        <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition">Cennik</a>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-indigo-600 transition">Zaloguj się</button>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition">
          Zarejestruj się
        </button>
      </div>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="bg-gradient-to-b from-white via-gray-50 to-gray-100 border-t border-gray-200 mt-16">
    <div className="container mx-auto px-6 py-10 text-center text-gray-500 text-sm">
      <p className="mb-2">
        &copy; {new Date().getFullYear()} <span className="font-medium text-gray-700">ChatOps Control</span>. Wszelkie prawa zastrzeżone.
      </p>
    </div>
  </footer>
);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body className="font-sans bg-gradient-to-br from-gray-50 to-white text-gray-800 antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
