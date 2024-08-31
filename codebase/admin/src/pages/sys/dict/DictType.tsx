import React from "react";
import { Select, SelectProps } from 'antd';
import { TypeTag } from "../../../components";
import { AdminDept } from "../../../common/I18NNamespace";


//值类型：0-文本，1-数值，3-图片id,  4-json
const _DictTypes = [
    {
        label: "文本",
        value: 0,
        color: "purple",
    },
    {
        label: "数值",
        value: 1,
        color: "gold",
    },
    {
        label: "图片id",
        value: 3,
        color: "cyan",
    },
    {
        label: "json",
        value: 4,
        color: "#108ee9",
    }
]

/**
 * 组织类型
 */
export const DictType = {
    options: _DictTypes,
}

/**
 * 组织类型的选择的下拉框
 * @returns 
 */
export const DictTypeSelector: React.FC<SelectProps> = (props) => {
    return <Select
      options={DictType.options}
      {...props}
    />
}

/**
 * 组织类型的tag， 传入组织类型的值，返回一个antd的tag组件
 * @returns 
 */
export const DictTypeTag = React.forwardRef<HTMLSpanElement, any>((props, ref) => {
    return <TypeTag I18Namespace={AdminDept} ref={ref} options={_DictTypes}>{props.children}</TypeTag>
})

