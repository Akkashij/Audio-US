import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface AiAgentProps {
  userId?: string;
  meetingId?: string;
  context?: string;
}

const Ai_Agent: React.FC<AiAgentProps> = ({ userId, meetingId, context }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: 'You', text: input }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          meetingId,
          context,
          message: input,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'Gemini', text: data.answer || 'No response.' }]);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex">
      <div className="flex-1 h-full flex flex-col rounded-2xl p-4 gap-4 border border-[#4b5c8a] shadow-2xl bg-white/5 backdrop-blur-md" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <div className="bg-[#4f6af1] text-white px-4 py-3 font-extrabold text-base flex items-center rounded-t-2xl -mx-4 -mt-4 mb-2 shadow">
          <span>Chat bot</span>
        </div>
        <div className="text-xs text-gray-200 flex gap-2">
          <div>User ID: <span className="font-mono">{userId || 'Not selected'}</span></div>
          <div>Meeting ID: <span className="font-mono">{meetingId || 'Not selected'}</span></div>
        </div>
        <div className="bg-white/10 p-2 rounded text-xs text-gray-100 min-h-[32px]">
          <strong>Context:</strong> {context || 'No context provided.'}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto bg-white/10 p-2 rounded-lg flex flex-col gap-2">
          <strong className="text-gray-200 mb-1 text-xs">Messages:</strong>
          <ul className="flex flex-col gap-2">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <li
                  key={idx}
                  className={`rounded-xl px-3 py-1 shadow transition-all duration-300 fade-in text-sm ${msg.sender === 'You' ? 'bg-[#4f6af1] text-white self-end' : 'bg-white/80 text-[#23243a] self-start'}`}
                  style={{ animation: 'fadeIn 0.4s' }}
                >
                  <span className={`font-semibold ${msg.sender === 'You' ? 'text-white' : 'text-[#4f6af1]'}`}>{msg.sender}:</span>{' '}
                  {msg.sender === 'Gemini' ? (
                    <div className="prose prose-sm max-w-none prose-blue prose-code:bg-blue-100 prose-code:px-1 prose-code:rounded prose-pre:bg-blue-50 prose-pre:p-2 prose-pre:rounded prose-li:my-0.5 prose-strong:text-blue-700 prose-em:text-blue-600 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:px-2 prose-blockquote:py-1 prose-blockquote:rounded">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </li>
              ))
            ) : (
              <li className="text-gray-400 text-xs">No messages yet.</li>
            )}
            {loading && (
              <li className="text-cyan-300 italic text-xs">Gemini is thinking...</li>
            )}
            <div ref={messagesEndRef} />
          </ul>
        </div>
        <form
          className="flex gap-2 pt-2"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            className="flex-1 rounded-lg px-2 py-1 bg-white/20 text-gray-100 border border-[#4b5c8a] focus:outline-none focus:ring-2 focus:ring-[#4f6af1] placeholder-gray-400 transition text-sm"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-1 rounded-lg bg-[#4f6af1] text-white font-bold shadow hover:bg-[#3b51b3] focus:outline-none focus:ring-2 focus:ring-[#4f6af1] transition disabled:opacity-50 text-sm"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

// Fade-in animation
// Add this to your global CSS if not present:
// @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
// .fade-in { animation: fadeIn 0.4s ease-out; }

export default Ai_Agent; 