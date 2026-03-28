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

import { Button, Space, Tag, theme, Typography, Tooltip } from "antd"
import { AdminUser, DefaultNS } from "../../../common/I18NNamespace"
import { TableComponent, useLayer } from "../../../components"
import { useRequest, useShowResult, useTranslation } from "../../../hooks"
import { useEffect, useRef, useState } from "react"
import { api } from "../../../common/api"
import { PlusOutlined } from "@ant-design/icons"
import { useDict } from "../../../common/dict"
import { RoleSelector } from "../role"
import { CustomScroll } from "react-custom-scroll"


export const UserGrantRole : React.FC<{
    userId: number,
    titleLevel?: 1|2|3|4|5,
    titleStyle?: {
        [key: string]: string | number
    },
    wrapperStyle?: {
        [key: string]: string | number
    },
}> = ({
    userId,
    titleLevel,
    titleStyle,
    wrapperStyle
}) => {
    
    const {t, f} = useTranslation(AdminUser);
    const request = useRequest();
    const {confirm, message, destory} = useLayer();
    const  [confirmId, setConfirmId] = useState<string>();
    const [userRoles, setUserRoles] = useState<any[]>();
    const roleTypes = useDict("RoleType");
    const { token } = theme.useToken();
    const selectRoleRef = useRef<any>();
    const showResult = useShowResult(AdminUser);

    const getUserRoles = async ()=> {
        let result = await request.get(api.user.userRoles+"?id="+userId);
        if(result.status){
            setUserRoles(result.data);
        }
    }

    useEffect(()=>{
        getUserRoles();
    }, []);

    //删除用户角色
    const onDelete = (role) => {
        confirm({
            title: t("删除用户角色"),
            content: f("确定要删用户的角色%s？", [role.roleName]),
            onOk: (close) => {
                let deleteUserRole = async () => {
                    let result = await request.get(api.user.userRoleDelete+"?id="+role.id);
                    showResult.show(result);
                    if(result.status){
                        getUserRoles();
                        close();
                    }
                }
                deleteUserRole();
            }
        });
    }

    //提交新增
    const submitAdd = async () => {
        let selectedRole = selectRoleRef.current;
        if(!selectedRole || selectedRole.length== 0 || !selectedRole[0].key){
            message.warning("请选择角色");
            return;
        }

        let result = await request.get(api.user.userRoleAdd+"?id="+userId+"&rid="+selectedRole[0].key);
        showResult.show(result);
        if(result.status){
            getUserRoles();
            setConfirmId(prevId => {
                destory(prevId);
                return null;
            });
        }
    }

    //添加用户角色
    const onAdd = () => {
        let id = confirm({
            title: t("请选择角色"),
            content: (<div style={{marginTop: 15}}>
                <RoleSelector mode="single" onChange={(value) => selectRoleRef.current = value} />
            </div>),
            onOk: () => {
                submitAdd();
            },
            width: 300,
            height: 220
        });
        setConfirmId(id);
    }

    const useCols = [
        {title: t("角色名称"), key: "roleName", width: 150},
        {title: t("角色代码"), key: "code", width: 100},
        {title: t("角色类型"), key: "type", width: 100, render: (text, record, index) => {
            let color = roleTypes?.find(r => r.value == text)?.color;
            let label = roleTypes?.find(r => r.value == text)?.label;
            return <Tag color={color}>{label}</Tag>
        }},
        {title: t("操作"), key: "action", width: 100, render: (text, record, index) => {
            return <Button type="link" danger onClick={() => onDelete(record)}>{t("删除")}</Button>
        }}
    ]

    return <div style={{...wrapperStyle, display: 'flex', flexDirection: 'column', height: '100%'}}>
        <div style={{position: 'relative', flexShrink: 0}}>
            <Typography.Title level={titleLevel}  style={titleStyle} >
                {t("分配角色")}
            </Typography.Title>
        </div>
        <div style={{flex: 1, minHeight: 0}}>
            <CustomScroll heightRelativeToParent="100%">
                <div style={{paddingBottom: 20, overflowX: 'hidden', paddingRight: 10}}>
                    <Space wrap>
                        {userRoles && userRoles.map(r => (
                            <Tag key={r.id} color={roleTypes?.find(rt => rt.value == r.type)?.color}
                                closable onClose={() => onDelete(r)}
                            >{r.roleName + "("+r.code+")"}
                            </Tag>
                        ))}
                        <Tag onClick={onAdd} 
                            style={{background: token.colorBgContainer,borderStyle: 'dashed',
                                cursor: 'pointer'
                            }}
                        >
                            <PlusOutlined /> {t('添加角色')}
                        </Tag>
                    </Space>
                    <div style={{marginTop: 15}}>
                        <TableComponent pageSize={20} query={{}} apiUrl={api.user.userRoles + "?id="+userId} 
                            onSelect={()=>{}} 
                            columns={useCols}
                            refresh={{tag: 1, reset: false}}
                        />
                    </div>
                </div>
            </CustomScroll>
        </div>
    </div>
}