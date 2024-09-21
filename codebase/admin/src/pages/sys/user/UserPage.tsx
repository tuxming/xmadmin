import React, {useMemo, useState} from 'react';
import { Space, Divider, MenuProps, Dropdown } from "antd"
import { UserAddIcon, DeleteIcon, EditIcon, DataLockIcon, GrantUserIcon } from '../../../components/icon/svg/Icons';
import { UserQuery, UserList } from './index'
import { AuthButton,  useLayer,  } from '../../../components';
import { useAuth, useRequest, useSelector, useShowResult, useTranslation } from '../../../hooks';
import { permission } from '../../../common/permission';
import { AdminUser } from '../../../common/I18NNamespace';
import { api } from '../../../common/api';
import { UserAdd, UserEdit, UserGrantDataPermissionModal, UserGrantRoleModal } from './index';
import { DownOutlined } from '@ant-design/icons';

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
    const showResult = useShowResult(AdminUser);

    const [selectedRows, setSelectedRows] = useState<any[]>();
    
    const [openAdd, setOpenAdd] = useState(false); 
    const [openEdit, setOpenEdit] = useState(false);
    const [openGrantData, setOpenGrantData] = useState(false);
    const [openGrantUserRole, setOpenGrantUserRole] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [grantUser, setGranUser] = useState<any>();
    const [grantRoleUser, setGranRoleUser] = useState<any>();
    const auth = useAuth();

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
                showResult.show(result);
                if(result.status){
                    setEditUser(result.data)
                    setOpenEdit(true);
                }
            }

            getUserProfile();
        }else{
            message.warning("请先选中用户，在编辑");
        }
    }

    const onCreate = () => {
        setOpenAdd(true);
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
                    showResult.show(result);
                    if(result.status){
                        setRefresh({
                            reset: true,
                            tag: refresh.tag+1
                        });
                        setSelectedRows([]);
                        close();
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

    /**
     * 分配角色
     */
    const grantData = () => {
        if(!selectedRows || selectedRows.length==0){
            message.warning(t("请选中要用户后，再操作"));
            return;
        }
        setGranUser(selectedRows[0]);
        setOpenGrantData(true);
    }

    /**
     * 分配角色
     */
    const grantRole = () => {
        if(!selectedRows || selectedRows.length==0){
            message.warning(t("请选中要用户后，再操作"));
            return;
        }
        setGranRoleUser(selectedRows[0]);
        setOpenGrantUserRole(true);
    }

    //更多菜单
    const items: MenuProps['items'] = useMemo(()=> {
        let values: MenuProps['items'] = [];
        if(auth.has("sys:user:grant:role")){
            values.push({
                label: t('分配角色'),
                key: '1',
                icon: <GrantUserIcon ghost type='primary' />,
                onClick: grantRole
            });
        }

        if(auth.has("sys:user:grant:data")){
            values.push({
                label: t('分配数据权限'),
                key: '2',
                icon: <DataLockIcon ghost type='primary' />,
                onClick: grantData
            });
        }
        return values;
    }, []);

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
            <Dropdown.Button type="primary"
                menu={{ items }}
                icon={<DownOutlined />}
            >
                {t('更多操作')}
            </Dropdown.Button>
        </Space>
        <Divider />
        <UserList onSelect={onTableSelectChange} refresh={refresh} query={query}/>
        {openAdd && <UserAdd open={openAdd} onClose={onAddClose} />}
        {openEdit && <UserEdit open={openEdit} onClose={onEditClose} user={editUser} />}
        {openGrantData && <UserGrantDataPermissionModal open={openGrantData} onClose={()=>setOpenGrantData(false)} userId={grantUser.id} />}
        {openGrantUserRole && <UserGrantRoleModal open={openGrantUserRole} onClose={()=>setOpenGrantUserRole(false)} userId={grantRoleUser.id} />}
    </>
}
