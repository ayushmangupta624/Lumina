'use client';

import { File, ImageIcon, Film, FileText, FileAudio, FileArchive, ArrowRight } from "lucide-react";

interface FileListProps {
  files: { id: string; name: string; type: string; url: string; }[];
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'image':
      return <ImageIcon className="w-6 h-6 text-blue-400" />;
    case 'video':
      return <Film className="w-6 h-6 text-green-400" />;
    case 'pdf':
      return <FileText className="w-6 h-6 text-red-400" />;
    case 'audio':
      return <FileAudio className="w-6 h-6 text-purple-400" />;
    case 'zip':
    case 'rar':
      return <FileArchive className="w-6 h-6 text-yellow-400" />;
    default:
      return <File className="w-6 h-6 text-white/60" />;
  }
};

export default function FileList({ files }: FileListProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-white mb-6">Files & Media</h2>
      {files.length === 0 ? (
        <div className="text-white/60 text-center py-10 rounded-lg bg-white/5 border border-white/10">
          No files or media in this space yet.
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <a 
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <p className="text-white font-medium break-all">{file.name}</p>
                  <p className="text-white/60 text-sm">{file.type.toUpperCase()} File</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
} 