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

import { Avatar, Card, Col, Descriptions, Row, Space, Tag, Typography } from "antd"
import { useSelector } from "../../hooks"
import { api } from "../../common/api"

export const OverviewPage : React.FC = () => {

    const user = useSelector(state => state.persistedUser);

    return <>
        <div style={{ padding: 20 }}>
            <Row gutter={[16,16]}>
                <Col xs={24} md={12}>
                    <Card 
                        title={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                            <span style={{ width:12, height:12, borderRadius:12, background:'linear-gradient(135deg,#06b6d4,#f97316)' }}></span>
                            当前用户
                        </span>}
                        style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow:'hidden', minHeight: 260, height:'100%' }}
                        headStyle={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}
                    >
                        <Space align="start" size={16}>
                            <Avatar
                                size={64}
                                src={user?.photo ? (api.document.img + '?id=' + user.photo) : undefined}
                            />
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="ID">{user?.id ?? '-'}</Descriptions.Item>
                                <Descriptions.Item label="用户名">{user?.username ?? '-'}</Descriptions.Item>
                                <Descriptions.Item label="姓名">{user?.fullname ?? '-'}</Descriptions.Item>
                                <Descriptions.Item label="邮箱">{user?.email ?? '-'}</Descriptions.Item>
                                <Descriptions.Item label="手机号">{user?.phone ?? '-'}</Descriptions.Item>
                            </Descriptions>
                        </Space>
                        <div style={{ marginTop: 12 }}>
                            <Space wrap size={[8,8]}>
                                {(user?.roles || []).map((r:any, idx:number)=>(
                                    <Tag key={idx} color="geekblue">{r?.name ?? r?.code ?? '角色'}</Tag>
                                ))}
                                {user?.dept?.fullname && <Tag color="green">部门：{user.dept.fullname}</Tag>}
                                {user?.company?.fullname && <Tag color="gold">公司：{user.company.fullname}</Tag>}
                                {user?.group?.fullname && <Tag color="purple">组：{user.group.fullname}</Tag>}
                                {Array.isArray(user?.permissions) && <Tag color="cyan">权限：{user.permissions.length}</Tag>}
                            </Space>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card 
                        title={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                            <span style={{ width:12, height:12, borderRadius:12, background:'linear-gradient(135deg,#06b6d4,#f97316)' }}></span>
                            联系作者
                        </span>}
                        style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow:'hidden', minHeight: 260, height:'100%' }}
                        headStyle={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}
                    >
                        <Space direction="vertical" size={6}>
                            <Typography.Text>微信：angft2</Typography.Text>
                            <Typography.Text>Email：tuxming@gmail.com</Typography.Text>
                            <Typography.Text type="secondary">工作日联系请备注来由</Typography.Text>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card 
                        title={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                            <span style={{ width:12, height:12, borderRadius:12, background:'linear-gradient(135deg,#06b6d4,#f97316)' }}></span>
                            版权说明
                        </span>}
                        style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow:'hidden', minHeight: 260, height:'100%' }}
                        headStyle={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}
                    >
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                            MIT License © 2024 tuxming@sina.com / wechat: angft1
                        </Typography.Paragraph>
                        <Typography.Paragraph type="secondary">
                            允许商用与修改，请保留版权声明。
                        </Typography.Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card 
                        title={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                            <span style={{ width:12, height:12, borderRadius:12, background:'linear-gradient(135deg,#06b6d4,#f97316)' }}></span>
                            技术框架
                        </span>}
                        style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow:'hidden', minHeight: 260, height:'100%' }}
                        headStyle={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}
                    >
                        <Space direction="vertical" size={6}>
                            <Typography.Text>前端：React、Ant Design</Typography.Text>
                            <Typography.Text>状态管理：Redux Toolkit</Typography.Text>
                            <Typography.Text>构建：CRACO / React Scripts</Typography.Text>
                            <Typography.Text>后端：JFinal、Shiro、JWT</Typography.Text>
                            <Space wrap size={[8,8]} style={{ marginTop: 8 }}>
                                <Tag color="processing">Axios</Tag>
                                <Tag color="default">i18next</Tag>
                                <Tag color="success">Pinia/Redux Persist</Tag>
                            </Space>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    </>
}
