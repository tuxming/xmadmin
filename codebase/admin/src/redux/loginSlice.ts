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


import {api} from '../common/api';
import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import { useRequest } from '../hooks';

interface RoleType {
    id?: number, 
    name?: string,
    code?: string, 
    type?: number 
}

interface DeptType {
    id?: number,
    type?: number,
    name?: string,
    path?: string,
    fullname: string
}

interface LoginedUserInfoType {
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
    photo: number,
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

export type LoginedUserType = {
    loading: boolean,
    error?: string,
    data: {
        user?: LoginedUserInfoType,
        jwtToken?: string
    }
}


export const login = createAsyncThunk(
    "auth/login",
    async (loginInfo: LoginType, thunkApi) => {
        const request = useRequest();
        const result = await request.post(api.auth.login, loginInfo);

        if(!result.status){
            thunkApi.rejectWithValue(result.msg);
                throw new Error(result.msg);
        }
        return result.data;
    }
);

// export const sendMailCode = createAsyncThunk(
//     "auth/sendMailCode",
//     async (args, thunkApi) => {
//         const request = useRequest();
//         const result = await request.get(api.auth.sendMailCode);
//         if(!result.status){
//             thunkApi.rejectWithValue(result.msg);
//                 throw new Error(result.msg);
//         }
//         return result.data;
//     }
// );

const initLoginedUserState: LoginedUserType = {
    loading: false,
    error: null,
    data: {
        user: null,
        jwtToken: null
    }
}

/**
 * 登录成功后返回的对象
 */
export const loginedUserSlice = createSlice({
    name: "loginedUser",
    initialState: initLoginedUserState,
    reducers: {
    //   logOut: (state) => {
    //     state.token = null;
    //     state.error = null;
    //     state.loading = false;
    //   },
    }, 
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                // console.log("fulfilled", action.payload)
                state.loading = false;
                state.error = null;
                state.data = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                // console.log("rejected", action.error.message)
                state.error = action.error.message;
                state.loading = false;
            })
    }
});


const persistUserState: LoginedUserInfoType = null;
//将user对象存入到localStorage
export const persistedUserSlice = createSlice({
    name: "persistedUser",
    initialState: persistUserState,
    reducers: {
        persist: (state, action) => {
            state = action.payload;
            return state;
        },
    }, 
});
//将jwtToken存入到localStorage
export const jwtTokenSlice = createSlice({
    name: "jwtToken",
    initialState: null as string,
    reducers: {
        persist: (state, action) => {
            state = action.payload;
            return state;
        },
    }, 
});