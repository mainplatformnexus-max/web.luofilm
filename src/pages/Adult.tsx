import ArtPlayerComponent from "@/components/ArtPlayerComponent";
import { useState, useEffect, useMemo } from "react";
import { ShieldAlert, TrendingUp, Clock, Flame, Heart, Sparkles, Crown, ListOrdered, Star } from "lucide-react";
import ContentRow from "@/components/ContentRow";
import GenreTags from "@/components/GenreTags";
import HeroBanner from "@/components/HeroBanner";
import LogoLoader from "@/components/LogoLoader";
import { subscribeMovies, subscribeSeries } from "@/lib/firebaseServices";
import type { MovieItem, SeriesItem } from "@/data/adminData";
import type { Drama } from "@/data/dramas";
import { Button } from "@/components/ui/button";

const toDrama = (item: MovieItem | SeriesItem, i: number): Drama => ({
  id: i + 8000,
  title: item.name,
  image: item.posterUrl || "/placeholder.svg",
  episodes: "totalEpisodes" in item ? `${item.totalEpisodes} Episodes` : undefined,
  badge: item.isComingSoon ? "Coming soon" : undefined,
  rank: item.isTopTen ? i + 1 : undefined,
  firebaseId: item.id,
  streamLink: "streamLink" in item ? item.streamLink : undefined,
  downloadLink: "downloadLink" in item ? item.downloadLink : undefined,
  genre: item.genre,
  rating: item.rating,
  description: item.description,
  actors: item.actors,
  isVip: item.isVip,
  isHotDrama: item.isHotDrama,
  isOriginal: item.isOriginal,
  categories: item.categories,
  displayOrder: item.displayOrder || 0,
  createdAt: item.createdAt,
});

const Adult = () => {
  const [movies, setMovies] = useState<MovieItem[] | null>(null);
  const [series, setSeries] = useState<SeriesItem[] | null>(null);
  const [activeGenre, setActiveGenre] = useState("All Videos");
  const [isGated, setIsGated] = useState(true);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState({ q: "", a: "" });
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);

  const questions = [
    { q: "What is 15 + 7?", a: "22" },
    { q: "Which is older: a grandfather or a grandson?", a: "grandfather" },
    { q: "What do you call a person who is not a child anymore?", a: "adult" },
    { q: "What is the opposite of 'young'?", a: "old" }
  ];

  useEffect(() => {
    setQuestion(questions[Math.floor(Math.random() * questions.length)]);
    const unsub1 = subscribeMovies(setMovies);
    const unsub2 = subscribeSeries(setSeries);
    return () => { unsub1(); unsub2(); };
  }, []);

  const allAdultContent = useMemo(() => {
    if (!movies || !series) return [];
    const filteredMovies = movies.filter(m => m.genre?.toLowerCase().includes("18+") || m.isAdult);
    const filteredSeries = series.filter(s => s.genre?.toLowerCase().includes("18+") || s.isAdult);
    
    return [
      ...filteredMovies.map((m, i) => toDrama(m, i)),
      ...filteredSeries.map((s, i) => toDrama(s, i + 1000))
    ].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [movies, series]);

  const dramas = useMemo(() => {
    if (activeGenre === "All Videos") return allAdultContent;
    return allAdultContent.filter(d => d.genre?.toLowerCase().includes(activeGenre.toLowerCase()));
  }, [allAdultContent, activeGenre]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.toLowerCase().trim() === question.a.toLowerCase()) {
      setIsGated(false);
    } else {
      alert("Incorrect answer. This section is for adults only.");
    }
  };

  if (isGated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Adult Content Access</h1>
          <p className="text-muted-foreground text-sm">To prove you are an adult, please answer the following question:</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-left">
              <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">{question.q}</label>
              <input 
                type="text" 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Your answer..."
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 font-bold">Verify & Enter</Button>
          </form>
        </div>
      </div>
    );
  }

  if (movies === null || series === null) {
    return (
      <div className="min-h-screen bg-background">
        <LogoLoader text="Loading 18+ content..." />
      </div>
    );
  }

  const popular = dramas.filter(d => {
    const item = movies.find(m => m.id === d.firebaseId) || series.find(s => s.id === d.firebaseId);
    return item?.isPopular;
  });
  const topTen = dramas.filter(d => d.rank != null).map((d, i) => ({ ...d, rank: i + 1 }));
  const hotDrama = dramas.filter(d => {
    const item = movies.find(m => m.id === d.firebaseId) || series.find(s => s.id === d.firebaseId);
    return item?.isHotDrama;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {selectedDrama ? (
        <div className="relative w-full aspect-video bg-black">
          <ArtPlayerComponent 
            url={selectedDrama.streamLink || ""} 
            poster={selectedDrama.image}
            title={selectedDrama.title}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={() => setSelectedDrama(null)}
          >
            Close Player
          </Button>
        </div>
      ) : (
        <HeroBanner page="movies" compact />
      )}
      
      <GenreTags activeGenre={activeGenre} onGenreChange={setActiveGenre} />
      
      <div className="space-y-2">
        {dramas.length > 0 && <ContentRow title="18+ Premium Content" dramas={dramas} icon={Star} />}
        {popular.length > 0 && <ContentRow title="Trending Adult" dramas={popular} icon={TrendingUp} />}
        {topTen.length > 0 && <ContentRow title="Top Rated 18+" dramas={topTen} icon={Star} showRank />}
        {hotDrama.length > 0 && <ContentRow title="Hot Selection" dramas={hotDrama} icon={Flame} />}
      </div>

      {dramas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <ShieldAlert className="w-10 h-10 mb-4" />
          <p className="text-sm font-medium">{activeGenre === "All Videos" ? "No adult content uploaded yet" : `No content found for "${activeGenre}"`}</p>
          <p className="text-xs mt-1">Admin can upload 18+ content from the dashboard</p>
        </div>
      )}
    </div>
  );
};

export default Adult;