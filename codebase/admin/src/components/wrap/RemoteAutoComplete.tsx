import { AutoComplete, Spin, AutoCompleteProps } from "antd";
import { useState, useMemo, useRef } from "react";
import { useRequest } from "../../hooks/useRequest";
import debounce from 'lodash/debounce';

export interface RemoteCompleteProps extends AutoCompleteProps {
    placeholder?: string,
    /**
     * 请求的url格式： url?k={key}
     * 要求返回[{val: label, val1: label1}]这样的数据格式
     */
    remoteUrl: string,  
};

/**
 * 自动完成，远程加载, 防抖，单选： 选中后返回： {label, value, key} 
 * @param props 
 * @returns 
 */
export const RemoteAutoComplete : React.FC<RemoteCompleteProps> = ({
    onChange,
    placeholder,
    remoteUrl,
    ...props
}) => {

    const request = useRequest();
    const [options, setOptions] = useState([]);
    const [fetching, setFetching] = useState(false);
    const fetchRef = useRef(0);

    // const onInputChange = (value) => {
    //     console.log("onSelect", value);
    // }

    // const onSelect = (value) => {
    //     let option = options.find(opt => opt.value == value);
    //     // console.log("onselect", value, option, props.onSelect);
    //     if(option){
    //         if(props.onSelect)
    //             props.onSelect(value, option);
    //         if(props.value) {
    //             props.value = option.label;
    //         }
    //     }
    // }

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
                            value: data[key],
                            key: key
                        }
                        return option as any; 
                    }));
                }
            }
            
            get();
           
        };

        return debounce(loadOptions, 500);
    }, [remoteUrl, 500]);


    const onSearch = (text) => {
        debounceFetcher(text);
    }
    
    return <AutoComplete
        options={options}
        style={{ minWidth: 180 }}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        // onSelect={onSelect}
        onSearch={onSearch}
        onChange={onChange}
        {...props}
    />
}