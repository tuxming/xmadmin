
import { ReactNode, useState } from 'react';
import {Modal, ModalType} from './index'
import { Button, Divider, Typography } from 'antd';
import { useSelector } from '../../redux/hooks';

export type ConfirmType = {
    text: ReactNode
    showOk?: boolean,
    showCancel?: boolean,
    onOk?: (close: ()=>void) => void,
    onCancel?: ()=>void,
};


export const Confirm : React.FC<ConfirmType> = ({
    text,
    showOk,
    showCancel,
    onOk,
    onCancel
})=>{
    
    const [open, setOpen] = useState(true);
    const theme = useSelector(state => state.themeConfig.theme);
    
    const onClickCancel = () => {
        setOpen(false);
        if(onCancel) onCancel();
    }

    const onClickOk = () => {
        if(onOk){
            onOk(()=>{
                setOpen(false);
            });
        }
    }

    return open ? (
        <Modal open={open} onClose={()=>setOpen(false)} theme={theme}
            type='modal' showMove={false} showResize={false} 
        >
            <>
            <div style={{
                marginTop: 45,
                padding: "15px", 
                textAlign: "center"
            }}>
                <div>
                <Typography.Text>
                {text}
                </Typography.Text>
                </div>
                <Divider />
                <div style={{
                    textAlign: "right",
                }}>
                    <Button onClick={onClickCancel}>取消</Button>
                    <Button onClick={onClickOk} type="primary" style={{
                        marginLeft: 20
                    }}>确定</Button>
                </div>
            </div>
            </>
        </Modal>
    ) : (<></>)
}