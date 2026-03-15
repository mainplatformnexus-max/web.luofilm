import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ActivityTrackerProvider from "./components/ActivityTrackerProvider";
import PhoneSetupModal from "./components/PhoneSetupModal";
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import TVChannel from "./pages/TVChannel";
import LiveSport from "./pages/LiveSport";
import Adult from "./pages/Adult";
import Agent from "./pages/Agent";
import AgentWatch from "./pages/AgentWatch";
import AudiencePage from "./pages/AudiencePage";
import SharedContent from "./pages/SharedContent";
import AdminDashboard from "./pages/AdminDashboard";
import SectionPage from "./pages/SectionPage";
import HowToUse from "./pages/HowToUse";
import Sitemap from "./pages/Sitemap";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Downloads from "./pages/Downloads";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import { useNotificationTimer } from "./hooks/useNotificationTimer";
import { useNotifications, showWelcomeNotification } from "./hooks/useNotifications";
import { NotificationPrompt, InAppNotificationContainer } from "./components/NotificationPrompt";
import { subscribeMovies, subscribeSeries } from "./lib/firebaseServices";
import { useEffect, useRef, useState } from "react";
import SubscribeModal from "./components/SubscribeModal";
import { registerSubscribeModal } from "./lib/globalModals";

const queryClient = new QueryClient();

const useWelcomeNotification = () => {
  const { user } = useAuth();
  const prevUid = useRef<string | null>(null);
  const allPostersRef = useRef<string[]>([]);

  useEffect(() => {
    const unsubM = subscribeMovies(movies => {
      const posters = movies.map(m => m.posterUrl).filter(Boolean) as string[];
      allPostersRef.current = [...allPostersRef.current.filter(p => !posters.includes(p)), ...posters];
    });
    const unsubS = subscribeSeries(series => {
      const posters = series.map(s => s.posterUrl).filter(Boolean) as string[];
      allPostersRef.current = [...allPostersRef.current.filter(p => !posters.includes(p)), ...posters];
    });
    return () => { unsubM(); unsubS(); };
  }, []);

  useEffect(() => {
    if (!user) { prevUid.current = null; return; }
    if (prevUid.current === user.uid) return;
    prevUid.current = user.uid;

    const key = `lf-welcomed-${user.uid}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');

    const name = user.displayName?.split(' ')[0] || 'there';
    const randomPoster = allPostersRef.current.length > 0
      ? allPostersRef.current[Math.floor(Math.random() * allPostersRef.current.length)]
      : '/logo.png';

    setTimeout(() => showWelcomeNotification(name, randomPoster), 2500);
  }, [user]);
};

const AppLayout = () => {
  const location = useLocation();
  const { needsPhoneSetup } = useAuth();
  const isAudiencePage = location.pathname.startsWith("/a/");
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subscribeMode, setSubscribeMode] = useState<"user" | "agent">("user");

  useEffect(() => {
    registerSubscribeModal((mode = "user") => {
      setSubscribeMode(mode);
      setShowSubscribe(true);
    });
  }, []);

  useNotificationTimer();
  useNotifications();
  useWelcomeNotification();

  return (
    <>
      <ActivityTrackerProvider />
      <InAppNotificationContainer />
      <NotificationPrompt />
      <PhoneSetupModal isOpen={needsPhoneSetup} />
      <SubscribeModal open={showSubscribe} onClose={() => setShowSubscribe(false)} mode={subscribeMode} />
      {!isAudiencePage && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/tv-channel" element={<TVChannel />} />
        <Route path="/live-sport" element={<LiveSport />} />
        <Route path="/adult" element={<Adult />} />
        <Route path="/agent" element={<Agent />} />
        <Route path="/agent-watch/:id" element={<AgentWatch />} />
        <Route path="/a/:shareCode" element={<AudiencePage />} />
        <Route path="/shared/:shareCode" element={<SharedContent />} />
        <Route path="/section/:sectionId" element={<SectionPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAudiencePage && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
