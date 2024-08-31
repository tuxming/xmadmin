

export const permission = {
    user: {
        create: { groupName: "system",  name: "新增用户", expression: "sys:user:create"},
    },
    role: {
        create: { groupName: "system",  name: "新增角色", expression: "sys:role:create"},
        update: { groupName: "system",  name: "编辑角色", expression: "sys:role:edit"},
        delete: { groupName: "system",  name: "删除角色", expression: "sys:role:delete"},
    },
    menu: {
        delete: { groupName: "system",  name: "删除菜单", expression: "sys:menu:delete"},
        create: { groupName: "system",  name: "新增菜单", expression: "sys:menu:create"},
    },
    dept: {
        create: { groupName: "system",  name: "新增组织", expression: "sys:dept:create"},
        update: { groupName: "system",  name: "编辑组织", expression: "sys:dept:edit"},
        delete: { groupName: "system",  name: "删除组织", expression: "sys:dept:delete"},
    },
    lang: {
        langAdd: { groupName: "system",  name: "新增语言", expression: "sys:lang:create"},
        langDelete: { groupName: "system",  name: "删除语言", expression: "sys:lang:delete"},
        langEdit: { groupName: "system",  name: "编辑语言", expression: "sys:lang:edit"},
        resAdd: { groupName: "system",  name: "新增资源", expression: "sys:res:create"},
        resEdit: { groupName: "system",  name: "编辑资源", expression: "sys:res:edit"},
        resDelete: { groupName: "system",  name: "删除资源", expression: "sys:res:delete"},
    },
    dict: {
        add: { groupName: "system",  name: "新增字典", expression: "sys:dict:create"},
        update: { groupName: "system",  name: "更新字典", expression: "sys:dict:update"},
        delete: { groupName: "system",  name: "删除字典", expression: "sys:dict:delete"},
        groupAdd: { groupName: "system",  name: "新增字典名", expression: "sys:dictGroup:create"},
        groupUpdate: { groupName: "system",  name: "更新字典名", expression: "sys:dictGroup:update"},
        groupDelete: { groupName: "system",  name: "删除字典名", expression: "sys:dictGroup:delete"},
    },
}