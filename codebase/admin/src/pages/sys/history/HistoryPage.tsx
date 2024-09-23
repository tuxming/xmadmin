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

import { useState } from "react";
import { Divider, Space } from "antd";
import { DeleteIcon, ViewIcon } from "../../../components/icon/svg/Icons";
import { HistoryQuery, HistoryList, HistoryDetail } from "./index";
import { HistoryDelete } from "./HistoryDelete";
import { useTranslation,useSelector } from "../../../hooks";
import { AuthButton, useLayer } from "../../../components";
import { AdminHistory } from "../../../common/I18NNamespace";
import { permission } from "../../../common/permission";

export const HistoryPage : React.FC = () => {

    const {t} = useTranslation(AdminHistory);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const [query, setQuery] = useState({});
    const size = useSelector(state => state.themeConfig.componentSize);
    const { message } = useLayer();
    
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });
    const [views, setViews] = useState<any>([]);
    const [histories, setHistories] = useState<any>();
    const [deletes, setDeletes] = useState<any>([]);

    let onQuery = (values) => {
        setQuery(values);
    }

    /**
     * 选中行
     */
    const onTableSelectChange =  (rows:any) => {
        if(!rows || rows.length == 0){
            setHistories([]);
        }else{
            setHistories(rows);
        }
    };

    /**
     * 查看详情
     */
    const onViewDetail = () => {
        if(!histories || histories.length==0){
            message.error(t("请选择要查看的日志"));
            return;
        }
        setViews([...histories]);
    }

    /**
     * 关闭查看详情后的回调
     */
    const onViewClose = (item) => {
        let newView = views.filter(v => v.id !== item.id);
        console.log(newView);
        setViews([...newView]);
    } 

    /**
     * 执行删除
     */
    const onDelete = () => {
        if(!histories || histories.length==0){
            message.error(t("请选择要删除的日志"));
            return;
        }
        setDeletes([]);
        setTimeout(() => {
            setDeletes(histories);
        }, 60);
    }

    /**
     * 刷新列表
     */
    const onRefresh = () => {
        setRefresh({reset: false, tag: refresh.tag+1});
    }

    return <>
        <HistoryQuery onQuery={onQuery} />
        
        <Divider />

        <Space wrap>
            <AuthButton type='primary' size={size} tip='查看日志' 
                icon={<ViewIcon type='primary'/>}
                onClick={onViewDetail}
                requiredPermissions={permission.history.get.expression}
            >
                {!onlyIcon && '查看'}
            </AuthButton>
            <AuthButton type='primary' size={size} tip='删除日志' 
                icon={<DeleteIcon type='primary' danger ghost/>}
                onClick={onDelete} ghost danger
                requiredPermissions={permission.history.delete.expression}
            >
                {!onlyIcon && '删除'}
            </AuthButton>
        </Space>

        <Divider />

        <HistoryList onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        {views.map(view =>
            (<HistoryDetail historyId={view.historyId}  close={() => onViewClose(view)} open={true} key={view.id}/>)
        )}

        <HistoryDelete histories={deletes} successCall={onRefresh}/>

    </>
}