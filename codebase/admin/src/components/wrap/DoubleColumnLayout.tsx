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

import { Col, Row } from "antd"
import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "../../hooks";
import { computePx } from '../../common/kit'

// const widths = [576, 768, 992, 1200, 1600];

/**
 * 双列布局，左边一列是具体的数字宽度
 */
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
        <Col style={{height: '100%'}} span={leftSpan}>{left}</Col>
        <Col style={{height: '100%'}} span={rightSpan}>{right}</Col>
    </Row>
}