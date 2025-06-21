'use client';

import { Plus, Upload } from "lucide-react";

interface SpaceHeaderProps {
  spaceName: string;
  onCreateVideo: () => void;
  onAddFile: () => void;
}

export default function SpaceHeader({ spaceName, onCreateVideo, onAddFile }: SpaceHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          {spaceName}
        </h1>
        <p className="text-white/60 mt-2">
          Your personalized learning space
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onAddFile}
          className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Add New File
        </button>
        <button
          onClick={onCreateVideo}
          className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-[#1f7d48] text-gray-100 font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Create New Video
        </button>
      </div>
    </div>
  );
} 