interface ChatRecord {
    UserID: string;
    UserName: string;
    Text: string;
    RecordedAt: string;
  }
  
interface MessageProps {
  msg: ChatRecord;
  currentUser: string;
  isHighlighted?: boolean;
  onClick?: () => void;
  [key: string]: unknown;
}

export default function Message({
  msg,
  currentUser,
  isHighlighted = false,
  onClick,
  ...rest
}: MessageProps) {
  const isSelf = String(msg.UserID).trim() === String(currentUser).trim();

  return (
    <div
      className={`flex ${isSelf ? 'justify-end' : 'justify-start'} font-sans`}
      style={{ marginBottom: '0.25rem', paddingLeft: isSelf ? '10%' : '0', paddingRight: isSelf ? '0' : '10%' }}
      onClick={onClick}
      {...rest}
    >
      <div
        className={`rounded-xl shadow-lg p-3 max-w-md transition-all duration-150 ${isSelf ? 'bg-[#6366f1] text-white' : 'bg-white text-[#23243a]'} ${isHighlighted ? 'ring-4 ring-transparent bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-300/40' : ''}`}
        style={{ wordWrap: 'break-word', ...(isHighlighted ? { boxShadow: '0 0 16px 4px rgba(34,211,238,0.3)' } : {}) }}
      >
        <div className="font-bold text-sm mb-1">{msg.UserName}</div>
        <div className="text-base mb-1">{msg.Text}</div>
        <div className="text-xs opacity-70 mt-1">{new Date(msg.RecordedAt).toLocaleTimeString('en-US')}</div>
      </div>
    </div>
  );
}
  