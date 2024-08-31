import React from "react";
import { Select, SelectProps } from 'antd';
import { TypeTag } from "../../../components";
import { AdminRole } from "../../../common/I18NNamespace";
import { useDict } from "../../../common/dict";

// const _RoleTypes = [
//     {
//         label: "系统管理员",
//         value: 0,
//         color: "purple",
//     },
//     {
//         label: "超级管理员",
//         value: 1,
//         color: "gold",
//     },
//     {
//         label: "管理员",
//         value: 2,
//         color: "cyan",
//     },
//     {
//         label: "普通角色",
//         value: 3,
//         color: "lime",
//     }
// ]

// export const RoleType = {
//     options: _RoleTypes,
// }

/**
 * 角色类型的选择的下拉框
 * @returns 
 */
export const RoleTypeSelector: React.FC<SelectProps> = (props) => {
    const roleTypes = useDict("RoleType");
    return <Select
      options={roleTypes || []}
      {...props}
    />
}

/**
 * 角色类型的tag， 传入角色类型的值，返回一个antd的tag组件
 * @returns 
 */
export const RoleTypeTag = React.forwardRef<HTMLSpanElement, any>((props, ref) => {
    const roleTypes = useDict("RoleType");
    return <TypeTag I18Namespace={AdminRole} ref={ref} options={roleTypes || []}>{props.children}</TypeTag>
})
