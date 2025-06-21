'use client';

import { useUser } from "@civic/auth/react";
import { SignOutButton, UserButton } from "@civic/auth/react";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  Menu, 
  Plus, 
  Book
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSpaceModal } from "@/app/layout";

interface SidebarProps {
  // onCreateSpace: () => void; // No longer needed as prop
}

export default function Sidebar(/*{ onCreateSpace }: SidebarProps*/) {
  const { user } = useUser();
  const pathname = usePathname();
  const { setIsModalOpen } = useSpaceModal(); // Use the context hook

  if (!user || !user.email) {
    redirect("/login");
  }

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <aside className="w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">
            Knowlify
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard') 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/spaces" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/spaces') 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            My Spaces
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)} // Use the context to open modal
            className="w-full flex items-center hover:cursor-pointer gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Space
          </button>

          <Link 
            href="/courses" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/courses') 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Book className="w-5 h-5" />
            Featured Courses
          </Link>


          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/settings') 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-white/60 truncate">{user.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-lg border-b border-white/10 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-white">
          Lumina
        </h1>
        <button className="p-2 hover:bg-white/5 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </>
  );
} 