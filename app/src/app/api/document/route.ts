import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bucket } from "@/lib/gcs";
import { processDocument } from "@/lib/document-ai";
import { readDocumentResult } from "@/lib/read-result";
import crypto from "crypto";
export const runtime = "nodejs";

function cleanUpFileName(name:string){
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}
function connect(record:Record<string,unknown>){
  if(record==null) return null;
  return record.id;
}
function validateDate(date:string){
  const dateObj = new Date(date);
  return !isNaN(dateObj.getDate());
}
// upload files backend 
export async function POST(req: Request) {
  const formData = await req.formData();
  const uploadedPaths: string[] = [];
  const records: {
  fileName: string;
  type: string;
  status: string;
  storeIn: string;
  storagePath: string;
  subject?: string;
  category?: Record<string, unknown>;
  patient?: Record<string, unknown>;
  user?: Record<string, unknown>;
  specialist?: Record<string, unknown>;
  reportDate?: Date | null;
  }[]=[];
  const files = formData.getAll("files"); 
  if(!files) NextResponse.json({ error: "File missing" },{ status: 400 });
  try{
    
    for (const entry of files) {
        if (!(entry instanceof File)) {
        console.log("Received non-file entry:", entry);
        continue;
        }
        const file = entry; // now strongly typed as File
        const docExist = await prisma.document.findFirst({
            select: { id: true },
            where: {
            fileName: file.name,
            type: file.type
            }
        });
        if(docExist==null){
            const buffer = Buffer.from(await file.arrayBuffer());
            const id = crypto.randomUUID();
            const path = `uploads/${id}-${cleanUpFileName(file.name)}`;
            const upload=await bucket.file(path).save(buffer, {
                contentType: file.type,
                resumable: false,
            });
            uploadedPaths.push(path);
            const processRes=await processDoc(path);
            let status="Check";
            const newRec={fileName:file.name,type:file.type,status:status,storeIn:"Doctors Inbox",storagePath:path,subject:processRes.subject,categoryId:null,patientId:null,userId:null,specialistId:null,reportDate:null};
            newRec.status=status;
            newRec.patientId=connect(processRes.patient);
            newRec.categoryId=connect(processRes.category);
            newRec.userId=connect(processRes.user);
            newRec.specialistId=connect(processRes.specialist)
            newRec.reportDate=processRes.reportDate;
            if(processRes.user!=null&&processRes.patient!=null&&processRes.category!=null&&processRes.specialist!=null&&processRes.reportDate!=null&&processRes.subject!=""){
              status="verified";
            }
            records.push(newRec);
        }
    }
    if(records.length>0){
        const update=await prisma.document.createManyAndReturn({
        data: records,include:{user:true,category:true,specialist:true,patient:true}
        });
        return NextResponse.json(update);
    }

    
  }catch(err:unknown){
    console.log(err);
    await Promise.all(
      uploadedPaths.map((path) =>
        bucket.file(path).delete().catch(() => null)
      )
    );
     return NextResponse.json(err,{status:500});
  }

  return NextResponse.json(records);
}

async function processDoc(filepath:string){
  const result={
    reportDateString:'',
    reportDate:null,
    subject:'',
    patient:null,
    category:null,
    user:null,
    specialist:null

  };
  const bucket=process.env.GCS_BUCKET!
  const path=`gs://${bucket}/${filepath}`;

  const prefix=await processDocument(path);
  let extracted = await readDocumentResult(process.env.GCS_BUCKET!,prefix);
  if(extracted!=null){
    extracted=extracted.entities;
    // subject
    const subjects=extracted.filter((en)=>en.type=='document_subject');
    if(subjects.length>0){
      // get first subject
      const sub=subjects[0];
      result.subject=sub.mentionText;
    }
    // category
    const docTypes=extracted.filter((en)=>en.type=='document_type');
    if(docTypes.length>0){
      for(let x=0; x<docTypes.length; x++){
        const cat=docTypes[x].mentionText;
        const findCat=await prisma.category.findFirst({where:{category:{startsWith:cat,mode: 'insensitive'}}});
        if(findCat!=null){
          result.category=findCat;
          break;
        }
      }
    }
    // get patient
    const patWholeName=extracted.find((en)=>en.type==='patient_name')||null;
    const patFirstName=extracted.find((en)=>en.type==='patient_first_name')||null;
    const patLastName=extracted.find((en)=>en.type==='patient_last_name')||null;
    const patDob=extracted.find((en)=>en.type==='patient_dob')||null;
    if(patFirstName!=null&&patLastName!=null&&patDob!=null){
      const firstName=patFirstName.mentionText;
      const lastName=patLastName.mentionText;
      const dob=patDob.mentionText;
      let wholeName='';
      if(patWholeName!=null)wholeName=wholeName=patWholeName.mentionText;
      if(wholeName=='') wholeName+=firstName+" "+lastName;
      let patExist=null;
      const validDob=validateDate(dob);
      const patientMob=extracted.find((en)=>en.type==='patient_mobile');
      let patmobStr='';
      if(patientMob!=null){
        patmobStr=patientMob.mentionText;
      }
      if(validDob){
        const dobDate=new Date(dob);
        patExist=await prisma.patient.findFirst({where:{firstName:firstName,lastName:lastName,DOB:dobDate}});
      }else
      {
        const mobileStr=patmobStr;
        if(mobileStr!=null){
          const mobileFil=mobileStr.replace(/ /g, '');
          patExist=await prisma.patient.findFirst({where:{firstName:firstName,lastName:lastName,mobile:mobileFil}});
        }
      }
      // add new patient
      if(patExist==null){
        const mobileStr=patmobStr;
        const mobileFil=mobileStr.replace(/ /g, '');
        let address = "";
        let postcode = "";
        let suburb = "";
        const addressEntity = extracted.find(en => en.type === "patient_address");
        if (addressEntity && addressEntity.mentionText) {
          address = addressEntity.mentionText;
        }

        const postcodeEntity = extracted.find(en => en.type === "patient_postcode");
        if (postcodeEntity && postcodeEntity.mentionText) {
          postcode = postcodeEntity.mentionText;
        }

        const suburbEntity = extracted.find(en => en.type === "patient_suburb");
        if (suburbEntity && suburbEntity.mentionText) {
          suburb = suburbEntity.mentionText;
        }
        let dobV=null;
        if(validDob) dobV=new Date(dob);
        const newPat={firstName:firstName.trim(),lastName:lastName.trim(),DOB:dobV,wholeName:wholeName.trim(),mobile:mobileFil,address:address,postcode:postcode,suburb:suburb,stringDOB:dob};
        const patsave=await prisma.patient.create({data:newPat});
        result.patient=patsave;
      }else result.patient=patExist;
    }
    // check for doctor
    const user=extracted.find((en)=>en.type==='referring_doctor')||null;
    if(user!=null){
      const userName=user.mentionText.trim();
      const userExist=await prisma.user.findFirst({where:{name:userName}});
      // add user/doctor
      if(userExist==null){
        const newUser={name:userName};
        const saveUse=await prisma.user.create({data:newUser});
        result.user=saveUse;
      }else result.user=userExist;
    }
    // check for practitioner
    const prac=extracted.find((en)=>en.type==='practitioner')||null;
    if(prac!=null){
      const pracName=prac.mentionText.trim();
      let pracPractice=''
      let pracPos='';
      const pract=extracted.find((en)=>en.type==='practitioner_practice')||null;
      const pos=extracted.find((en)=>en.type=='practitioner_position')||null;
      if(pract!=null) pracPractice=pract.mentionText;
      if(pos!=null) pracPos=pos.mentionText;
      const existPrac=await prisma.specialist.findFirst({where:{name:pracName,practice:pracPractice,OR:[{position:pracPos}]}});
      if(existPrac==null){
        const newPrac={name:pracName,practice:pracPractice,position:pracPos};
        const savePrac=await prisma.specialist.create({data:newPrac});
        result.specialist=savePrac;
      }else result.specialist=existPrac;
    }
    // get date
    const date=extracted.find((en)=>en.type==='document_date')||null;
    if(date!=null){
      const dateStr=date.mentionText;
      if(validateDate(dateStr)){
        result.reportDate=new Date(dateStr);
      }
    }


  }
  console.log(result);
  return result;
}
// get all saved files
export async function GET(){
    const responses=[];
    try{
        const docs=await prisma.document.findMany({include:{user:true,category:true,specialist:true,patient:true}});
        for(let i=0; i<docs.length; i++){
            const doc=docs[i];
            const [url]=await bucket.file(doc.storagePath).getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + 1800_000, // 30 minutes
            });
            
            const resp={doc:doc,file:{
                url,
                type:doc.type
            }};
            responses.push(resp);
        }
    }catch(err:unknown){
        NextResponse.json(err,{status:500});
    }
    return NextResponse.json(responses);
}