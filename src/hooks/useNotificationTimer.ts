import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { showFreeSubscriptionNotification } from '@/lib/notificationService';

const NOTIFICATION_SHOWN_KEY = 'notif_10min_shown_today';

export const useNotificationTimer = () => {
  const { user } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const checkAndShow = () => {
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem(NOTIFICATION_SHOWN_KEY);

      if (lastShown !== today && !hasShownRef.current) {
        showFreeSubscriptionNotification(user.displayName || user.email?.split('@')[0] || 'User');
        localStorage.setItem(NOTIFICATION_SHOWN_KEY, today);
        hasShownRef.current = true;
      }
    };

    timerRef.current = setTimeout(checkAndShow, 10 * 60 * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user]);
};
