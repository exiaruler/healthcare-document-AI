import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(){
    let results=[];
    const categorys=['Admissions summary','Advance care planning ',
        'Allied health letter',
        'Certificate ',
        'Clinical notes',
        'Clinical photograph',
        'Consent form',
        'DAS21',
        'Discharge summary',
        'ECG',
        'Email',
        'Form',
        'Immunisation',
        'Indigenous PIP',
        'Letter',
        'Medical imaging report ',
        'MyHealth registration',
        'New PT registration form',
        'Pathology results',
        'Patient consent',
        'Record request ',
        'Referral letter',
        'Workcover',
        'Workcover consent'
    ];
    try {
        const entries=[];
        for(let i=0; i<categorys.length; i++){
            const cat=categorys[i].trim();
            const catExist = await prisma.category.findFirst({
            where: {
            category:cat
            }
            });
            if(catExist==null){
                entries.push({category:cat});
            }else results.push(catExist);
        }
        if(entries.length>0){
            const save=await prisma.category.createManyAndReturn({data:entries});
            results=save;
        }
        
    } catch (err:unknown) {
         return NextResponse.json(err,{status:500});
    }
    return NextResponse.json(results)
}