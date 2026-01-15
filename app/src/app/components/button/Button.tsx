'use client'

import { Component } from "react"
import { Button as MuiButton } from "@mui/material"
export interface Props{
    children?: React.ReactNode;
    onclick?: () => void;
    type?: 'button' | 'submit' | 'reset'
}
export default class Button extends Component<Props>{
    render(){
        return(
            <div className="Component">
            <MuiButton type={this.props.type} size="medium" variant="outlined" onClick={this.props.onclick}>{this.props.children}</MuiButton>
            </div>
        )
    }
}