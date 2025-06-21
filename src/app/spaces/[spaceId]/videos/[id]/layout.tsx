// This layout disables the Sidebar for the individual video page
export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
} 