import { Col, Descriptions, Row, Typography, DescriptionsProps } from "antd"
import { FileUploadFormItem } from "../document"
import { EditableTagItem, EditableTextItem, useTranslation } from "../../../components"
import { AdminDept, AdminUser } from "../../../common/I18NNamespace";
import { UserProps } from "./UserType";
import { EditableDeptItem } from "../dept/index";
import { useDict } from "../../../common/dict";

/**
 * 编辑用户的基本信息
 */
export const UserEditBasicInfo : React.FC<{
    onHandleChange: (key: string, value: any) => void,
    onUpdateUser: (updateUser, key) => void,
    user: UserProps,
    modalPos: any
}> = ({
    onHandleChange,
    onUpdateUser,
    user,
    modalPos
}) => {

    const userStatus = useDict('UserStatus');
    const genders = useDict('Gender');
    const {t} = useTranslation(AdminUser);

    //删除照片的回调事件
    const onPhotoRemove = (value) => {
        onUpdateUser({
            id: user['id'],
            photo: 0,
        }, 'photo');
    } 

    const basicItems: DescriptionsProps['items'] = [
        {
            key: "fullname",
            label: t('姓名'),
            span: 1,
            children:  <EditableTextItem value={user.fullname} copyable
                            onChange={(value)=>onHandleChange("fullname",value)} 
                        ></EditableTextItem>
        },
        {
            key: "gender",
            label: t('性别'),
            span: 1,
            children: <EditableTagItem value={user.gender} options={genders} width={60}
                    i18nNamespace={AdminDept} copyable='CopyLabel' editable
                    onChange={(value)=>onHandleChange("gender",value)} 
                />
        },
        {
            key: "status",
            label: t('状态'),
            span: modalPos.width>768?1:(modalPos.width>500?2: 1),
            children: <EditableTagItem value={user.status} options={userStatus} width={80}
                        i18nNamespace={AdminUser} copyable='CopyLabel' editable
                        onChange={(value)=>onHandleChange("status",value)} 
                    />
        },
        {
            key: "deptId",
            label: t('所在组织'),
            span: modalPos.width>768?3:(modalPos.width>500?2: 1),
            children: <EditableDeptItem copyable="CopyAll" editable
                        value={user.deptId} deptName={user.deptName} deptPath={user.deptPath} deptPathName={user.deptPathName}
                        onChange={(value, obj)=>onHandleChange("deptId", obj)} 
                    />
        },
    ];

    return <>
        <div>
            <Typography.Title level={5} style={{marginTop: 5, marginBottom: 20}}>{t("基本信息")}</Typography.Title>
            <Row style={{marginBottom: 15}} justify="center">
                <Col>
                    <FileUploadFormItem category="photo" listType="picture-circle" maxCount={1} value={[user.photo]}
                        onChange={(values) => onHandleChange('photo', values[0])}
                        onRemove={onPhotoRemove}
                    />
                </Col>
                <Col style={{paddingLeft: 30}}>
                    <Typography.Paragraph>
                        <b>{t("ID")}： </b>{user.id}
                        <span style={{marginLeft: 35}}><b>{t("推广码")}： </b>{user.code}</span>
                    </Typography.Paragraph>
                    <Typography.Paragraph><b>{t("用户名")}： </b>{user.username}</Typography.Paragraph>
                    <Typography.Paragraph><b>{t("注册时间")}： </b>{user.created}</Typography.Paragraph>
                </Col>
            </Row>
        </div>
        <Descriptions className="user-basic-info" bordered items={basicItems} 
            column={modalPos.width>768?3:(modalPos.width>500?2: 1)} />
    </>

}