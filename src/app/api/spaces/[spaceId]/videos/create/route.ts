import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { title, prompt, videoFilePath, spaceId, mainContentUrl } = body;
    
    if (
      typeof title !== "string" || title.trim() === "" ||
      typeof prompt !== "string" || prompt.trim() === "" ||
      typeof videoFilePath !== "string" || videoFilePath.trim() === "" ||
      typeof spaceId !== "string" || spaceId.trim() === ""
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const video = await prismaClient.video.create({
      data: {
        title,
        prompt,
        videoFilePath,
        spaceId,
        mainContentUrl: typeof mainContentUrl === "string" && mainContentUrl.trim() !== "" ? mainContentUrl : undefined,
      },
    }); 
    console.log(body, video)

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}