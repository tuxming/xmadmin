
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
        list: server + "/am/menu/list"
    },
    auth: {
        login: server + "/auth/login",
        code: server + "/auth/code",
        sendMailCode: server + '/auth/sendMailCode',
        sendPhoneCode: server + '/auth/sendPhoneCode',
        resetPassword: server + '/auth/resetPassword'
    },
    doc: {
        img:  server + "/public/img",
        wallpaperAllCategories: server + '/public/wallpaperAllCategories',
        wallpaperImageList: server + "/public/wallpaperImageList"
    },
    user: {
        list: server + "/am/user/list",
        search: server + "/am/user/search"
    },
    role: {
        search: server + "/am/role/search",
        list: server + "/am/role/list",
        create: server + "/am/role/create",
        update: server + "/am/role/update",
        deletes: server + "/am/role/deletes",
    },
    permission: {
        search: server + "/am/permission/search",
        list: server + "/am/permission/list",
        create: server + "/am/permission/create",
        update: server + "/am/permission/update",
        deletes: server + "/am/permission/deletes",
        scan: server + "/am/permission/scan",
    },
    history: {
        get: server + "/am/history/get",
        list: server + "/am/history/list",
        deletes: server + "/am/history/deletes"
    },
    document: { 
        list: server + "/am/document/list",
        upload: server + "/am/document/upload",
        deletes: server + "/am/document/deletes",
    },
}
