import React from 'react'

export const StorySkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="divide-y divide-white/[0.04]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-6 px-4 sm:px-7 animate-void-pulse">
          {/* Title line */}
          <div className="h-5 bg-white/[0.08] rounded w-5/6 mb-2.5" />
          {/* Metadata line */}
          <div className="flex items-center gap-3">
            <div className="h-3 bg-white/[0.05] rounded w-16" />
            <div className="h-3 bg-white/[0.05] rounded w-20" />
            <div className="h-3 bg-white/[0.05] rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}
