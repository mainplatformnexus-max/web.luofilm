import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import type { Drama } from "@/data/dramas";
import SubscribeModal from "@/components/SubscribeModal";
import { parseISO, differenceInDays } from "date-fns";

interface DramaCardProps {
  drama: Drama;
  showRank?: boolean;
}

const DramaCard = ({ drama, showRank }: DramaCardProps) => {
  const navigate = useNavigate();
  const [showSubscribe, setShowSubscribe] = useState(false);
  const rankNumber = drama.rank;

  // Check if agent content still within 5 days
  const isStillAgent = (() => {
    if (!drama.isAgent) return false;
    const markedAt = drama.agentMarkedAt ? new Date(drama.agentMarkedAt) : null;
    if (!markedAt) return false;
    return Math.floor((Date.now() - markedAt.getTime()) / (1000 * 60 * 60 * 24)) < 5;
  })();

  const getUploadBadge = () => {
    if (!drama.createdAt) return null;
    try {
      const date = parseISO(drama.createdAt);
      const days = differenceInDays(new Date(), date);
      if (days > 7) return null;
      
      let label = "";
      if (days === 0) label = "Today";
      else if (days === 1) label = "Yesterday";
      else label = `${days} days ago`;
      
      return label;
    } catch (e) {
      return null;
    }
  };

  const uploadBadge = getUploadBadge();

  const handleClick = () => {
    if (isStillAgent) {
      // Show agent subscribe modal
      setShowSubscribe(true);
      return;
    }

    if (drama.firebaseId) {
      navigate(`/watch/${drama.firebaseId}`, {
        state: {
          firebaseId: drama.firebaseId,
          title: drama.title,
          image: drama.image,
          streamLink: drama.streamLink,
          downloadLink: drama.downloadLink,
          episodes: drama.episodes,
          genre: drama.genre,
          rating: drama.rating,
          description: drama.description,
          actors: drama.actors,
          isVip: drama.isVip,
          isHotDrama: drama.isHotDrama,
          isOriginal: drama.isOriginal,
          isAgent: drama.isAgent,
          agentMarkedAt: drama.agentMarkedAt,
          targetEpisodeNumber: drama.targetEpisodeNumber,
          targetEpisodeId: drama.targetEpisodeId,
        }
      });
    } else {
      navigate(`/watch/${drama.id}`);
    }
  };

  return (
    <>
      <div
        className="flex-shrink-0 group cursor-pointer w-full transition-all duration-300 hover:translate-y-[-4px]"
        onClick={handleClick}
      >
        <div className="flex-1 min-w-0">
          <div className="relative rounded-sm overflow-hidden mb-0.5 aspect-[2/3] shadow-md group-hover:shadow-primary/20 group-hover:shadow-lg transition-all duration-300">
            <img
              src={drama.image}
              alt={drama.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Rank number overlaid on poster */}
            {showRank && rankNumber && (
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-start px-1 pb-0.5 bg-gradient-to-t from-black/70 to-transparent pt-6 pointer-events-none">
                <span
                  className="font-black leading-none select-none"
                  style={{
                    fontSize: "clamp(28px, 5vw, 48px)",
                    color: "hsl(var(--primary))",
                    WebkitTextStroke: "1px hsl(var(--primary) / 0.6)",
                    textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                  }}
                >
                  {rankNumber}
                </span>
              </div>
            )}
            {/* Display order number */}
            {drama.displayOrder != null && drama.displayOrder > 0 && !showRank && (
              <div className="absolute top-0 left-0">
                <div className="bg-primary/95 text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-br-sm min-w-[20px] text-center shadow-md">
                  {drama.displayOrder}
                </div>
              </div>
            )}
            {drama.isAdult && !isStillAgent && (
              <div className="absolute top-0 left-0 bg-red-600/95 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-sm shadow-lg">
                18+
              </div>
            )}
            {isStillAgent && (
              <div className="absolute top-1.5 right-1.5 bg-accent/95 backdrop-blur-sm text-accent-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-lg flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> Agent Only
              </div>
            )}
            {!isStillAgent && drama.badge && (
              <div className="absolute top-1.5 right-1.5 bg-badge-coming/95 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm shadow-lg border border-white/10">
                {drama.badge}
              </div>
            )}
            {uploadBadge && !isStillAgent && !drama.badge && (
              <div className="absolute top-1.5 right-1.5 bg-primary/95 backdrop-blur-sm text-primary-foreground text-[7px] font-bold px-1.5 py-0.5 rounded-sm shadow-lg border border-white/5">
                {uploadBadge}
              </div>
            )}
            {/* Episode badge e.g. S1 EP3 */}
            {drama.episodeBadge && (
              <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-white/15 tracking-wide">
                {drama.episodeBadge}
              </div>
            )}
            {drama.episodes && !drama.episodeBadge && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-1.5 pb-1 pt-4">
                <p className="text-white text-[9px] font-semibold drop-shadow-md">{drama.episodes}</p>
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-primary/30 transition-all rounded-sm" />
          </div>
          <h3 className="text-foreground text-[10px] md:text-[11px] font-semibold line-clamp-1 group-hover:text-primary transition-colors px-0.5">{drama.title}</h3>
        </div>
      </div>
      <SubscribeModal open={showSubscribe} onClose={() => setShowSubscribe(false)} mode="agent" />
    </>
  );
};

export default DramaCard;
