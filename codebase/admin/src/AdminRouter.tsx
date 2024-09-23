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

import { BrowserRouter, Route, Routes  } from "react-router-dom";

import { 
    LoginPage,
    HomePage,
    UserPage,
    OverviewPage,
    MenuPage,
    RolePage,
    HistoryPage,
    PermissionPage,
    DocumentPage, 
    DeptPage,
    LangPage,
    DictPage
} from "./pages";
import { basePath, api } from "./common/api";
import { useEffect } from "react";
import { ActiveTabSlice } from "./redux/slice";
import { useDispatch } from "./hooks";

export const AdminRouter : React.FC = () => {
    const dispatch = useDispatch();

    // console.log(location.pathname);
    useEffect(()=>{
        // dispatch(ActiveTabSlice.actions.activeKey(location.pathname));
        
        let path = location.pathname;

        if(!path.startsWith(basePath)){  
            return;
        }

        let basePath1 = basePath;  
        if(basePath.endsWith("/")){   
            basePath1 = basePath.substring(0, basePath.length-1);  // => basePath = /sys/  basePath1 = /sys
        }else{
            basePath1 = basePath+"/";  // basePath1 = /sys/ basePath = /sys/
        }

        if(path == basePath || path == basePath1){
            // navigate(api.backendPage)
            dispatch(ActiveTabSlice.actions.activeKey(api.backendPage));
        }else{
            dispatch(ActiveTabSlice.actions.activeKey(path));
        }
    }, []);

    return <BrowserRouter>
        <Routes>
            <Route path="/" Component={() => <h1>主页</h1>}></Route>
            <Route path="/login" Component={LoginPage}></Route>
            <Route path={basePath} Component={HomePage}>
                <Route path="overview" key="overview" index Component={OverviewPage}></Route>
                <Route path="user" key="user" Component={UserPage}></Route>
                <Route path="menu" key="menu" Component={MenuPage}></Route>
                <Route path="role" key="role" Component={RolePage}></Route>
                <Route path="permission" key="permission" Component={PermissionPage}></Route>
                <Route path="history"  key="history" Component={HistoryPage}></Route>
                <Route path="document"  key="document" Component={DocumentPage}></Route>
                <Route path="dept"  key="dept" Component={DeptPage}></Route>
                <Route path="lang"  key="lang" Component={LangPage}></Route>
                <Route path="dict"  key="lang" Component={DictPage}></Route>
                <Route path="*" element={<>404</>}></Route>
            </Route>
        </Routes>
    </BrowserRouter>
}