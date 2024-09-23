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

import { Tooltip, Typography } from "antd";
import { CopyIcon, RefreshIcon, ViewIcon, ViewOffIcon } from "../../../components/icon/svg/Icons";
import { useRef, useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "../../../hooks";
import { AdminUser } from "../../../common/I18NNamespace";

export const TokenItem : React.FC<{
    value: string,
    copyable?: boolean,
    onRefresh?: (newView: string) => void
}> = ({
    value,
    copyable = false,
    onRefresh
}) => {

    const refreshRef = useRef(null);
    const {t} = useTranslation(AdminUser);
    const [copyed, setCopyed] = useState(false);
    const [show, setShow] = useState(false);

    const onClickRefresh = () => {
        if(onRefresh){
            onRefresh("");
        }
    }

    const onCopy = ()=> {
        navigator.clipboard.writeText(value);
        setCopyed(true);
        setTimeout(()=>{
            setCopyed(false);
        }, 4000)
    }

    const onShow = () => {
        setShow(!show);
    }

    return (
        <>
        <style>{
            `.editable-tag-wrap .copy-icon{display:none;}
            .editable-tag-wrap:hover .copy-icon{display:inline;}
            `
        }</style>
        <div className="editable-tag-wrap" style={{position: 'relative', paddingRight: 55}}>
            <Typography.Text>{show? value: (value.substring(0,1) + '*'.repeat(30) +value.substring(value.length-1))}</Typography.Text>
            <span style={{position: 'absolute', top: 2, right: 0}}>
                <Tooltip title={t("查看")}>
                    <span onClick={onShow}>
                        {show?(<ViewIcon type="primary" ghost  style={{cursor: 'pointer', marginRight: 5}}/>)
                        :(<ViewOffIcon type="primary" ghost  style={{cursor: 'pointer', marginRight: 5}}/>)}
                    </span>
                </Tooltip>
                <Tooltip title={t("刷新")}>
                    <span ref={refreshRef} onClick={onClickRefresh} >
                        <RefreshIcon className="refresh-icon" type="primary" ghost style={{cursor: 'pointer', marginRight: 5}}/>
                    </span>
                </Tooltip>
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