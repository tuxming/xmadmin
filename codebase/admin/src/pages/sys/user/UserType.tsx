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
import { useDict } from "../../../common/dict";
import { TypeTag } from "../../../components";
import { AdminUser } from "../../../common/I18NNamespace";

export interface UserProps {
    id?: number,
    username?: string,
    fullname?: string, 
    password?: string,
    repassword?: string,
    gender?: number,
    email?: string,
    phone?: string,
    photo?: any,
    deptId?: number,
    status?: number,
    deptName?: string,
    [key: string]: any,
}

/**
 * 用户状态的tag， 传入组织类型的值，返回一个antd的tag组件
 * @returns 
 */
export const UserStatusTag = React.forwardRef<HTMLSpanElement, any>((props, ref) => {
    const userStatus = useDict("UserStatus");
    return <TypeTag I18Namespace={AdminUser} ref={ref} options={userStatus || []}>{props.children}</TypeTag>
})