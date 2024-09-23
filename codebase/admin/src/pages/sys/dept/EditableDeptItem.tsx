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

import { CheckOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { AdminDept } from "../../../common/I18NNamespace";
import { useTranslation } from "../../../hooks";
import { CopyIcon, EditIcon } from "../../../components/icon/svg/Icons";
import { DeptSelectorWraper } from ".";

/**
 * 可编辑的dept， 参考UserEditBasicInfo.tsx
 */
export const EditableDeptItem : React.FC<{
    value: number,
    deptName: string,
    deptPath: string, 
    deptPathName: string,
    onChange?: (value: number, obj: any) => void, 
    editable?: boolean,
    copyable?: boolean | 'CopyValue' | 'CopyLabel' | 'CopyAll',
}> = ({
    value, 
    deptPath,
    deptName,
    deptPathName,
    onChange,
    copyable = false,
    editable = true,
}) => {

    const {t} = useTranslation(AdminDept);
    const [editing, setEdting] = useState(false);
    const [localValue, setLocalValue] = useState({
        value,
        deptName,
        deptPath,
        deptPathName
    });
    const [copyed, setCopyed] = useState(false);

    const onEditIconClick = () => {
        setEdting(true);
    }

    const onEnter = ()=> {
        setEdting(false);
        if(localValue.value !== value && onChange){
            onChange(localValue.value, localValue);
        }
    }

    const onCopy = ()=> {
        let text = "";
        if(copyable == 'CopyLabel'){
            text = localValue.deptName + "";
        }else if(copyable == 'CopyAll'){
            text = JSON.stringify(localValue);
        }else{
            text = value+"";
        }
        navigator.clipboard.writeText(text+"");
        setCopyed(true);
        setTimeout(()=>{
            setCopyed(false);
        }, 4000)
    }

    // const onInputChange = (value) => {
        // console.log(value);
        // setLocalValue(e.target.value*1 || 0 );
        // setLocalValue(value)
    // }

    const onSelect = (value, node) => {
        // console.log(value, node);
        setLocalValue({
            value: value,
            deptName: node.name,
            deptPath: node.path,
            deptPathName: node.pathName
        })
    }

    if(editing){
        return (
            <Space.Compact block>
                <DeptSelectorWraper value={localValue} 
                    onSelect={onSelect}
                    showName={deptPathName}
                    wrapStyle={{width: 'calc(100% - 50px)'}}
                    showNamePos={{
                        bottom: 4,
                        left : 10
                    }}
                />
                <Button icon={<CheckOutlined type="primary" />}
                    onClick={onEnter}
                ></Button>
            </Space.Compact>
        );
    }else{
        return (
            <>
            <style>{
                `.editable-tag-wrap .copy-icon{display:none;}
                .editable-tag-wrap:hover .copy-icon{display:inline;}
                `
            }</style>
            <div className="editable-tag-wrap" style={{position: 'relative', paddingRight: 30}}>
                <Typography.Text>{deptName}<br/>{deptPath}<br/>{deptPathName}</Typography.Text>
                <span style={{position: 'absolute', top: 2, right: 0}}>
                    {editable && <Tooltip title={t("编辑")}>
                        {/* {
                            ToolTip需要正常显示，需要动态计算子节点的位置，所以自定义的子节点需要支持ref传递，
                            如果不支持，则会出现警告，所以可以在自定义的子节点外面在包裹一个标准的html节点
                        } */}
                        <span>
                            <EditIcon type="primary" ghost  onClick={onEditIconClick} style={{cursor: 'pointer', marginRight: 5}}/>
                        </span>
                    </Tooltip>}
                    {copyable ? (copyed ? (<CheckOutlined className="copy-icon" style={{color: "#00b96b"}}/>) 
                        : (
                        <Tooltip title={t("复制")}>
                            <span>
                                <CopyIcon type="primary" className="copy-icon" ghost onClick={ onCopy } style={{cursor: 'pointer'}} />
                            </span>
                        </Tooltip>
                        )) : <></>}
                </span>
            </div>
            </>
        );
    }

}