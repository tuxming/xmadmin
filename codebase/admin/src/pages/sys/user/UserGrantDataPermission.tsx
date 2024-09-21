import { Avatar, Button, Form, Image, Radio, Tooltip, Typography } from "antd";
import { AdminUser } from "../../../common/I18NNamespace";
import { useRequest, useTranslation,useShowResult } from "../../../hooks";
import { TableColumnType, TableComponent, useLayer} from "../../../components";
import { api } from "../../../common/api";
import { useState } from "react";
import { AddIcon, DeleteIcon } from "../../../components/icon/svg/Icons";
import { UserSelector } from "./UserSelector";
import { DeptSelector } from "../dept";


/**
 * 编辑用户的数据权限, 用户能看到和能操作到的哪些用户的数据
 */
export const UserGrantDataPermission : React.FC<{
    userId: number,
    titleLevel?: 1|2|3|4|5,
    titleStyle?: {
        [key: string]: string | number
    },
    wrapperStyle?: {
        [key: string]: string | number
    },
}> =({
    userId,
    titleLevel = 5,
    titleStyle,
    wrapperStyle
}) => {
    const {t} = useTranslation(AdminUser);
    const request = useRequest();
    const {confirm, message, destory} = useLayer();
    const [query] = useState({});
    const showResult = useShowResult(AdminUser);

    const [userRefresh, setUserRefresh] = useState({
        reset: false,
        tag: 1,
    });
    const [deptRefresh, setDeptRefresh] = useState({
        reset: false,
        tag: 1,
    });

    const onDelete = (record, type) => {
        confirm({
            title: t("删除用户数据权限"),
            content: type == 1? t("确定要删除改用的用户权限？")+record.fullname: t("确定要删除该用户的组织权限？")+record.name,
            onOk: (onClose) => {

                let deleteRequest = async () => {
                    let result = await request.get(api.user.userDataDelete+"?id="+record.id);
                    showResult.show(result);
                    if(result.status){
                        if(type == 1){
                            setUserRefresh({
                                reset: true,
                                tag: new Date().getTime()
                            });
                        }else{
                            setDeptRefresh({
                                reset: true,
                                tag: new Date().getTime()
                            });
                        }
                        onClose();
                    }
                }

                deleteRequest();
            }
        });

        // console.log("onDelete", record);
        
    }

    const useCols : TableColumnType[]= [
        {
            title: t('ID'),
            key: 'userId',
            sort: true,
            filter: true,
            width: 100,
            render(text, record, index) {
                return <div style={{position: 'relative'}}>
                        {text}
                        <DeleteIcon type="primary" offSetY={3} width={14} height={14} ghost danger 
                            onClick={() => onDelete(record, 1)}
                            style={{position: 'absolute', right: 0, cursor: 'pointer'}} 
                        />
                    </div>
            },
        },
        {
            title: t('照片'),
            key: 'photo',
            width: 60,
            render(text, record, index) {
                if(record.photo && record.photo!==0){
                    return <Image width={36}  src={api.document.img+"?id="+text} />
                }else{
                    return <Avatar>{record.fullname.substring(0,1).toUpperCase()}</Avatar>
                }
            },
        },
        {
            title: t('账号'),
            key: 'username',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
        },
        {
            title: t('姓名'),
            key: 'fullname',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
        }
    ];

    const deptCols : TableColumnType[]= [
        {
            title: t('ID'),
            key: 'deptId',
            sort: true,
            filter: true,
            width: 100,
            render(text, record, index) {
                return <div style={{position: 'relative'}}>
                        {text}
                        <DeleteIcon type="primary" offSetY={3} width={14} height={14} ghost danger 
                            onClick={() => onDelete(record, 2)}
                            style={{position: 'absolute', right: 0, cursor: 'pointer'}} 
                        />
                    </div>
            },
        },
        {
            title: t('组织名'),
            key: 'name',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 100,
            align: 'left'
        },
        {
            title: t('路径'),
            key: 'path',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 180,
            align: 'left'
        },
        {
            title: t('路径名'),
            key: 'pathName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 180,
            align: 'left'
        }
    ];

    const onSelect = (rows: any[]) => {
    } 


    const [form] = Form.useForm();
    const [confirmId, setConfirmId] = useState<string>();
    const onFinish = (values) => {
        let data = {
            type: values.type,
            userId: userId,
            refId: null,
        }

        if(values.type == 1){
            let refId = values.refId[0].key;
            // console.log(refId);
            if((refId * 1).toString() == 'NaN'){
                message.warning(t("请选择用户"));
                return;
            }

            data.refId = refId * 1;
        }else {
            data.refId = values.refId;
        }

        let submitAdd = async () => {
            let result = await request.post(api.user.userDataAdd, data);
            showResult.show(result);
            if(result.status){
                setConfirmId(prevId => {
                    // console.log(prevId);
                    destory(prevId);
                    return null;
                });

                if(values.type == 1){
                    setUserRefresh({
                        reset: true,
                        tag: new Date().getTime()
                    });
                }else{
                    setDeptRefresh({
                        reset: true,
                        tag: new Date().getTime()
                    });
                }

            }
        }

        submitAdd();

    };

    const AddUserData = () => {

        const [type, setType] = useState<number>(1);
        const onRadioChange = (event) => {
            // console.log("radio change", event.target.value);
            form.setFieldValue("refId", null);
            setType(event.target.value);
        }

        return (
            <Form form={form} onFinish={onFinish} style={{textAlign: 'left'}}
                initialValues={{type: 1, refId: null}}
            >
                <Form.Item label={t("类型")} name="type"
                    rules={[{ required: true, message: t('类型不能为空') }]}
                >
                    <Radio.Group onChange={onRadioChange}>
                        <Radio value={1}>{t('用户')}</Radio>
                        <Radio value={2}>{t('组织')}</Radio>
                    </Radio.Group>
                </Form.Item>
                
                {type == 1 && (
                    <Form.Item label={t("用户")} name="refId"
                        rules={[{required: true, message: t('用户不能为空') }]}
                    >
                        <UserSelector mode="single" />
                    </Form.Item>
                )}
                {type == 2 && (
                    <Form.Item label={t("组织")} name="refId"
                        rules={[{required: true, message: t('组织不能为空') }]}
                    >
                        <DeptSelector />
                    </Form.Item>
                )}
            </Form>
        );
    }

    const onAdd = () => {
        let id = confirm({
            title: t("添加数据权限"),
            content: <AddUserData />,
            onOk: () => form.submit()
        });
        setConfirmId(id);
    }

    return <div style={wrapperStyle}>
        <div style={{position: 'relative'}}>
            <Typography.Title level={titleLevel}  style={titleStyle} >
                {t("数据权限")}
            </Typography.Title>
            <Tooltip title={t("添加数据权限")}>
                <Button style={{position: 'absolute', bottom: -5, right: 30}} 
                    onClick={onAdd}
                    type="primary"
                    icon={<AddIcon type="primary"/>} />
            </Tooltip>
        </div>
        <TableComponent pageSize={20} query={query} apiUrl={api.user.dataPermissions + "?type=1&id="+userId} 
            onSelect={onSelect} width={465}
            columns={useCols}
            refresh={userRefresh}
        />
        <TableComponent pageSize={20} query={query} apiUrl={api.user.dataPermissions + "?type=2&id="+userId} 
            onSelect={onSelect} width={565}
            columns={deptCols}
            refresh={deptRefresh}
        />
    </div>
}