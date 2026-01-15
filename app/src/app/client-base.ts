const api="http://localhost:3000/api";
type data=Record<string,unknown>;

export async function fetchRequest(route:string,method:string,body:data|FormData|null=null,file:boolean=false){
    const url=api+route;
    const configReq:data=config(method,file,body);
    const request=await fetch(url,configReq);
    return request;
} 

function config(method:string,file:boolean=false,object:data|FormData|null=null){
    let config:data={
      method:method.toUpperCase(),
      headers:{
      },
    };
    if(object!=null){
        if(file){
            config={
              method:method.toUpperCase(),
              body:object,
              headers:{
                
              },
            };
        }else{
          config={
            method:method.toUpperCase(),
            headers:{
              'Content-Type': 'application/json',
              'body':JSON.stringify(object)
            },
          };
         
        }
    }
    return config;
  }