import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="w-full bg-gradient-to-r from-[#1e2746] to-[#263159] text-white pt-12 pb-6 px-4 mt-auto border-t border-white/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Section */}
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2 mb-2">
            <Image src="/icons/audio-us-logo.png" alt="AudioUS Logo" width={36} height={36} className="rounded-xl" />
            <span className="font-extrabold text-2xl tracking-tight">AudioUS</span>
          </div>
          <span className="text-sm text-blue-100">Empowering audio collaboration for modern teams. Secure, AI-powered, and seamless.</span>
        </div>
        {/* Navigation Links */}
        <div>
          <h4 className="font-bold mb-2 text-blue-200">Navigation</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/main" className="hover:underline hover:text-cyan-300">Home</Link></li>
            <li><Link href="/products" className="hover:underline hover:text-cyan-300">Products</Link></li>
            <li><Link href="/pricing" className="hover:underline hover:text-cyan-300">Pricing</Link></li>
            <li><Link href="/blog" className="hover:underline hover:text-cyan-300">Blog</Link></li>
            <li><Link href="/contact" className="hover:underline hover:text-cyan-300">Contact</Link></li>
          </ul>
        </div>
        {/* Newsletter Signup */}
        <div>
          <h4 className="font-bold mb-2 text-blue-200">Newsletter</h4>
          <form className="flex flex-col gap-2">
            <input type="email" placeholder="Your email" className="rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 font-semibold transition">Subscribe</button>
          </form>
          <span className="text-xs text-blue-100 mt-1 block">Get the latest updates and news.</span>
        </div>
        {/* Contact & Social */}
        <div className="flex flex-col gap-2 items-start md:items-end">
          <h4 className="font-bold mb-2 text-blue-200">Contact</h4>
          <span className="text-sm">Email: <a href="mailto:contact@audio-us.com" className="underline hover:text-cyan-300">contact@audio-us.com</a></span>
          <div className="flex gap-3 mt-2">
            <a href="https://linkedin.com/company/your-company" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.003 3.604 4.605v5.591zm-7-10h-3v10h3v-10z" /></svg></a>
            <a href="https://github.com/your-org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-8 pt-4 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
        <div className="text-xs text-blue-100">&copy; {year ?? ''} AudioUS. All rights reserved.</div>
        <div className="flex gap-4 text-xs text-blue-100">
          <Link href="/privacy" className="hover:underline hover:text-cyan-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline hover:text-cyan-300">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
} 