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


import React, {useState} from 'react';
import { Button, Input, Space,Form,theme } from "antd"
import { useSelector } from "../../hooks"
import { DoubleLeftOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { SearchIcon } from '../icon/svg/Icons';

export type QueryComponentItemType = {
    name: string,       //查询字段名
    label: string,      //查询字段显示名
    value?: any         //默认值
    inputElement: React.ReactElement  //字段的输入组件
}

export type QueryComponentType = {
    items?: QueryComponentItemType[],  //要查询的字段集合
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

/**
 * 查询条件组件
 * @param props : QueryComponentType
 * @returns 
 */
export const QueryComponent : React.FC<QueryComponentType> = ({items = [], onQuery}) => {
    const collasped = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const width = useSelector(state => state.globalVar.width);
    const [basicValue, setBasicValue] = useState();
    const {token} =  theme.useToken();
    const size = useSelector(state => state.themeConfig.componentSize);

    let isQueryMin = (width < 768 && width > 576 && !collasped) || width<576;

    const [isQueryBasic, setIsQueryBasic] = useState(true);
    let basicLayoutCss : React.CSSProperties = {
        boxSizing: 'content-box',
        display: 'flex',
        justifyContent: "space-between",
        gap: 10,
        flexWrap: 'wrap'
    }

    let advLayoutCss : React.CSSProperties = {
        boxSizing: 'content-box',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between'
    }

    let basicQueryBtnsCss : React.CSSProperties = {
        flexShrink:0, flexGrow:1,
        textAlign:'center',
    }

    let advQueryBtnsCss : React.CSSProperties = {
        textAlign:isQueryMin? 'center':'right',
        flexShrink:0, flexGrow:1,
    }

    let layoutCss = isQueryBasic ? basicLayoutCss: advLayoutCss;
    let queryBtnsCss = isQueryBasic ? basicQueryBtnsCss : advQueryBtnsCss;

    const doQuery = (values) => {
        // let fields = form.getFieldsValue();

        let param = {}
        Object.keys(values).forEach(key => {
            let val = values[key];
            if(val){
                param[key] = val; 
            }
        });

        onQuery(param);
    }

    const [form] = Form.useForm();

    return <>
        <Form style={layoutCss} 
            form={form}
            onFinish={doQuery}
        >
            <Form.Item name="basicValue"
                style={{
                    display: isQueryBasic?"block":"none",
                    padding: width<992? '0 15px':'0 10%', 
                    textAlign: 'center', 
                    minWidth: isQueryMin? '100%': 'calc(100% - 300px)',
                    marginBottom: '0px'
                }}
            >
                <Input name="basicValue" size={size} value={basicValue} allowClear
                    prefix={<SearchIcon  primaryColor={token.colorPrimary} secondColor={token.colorError} offSetY={3}/>}
                />
            </Form.Item>
            {items.map(item => <Form.Item  key={item.label} label={item.label} name={item.name}
                        style={{
                            display: isQueryBasic?"none":"block", flexShrink:0, flexGrow:1,
                            marginBottom: 0
                        }}
                    >
                        {item.inputElement}
                    </Form.Item>
                )
            }

            <div style={queryBtnsCss} >
                <Space align='center' style={{height: '100%'}}>
                    <Button size={size} icon={<SearchOutlined />} type="primary" onClick={() => form.submit()}>搜索</Button>
                    <Button size={size} icon={<ReloadOutlined />} type="primary" ghost onClick={(()=>form.resetFields())}>重置</Button>
                    {items.length>0 && <Button size={size} type="text" iconPosition="end" 
                        onClick={() => setIsQueryBasic(!isQueryBasic)}
                        icon={<DoubleLeftOutlined style={{transform: `rotate(${isQueryBasic? '-90deg':'90deg'})`}}/> }
                    >
                        {isQueryBasic?'高级':'基础'}
                    </Button>
                    }
                   
                </Space>
            </div>
        </Form>
    </>
}
