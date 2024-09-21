import { QueryComponent } from '../../../components';
import { useTranslation, useSelector } from '../../../hooks';
import { Input, DatePicker } from "antd"
import { UserSelector } from '../../index';
import { AdminHistory } from '../../../common/I18NNamespace';

const { RangePicker } = DatePicker;

export type HisotyrQueryType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

export const HistoryQuery: React.FC<HisotyrQueryType> = ({onQuery}) => {

    const size = useSelector(state => state.themeConfig.componentSize);
    const  {t} = useTranslation(AdminHistory);

    const queryItems = [
        {
            label: t("操作人"),
            name: "userId",
            inputElement: <UserSelector name="userId" mode='single' size={size} allowClear/>
        },
        {
            label: t("IP地址"),
            name: "ipAddr",
            inputElement: <Input name="fullname" size={size} allowClear/>
        },
        {
            label: '操作类型',
            name: "type",
            inputElement: <Input name="email" size={size} allowClear/>
        },
        {
            label: t("请求参数"),
            name: "remark",
            inputElement: <Input name="phone" size={size} allowClear/>
        },
         {
            label: t("操作时间"),
            name: "created",
            inputElement: <RangePicker name="created" size={size} allowClear/>
        },
    ]

    let onQueryEvent = (values) => {

        if(values.userId){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            values.userId = values.userId[0].key*1;
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

