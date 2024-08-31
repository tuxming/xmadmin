import React, {useRef} from 'react'
import { Button, ButtonProps,Tooltip } from "antd"
import { hasPermission } from "../../common/kit";
import { useSelector } from "../../redux/hooks";


export type AuthButtonProps = ButtonProps & {
    requiredPermissions: string[] | string,
    tip?: string
};

/**
 * 具有权限的button, 如果有权限，返回antd的btn,如果没有权限，返回空
 */
export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(({
    requiredPermissions,
    tip,
    ...props
}, ref) => {
    const permissions = useSelector(state => state.persistedUser.permissions);

    let isPermitted = false;
    if(typeof requiredPermissions == 'string'){
        isPermitted = hasPermission(requiredPermissions, permissions);
    }else if(Array.isArray(requiredPermissions)){
        for(let rp of requiredPermissions){
            isPermitted = hasPermission(rp, permissions);
            if(isPermitted) break;
        }
    }

    //解决报错
    const tagRef = ref || useRef<HTMLButtonElement>(null);

    if(tip){
        return isPermitted ? (<Tooltip title={tip}>
           <Button ref={tagRef} {...props}></Button>
        </Tooltip>)
        :<></>
    }else{
        return isPermitted ? <Button ref={tagRef} {...props}></Button> : <></>
    }

})
