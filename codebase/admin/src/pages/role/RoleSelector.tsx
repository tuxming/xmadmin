import React, { useState } from 'react';
import { DebounceSelector,RemoteAutoComplete, useTranslation } from '../../components';
import { api } from '../../common/api';

/**
 * 角色选择下拉框
 * @param props onChange(value), mode= multiple | single
 * @returns 
 */
export const RoleSelector : React.FC<any> = ({
    mode,
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
        return <RemoteAutoComplete placeholder={t("输入关键字" )}
            remoteUrl={api.role.search}
            value={innValue}
            onSelect={onSelect}
            allowClear
            onClear={()=>{setInnValue("")}}
            onChange={onSingleValueChange}
        />
    }else{
        return <DebounceSelector
            mode="multiple"
            value={innValue}
            placeholder={t("输入关键字")}
            remoteUrl={api.role.search}
            // fetchOptions={fetchUserList}
            onChange={onValueChange}
            style={{ width: '100%' }}
            {...props}
        />
    }
}