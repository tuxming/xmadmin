import { hasPermission } from "../common/kit";
import { useSelector } from "./useSelector";

/**
 * 判断是否具有权限
 */
export const useAuth  = () => {

    const permissions = useSelector(state => state.persistedUser.permissions);

    /**
     * 给定的权限列表，其中一个权限满足，就返回true
     * @param requiredPermissions String | String[]
     * @returns 
     */
    const has = (requiredPermissions: string | string[]) => {
        let isPermitted = false;
        if(typeof requiredPermissions == 'string'){
            isPermitted = hasPermission(requiredPermissions, permissions);
        }else if(Array.isArray(requiredPermissions)){
            for(let rp of requiredPermissions){
                isPermitted = hasPermission(rp, permissions);
                if(isPermitted) break;
            }
        }
        return isPermitted;
    }

    /**
     * 给定的权限列表，全部权限满足，才返回true
     * @param requiredPermissions String | String[]
     * @returns 
     */
    const and = (requiredPermissions: string | string[]) => {
        let isPermitted = true;
        if(typeof requiredPermissions == 'string'){
            isPermitted = hasPermission(requiredPermissions, permissions);
        }else if(Array.isArray(requiredPermissions)){
            for(let rp of requiredPermissions){
                isPermitted = hasPermission(rp, permissions);
                if(!isPermitted) return false;
            }
        }
        return isPermitted;
    }

    return {
        has,
        and,
    }

}