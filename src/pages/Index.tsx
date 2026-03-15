import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Trophy, Users, ShieldAlert, Sparkles,
  SlidersHorizontal, ChevronDown, X, Check,
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import DramaCard from "@/components/DramaCard";
import LogoLoader from "@/components/LogoLoader";
import { subscribeMovies, subscribeSeries, subscribeEpisodes } from "@/lib/firebaseServices";
import type { MovieItem, SeriesItem, EpisodeItem } from "@/data/adminData";
import type { Drama } from "@/data/dramas";
import { genreTags } from "@/data/dramas";

type TabId = "best" | "rankings" | "agent" | "adult";

const toDrama = (item: MovieItem | SeriesItem, i: number): Drama => ({
  id: i + 5000,
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
  isAgent: "isAgent" in item ? item.isAgent : false,
  agentMarkedAt: "agentMarkedAt" in item ? item.agentMarkedAt : null,
  categories: item.categories,
  displayOrder: item.displayOrder,
  createdAt: item.createdAt,
  isAdult: "isAdult" in item ? (item as any).isAdult : false,
});

const isStillActive = (d: Drama) => {
  if (!d.isAgent) return false;
  const markedAt = d.agentMarkedAt ? new Date(d.agentMarkedAt) : null;
  if (!markedAt) return false;
  return Math.floor((Date.now() - markedAt.getTime()) / (1000 * 60 * 60 * 24)) < 5;
};

const GenreDropdown = ({
  active,
  onChange,
}: {
  active: string;
  onChange: (g: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const isFiltered = active !== "All Videos";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        dropRef.current && !dropRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(o => !o);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all ${
          isFiltered
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-secondary/60 border-border text-foreground hover:bg-secondary"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{isFiltered ? active : "Genre"}</span>
        {isFiltered
          ? <X className="w-3 h-3" onClick={e => { e.stopPropagation(); onChange("All Videos"); setOpen(false); }} />
          : <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className="fixed z-[9999] bg-card border border-border rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Filter by Genre</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-0.5 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => { onChange("All Videos"); setOpen(false); }}
            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[10px] font-semibold mb-2 transition-all ${
              active === "All Videos"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span>All Videos</span>
            {active === "All Videos" && <Check className="w-3 h-3" />}
          </button>
          <div className="grid grid-cols-3 gap-1.5">
            {genreTags.filter(t => t !== "All Videos").map(tag => (
              <button
                key={tag}
                onClick={() => { onChange(tag); setOpen(false); }}
                className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-left ${
                  active === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="truncate">{tag}</span>
                {active === tag && <Check className="w-2.5 h-2.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const Index = () => {
  const [fbMovies, setFbMovies] = useState<(MovieItem & { _idx: number })[] | null>(null);
  const [fbSeries, setFbSeries] = useState<(SeriesItem & { _idx: number })[] | null>(null);
  const [fbEpisodes, setFbEpisodes] = useState<EpisodeItem[]>([]);
  const [activeGenre, setActiveGenre] = useState("All Videos");
  const [activeTab, setActiveTab] = useState<TabId>("best");

  useEffect(() => {
    const unsub1 = subscribeMovies(movies => setFbMovies(movies.map((m, i) => ({ ...m, _idx: i }))));
    const unsub2 = subscribeSeries(series => setFbSeries(series.map((s, i) => ({ ...s, _idx: i + 1000 }))));
    const unsub3 = subscribeEpisodes(eps => setFbEpisodes(eps));

    document.title = "LUO FILM - Watch Movies, Series & Live Sports Online";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "LUO FILM is the #1 platform for streaming the latest movies, drama series, live football, and TV channels.");

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const loading = fbMovies === null || fbSeries === null;

  const allMovieDramas = useMemo(() => fbMovies?.map(m => toDrama(m, m._idx)) ?? [], [fbMovies]);
  const allSeriesDramas = useMemo(() => fbSeries?.map(s => toDrama(s, s._idx)) ?? [], [fbSeries]);

  const episodeDramas = useMemo<Drama[]>(() => {
    if (!fbEpisodes.length || !fbSeries) return [];
    return [...fbEpisodes]
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 40)
      .map((ep, i) => {
        const parent = fbSeries!.find(s => s.id === ep.seriesId);
        return {
          id: i + 9000,
          title: ep.seriesName || ep.name,
          image: parent?.posterUrl || "/placeholder.svg",
          firebaseId: ep.seriesId,
          episodes: parent?.totalEpisodes ? `${parent.totalEpisodes} Episodes` : "Episodes",
          episodeBadge: `S${ep.seasonNumber || 1} EP${ep.episodeNumber || 1}`,
          createdAt: ep.createdAt,
          genre: parent?.genre,
          rating: parent?.rating,
          targetEpisodeNumber: ep.episodeNumber || 1,
          targetEpisodeId: ep.id,
        } as Drama;
      });
  }, [fbEpisodes, fbSeries]);

  const bestAll = useMemo<Drama[]>(() => {
    const base = [
      ...allMovieDramas.map(d => isStillActive(d) ? { ...d, badge: "Agent Only", streamLink: undefined } : d),
      ...allSeriesDramas,
      ...episodeDramas,
    ].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    if (activeGenre === "All Videos") return base;
    return base.filter(d => {
      const genre = d.genre?.toLowerCase() || "";
      const categories = (d as any).categories || [];
      return (
        genre.includes(activeGenre.toLowerCase()) ||
        categories.some((c: string) => c.toLowerCase().includes(activeGenre.toLowerCase()))
      );
    });
  }, [allMovieDramas, allSeriesDramas, episodeDramas, activeGenre]);

  const rankings = useMemo<Drama[]>(() => {
    return [...allMovieDramas, ...allSeriesDramas]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 100)
      .map((d, i) => ({ ...d, rank: i + 1 }));
  }, [allMovieDramas, allSeriesDramas]);

  const agentContent = useMemo<Drama[]>(() => {
    return [...allMovieDramas, ...allSeriesDramas].filter(d => isStillActive(d));
  }, [allMovieDramas, allSeriesDramas]);

  const adultContent = useMemo<Drama[]>(() => {
    const adultMovies = (fbMovies || []).filter(m => m.isAdult).map(m => toDrama(m, m._idx));
    const adultSeries = (fbSeries || []).filter(s => s.isAdult).map(s => toDrama(s, s._idx));
    return [...adultMovies, ...adultSeries].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );
  }, [fbMovies, fbSeries]);

  const tabs = useMemo(() => {
    const t: { id: TabId; label: string; icon: typeof Sparkles; count: number }[] = [
      { id: "best", label: "Best on LUO FILM", icon: Sparkles, count: bestAll.length },
      { id: "rankings", label: "Top 100", icon: Trophy, count: rankings.length },
    ];
    if (agentContent.length > 0) t.push({ id: "agent", label: "Agent", icon: Users, count: agentContent.length });
    if (adultContent.length > 0) t.push({ id: "adult", label: "18+", icon: ShieldAlert, count: adultContent.length });
    return t;
  }, [bestAll.length, rankings.length, agentContent.length, adultContent.length]);

  const activeContent: Drama[] = (
    activeTab === "rankings" ? rankings :
    activeTab === "agent"    ? agentContent :
    activeTab === "adult"    ? adultContent :
    bestAll
  );

  const activeTitle =
    activeTab === "rankings" ? "Rankings – Top 100" :
    activeTab === "agent"    ? "Agent Exclusives" :
    activeTab === "adult"    ? "18+ Content" :
    activeGenre !== "All Videos" ? activeGenre : "Best on LUO FILM";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative w-full aspect-[16/7] bg-card animate-pulse" />
        <LogoLoader text="Loading content..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <HeroBanner />

      {/* ── TAB NAVIGATION BAR ─────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-2 px-3 md:px-6 py-2.5 overflow-x-auto scrollbar-hide">

          {/* Genre filter — always first */}
          <GenreDropdown
            active={activeGenre}
            onChange={g => {
              setActiveGenre(g);
              setActiveTab("best");
            }}
          />

          {/* Section tabs */}
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <TabIcon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT GRID ───────────────────────────────────────── */}
      <div className="px-3 md:px-6 pt-4">

        {/* Section heading */}
        <div className="flex items-center gap-1.5 mb-3">
          {activeTab === "rankings" && <Trophy className="w-3.5 h-3.5 text-primary" />}
          {activeTab === "agent"    && <Users className="w-3.5 h-3.5 text-primary" />}
          {activeTab === "adult"    && <ShieldAlert className="w-3.5 h-3.5 text-primary" />}
          {activeTab === "best"     && <Sparkles className="w-3.5 h-3.5 text-primary" />}
          <h2 className="text-xs font-semibold text-foreground">{activeTitle}</h2>
          <span className="text-[10px] text-muted-foreground ml-1">{activeContent.length}</span>
        </div>

        {activeContent.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
            {activeContent.map(drama => (
              <DramaCard key={drama.id} drama={drama} showRank={activeTab === "rankings"} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Sparkles className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm font-medium">No content for "{activeTitle}"</p>
            {activeTab === "best" && activeGenre !== "All Videos" && (
              <button
                onClick={() => setActiveGenre("All Videos")}
                className="mt-2 text-xs text-primary underline"
              >
                Show all content
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
