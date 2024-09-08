import React, {useState} from 'react';
import { Space, Divider, App } from "antd"
import { useSelector } from "../../../redux/hooks"
import { UserAddIcon, DeleteIcon, EditIcon } from '../../../components/icon/svg/Icons';
import { UserQuery, UserList } from './index'
import { AuthButton, useLayer, useRequest, useTranslation } from '../../../components';
import { permission } from '../../../common/permission';
import { AdminUser, DefaultNS } from '../../../common/I18NNamespace';
import { api } from '../../../common/api';
import { UserAdd } from './index';
import { UserEdit } from './UserEdit';

export const UserPage : React.FC = () => {

    const {t, f} = useTranslation(AdminUser);
    const request = useRequest();
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const [query, setQuery] = useState({});
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message, confirm} = useLayer();
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });

    const [selectedRows, setSelectedRows] = useState<any[]>();
    const [user, setUser] = useState<any>(null);
    const [openAdd, setOpenAdd] = useState(false); 
    const [title, setTitle] = useState<string>(null);

    const [openEdit, setOpenEdit] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);

    //执行查询
    let onQuery = (values) => {
        // console.log(values);
        setQuery(values);
    }

    //表格选中回调
    const onTableSelectChange =  (rows:any) => {
        // console.log(rows);
        setSelectedRows(rows);
    };

    const onEdit = () => {
        if(selectedRows && selectedRows.length>0){
            let row = selectedRows[0];
            
            let getUserProfile = async () => {
                let result = await request.get(api.user.get+"?id="+row.id);
                if(result.status){
                    setEditUser(result.data)
                    setOpenEdit(true);
                    setTitle(t("编辑用户"));
                }else{
                    message.warning(t(result.msg));
                }
            }

            getUserProfile();

            
        }else{
            message.warning("请先选中用户，在编辑");
        }
    }

    const onCreate = () => {
        setUser(null);
        setOpenAdd(true);
        setTitle(t("添加用户"));
    }

    //删除
    const onDelete = () => {
        if(!selectedRows || selectedRows.length==0){
            message.warning(t("请选中要删除的用户后，再删除"));
            return;
        }

        confirm({
            content: f("确定要删除用户：%s?", [selectedRows[0].fullname]),
            onOk: (close) => {
                let doDelete = async () => {
                    let result = await request.get(api.user.delete+"?id="+selectedRows[0].id);
                    if(result.status){
                        message.success(t(result.msg, DefaultNS));
                        setRefresh({
                            reset: true,
                            tag: refresh.tag+1
                        });
                        setSelectedRows([]);
                        close();
                    }else{
                        message.warning(t(result.msg));
                    }
                }
                doDelete();
            }
        });

    }

    const setNeedRefresh = (needRefresh) => {
        if(needRefresh){
            setRefresh({
                reset: true,
                tag: refresh.tag+1
            });
        }
    }

    const onAddClose = (needRefresh) => {
        setNeedRefresh(needRefresh);
        setOpenAdd(false)
    }
    const onEditClose = (needRefresh) => {
        setNeedRefresh(needRefresh);
        setOpenEdit(false)
    }

    return <>
        <UserQuery onQuery={onQuery}/>
        <Divider />
        <Space wrap>
            <AuthButton type='primary' size={size} tip={t('新增用户' )}
                icon={<UserAddIcon type='primary'/>}
                requiredPermissions={permission.user.create.expression}
                onClick={onCreate}
            >
                {!onlyIcon && t('新增')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t('编辑用户' )}
                icon={<EditIcon type='primary'/>}
                requiredPermissions={permission.user.update.expression}
                onClick={onEdit}
            >
                {!onlyIcon && t('编辑')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t('删除用户')} ghost danger
                icon={<DeleteIcon type='primary' danger ghost/>}
                requiredPermissions={permission.user.delete.expression}
                onClick={onDelete}
            >
                {!onlyIcon && t('删除')}
            </AuthButton>
        </Space>
        <Divider />
        <UserList onSelect={onTableSelectChange} refresh={refresh} query={query}/>
        {openAdd && <UserAdd open={openAdd} onClose={onAddClose} />}
        {openEdit && <UserEdit open={openEdit} onClose={onEditClose} user={editUser} />}
    </>
}
