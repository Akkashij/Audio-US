'use client';

import { useState } from 'react';

interface Props {
  meetingId: string;
  setMeetingId: (v: string) => void;
  userId: string;
  setUserId: (v: string) => void;
  onStart: () => void;
}

export default function LoginBox({ meetingId, setMeetingId, userId, setUserId, onStart }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    if (!meetingId.trim() || !userId.trim()) {
      setError('Please enter both Room ID and User ID.');
      return;
    }
    setError(null);
    onStart();
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="max-w-xs w-full rounded-2xl p-6 flex flex-col gap-6 border border-[#4b5c8a] shadow-2xl bg-white/5 backdrop-blur-md" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <h2 className="text-2xl font-extrabold text-white text-center mb-2 flex items-center justify-center gap-2">
          <span role="img" aria-label="microphone"></span> Join a Chat Room
        </h2>
        <div className="flex flex-col gap-4">
          <input
            className="p-3 rounded-lg text-base bg-white/10 border border-[#4b5c8a] focus:border-blue-400 focus:ring-2 focus:ring-blue-300 text-white placeholder-gray-300 outline-none transition backdrop-blur-md"
            placeholder="Room ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
          <input
            className="p-3 rounded-lg text-base bg-white/10 border border-[#4b5c8a] focus:border-blue-400 focus:ring-2 focus:ring-blue-300 text-white placeholder-gray-300 outline-none transition backdrop-blur-md"
            placeholder="Your User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button
            className="mt-2 w-full py-3 rounded-lg bg-[#4f6af1] hover:bg-[#3b4ed8] text-white font-bold text-base tracking-wide shadow-lg transition flex items-center justify-center gap-2"
            onClick={handleStart}
          >
            <span role="img" aria-label="rocket"></span> Enter Chat Room
          </button>
          {error && (
            <div className="mt-2 text-red-400 text-sm text-center">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
