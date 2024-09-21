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