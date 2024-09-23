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

import { useState } from "react"
import { Modal } from "../../../components"
import { UserGrantRole } from "./UserGrantRole"
import { CustomScroll } from "react-custom-scroll"


export const UserGrantRoleModal : React.FC<{
    open: boolean,
    userId: number,
    onClose: () => void,
}> = ({
    open,
    userId,
    onClose
}) => {
    const [visible, setVisible] = useState(open)
    const onModalClose = () => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 500);
    }

    return <Modal open={visible} onClose={onModalClose} height={250} width={350}>
        <CustomScroll heightRelativeToParent="100%" >
            <UserGrantRole userId={userId} titleLevel={4} 
                titleStyle={{textAlign: 'center', margin: '25px 0 15px 0'}} 
                wrapperStyle={{paddingLeft: 20, paddingRight: 20}}    
            />
        </CustomScroll>
    </Modal>
}