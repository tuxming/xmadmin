import { QueryComponent } from '../../components';
import { Input, DatePicker } from "antd"
import { useSelector } from '../../redux/hooks';
import { RoleSelector } from '../role';
import { UserSelector } from './index';

const { RangePicker } = DatePicker;

export type UserQueryComponentType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

export const UserQueryComponent: React.FC<UserQueryComponentType> = ({onQuery}) => {

    const size = useSelector(state => state.themeConfig.componentSize);

    const queryItems = [
        {
            label: "账号",
            name: "userId",
            inputElement: <UserSelector name="userId" mode='single' size={size} allowClear/>
        },
        {
            label: "姓名",
            name: "fullname",
            inputElement: <Input name="fullname" size={size} allowClear/>
        },
        {
            label: "邮件地址",
            name: "email",
            inputElement: <Input name="email" size={size} allowClear/>
        },
        {
            label: "电话",
            name: "phone",
            inputElement: <Input name="phone" size={size} allowClear/>
        },
        {
            label: "角色",
            name: "roleIds",
            inputElement: <RoleSelector mode='multiple' allowClear/>  //mode: multiple, single
        },
        {
            label: "创建时间",
            name: "created",
            inputElement: <RangePicker name="created" size={size} allowClear/>
        },
    ]

    let onQueryEvent = (values) => {

        if(values.roleIds){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            values.roleIds = values.roleIds.map(item => item.value*1);
        }

        if(values.created){
            let start = values.created[0].format("YYYY-MM-DD");
            let end = values.created[1].format("YYYY-MM-DD");
            // console.log(start, end);
            values['startDate'] = start;
            values['endDate'] = end;
            delete values.created
        }

        if(values.userId){
            values.userId = values.userId[0].value;
        }

        onQuery(values);
    }

    return <>
        <QueryComponent items={queryItems} onQuery={onQueryEvent} />
    </>
}

