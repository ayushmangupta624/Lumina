'use client';

import { useEffect, useState } from "react";
import { useUser } from "@civic/auth/react";
import Link from "next/link";
import { BookOpen, Plus, ArrowRight, Play } from "lucide-react";
import { useSpaceModal } from "@/app/layout";

interface Course {
  courseId: string;
  courseName: string;
  lessons: any[];
}

const CoursesPage = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/debug');
      const data = await response.json();
      
      if (response.ok && data.courses) {
        setCourses(data.courses);
      } else {
        setError(data.error || "Failed to fetch courses");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const populateDatabase = async () => {
    try {
      const response = await fetch('/api/courses/debug', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        alert("Sample courses created successfully! Refresh the page to see them.");
        fetchCourses();
      } else {
        alert("Failed to create sample courses: " + data.error);
      }
    } catch (err) {
      alert("Error creating sample courses: " + err);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  const { setIsModalOpen } = useSpaceModal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#22c55e]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Error</h2>
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={populateDatabase}
            className="bg-gradient-to-r from-[#1f7d48] to-[#22c55e] text-white px-4 py-2 rounded hover:from-[#1b6d3f] hover:to-[#1f7d48] transition-all duration-300"
          >
            Create Sample Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Available Courses</h1>
          <button
            onClick={populateDatabase}
            className="bg-gradient-to-r from-[#1f7d48] to-[#22c55e] text-white px-4 py-2 rounded hover:from-[#1b6d3f] hover:to-[#1f7d48] transition-all duration-300"
          >
            Create Sample Courses
          </button>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">No courses available yet.</p>
            <button
              onClick={populateDatabase}
              className="bg-gradient-to-r from-[#1f7d48] to-[#22c55e] text-white px-6 py-3 rounded-lg hover:from-[#1b6d3f] hover:to-[#1f7d48] transition-all duration-300"
            >
              Create Sample Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#1f7d48] to-[#22c55e] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-white/60">{course.lessons?.length || 0} lessons</span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{course.courseName}</h3>
                <p className="text-white/60 mb-4">
                  Master the fundamentals of {course.courseName.toLowerCase()} through interactive lessons and hands-on exercises.
                </p>
                
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${course.courseId}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1f7d48] to-[#22c55e] text-white px-4 py-2 rounded-lg hover:from-[#1b6d3f] hover:to-[#1f7d48] transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                    Start Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to reset progress for "${course.courseName}"? This will remove all lesson completions.`)) {
                        try {
                          const response = await fetch(`/api/courses/${course.courseId}/reset`, { method: 'POST' });
                          if (response.ok) {
                            alert('Course progress reset successfully!');
                            fetchCourses(); // Refresh the page
                          } else {
                            alert('Failed to reset course progress.');
                          }
                        } catch (error) {
                          alert('Error resetting course progress.');
                        }
                      }
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 border border-red-500/30"
                    title="Reset course progress"
                  >
                    ↺
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
