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

import { useEffect, useState} from "react";
import { useRequest, useSelector } from "../../../hooks"
import { Modal, Tabs } from 'antd';
import { api } from "../../../common/api";
import { WallpaperList } from "./WallpaperList";
import "./WallpaperModal.css"

type WallpaperModalType = {
    open: boolean,
    close: () => void
}

//选择壁纸弹窗
export const WallpaperModal : React.FC<WallpaperModalType> = ({open, close}) => {
    const request = useRequest();
    
    const width = useSelector(state => state.globalVar.width);
    const theme = useSelector(state => state.themeConfig.theme);

    // const [categories, setCategories] = useState<any>([]);
    const [tabItems, setTabItems] = useState([]);
    const [activeKey, setActiveKey] = useState<string>();

    useEffect(()=>{
        let get = async () => {
            // http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome
            let result = await request.get(api.wallpaper.wallpaperAllCategories) as any;
            if(result.errno == "0"){
                let data = result.data;
                // setCategories(data);
                let items = data.map(row => {
                    return {
                        key: row.id,
                        label: row.name,
                        children: <WallpaperList category={row} />
                    }
                });
                setActiveKey(items[0].key);
                setTabItems(items);
            }
        }
        get();
    }, [])

    const onTabChange = (activeKey: string) => {
        setActiveKey(activeKey);
    }
 
    return <>
        <Modal title="壁纸" open={open} 
            onCancel={() => {close()}}
            width={width>800? "800px": "100%"}
            style={{top: width>800? '20%': 0}}
            footer={null}
        >
            <div>
                <Tabs items={tabItems} activeKey={activeKey} onChange={onTabChange}
                    popupClassName={`${theme}-wallpaper-tab-dropdown`}
                />
            </div>
        </Modal>
    </>
}