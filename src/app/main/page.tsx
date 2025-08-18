'use client';

import { useEffect, useState } from 'react';
import ChatRoom from '../../components/ChatRoom';
import Header from '../../components/Header';
import LoginBox from '../../components/LoginBox';
import Ai_Agent from '../../components/Ai_Agent';
import { useFooterVisibility } from '../../context/FooterVisibilityContext';

export default function MainPage() {
  const [jwt, setJwt] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [aiAgentContext, setAiAgentContext] = useState<string>('');
  const [selectedContextMessageId, setSelectedContextMessageId] = useState<string | null>(null);
  const { setShowFooter } = useFooterVisibility();

  // Check cookie on mount
  useEffect(() => {
    const checkCookie = () => {
      try {
        const jwtValue = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
        if (jwtValue) {
          setJwt(jwtValue);
          setIsInitialLoading(false);
        }
      } catch {}
    };
    checkCookie();
    setTimeout(checkCookie, 1000);
    const checkInterval = setInterval(() => {
      checkCookie();
      if (jwt) clearInterval(checkInterval);
    }, 1000);
    return () => clearInterval(checkInterval);
  }, [jwt]);

  // Debug: Log when jwt changes
  useEffect(() => {
    console.log('JWT state:', jwt);
  }, [jwt]);

  useEffect(() => {
    setShowFooter(!isJoined);
  }, [isJoined, setShowFooter]);

  // If no jwt or initial loading, show loading
  if (!jwt || isInitialLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#1e2746] to-[#263159]">
      <div className="sticky top-0 left-0 w-full z-20">
        <Header />
      </div>
      <main className="flex-1 flex flex-col min-h-0">
        {!isJoined ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <LoginBox
              meetingId={meetingId}
              setMeetingId={setMeetingId}
              userId={userId}
              setUserId={setUserId}
              onStart={() => setIsJoined(true)}
            />
          </div>
        ) : (
          <div className="w-full h-[calc(100vh-96px)] flex flex-row gap-8 px-12 py-8 min-h-0">
            <div className="flex-[2] h-full min-h-0 flex">
              <ChatRoom
                meetingId={meetingId}
                userId={userId}
                onDisconnect={() => setIsJoined(false)}
                onSendContextToAgent={(context, messageId) => {
                  setAiAgentContext(context);
                  setSelectedContextMessageId(messageId);
                }}
                selectedContextMessageId={selectedContextMessageId}
                setSelectedContextMessageId={setSelectedContextMessageId}
              />
            </div>
            {(userId && meetingId) && (
              <div className="flex-[1] h-full min-h-0 flex">
                <Ai_Agent userId={userId} meetingId={meetingId} context={aiAgentContext} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
