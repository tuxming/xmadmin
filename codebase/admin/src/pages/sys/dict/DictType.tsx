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

