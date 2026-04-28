import React from 'react';
import { Play } from 'lucide-react';

const ComingSoonCard = ({ movie }) => {
  return (
    <div className="flex-shrink-0 w-[260px] md:w-[300px] group cursor-pointer">
      <div className="relative w-full h-[170px] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Play size={20} className="text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Title + date at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-sm leading-tight">{movie.title}</h3>
          <p className="text-gray-400 text-[10px] mt-0.5">Coming Soon &bull; {movie.duration}</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonCard;
