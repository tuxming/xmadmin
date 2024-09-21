
const proServer = "";
const devServer = "http://localhost";

export const server = process.env.NODE_ENV === 'production' ? proServer : devServer;

//后台页面的根目录
export const basePath = "/sys"

export const api = {
    loginPage: "/login",
    backendPage: "/sys/overview",
    menu: {
        curr: server + "/am/menu/curr",
        list: server + "/am/menu/list",
        saveOrUpdate: server + "/am/menu/saveOrUpdate",
        delete: server + "/am/menu/delete",
        byRole: server + "/am/menu/byRole",
    },
    auth: {
        login: server + "/auth/login",
        code: server + "/auth/code",
        sendMailCode: server + '/auth/sendMailCode',
        sendPhoneCode: server + '/auth/sendPhoneCode',
        resetPassword: server + '/auth/resetPassword'
    },
    wallpaper: {
        wallpaperAllCategories: server + '/public/wallpaperAllCategories',
        wallpaperImageList: server + "/public/wallpaperImageList"
    },
    user: {
        get: server + "/am/user/get",
        list: server + "/am/user/list",
        search: server + "/am/user/search",
        delete: server + "/am/user/delete",
        update: server + "/am/user/update",
        dataPermissions: server + "/am/user/dataPermissions",
        userDataAdd: server + "/am/user/userDataAdd",
        userDataDelete: server + "/am/user/userDataDelete",
        userRoles: server + "/am/user/userRoles",
        userRoleAdd: server + "/am/user/userRoleAdd",
        userRoleDelete: server + "/am/user/userRoleDelete",
    },
    role: {
        search: server + "/am/role/search",
        list: server + "/am/role/list",
        create: server + "/am/role/create",
        update: server + "/am/role/update",
        deletes: server + "/am/role/deletes",
        grantPermissions: server + "/am/role/grantPermissions", //分配角色权限
        grantMenus: server + "/am/role/grantMenus", //分配角色权限
    },
    permission: {
        search: server + "/am/permission/search",
        list: server + "/am/permission/list",
        create: server + "/am/permission/create",
        update: server + "/am/permission/update",
        deletes: server + "/am/permission/deletes",
        scan: server + "/am/permission/scan",
        curr: server + "/am/permission/curr",  //获取当前登录用户的权限
        byRole: server + "/am/permission/byRole",  //获取指定角色的权限
    },
    history: {
        get: server + "/am/history/get",
        list: server + "/am/history/list",
        deletes: server + "/am/history/deletes"
    },
    document: { 
        img:  server + "/public/img",
        list: server + "/am/document/list",
        upload: server + "/am/document/upload",
        deletes: server + "/am/document/deletes",
    },
    dept: {
        list: server + "/am/dept/list",
        create: server + "/am/dept/create",
        update: server + "/am/dept/update",
        delete: server + "/am/dept/delete",
    },
    lang: {
        groups: server + "/am/lang/groups",
        langs: server + "/am/lang/langs",
        resources: server + "/am/lang/resources",
        addLang: server + "/am/lang/addLang",
        updateLang: server + "/am/lang/updateLang",
        deleteLang: server + "/am/lang/deleteLang",
        updateRes: server + "/am/lang/updateRes",
        deleteRes: server + "/am/lang/deleteRes",
        resourceByKey:  server + "/am/lang/resourceByKey",
    },
    dict: {
        groups: server + "/am/dict/groups",
        dicts: server + "/am/dict/dicts",
        saveOrUpdateGroup: server + "/am/dict/saveOrUpdateGroup",
        deleteGroup: server + "/am/dict/deleteGroup",
        addDict: server + "/am/dict/addDict",
        updateDict: server + "/am/dict/updateDict",
        deleteDict: server + "/am/dict/deleteDict",
        byKey: server + "/am/dict/byKey",
    }
}
