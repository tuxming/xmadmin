
import { ReactNode, useState } from 'react';
import {Modal} from './index'
import { Button, Divider, Typography } from 'antd';
import { useSelector,useTranslation } from '../../hooks';
import { DefaultNS } from '../../common/I18NNamespace';

export type ConfirmType = {
    title?: ReactNode,
    content: 'string' | ReactNode | ((props) => ReactNode),
    showOk?: boolean,
    showCancel?: boolean,
    onOk?: (close: ()=>void) => void,
    onCancel?: ()=>void,
    open?: boolean,
    onClose?: () => void,
    contentProps?: {
        [key: string]: any
    },
    width?: number | string,
    height?: number | string
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
    contentProps,
    width, 
    height
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

    let p = {}
    if(width){
        p['width'] = width;
    }
    if(height){
        p['height'] = height;
    }

    if(open){
        return <Modal open={visible} onClose={onModalClose} theme={theme}
                type='modal' showMove={true} showResize={false} 
                showMaxize={false} showMinize={false} 
                {...p}
            >
                <>
                <div style={{
                    padding: "15px", 
                    textAlign: "center",
                }}> 
                    {(title && typeof title === 'string') ? 
                        <Typography.Text style={{fontWeight: 'bold',paddingTop: title?0:15, marginBottom: 15, display: 'block'}}>{title}</Typography.Text>: title}
                    <div style={{ maxHeight: screenHeight / 3, overflowY: 'auto'}}>
                        {(typeof content === 'string') ? (<Typography.Paragraph style={{margin: "30px 15px 15px 15px"}} >{content}</Typography.Paragraph>)
                            : (typeof content === 'function' ? (content(contentProps)) : content)
                        }
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