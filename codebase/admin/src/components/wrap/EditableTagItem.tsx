import { useState, useTransition } from "react";
import { DictType } from "../../common/dict";
import { Button, Select, Space, Tooltip } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { TypeTag } from "./TypeTag";
import { CopyIcon, EditIcon } from "../icon/svg/Icons";
import { DefaultNS } from "../../common/I18NNamespace";
import { useTranslation } from "../useTranslation";

/**
 * 可编辑的tag
 */
export const EditableTagItem : React.FC<{
    value: string | number,
    onChange?: (value: string | number) => void, 
    options: DictType[],
    i18nNamespace: string,
    copyable?: boolean | 'CopyValue' | 'CopyLabel' | 'CopyAll',
    trigger?: 'click' | 'blur',
    editable?: boolean,
    width?: number | string
}> = ({
    value, onChange, options, i18nNamespace, 
    copyable = false,
    editable = true,
    trigger = 'click', 
    width
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
        let text = "";

        let option = options.find(s => s.value == value);
        if(!option){
            text = value + "";
        }else{
            if(copyable == 'CopyLabel'){
                text = option.label;
            }else if(copyable == 'CopyAll'){
                text = JSON.stringify(option);
            }else{
                text = value+"";
            }
        }

        navigator.clipboard.writeText(text);
        setCopyed(true);
        setTimeout(()=>{
            setCopyed(false);
        }, 4000)
    }

    if(editing){
        return (
            <Space.Compact block>
                <Select onChange={(value)=>setLocalValue(value)} value={localValue} options={options} 
                   style={{minWidth: width?width: 'calc(100% - 50px)'}}
                   onBlur={onBlur}
                ></Select>
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
                <TypeTag options={options || []} I18Namespace={i18nNamespace}>{localValue}</TypeTag>
                <span style={{position: 'absolute', top: 2, right: 0}}>
                    {editable && <Tooltip title={t("编辑")}>
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