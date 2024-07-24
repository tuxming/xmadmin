import React, {useRef} from "react";
import { Select, SelectProps, Tag, TagProps } from 'antd';

const _RoleTypes = [
    {
        label: "系统管理员",
        value: 0,
        color: "purple",
    },
    {
        label: "超级管理员",
        value: 1,
        color: "gold",
    },
    {
        label: "管理员",
        value: 2,
        color: "cyan",
    },
    {
        label: "普通角色",
        value: 3,
        color: "lime",
    }
]

export const RoleType = {
    options: _RoleTypes,
}

/**
 * 角色类型的选择的下拉框
 * @returns 
 */
export const RoleTypeSelector: React.FC<SelectProps> = (props) => {
    return <Select
      options={RoleType.options}
      {...props}
    />
}

/**
 * 角色类型的tag， 传入角色类型的值，返回一个antd的tag组件
 * @returns 
 */
export const RoleTypeTag = React.forwardRef<HTMLSpanElement, TagProps>(({ children, ...props }, ref) => {
    
    let text : any = children;
    let childrenType = typeof text;
    let color = "success";
    if(childrenType  == 'string' || childrenType == 'number'){
        let type = _RoleTypes.find(rt => (rt.value) == children);
        if(type){
            text = type.label;
            color = type.color;
        }
    }

    // 使用 useRef 来创建一个 ref，确保它是 HTMLSpanElement 类型
    const tagRef = ref || useRef<HTMLSpanElement>(null);

    return <Tag ref={tagRef} bordered={false} color={color} {...props}>{text}</Tag>
})