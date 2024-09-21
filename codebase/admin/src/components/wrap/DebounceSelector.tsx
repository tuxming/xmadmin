
import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import debounce from 'lodash/debounce';
import { useSelector, useRequest } from '../../hooks';

/**
 * 远程防抖加载数据, 下拉选择框, 可以多选
 */

export interface DebounceSelectorProps<ValueType = any> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
    // fetchOptions: (search: string) => Promise<ValueType[]>;
    debounceTimeout?: number;
    /**
     * 请求的url格式： url?k={key}
     * 要求返回[{val: label, val1: label1}]这样的数据格式
     */
    remoteUrl: string
}

export function DebounceSelector<ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any>(
    { remoteUrl, debounceTimeout = 800, ...props }: DebounceSelectorProps<ValueType>
) {
    const size = useSelector(state => state.themeConfig.componentSize);
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<ValueType[]>([]);
    const fetchRef = useRef(0);
    const request = useRequest();

    const debounceFetcher = useMemo(() => {
        const loadOptions = (value: string) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);

            let get = async () => {
                let result = await request.get(remoteUrl+"?k="+value);
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }
                setFetching(false);
                if(result.status){
                    let data = result.data;
                    setOptions(Object.keys(data).map(key => {
                        let option = {
                            label: data[key], 
                            value: key
                        }
                        return option as any; 
                    }));
                }
            }
            
            get();
           
        };

        return debounce(loadOptions, debounceTimeout);
    }, [remoteUrl, debounceTimeout]);

    return (
        <Select labelInValue
            filterOption={false}
            size={size}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            style={{minWidth: '180px', textAlign:'left'}}
            options={options}
        />
    );
}

// Usage of DebounceSelect
export interface SelectorOptionProp {
    label: string;
    value: string | number;
}

