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
import { Input } from "antd"
import { UserSelector } from '../user/index';
import { AdminRole } from '../../../common/I18NNamespace';


export type RoleQueryType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

/**
 * 角色搜索条件表单
 * @returns 
 */
export const RoleQuery: React.FC<RoleQueryType> = ({onQuery}) => {

    const size = useSelector(state => state.themeConfig.componentSize);
    const {t} = useTranslation(AdminRole);

    const queryItems = [
        {
            label: t("角色名"),
            name: "userId",
            inputElement: <UserSelector name="userId" mode='single' size={size} allowClear/>
        },
        {
            label: t("角色代码"),
            name: "code",
            inputElement: <Input name="code" size={size} allowClear/>
        },
        {
            label: t("角色类型"),
            name: "types",
            inputElement: <Input name="types" size={size} allowClear/>
        },
        {
            label: t("创建人"),
            name: "creaters",
            inputElement: <UserSelector name="creaters" mode='multiple' size={size} allowClear/>
        }
    ]

    let onQueryEvent = (values) => {

        if(values.types){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            values.types = values.types.map(item => item.value*1);
        }
        if(values.creaters){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            values.creaters = values.creaters.map(item => item.value*1);
        }

        onQuery(values);
    }

    return <>
        <QueryComponent items={queryItems} onQuery={onQueryEvent} />
    </>
}

