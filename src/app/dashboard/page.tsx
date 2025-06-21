'use client'; 

import { useUser } from "@civic/auth/react";
import { prismaClient } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useSpaceModal } from "@/app/layout";

export default function DashboardPage() {
  const { user } = useUser();

  if (!user || !user.email) {
    redirect("/login");
  }

useEffect(() => {
  const doUpsert = async () => {
    await fetch('/api/user/upsert', {method: 'POST'}); 
  }; 
  doUpsert(); 
}, [])

  const { setIsModalOpen } = useSpaceModal();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>

      <div className="flex h-screen">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            <div className="mb-8 mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl ml-4 font-bold text-gray-200">
                Welcome back, {user.name?.split(" ")[0]}
              </h1>
                <p className="text-white/60 ml-4 mt-2">
                Here's what's happening with your spaces today.
              </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-[#1f7d48] text-gray-100 font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Create New Space
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}