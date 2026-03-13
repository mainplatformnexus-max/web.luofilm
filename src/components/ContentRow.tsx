import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Drama } from "@/data/dramas";
import type { LucideIcon } from "lucide-react";
import DramaCard from "./DramaCard";

const TITLE_TO_SECTION: Record<string, string> = {
  "Movies": "movies",
  "Series": "series",
  "All Series": "series",
  "All Movies": "movies",
  "Popular on LUO FILM": "popular",
  "Popular Series": "popular-series",
  "Popular Movies": "popular-movies",
  "Coming Soon & Upcoming": "coming-soon",
  "Coming Soon": "coming-soon",
  "Top Rated": "top-rated",
  "Drama Selection": "drama-selection",
  "Editor's Selection": "editors-selection",
  "High-quality Dramas": "high-quality",
  "High Quality": "high-quality",
  "Hot Dramas": "hot-dramas",
  "Hot": "hot-movies",
  "Sweet Romance": "sweet-romance",
  "Ancient Costume": "ancient-costume",
};

interface ContentRowProps {
  title: string;
  dramas: Drama[];
  showRank?: boolean;
  titleColor?: string;
  icon?: LucideIcon;
  isGrid?: boolean;
  headerRight?: ReactNode;
}

const ContentRow = ({ title, dramas, showRank, titleColor, icon: Icon, isGrid, headerRight }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const sectionId = TITLE_TO_SECTION[title];

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = dir === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleSectionClick = () => {
    if (sectionId) {
      navigate(`/section/${sectionId}`);
    }
  };

  return (
    <section className="px-4 md:px-10 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`flex items-center gap-1.5 ${sectionId ? "cursor-pointer group/title" : ""}`}
          onClick={handleSectionClick}
        >
          {Icon && <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: titleColor || "hsl(var(--primary))" }} />}
          <h2
            className="text-[11px] md:text-xs font-semibold tracking-tight"
            style={{ color: titleColor || "hsl(var(--foreground))" }}
          >
            {title}
          </h2>
          <ChevronRight className={`w-3 h-3 text-muted-foreground ${sectionId ? "group-hover/title:text-primary transition-colors" : ""}`} />
        </div>
        {headerRight && <div onClick={e => e.stopPropagation()}>{headerRight}</div>}
      </div>

      <div className="relative group/row">
        {!isGrid && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 bottom-0 z-10 w-7 bg-background/70 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center rounded-r"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-2.5 overflow-x-auto scrollbar-hide scroll-smooth"
            >
              {dramas.map((drama) => (
                <DramaCard key={drama.id} drama={drama} showRank={showRank} />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 bottom-0 z-10 w-7 bg-background/70 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center rounded-l"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </>
        )}

        {isGrid && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 md:gap-6">
            {dramas.map((drama) => (
              <DramaCard key={drama.id} drama={drama} showRank={showRank} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ContentRow;
