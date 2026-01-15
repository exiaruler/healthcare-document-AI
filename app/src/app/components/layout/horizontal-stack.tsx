'use client'
import { Stack } from "@mui/material"
import { ReactNode } from "react"
type Props={
    children?:ReactNode
}
export default function HorizontalStack(props:Props){
  
    return(
        <div className="Component">
        <Stack direction="row" spacing={1}>
        {
            props.children
        }
        </Stack>
        </div>
    )
}