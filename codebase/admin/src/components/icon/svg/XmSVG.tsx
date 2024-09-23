/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import React, { forwardRef, useEffect, useRef, useState } from "react"
import { theme } from 'antd'
import "./XmSVG.css"
import { useSelector } from "../../../hooks";

type SVGComponent<P = {}> = React.FunctionComponent<P> & React.FC<P>;

export interface XmSVGType  {
    SVGElement?: SVGComponent,
    primaryColor?: string,
    primaryHoverColor?: string,
    secondColor?: string,
    secondHoverColor?: string,
    width?: number | string,
    height?: number | string,
    /**
     * 如果是custom那么这个图标就是普通的图标，使用自定义颜色，
     * primary: 是antd的按钮类型：会根据antd的primary类型的按钮颜色一致
     * default: 是antd的按钮类型，会根据antd的default类型的按钮颜色一致
     */
    type?: 'primary'|'default',
    /**
     * antd 的按钮类型
     */
    danger?: boolean, 
    /**
     * 图标的上下偏移量，主要用于精确调整图标的上下位置
     */
    offSetY?: number | string,  
    /**
     *  antd 的按钮类型
     */
    ghost?: boolean,
    iconName?: string,
    onClick?: (e) => void
    className?: string,
    style?: {
        [key: string]: string | number
    },
}

const isBlackColor = (color: string) => {
    color = color.replace(/\s+/ig, "");
    if(color && (
        color.indexOf("#000000")>-1
        || color.indexOf("#000") > -1
        || color.indexOf("rgb(0,0,0)") > -1
        || color.indexOf("rgba(0,0,0,0)") >-1
    )){
        return true
    }else {
        return false;
    }
}

/**
 * 这里的svg定义： path的默认颜色是黑色的是主颜色，其他颜色的是次要颜色
 * @param 
 * @returns 
 */
export const XmSVG : React.FC<XmSVGType> = ({
    SVGElement,
    primaryColor,
    primaryHoverColor,
    secondColor,
    secondHoverColor,
    width,
    height,
    type,
    danger = false,
    offSetY = 1,
    ghost=false,
    iconName,
    className,
    ...props
}) => {
// export const XmSVG : React.FC<XmSVGType> = ({
//     SVGElement,
//     primaryColor,
//     primaryHoverColor,
//     secondColor,
//     secondHoverColor,
//     width,
//     height,
//     type,
//     danger = false,
//     offSetY = 1,
//     ghost=false,
//     iconName,
//     className,
//     ...props
// }) => {
    const svgRef = useRef<HTMLSpanElement>(null);
    // const [mainColor, setMainColor] = useState(primaryColor);
    let mainColor = primaryColor;
    let mainHoverColor = primaryHoverColor;

    const {token} = theme.useToken();

    const size = useSelector(state => state.themeConfig.componentSize);

    const buildPos = (width, height, size) => {
        if(width && height){
            let tw = width, th = height;
            if(typeof tw == 'number'){
                tw = tw+"px"
            }
            if(typeof th == 'number'){
                th = th+"px"
            }
            
            return {width: tw, height: th};
        }else{
            if(size == 'small'){
               return {width: "12px", height: "12px"}
            }else if(size == 'large'){
                return {width: "20px", height: "20px"};
            }else {
                return {width: "16px", height: "16px"};
            }
        }
    }

    if(type){
        if(type == 'primary'){
            if(danger){
                if(ghost){
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    secondColor = token.colorError;
                    secondHoverColor = token.colorErrorHover;
                }else{
                    mainColor = token.colorWhite;
                    mainHoverColor = token.colorWhite;
                    secondColor = token.colorWhite;
                    secondHoverColor = token.colorWhite;
                }
            }else{
                if(ghost){
                    mainColor = token.colorPrimary;
                    mainHoverColor = token.colorPrimaryHover;
                    secondColor = token.colorError;
                    secondHoverColor = token.colorErrorHover;
                }else{
                    mainColor = token.colorWhite;
                    mainHoverColor = token.colorWhite;
                    secondColor = token.colorError;
                    secondHoverColor = token.colorErrorHover;
                }
            }
        }else if(type == 'default'){
            if(danger){
                if(ghost){
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    secondColor = token.colorPrimary;
                    secondHoverColor = token.colorPrimaryHover;
                }else{
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    secondColor = token.colorPrimary;
                    secondHoverColor = token.colorPrimaryHover;
                }
            }else{
                if(ghost){
                    mainColor = token.colorPrimaryHover;
                    mainHoverColor = token.colorPrimaryHover;
                    secondColor = "";
                    secondHoverColor = "";
                }else{
                    mainColor = token.colorText;
                    mainHoverColor = token.colorPrimaryHover;
                    secondColor = token.colorPrimary;
                    secondHoverColor = token.colorPrimaryHover;
                }
            }
        }
    }

    const style: any = {
        "--var-xmsvg-color": mainColor,
        position: 'relative',
        top: offSetY,
        ...props.style
    };

    if(mainHoverColor){
        style['--var-xmsvg-color-hover'] = mainHoverColor;
    }
    if(secondColor) {
        style['--var-xmsvg-second-color'] = secondColor;
    }
    if(secondHoverColor) {
        style['--var-xmsvg-second-color-hover'] = secondHoverColor;
    }

    useEffect(()=>{
        if(!mainColor) return;

        let paths  = svgRef.current.querySelectorAll("path");
        paths.forEach(path => { 
            let fill = path.getAttribute("fill");
            if(!fill){
                fill = path.style.fill;
            }

            if(!fill) return;

            //给path标记className, 以配合css样式
            let isBlack = isBlackColor(fill);

            if(isBlack){
                if(mainColor){
                    path.classList.add("xmsvg-main");
                    path.style.cssText = "";
                    path.removeAttribute("fill");
                }
            }else{
                if(secondColor){
                    path.classList.add("xmsvg-second");
                    path.style.cssText = "";
                    path.removeAttribute("fill");
                }
            }

        })

        let svg = svgRef.current.querySelector("svg");
        let pos = buildPos(width, height, size);
        svg.style.width = pos.width;
        svg.style.height = pos.height; 

    }, [svgRef]);

    let localClassName = "svg-icon-wrap";
    if(className){
        localClassName = className + " "+ localClassName
    }

    return <span className={localClassName} {...props} ref={svgRef} style={{...style, ...props.style}}>
            <SVGElement />
        </span>

}

