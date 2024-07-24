import { QueryComponent } from '../../components';
import { Input, DatePicker } from "antd"
import { useSelector } from '../../redux/hooks';
import { UserSelector } from '../user/index';


export type RoleQueryComponentType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

/**
 * 角色搜索条件表单
 * @returns 
 */
export const RoleQueryComponent: React.FC<RoleQueryComponentType> = ({onQuery}) => {

    const size = useSelector(state => state.themeConfig.componentSize);

    const queryItems = [
        {
            label: "角色名",
            name: "userId",
            inputElement: <UserSelector name="userId" mode='single' size={size}/>
        },
        {
            label: "角色代码",
            name: "code",
            inputElement: <Input name="fullname" size={size}/>
        },
        {
            label: "角色类型",
            name: "types",
            inputElement: <Input name="email" size={size}/>
        },
        {
            label: "创建人",
            name: "creaters",
            inputElement: <UserSelector name="creaters" mode='multiple' size={size}/>
        }
    ]

    let onQueryEvent = (values) => {

        if(values.types){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            values.types = values.types.map(item => item.value*1);
        }
        if(values.creaters){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            values.creaters = values.creaters.map(item => item.value*1);
        }

        onQuery(values);
    }

    return <>
        <QueryComponent items={queryItems} onQuery={onQueryEvent} />
    </>
}

