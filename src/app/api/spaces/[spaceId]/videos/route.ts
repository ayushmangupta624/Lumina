import { NextResponse, NextRequest } from "next/server";
import { prismaClient } from "@/lib/db"
import { getUser } from "@civic/auth/nextjs";

export async function GET(req: NextRequest, {params}: {params: {spaceId: string}}){

    const user = await getUser();

    if(!user){
        return NextResponse.json({error: 'User not found'}, {status:404})
    }

    try {
        const videos = await prismaClient.video.findMany({
            where: {
                spaceId: params.spaceId
            }
        })
        console.log(videos); 
        return NextResponse.json({videos}); 
    } catch(e){
        console.log(e); 
        return NextResponse.json({'error': 'something went wrong'}, {status: 500})
    }



}