import React from 'react';

interface Badge18PlusProps {
  className?: string;
}

const Badge18Plus: React.FC<Badge18PlusProps> = ({ className = '' }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Animated 3D badge */}
      <style>{`
        @keyframes rotate3d {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: rotateX(15deg) rotateY(-15deg) rotateZ(5deg);
          }
          50% {
            transform: rotateX(0deg) rotateY(30deg) rotateZ(-5deg);
          }
          75% {
            transform: rotateX(-15deg) rotateY(15deg) rotateZ(5deg);
          }
          100% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.8), inset 0 0 30px rgba(239, 68, 68, 0.3);
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .badge-18-plus {
          animation: rotate3d 4s ease-in-out infinite, glow 2s ease-in-out infinite, pulse-scale 2s ease-in-out infinite;
          perspective: 1000px;
        }
      `}</style>

      <div
        className="badge-18-plus relative w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border-2 border-red-400 shadow-lg"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-red-500/40 to-red-700/40" />
        
        {/* Text */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="text-white font-black text-lg leading-none">18</span>
          <span className="text-red-200 text-[10px] font-bold leading-none">+</span>
        </div>

        {/* Corner accents */}
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-300 rounded-full opacity-70" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-red-300 rounded-full opacity-70" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-red-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        18+ Content
      </div>
    </div>
  );
};

export default Badge18Plus;
