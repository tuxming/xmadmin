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


import { ReactNode, useState, useEffect } from 'react';
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
    
    // 监听 open 属性变化
    useEffect(() => {
        setVisible(open);
    }, [open]);
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