import { BrowserRouter, Route, Routes  } from "react-router-dom";

import { 
    LoginPage,
    HomePage,
    UserPage,
    OverviewPage,
    MenuPage,
    RolePage,
    HistoryPage,
} from "./pages";
import { basePath, api } from "./common/api";
import { useEffect } from "react";
import { ActiveTabSlice } from "./redux/slice";
import { useDispatch } from "./redux/hooks";

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
                <Route path="history"  key="history" Component={HistoryPage}></Route>
                <Route path="*" element={<>404</>}></Route>
            </Route>
        </Routes>
    </BrowserRouter>
}