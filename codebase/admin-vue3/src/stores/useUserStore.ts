import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface RoleType {
    id?: number, 
    name?: string,
    code?: string, 
    type?: number 
}

export interface DeptType {
    id?: number,
    type?: number,
    name?: string,
    path?: string,
    fullname: string
}

export interface LoginedUserInfoType {
    id?: number, 
    parentId?: number,
    username?: string,
    fullname?: string,
    code?: string,
    gender?: 0 | 1 | 2,
    email?: string, 
    phone?: number,

    roles?: RoleType[],
    dept?: DeptType,
    company?: DeptType,
    group?: DeptType,
    permissions?: string[],
    dataPath?: string[],
    photo?: number,
}

//type:1-账号密码，2-电话号码登录，3-邮件登录
export type PasswordLoginType = {
    username: string, 
    password: string, 
    code?: string,
    type?: 1,
}

export type EmailLoginType = {
    email : string,
    code : string,
    type :  2,
    captcha: string
}

export type PhoneLoginType = {
    telephone: string, 
    code: string,
    type: 3,
    captcha: string
}

export type LoginType = PasswordLoginType | PhoneLoginType | EmailLoginType;

export const useUserStore = defineStore('userStore', () => {

    const user = ref<LoginedUserInfoType>({});
  
    const getUser = computed(() => user)

    function setUser(userInfo: LoginedUserInfoType) {
        user.value = userInfo
    }

    return { user, getUser, setUser }
})
