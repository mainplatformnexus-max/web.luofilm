import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addUser } from "@/lib/firebaseServices";
import { X } from "lucide-react";

interface PhoneSetupModalProps {
  isOpen: boolean;
}

const PhoneSetupModal = ({ isOpen }: PhoneSetupModalProps) => {
  const { user, needsPhoneSetup, setNeedsPhoneSetup } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !needsPhoneSetup || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: "Phone number required", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Add user with phone number
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
        description: err.message || "Failed to save phone number", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          We need your phone number to complete your profile. This helps us keep you updated and secure.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            This step is required to access all features.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PhoneSetupModal;
