import { QueryComponent } from '../../../components';
import { useTranslation,useSelector } from '../../../hooks';
import { Input, DatePicker } from "antd"
import { UserSelector } from '../user/index';
import { AdminDocument } from '../../../common/I18NNamespace';

const { RangePicker } = DatePicker;


export type DocumentQueryType = {
    onQuery: (values) => void         //点击查询后，获取到的字段集合
}

/**
 * 文件管理的搜索条件表单
 * @returns 
 */
export const DocumentQuery: React.FC<DocumentQueryType> = ({onQuery}) => {

    const size = useSelector(state => state.themeConfig.componentSize);
    const {t} = useTranslation(AdminDocument);

    const queryItems = [
        {
            label: t("文件名"),
            name: "name",
            inputElement: <Input name="name" size={size} allowClear/>
        },
        {
            label: t("创建人"),
            name: "creater",
            inputElement: <UserSelector name="creater" mode='single' size={size} allowClear/>
        },
        {
            label: t("文件类型"),
            name: "type",
            inputElement: <Input name="type" size={size} allowClear/>
        },
        {
            label: t("备注"),
            name: "remark",
            inputElement: <Input name="remark" size={size} allowClear/>
        },
        {
            label: t("创建时间"),
            name: "created",
            inputElement: <RangePicker name="created" size={size} allowClear/>
        }
    ]

    let onQueryEvent = (values) => {

        if(values.creater){
            // [{"label": "普通管理员(admin)", "value": "3", "key": "3"}]
            // console.log(values.creater);
            values.creater = values.creater[0].key * 1
        }

        if(values.created){
            let start = values.created[0].format("YYYY-MM-DD");
            let end = values.created[1].format("YYYY-MM-DD");
            // console.log(start, end);
            values['startDate'] = start;
            values['endDate'] = end;
            delete values.created
        }

        onQuery(values);
    }

    return <>
        <QueryComponent items={queryItems} onQuery={onQueryEvent} />
    </>
}

