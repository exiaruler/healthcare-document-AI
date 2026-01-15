'use client'
import { Paper as PaperComponent } from "@mui/material";
type Props = {
children?: React.ReactNode;
}
export default function Paper({ children }: Props){
    return(
        <PaperComponent elevation={1}>
        {
            children
        }
        </PaperComponent>
    )
}