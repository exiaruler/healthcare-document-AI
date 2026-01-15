'use client'

import { FormLabel, TextField } from "@mui/material";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  required?:boolean;
  type?:string|'text';
}
export default function Input(props:Props){
    return(
        <div className="Component">
        <div>
        <FormLabel>{props.label}</FormLabel>
        </div>
        <TextField type={props.type} required={props.required} value={props.value} disabled={props.disabled} onChange={(e) => props.onChange(e.target.value)} />
        </div>
    )
}