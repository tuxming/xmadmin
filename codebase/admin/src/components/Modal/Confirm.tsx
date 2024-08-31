
import { ReactNode, useState } from 'react';
import {Modal, ModalType} from './index'
import { Button, Divider, Typography } from 'antd';
import { useSelector } from '../../redux/hooks';
import { useTranslation } from '../useTranslation';
import { DefaultNS } from '../../common/I18NNamespace';

export type ConfirmType = {
    title?: ReactNode,
    text: ReactNode,
    showOk?: boolean,
    showCancel?: boolean,
    onOk?: (close: ()=>void) => void,
    onCancel?: ()=>void,
};


export const Confirm : React.FC<ConfirmType> = ({
    title,
    text,
    showOk,
    showCancel,
    onOk,
    onCancel
})=>{
    
    const {t} = useTranslation(DefaultNS);
    const [open, setOpen] = useState(true);
    const theme = useSelector(state => state.themeConfig.theme);
    const screenHeight = useSelector(state => state.globalVar.height);
    
    const onClickCancel = () => {
        setOpen(false);
        if(onCancel) onCancel();
    }

    const onClickOk = () => {
        if(onOk){
            onOk(()=>{
                onClickCancel();
            });
        }
    }

    return <Modal open={open} onClose={()=>setOpen(false)} theme={theme}
            type='modal' showMove={true} showResize={false} 
            showMaxize={false} showMinize={false}
        >
            <>
            <div style={{
                padding: "15px", 
                textAlign: "center",
            }}> 
                <Typography.Text  style={{fontWeight: 'bold',paddingTop: title?0:15, marginBottom: 15, display: 'block'}}>{title}</Typography.Text>
                <div style={{ maxHeight: screenHeight / 3, overflowY: 'auto'}}
                >
                    <Typography.Text>
                    {text}
                    </Typography.Text>
                </div>
                <Divider />
                <div style={{
                    textAlign: "right",
                }}>
                    <Button onClick={onClickCancel}>{t('取消')}</Button>
                    <Button onClick={onClickOk} type="primary" style={{
                        marginLeft: 20
                    }}>{t('确定')}</Button>
                </div>
            </div>
            </>
    </Modal>
   
}