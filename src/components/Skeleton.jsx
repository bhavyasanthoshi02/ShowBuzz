import React from 'react';

const Skeleton = () => {
  return (
    <div className="flex-shrink-0 w-48 md:w-56 animate-pulse">
      <div className="aspect-[2/3] bg-gray-200 rounded-xl"></div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export const SectionSkeleton = () => (
  <section className="px-4 md:px-12 py-10 bg-white">
    <div className="h-8 bg-gray-100 rounded w-48 mb-6"></div>
    <div className="flex gap-6 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} />
      ))}
    </div>
  </section>
);

export default Skeleton;
