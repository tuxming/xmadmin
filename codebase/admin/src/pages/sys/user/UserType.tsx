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