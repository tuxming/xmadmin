

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