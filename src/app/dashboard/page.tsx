'use client'; 

import { useUser } from "@civic/auth/react";
import { redirect } from "next/navigation";
import { Plus, BookOpen, Target, TrendingUp, Clock, CheckCircle, PlayCircle, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useSpaceModal } from "@/app/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalSpaces: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  totalLessons: number;
  completionPercentage: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  if (!user || !user.email) {
    redirect("/login");
  }

  useEffect(() => {
    const doUpsert = async () => {
      await fetch('/api/user/upsert', { method: 'POST' }); 
    }; 
    doUpsert(); 
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const { setIsModalOpen } = useSpaceModal();

  const StatCard = ({ title, value, description, icon: Icon, color }: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    color: string;
  }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  const ActivityCard = ({ title, description, time, type }: {
    title: string;
    description: string;
    time: string;
    type: 'course' | 'lesson' | 'space';
  }) => {
    const getIcon = () => {
      switch (type) {
        case 'course':
          return <BookOpen className="h-4 w-4 text-blue-400" />;
        case 'lesson':
          return <PlayCircle className="h-4 w-4 text-green-400" />;
        case 'space':
          return <FolderOpen className="h-4 w-4 text-purple-400" />;
      }
    };

    return (
      <div className="flex items-center space-x-4 p-4 rounded-lg bg-card/30 border border-white/5 hover:bg-card/50 transition-colors">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>

      <div className="flex h-screen">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl ml-4 font-bold text-gray-200">
                  Welcome back, {user.name?.split(" ")[0]}
                </h1>
                <p className="text-white/60 ml-4 mt-2">
                  Here's your learning progress and recent activity.
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

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Spaces"
                value={loading ? "..." : stats?.totalSpaces || 0}
                description="Learning spaces created"
                icon={FolderOpen}
                color="bg-purple-500/20"
              />
              <StatCard
                title="Courses Completed"
                value={loading ? "..." : stats?.completedCourses || 0}
                description="Courses finished"
                icon={CheckCircle}
                color="bg-green-500/20"
              />
              <StatCard
                title="Lessons Completed"
                value={loading ? "..." : `${stats?.totalLessonsCompleted || 0}/${stats?.totalLessons || 0}`}
                description="Lessons finished"
                icon={BookOpen}
                color="bg-blue-500/20"
              />
              <StatCard
                title="Completion Rate"
                value={loading ? "..." : `${stats?.completionPercentage || 0}%`}
                description="Overall progress"
                icon={TrendingUp}
                color="bg-orange-500/20"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your latest learning activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ActivityCard
                    title="Intro to Calculus"
                    description="Completed lesson: Derivatives"
                    time="2 hours ago"
                    type="lesson"
                  />
                  <ActivityCard
                    title="Machine Learning Basics"
                    description="Started new course"
                    time="1 day ago"
                    type="course"
                  />
                  <ActivityCard
                    title="Physics Research"
                    description="Created new space"
                    time="3 days ago"
                    type="space"
                  />
                  <ActivityCard
                    title="Quantum Mechanics"
                    description="Completed lesson: Wave Functions"
                    time="1 week ago"
                    type="lesson"
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Continue where you left off
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button className="w-full p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-white">Continue Calculus</p>
                        <p className="text-sm text-muted-foreground">Lesson 2: Integrals</p>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="font-medium text-white">Start New Course</p>
                        <p className="text-sm text-muted-foreground">Browse available courses</p>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 rounded-lg bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="font-medium text-white">Create Space</p>
                        <p className="text-sm text-muted-foreground">Organize your learning</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <div className="mt-8">
              <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    Learning Progress
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your overall learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stats?.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{stats?.totalSpaces || 0}</p>
                        <p className="text-xs text-muted-foreground">Spaces</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stats?.completedCourses || 0}</p>
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stats?.totalLessonsCompleted || 0}</p>
                        <p className="text-xs text-muted-foreground">Lessons</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}