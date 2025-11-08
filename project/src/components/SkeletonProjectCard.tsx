// src/components/SkeletonProjectCard.tsx
import React from "react";

export default function SkeletonProjectCard() {
  return (
    <div className="animate-pulse bg-[#081018] rounded-xl border border-gray-800/50 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-700/30" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700/30 rounded w-3/5 mb-2" />
          <div className="h-3 bg-gray-700/20 rounded w-2/5" />
        </div>
      </div>

      <div className="h-3 bg-gray-700/20 rounded w-4/5 mb-3" />
      <div className="h-3 bg-gray-700/20 rounded w-2/3 mb-3" />

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <div className="h-7 w-16 rounded bg-gray-700/20" />
          <div className="h-7 w-12 rounded bg-gray-700/20" />
        </div>
        <div className="h-7 w-12 rounded bg-gray-700/20" />
      </div>
    </div>
  );
}
