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


import React, {useState} from 'react';
import {Tooltip, Space, Divider, UploadProps, Upload } from "antd"
import { DeleteIcon, UploadIcon } from '../../../components/icon/svg/Icons';
import { DocumentQuery, DocumentList, DocumentDelete } from './index'
import { useLayer, AuthButton } from '../../../components';
import { useTranslation, useSelector } from '../../../hooks';
import { AdminDocument } from '../../../common/I18NNamespace';
import { permission } from '../../../common/permission';
import { api } from '../../../common/api';

export const  DocumentPage : React.FC = () => {

    const {t} = useTranslation(AdminDocument);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message} = useLayer();
    const [query, setQuery] = useState({});
    const [selectedRows, setSelectedRows] = useState<any>();

    const [deletes, setDeletes] = useState<any>([]);
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });

    let onQuery = (values) => {
        // console.log(values);
        setQuery(values);
    }

    const onTableSelectChange =  (rows:any) => {
        // console.log(rows);
        setSelectedRows(rows);
    };

     /**
     * 刷新列表
     */
     const onRefresh = () => {
        setRefresh({reset: false, tag: refresh.tag+1});
    }

     /**
     * 执行删除
     */
     const onDelete = () => {
        if(!selectedRows || selectedRows.length==0){
            message.error(t("请选择要删除的文件"));
            return;
        }
        setDeletes([]);
        setTimeout(() => {
            setDeletes(selectedRows);
        }, 60);
    }
 
    const uploadProps: UploadProps = {
        name: 'file',
        action: api.document.upload,
        withCredentials: true,
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
      };

    return <div className='document-page'>
        <DocumentQuery onQuery={onQuery}/>
        <Divider />
        <Space wrap>
            <Tooltip title={t("上传文件")}>
                <Upload {...uploadProps} >
                    <AuthButton type='primary' size={size} 
                        icon={<UploadIcon type='primary'/>} 
                        requiredPermissions={permission.document.create.expression}
                    >
                        {!onlyIcon && t('上传')}
                    </AuthButton>
                </Upload>
            </Tooltip>
            <Tooltip title={t("删除文件")}>
                <AuthButton type='primary' size={size} danger  ghost
                    icon={<DeleteIcon type='primary' danger ghost />} 
                    onClick={onDelete}
                    requiredPermissions={permission.document.delete.expression}
                >
                    {!onlyIcon && t('删除')}
                </AuthButton>
            </Tooltip>
        </Space>
        <Divider />
        <DocumentList onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        <DocumentDelete docs={deletes} successCall={onRefresh}/>
    </div>
}