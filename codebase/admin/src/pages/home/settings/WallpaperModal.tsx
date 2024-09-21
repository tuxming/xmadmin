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