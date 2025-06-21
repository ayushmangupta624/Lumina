import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db"
import { getUser } from "@civic/auth/nextjs";

export async function GET(req: NextRequest) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    try {
        // Get user with spaces and course progress
        const userData = await prismaClient.user.findUnique({
            where: { email: user.email },
            include: {
                space: true,
                courseProgress: {
                    where: {
                        completedAt: {
                            not: null
                        }
                    }
                },
                course: {
                    include: {
                        lessons: true,
                        lessonProgress: {
                            where: {
                                userId: user.email,
                                completedAt: {
                                    not: null
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!userData) {
            return NextResponse.json({ error: "user data not found" }, { status: 401 });
        }

        // Calculate stats
        const totalSpaces = userData.space.length;
        const completedCourses = userData.courseProgress.length;
        
        // Calculate total lessons completed across all courses
        const totalLessonsCompleted = userData.course.reduce((acc, course) => {
            return acc + course.lessonProgress.length;
        }, 0);

        // Calculate total lessons across all courses
        const totalLessons = userData.course.reduce((acc, course) => {
            return acc + course.lessons.length;
        }, 0);

        // Calculate completion percentage
        const completionPercentage = totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0;

        return NextResponse.json({
            stats: {
                totalSpaces,
                completedCourses,
                totalLessonsCompleted,
                totalLessons,
                completionPercentage
            }
        });

    } catch (e) {
        console.error("error while fetching dashboard stats", e);
        return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }
} 