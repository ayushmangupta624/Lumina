import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth/nextjs";
import { prismaClient } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId } = await params;
    const userRecord = await prismaClient.user.findUnique({ where: { email: user.email } });
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`Resetting course ${courseId} for user ${userRecord.userId}`);

    // Delete all lesson progress for this course and user
    await prismaClient.lessonProgress.deleteMany({
      where: {
        userId: userRecord.userId,
        courseId: courseId,
      },
    });

    // Delete course progress for this course and user
    await prismaClient.courseProgress.deleteMany({
      where: {
        userId: userRecord.userId,
        courseId: courseId,
      },
    });

    console.log(`Course ${courseId} reset successfully`);

    return NextResponse.json({ 
      success: true, 
      message: "Course progress reset successfully" 
    });
  } catch (error) {
    console.error("Error resetting course:", error);
    return NextResponse.json({ error: "Failed to reset course" }, { status: 500 });
  }
} 