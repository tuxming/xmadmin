import {api, basePath} from '../common/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useRequest } from '../components/index';

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
    menus: MenuType[],
    loading: boolean,
    error: string | null,
}


const defaultState : MenusType = {
    loading: true, 
    error: null,
    menus: [ {
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


