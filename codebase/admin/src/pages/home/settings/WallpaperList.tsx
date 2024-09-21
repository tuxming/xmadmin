import { Button, List } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../../common/api";
import { useDispatch, useRequest, useSelector, useTranslation } from "../../../hooks";
import { themeConfigSlice } from "../../../redux/CommonSlice";

export type WallpaperListType = {
    category : any
}

export const WallpaperList : React.FC<WallpaperListType> = ({category}) => {

    const { t } = useTranslation();
    const request = useRequest();
    const dispatch = useDispatch();

    const width = useSelector(state => state.globalVar.width);
    const height = useSelector(state => state.globalVar.height);
    const [imgList, setImgList] = useState<any[]>([]);
    const borderRadius = useSelector(state => state.themeConfig.borderRadius);
    const colorPrimary = useSelector(state => state.themeConfig.colorPrimary);

    let getListData = async (id, start, count, merge: boolean) => {
        // http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid=26&start=3&count=2&from=360chrome
        let result = await request.get(api.wallpaper.wallpaperImageList+"?id="+id+"&start="+start+"&count="+count)
        if(merge){
            let newList = [...imgList, ...result.data];
            setImgList(newList);
        }else{
            setImgList(result.data);
        }
    }

    useEffect(()=> {
        getListData(category.id, 0, 20, false);
    }, []);

    let addMore = () => {
        let start = imgList.length;
        let count = 20;
        getListData(category.id, start+1, count, true);

    }

    const imageClick = (category) => {
        dispatch(themeConfigSlice.actions.changeWallpaperUrl(category.url));
    }

    return <>
        <List dataSource={imgList}  style={{height: width>800?'350px': height, overflowY: 'auto', overflowX: 'hidden'}}
            grid={{
                gutter: 15,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 6,
                xxl: 6
            }}
            renderItem={(item) => (
                <div >
                    <List.Item className="xm-wrapper-listitem" style={{
                        borderRadius: borderRadius
                    }}>
                        <img className="xm-wrapper-img" src={item.url_thumb} onClick={()=> imageClick(item)}
                            style={{
                                width: '100%', 
                                borderRadius: borderRadius
                            }}
                        ></img>
                    </List.Item> 
                </div>
            )}
        >
            <div style={{textAlign: 'center'}}>
                <Button type='text' style={{width: 200, color: colorPrimary}} onClick={addMore}>{t('加载更多')}</Button>
            </div>
        </List>
    </>

}