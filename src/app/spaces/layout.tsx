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
  X,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreate = async () => {
    if (!spaceName.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/spaces/create', {
        'method': 'POST', 
        headers: {
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({name: spaceName})
      });
      
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSpaceName("");
          setShowSuccess(false);
        }, 2000);
      }
    } catch(e: any) {
      console.log(e.error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user || !user.email) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r hover:cursor-pointer from-blue-400 to-green-400 bg-clip-text text-transparent">
                Create New Space
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setShowSuccess(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {!showSuccess ? (
                <>
                  <div>
                    <label htmlFor="spaceName" className="block text-sm font-medium text-white/80 mb-2">
                      Space Name
                    </label>
                    <input
                      type="text"
                      id="spaceName"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white"
                      placeholder="Enter space name"
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={isLoading || !spaceName.trim()}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-400 to-green-400 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Space'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-black" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Space Created Successfully!</h3>
                    <p className="text-white/60 mt-1">Redirecting you to your new space...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        <Sidebar onCreateSpace={() => setIsModalOpen(true)} />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 