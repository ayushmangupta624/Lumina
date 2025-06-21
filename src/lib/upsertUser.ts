import { prismaClient } from "@/lib/db";
import { getUser } from "@civic/auth/nextjs";
import { NextResponse } from "next/server";

export async function upsertUser(){
const user = await getUser(); 

if(!user){
return NextResponse.json({error: "user not found"}, {status: 404})
}


await prismaClient.user.upsert({
    where: { email: user.email },
    update: {},
    create: { email: user.email ?? "" },
  });
}