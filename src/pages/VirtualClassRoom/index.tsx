import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function VirtualClassRoom() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t: tc } = useTranslation('common');
  const [loading, setLoading] = useState(true);

  if (!bookingId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] h-screen">
        <p className="text-lg">Invalid Booking ID</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="w-4 h-4" />
          {tc('actions.back')}
        </Button>
      </div>
    );
  }

  const defaultDisplayName = user?.full_name || 'Guest User';
  const prefix = 'classroom-pro-';
  const roomName = `${prefix}${bookingId}`.replace(/-/g, ''); // Ensure roomName doesn't have invalid characters

  return (
    <div className="w-full h-screen flex flex-col bg-black">
      <div className="flex items-center p-4 bg-[var(--bg-surface)] border-b border-[var(--border-main)] relative z-10 shadow-md">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tc('actions.back')}
        </Button>
        <h1 className="ml-4 font-[family-name:var(--font-display)] font-semibold text-[var(--text-main)] truncate hidden sm:block">
          Classroom Pro - {bookingId}
        </h1>
      </div>

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface)] z-0">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: defaultDisplayName,
            email: user?.email || 'guest@example.com'
          }}
          onApiReady={() => {
            setLoading(false);
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
          spinner={() => <div />}
        />
      </div>
    </div>
  );
}
