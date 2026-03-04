import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMovies, getSeries } from "@/lib/firebaseServices";
import DramaCard from "@/components/DramaCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, Upload, ShieldAlert } from "lucide-react";

const AdultPage = () => {
  const { user, userDoc } = useAuth();
  const [isGated, setIsGated] = useState(true);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState({ q: "", a: "" });
  const [content, setContent] = useState<any[]>([]);
  const navigate = useNavigate();

  const questions = [
    { q: "What is 15 + 7?", a: "22" },
    { q: "Which is older: a grandfather or a grandson?", a: "grandfather" },
    { q: "What do you call a person who is not a child anymore?", a: "adult" },
    { q: "What is the opposite of 'young'?", a: "old" }
  ];

  useEffect(() => {
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(randomQ);

    const loadContent = async () => {
      const [movies, series] = await Promise.all([getMovies(), getSeries()]);
      const adultContent = [
        ...movies.filter(m => m.genre?.toLowerCase().includes("18+") || (m as any).isAdult),
        ...series.filter(s => s.genre?.toLowerCase().includes("18+") || (s as any).isAdult)
      ];
      setContent(adultContent);
    };
    loadContent();
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAnswer = answer.toLowerCase().trim();
    if (normalizedAnswer === question.a.toLowerCase()) {
      setIsGated(false);
    } else {
      alert("Incorrect answer. This section is for adults only.");
    }
  };

  if (isGated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Adult Content Access</h1>
          <p className="text-muted-foreground">To prove you are an adult, please answer the following question:</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-left">
              <label className="text-sm font-medium mb-1 block">{question.q}</label>
              <input 
                type="text" 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2 focus:outline-none"
                placeholder="Your answer..."
                required
              />
            </div>
            <Button type="submit" className="w-full">Verify & Enter</Button>
          </form>
        </div>
      </div>
    );
  }

  const hasSubscription = userDoc?.subscription && userDoc?.status === 'active';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">18+ Content</h1>
            <p className="text-muted-foreground mt-1">Premium adult movies and series</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/admin")} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" /> Upload 18+
            </Button>
            {!hasSubscription && (
              <Button onClick={() => window.dispatchEvent(new CustomEvent('open-subscribe-modal'))} className="gap-2">
                <Lock className="w-4 h-4" /> Subscribe to Watch
              </Button>
            )}
          </div>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">No adult content found. Use the Admin panel to upload content with '18+' in the genre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {content.map((item) => (
              <DramaCard 
                key={item.id} 
                id={item.id} 
                title={item.name} 
                image={item.posterUrl} 
                rating={item.rating} 
                year={item.year}
                isVip={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdultPage;