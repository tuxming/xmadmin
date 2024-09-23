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

import {api, basePath} from '../common/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useRequest } from '../hooks';

export interface MenuType {
    id? : number | string,
    icon? : string,
    name? : string,
    path? : string,
    children? : MenuType[]
    type? : number,
    [key: string] : any
    // parentId? : number,
    // sort? : number,
    // query? : string,
    // status? : number,
}


export interface MenusType {
    /**
     * 菜单数组，方便遍历
     */
    menus: MenuType[],
    /**
     * 菜单树形结构，构建菜单
     */
    treeMenu: MenuType[],
    loading: boolean,
    error: string | null,
}


const defaultState : MenusType = {
    loading: true, 
    error: null,
    menus: [{
        id: 2,
        icon: 'icon-dashboard',
        name: "主面板",
        path: '/sys/overview',
    }],
    treeMenu: [{
        id: 2,
        icon: 'icon-dashboard',
        name: "主面板",
        path: '/sys/overview',
    },
    
  ]
}

export const currMenus = createAsyncThunk(
    "menu/myMenus",
    async (arg, thunkApi) => {
        try{
            const request = useRequest();
            const result = await request.get(api.menu.curr, true);
            return result;
        }catch(err){
            console.log(err);
        }
    }
);

const sortMenu = (menus) => {
    
    menus.sort((m1, m2)=> m1.sort - m2.sort);

    menus.forEach(menu => {
        if(menu.children && menu.children.length>0){
            sortMenu(menu.children);
        }
    });

}

export const myMenusSlice = createSlice({
    name: "myMenus",
    initialState: defaultState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(currMenus.pending, (state) => {
                state.loading = true;
            })
            .addCase(currMenus.fulfilled, (state, action) => {
                state.loading = false;
                let result = action.payload;
                if(result.status){
                    let menus = result.data;
                    //这里判断下根路径，替换成overview, 
                    menus.forEach(menu => {
                        let basePath1 = basePath.endsWith("/")?basePath.substring(0, basePath.length-1) : basePath;
                        let isOverview = menu.path == basePath || basePath1 == menu.path;
                        if(isOverview){
                            menu.path = api.backendPage;
                        }
                    })

                    state.menus = menus;

                    //将menus转换成treeMenu;
                    let mapMenu = {};
                    menus.forEach(menu => mapMenu[menu.id] = menu);
                    mapMenu[1] = {name: "root", label:"根菜单", id: 1, parentId: null, children: [] };

                    menus.forEach(menu => {
                        let parentId = menu.parentId;
                        if(parentId || parentId === 0){
                            let parent = mapMenu[parentId];
                            if(parent){
                                parent.children.push(menu);
                            }
                        }
                    })
                    // console.log(mapMenu);
                    let currMenus = mapMenu[1].children;
                    sortMenu(currMenus)
                    state.treeMenu = currMenus;
                }else{
                    state.error = result.msg;
                }
            })
            .addCase(currMenus.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
    }
});


