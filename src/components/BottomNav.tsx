import { useLocation, useNavigate } from "react-router-dom";
import { Film, Tv, Radio, Trophy, ShieldCheck, User, Zap } from "lucide-react";
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
  { label: "Account", path: "/profile", icon: User },
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
      {canInstall && (
        <div className="fixed bottom-24 left-4 right-4 z-[60] lg:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-primary-foreground/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <img src={logo} alt="Luo Film" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold">Install Luo Film App</p>
                <p className="text-[10px] opacity-80">Watch faster & save data</p>
              </div>
            </div>
            <button
              onClick={install}
              className="bg-white text-primary px-4 py-2 rounded-xl text-[10px] font-bold active:scale-95 transition-transform shadow-sm"
            >
              Install Now
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
        {/* Professional Bottom Nav */}
        <div className="bg-background border-t border-border shadow-2xl">
          <div className="flex items-center justify-between px-0.5 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isAgent = item.path === "#agent";

              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item.path)}
                  className={`flex flex-col items-center py-0.5 px-1 flex-1 min-w-0 transition-all relative ${isAgent ? "z-10" : ""}`}
                >
                  <div className={`relative flex items-center justify-center transition-all 
                    ${isAgent 
                      ? "w-11 h-11 -mt-4 bg-primary text-primary-foreground rounded-full shadow-lg border-4 border-background" 
                      : active 
                        ? "w-8 h-8 rounded-full bg-primary/10 text-primary" 
                        : "w-8 h-8 rounded-full text-muted-foreground active:bg-secondary/50"
                    }`}>
                    {isAgent ? <img src={logo} alt="" className="w-6 h-6 rounded-full object-contain" /> : <Icon className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-14 lg:hidden" />

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
