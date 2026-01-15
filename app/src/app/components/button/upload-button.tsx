'use client'
import styled from "@emotion/styled";
import Button from "./Button";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button as MuiButton } from "@mui/material"
import React, { ChangeEvent, createRef, Dispatch, SetStateAction } from 'react';
import { Props as base } from "./Button";
interface Props extends base{
    onChange?:CallableFunction;
}
interface State {
  files: File[];
}
export default class UploadButton extends Button{
    declare props:Props
    public fileInputRef = createRef<HTMLInputElement>();
    state: State = {
        files: []
    };

    VisuallyHiddenInput = styled('input')({
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            height: 1,
            overflow: 'hidden',
            position: 'absolute',
            bottom: 0,
            left: 0,
            whiteSpace: 'nowrap',
            width: 1,
    });

    handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        if(this.props.onChange) this.props.onChange(event);
    };

    handleUpload():void{
        this.fileInputRef.current?.click();
        if(this.props.onclick) this.props.onclick();
    }
    render(){
        return(
            <div className="Component">
            <MuiButton type="button" size="medium" variant="outlined" startIcon={<CloudUploadIcon />} onClick={()=>this.handleUpload()}>Upload Documents
            <this.VisuallyHiddenInput type='file' multiple={true}
            onChange={this.handleFileChange} ref={this.fileInputRef}
            />
            </MuiButton>
            </div>
        )
    }
}