import { Col, Row } from "antd"
import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "../../redux/hooks";
import { computePx } from '../../common/kit'

const widths = [576, 768, 992, 1200, 1600];


export type DoubleColumnLayoutType = {
    /**
     * 容器的宽度, 如果没有设置容器的宽度则已整个屏幕宽度作为容器的宽度
     */
    width: number | string,
    /**
     * 左侧容器的宽度，这个宽度是一个模糊的宽度，
     * 当整个容器小于576的时候，宽度为100%，
     * 当整个容器的宽度大576的时候，会设置一个近似的宽度
     */
    leftWidth?: number | string,
    left: ReactNode,
    right: ReactNode,
}

const computeSpan = (width, leftWidth) => {
    let w = computePx(width);

    if(leftWidth){
        let percent = computePx(leftWidth) / width;

        if(w<576){
            return [24, 24];
        }else {
            let ls =  Math.ceil(24 * percent);
            let rs = 24 - ls;
            return [ls, rs]
        }
    }else{
        if(w<576){
            return [24, 24];
        }else if(width<768){
            return [12, 12]
        }else if(width<992){
            return [10, 14]
        }else if(width<1200){
            return [8, 16]
        }else {
            return [6, 18]
        }
    }
} 

/**
 * width: 容器的宽度，如果没有设置就使用浏览器的宽度
 * left:  左边的内容
 * right: 右边的内容
 * @returns 返回自适应的双排布局，
 */
export const DoubleColumnLayout : React.FC<DoubleColumnLayoutType> = ({
    width = 0,
    leftWidth,
    left, 
    right
}) => {

    // const [containerWidth, setContainerWidth] = useState(width);
    const screenWidth = useSelector(state => state.globalVar.width);

    const [leftSpan, setLeftSpan] = useState(6);
    const [rightSpan, setRightSpan] = useState(18);

    useEffect(() => {
        // if(width){
        //     if(width != containerWidth){
        //         setContainerWidth(width);
        //     }
        // }else{
        //     setContainerWidth(screenWidth);
        // }

        let spans : any;
        if(width){
            spans = computeSpan(width, leftWidth);
        }else{
            spans = computeSpan(screenWidth, leftWidth);
        }
        setLeftSpan(spans[0]);
        setRightSpan(spans[1]);

    }, [width, screenWidth])

    return <Row style={{height: "100%"}}>
        <Col span={leftSpan}>{left}</Col>
        <Col span={rightSpan}>{right}</Col>
    </Row>
}