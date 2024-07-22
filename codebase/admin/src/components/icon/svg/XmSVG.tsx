import { useEffect, useRef, useState } from "react"
import { theme } from 'antd'
import "./XmSVG.css"

type SVGComponent<P = {}> = React.FunctionComponent<P> & React.FC<P>;;
export type XmSVGType = {
    SVGElement: SVGComponent,
    primaryColor?: string,
    prrmaryHoverColor?: string,
    secondColor?: string,
    secondHoverColor?: string,
    width?: number | string,
    height?: number | string,
    /**
     * 如果是custom那么这个图标就是普通的图标，使用自定义颜色，
     * primary: 是antd的按钮类型：会根据antd的primary类型的按钮颜色一致
     * default: 是antd的按钮类型，会根据antd的default类型的按钮颜色一致
     * ghostPrimary: 是antd的按钮类型，会根据antd的default类型的按钮颜色一致
     * ghostDefault: 是antd的按钮类型，会根据antd的default类型的按钮颜色一致
     */
    type?: 'custom' | 'primary' | 'default' | 'ghostPrimary' | 'ghostDefault',
    /**
     * antd 的按鈕類型
     */
    danger?: boolean, 
    /**
     * 图标的上下偏移量，主要用于精确调整图标的上下位置
     */
    offSetY?: number | string,  
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
    prrmaryHoverColor,
    secondColor,
    secondHoverColor,
    width = 16,
    height = 16,
    type = 'custom',
    danger = false,
    offSetY = 1
}) => {
    
    const svgRef = useRef(null);
    // const [mainColor, setMainColor] = useState(primaryColor);
    let mainColor = primaryColor;
    let mainHoverColor = prrmaryHoverColor;

    const {token} = theme.useToken();

    if(danger){
        if(type == 'primary'){
            mainColor = token.colorWhite;
            mainHoverColor = token.colorWhite;
            secondColor = mainColor;
            secondHoverColor = mainColor;
        }else if(type == 'ghostPrimary') {
            mainColor = token.colorError;
            mainHoverColor = token.colorErrorHover;
            secondColor = token.colorPrimary;
            secondHoverColor = token.colorPrimaryHover;
        }else if(type == 'ghostDefault') {
            mainColor = token.colorWhite; 
            mainHoverColor = token.colorPrimary;
        }else if(type == 'default') {
            mainColor = token.colorError;
            mainHoverColor = token.colorErrorHover;
            secondColor = token.colorPrimary;
            secondHoverColor = token.colorPrimaryHover;
        }
    }else{
        if(type == 'primary'){
            mainColor = token.colorWhite;
            mainHoverColor = token.colorWhite;
        }else if(type == 'ghostPrimary') {
            console.log(type);
            mainColor = token.colorPrimary;
            mainHoverColor = token.colorPrimaryHover;
        }else if(type == 'ghostDefault') {
            mainColor = token.colorWhite; 
            mainHoverColor = token.colorPrimary;
        }else if(type == 'default') {
            mainColor = token.colorText;
            mainHoverColor = token.colorPrimary;
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
    if(secondColor) {
        style['--var-xmsvg-second-color-hover'] = secondHoverColor;
    }

    useEffect(()=>{
        if(!mainColor) return;

        let paths  = svgRef.current.querySelectorAll("path");
        paths.forEach(path => { 

            let fill = path.fill;
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
        svg.style=`width:${width}; height:${height}`

    }, [svgRef]);

    

    return <span ref={svgRef} style={style}>
        <SVGElement />
    </span>

}
