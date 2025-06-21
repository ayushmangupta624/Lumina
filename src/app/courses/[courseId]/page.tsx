'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Play, BookOpen, ArrowRight } from "lucide-react";

interface Lesson {
  lessonId: string;
  lessonName: string;
  courseId: string;
  video?: {
    videoId: string;
    title: string;
    videoFilePath?: string;
  };
}

interface Course {
  courseId: string;
  courseName: string;
  lessons: Lesson[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log("Fetching course for ID:", params.courseId);
        const response = await fetch(`/api/courses/${params.courseId}`);
        const data = await response.json();
        
        console.log("API response:", data);
        
        if (!response.ok) {
          console.log("API error:", data.error);
          setError(data.error || "Failed to fetch course");
          return;
        }
        
        if (data.course) {
          setCourse(data.course);
          // Automatically redirect to the first lesson
          if (data.course.lessons && data.course.lessons.length > 0) {
            const firstLesson = data.course.lessons[0];
            console.log("Redirecting to lesson:", firstLesson.lessonId);
            router.replace(`/courses/${params.courseId}/${firstLesson.lessonId}`);
          } else {
            console.log("No lessons found, using fallback");
            // Fallback to hardcoded lesson IDs
            const fallbackLessonId = params.courseId === "course-2" ? "lesson-1" : "lesson-1";
            router.replace(`/courses/${params.courseId}/${fallbackLessonId}`);
          }
        } else {
          console.log("No course data found, using fallback");
          setError("Course not found");
          // Fallback redirect even if course not found
          const fallbackLessonId = params.courseId === "course-2" ? "lesson-1" : "lesson-1";
          router.replace(`/courses/${params.courseId}/${fallbackLessonId}`);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        // Fallback redirect on error
        const fallbackLessonId = params.courseId === "course-2" ? "lesson-1" : "lesson-1";
        router.replace(`/courses/${params.courseId}/${fallbackLessonId}`);
      } finally {
        setLoading(false);
        setRedirectAttempted(true);
      }
    };

    if (params.courseId && !redirectAttempted) {
      fetchCourse();
    }
  }, [params.courseId, router, redirectAttempted]);

  // Force redirect after a short delay if still on this page
  useEffect(() => {
    if (!loading && !error && redirectAttempted) {
      const timer = setTimeout(() => {
        console.log("Force redirect after timeout");
        const fallbackLessonId = params.courseId === "course-2" ? "lesson-1" : "lesson-1";
        router.replace(`/courses/${params.courseId}/${fallbackLessonId}`);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, error, redirectAttempted, params.courseId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-red-400">Error</h2>
            <p className="mt-2 text-white/80">{error}</p>
            <p className="mt-4 text-sm text-white/60">Redirecting to first lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached due to automatic redirect, but keeping as fallback
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white">Redirecting...</h2>
          <p className="mt-2 text-white/80">Taking you to the first lesson...</p>
          <div className="mt-4">
            <button 
              onClick={() => {
                const fallbackLessonId = params.courseId === "course-2" ? "lesson-1" : "lesson-1";
                router.replace(`/courses/${params.courseId}/${fallbackLessonId}`);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Click here if not redirected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
