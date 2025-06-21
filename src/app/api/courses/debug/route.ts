import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth/nextjs";
import { prismaClient } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "user not found" }, { status: 401 });
  }

  try {
    // Get all courses for the user
    const userRecord = await prismaClient.user.findUnique({
      where: { email: user.email },
      include: {
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    // Test lesson progress
    const lessonProgress = await prismaClient.lessonProgress.findMany({
      where: { userId: userRecord.userId },
      include: { lesson: true }
    });

    return NextResponse.json({ 
      user: { email: userRecord.email, userId: userRecord.userId },
      courses: userRecord.course,
      lessonProgress: lessonProgress
    }, { status: 200 });
  } catch (e) {
    console.error("Failed to fetch debug info:", e);
    return NextResponse.json(
      { error: "internal server error", details: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find or create user
    let userRecord = await prismaClient.user.findUnique({
      where: { email: user.email },
    });

    if (!userRecord) {
      userRecord = await prismaClient.user.create({
        data: { email: user.email },
      });
    }

    // Create sample courses
    const course1 = await prismaClient.course.upsert({
      where: { courseId: "course-1" },
      update: {},
      create: {
        courseId: "course-1",
        courseName: "Machine Learning Fundamentals",
        userId: userRecord.userId,
      },
    });

    const course2 = await prismaClient.course.upsert({
      where: { courseId: "course-2" },
      update: {},
      create: {
        courseId: "course-2",
        courseName: "Intro to Calculus",
        userId: userRecord.userId,
      },
    });

    // Create lessons for course 1
    const mlLessons = [
      { lessonId: "lesson-1", lessonName: "Introduction to Machine Learning" },
      { lessonId: "lesson-2", lessonName: "Supervised Learning" },
      { lessonId: "lesson-3", lessonName: "Unsupervised Learning" },
      { lessonId: "lesson-4", lessonName: "Neural Networks" },
      { lessonId: "lesson-5", lessonName: "Model Evaluation" },
    ];

    for (const lesson of mlLessons) {
      await prismaClient.lesson.upsert({
        where: { lessonId: lesson.lessonId },
        update: {},
        create: {
          lessonId: lesson.lessonId,
          lessonName: lesson.lessonName,
          courseId: course1.courseId,
        },
      });
    }

    // Create lessons for course 2
    const calcLessons = [
      { lessonId: "lesson-1", lessonName: "Derivatives" },
      { lessonId: "lesson-2", lessonName: "Integrals" },
      { lessonId: "lesson-3", lessonName: "Differential Equations" },
    ];

    for (const lesson of calcLessons) {
      await prismaClient.lesson.upsert({
        where: { lessonId: lesson.lessonId },
        update: {},
        create: {
          lessonId: lesson.lessonId,
          lessonName: lesson.lessonName,
          courseId: course2.courseId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sample courses and lessons created successfully",
      courses: [course1, course2],
    });
  } catch (error) {
    console.error("Error creating sample data:", error);
    return NextResponse.json(
      { error: "Failed to create sample data" },
      { status: 500 }
    );
  }
} 