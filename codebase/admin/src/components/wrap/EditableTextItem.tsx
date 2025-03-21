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

import { useState } from "react";
import { Button, Input, Space, Tooltip, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { CopyIcon, EditIcon } from "../icon/svg/Icons";
import { DefaultNS } from "../../common/I18NNamespace";
import { useTranslation } from "../../hooks/useTranslation";
import { calculateLength } from "../../common/kit";

/**
 * 可编辑的text
 */
export const EditableTextItem : React.FC<{
    value: string,
    onChange?: (value: string) => void, 
    copyable?: boolean,
    editable?: boolean,
    trigger?: 'click' | 'blur',
    type?: 'text' | 'password'
}> = ({
    value, 
    onChange,
    copyable = false,
    editable = true,
    trigger = 'click',
    type = 'text',
}) => {

    const {t} = useTranslation(DefaultNS);
    const [editing, setEdting] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [copyed, setCopyed] = useState(false);

    const onEditIconClick = () => {
        setEdting(true);
    }

    const onEnter = ()=> {
        setEdting(false);
        if(localValue !== value && onChange){
            onChange(localValue);
        }
    }

    const onBlur = () => {
        if(trigger == 'blur'){
            onEnter();
        }
    }

    const onClickEnter = () => {
        if(trigger == 'click'){
            onEnter();
        }
    }

    const onCopy = ()=> {
        navigator.clipboard.writeText(value+"");
        setCopyed(true);
        setTimeout(()=>{
            setCopyed(false);
        }, 4000)
    }

    const computeWidth = (str) => {

        let width = calculateLength(str);

        if(!width){
            return 150;
        }else{
            if(width<7){
                return 8*16;
            }else{
                return width * 16;
            }
        }


    }

    if(editing){
        return (
            <Space.Compact>
                {type == 'text'? (
                    <Input value={localValue} onBlur={onBlur}
                        onChange={(e)=>setLocalValue(e.target.value)} 
                        style={{width: computeWidth(value)}}
                    ></Input>
                ): (
                    <Input.Password value={localValue} onBlur={onBlur}
                        onChange={(e)=>setLocalValue(e.target.value)} 
                        style={{width: computeWidth(value)}}
                    ></Input.Password>
                )}
                <Button icon={<CheckOutlined type="primary" />}
                    onClick={onClickEnter}
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
                <Typography.Text>{value}</Typography.Text>
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