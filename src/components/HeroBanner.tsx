import { Play, Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeCarousels } from "@/lib/firebaseServices";
import type { CarouselItem } from "@/data/adminData";
import LogoLoader from "@/components/LogoLoader";

interface HeroBannerProps {
  page?: "home" | "series" | "movies";
  compact?: boolean;
}

const HeroBanner = ({ page = "home", compact = false }: HeroBannerProps) => {
  const navigate = useNavigate();
  const [carousels, setCarousels] = useState<CarouselItem[] | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    return subscribeCarousels((items) => {
      setCarousels(items.filter(c => c.isActive && (!c.page || c.page === page)));
    });
  }, [page]);

  const slides = carousels && carousels.length > 0
    ? carousels.map(c => ({
        id: c.id,
        image: c.imageUrl,
        title: c.title,
        badges: [c.hotWord].filter(Boolean),
        status: c.subtitle,
        desc: c.subtitle,
        linkType: c.linkType,
        linkId: c.linkId,
      }))
    : [];

  const handlePlay = (slide: any) => {
    if (!slide.linkType || !slide.linkId) return;
    
    switch (slide.linkType) {
      case "movie":
        navigate(`/watch/${slide.linkId}`);
        break;
      case "series":
        navigate(`/series/${slide.linkId}`);
        break;
      case "episode":
        navigate(`/watch/${slide.linkId}`);
        break;
      case "tv-channel":
        navigate("/tv-channels", { state: { channelId: slide.linkId } });
        break;
      case "live-match":
      case "live-sport":
        navigate(`/watch/sport-${slide.linkId}`);
        break;
      case "latest-update":
        navigate("/tv-channels"); // Or appropriate updates page
        break;
      default:
        console.log("Unknown link type:", slide.linkType);
    }
  };

  const next = useCallback(() => {
    if (slides.length > 0) setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (carousels === null) {
    return (
      <div className={`relative w-full ${compact ? "h-28 md:h-36" : "aspect-[16/7] md:aspect-[16/5] lg:aspect-[16/4.5]"} bg-card rounded-b-lg flex items-center justify-center`}>
        <LogoLoader text="Loading banner..." />
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[current];

  return (
    <div
      className={`relative w-full ${compact ? "h-28 md:h-36" : "aspect-[16/7] md:aspect-[16/5] lg:aspect-[16/4.5]"} overflow-hidden bg-card cursor-pointer`}
      onClick={() => handlePlay(currentSlide)}
    >
      {slides.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt={s.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {!compact && (
        <div className="absolute bottom-4 md:bottom-6 left-3 md:left-10 z-10">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => handlePlay(currentSlide)}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-3 md:px-5 py-1.5 md:py-2 rounded-full font-semibold text-[10px] md:text-xs hover:opacity-90 transition-opacity shadow-lg"
            >
              <Play className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" /> Play
            </button>
            <button 
              onClick={() => console.log("Added to Watch Later:", currentSlide.title)}
              className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border border-muted-foreground/40 text-foreground hover:border-foreground transition-colors bg-card/30 backdrop-blur-sm"
              title="Add to Watch Later"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <div className={`absolute ${compact ? "bottom-2 right-2" : "bottom-4 right-4 md:right-10"} flex gap-1.5`}>
          {slides.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-foreground" : "bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
