const proServer = "";
const devServer = "http://localhost";

export const server = import.meta.env.MODE === 'production' ? proServer : devServer;

// 后台页面的根目录
export const basePath = "/sys";

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
        userInfo: server + "/am/user/userInfo",
        search: server + "/am/user/search",
        delete: server + "/am/user/delete",
        create: server + "/am/user/create",
        update: server + "/am/user/update",
        dataPermissions: server + "/am/user/dataPermissions",
        userDataAdd: server + "/am/user/userDataAdd",
        userDataDelete: server + "/am/user/userDataDelete",
        userRoles: server + "/am/user/userRoles",
        userRoleAdd: server + "/am/user/userRoleAdd",
        userRoleDelete: server + "/am/user/userRoleDelete",
        loginAs: server + "/am/user/loginAs",
    },
    role: {
        search: server + "/am/role/search",
        list: server + "/am/role/list",
        create: server + "/am/role/create",
        update: server + "/am/role/update",
        deletes: server + "/am/role/deletes",
        grantPermissions: server + "/am/role/grantPermissions",
        grantMenus: server + "/am/role/grantMenus",
    },
    permission: {
        search: server + "/am/permission/search",
        list: server + "/am/permission/list",
        create: server + "/am/permission/create",
        update: server + "/am/permission/update",
        deletes: server + "/am/permission/deletes",
        scan: server + "/am/permission/scan",
        curr: server + "/am/permission/curr",
        byRole: server + "/am/permission/byRole",
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
        get: server + "/am/dept/get",
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
    },
    image: {
        get: server + "/am/image/get",
        list: server + "/am/image/list",
        create: server + "/am/image/create",
        update: server + "/am/image/update",
        delete: server + "/am/image/delete",
        upload: server + "/am/image/upload",
        batchUpload: server + "/am/image/batchUpload",
        copyToFolder: server + "/am/image/copyToFolder",
        moveToFolder: server + "/am/image/moveToFolder",
        getFolder: server + "/am/image/getFolder",
        folderList: server + "/am/image/getAllFolders",
        listFolder: server + "/am/image/listFolder",
        createFolder: server + "/am/image/createFolder",
        updateFolder: server + "/am/image/updateFolder",
        deleteFolder: server + "/am/image/deleteFolder",
        updateFolderAdvanced: server + "/am/image/updateFolderAdvanced",
        getVolumeUnits: server + "/am/image/getVolumeUnits",
        getWeightUnits: server + "/am/image/getWeightUnits",
        view: server + "/am/image/view",
        viewFull: server + "/am/image/viewFull",
    }
};
