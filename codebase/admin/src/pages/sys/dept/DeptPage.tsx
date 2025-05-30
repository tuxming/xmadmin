/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { App, Divider, Space } from "antd";
import { AdminDept} from "../../../common/I18NNamespace";
import { AuthButton, useLayer } from "../../../components";
import { useRequest, useTranslation, useSelector } from "../../../hooks";
import { useRef, useState } from "react";
import { DeptList, DeptEdit, DeptEditFormType } from "./index";
import { AddIcon, DeleteIcon, EditIcon } from "../../../components/icon/svg/Icons";
import { permission } from "../../../common/permission";
import { api } from "../../../common/api";
import { useShowResult } from "../../../hooks/useShowResult";

export const DeptPage : React.FC = () => {

    const {t, f} = useTranslation(AdminDept);

    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message, confirm} = useLayer();
    const [query, setQuery] = useState({});
    const [selectedRows, setSelectedRows] = useState<any>();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [dept, setDept] = useState<DeptEditFormType>();
    const request = useRequest();
    const showResult = useShowResult(AdminDept);

    const updateQueue = useRef<number[]>([]);

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

    const setUpdate = (updateId) => {
        if(updateId == needUpdateId){
            setNeedUpdateId(null);
            setTimeout(() => {
                setNeedUpdateId(updateId);
            }, 100);
        }else{
            setNeedUpdateId(updateId);
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

        confirm({
            content: f("确定要删除组织：%s?, 该组织及其子节点都会被一起删除，请确定无误在删除！", [row.name]),
            onOk: (onClose) => {
                let doDelete = async () => {
                    let result = await request.get(api.dept.delete+"?id="+row.id);
                    showResult.show(result);
                    if(result.status){
                        setUpdate(row.parentId);
                        onClose();
                    }
                }
                doDelete();
            }
        });
    }

    const onUpdateChildren = () => {
        updateFromQueue();
    }

    const onAddClose = (updateIds) => {
        if(updateIds){
            setSelectedRows([]);
            updateIds.forEach(id => updateQueue.current.push(id));
            updateFromQueue();
        }
        setIsEditOpen(false)
    }

    const updateFromQueue = () => {
        let arr = updateQueue.current;
        if(arr.length>0){
            let id = arr[0];
            arr.splice(0,1);
            updateQueue.current = arr;
            setUpdate(id);
        }
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
        <DeptList onSelect={onTableSelectChange} query={query} needUpdateId={needUpdateId} onChildUpdated={onUpdateChildren}/>
        {isEditOpen && <DeptEdit open={isEditOpen} onClose={onAddClose} title={title} dept={dept} />}
    </>
}
