import { useState, useEffect, useMemo, useRef } from "react";
import { Trophy, Users, ShieldAlert, Sparkles, SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import LogoLoader from "@/components/LogoLoader";
import { subscribeMovies, subscribeSeries, subscribeEpisodes } from "@/lib/firebaseServices";
import type { MovieItem, SeriesItem, EpisodeItem } from "@/data/adminData";
import type { Drama } from "@/data/dramas";
import { genreTags } from "@/data/dramas";

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
});

const isStillActive = (d: Drama) => {
  if (!d.isAgent) return false;
  const markedAt = d.agentMarkedAt ? new Date(d.agentMarkedAt) : null;
  if (!markedAt) return false;
  return Math.floor((Date.now() - markedAt.getTime()) / (1000 * 60 * 60 * 24)) < 5;
};

// Genre icon button + dropdown panel
const GenreFilter = ({ active, onChange }: { active: string; onChange: (g: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isFiltered = active !== "All Videos";

  return (
    <div ref={ref} className="relative px-4 md:px-10 mb-2">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all shadow-sm ${
          isFiltered
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-secondary/70 border-border text-foreground hover:bg-secondary"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{isFiltered ? active : "Genre"}</span>
        {isFiltered
          ? <X className="w-3 h-3 ml-0.5" onClick={e => { e.stopPropagation(); onChange("All Videos"); setOpen(false); }} />
          : <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-4 md:left-10 top-full mt-2 z-50 bg-card border border-border rounded-2xl shadow-2xl p-4 w-72 md:w-96 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Filter by Genre</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-0.5 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {genreTags.map(tag => (
              <button
                key={tag}
                onClick={() => { onChange(tag); setOpen(false); }}
                className={`flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-left ${
                  active === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="truncate">{tag}</span>
                {active === tag && <Check className="w-3 h-3 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const [fbMovies, setFbMovies] = useState<(MovieItem & { _idx: number })[] | null>(null);
  const [fbSeries, setFbSeries] = useState<(SeriesItem & { _idx: number })[] | null>(null);
  const [fbEpisodes, setFbEpisodes] = useState<EpisodeItem[]>([]);
  const [activeGenre, setActiveGenre] = useState("All Videos");

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

  // ── Derived data ──────────────────────────────────────────────────────────
  const allMovieDramas = useMemo(() => fbMovies?.map(m => toDrama(m, m._idx)) ?? [], [fbMovies]);
  const allSeriesDramas = useMemo(() => fbSeries?.map(s => toDrama(s, s._idx)) ?? [], [fbSeries]);

  // Episodes with series poster + S1 EP3 badge
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
          episodeBadge: `S${ep.seasonNumber || 1} EP${ep.episodeNumber || 1}`,
          createdAt: ep.createdAt,
          genre: parent?.genre,
          rating: parent?.rating,
        } as Drama;
      });
  }, [fbEpisodes, fbSeries]);

  // "Best on LUO FILM" = movies + series + episodes merged, sorted latest first
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

  // Rankings — top 100 sorted by rating desc
  const rankings = useMemo<Drama[]>(() => {
    const base = [...allMovieDramas, ...allSeriesDramas]
      .filter(d => (d.rating ?? 0) > 0)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 100)
      .map((d, i) => ({ ...d, rank: i + 1 }));
    return base;
  }, [allMovieDramas, allSeriesDramas]);

  // Agent exclusives — still within 5-day agent window
  const agentContent = useMemo<Drama[]>(() => {
    return [...allMovieDramas, ...allSeriesDramas].filter(d => isStillActive(d));
  }, [allMovieDramas, allSeriesDramas]);

  // 18+ adult content
  const adultContent = useMemo<Drama[]>(() => {
    const adultMovies = (fbMovies || []).filter(m => m.isAdult).map(m => toDrama(m, m._idx));
    const adultSeries = (fbSeries || []).filter(s => s.isAdult).map(s => toDrama(s, s._idx));
    return [...adultMovies, ...adultSeries].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );
  }, [fbMovies, fbSeries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative w-full aspect-[16/7] bg-card animate-pulse" />
        <LogoLoader text="Loading content..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />

      {/* Genre filter — right below hero */}
      <div className="mt-5">
        <GenreFilter active={activeGenre} onChange={setActiveGenre} />

        {/* ── BEST ON LUO FILM / GENRE FILTERED ───────────────── */}
        {bestAll.length > 0 ? (
          <ContentRow
            title={activeGenre === "All Videos" ? "Best on LUO FILM" : activeGenre}
            dramas={bestAll}
            icon={Sparkles}
            isGrid
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground px-4">
            <Sparkles className="w-10 h-10 mb-4 opacity-30" />
            <p className="text-sm font-medium">No content found for "{activeGenre}"</p>
            <button onClick={() => setActiveGenre("All Videos")} className="mt-3 text-xs text-primary underline">
              Show all content
            </button>
          </div>
        )}

        {/* ── RANKINGS – TOP 100 ───────────────────────────────── */}
        {rankings.length > 0 && (
          <ContentRow
            title="Rankings – Top 100"
            dramas={rankings}
            icon={Trophy}
            isGrid
            showRank
          />
        )}

        {/* ── AGENT EXCLUSIVES ─────────────────────────────────── */}
        {agentContent.length > 0 && (
          <ContentRow
            title="Agent Exclusives"
            dramas={agentContent}
            icon={Users}
            isGrid
          />
        )}

        {/* ── 18+ SECTION ──────────────────────────────────────── */}
        {adultContent.length > 0 && (
          <ContentRow
            title="18+ Content"
            dramas={adultContent}
            icon={ShieldAlert}
            isGrid
          />
        )}
      </div>
    </div>
  );
};

export default Index;
