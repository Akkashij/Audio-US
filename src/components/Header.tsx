'use client';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const navLinks = [
    { label: 'Home', href: '/main' },
    { label: 'Products', href: '/products' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <header
      className="w-full text-white px-10 py-5 flex items-center justify-between rounded-t-2xl border-b border-white/30 backdrop-blur-2xl bg-white/10"
      style={{
        minHeight: 72,
        background: 'linear-gradient(135deg, #1e2746 0%, #263159 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        borderBottom: '2px solid rgba(255,255,255,0.25)'
      }}
    >
      {/* Left: Brand name only */}
      <div className="font-extrabold text-2xl tracking-tight">AudioUS</div>

      {/* Center: Navigation links with a single down icon, active state, and animation */}
      <nav className="flex-1 flex justify-center gap-12">
        {navLinks.map((link) =>
          (link.label === 'Pricing' || link.label === 'Blog' || link.label === 'Products' || link.label === 'Home') ? (
            <Link
              key={link.label}
              href={link.href}
              className={`relative px-7 py-2 rounded-full font-medium text-lg flex items-center gap-2 transition-all duration-200 group
                ${link.href === pathname ? 'bg-cyan-400 text-[#1e2746] shadow-lg scale-105' : 'hover:bg-white/20 hover:text-cyan-200'}
              `}
              style={{ boxShadow: link.href === pathname ? '0 2px 12px 0 rgba(31, 38, 135, 0.10)' : undefined }}
            >
              <span className="mr-2 group-hover:scale-110 transition-transform duration-200">
                <ChevronDownIcon className="w-5 h-5" />
              </span>
              <span className="transition-all duration-200 group-hover:scale-110 group-active:scale-95">
                {link.label}
              </span>
            </Link>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className={`relative px-7 py-2 rounded-full font-medium text-lg flex items-center gap-2 transition-all duration-200 group
                ${link.href === pathname ? 'bg-cyan-400 text-[#1e2746] shadow-lg scale-105' : 'hover:bg-white/20 hover:text-cyan-200'}
              `}
              style={{ boxShadow: link.href === pathname ? '0 2px 12px 0 rgba(31, 38, 135, 0.10)' : undefined }}
            >
              <span className="mr-2 group-hover:scale-110 transition-transform duration-200">
                <ChevronDownIcon className="w-5 h-5" />
              </span>
              <span className="transition-all duration-200 group-hover:scale-110 group-active:scale-95">
                {link.label}
              </span>
            </a>
          )
        )}
      </nav>

      {/* Right: Profile icon button */}
      <div className="flex items-center gap-4">
        <button
          className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-[#f9f6ef] hover:bg-cyan-100 transition-colors"
          aria-label="User Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}