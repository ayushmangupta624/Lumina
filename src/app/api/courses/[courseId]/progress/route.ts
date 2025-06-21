import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth/nextjs";
import { prismaClient } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await getUser();
  if (!user || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const userRecord = await prismaClient.user.findUnique({ where: { email: user.email } });
  if (!userRecord) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const lessons = await prismaClient.lesson.findMany({ where: { courseId: courseId } });
  const progress = await prismaClient.lessonProgress.findMany({
    where: { userId: userRecord.userId, courseId: courseId, completedAt: { not: null } },
  });

  const completedLessons = progress.map(p => p.lessonId);
  const isCourseComplete = completedLessons.length === lessons.length && lessons.length > 0;

  return NextResponse.json({
    completedLessons,
    totalLessons: lessons.length,
    isCourseComplete,
  });
} 