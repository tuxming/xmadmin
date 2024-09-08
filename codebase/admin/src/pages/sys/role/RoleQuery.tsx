import { QueryComponent, useTranslation } from '../../../components';
import { Input } from "antd"
import { useSelector } from '../../../redux/hooks';
import { UserSelector } from '../user/index';
import { AdminRole } from '../../../common/I18NNamespace';


export type RoleQueryType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

/**
 * 角色搜索条件表单
 * @returns 
 */
export const RoleQuery: React.FC<RoleQueryType> = ({onQuery}) => {

    const size = useSelector(state => state.themeConfig.componentSize);
    const {t} = useTranslation(AdminRole);

    const queryItems = [
        {
            label: t("角色名"),
            name: "userId",
            inputElement: <UserSelector name="userId" mode='single' size={size} allowClear/>
        },
        {
            label: t("角色代码"),
            name: "code",
            inputElement: <Input name="code" size={size} allowClear/>
        },
        {
            label: t("角色类型"),
            name: "types",
            inputElement: <Input name="types" size={size} allowClear/>
        },
        {
            label: t("创建人"),
            name: "creaters",
            inputElement: <UserSelector name="creaters" mode='multiple' size={size} allowClear/>
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

