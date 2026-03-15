import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Lock, Bell, LogOut, Copy, Check, ArrowLeft, Globe, DollarSign } from "lucide-react";
import { getUserByUid, updateUser } from "@/lib/firebaseServices";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserItem } from "@/data/adminData";
import { ALL_COUNTRY_CURRENCY_MAP, getFlagUrl, SUPPORTED_CURRENCIES } from "@/lib/geoDetect";

const CURRENCY_OPTIONS = [
  { code: "UGX", symbol: "Sh", label: "Uganda Shilling (UGX)" },
  { code: "KES", symbol: "KSh", label: "Kenya Shilling (KES)" },
  { code: "TZS", symbol: "Sh", label: "Tanzania Shilling (TZS)" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (NGN)" },
  { code: "GHS", symbol: "₵", label: "Ghana Cedi (GHS)" },
  { code: "ZMW", symbol: "ZK", label: "Zambian Kwacha (ZMW)" },
  { code: "ZAR", symbol: "R", label: "South African Rand (ZAR)" },
  { code: "XOF", symbol: "CFA", label: "West African CFA (XOF)" },
  { code: "XAF", symbol: "FCFA", label: "Central African CFA (XAF)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
];

const COUNTRY_LIST = Object.entries(ALL_COUNTRY_CURRENCY_MAP)
  .map(([code, info]) => ({ code, ...info }))
  .sort((a, b) => {
    const priority = ["UG", "KE", "TZ", "NG", "GH", "ZM", "ZA"];
    const ai = priority.indexOf(a.code);
    const bi = priority.indexOf(b.code);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userDoc, setUserDoc] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dataSaver, setDataSaver] = useState(() => localStorage.getItem('dataSaverMode') === 'true');
  const [notifications, setNotifications] = useState({
    newContent: true,
    promotions: true,
    downloads: true,
    subscriptionReminder: true,
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [savingRegion, setSavingRegion] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    const loadUser = async () => {
      try {
        const userData = await getUserByUid(user.uid);
        setUserDoc(userData);
        if (userData?.notifications) {
          setNotifications(prev => ({ ...prev, ...(userData.notifications as any) }));
        }
        if (userData?.countryCode) setSelectedCountry(userData.countryCode);
        if (userData?.currency) setSelectedCurrency(userData.currency);
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [user, navigate]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied!", description: `${field} copied to clipboard` });
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    if (userDoc) {
      try {
        await updateDoc(doc(db, "users", userDoc.id), { notifications: updated });
        toast({ title: "Saved", description: "Notification preferences updated" });
      } catch {
        toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
      }
    }
  };

  const handleDataSaverToggle = () => {
    const newValue = !dataSaver;
    setDataSaver(newValue);
    localStorage.setItem('dataSaverMode', newValue ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('dataSaverChanged', { detail: newValue }));
    toast({
      title: "Data Saver",
      description: newValue ? "Enabled — videos will load at lower quality" : "Disabled",
    });
  };

  const handleSaveRegion = async () => {
    if (!userDoc || !selectedCountry) return;
    const countryInfo = ALL_COUNTRY_CURRENCY_MAP[selectedCountry];
    if (!countryInfo) return;
    const currency = SUPPORTED_CURRENCIES.includes(selectedCurrency) ? selectedCurrency : countryInfo.currency;
    const currencyEntry = CURRENCY_OPTIONS.find(c => c.code === currency);
    const currencySymbol = currencyEntry?.symbol || "$";
    setSavingRegion(true);
    try {
      await updateDoc(doc(db, "users", userDoc.id), {
        country: countryInfo.name,
        countryCode: selectedCountry,
        currency,
        currencySymbol,
      });
      setUserDoc(prev => prev ? { ...prev, country: countryInfo.name, countryCode: selectedCountry, currency, currencySymbol } : prev);
      toast({ title: "Region saved", description: `Country: ${countryInfo.name} · Currency: ${currency}` });
    } catch {
      toast({ title: "Error", description: "Failed to save region", variant: "destructive" });
    } finally {
      setSavingRegion(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast({ title: "Logged out", description: "See you next time!" });
    } catch {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!userDoc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User data not found</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm mt-2 hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const isSubscribed = userDoc.subscription && new Date(userDoc.subscriptionExpiry || "").getTime() > Date.now();

  return (
    <div className="min-h-screen bg-background pt-8">
      <div className="max-w-4xl mx-auto px-4 pb-20 lg:pb-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{userDoc.name}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{userDoc.email}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-bold ${isSubscribed ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {isSubscribed ? "Subscribed" : "Free User"}
                </div>
              </div>
              {isSubscribed && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Subscription Expires</p>
                  <p className="text-sm font-semibold text-foreground">{userDoc.subscriptionExpiry}</p>
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Account Details</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-foreground">{userDoc.phone || "Not set"}</p>
                  </div>
                  {userDoc.phone && (
                    <button onClick={() => handleCopy(userDoc.phone, "Phone")} className="text-primary hover:text-primary/80 transition-colors">
                      {copiedField === "Phone" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Login</p>
                    <p className="text-sm font-medium text-foreground">{userDoc.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Status</p>
                    <p className={`text-sm font-medium ${userDoc.status === "active" ? "text-green-500" : userDoc.status === "blocked" ? "text-red-500" : "text-yellow-500"}`}>
                      {userDoc.status.charAt(0).toUpperCase() + userDoc.status.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                    <p className="text-sm font-medium text-foreground">{userDoc.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Region & Currency */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Region & Currency</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Set your country and preferred currency. This affects how subscription prices are shown.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Country</label>
                  <div className="relative">
                    {selectedCountry && (
                      <img
                        src={getFlagUrl(selectedCountry)}
                        alt=""
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-3.5 object-cover rounded-[2px]"
                      />
                    )}
                    <select
                      value={selectedCountry}
                      onChange={e => {
                        const code = e.target.value;
                        setSelectedCountry(code);
                        const info = ALL_COUNTRY_CURRENCY_MAP[code];
                        if (info && SUPPORTED_CURRENCIES.includes(info.currency)) {
                          setSelectedCurrency(info.currency);
                        }
                      }}
                      className={`w-full py-2.5 pr-3 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary ${selectedCountry ? 'pl-10' : 'pl-3'}`}
                    >
                      <option value="">-- Select Country --</option>
                      {COUNTRY_LIST.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={e => setSelectedCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CURRENCY_OPTIONS.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} — {c.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveRegion}
                  disabled={savingRegion || !selectedCountry}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingRegion ? (
                    <><div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />Saving...</>
                  ) : (
                    <><DollarSign className="w-4 h-4" />Save Region & Currency</>
                  )}
                </button>

                {userDoc.currency && (
                  <div className="flex items-center gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                    {userDoc.countryCode && (
                      <img src={getFlagUrl(userDoc.countryCode)} alt="" className="w-5 h-3.5 object-cover rounded-[2px]" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Currently set to <strong className="text-foreground">{userDoc.country || userDoc.countryCode}</strong> · <strong className="text-foreground">{userDoc.currencySymbol} {userDoc.currency}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Data & Network Settings */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Data & Network</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Data Saver Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Lower video quality to save data on mobile networks</p>
                  </div>
                  <button
                    onClick={handleDataSaverToggle}
                    className={`ml-3 w-11 h-6 rounded-full transition-colors relative ${dataSaver ? "bg-primary" : "bg-secondary border border-border"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${dataSaver ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
                {dataSaver && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-primary font-medium">Data Saver ON — videos will play at 480p or lower</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Notification Settings</h2>
              </div>
              <div className="space-y-3">
                {[
                  { key: "newContent", label: "New Content Available", description: "Get notified when new movies or series are added" },
                  { key: "promotions", label: "Promotions & Offers", description: "Receive special offers and discounts" },
                  { key: "downloads", label: "Download Notifications", description: "Track your video downloads" },
                  { key: "subscriptionReminder", label: "Subscription Reminders", description: "Remind me before subscription expires" },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                      className={`ml-3 w-11 h-6 rounded-full transition-colors relative ${notifications[key as keyof typeof notifications] ? "bg-primary" : "bg-secondary border border-border"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifications[key as keyof typeof notifications] ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Security</h2>
              </div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="w-full p-3 bg-secondary/30 rounded-lg text-foreground text-sm font-medium hover:bg-secondary/50 transition-colors text-left"
              >
                Change Password
              </button>
              {showChangePassword && (
                <div className="mt-4 space-y-3 p-4 bg-secondary/20 rounded-lg">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">Password changes are managed through your Google Account if you logged in with Google.</p>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="font-bold text-foreground mb-2">Need Help?</h3>
                <p className="text-xs text-muted-foreground mb-4">Visit our guide to learn more about features and how to use them.</p>
                <button
                  onClick={() => navigate("/how-to-use")}
                  className="w-full px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Guide
                </button>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="font-bold text-foreground mb-2">Account Info</h3>
                <div className="space-y-2 text-xs">
                  <p><span className="text-muted-foreground">Status:</span> <span className="text-foreground font-medium">{userDoc.status}</span></p>
                  <p><span className="text-muted-foreground">Member since:</span> <span className="text-foreground font-medium">{userDoc.createdAt}</span></p>
                  {userDoc.currency && (
                    <p><span className="text-muted-foreground">Currency:</span> <span className="text-foreground font-medium">{userDoc.currencySymbol} {userDoc.currency}</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
