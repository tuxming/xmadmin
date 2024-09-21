import { UserProps } from "./UserType"
import {Typography, TabsProps, Tabs} from 'antd'
import {  AdminUser } from "../../../common/I18NNamespace"
import { Modal } from "../../../components"
import { useRequest, useTranslation } from "../../../hooks"
import { computePx } from "../../../common/kit"
import { useState } from "react"
import { api } from "../../../common/api"
import { UserEditBasicInfo, UserEditSecurity, UserGrantDataPermission } from "./index"
import { CustomScroll } from "react-custom-scroll"
import { UserGrantRole } from "./UserGrantRole"
import { useShowResult } from "../../../hooks/useShowResult"

export type UserEditType = {
    user: UserProps,
    open: boolean,
    onClose: (refresh : boolean) => void,
}

/**
 * 编辑用户
 */
export const UserEdit : React.FC<UserEditType> = ({
    user, open, onClose
}) => {

    const [editUser, setEditUser] = useState({...user});
    const {t} = useTranslation(AdminUser);
    const [title] = useState(t('编辑用户')+":"+user.fullname);
    const [visible, setVisible] = useState(open);
    const request = useRequest();
    const showResult = useShowResult(AdminUser);

    const onModalClose = (refresh) => {
        setVisible(false);
        setTimeout(() => {
            onClose(refresh);
        }, 300);
    }

    //更新
    const doUpdate = async (updateUser, key) => {

        let result = await request.post(api.user.update, updateUser);
        showResult.show(result);
        if(result.status){
            if(key == 'token'){
                setEditUser({...editUser, [key]: result.data});
            }
        }

    }

    //要更新的字段
    const onHandleChange = (key: string, newValue) => {
        let updateUser = {};
        updateUser['id'] = user['id'];
        //刷新token
        if(key == 'token'){
            updateUser['refreshToken'] = true;
        }else if(key == 'deptId'){
            setEditUser({...editUser, ...newValue});
            updateUser[key] = newValue.value;
        }else if(key == 'password'){
            updateUser['password'] = newValue.password;
            updateUser['newPassword'] = newValue.newPassword;
            updateUser['rePassword'] = newValue.rePassword;
        }else if(key == 'photo'){
            if(newValue){
                updateUser['photo'] = newValue;
            }else{
                return;
            }
        }else{
            updateUser[key] = newValue;
            user[key] = newValue;
            setEditUser({...editUser, [key]: newValue})
        }

        doUpdate(updateUser, key);
    }


    //modal变化大小监听
    const [modalPos, setModalPos] = useState<any>({width: null, height: null});
    const onModalChangeSize = (pos) => {
        let npos = {
            width: computePx(pos.width),
            height: computePx(pos.height, true)
        };
        setModalPos(npos);
    }

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: t('基本信息'),
          children:  <UserEditBasicInfo user={editUser} modalPos={modalPos} 
                            onUpdateUser={doUpdate} onHandleChange={onHandleChange} 
                        ></UserEditBasicInfo>,
        },
        {
          key: '2',
          label: t('账户与安全'),
          children: <UserEditSecurity user={user}  modalPos={modalPos} 
                        onHandleChange={onHandleChange} 
                    ></UserEditSecurity>,
        },
        {
          key: '3',
          label: t('数据权限'),
          children: <UserGrantDataPermission userId={user.id} titleLevel={5} 
                        titleStyle={{marginTop: 5, marginBottom: 20}}
                        wrapperStyle={{paddingRight: 20}}
                    />,
        },
        {
          key: '4',
          label: t('角色'),
          children: <UserGrantRole userId={user.id} titleLevel={5} 
                        titleStyle={{marginTop: 5, marginBottom: 20}}
                        wrapperStyle={{paddingRight: 20}}
                    />,
        },
    ];



    return (
        <Modal open={visible} onClose={()=>onModalClose(false)} title={title} onSizeChange={onModalChangeSize}
            showMask={false} width={800} 
        >
            <div style={{height: '100%'}}>
                <Typography.Title level={4} 
                    style={{marginTop: 20, marginBottom: 20, textAlign: "center", boxSizing: 'content-box'}}
                >
                    {title}
                </Typography.Title>
                <CustomScroll heightRelativeToParent="calc(100% - 100px)">
                    <Tabs defaultActiveKey="1" items={items} tabPosition="left" style={{height: '100%'}}/>
                </CustomScroll>
            </div>
        </Modal>
    )
}