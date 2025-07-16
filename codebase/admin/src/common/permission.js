export const permission = {
    user: {
        create: { groupName: "system",  name: "新增用户", expression: "sys:user:create"},
        update: { groupName: "system",  name: "编辑用户", expression: "sys:user:update"},
        delete: { groupName: "system",  name: "删除用户", expression: "sys:user:delete"},
        loginAs: { groupName: "system",  name: "登录此用户", expression: "sys:user:loginAs"},
    },
    role: {
        create: { groupName: "system",  name: "新增角色", expression: "sys:role:create"},
        update: { groupName: "system",  name: "编辑角色", expression: "sys:role:edit"},
        delete: { groupName: "system",  name: "删除角色", expression: "sys:role:delete"},
    },
    permission: {
        create: { groupName: "system",  name: "新增权限", expression: "sys:permission:create"},
        update: { groupName: "system",  name: "编辑权限", expression: "sys:permission:edit"},
        delete: { groupName: "system",  name: "删除权限", expression: "sys:permission:delete"},
        scan: { groupName: "system",  name: "扫描权限", expression: "sys:permission:scan"},
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
    document: {
        create: { groupName: "system",  name: "上传文件", expression: "sys:doc:delete"},
        delete: { groupName: "system",  name: "删除文件", expression: "sys:doc:upload"},
    },
    history: {
        get: { groupName: "system",  name: "查看日志详情", expression: "sys:history:get"},
        delete: { groupName: "system",  name: "删除日志", expression: "sys:history:create"},
    },
    image: {
        create: { groupName: "image",  name: "新增图片", expression: "sys:image:create"},
        update: { groupName: "image",  name: "编辑图片", expression: "sys:image:update"},
        delete: { groupName: "image",  name: "删除图片", expression: "sys:image:delete"},
        upload: { groupName: "image",  name: "上传图片", expression: "sys:image:upload"},
        folderCreate: { groupName: "image",  name: "新增文件夹", expression: "sys:image:folder:create"},
        folderUpdate: { groupName: "image",  name: "编辑文件夹", expression: "sys:image:folder:update"},
        folderDelete: { groupName: "image",  name: "删除文件夹", expression: "sys:image:folder:delete"},
    },
}