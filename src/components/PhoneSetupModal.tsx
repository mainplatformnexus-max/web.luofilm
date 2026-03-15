import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addUser } from "@/lib/firebaseServices";
import { Phone, ChevronDown } from "lucide-react";
import { detectGeo, ALL_COUNTRY_CURRENCY_MAP, getFlagUrl } from "@/lib/geoDetect";

const ALL_COUNTRIES = Object.entries(ALL_COUNTRY_CURRENCY_MAP)
  .map(([code, info]) => ({ code, ...info }))
  .sort((a, b) => {
    const priority = ["UG", "KE", "TZ", "NG", "GH", "ZA", "ZM"];
    const ai = priority.indexOf(a.code);
    const bi = priority.indexOf(b.code);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

interface PhoneSetupModalProps {
  isOpen: boolean;
}

const PhoneSetupModal = ({ isOpen }: PhoneSetupModalProps) => {
  const { user, needsPhoneSetup, setNeedsPhoneSetup } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("UG");
  const [countryName, setCountryName] = useState("Uganda");
  const [currency, setCurrency] = useState("UGX");
  const [currencySymbol, setCurrencySymbol] = useState("Sh");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [geoDetected, setGeoDetected] = useState(false);

  useEffect(() => {
    if (isOpen && !geoDetected) {
      detectGeo().then(geo => {
        setCountryCode(geo.countryCode);
        setCountryName(geo.countryName);
        setCurrency(geo.currency);
        setCurrencySymbol(geo.currencySymbol);
        setGeoDetected(true);
      });
    }
  }, [isOpen, geoDetected]);

  if (!isOpen || !needsPhoneSetup || !user) return null;

  const handleSelectCountry = (code: string) => {
    const info = ALL_COUNTRY_CURRENCY_MAP[code];
    if (info) {
      setCountryCode(code);
      setCountryName(info.name);
      setCurrency(info.currency);
      setCurrencySymbol(info.symbol);
    }
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: "Phone number required", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addUser({
        name: user.displayName || "User",
        phone: phone.trim(),
        email: user.email || "",
        status: "active",
        subscription: null,
        subscriptionExpiry: null,
        lastActive: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString().split("T")[0],
        uid: user.uid,
        country: countryName,
        countryCode,
        currency,
        currencySymbol,
        notifications: {
          newContent: true,
          promotions: true,
          downloads: true,
          subscriptionReminder: true,
        },
      } as any);

      setNeedsPhoneSetup(false);
      toast({ title: "Profile Complete", description: "Welcome to LUO FILM!" });
      setPhone("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select your country and add your phone number to finish setting up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country selector */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Country *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="w-full h-11 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={getFlagUrl(countryCode)}
                    alt={countryName}
                    className="w-5 h-3.5 object-cover rounded-[2px] shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="truncate">{countryName}</span>
                  <span className="text-muted-foreground text-[10px] shrink-0">({currency})</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-1 ${showCountryDropdown ? "rotate-180" : ""}`} />
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      type="text"
                      placeholder="Search country..."
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
                        <span className="text-muted-foreground text-[10px] shrink-0">{c.currency}</span>
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <p className="px-3 py-3 text-muted-foreground text-xs text-center">No countries found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone number */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full h-11 pl-10 pr-4 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            This information is required to access all features of LUO FILM.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PhoneSetupModal;
