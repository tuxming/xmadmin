
/**
 * 获取带有透明度的颜色
 * @param {*} color 
 * @param {*} opacity 
 * @returns 
 */
export const getOpacityColor = (color: string, opacity: number ) => {

    if(!opacity){
        return color;
    }

    color = color.toUpperCase();
    let r = 0, g=0, b=0;
    if(color.startsWith("#")){
        if(color.length == 4){
            r = parseInt(color.substring(1,2), 16);
            g = parseInt(color.substring(2,3), 16);
            b = parseInt(color.substring(3,4), 16);
        }else {
            r = parseInt(color.substring(1,3), 16);
            g = parseInt(color.substring(3,5), 16);
            b = parseInt(color.substring(5,7), 16);
        }
    }else if(color.startsWith("rgb")){
        //rgba(11,222,110) => (11,222,110) => 11,222,110
        color = color.replace('rgba', "").replace("rgb", "").replace("(", "").replace(")", "");
        let colors = color.split(",");
        r = parseInt(colors[0].trim())
        g = parseInt(colors[1].trim())
        b = parseInt(colors[2].trim())
    }else{
        return color
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


/**
 * 
 * @param size 尺寸： 100vw, 100wh, 70%, 30px
 * @param isHeight 是否计算的高度，针对百分比的尺寸
 * @returns 
 */
export const computePx = (size, isHeight = false) => {
    if( typeof size == 'number' ){
        return size as number;
    }else if(typeof size == 'string'){
        let widthStr = size as string;
        if(widthStr.endsWith("%")){
            let total = isHeight?document.body.clientWidth:document.body.clientHeight;
            return total * parseInt(widthStr.replace("%", ""))/100;
        }else if(widthStr.endsWith("vw")){
            return document.body.clientWidth * parseInt(widthStr.replace("vm", ""))/100;
        }else if(widthStr.endsWith("vh")){
            return document.body.clientHeight * parseInt(widthStr.replace("vh", ""))/100;
        }else if(widthStr.endsWith("px")){
            return parseInt(widthStr.replace("px", ""));
        }else {
            let num = (widthStr as any) * 1;
            if(num.toString() == 'NaN'){
                return 0
            }else{
                return num;
            }
        }
    }
    return 0;
}