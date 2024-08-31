import React from "react";
import { Select, SelectProps } from 'antd';
import { TypeTag } from "../../../components";
import { AdminDept } from "../../../common/I18NNamespace";
import { useDict } from "../../../common/dict";


//组织类型：0-个人，1-小组，2-部门，3-公司，4-集团
// const _DeptTypes = [
//     {
//         label: "个人",
//         value: 0,
//         color: "purple",
//     },
//     {
//         label: "小组",
//         value: 1,
//         color: "gold",
//     },
//     {
//         label: "部门",
//         value: 2,
//         color: "cyan",
//     },
//     {
//         label: "公司",
//         value: 3,
//         color: "lime",
//     },
//     {
//         label: "集团",
//         value: 4,
//         color: "#108ee9",
//     }
// ]

const _DeptTypes = [];


/**
 * 组织类型的选择的下拉框
 * @returns 
 */
export const DeptTypeSelector: React.FC<SelectProps> = (props) => {
    const deptTypes = useDict("DeptType");
    return <Select
      options={deptTypes || []}
      {...props}
    />
}

/**
 * 组织类型的tag， 传入组织类型的值，返回一个antd的tag组件
 * @returns 
 */
export const DeptTypeTag = React.forwardRef<HTMLSpanElement, any>((props, ref) => {
    const deptTypes = useDict("DeptType");
    return <TypeTag I18Namespace={AdminDept} ref={ref} options={deptTypes || []}>{props.children}</TypeTag>
})

