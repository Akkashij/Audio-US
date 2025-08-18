'use client';

import { useEffect } from 'react';

export default function RedirectTempPage() {
  useEffect(() => {
    // Redirect đến main sau 1 giây để đảm bảo cookie được set xong
    setTimeout(() => {
      window.location.href = '/main';
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white/80 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="mb-4">
          <span className="block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
        </div>
        <p className="text-lg font-semibold text-gray-700">Redirecting to main page...</p>
      </div>
    </div>
  );
}
