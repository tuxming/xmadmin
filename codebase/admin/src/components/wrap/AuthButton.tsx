import React, {useRef} from 'react'
import { Button, ButtonProps,Tooltip } from "antd"
import { useAuth } from "../../hooks";


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
    
    const auth = useAuth();
    let isPermitted = auth.has(requiredPermissions);

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
