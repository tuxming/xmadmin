import React, {useState} from 'react';
import { Button, Tooltip, Space, Divider } from "antd"
import { useSelector } from "../../redux/hooks"
import { UserAddIcon, DeleteIcon, EditIcon, } from '../../components/icon/svg/Icons';
import { UserQueryComponent, UserListComponent } from './index'

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
            <Tooltip title="新增用户">
                <Button type='primary' size={size} icon={<UserAddIcon type='primary'/>}>{!onlyIcon && '新增'}</Button>
            </Tooltip>
            <Tooltip title="编辑用户">
                <Button type='primary' size={size} icon={<EditIcon type='primary'/>}>{!onlyIcon && '编辑'}</Button>
            </Tooltip>
            <Tooltip title="删除用户">
                <Button type='primary' size={size} icon={<DeleteIcon type='ghostPrimary' danger/>} ghost danger>{!onlyIcon && '删除'}</Button>
            </Tooltip>
        </Space>

        <Divider />

        <UserListComponent onSelect={onTableSelectChange} query={query}/>
        
    </>
}
