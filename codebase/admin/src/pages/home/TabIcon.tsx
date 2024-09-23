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

import { useEffect, useRef, useState } from "react"
import { IconFont } from "../../components"
import { useSelector } from "../../hooks"


export type TabIconType = {
    icon: string,
    tabKey: string
}
export const TabIcon : React.FC<TabIconType> = ({icon, tabKey}) => {

    const iconRef = useRef(null);
    const activeKey = useSelector(state => state.activeTabKey.value);
    const [fullIcon, setFullIcon] = useState("icon-maximize");
    const [currIcon, setCurrIcon] = useState(icon);

    useEffect(()=>{

        if(!iconRef.current) return;

        // console.log(iconRef);
        let mouseEnter = () => {
            // console.log("enter");
            if(activeKey != tabKey) return;

            setCurrIcon(fullIcon);
        }

        let mouseOut = () => {
            // console.log("out");
            if(activeKey != tabKey) return;

            setCurrIcon(icon);
        }

        iconRef.current.addEventListener("mouseenter", mouseEnter)
        iconRef.current.addEventListener("mouseout", mouseOut);

        return () => {
            if(iconRef.current){
                iconRef.current.removeEventListener("mouseenter", mouseEnter)
                iconRef.current.removeEventListener("mouseout", mouseOut);
            }
        }

    }, [])

    return <IconFont ref={iconRef} fontClass={currIcon} className='tab-icon'/>
} 