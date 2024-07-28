

export const permission = {
    user: {
        create: { groupName: "system",  name: "新增用户", expression: "sys:user:create"},
    },
    role: {
        create: { groupName: "system",  name: "新增角色", expression: "sys:role:create"},
        update: { groupName: "system",  name: "编辑角色", expression: "sys:role:edit"},
        delete: { groupName: "system",  name: "删除角色", expression: "sys:role:delete"},
    }
}