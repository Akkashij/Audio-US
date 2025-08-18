'use client';

import Header from '../../components/Header';
import Link from 'next/link';

const blogPosts = [
  {
    title: 'Welcome to AudioUS: Revolutionizing Audio Collaboration',
    date: '2024-06-01',
    excerpt: 'Discover how AudioUS is changing the way teams communicate and collaborate with advanced audio chat and AI-powered features.',
    slug: 'welcome-to-audio-us',
  },
  {
    title: 'How to Get Started with AudioUS',
    date: '2024-06-02',
    excerpt: 'A step-by-step guide to setting up your first meeting, inviting team members, and making the most of AudioUS.',
    slug: 'get-started-with-audio-us',
  },
  {
    title: 'Pro vs Free: Which AudioUS Plan is Right for You?',
    date: '2024-06-03',
    excerpt: 'We break down the features of our Free, Pro, and Ultimate plans to help you choose the best fit for your needs.',
    slug: 'pro-vs-free-audio-us',
  },
  {
    title: 'Integrating AI Agents into Your AudioUS Workflow',
    date: '2024-06-04',
    excerpt: 'Learn how to leverage AI agents to automate tasks, summarize meetings, and boost productivity in AudioUS.',
    slug: 'ai-agents-in-audio-us',
  },
  {
    title: 'AudioUS Security: Keeping Your Conversations Safe',
    date: '2024-06-05',
    excerpt: 'A look at the security features and best practices that keep your audio meetings private and secure.',
    slug: 'audio-us-security',
  },
  {
    title: 'Tips for Productive Remote Meetings with AudioUS',
    date: '2024-06-06',
    excerpt: 'Maximize your remote team’s productivity with these actionable tips for using AudioUS.',
    slug: 'productive-remote-meetings',
  },
  {
    title: 'What’s New in AudioUS: June 2024 Update',
    date: '2024-06-07',
    excerpt: 'Check out the latest features and improvements in the June 2024 AudioUS update.',
    slug: 'audio-us-june-update',
  },
  {
    title: 'User Stories: How Teams Succeed with AudioUS',
    date: '2024-06-08',
    excerpt: 'Real stories from teams who improved their workflow and communication with AudioUS.',
    slug: 'audio-us-user-stories',
  },
];

export default function BlogPage() {
  return (
    <div className="flex-1 flex flex-col w-full bg-gradient-to-br from-[#1e2746] to-[#263159]">
      <div className="sticky top-0 left-0 w-full z-20">
        <Header />
      </div>
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-pink-500/30 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
            <path fill="#a5b4fc" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2 z-10">AudioUS Blog</h1>
        <p className="text-lg md:text-xl text-blue-100 mb-1 z-10">Insights, updates, and tips for better audio collaboration</p>
      </section>
      <main className="flex-1 flex flex-col items-center px-2 pb-12">
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {blogPosts.map((post, idx) => (
            <div
              key={post.slug}
              className="group bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border-t-4 border-blue-400/0 hover:border-blue-400 relative overflow-hidden min-h-[180px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 group-hover:bg-pink-400 transition-colors"></span>
                <span className="text-xs text-blue-500 font-semibold">{new Date(post.date).toLocaleDateString('en-US')}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h2>
              <p className="text-gray-600 mb-3 text-sm line-clamp-3">{post.excerpt}</p>
              <Link
                href="#"
                className="mt-auto inline-block text-blue-600 font-semibold hover:underline hover:text-pink-500 transition-colors text-sm"
              >
                Read More
              </Link>
              <div className="absolute right-4 bottom-4 opacity-10 text-5xl pointer-events-none select-none">
                {String.fromCodePoint(0x1F4D6 + idx)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 