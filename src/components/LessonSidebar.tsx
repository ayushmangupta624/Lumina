'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Play } from "lucide-react";
import Link from "next/link";

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

interface LessonSidebarProps {
  currentLessonId: string;
}

export default function LessonSidebar({ currentLessonId }: LessonSidebarProps) {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.courseId}`);
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Failed to fetch course:", data.error);
          // Use fallback data if API fails
          const fallbackCourse: Course = {
            courseId: params.courseId as string,
            courseName: params.courseId === "course-2" ? "Intro to Calculus" : "Machine Learning Fundamentals",
            lessons: params.courseId === "course-2" ? [
              {
                lessonId: "lesson-1",
                lessonName: "Derivatives",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-1",
                  title: "Derivatives Basics",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-2", 
                lessonName: "Integrals",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-2",
                  title: "Integration Techniques",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-3",
                lessonName: "Differential Equations", 
                courseId: params.courseId as string,
                video: {
                  videoId: "video-3",
                  title: "Solving Differential Equations",
                  videoFilePath: undefined
                }
              }
            ] : [
              {
                lessonId: "lesson-1",
                lessonName: "Introduction to Machine Learning",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-1",
                  title: "ML Basics",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-2", 
                lessonName: "Supervised Learning",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-2",
                  title: "Supervised Learning",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-3",
                lessonName: "Unsupervised Learning", 
                courseId: params.courseId as string,
                video: {
                  videoId: "video-3",
                  title: "Unsupervised Learning",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-4",
                lessonName: "Neural Networks",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-4", 
                  title: "Neural Networks",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-5",
                lessonName: "Model Evaluation",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-5",
                  title: "Model Evaluation", 
                  videoFilePath: undefined
                }
              }
            ]
          };
          setCourse(fallbackCourse);
          return;
        }
        
        if (data.course) {
          setCourse(data.course);
        } else {
          // Use fallback data if no course found
          const fallbackCourse: Course = {
            courseId: params.courseId as string,
            courseName: params.courseId === "course-2" ? "Intro to Calculus" : "Machine Learning Fundamentals",
            lessons: params.courseId === "course-2" ? [
              {
                lessonId: "lesson-1",
                lessonName: "Derivatives",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-1",
                  title: "Derivatives Basics",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-2", 
                lessonName: "Integrals",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-2",
                  title: "Integration Techniques",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-3",
                lessonName: "Differential Equations", 
                courseId: params.courseId as string,
                video: {
                  videoId: "video-3",
                  title: "Solving Differential Equations",
                  videoFilePath: undefined
                }
              }
            ] : [
              {
                lessonId: "lesson-1",
                lessonName: "Introduction to Machine Learning",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-1",
                  title: "ML Basics",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-2", 
                lessonName: "Supervised Learning",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-2",
                  title: "Supervised Learning",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-3",
                lessonName: "Unsupervised Learning", 
                courseId: params.courseId as string,
                video: {
                  videoId: "video-3",
                  title: "Unsupervised Learning",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-4",
                lessonName: "Neural Networks",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-4", 
                  title: "Neural Networks",
                  videoFilePath: undefined
                }
              },
              {
                lessonId: "lesson-5",
                lessonName: "Model Evaluation",
                courseId: params.courseId as string,
                video: {
                  videoId: "video-5",
                  title: "Model Evaluation", 
                  videoFilePath: undefined
                }
              }
            ]
          };
          setCourse(fallbackCourse);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        // Use fallback data on error
        const fallbackCourse: Course = {
          courseId: params.courseId as string,
          courseName: params.courseId === "course-2" ? "Intro to Calculus" : "Machine Learning Fundamentals",
          lessons: params.courseId === "course-2" ? [
            {
              lessonId: "lesson-1",
              lessonName: "Derivatives",
              courseId: params.courseId as string,
              video: {
                videoId: "video-1",
                title: "Derivatives Basics",
                videoFilePath: undefined
              }
            },
            {
              lessonId: "lesson-2", 
              lessonName: "Integrals",
              courseId: params.courseId as string,
              video: {
                videoId: "video-2",
                title: "Integration Techniques",
                videoFilePath: undefined
              }
            },
            {
              lessonId: "lesson-3",
              lessonName: "Differential Equations", 
              courseId: params.courseId as string,
              video: {
                videoId: "video-3",
                title: "Solving Differential Equations",
                videoFilePath: undefined
              }
            }
          ] : [
            {
              lessonId: "lesson-1",
              lessonName: "Introduction to Machine Learning",
              courseId: params.courseId as string,
              video: {
                videoId: "video-1",
                title: "ML Basics",
                videoFilePath: undefined
              }
            },
            {
              lessonId: "lesson-2", 
              lessonName: "Supervised Learning",
              courseId: params.courseId as string,
              video: {
                videoId: "video-2",
                title: "Supervised Learning",
                videoFilePath: undefined
              }
            },
            {
              lessonId: "lesson-3",
              lessonName: "Unsupervised Learning", 
              courseId: params.courseId as string,
              video: {
                videoId: "video-3",
                title: "Unsupervised Learning",
                videoFilePath: undefined
              }
            },
            {
              lessonId: "lesson-4",
              lessonName: "Neural Networks",
              courseId: params.courseId as string,
              video: {
                videoId: "video-4", 
                title: "Neural Networks",
                videoFilePath: undefined
              }
            },
            {
              lessonId: "lesson-5",
              lessonName: "Model Evaluation",
              courseId: params.courseId as string,
              video: {
                videoId: "video-5",
                title: "Model Evaluation", 
                videoFilePath: undefined
              }
            }
          ]
        };
        setCourse(fallbackCourse);
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId]);

  if (loading) {
    return (
      <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/10 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/10 p-4">
        <div className="text-white/60">Course not found</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1">{course.courseName}</h2>
        <p className="text-sm text-white/60">{course.lessons.length} lessons</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {course.lessons.map((lesson, index) => {
            const isActive = lesson.lessonId === currentLessonId;
            const hasVideo = lesson.video && lesson.video.videoFilePath;
            
            return (
              <Link
                key={lesson.lessonId}
                href={`/courses/${params.courseId}/${lesson.lessonId}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/10 text-white border-l-4 border-l-green-400' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{lesson.lessonName}</div>
                  {hasVideo && (
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <Play className="w-3 h-3" />
                      <span>Video available</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 