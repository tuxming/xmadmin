

import { AutoComplete, Button, Divider, Form, FormProps, Input, Space, Typography } from "antd";
import { AdminDict, DefaultNS } from "../../../common/I18NNamespace";
import { Modal, useRequest, useTranslation, useLayer } from "../../../components";
import { useEffect, useState } from "react";
import { useSelector } from "../../../redux/hooks";
import { api } from "../../../common/api";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { DictTypeSelector } from "./DictType";
import { FileUploadFormItem } from "../../index";

/**
 * 编辑语言资源的表单类型
 */
export type DictEditFormType = {
    id?: number,
    groupName?: string,
    dictKey?: string,
    dictValue?: any,
    dictLabel?: string, 
    type?: number,
    remark?: number
}

/**
 * 编辑语言资源页面所需的数据类型
 */
export type DictEditType = {
    dict?: DictEditFormType,
    groups?: any[],
    title: string,
    open: boolean,
    onClose: (refresh) => void,
}

/**
 * 语言资源新增，编辑页面
 */
export const DictEdit: React.FC<DictEditType> = ({
    dict,
    groups,
    title,
    open,
    onClose,
}) => {
    const {t} = useTranslation(AdminDict);
    const request = useRequest();
    const {message} = useLayer();
    const [visible, setVisible] = useState(true);
    const size = useSelector(state => state.themeConfig.componentSize);
    const [groupOptions, setGroupOptions] = useState(groups);

    const [form] = Form.useForm();
    const [dictType, setDictType] = useState<number>(0);

    const onModalClose = (refresh) => {
        setVisible(false);
        setTimeout(()=>{
            onClose(refresh);
        }, 300)
    }

    //监听数据变化，构建表单
    useEffect(()=>{
        if(open && dict){
            setDictType(dict.type);
            if(dict.type == 3){
                dict.dictValue = dict.dictValue? [dict.dictValue]: [];
            }

            form.setFieldsValue(dict);
        }
    }, []);

    const onSubmit = () => {
        form.submit();
    } 

    const onSearchGroups = (text) => {
        if(!text || /\s+/.test(text)){
            setGroupOptions(groups);
            return;
        }

        setGroupOptions(
            groups.filter(g => 
                    g.label.toLowerCase().indexOf(text.toLowerCase())>-1
                    || g.code.toLowerCase().indexOf(text.toLowerCase())>-1
                )
        )
    }

    //提交数据到后台
    const onFinish: FormProps<DictEditFormType>['onFinish'] = (values) => {

        let data = {...values, dictValue: values.type == 3? values.dictValue[0] : values.dictValue}
        const create = async () => {
            let result = await request.post(
                data.id?api.dict.updateDict: api.dict.addDict,
                data
            );
            if(result.status){
                message.success(result.msg);
                onModalClose(true);
            }else{
                message.error(result.msg);
            }
        }
        create();
    };

    const onTypeChange = (value) => {
        // console.log(value);
        setDictType(value);
        form.setFieldValue("dictValue", null);
    }

    return <Modal open={visible} onClose={()=> onModalClose(false)} title={title} width={500}
        showMask={false}
    > 
        <div style={{width:'100%'}}>
            <div style={{padding: "0px 20px 10px 20px", margin: "0px auto"}}>
                <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{title}</Typography.Title>
                <Form<DictEditFormType> form = {form} layout='horizontal' 
                    onFinish={onFinish}  size={size}
                    labelCol={{span: 4}}
                >   
                    <Form.Item noStyle hidden name="id"></Form.Item>
                    <Form.Item<DictEditFormType> label={t("字典名")} name="groupName" 
                        rules={[{ required: true, message: t('字典名不能为空') }]}
                    >
                        <AutoComplete options={
                            groupOptions.map(g => ({label: g.label+"-"+g.code, value: g.code}))
                        }
                            onSearch={onSearchGroups}
                        />
                    </Form.Item>
                    <Form.Item<DictEditFormType> label={t("显示名")} name="dictLabel" 
                        rules={[{ required: true, message: t('字典KEY不能为空') }]}
                    >
                        <Input></Input>
                    </Form.Item>
                    <Form.Item<DictEditFormType> label={t("KEY")} name="dictKey" 
                        rules={[{ required: true, message: t('KEY不能为空') }]}
                    >
                        <Input></Input>
                    </Form.Item>
                    <Form.Item<DictEditFormType> label={t("类型")} name="type" 
                        rules={[{ required: true, message: t('类型不能为空') }]}
                    >
                        <DictTypeSelector onChange={onTypeChange}/>
                    </Form.Item>
                    <Form.Item<DictEditFormType> label={t("值")} name="dictValue" 
                        rules={[{ required: true, message: t('值不能为空') }]}
                    >
                        {
                         dictType == 1?(<Input></Input>):
                         dictType == 3?(<FileUploadFormItem maxCount={1} listType="picture-card"></FileUploadFormItem>):
                          (<Input.TextArea count={{max: 255, show: true}}></Input.TextArea>)
                        }
                    </Form.Item>
                    <Form.Item<DictEditFormType> label={t("其他")} name="remark" 
                    >
                        <Input></Input>
                    </Form.Item>
                </Form>
                <Divider />
                <div style={{textAlign: 'right'}}>
                    <Space>
                        <Button onClick={()=>onModalClose(false)} icon={<CloseOutlined />}>{t("取消", DefaultNS)}</Button>
                        <Button onClick={onSubmit} type="primary" icon={<SendOutlined />}>{t("确定", DefaultNS)}</Button>
                    </Space>
                </div>
            </div>
        </div>
    </Modal>
}
