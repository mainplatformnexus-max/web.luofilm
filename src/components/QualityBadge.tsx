import React from 'react';
import { Sparkles } from 'lucide-react';

interface QualityBadgeProps {
  quality: string;
  className?: string;
}

const QualityBadge: React.FC<QualityBadgeProps> = ({ quality, className = '' }) => {
  return (
    <div className={`relative group ${className}`}>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            rgba(255, 215, 0, 0.3) 0%,
            rgba(255, 215, 0, 0.8) 50%,
            rgba(255, 215, 0, 0.3) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div className="relative px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center gap-1.5 shadow-lg border border-purple-500 overflow-hidden">
        {/* Shimmer effect background */}
        <div className="shimmer-effect absolute inset-0" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="text-yellow-300 text-xs font-bold">{quality}</span>
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-purple-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Premium Quality
      </div>
    </div>
  );
};

export default QualityBadge;
