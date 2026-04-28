import React from 'react';
import { Play } from 'lucide-react';

const Hero = ({ movie }) => {
  if (!movie) return null;

  return (
    <div className="relative w-full h-[520px] md:h-[650px] overflow-hidden">

      <img
        src={movie.poster}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-14 pb-14">

        <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full w-fit mb-4 tracking-wider">
          NOW SHOWING
        </span>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-3">
          {movie.title}
        </h1>

        <p className="text-gray-300 mb-6 text-sm md:text-base">
          {movie.genre} • {movie.duration} • ⭐ {movie.rating}/10
        </p>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-primary px-7 py-3 rounded-full text-white font-semibold hover:bg-red-700 hover:scale-105 transition shadow-lg">
            <Play size={16} className="fill-white" />
            Book Now
          </button>

          <button className="border border-white/40 px-7 py-3 rounded-full text-white hover:bg-white/10 transition backdrop-blur-sm">
            Watch Trailer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;