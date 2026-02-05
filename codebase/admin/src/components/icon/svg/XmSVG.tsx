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

import React, { useEffect, useRef } from "react"
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

// 保留原有功能：主色/次色 + 多状态，同时结合 currentColor（主色由 span 控制）
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

    const {token} = theme.useToken();

    const size = useSelector(state => state.themeConfig.componentSize);

    const buildPos = (w: number | string | undefined, h: number | string | undefined, s: string | undefined) => {
        if (w && h) {
            let tw: string | number = w;
            let th: string | number = h;
            if (typeof tw === 'number') {
                tw = tw + 'px';
            }
            if (typeof th === 'number') {
                th = th + 'px';
            }
            return { width: tw as string, height: th as string };
        }
        if (s === 'small') {
            return { width: '12px', height: '12px' };
        }
        if (s === 'large') {
            return { width: '20px', height: '20px' };
        }
        return { width: '16px', height: '16px' };
    };

    // 计算主色/次色及 hover 色
    let mainColor = primaryColor;
    let mainHoverColor = primaryHoverColor;
    let second = secondColor;
    let secondHover = secondHoverColor;

    if (type) {
        if (type === 'primary') {
            if (danger) {
                if (ghost) {
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    second = token.colorError;
                    secondHover = token.colorErrorHover;
                } else {
                    mainColor = token.colorWhite;
                    mainHoverColor = token.colorWhite;
                    second = token.colorWhite;
                    secondHover = token.colorWhite;
                }
            } else {
                if (ghost) {
                    mainColor = token.colorPrimary;
                    mainHoverColor = token.colorPrimaryHover;
                    second = token.colorError;
                    secondHover = token.colorErrorHover;
                } else {
                    mainColor = token.colorWhite;
                    mainHoverColor = token.colorWhite;
                    second = token.colorError;
                    secondHover = token.colorErrorHover;
                }
            }
        } else if (type === 'default') {
            if (danger) {
                if (ghost) {
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    second = token.colorPrimary;
                    secondHover = token.colorPrimaryHover;
                } else {
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    second = token.colorPrimary;
                    secondHover = token.colorPrimaryHover;
                }
            } else {
                if (ghost) {
                    mainColor = token.colorPrimaryHover;
                    mainHoverColor = token.colorPrimaryHover;
                    second = '';
                    secondHover = '';
                } else {
                    mainColor = token.colorText;
                    mainHoverColor = token.colorPrimaryHover;
                    second = token.colorPrimary;
                    secondHover = token.colorPrimaryHover;
                }
            }
        }
    }

    // 主色通过 currentColor 继承（span 的 color）
    const style: any = {
        color: mainColor || token.colorText,
        position: 'relative',
        top: offSetY,
        ...props.style,
    };

    // hover / 次色通过 CSS 变量控制
    if (mainHoverColor) {
        style['--var-xmsvg-color-hover'] = mainHoverColor;
    }
    if (second) {
        style['--var-xmsvg-second-color'] = second;
    }
    if (secondHover) {
        style['--var-xmsvg-second-color-hover'] = secondHover;
    }

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = svgRef.current.querySelector('svg') as any;
        if (!svg) return;

        // 设置 svg 尺寸
        const pos = buildPos(width, height, size) as { width: string; height: string };
        svg.style.width = pos.width;
        svg.style.height = pos.height;

        // 根据 path 的原始 fill 颜色打主色/次色标记
        const paths = svg.querySelectorAll('path');
        paths.forEach((path: SVGPathElement) => {
            let fill = path.getAttribute('fill') || path.style.fill || '';
            if (!fill) return;

            const black = isBlackColor(fill);

            if (black && mainColor) {
                path.classList.add('xmsvg-main');
                path.style.cssText = '';
                path.removeAttribute('fill');
            } else if (!black && second) {
                path.classList.add('xmsvg-second');
                path.style.cssText = '';
                path.removeAttribute('fill');
            }
        });
    }, [svgRef, width, height, size, mainColor, second]);

    let localClassName = "svg-icon-wrap";
    if(className){
        localClassName = className + " "+ localClassName
    }

    return (
        <span
            className={localClassName}
            {...props}
            ref={svgRef}
            style={style}
        >
            <SVGElement />
        </span>
    )

}

