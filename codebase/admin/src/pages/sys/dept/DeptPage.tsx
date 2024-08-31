import { App, Divider, Space, Tooltip } from "antd";
import { AdminDept, DefaultNS } from "../../../common/I18NNamespace";
import { AuthButton, useRequest, useTranslation } from "../../../components";
import { useSelector } from "../../../redux/hooks";
import { useState } from "react";
import { DeptList, DeptEdit, DeptEditFormType } from "./index";
import { AddIcon, DeleteIcon, EditIcon } from "../../../components/icon/svg/Icons";
import { permission } from "../../../common/permission";
import { api } from "../../../common/api";

export const DeptPage : React.FC = () => {

    const {t, f} = useTranslation(AdminDept);

    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message, modal} = App.useApp();
    const [query, setQuery] = useState({});
    const [selectedRows, setSelectedRows] = useState<any>();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [dept, setDept] = useState<DeptEditFormType>();
    const request = useRequest();

    const [needUpdateId, setNeedUpdateId] = useState<any>();

    const onTableSelectChange =  (rows:any) => {
        // console.log(rows);
        setSelectedRows(rows);
    };

    //创建组织
    const onCreate = () => {
        if(selectedRows && selectedRows.length>0){
            let row = selectedRows[0];
            setDept({parentId: row.id, parentName: row.pathName});
        }else{
            setDept({});
        }
        setIsEditOpen(true);
        setTitle(t('新增组织'));
    }

    //编辑组织
    const onEdit = () => {
        if(selectedRows && selectedRows.length>0){
            let row = selectedRows[0];
            if(row.id == 1){
                message.warning(t('禁止编辑'));
                return;
            }

            let parentName = row.pathName.substring(0, row.pathName.length-1);
            parentName = parentName.substring(0, parentName.lastIndexOf("/")+1)

            setDept({...selectedRows[0], parentName: parentName});
            setIsEditOpen(true);
            setTitle(t("编辑组织"));
        }else{
            message.warning("请先选中组织，在编辑");
        }
    }

    //删除组织
    const onDelete = () => {
        if(selectedRows && selectedRows.length==0){
            message.warning(t('请选择要删除的组织'));
            return;
        }

        let row = selectedRows[0];
        if(row.id == 1){
            message.warning(t("禁止删除"));
            return;
        }

        modal.confirm({
            title: f("确定要删除组织：%s?, 该组织及其子节点都会被一起删除，请确定无误在删除！", [row.name]),
            onOk: () => {
                let doDelete = async () => {
                    let result = await request.get(api.dept.delete+"?id="+row.id);
                    if(result.status){
                        message.success(t(result.msg, DefaultNS));
                        setNeedUpdateId(row.parentId);
                    }else{
                        message.warning(t(result.msg));
                    }
                }
                doDelete();
            }
        });

    }

    const onAddClose = (needUpdateId) => {
        if(needUpdateId){
            setNeedUpdateId(needUpdateId);
        }
        setIsEditOpen(false)
    }

    return <>
        <Space wrap style={{marginTop: 20}}>
            <AuthButton type='primary' size={size} tip={t("新增组织")}
                icon={<AddIcon type='primary'/>} 
                onClick={onCreate}
                requiredPermissions={permission.dept.create.expression}
            >
                {!onlyIcon && t('新增')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t("编辑组织")}
                icon={<EditIcon type='primary'/>} 
                onClick={onEdit}
                requiredPermissions={permission.dept.update.expression}
            >
                {!onlyIcon && t('编辑')}
            </AuthButton>
            <AuthButton type='primary' size={size} danger  ghost tip={t("删除组织")}
                icon={<DeleteIcon type='primary' danger ghost/>} 
                onClick={onDelete}
                requiredPermissions={permission.dept.delete.expression}
            >
                {!onlyIcon && t('删除')}
            </AuthButton>
        </Space>
        <Divider />
        <DeptList onSelect={onTableSelectChange} query={query} needUpdateId={needUpdateId}/>
        {isEditOpen && <DeptEdit open={isEditOpen} onClose={onAddClose} title={title} dept={dept} />}
    </>
}
