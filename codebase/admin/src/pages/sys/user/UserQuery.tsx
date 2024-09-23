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

import { useSelector, useTranslation } from '../../../hooks';
import { QueryComponent } from '../../../components';
import { Input, DatePicker } from "antd"
import { RoleSelector } from '../role';
import { UserSelector } from './index';
import { AdminUser } from '../../../common/I18NNamespace';

const { RangePicker } = DatePicker;

export type UserQueryType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

export const UserQuery: React.FC<UserQueryType> = ({onQuery}) => {

    const {t} = useTranslation(AdminUser);
    const size = useSelector(state => state.themeConfig.componentSize);

    const queryItems = [
        {
            label: t("账号"),
            name: "userId",
            inputElement: <UserSelector name="userId" mode='single' size={size} allowClear/>
        },
        {
            label: t("姓名"),
            name: "fullname_Q",
            inputElement: <Input name="fullname" size={size} allowClear/>
        },
        {
            label: t("邮件地址"),
            name: "email_Q",
            inputElement: <Input name="email" size={size} allowClear/>
        },
        {
            label: t("电话"),
            name: "phone_Q",
            inputElement: <Input name="phone" size={size} allowClear/>
        },
        {
            label: t("角色"),
            name: "roleIds",
            inputElement: <RoleSelector mode='multiple' allowClear/>  //mode: multiple, single
        },
        {
            label: t("创建时间"),
            name: "created",
            inputElement: <RangePicker name="created" size={size} allowClear/>
        },
    ]

    let onQueryEvent = (values) => {

        if(values.roleIds){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            values.roleIds = values.roleIds.map(item => item.value*1);
        }

        if(values.created){
            let start = values.created[0].format("YYYY-MM-DD");
            let end = values.created[1].format("YYYY-MM-DD");
            // console.log(start, end);
            values['startDate'] = start;
            values['endDate'] = end;
            delete values.created
        }

        if(values.userId){
            values.userId = values.userId[0].value * 1;
        }

        let vs = {};
        Object.keys(values).forEach(key => {
            let nkey = key;
            if(key.endsWith("_Q")){
                nkey = key.replace("_Q", "");
            }
            vs[nkey] = values[key] 
        });

        onQuery(vs);
    }

    return <>
        <QueryComponent items={queryItems} onQuery={onQueryEvent} />
    </>
}

