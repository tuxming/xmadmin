import { useEffect, useRef, useState } from "react"
import { theme } from 'antd'
import "./XmSVG.css"
import { useSelector } from "../../../redux/hooks";

type SVGComponent<P = {}> = React.FunctionComponent<P> & React.FC<P>;;
export type XmSVGType = {
    SVGElement?: SVGComponent,
    primaryColor?: string,
    primaryHoverColor?: string,
    secondColor?: string,
    secondHoverColor?: string,
    width?: number | string,
    height?: number | string,
    /**
     * 如果是custom那么这个图标就是普通的图标，使用自定义颜色，
     * primary: 是antd的按钮类型：会根据antd的primary类型的按钮颜色一致
     * default: 是antd的按钮类型，会根据antd的default类型的按钮颜色一致
     */
    type?: 'primary'|'default',
    /**
     * antd 的按钮类型
     */
    danger?: boolean, 
    /**
     * 图标的上下偏移量，主要用于精确调整图标的上下位置
     */
    offSetY?: number | string,  
    /**
     *  antd 的按钮类型
     */
    ghost?: boolean,
    iconName?: string
}

const isBlackColor = (color: string) => {
    color = color.replace(/\s+/ig, "");
    if(color && (
        color.indexOf("#000000")>-1
        || color.indexOf("#000") > -1
        || color.indexOf("rgb(0,0,0)") > -1
        || color.indexOf("rgba(0,0,0,0)") >-1
    )){
        return true
    }else {
        return false;
    }
}

/**
 * 这里的svg定义： path的默认颜色是黑色的是主颜色，其他颜色的是次要颜色
 * @param 
 * @returns 
 */
export const XmSVG : React.FC<XmSVGType> = ({
    SVGElement,
    primaryColor,
    primaryHoverColor,
    secondColor,
    secondHoverColor,
    width,
    height,
    type,
    danger = false,
    offSetY = 1,
    ghost=false,
    iconName
}) => {
    const svgRef = useRef(null);
    // const [mainColor, setMainColor] = useState(primaryColor);
    let mainColor = primaryColor;
    let mainHoverColor = primaryHoverColor;

    const {token} = theme.useToken();

    const [pos, setPos] = useState({width, height});
    const size = useSelector(state => state.themeConfig.componentSize);

    const buildPos = (width, height, size) => {
        if(width && height){
            let tw = width, th = height;
            if(typeof tw == 'number'){
                tw = tw+"px"
            }
            if(typeof th == 'number'){
                th = th+"px"
            }
            
            return {width: tw, height: th};
        }else{
            if(size == 'small'){
               return {width: "12px", height: "12px"}
            }else if(size == 'large'){
                return {width: "20px", height: "20px"};
            }else {
                return {width: "16px", height: "16px"};
            }
        }
    }

    useEffect(()=>{
       setPos(buildPos(width, height, size));
    }, [width, height, size])

    if(type){
        if(type == 'primary'){
            if(danger){
                if(ghost){
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    secondColor = token.colorError;
                    secondHoverColor = token.colorErrorHover;
                }else{
                    mainColor = token.colorWhite;
                    mainHoverColor = token.colorWhite;
                    secondColor = token.colorWhite;
                    secondHoverColor = token.colorWhite;
                }
            }else{
                if(ghost){
                    mainColor = token.colorPrimary;
                    mainHoverColor = token.colorPrimaryHover;
                    secondColor = token.colorError;
                    secondHoverColor = token.colorErrorHover;
                }else{
                    mainColor = token.colorWhite;
                    mainHoverColor = token.colorWhite;
                    secondColor = token.colorError;
                    secondHoverColor = token.colorErrorHover;
                }
            }
        }else if(type == 'default'){
            if(danger){
                if(ghost){
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    secondColor = token.colorPrimary;
                    secondHoverColor = token.colorPrimaryHover;
                }else{
                    mainColor = token.colorError;
                    mainHoverColor = token.colorErrorHover;
                    secondColor = token.colorPrimary;
                    secondHoverColor = token.colorPrimaryHover;
                }
            }else{
                if(ghost){
                    mainColor = token.colorPrimaryHover;
                    mainHoverColor = token.colorPrimaryHover;
                    secondColor = "";
                    secondHoverColor = "";
                }else{
                    mainColor = token.colorText;
                    mainHoverColor = token.colorPrimaryHover;
                    secondColor = token.colorPrimary;
                    secondHoverColor = token.colorPrimaryHover;
                }
            }
        }
    }

    const style: any = {
        "--var-xmsvg-color": mainColor,
        display: 'inline-block',
        position: 'relative',
        top: offSetY
    };

    if(mainHoverColor){
        style['--var-xmsvg-color-hover'] = mainHoverColor;
    }
    if(secondColor) {
        style['--var-xmsvg-second-color'] = secondColor;
    }
    if(secondHoverColor) {
        style['--var-xmsvg-second-color-hover'] = secondHoverColor;
    }

    useEffect(()=>{
        if(!mainColor) return;

        let paths  = svgRef.current.querySelectorAll("path");
        paths.forEach(path => { 
            let fill = path.getAttribute("fill");
            if(!fill){
                fill = path.style.fill;
            }

            if(!fill) return;

            //给path标记className, 以配合css样式
            let isBlack = isBlackColor(fill);

            if(isBlack){
                if(mainColor){
                    path.classList.add("xmsvg-main");
                    path.style.cssText = "";
                    path.removeAttribute("fill");
                }
            }else{
                if(secondColor){
                    path.classList.add("xmsvg-second");
                    path.style.cssText = "";
                    path.removeAttribute("fill");
                }
            }

        })

        let svg = svgRef.current.querySelector("svg");
        let pos = buildPos(width, height, size);
        svg.style=`width:${pos.width}; height:${pos.height}`

    }, [svgRef]);

    return <span ref={svgRef} style={style}>
        <SVGElement />
    </span>

}
