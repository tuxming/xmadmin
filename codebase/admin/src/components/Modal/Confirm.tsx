
import { ReactNode, useState } from 'react';
import {Modal} from './index'
import { Button, Divider, Typography } from 'antd';
import { useSelector } from '../../redux/hooks';
import { useTranslation } from '../useTranslation';
import { DefaultNS } from '../../common/I18NNamespace';

export type ConfirmType = {
    title?: ReactNode,
    content: ReactNode,
    showOk?: boolean,
    showCancel?: boolean,
    onOk?: (close: ()=>void) => void,
    onCancel?: ()=>void,
    open?: boolean,
    onClose?: () => void,
};


export const Confirm : React.FC<ConfirmType> = ({
    title,
    content,
    showOk = true,
    showCancel = true,
    onOk,
    onCancel,
    open = true,
    onClose,
})=>{
    const {t} = useTranslation(DefaultNS);
    const [visible, setVisible] = useState<boolean>(open);
    const theme = useSelector(state => state.themeConfig.theme);
    const screenHeight = useSelector(state => state.globalVar.height);

    const onModalClose = () => {
        setVisible(false);
        if(onClose){
            setTimeout(()=>{
                onClose();
            }, 300);
        }
    }

    const onClickCancel = () => {
        onModalClose();
        if(onCancel) {
            setTimeout(()=>{
                onCancel();
            }, 300)
        };
    }

    const onClickOk = () => {
        if(onOk){
            onOk(()=>{
                onModalClose();
            });
        }
    }

    if(open){
        return <Modal open={visible} onClose={onModalClose} theme={theme}
                type='modal' showMove={true} showResize={false} 
                showMaxize={false} showMinize={false} 
            >
                <>
                <div style={{
                    padding: "15px", 
                    textAlign: "center",
                }}> 
                    {(title && typeof title === 'string') ? 
                        <Typography.Text style={{fontWeight: 'bold',paddingTop: title?0:15, marginBottom: 15, display: 'block'}}>{title}</Typography.Text>: title}
                    <div style={{ maxHeight: screenHeight / 3, overflowY: 'auto'}}>
                        {(typeof content === 'string') ? <Typography.Paragraph 
                                style={{margin: "30px 15px 15px 15px"}}
                            >{content}</Typography.Paragraph>: content}
                    </div>
                    <Divider />
                    <div style={{
                        textAlign: "right",
                    }}>
                        {showCancel && <Button onClick={onClickCancel}>{t('取消')}</Button>}
                        {showOk && <Button onClick={onClickOk} type="primary" style={{
                            marginLeft: 20
                        }}>{t('确定')}</Button>}
                    </div>
                </div>
                </>
        </Modal>
    }else{
        return <></>
    }
   
}