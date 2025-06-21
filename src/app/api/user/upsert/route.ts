import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/lib/upsertUser";

export async function POST(req: NextRequest){
    try {
        await upsertUser(); 
        return NextResponse.json({ success: true });
    } catch (e){
        console.error(e); 
        return NextResponse.json({ error: "Failed to upsert user" }, { status: 500 });
    }
}