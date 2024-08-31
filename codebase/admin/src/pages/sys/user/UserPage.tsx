import React, {useState} from 'react';
import { Button, Tooltip, Space, Divider } from "antd"
import { useSelector } from "../../../redux/hooks"
import { UserAddIcon, DeleteIcon, EditIcon, } from '../../../components/icon/svg/Icons';
import { UserQueryComponent, UserListComponent } from './index'
import { AuthButton } from '../../../components';
import { permission } from '../../../common/permission';

export const UserPage : React.FC = () => {
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const [query, setQuery] = useState({});
    const size = useSelector(state => state.themeConfig.componentSize);

    let onQuery = (values) => {
        console.log(values);
        setQuery(values);
    }

    const onTableSelectChange =  (rows:any) => {
        console.log(rows);
    };

    return <>
        <UserQueryComponent onQuery={onQuery}/>
        
        <Divider />

        <Space wrap>
            <AuthButton type='primary' size={size} tip='新增用户' 
                icon={<UserAddIcon type='primary'/>}
                requiredPermissions={permission.user.create.expression}
            >
                {!onlyIcon && '新增'}
            </AuthButton>
            <Tooltip title="编辑用户">
                <Button type='primary' size={size} icon={<EditIcon type='primary'/>}>{!onlyIcon && '编辑'}</Button>
            </Tooltip>
            <Tooltip title="删除用户">
                <Button type='primary' size={size} icon={<DeleteIcon type='primary' danger ghost/>} ghost danger>{!onlyIcon && '删除'}</Button>
            </Tooltip>
        </Space>

        <Divider />

        <UserListComponent onSelect={onTableSelectChange} query={query}/>
        
    </>
}
