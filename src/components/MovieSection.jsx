import React from 'react';
import MovieCard from './MovieCard';

const MovieSection = ({ label, title, movies }) => {
  if (!movies?.length) return null;

  return (
    <section className="px-6 md:px-14 py-10">

      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs uppercase text-primary font-bold tracking-widest">
            {label}
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
        </div>

        <span className="text-primary text-sm cursor-pointer hover:underline">
          View all →
        </span>
      </div>

      <div className="flex gap-5 overflow-x-auto hide-scrollbar">
        {movies.map((movie, i) => (
          <MovieCard key={i} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default MovieSection;