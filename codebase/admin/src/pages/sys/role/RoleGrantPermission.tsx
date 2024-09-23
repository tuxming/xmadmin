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

import React, { useContext, useEffect, useState } from 'react';
import { Button, Divider, Flex, Table, Tag, Tooltip, Transfer, Typography } from 'antd';
import type { GetProp, TableColumnsType, TableProps, TransferProps } from 'antd';
import { useRequest, useShowResult, useTranslation } from '../../../hooks';
import { Modal, ModalContext } from '../../../components';
import { AdminRole } from '../../../common/I18NNamespace';
import { computePx } from '../../../common/kit';
import { api } from '../../../common/api';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
    key: number;
    name: string;
    expression: string;
    groupName: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
    dataSource: DataType[];
    leftColumns: TableColumnsType<DataType>;
    rightColumns: TableColumnsType<DataType>;
}

// Customize Table Transfer
const TableTransfer: React.FC<TableTransferProps> = (props) => {
    const { leftColumns, rightColumns, ...restProps } = props;

    //当组件使用窗口话的时候，获取窗口的位置信息，设置到表格
    const modalPos = useContext(ModalContext);
    const [pos, setPos] = useState({
        width: null, 
        height: null,
    });

    useEffect(()=> {
        if(modalPos && modalPos.width && modalPos.height){
            let npos = {
                width: computePx(modalPos.width),
                height: computePx(modalPos.height, true) 
            };
            // console.log(modalPos, npos);
            setPos(npos)
        }

    }, [modalPos]);

    return (
        <Transfer style={{ width: '100%' }} {...restProps}>
            {({
                direction,
                filteredItems,
                onItemSelect,
                onItemSelectAll,
                selectedKeys: listSelectedKeys,
            }) => {
                const columns = direction === 'left' ? leftColumns : rightColumns;
                const rowSelection: TableRowSelection<TransferItem> = {
                    onChange(selectedRowKeys) {
                        onItemSelectAll(selectedRowKeys, 'replace');
                    },
                    selectedRowKeys: listSelectedKeys,
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
                };

                return (
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={filteredItems}
                        pagination={{
                            pageSize: 10000
                        }}
                        scroll={{y: pos.height? pos.height - 350 : 500}}
                        onRow={({ key }) => ({
                            onClick: () => {
                                onItemSelect(key, !listSelectedKeys.includes(key));
                            },
                        })}
                        rowKey={(record) => record.key}
                        size="small"
                    />
                );
            }}
        </Transfer>
    );
};

//权限列表类型定义
const columns: TableColumnsType<DataType> = [
    {
        dataIndex: 'name',
        title: '权限名',
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ['descend', 'ascend'],
    },
    {
        dataIndex: 'expression',
        title: '表达式',
        ellipsis: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ['descend', 'ascend'],
        render(text, record, index) {
            return <Tooltip title={text}>
                 {text}
            </Tooltip>
        },
    },
    {
        dataIndex: 'groupName',
        title: '分组',
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ['descend', 'ascend'],
        render: (groupName: string) => (
            <Tag style={{ marginInlineEnd: 0 }} color="cyan">
                {groupName}
            </Tag>
        ),
    },
];

const filterOption = (input: string, item: DataType) => 
    item.name?.includes(input) || item.groupName?.includes(input) || item.expression.includes(input);

/**
 * 分配权限页面
 */
export const RoleGrantPermisison: React.FC<{
    roleId: number,
    onClose: () => void
}> = ({
    roleId,
    onClose
}) => {
    const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

    const {t} = useTranslation(AdminRole);
    const request = useRequest();
    const [permissions, setPermissions] = useState<DataType[]>([]);
    const showResult = useShowResult(AdminRole);

    const getAll = async () => {
        let result = await request.get(api.permission.curr);
        if(result){
            setPermissions(result.data.map(p => ({
                key: p.id,
                name: p.name,
                groupName: p.groupName,
                expression: p.expression
            })));
        }
    }

    //获取已分配的权限
    const getSelectKeys = async () => {
        let result = await request.get(api.permission.byRole+"?id="+roleId);
        if(result){
            // console.log(result.data.map(p => p.id));
            setTargetKeys(result.data.map(p => p.id))
        }
    }

    useEffect(()=>{
        getAll();
        getSelectKeys();
    }, []);

    //移动事件回调
    const onChange: TableTransferProps['onChange'] = (nextTargetKeys) => {
        // console.log(nextTargetKeys);
        setTargetKeys(nextTargetKeys);
    };

    const [visible, setVisible] = useState(true);

    const onCloseModal = () => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 500);
    }

    const onClickCancel = () => {
        onCloseModal();
    }

    //提交分配结果
    const onClickOk = async () => {
        // console.log(targetKeys);
        let result = await request.post(api.role.grantPermissions+"?id="+roleId, targetKeys);
        showResult.show(result);
    }

    return (
        <Modal width={900} height={800} open={visible} onClose={onCloseModal} 
            title={t("分配权限")}
        >
            <div style={{padding: "0px 20px 10px 20px"}}>
                <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{t('分配权限')}</Typography.Title>
                <Flex align="start" gap="middle" vertical>
                    <TableTransfer
                        dataSource={permissions}
                        targetKeys={targetKeys}
                        showSearch
                        showSelectAll={false}
                        onChange={onChange}
                        filterOption={filterOption}
                        leftColumns={columns}
                        rightColumns={columns}
                    />
                </Flex>
                <Divider />
                <div style={{
                    textAlign: "right",
                }}>
                    <Button onClick={onClickCancel}>{t('取消')}</Button>
                    <Button onClick={onClickOk} type="primary" style={{
                        marginLeft: 20
                    }}>{t('确定')}</Button>
                </div>
            </div>
        </Modal>
    );
};
