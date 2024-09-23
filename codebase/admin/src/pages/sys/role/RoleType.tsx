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
