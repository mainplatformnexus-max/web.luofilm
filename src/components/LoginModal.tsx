import { useState, useEffect } from "react";
import { X, Phone, Mail, Lock, User, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserByPhone } from "@/lib/firebaseServices";
import { detectGeo, SUPPORTED_COUNTRIES, getFlagUrl } from "@/lib/geoDetect";
import logo from "@/assets/logo.png";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "login" | "register" | "ask-email";

const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const { login, register, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("UG");
  const [countryName, setCountryName] = useState("Uganda");
  const [currency, setCurrency] = useState("UGX");
  const [currencySymbol, setCurrencySymbol] = useState("Sh");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [geoDetected, setGeoDetected] = useState(false);

  useEffect(() => {
    if (open && (mode === "register" || mode === "ask-email") && !geoDetected) {
      detectGeo().then(geo => {
        setCountryCode(geo.countryCode);
        setCountryName(geo.countryName);
        setCurrency(geo.currency);
        setCurrencySymbol(geo.currencySymbol);
        setGeoDetected(true);
      });
    }
  }, [open, mode, geoDetected]);

  useEffect(() => {
    const handleOpenLogin = () => {
      if (!open) {
        const loginButtons = document.querySelectorAll('button');
        for (const btn of Array.from(loginButtons)) {
          if (btn.textContent?.toLowerCase().includes('login')) {
            (btn as HTMLButtonElement).click();
            break;
          }
        }
      }
    };
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, [open]);

  if (!open) return null;

  const handleSelectCountry = (code: string) => {
    const info = SUPPORTED_COUNTRIES.find(c => c.code === code);
    if (info) {
      setCountryCode(info.code);
      setCountryName(info.name);
      setCurrency(info.currency);
      setCurrencySymbol(info.symbol);
    }
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const filteredCountries = SUPPORTED_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const resetForm = () => {
    setPhone(""); setPassword(""); setName(""); setEmail("");
    setMode("login");
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    setLoading(true);
    try {
      const existing = await getUserByPhone(phone);
      if (!existing) {
        setMode("ask-email");
        setLoading(false);
        return;
      }
      await login(existing.email, password);
      toast({ title: "Welcome back!", description: "You are now logged in." });
      handleClose();
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        toast({
          title: "Login Failed",
          description: "This account may be linked to Google. Try signing in with Google instead.",
          variant: "destructive"
        });
      } else if (err.code === 'auth/invalid-email') {
        toast({ title: "Invalid phone", description: "Please enter a valid phone number.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err.message || "Invalid credentials", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setLoading(true);
    try {
      const existing = await getUserByPhone(phone);
      if (existing) {
        toast({ title: "Phone already registered", description: "This phone number is linked to another account.", variant: "destructive" });
        setLoading(false);
        return;
      }
      await register(email, password, name, phone, countryName, countryCode, currency, currencySymbol);
      toast({ title: "Account created!", description: "Welcome to LUO FILM." });
      handleClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFullRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !name || !email) return;
    setLoading(true);
    try {
      const existing = await getUserByPhone(phone);
      if (existing) {
        toast({ title: "Phone already registered", description: "This phone number is already linked to an account. Please log in instead.", variant: "destructive" });
        setMode("login");
        setLoading(false);
        return;
      }
      await register(email, password, name, phone, countryName, countryCode, currency, currencySymbol);
      toast({ title: "Account created!", description: "Welcome to LUO FILM." });
      handleClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.isNewUser) {
        toast({ title: "Welcome!", description: "Please complete your profile." });
      } else {
        toast({ title: "Welcome back!", description: "Logged in with Google." });
      }
      handleClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);

  const CountrySelector = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
        className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={getFlagUrl(countryCode)}
            alt={countryName}
            className="w-5 h-3.5 object-cover rounded-[2px] shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="truncate text-sm">{countryName}</span>
          <span className="text-muted-foreground text-[10px] shrink-0">({currency})</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ml-1 ${showCountryDropdown ? "rotate-180" : ""}`} />
      </button>

      {showCountryDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search country or currency..."
              value={countrySearch}
              onChange={e => setCountrySearch(e.target.value)}
              autoFocus
              className="w-full h-8 px-3 rounded-md bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelectCountry(c.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-secondary transition-colors ${countryCode === c.code ? "bg-primary/10 text-primary" : "text-foreground"}`}
              >
                <img
                  src={getFlagUrl(c.code)}
                  alt={c.name}
                  className="w-5 h-3.5 object-cover rounded-[2px] shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground text-[10px] shrink-0">{c.currency} {c.symbol}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="px-3 py-3 text-muted-foreground text-xs text-center">No countries found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="relative px-6 pt-6 pb-4 text-center">
          <button onClick={handleClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
          <img src={logo} alt="LUO FILM" className="w-12 h-12 rounded-xl object-contain mx-auto mb-3" />
          <h2 className="text-foreground font-bold text-lg">
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Complete Registration"}
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            {mode === "login" ? "Sign in with your phone number"
              : mode === "register" ? "Join LUO FILM for free"
              : "Phone not found – enter your details to register"}
          </p>
        </div>

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="px-6 pb-4 space-y-3">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full h-10 pl-10 pr-10 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>
        )}

        {/* ASK EMAIL FORM (phone not found → register) */}
        {mode === "ask-email" && (
          <form onSubmit={handleRegisterWithEmail} className="px-6 pb-4 space-y-3">
            <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-xs text-accent text-center">
              Phone <span className="font-bold">{phone}</span> not found. Enter your details to create an account.
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <CountrySelector />
            <button type="submit" disabled={loading}
              className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account & Sign In"}
            </button>
            <button type="button" onClick={() => setMode("login")} className="w-full text-muted-foreground text-xs text-center hover:text-foreground">← Back to login</button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form onSubmit={handleFullRegister} className="px-6 pb-4 space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full h-10 pl-10 pr-10 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <CountrySelector />
            <button type="submit" disabled={loading}
              className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "Please wait..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Google + Toggle */}
        {mode !== "ask-email" && (
          <>
            <div className="px-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-foreground text-[10px]">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="px-6 py-4">
              <button type="button" onClick={handleGoogleLogin} disabled={loading}
                className="w-full h-10 flex items-center justify-center gap-2 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>
            <div className="px-6 pb-6 text-center">
              <p className="text-muted-foreground text-xs">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary font-medium hover:underline">
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
