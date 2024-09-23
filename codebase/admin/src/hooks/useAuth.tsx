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