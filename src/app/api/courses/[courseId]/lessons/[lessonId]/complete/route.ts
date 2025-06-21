import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth/nextjs";
import { prismaClient } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
  const user = await getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { courseId, lessonId } = await params;
    const userRecord = await prismaClient.user.findUnique({ where: { email: user.email } });
    if (!userRecord) return NextResponse.json({ error: "User not found" }, { status: 404 });

    console.log(`Marking lesson ${lessonId} as complete for user ${userRecord.userId} in course ${courseId}`);

    // Mark lesson as complete - using the correct unique constraint
    await prismaClient.lessonProgress.upsert({
      where: { 
        userId_lessonId: { 
          userId: userRecord.userId, 
          lessonId: lessonId 
        } 
      },
      update: { completedAt: new Date() },
      create: {
        userId: userRecord.userId,
        lessonId: lessonId,
        courseId: courseId,
        completedAt: new Date(),
      },
    });

    console.log(`Lesson ${lessonId} marked as complete`);

    // Check if all lessons are now complete and update CourseProgress
    const lessons = await prismaClient.lesson.findMany({ where: { courseId: courseId } });
    const progress = await prismaClient.lessonProgress.findMany({
      where: { 
        userId: userRecord.userId, 
        courseId: courseId, 
        completedAt: { not: null } 
      },
    });

    console.log(`Course ${courseId}: ${progress.length}/${lessons.length} lessons completed`);

    if (progress.length === lessons.length && lessons.length > 0) {
      await prismaClient.courseProgress.upsert({
        where: { 
          userId_courseId: { 
            userId: userRecord.userId, 
            courseId: courseId 
          } 
        },
        update: { completedAt: new Date() },
        create: {
          userId: userRecord.userId,
          courseId: courseId,
          completedAt: new Date(),
        },
      });
      console.log(`Course ${courseId} marked as complete`);
    }

    return NextResponse.json({ 
      success: true, 
      completedLessons: progress.length,
      totalLessons: lessons.length,
      isCourseComplete: progress.length === lessons.length && lessons.length > 0
    });
  } catch (error) {
    console.error("Error marking lesson as complete:", error);
    return NextResponse.json({ error: "Failed to mark lesson as complete" }, { status: 500 });
  }
} 