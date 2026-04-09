export const computePx = (size: any, isHeight = false) => {
    if (typeof size == 'number') {
        return size as number;
    } else if (typeof size == 'string') {
        let widthStr = size as string;
        if (widthStr.endsWith("%")) {
            let total = isHeight ? document.body.clientWidth : document.body.clientHeight;
            return total * parseInt(widthStr.replace("%", "")) / 100;
        } else if (widthStr.endsWith("vw")) {
            return document.body.clientWidth * parseInt(widthStr.replace("vw", "")) / 100;
        } else if (widthStr.endsWith("vh")) {
            return document.body.clientHeight * parseInt(widthStr.replace("vh", "")) / 100;
        } else if (widthStr.endsWith("px")) {
            return parseInt(widthStr.replace("px", ""));
        } else {
            let num = (widthStr as any) * 1;
            if (num.toString() == 'NaN') {
                return 0
            } else {
                return num;
            }
        }
    }
    return 0;
}
