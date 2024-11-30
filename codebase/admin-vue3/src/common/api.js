const proServer = "";
const devServer = "http://localhost";

export const server = process.env.NODE_ENV === 'production' ? proServer : devServer;

/**
 * api统一存放，方便修改和维护
 */
export const api = {
    auth: {
        login: server + "/auth/login",
        code: server + "/auth/code",
        sendMailCode: server + '/auth/sendMailCode',
        sendPhoneCode: server + '/auth/sendPhoneCode',
        resetPassword: server + '/auth/resetPassword'
    },
}