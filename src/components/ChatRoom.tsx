'use client';

import { useEffect, useRef, useState } from 'react';
import Message from './Message';
import { useModal } from '../context/ModalContext';

interface Props {
  meetingId: string;
  userId: string;
  onDisconnect: () => void;
  onSendContextToAgent?: (context: string, messageId: string) => void;
  selectedContextMessageId?: string | null;
  setSelectedContextMessageId?: (id: string | null) => void;
}

interface ChatRecord {
  UserID: string;
  UserName: string;
  Text: string;
  RecordedAt: string;
}

export default function ChatRoom({ meetingId, userId, onDisconnect, onSendContextToAgent, selectedContextMessageId, setSelectedContextMessageId }: Props) {
  const [messages, setMessages] = useState<ChatRecord[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { showModal, hideModal } = useModal();
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Connect WebSocket
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:6065';
    const socket = new WebSocket(`${wsUrl}/v1/ws?meeting_id=${meetingId}`);
    socket.onmessage = (e) => {
      const msg: ChatRecord = JSON.parse(e.data);
      setMessages((prev) => [...prev, msg]);
    };
    ws.current = socket;
    return () => socket.close();
  }, [meetingId]);

  // Scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDisconnectClick = async () => {
    // Close WebSocket connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setMessages([]);
    // Removed: setPopupVisible(false);
    // Removed: setSelectedText('');
    // Removed: setQuestion('');
    // Removed: setAiResponse('');

    // Show modal and start generating
    setLoadingSummary(true);
    showModal(
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4 max-w-sm w-full animate-fadeIn">
        <div className="mb-2">
          <span className="block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Meeting Summary</h2>
        <p className="text-gray-700 text-center mb-2">Please wait while we generate your meeting summary PDF...</p>
      </div>
    );
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:6065'}/v1/ping/end-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: Number(meetingId), user_id: Number(userId) }),
      });
      const data = await res.json();
      const texts = data?.data?.texts || [];
      // Add 'You' message for summary request
      setMessages([
        { UserID: userId, UserName: 'You', Text: 'Please summarize this meeting and provide key points and action items.', RecordedAt: new Date().toISOString() },
        { UserID: 'Gemini', UserName: 'Gemini', Text: 'Gemini is thinking...', RecordedAt: new Date().toISOString() }
      ]);
      // Gemini prompt in English
      const geminiPrompt = `
You are an AI assistant. Please summarize the following meeting transcript.
- Present the summary in markdown format, using headings, bullet points, bold, italics, blockquotes, and code blocks where appropriate.
- Divide the summary into clear sections: General Summary, Key Points, Action Items, and Important Notes (if any).
- Ensure the markdown is well-structured and visually appealing for web rendering.

Meeting transcript:
${texts.join('\n')}
`;
      // Call Gemini to summarize
      const geminiRes = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: '',
          message: geminiPrompt
        }),
      });
      const geminiData = await geminiRes.json();
      const summaryText = geminiData.answer || 'No summary available.';
      // Add Gemini response as a message
      setMessages([
        { UserID: userId, UserName: 'You', Text: 'Please summarize this meeting and provide key points and action items.', RecordedAt: new Date().toISOString() },
        { UserID: 'Gemini', UserName: 'Gemini', Text: summaryText, RecordedAt: new Date().toISOString() }
      ]);
      // Show modal for download
      showModal(
        <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4 max-w-sm w-full animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Meeting Summary Ready</h2>
          <p className="text-gray-700 text-center mb-4">Do you want to download the meeting summary as a PDF?</p>
          <div className="flex gap-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              onClick={() => handleDownloadPDF(summaryText)}
            >
              Yes, Download
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
              onClick={handleSkipDownload}
            >
              No, Exit
            </button>
          </div>
        </div>
      );
    } catch {
      alert('Failed to generate meeting summary PDF.');
      hideModal();
      onDisconnect();
    } finally {
      setLoadingSummary(false);
    }
  };

  // Detect Cmd/Ctrl + I and check selection inside chat-box
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isCmdI = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i';
      if (!isCmdI) return;
      const selection = window.getSelection();
      if (
        selection &&
        selection.toString().trim().length > 0 &&
        selection.anchorNode instanceof Node
      ) {
        const parent = (selection.anchorNode as HTMLElement).parentElement;
        const inChatBox = parent?.closest('.chat-box');
        if (inChatBox) {
          e.preventDefault();
          // Find the messageId (index) of the message containing the selection
          let messageId: string | null = null;
          const messageDiv = parent?.closest('[data-message-id]');
          if (messageDiv) {
            messageId = messageDiv.getAttribute('data-message-id');
          }
          if (onSendContextToAgent && messageId) {
            onSendContextToAgent(selection.toString().trim(), messageId);
          }
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onSendContextToAgent]);

  // Update handleDownloadPDF to accept markdown and render as PDF
  const handleDownloadPDF = async (markdown: string) => {
    if (typeof window === 'undefined') return;
    const { marked } = await import('marked');
    // @ts-expect-error: html2pdf.js has no type declarations, safe to ignore for browser usage
    const html2pdf = (await import('html2pdf.js')).default;

    // Remove code block wrapper if present
    const cleanMarkdown = markdown.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '');
    const html = await marked.parse(cleanMarkdown);

    const element = document.createElement('div');

    // Add AudioUS logo at the top left
    const logo = document.createElement('img');
    logo.src = '/icons/audio-us-logo.png';
    logo.alt = 'AudioUS Logo';
    logo.style.width = '64px';
    logo.style.height = 'auto';
    logo.style.display = 'block';
    logo.style.marginBottom = '16px';
    logo.style.marginLeft = '0';
    element.appendChild(logo);

    // Add markdown content
    const content = document.createElement('div');
    content.innerHTML = html;
    (content as HTMLElement).style.padding = '24px';
    (content as HTMLElement).style.background = '#fff';
    (content as HTMLElement).style.color = '#222';
    (content as HTMLElement).style.fontFamily = 'Arial, sans-serif';
    (content as HTMLElement).style.fontSize = '16px';
    content.querySelectorAll('pre, code').forEach((el) => {
      (el as HTMLElement).style.background = '#f4f4f4';
      (el as HTMLElement).style.color = '#222';
      (el as HTMLElement).style.fontSize = '14px';
      (el as HTMLElement).style.padding = '8px';
      (el as HTMLElement).style.borderRadius = '6px';
      (el as HTMLElement).style.overflowX = 'auto';
    });

    element.appendChild(content);
    document.body.appendChild(element);

    await html2pdf().from(element).set({
      margin: 0.5,
      filename: `MeetingSummary_${meetingId}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).save();

    document.body.removeChild(element);
    hideModal();
    onDisconnect();
  };

  const handleSkipDownload = () => {
    hideModal();
    onDisconnect();
  };

  return (
    <div className="w-full h-full flex">
      <div className="flex-1 h-full flex flex-col rounded-2xl p-6 gap-4 border border-[#4b5c8a] shadow-2xl bg-white/5 backdrop-blur-md" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <div className="bg-[#4f6af1] text-white px-6 py-4 font-extrabold text-lg flex justify-between items-center rounded-t-2xl -mx-6 -mt-6 mb-2 shadow">
          <span>Chat Room: {meetingId}</span>
          <button
            onClick={handleDisconnectClick}
            className="font-bold text-white hover:text-cyan-100 transition text-base"
            disabled={loadingSummary}
          >
            Disconnect
          </button>
        </div>
        <div className="flex-1 min-h-0 p-0 overflow-y-auto flex flex-col gap-3 bg-transparent chat-box">
          {messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              currentUser={userId}
              isHighlighted={selectedContextMessageId === String(i)}
              onClick={() => setSelectedContextMessageId && setSelectedContextMessageId(String(i))}
              data-message-id={String(i)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
        {/* Removed input area and handleSendMessage */}
      </div>
    </div>
  );
}