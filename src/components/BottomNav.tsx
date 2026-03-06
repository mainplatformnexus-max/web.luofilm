import { useLocation, useNavigate } from "react-router-dom";
import { Film, Tv, Radio, Trophy, ShieldCheck, Download } from "lucide-react";
import { useState } from "react";
import AgentAccessModal from "./AgentAccessModal";
import SubscribeModal from "./SubscribeModal";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Movies", path: "/movies", icon: Film },
  { label: "Series", path: "/series", icon: Tv },
  { label: "Live TV", path: "/tv-channel", icon: Radio },
  { label: "Agent", path: "#agent", icon: ShieldCheck, isCenter: true },
  { label: "18+", path: "/adult", icon: ShieldCheck },
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
        <div className="bg-background/98 backdrop-blur-md border-t border-border/50 shadow-2xl">
          {canInstall && (
            <div className="flex border-b border-border/30">
              <button
                onClick={install}
                className="flex-1 flex items-center justify-center gap-1 py-1 bg-primary/5 text-primary text-[9px] font-bold active:bg-primary/10 transition-colors"
              >
                <Download className="w-3 h-3" /> Install App
              </button>
            </div>
          )}
          <div className="flex items-center justify-between px-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isAgent = item.path === "#agent";

              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item.path)}
                  className="flex flex-col items-center py-0.5 px-0.5 flex-1 min-w-0 transition-all relative"
                >
                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${active ? "bg-primary text-primary-foreground scale-90 shadow-lg shadow-primary/20" : isAgent ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground active:bg-secondary/50"}`}>
                    {isAgent ? <img src={logo} alt="" className="w-4 h-4 rounded-full object-contain" /> : <Icon className={`w-4 h-4`} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-12 lg:hidden" />

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
