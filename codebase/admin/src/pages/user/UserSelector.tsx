import React, { useState } from 'react';
import { api } from '../../common/api';
import { DebounceSelector, RemoteAutoComplete } from '../../components';

/**
 * 用户搜索选择下拉框
 * @param props onChange(value), mode= multiple | single
 * @returns 
 */
export const UserSelector : React.FC<any> = ({
    mode,
    onChange,
    ...props
}) => {
    
    //props的onChange方法向外暴露真实的值，
    //真实的值用于存在value
    //innValue是文本框显示的值

    // const [value, setValue] = useState<any>();

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
        return <RemoteAutoComplete placeholder="输入关键字" 
            remoteUrl={api.user.search}
            value={innValue}
            onSelect={onSelect}
            allowClear
            onClear={()=>{setInnValue("")}}
            onChange={onSingleValueChange}
            {...props}
        />
    }else{
        return <DebounceSelector
            mode="multiple"
            value={innValue}
            placeholder="输入关键字"
            remoteUrl={api.user.search}
            // fetchOptions={fetchUserList}
            onChange={onValueChange}
            style={{ width: '100%' }}
            {...props}
        />
    }
}