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

import { Button, Space } from "antd"
import { DeleteIcon } from "../../components/icon/svg/Icons"
import { useLayer } from "../../components"

export const OverviewPage : React.FC = () => {

    const {message} = useLayer();

    return <>
        
        <div style={{
            height: 1000,
            overflowY: 'auto',
            padding: 20
        }}>
            <Space>
                <Button icon={<DeleteIcon type="default"/> } onClick={() => message.open({content: "打开了一个提示消息", type: "success"})} type="default">text</Button>
                <Button icon={<DeleteIcon type="default" danger/> } type="default" danger>text</Button>
                <Button icon={<DeleteIcon type="default" ghost/> } type="default" ghost>text</Button>
                <Button icon={<DeleteIcon type="default" ghost danger/> } type="default" ghost danger>text</Button>
                <Button icon={<DeleteIcon type="primary"/> } type="primary">text</Button>
                <Button icon={<DeleteIcon type="primary" danger/> } type="primary" danger>text</Button>
                <Button icon={<DeleteIcon type="primary" ghost/> } type="primary" ghost>text</Button>
                <Button icon={<DeleteIcon type="primary" ghost danger/> } type="primary" ghost danger>text</Button>
            </Space>
        </div>
    </>
}