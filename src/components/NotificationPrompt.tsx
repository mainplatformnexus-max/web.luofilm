import { useState, useEffect, useRef } from "react";
import { Bell, X, Tv, Film, Star, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showDeviceNotification } from "@/lib/pushNotifications";

// ===================== CLING SOUND (Web Audio API) =====================
export const playClingSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.type = "sine";
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
    setTimeout(() => ctx.close(), 800);
  } catch (e) {}
};

// ===================== IN-APP FLOATING NOTIFICATION =====================
export interface NotifButton {
  label: string;
  url: string;
  color?: string;
}

interface InAppNotif {
  id: number;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  buttons?: NotifButton[];
  accent?: string;
  duration?: number;
}

let _setNotifs: ((fn: (n: InAppNotif[]) => InAppNotif[]) => void) | null = null;

export const showInAppNotification = (
  title: string,
  body: string,
  icon?: string,
  url?: string,
  buttons?: NotifButton[],
  accent?: string,
  duration = 7000
) => {
  playClingSound();
  showDeviceNotification(title, body, icon, url).catch(() => {});
  if (_setNotifs) {
    const id = Date.now();
    _setNotifs(prev => [...prev.slice(-2), { id, title, body, icon, url, buttons, accent, duration }]);
    setTimeout(() => {
      _setNotifs!(prev => prev.filter(n => n.id !== id));
    }, duration + 300);
  }
};

// ===================== SINGLE NOTIFICATION CARD =====================
const NotifCard = ({
  notif,
  onDismiss,
}: {
  notif: InAppNotif;
  onDismiss: () => void;
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);
  const duration = notif.duration || 7000;
  const accentColor = notif.accent || "hsl(var(--primary))";

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  const handleNavigate = (url: string) => {
    onDismiss();
    if (url === "SUBSCRIBE_MODAL") {
      import("@/lib/globalModals").then(m => m.showSubscribeModal("user"));
    } else {
      navigate(url);
    }
  };

  return (
    <div
      className="relative bg-card border border-border/60 shadow-2xl rounded-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-top-3 fade-in duration-400"
      style={{ backdropFilter: "blur(16px)" }}
    >
      {/* Accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: accentColor }} />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/30">
        <div
          className="h-full transition-none rounded-full"
          style={{ width: `${progress}%`, background: accentColor }}
        />
      </div>

      <div className="pl-3 pr-3 pt-3 pb-3">
        <div className="flex items-start gap-3">
          {/* Poster / Icon */}
          {notif.icon ? (
            <img
              src={notif.icon}
              className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-lg ring-1 ring-white/10"
              alt=""
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: `${accentColor}22` }}>
              <Bell className="w-6 h-6" style={{ color: accentColor }} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-bold text-foreground leading-tight">{notif.title}</p>
              <button
                onClick={e => { e.stopPropagation(); onDismiss(); }}
                className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5 hover:bg-muted rounded p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{notif.body}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {notif.buttons && notif.buttons.length > 0 && (
          <div className="flex gap-2 mt-2.5 flex-wrap">
            {notif.buttons.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleNavigate(btn.url)}
                className="flex-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95 whitespace-nowrap min-w-0"
                style={{
                  background: btn.color || accentColor,
                  color: "#fff",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Clickable if no buttons */}
        {(!notif.buttons || notif.buttons.length === 0) && notif.url && (
          <button
            onClick={() => handleNavigate(notif.url!)}
            className="mt-2 text-[10px] font-bold px-3 py-1.5 rounded-lg w-full text-left transition-all hover:opacity-90"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            Watch Now →
          </button>
        )}
      </div>
    </div>
  );
};

// ===================== NOTIFICATION CONTAINER =====================
export const InAppNotificationContainer = () => {
  const [notifs, setNotifs] = useState<InAppNotif[]>([]);
  _setNotifs = setNotifs;

  const dismiss = (id: number) => setNotifs(p => p.filter(n => n.id !== id));

  return (
    <div className="fixed top-12 sm:top-16 right-2 left-2 md:left-auto md:w-[340px] z-[200] flex flex-col gap-2 pointer-events-none">
      {notifs.map(n => (
        <NotifCard key={n.id} notif={n} onDismiss={() => dismiss(n.id)} />
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
    const dismissedAt = localStorage.getItem('notification-prompt-dismissed-at');
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < 3) return;
    }
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setShow(false);
    if (perm === 'granted') {
      window.dispatchEvent(new Event('notification-permission-granted'));
      showInAppNotification(
        "Notifications Enabled",
        "You'll get alerts for new movies, live sports & more.",
        "/logo.png",
        "/",
        [],
        "hsl(var(--primary))"
      );
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('notification-prompt-dismissed-at', String(Date.now()));
  };

  if (!show) return null;

  return (
    <div className="fixed top-[48px] sm:top-[60px] right-2 left-2 md:left-auto md:w-72 z-[150] animate-in slide-in-from-top-2 fade-in duration-300">
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
