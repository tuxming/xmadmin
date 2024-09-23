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

import React, { useState } from 'react';
import { DebounceSelector,RemoteAutoComplete } from '../../../components';
import { useTranslation } from '../../../hooks';
import { api } from '../../../common/api';
import { SearchIcon } from '../../../components/icon/svg/Icons';

/**
 * 角色选择下拉框
 * @param props onChange(value), mode= multiple | single
 * @returns 
 */
export const RoleSelector : React.FC<{
    mode?: 'multiple' | 'single'
    onChange?: (value: [{label: string, value: any}]) => void
    [key: string]: any
}> = ({
    mode = 'multiple',
    onChange,
    ...props
}) => {
    
    //props的onChange方法向外暴露真实的值，
    //真实的值用于存在value
    //innValue是文本框显示的值

    // const [value, setValue] = useState<any>();
    const {t} = useTranslation();

    const [innValue, setInnValue] = useState<any>();

    const onValueChange = (newValue) => {
        // setValue(newValue);
        setInnValue(newValue);
        if(onChange){
            onChange(newValue);
        }
    }

    const onSingleValueChange = (newValue) => {
        setInnValue(newValue);
        if(onChange){
            onChange([{label: newValue, value: newValue}]);
        }
    }

    const onSelect = (value, option) => {
        setInnValue(option.label);
        // setValue([option]);
        if(onChange){
            onChange([option]);
        }
    }

    let isSingle = mode  == "single"
    if(isSingle){
        return <RemoteAutoComplete
            remoteUrl={api.role.search}
            value={innValue}
            onSelect={onSelect}
            allowClear
            onClear={()=>{setInnValue("")}}
            onChange={onSingleValueChange}
            placeholder={t("输入关键字搜索用户")}
            suffixIcon={<SearchIcon type='primary' ghost/>}
        />
    }else{
        return <DebounceSelector
            mode="multiple"
            value={innValue}
            placeholder={t("输入关键字搜索用户")}
            suffixIcon={<SearchIcon type='primary' ghost/>}
            remoteUrl={api.role.search}
            // fetchOptions={fetchUserList}
            onChange={onValueChange}
            style={{ width: '100%' }}
            {...props}
        />
    }
}