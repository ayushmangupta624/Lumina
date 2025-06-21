'use client';

import { useEffect, useState } from "react";
import { useUser } from "@civic/auth/react";
import Link from "next/link";
import { BookOpen, Plus, ArrowRight } from "lucide-react";
import { useSpaceModal } from "@/app/layout";

const SpacesPage = () => {
  const { user } = useUser();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await fetch('/api/spaces');
        const data = await res.json();
        if (Array.isArray(data.spaces)) {
          setSpaces(data.spaces);
        } else {
          console.error("Invalid response format", data);
          setSpaces([]);
        }
      } catch (error) {
        console.error("Error fetching spaces:", error);
        setSpaces([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchSpaces();
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    const doUpsert = async () => {
      await fetch('/api/user/upsert', { method: 'POST' });
    };
    doUpsert();
  }, []);

  const { setIsModalOpen } = useSpaceModal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/10"></div>
          <div className="text-white/60">Loading your spaces...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-200">
            My Spaces
          </h1>
          <p className="text-white/60 mt-2">
            Manage and access all your knowledge spaces
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

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white/60" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No spaces yet</h3>
          <p className="text-white/60 mb-6">Create your first space to start organizing your knowledge</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-green-400 text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Space
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <Link 
              key={space.spaceId}
              href={`/spaces/${space.spaceName}`}
              className="group block"
            >
              <div className="h-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1f7d48] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gray-100" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
              {space.spaceName}
                </h3>
                <p className="text-white/60 text-sm">
                  Last updated recently
                </p>
              </div>
              </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpacesPage;
