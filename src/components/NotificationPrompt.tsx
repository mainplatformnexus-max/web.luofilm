import { useState, useEffect, useCallback } from "react";
import { Bell, X, BellOff } from "lucide-react";

// ===================== CLING SOUND (Web Audio API) =====================
export const playClingSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.type = "sine";
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
    ctx.close();
  } catch (e) {}
};

// ===================== IN-APP FLOATING NOTIFICATION =====================
interface InAppNotif {
  id: number;
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

let _setNotifs: ((fn: (n: InAppNotif[]) => InAppNotif[]) => void) | null = null;

export const showInAppNotification = (title: string, body: string, icon?: string, url?: string) => {
  playClingSound();
  if (_setNotifs) {
    const id = Date.now();
    _setNotifs(prev => [...prev, { id, title, body, icon, url }]);
    setTimeout(() => {
      _setNotifs!(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }
};

export const InAppNotificationContainer = () => {
  const [notifs, setNotifs] = useState<InAppNotif[]>([]);
  _setNotifs = setNotifs;

  return (
    <div className="fixed top-16 right-2 left-2 md:left-auto md:w-80 z-[200] flex flex-col gap-2 pointer-events-none">
      {notifs.map(n => (
        <div key={n.id}
          onClick={() => { if (n.url) window.location.href = n.url; setNotifs(p => p.filter(x => x.id !== n.id)); }}
          className="bg-card border border-border shadow-2xl rounded-xl p-3 flex items-start gap-3 pointer-events-auto cursor-pointer animate-in slide-in-from-top-2 fade-in duration-300"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {n.icon
            ? <img src={n.icon} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
            : <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground leading-tight truncate">{n.title}</p>
            <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{n.body}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setNotifs(p => p.filter(x => x.id !== n.id)); }}
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ===================== PERMISSION PROMPT =====================
export const NotificationPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

    const timer = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setShow(false);
    if (perm === 'granted') {
      showInAppNotification("Notifications On!", "You'll get alerts for new movies, sports & more.", "/logo.png");
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed top-14 right-2 left-2 md:left-auto md:w-72 z-[150] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-card border border-primary/30 shadow-2xl rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-primary animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground">Get notified of new content!</p>
          <p className="text-[9px] text-muted-foreground">Movies, sports & more</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={handleAllow} className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-1 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
            Allow
          </button>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
