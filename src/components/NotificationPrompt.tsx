import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationPrompt = () => {
  const [show, setShow] = useState(false);
  const { requestPermission } = useNotifications();

  useEffect(() => {
    const isAllowed = Notification.permission === 'granted';
    const isDenied = Notification.permission === 'denied';
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    
    if (!isAllowed && !isDenied && !dismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[100] animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-card border border-primary/20 shadow-2xl rounded-2xl p-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <button onClick={handleDismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-primary animate-bounce" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground mb-1">Stay Updated!</h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Allow notifications to get alerts for new movies, series, and live sports.
            </p>
            <div className="flex gap-2">
              <button onClick={handleAllow} className="flex-1 bg-primary text-primary-foreground text-[10px] font-bold py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                Allow Notifications
              </button>
              <button onClick={handleDismiss} className="flex-1 bg-secondary text-secondary-foreground text-[10px] font-bold py-1.5 rounded-lg hover:bg-secondary/80 transition-colors">
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
