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