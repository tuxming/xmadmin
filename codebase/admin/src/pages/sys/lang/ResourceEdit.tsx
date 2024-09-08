import { AutoComplete, Button, Divider, Form, FormProps, Input, Space, Typography } from "antd";
import { AdminLang, DefaultNS } from "../../../common/I18NNamespace";
import { Modal, useLayer, useRequest, useTranslation } from "../../../components";
import { useEffect, useState } from "react";
import { useSelector } from "../../../redux/hooks";
import { api } from "../../../common/api";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";

/**
 * 编辑语言资源的表单类型
 */
export type ResourceEditFormType = {
    resKey?: string,
    category?: string, 
    resValues?: {
        id?: number,
        resValue?: string,
        languageId?: number,
    }[]
}

/**
 * 编辑语言资源页面所需的数据类型
 */
export type ResourceEditType = {
    resource?: {
        id?: number,
        languageId?: string,
        category?: string,
        resKey?: string,
        resValue?: string
    },
    groups?: any[],
    langs: {
        id?: number,
        label?: string, 
        code?: string
    }[]
    open: boolean,
    onClose: (refresh) => void,
}

/**
 * 语言资源新增，编辑页面
 */
export const ResourceEdit: React.FC<ResourceEditType> = ({
    resource,
    langs,
    groups,
    open,
    onClose,
}) => {
    const {t} = useTranslation(AdminLang);
    const request = useRequest();
    const {message} = useLayer();
    const [visible, setVisible] = useState(true);
    const size = useSelector(state => state.themeConfig.componentSize);
    const [groupOptions, setGroupOptions] = useState<any[]>();

    const [form] = Form.useForm();

    const onModalClose = (refresh) => {
        setVisible(false);
        setTimeout(()=>{
            onClose(refresh);
        }, 300)
    }

    const onSubmit = () => {
        form.submit();
    } 

    const onSearchGroups = (text) => {
        setGroupOptions(
            groups.filter(g => g.toLowerCase().indexOf(text.toLowerCase())>-1)
                .map(g => ({value: g}))
        )
    }

    //提交数据到后台
    const onFinish: FormProps<ResourceEditFormType>['onFinish'] = (values) => {
    // const onFinish = (values: ResourceEditFormType) => {
        // console.log(values);

        let data = [...values.resValues].map(v => ({...v, resKey: values.resKey, category: values.category}));
        // console.log(values);
        const create = async () => {
            let result = await request.post(
                api.lang.updateRes,
                data
            );
            if(result.status){
                let txt = Object.keys(result.data).map(id => {
                    let msg = result.data[id];
                    if(msg.indexOf(":")>-1){
                        let msgs = msg.split(":");
                        msg = t(msgs[0])+" : "+msgs[1];
                    } else{
                        msg = t(msg);
                    }
                    return id+" : "+msg
                }).join("<br/>");

                message.open({
                    content: <div style={{textAlign: "left"}} dangerouslySetInnerHTML={ {__html : txt}}></div>
                });
                onModalClose(true);
            }else{
                message.error(result.msg);
            }
        }
        create();
    };

    //获取相同key下面的所有数据
    const getResesAndBuildFormData = async () => {
        let result = await request.get(api.lang.resourceByKey+"?id="+encodeURIComponent(resource.id))
        if(result.status){
            let reses = result.data;
            let fd: ResourceEditFormType = {
                resKey: resource.resKey,
                category: resource.category,
                resValues: []    
            }

            langs.forEach(lang => {
                let res = reses.find(s => s.languageId == lang.id);
                if(res){
                    fd.resValues.push({
                        id: res.id,
                        resValue: res.resValue,
                        languageId: lang.id,
                    });
                }else{
                    fd.resValues.push({
                        id: null,
                        resValue: null,
                        languageId: lang.id,
                    });
                }
               
            })

            // setFormData(fd);
            form.setFieldsValue(fd);
        }
    }

    //监听数据变化，构建表单
    useEffect(()=>{
        if(groups){
            setGroupOptions(groups.map(g => ({value: g})))
        }

        if(open && langs){
            if(resource){
                getResesAndBuildFormData();
            }else{
                let fd: ResourceEditFormType = {
                    resKey: null,
                    category: null,
                    resValues: []    
                };
                langs.forEach(lang => {
                    fd.resValues.push({
                        id: null,
                        resValue: null,
                        languageId: lang.id,
                    });
                });
                form.setFieldsValue(fd);
            }
        }
    }, []);

    return <Modal open={visible} onClose={()=> onModalClose(false)} title={t("编辑语言资源")} width={500}
            showMask={false}
        > 
            <div style={{width:'100%'}}>
                <div style={{padding: "0px 20px 10px 20px", margin: "0px auto"}}>
                    <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{t("编辑语言资源")}</Typography.Title>
                    <Form<ResourceEditFormType> form = {form} layout='horizontal' 
                        onFinish={onFinish}  size={size}
                        labelCol={{span: 4}}
                    >   
                        <Form.Item<ResourceEditFormType> label={t("KEY")} name="resKey" 
                            rules={[{ required: true, message: t('KEY不能为空') }]}
                        >
                            <Input disabled={resource?true: false}></Input>
                        </Form.Item>
                        <Form.Item<ResourceEditFormType> label={t("分组")} name="category" 
                            rules={[{ required: true, message: t('分组不能为空') }]}
                            hidden={resource?true:false} noStyle={resource?true:false}
                        >
                            {resource?(<></>): 
                            <AutoComplete options={groupOptions}
                                onSearch={onSearchGroups}
                            />}
                        </Form.Item>
                        <Form.List name="resValues">
                            {(fields)=> fields.map(({ key, name, ...restField })=>(
                                <span key={key}>
                                    <Form.Item noStyle hidden name={[name, 'id']} {...restField}></Form.Item>
                                    <Form.Item noStyle hidden name={[name, 'category']} {...restField}></Form.Item>
                                    <Form.Item noStyle hidden name={[name, 'languageId']} {...restField}></Form.Item>
                                    <Form.Item label={langs[key].code} name={[name, "resValue"]} {...restField}>
                                        <Input.TextArea rows={2} count={{max: 255, show: true}}></Input.TextArea>
                                    </Form.Item>
                                </span>
                            ))}
                        </Form.List>
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
