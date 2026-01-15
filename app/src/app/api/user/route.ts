import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){
    let results=[];
    try{
        results=await prisma.user.findMany();
    }catch(err:unknown){
        console.error(err);
        return NextResponse.json(err,{status:500});
    }
    return NextResponse.json(results);
}