import { useLocation, useNavigate } from "react-router-dom";
import { Film, Tv, Radio, Trophy, ShieldCheck, Download } from "lucide-react";
import { useState } from "react";
import AgentAccessModal from "./AgentAccessModal";
import SubscribeModal from "./SubscribeModal";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const navItems = [
  { label: "Movies", path: "/movies", icon: Film },
  { label: "Series", path: "/series", icon: Tv },
  { label: "Agent", path: "#agent", icon: ShieldCheck, isCenter: true },
  { label: "18+", path: "/adult", icon: ShieldCheck, badge: "New" },
  { label: "Sport", path: "/live-sport", icon: Trophy },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAgentAccess, setShowAgentAccess] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const { canInstall, install } = usePWAInstall();

  const isActive = (path: string) => {
    if (path.startsWith("#")) return false;
    return location.pathname === path;
  };

  const handleClick = (path: string) => {
    if (path === "#agent") {
      setShowAgentAccess(true);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <nav className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        {/* Modern Floating Bottom Nav */}
        <div className="bg-card/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
          {canInstall && (
            <div className="flex border-b border-white/5">
              <button
                onClick={install}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary/20 text-primary text-[10px] font-bold active:scale-[0.98] transition-transform"
              >
                <Download className="w-3.5 h-3.5" /> Install Official App
              </button>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              if (item.isCenter) {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleClick(item.path)}
                    className="relative flex flex-col items-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30 border border-white/20 transition-all group-active:scale-90">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-primary text-[8px] font-bold mt-1 opacity-80">{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item.path)}
                  className="flex flex-col items-center py-1 px-2 min-w-[60px] transition-all relative group"
                >
                  <div className={`relative p-2 rounded-2xl transition-all ${active ? "bg-primary/20 scale-110" : "group-active:bg-white/5"}`}>
                    <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                    )}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-6 items-center justify-center rounded-full bg-destructive text-[7px] font-bold text-destructive-foreground border border-background animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-medium mt-1 transition-colors ${active ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24 lg:hidden" />

      <AgentAccessModal
        open={showAgentAccess}
        onClose={() => setShowAgentAccess(false)}
        onAccess={() => { setShowAgentAccess(false); navigate("/agent"); }}
        onSubscribe={() => { setShowAgentAccess(false); setShowSubscribe(true); }}
      />
      <SubscribeModal open={showSubscribe} onClose={() => setShowSubscribe(false)} mode="agent" />
    </>
  );
};

export default BottomNav;
