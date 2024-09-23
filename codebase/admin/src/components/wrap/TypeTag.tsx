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

import type { TagProps } from "antd";
import { Tag } from "antd";
import React, { useRef } from "react";
import { useTranslation } from "../../hooks";

export type TypeTagOptionProps = {
    label: string, 
    value: string | number,
    color?: string
}

export type TypeTagProps = TagProps & {
    options: TypeTagOptionProps[],
    I18Namespace: string,
}

/**
 * 根据传入的类型Type返回一个antd的tag组件
 */
export const TypeTag = React.forwardRef<HTMLSpanElement, TypeTagProps>(({
    options, 
    I18Namespace, 
    children, 
    ...props 
}, ref) => {
    
    const {t} = useTranslation(I18Namespace);

    let text : any = children;
    let childrenType = typeof text;
    let color = "success";
    if(childrenType  == 'string' || childrenType == 'number'){
        let type = options.find(rt => (rt.value) == children);
        if(type){
            text = t(type.label);
            color = type.color;
        }
    }

    // 使用 useRef 来创建一个 ref，确保它是 HTMLSpanElement 类型
    const tagRef = ref || useRef<HTMLSpanElement>(null);

    return <Tag ref={tagRef} bordered={false} color={color} {...props}>{text}</Tag>
});