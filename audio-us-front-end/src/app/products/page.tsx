'use client';

import Header from '../../components/Header';
import Image from 'next/image';
import { useEffect } from 'react';

const founders = [
  {
    name: 'Nguyen Dong Hai',
    role: 'CEO & Co-founder',
    image: '/icons/ceo.png',
    bio: 'Startup CEO passionate about turning product ideas into real-world impact.',
  },
  {
    name: 'Mai Chien Vi Thien',
    role: 'CTO & Co-founder',
    image: '/icons/cto.png',
    bio: 'CTO driving innovation in AI-powered product development at startup scale.',
  },
  {
    name: 'Tran Duc Trung',
    role: 'Head of AI & Co-founder',
    image: '/icons/ai.png',
    bio: 'Leading AI strategy and productization from cutting-edge models to production-ready solutions.',
  },
];

const features = [
  {
    title: 'Join Discord Meetings Seamlessly',
    description:
      'AudioUS allows you to join your Discord meetings with a single click. No complicated setup—just connect your Discord account and instantly collaborate with your team in a familiar environment.',
    image: '/window.svg',
  },
  {
    title: 'Audio to Text Transcription',
    description:
      'Our advanced speech-to-text engine transcribes your meetings in real time, making it easy to review, search, and share meeting notes. Never miss an important detail again.',
    image: '/vercel.svg',
  },
  {
    title: 'Real-Time Monitoring & Insights',
    description:
      'Monitor your meetings as they happen. AudioUS provides real-time analytics and dashboards so you can track participation, engagement, and key discussion points as they unfold.',
    image: '/globe.svg',
  },
  {
    title: 'AI Agent Integration (Gemini)',
    description:
      'Invite our AI agent, powered by Gemini, into your meetings. Ask questions, get instant summaries, and automate follow-ups—all within your audio chat. The AI agent is always ready to assist your team.',
    image: '/next.svg',
  },
  {
    title: 'Multi-Platform Support',
    description:
      'AudioUS works across web, desktop, and mobile, ensuring you can join and manage meetings from anywhere, on any device.',
    image: '/file.svg',
  },
  {
    title: 'End-to-End Encryption',
    description:
      'Your conversations are protected with industry-leading end-to-end encryption, keeping your data private and secure.',
    image: '/public/icons/discord-icon.svg',
  },
  {
    title: 'Customizable Meeting Rooms',
    description:
      'Create and personalize meeting rooms with custom branding, access controls, and integrations tailored to your team’s workflow.',
    image: '/public/icons/discord-logo.svg',
  },
  {
    title: 'Automated Meeting Summaries',
    description:
      'Receive AI-generated summaries and action items after every meeting, so your team always stays on track.',
    image: '/public/icons/audio-us-logo.png',
  },
];

export default function ProductsPage() {
  useEffect(() => {
    // Animate features on scroll (simple fade-in)
    const featureCards = document.querySelectorAll('.feature-card');
    const onScroll = () => {
      featureCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          card.classList.add('opacity-100', 'translate-y-0');
        }
      });
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#1e2746] to-[#263159]">
      <div className="sticky top-0 left-0 w-full z-20">
        <Header/>
      </div>
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-pink-500/30 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
            <path fill="#a5b4fc" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
        <div className="flex flex-col items-center z-10">
          <Image src="/icons/audio-us-logo.png" alt="AudioUS Logo" width={80} height={80} className="mb-4 rounded-2xl shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">AudioUS Product</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-1 text-center max-w-2xl">AudioUS is a next-generation audio collaboration platform designed to empower teams with seamless communication, AI-powered features, and secure, scalable infrastructure. Experience the future of remote teamwork with AudioUS.</p>
        </div>
      </section>
      {/* Product Features Section */}
      <section className="flex flex-col items-center px-4 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Key Features</h2>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="feature-card opacity-0 translate-y-8 bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-4 hover:shadow-2xl transition-all duration-700 ease-out"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="flex-shrink-0">
                <Image src={feature.image} alt={feature.title} width={64} height={64} className="rounded-xl bg-blue-100 p-2" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Call to Action */}
      <section className="flex flex-col items-center px-4 mb-16">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl p-8 flex flex-col items-center w-full max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to experience AudioUS?</h2>
          <p className="text-blue-100 mb-4 text-center">Sign up today and transform the way your team collaborates with audio, AI, and real-time insights.</p>
          <a href="/pricing" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg shadow hover:bg-blue-100 transition text-lg">See Pricing</a>
        </div>
      </section>
      {/* Founders Section */}
      <section className="flex flex-col items-center px-4 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Meet the Founders</h2>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((founder, idx) => (
            <div key={idx} className="bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-shadow">
              <Image src={founder.image} alt={founder.name} width={72} height={72} className="rounded-full mb-3 border-4 border-blue-200 shadow object-cover aspect-square overflow-hidden" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">{founder.name}</h3>
              <p className="text-blue-500 font-semibold mb-2">{founder.role}</p>
              <p className="text-gray-600 text-sm">{founder.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 