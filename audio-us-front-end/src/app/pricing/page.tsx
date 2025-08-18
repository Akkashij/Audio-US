'use client';

import Header from '../../components/Header';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: [
      'Basic features',
      'Community support',
      'Limited usage',
    ],
    button: { label: 'Get Started', href: '#', style: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    features: [
      'All Free features',
      'Priority support',
      'Increased usage limits',
      'Advanced tools',
    ],
    button: { label: 'Choose Pro', href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '#', style: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600' },
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Ultimate',
    price: 'Custom',
    period: '',
    features: [
      'All Pro features',
      'Dedicated account manager',
      'Custom integrations',
      'Enterprise support',
    ],
    button: { label: 'Contact Us', href: '/contact', style: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600' },
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#1e2746] to-[#263159]">
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
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2 z-10">Pricing Plans</h1>
        <p className="text-lg md:text-xl text-blue-100 mb-1 z-10">Find the perfect plan for your team</p>
      </section>
      <main className="flex-1 flex flex-col items-center px-2">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col items-center rounded-2xl shadow-lg p-4 bg-white/90 border-t-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.highlight ? 'border-blue-500 scale-105 z-10' : 'border-transparent'} min-h-[260px]`}
            >
              {plan.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow z-20">{plan.badge}</span>
              )}
              <h2 className="text-lg font-bold text-gray-800 mb-2">{plan.name}</h2>
              <div className="flex items-end mb-3">
                <span className={`text-3xl font-extrabold ${plan.highlight ? 'text-blue-600' : 'text-blue-500'}`}>{plan.price}</span>
                <span className="text-base font-normal text-gray-500 ml-1">{plan.period}</span>
              </div>
              <ul className="mb-4 text-gray-600 space-y-1 text-sm w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-blue-400">•</span> {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.button.href}
                target={plan.button.href.startsWith('http') ? '_blank' : undefined}
                rel={plan.button.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`mt-auto w-full text-center font-semibold px-4 py-2 rounded-lg transition ${plan.button.style} shadow hover:scale-105 text-sm`}
              >
                {plan.button.label}
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 