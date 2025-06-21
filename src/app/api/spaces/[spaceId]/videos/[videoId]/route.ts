import { NextResponse, NextRequest } from "next/server";
import { prismaClient } from "@/lib/db"

export async function GET( request: NextRequest, { params }: { params: { spaceId: string; videoId: string } }) {
  try {
    const video = await prismaClient.video.findUnique({
      where: { 
        videoId: params.videoId,
        spaceId: params.spaceId,
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      videoId: video.videoId,
      title: video.title,
      prompt: video.prompt,
      videoFilePath: video.videoFilePath,
      createdAt: video.createdAt,
      spaceId: video.spaceId,
      mainContentUrl: video.mainContentUrl || null,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
} 
