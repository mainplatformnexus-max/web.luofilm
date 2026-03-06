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
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
        {/* Professional Bottom Nav */}
        <div className="bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
          {canInstall && (
            <div className="flex border-b border-border/50">
              <button
                onClick={install}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary text-[10px] font-bold active:bg-primary/20 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Install App
              </button>
            </div>
          )}
          <div className="flex items-center justify-around px-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item.path)}
                  className="flex flex-col items-center py-1 px-1 min-w-[64px] transition-all relative"
                >
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? "bg-primary text-primary-foreground scale-95 shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-secondary"}`}>
                    <Icon className={`w-5 h-5`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-7 items-center justify-center rounded-full bg-destructive text-[7px] font-bold text-destructive-foreground border-2 border-background shadow-sm">
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
      <div className="h-20 lg:hidden" />

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
