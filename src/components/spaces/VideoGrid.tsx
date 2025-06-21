'use client';

import { PlayCircle, FileText } from "lucide-react";
import Link from "next/link";

interface VideoGridProps {
  videos: { videoId: string; title: string; thumbnailUrl: string; }[];
  spaceId: string; 
}

export default function VideoGrid({ videos, spaceId }: VideoGridProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-white mb-6">Videos</h2>
      {videos.length === 0 ? (
        <div className="text-white/60 text-center py-10 rounded-lg bg-white/5 border border-white/10">
          No videos in this space yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link href={`/spaces/${spaceId}/videos/${video.videoId}`}>
            <div 
              key={video.videoId}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="relative w-full h-40 bg-gray-800 flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <PlayCircle className="w-16 h-16 text-white/40" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-12 h-12 text-white/80" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white truncate mb-1">
                  {video.title}
                </h3>
                <p className="text-sm text-white/60">Last watched: yesterday</p>
              </div>
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 