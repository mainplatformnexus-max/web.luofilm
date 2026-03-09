import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Bell, LogOut, Copy, Check } from "lucide-react";
import { getUserByUid, updateUser } from "@/lib/firebaseServices";
import type { UserItem } from "@/data/adminData";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userDoc, setUserDoc] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifications, setNotifications] = useState({
    newContent: true,
    promotions: true,
    downloads: true,
    subscriptionReminder: true,
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const loadUser = async () => {
      try {
        const userData = await getUserByUid(user.uid);
        setUserDoc(userData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading user:", err);
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
        await updateUser(userDoc.id, { 
          ...userDoc, 
          notifications: updated as any 
        });
        toast({ title: "Settings saved", description: "Notification preferences updated" });
      } catch (err) {
        toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast({ title: "Logged out", description: "See you next time!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userDoc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User data not found</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm mt-2 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isSubscribed = userDoc.subscription && new Date(userDoc.subscriptionExpiry || "").getTime() > Date.now();

  return (
    <div className="min-h-screen bg-background">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-4 py-3 text-muted-foreground hover:text-foreground text-xs transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-2xl mx-auto px-4 pb-20 lg:pb-8">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{userDoc.name}</h1>
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
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Account Details</h2>
          
          <div className="space-y-4">
            {/* Phone */}
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                <p className="text-sm font-medium text-foreground">{userDoc.phone || "Not set"}</p>
              </div>
              {userDoc.phone && (
                <button
                  onClick={() => handleCopy(userDoc.phone, "Phone")}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {copiedField === "Phone" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Last Login */}
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Login</p>
                <p className="text-sm font-medium text-foreground">{userDoc.lastActive}</p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Account Status</p>
                <p className={`text-sm font-medium ${userDoc.status === "active" ? "text-green-500" : userDoc.status === "blocked" ? "text-red-500" : "text-yellow-500"}`}>
                  {userDoc.status.charAt(0).toUpperCase() + userDoc.status.slice(1)}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                <p className="text-sm font-medium text-foreground">{userDoc.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
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
                  className={`ml-3 w-10 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
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
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Password changes are managed through your Google Account if you logged in with Google.</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
