import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth/nextjs";
import { prismaClient } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const user = await getUser();
  if (!user || !user.email) {
    console.log("No user found");
    return NextResponse.json({ error: "user not found" }, { status: 401 });
  }

  const { courseId } = await params;
  console.log("Looking for courseId:", courseId);
  console.log("User email:", user.email);

  try {
    // First find the user by email
    const userRecord = await prismaClient.user.findUnique({
      where: { email: user.email },
    });

    if (!userRecord) {
      console.log("User record not found for email:", user.email);
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    console.log("Found user record:", userRecord.userId);

    // Then find the course by courseId and userId
    const course = await prismaClient.course.findUnique({
      where: {
        courseId: courseId,
        userId: userRecord.userId,
      },
      include: {
        lessons: {
          include: {
            video: true,
          },
        },
      },
    });

    if (!course) {
      console.log("Course not found for courseId:", courseId, "and userId:", userRecord.userId);
      return NextResponse.json({ error: "course not found" }, { status: 404 });
    }

    console.log("Found course:", course.courseName);
    return NextResponse.json({ course }, { status: 200 });
  } catch (e) {
    console.error("Failed to fetch course:", e);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
