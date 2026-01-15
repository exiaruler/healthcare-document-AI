import styles from "./page.module.css";
import ClientPage from "./client/client-page";
import { fetchRequest } from "./client-base";
async function getDocuments(){
  let data=[];
  try{
    const request=await fetchRequest('/document','GET');
    if(request.ok) data=await request.json();
  }catch(err){
    return [];
  }
  return data;
}
async function categorySetup() {
  let data=[];
  try{
    const request=await fetchRequest('/category','POST');
    if(request.ok) data=await request.json();
  }catch(err){
    return [];
  }
  return data;
}
async function getPatients() {
  let data=[];
  try{
    const request=await fetchRequest('/patient','GET');
    if(request.ok) data=await request.json();
  }catch(err){
    return [];
  }
  return data;
}
async function getUsers() {
  let data=[];
  try{
    const request=await fetchRequest('/user','GET');
    if(request.ok) data=await request.json();
  }catch(err){
    return [];
  }
  return data;
}
async function getSpecliast() {
  let data=[];
  try{
    const request=await fetchRequest('/specialist','GET');
    if(request.ok) data=await request.json();
  }catch(err){
    return [];
  }
  return data;
}

export default async function Home() {
  const categorys=await categorySetup();
  const patients=await getPatients();
  const docs=await getDocuments();
  const special=await getSpecliast();
  const users=await getUsers();
  return (
    <div >
      <main className="App">
      <ClientPage documents={docs} categories={categorys} patients={patients} users={users} contacts={special}/>
     
      </main>
    </div>
  );
}
