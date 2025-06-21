import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db"
import { getUser } from "@civic/auth/nextjs";


export async function GET(req: NextRequest){
    const user = await getUser();
    if(!user){
        return NextResponse.json({error: "user not found"}, {status: 404}); 
    }

    try {
        //search for courses
        const res = await prismaClient.user.findUnique({
            where: {email: user.email}, 
            include: {
                course: {
                    include: {
                        lessons: {
                            include: {
                                video: true,
                            },
                        },
                    },
                },
            }, 
        })

        if(!res){
            return NextResponse.json({error: "some error lolz"}, {status: 401})
        }

        return NextResponse.json({courses: res.course})

    } catch(e) {
        console.error("error while fetching learning courses", e); 
        return NextResponse.json({error: "internal server error"}, {status: 500})
    }


}