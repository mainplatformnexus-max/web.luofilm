import React from 'react';
import { Download } from 'lucide-react';

interface DownloadBadgeProps {
  className?: string;
  showTooltip?: boolean;
}

const DownloadBadge: React.FC<DownloadBadgeProps> = ({ className = '', showTooltip = true }) => {
  return (
    <div className={`relative group ${className}`}>
      <style>{`
        @keyframes slide-down {
          0% {
            transform: translateY(-8px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }

        .download-indicator {
          animation: slide-down 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative px-2.5 py-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center gap-1.5 shadow-md border border-orange-400">
        <Download className="w-3.5 h-3.5 text-white" />
        <span className="text-white text-xs font-bold">Download</span>
        
        {/* Animated indicator dot */}
        <div className="download-indicator absolute -top-2 -right-2 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-orange-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Available for download
        </div>
      )}
    </div>
  );
};

export default DownloadBadge;
