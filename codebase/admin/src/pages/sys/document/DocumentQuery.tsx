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

import { QueryComponent } from '../../../components';
import { useTranslation,useSelector } from '../../../hooks';
import { Input, DatePicker } from "antd"
import { UserSelector } from '../user/index';
import { AdminDocument } from '../../../common/I18NNamespace';

const { RangePicker } = DatePicker;


export type DocumentQueryType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

/**
 * 文件管理的搜索条件表单
 * @returns 
 */
export const DocumentQuery: React.FC<DocumentQueryType> = ({onQuery}) => {

    const size = useSelector(state => state.themeConfig.componentSize);
    const {t} = useTranslation(AdminDocument);

    const queryItems = [
        {
            label: t("文件名"),
            name: "name",
            inputElement: <Input name="name" size={size} allowClear/>
        },
        {
            label: t("创建人"),
            name: "creater",
            inputElement: <UserSelector name="creater" mode='single' size={size} allowClear/>
        },
        {
            label: t("文件类型"),
            name: "type",
            inputElement: <Input name="type" size={size} allowClear/>
        },
        {
            label: t("备注"),
            name: "remark",
            inputElement: <Input name="remark" size={size} allowClear/>
        },
        {
            label: t("创建时间"),
            name: "created",
            inputElement: <RangePicker name="created" size={size} allowClear/>
        }
    ]

    let onQueryEvent = (values) => {

        if(values.creater){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            // console.log(values.creater);
            values.creater = values.creater[0].key * 1
        }

        if(values.created){
            let start = values.created[0].format("YYYY-MM-DD");
            let end = values.created[1].format("YYYY-MM-DD");
            // console.log(start, end);
            values['startDate'] = start;
            values['endDate'] = end;
            delete values.created
        }

        onQuery(values);
    }

    return <>
        <QueryComponent items={queryItems} onQuery={onQueryEvent} />
    </>
}

