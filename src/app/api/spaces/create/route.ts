import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { getUser } from "@civic/auth/nextjs";

export async function POST(req: NextRequest){
    const user = await getUser(); 
    if(!user){
        return NextResponse.json({error: "User not found"}, {status: 404}); 
    }

try {

    const body = await req.json(); 
    const name = body.name; 

    if(typeof name !== "string" || name.trim() === ""){
        return NextResponse.json({error: "Invalid space name"}, {status: 400}); 
    }

    const userData = await prismaClient.user.findUnique({
        where: {email: user.email}
    })

    const spaceData  = await prismaClient.space.create({
        data: {
            spaceName: name, 
            userId: userData?.userId ?? ""
        }
    })
    return NextResponse.json(spaceData, {status: 201})
} catch (e){
    console.log(e); 
    return NextResponse.json({error: "internal server error"}, {status: 500})
}
}