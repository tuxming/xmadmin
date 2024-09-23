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


import './iconfont/iconfont.css';
import { createStyles } from 'antd-style';
import React from 'react';

type IconType = {
    fontClass?: string;
    unicode? : string; 
    size?: string;
    color?: string;
    hoverColor?: string;
} & React.HTMLAttributes<HTMLDivElement>

export const IconFont = React.forwardRef<HTMLDivElement, IconType>(({
    color, hoverColor, size, fontClass, unicode,
    className,
    ...props
}, ref) => {
  
    const useStyles = createStyles(({token, css}) => ({
        xmIcon: css`
            ${color? 'color:'+color+';': ''}
            ${hoverColor? 'cursor: pointer;': ''}
            font-size: ${size || '16'}px;
            ${hoverColor? '&:hover{color: '+hoverColor+';}': ''}
        `
    }));
    
    const { styles, cx, theme } = useStyles();

    if(fontClass){
        return <i ref={ref} className={`iconfont ${fontClass} ${cx('xmIcon', styles.xmIcon)} ${className || ''}`} {...props}></i>
    }else if(unicode){
        return <i ref={ref} className={`iconfont ${cx('xmIcon', styles.xmIcon)} `} {...props}>{unicode}</i>
    }else{
        return <></>
    }
});

// export const IconFont: React.FC<IconType> = ({
//     color, hoverColor, size, fontClass, unicode,
//     className,
//     ...props
// }) => {

//     const useStyles = createStyles(({token, css}) => ({
//         xmIcon: css`
//             ${color? 'color:'+color+';': ''}
//             ${hoverColor? 'cursor: pointer;': ''}
//             font-size: ${size || '16'}px;
//             ${hoverColor? '&:hover{color: '+hoverColor+';}': ''}
//         `
//     }));
    
//     const { styles, cx, theme } = useStyles();

//     if(fontClass){
//         return <i className={`iconfont ${fontClass} ${cx('xmIcon', styles.xmIcon)} ${className || ''}`} {...props}></i>
//     }else if(unicode){
//         return <i className={`iconfont ${cx('xmIcon', styles.xmIcon)} `} {...props}>{unicode}</i>
//     }else{
//         return <></>
//     }

// };