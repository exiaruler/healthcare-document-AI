/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Grid,Box, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from "@mui/material";
import { DataGrid, GridEventListener, GridRowClassNameParams, GridRowSelectionModel } from "@mui/x-data-grid";

import Button from "../components/button/Button";
import HorizontalStack from "../components/layout/horizontal-stack";
import { ChangeEvent, useEffect, useState } from "react";
import UploadButton from "../components/button/upload-button";
import dynamic from "next/dynamic";
import {fetchRequest} from "../client-base";
import Paper from "../components/layout/paper";
import DropDown, { DropdownOption } from "../components/input/dropdown";
import Input from "../components/input/input";
const PdfViewer = dynamic(() => import("../components/pdf/pdf-viewer"), {
  ssr: false,
});
interface TableRecord{
  id:number;
  status:string;
  inbox:string;
  patient:string;
  user:string;
  file:File;
  doc:Record<string,any>|null;
}
type Props={
  documents:Array<Record<string,any>>;
  categories:Array<Record<string,any>>;
  patients:Array<Record<string,any>>;
  users:Array<Record<string,any>>;
  contacts:Array<Record<string,any>>;
}
export default function ClientPage(props:Props) {
  const [uploadFiles,setUploadFiles]=useState<TableRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>();
  const [file,setFile]=useState<TableRecord|null>(null);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const findUpload=(name:string,type:string):TableRecord|null=>{
    return uploadFiles.find((it)=>it.file.name==name&&type==type)||null
  }
  const findUploadById=(id:number):TableRecord|null=>{
    return uploadFiles.find((it)=>it.id==id)||null
  }
  const uploadHandle=async()=>{
    const uploads=uploadFiles;
    let docs=[];
    for(let i=0; i<uploads.length; i++){

    }

    try{
      const request=await fetchRequest('/etl','POST',null,true);
    }catch(err:unknown){

    }

  }
  const createRow=(doc:Record<string,any>,rowNumber:number,file:File):TableRecord=>{
    let pat="Not Found";
    let user="Not Found";
    if(doc.doc.patient!=null){
      pat=doc?.doc.patient.wholeName;
      if(pat=="")pat=doc?.doc.patient.firstName+" "+doc?.doc.patient.lastName;
      if(pat=="")pat="Not Found";
    }
    if(doc.doc.user!=null){
      user=doc?.doc.user.name;
    }
    return {
    id: rowNumber,
    status: doc.doc.status,
    inbox: doc.doc.storeIn,
    patient: pat,
    user: user,
    file,
    doc: doc.doc
};
  }
  const loadDocuments=()=>{
    const docs=props.documents;
    console.log(docs)
    let count=0;
    const arr=[];
    for(let i=0; i<docs.length; i++){
      const doc=docs[i];
      count++;
      const row=createRow(doc,count,doc.file);
      arr.push(row);
    }
    setUploadFiles(arr);
    console.log(arr)
  }
  const updateTable=async(event: ChangeEvent<HTMLInputElement>)=>{
    const files = event.target.files;
    const arr:Array<TableRecord>=[];
    let len=uploadFiles.length;
    if (!files) return;
    const upfiles:Array<File>=[];
    for(let i=0; i<uploadFiles.length; i++){
      const data=uploadFiles[i].file||null;
      if(data!=null) upfiles.push(data);
    }
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try{
      let records=[];
      const request=await fetchRequest('/document','POST',formData,true);
      if(request.ok){
        records=await request.json();
      }
      
      for(let i=0; i<records.length; i++){
        const doc=records[i];
        const exist=findUpload(doc.fileName,doc.type);
        if(exist==null){
          len++;
          let curFile=null;
          // find file
          for(let x=0; x<files.length; x++){
            const fi=files[i];
            if(fi.name===doc.fileName&&fi.type===doc.type){
              curFile=fi;
              break;
            }
          }
          let pat="Not Found";
          let user="Not Found";
          if(doc.patient!=null){
            pat=doc?.patient.wholeName;
          }
          if(doc.user!=null){
            user=doc?.user.name;
          }
          if(curFile!=null){
            const rec:TableRecord={
            id:len,
            status: doc.status,
            inbox: doc.storeIn,
            patient: pat,
            user: user,
            file:curFile,
            doc:doc
          }
          arr.push(rec);
          }
      }
    }
    if(arr.length>0) setUploadFiles(prev=>[...prev,...arr]);
    }catch(err:unknown){
      console.error(err);
    }
  }

  const handleRowClick: GridEventListener<'rowClick'> = (params, event, details) => {
    const rowId=params.row.id;
    const rec=findUploadById(rowId);
    setFile(rec);
    setActiveRowId(rowId);
  };

  const getRowClassName = (params: GridRowClassNameParams) => {
  return params.id === activeRowId ? 'Mui-selected-row' : '';
};

  const handleCheckboxSelection = (selection: GridRowSelectionModel) => {
    //console.log('CHECKBOX SELECTED', selection);
    setSelectedIds(selection);
  };

  useEffect(()=>{
    loadDocuments();
  },[setUploadFiles])
  return (
    <div>
        <Grid id="Main" container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
        <HorizontalStack>
        <UploadButton onChange={(event:ChangeEvent<HTMLInputElement>)=>updateTable(event)}/>
        <Button onclick={uploadHandle}>Auto Bulk Import</Button>
        <Button>Expand</Button>
        </HorizontalStack>
        <Box sx={{ width: '100%', height: { xs: 300, sm: 500, md: 700 } }}>
        <div>
        <DataGrid style={{width:'80%'}} columns={[
        { field: 'id', headerName: '#' },
        { field: 'status', headerName: 'Status' },
        { field: 'inbox', headerName: 'Inbox' },
        { field: 'patient', headerName: 'Patient' },
        { field: 'user',headerName: 'User'},
        ]}
        rows={uploadFiles} 
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selectedIds}
        onRowSelectionModelChange={handleCheckboxSelection}
        onRowClick={handleRowClick}
        autoHeight
        pageSizeOptions={[5, 10]}
        getRowClassName={getRowClassName}
  sx={{
    '& .Mui-selected-row': {
      backgroundColor: 'rgba(25, 118, 210, 0.12)',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.18)',
      },
    },
  }}
        />
        </div>
        </Box>
        
        </Grid>
        <Grid>
        <Grid id="Sub-Main" container spacing={3}>
        <Grid id="File-Upload-View" >
        {!file?
        <Box sx={{border:'1px grey solid', width:'530px', height:'250px',borderRadius:'25px'}}>
        <div style={{textAlign:'center'}}>
        <h3>No Documents Selected</h3>
        <p>Upload or drag a document. Or select one from your import queue</p>
        <UploadButton onChange={(event:ChangeEvent<HTMLInputElement>)=>updateTable(event)}/>
        </div>
        </Box>
        :null}
        {file?
        <PdfViewer file={file.file}/>
        :null}
        </Grid>
        <Grid id="Form" >
        <Paper>
        <FormControl>
        <HorizontalStack>
        <FormLabel>Inbox Type</FormLabel>
        <RadioGroup
        row
        
        name="row-radio-buttons-group"
      >
        <FormControlLabel value="Doctor Inbox" control={<Radio />} label="Doctor Inbox" />
        <FormControlLabel value="Patient File" control={<Radio />} label="Patient's File" />
        </RadioGroup>
        </HorizontalStack>
        <DropDown value={undefined} onChange={function (value: DropdownOption | null): void {
                    throw new Error("Function not implemented.");
                  } } options={props.patients||[]} label="Patient" displayKey={"wholeName"} valueKey={"id"}/>
        <Input label="Date" type="date" value={""} onChange={function (value: string): void {
              throw new Error("Function not implemented.");
            } }/>
        <Input label="Subject" value={""} onChange={function (value: string): void {
              throw new Error("Function not implemented.");
            } }/>
        <DropDown value={undefined} onChange={function (value: DropdownOption | null): void {
                    throw new Error("Function not implemented.");
                  } } options={props.contacts||[]} label="Contact" displayKey={"name"} valueKey={"id"}/>
        <DropDown value={undefined} onChange={function (value: DropdownOption | null): void {
                    throw new Error("Function not implemented.");
                  } } options={[]} label="Store in" displayKey={""} valueKey={""}/>
        <DropDown value={undefined} onChange={function (value: DropdownOption | null): void {
                    throw new Error("Function not implemented.");
                  } } options={props.users||[]} label="User" displayKey={"name"} valueKey={"id"}/>
        <DropDown value={undefined} onChange={function (value: DropdownOption | null): void {
                    throw new Error("Function not implemented.");
                  } } options={props.categories||[]} label="Category" displayKey={"category"} valueKey={"id"}/>
        <HorizontalStack>
        <Button>Import</Button>
        <Button>Send Email</Button>
        <Button>Report Error</Button>
        </HorizontalStack>
        </FormControl>
        </Paper>
        </Grid>
        </Grid>
        </Grid>
        </Grid>
    </div>
  );
}