
/**
 * 字典数据存在store中，如果store中不存在，则从后台获取,使用方法
 * const dicts = useDict("key");
 * 返回的有可能是undefined, 在使用的时候， 使用： {dicts ||  []},可以防止报错
 */

import {api} from '../common/api'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from '../redux/hooks';
import { useEffect } from 'react';
import { useRequest } from '../components';

type dictType = {
    [key: string] : {
        key: any,
        label: string,
        value: any,
        type: number, 
        color?: string,
    }[],
}

//自定的类型
const defaultDicts: dictType = {}

//从远程获取字典数据
export const getDict = createAsyncThunk(
    "dict/getDict",
    async (arg: string, thunkApi) => {
        try{
            const request = useRequest();
            const result = await request.get(api.dict.byKey + "?key=" + encodeURIComponent(arg as any), false);
            return result;
        }catch(err){
            console.log(err);
        }
    }
);

//创建字典store的slice
export const DictSlice = createSlice({
    name: 'dictSlice',
    initialState: defaultDicts,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDict.fulfilled, (state, action) => {
                let result = action.payload;
                if(result.status){
                    const dicts = result.data.map(d => ({
                        key: d.dictKey,
                        label: d.dictLabel,
                        value: d.dictValue,
                        type: d.type,
                        color: d.remark,
                    }));
                    let key = result.data.find(s => s.groupName);
                    state[key.groupName] = dicts;
                }
            })
    }
});

/**
 * 字典的hook，使用这个hook来获取字典数据
 * @param key 字典的key
 * @returns 
 */
export function useDict(key: string) {

    const data = useSelector(state => state.dicts[key]);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(getDict(key));
    }, [key]);

    return data;
}

