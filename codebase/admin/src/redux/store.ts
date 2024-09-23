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



// import { createStore, applyMiddleware } from 'redux';

import { persistStore, persistReducer ,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { myMenusSlice} from './menuSlice';
import { 
    loginedUserSlice, 
    persistedUserSlice, 
    jwtTokenSlice,
    ActiveTabSlice, 
    TabItemsSlice, 
    themeConfigSlice,
    globalVarSlice,
    openItemSlice,
} from './slice'

import {
    combineReducers, 
    configureStore
} from '@reduxjs/toolkit'
import { DictSlice } from '../common/dict';

// const rootReducer = combineReducers({
//     myMenus: myMenusSlice
// })

// const store = createStore(rootReducer);

const persistConfig = {
    key: "root",
    storage,
    whitelist: ['persistedUser', "jwtToken", 'themeConfig']
}

const rootReducer = combineReducers({
    myMenus: myMenusSlice.reducer,
    activeTabKey: ActiveTabSlice.reducer,
    tabItems: TabItemsSlice.reducer,
    loginedUser: loginedUserSlice.reducer,
    persistedUser: persistedUserSlice.reducer,
    jwtToken: jwtTokenSlice.reducer,
    themeConfig: themeConfigSlice.reducer,
    globalVar: globalVarSlice.reducer,
    openItem: openItemSlice.reducer,
    dicts: DictSlice.reducer,
})


const persistedReducer = persistReducer(persistConfig, rootReducer)


const store = configureStore({
    // reducer: rootReducer,
    reducer: persistedReducer,

    //忽略persist序列化报错警告
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
    devTools: true  //chrome extensions: Redux DevTools 
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const persistor = persistStore(store)

export default {store, persistor};