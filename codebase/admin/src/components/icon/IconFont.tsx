
import './iconfont/iconfont.css';
import { createStyles } from 'antd-style';
import React from 'react';

type IconType = {
    fontClass?: string;
    unicode? : string; 
    size?: string;
    color?: string;
    hoverColor?: string;
} & React.HTMLAttributes<HTMLDivElement>

export const IconFont = React.forwardRef<HTMLDivElement, IconType>(({
    color, hoverColor, size, fontClass, unicode,
    className,
    ...props
}, ref) => {
  
    const useStyles = createStyles(({token, css}) => ({
        xmIcon: css`
            ${color? 'color:'+color+';': ''}
            ${hoverColor? 'cursor: pointer;': ''}
            font-size: ${size || '16'}px;
            ${hoverColor? '&:hover{color: '+hoverColor+';}': ''}
        `
    }));
    
    const { styles, cx, theme } = useStyles();

    if(fontClass){
        return <i ref={ref} className={`iconfont ${fontClass} ${cx('xmIcon', styles.xmIcon)} ${className || ''}`} {...props}></i>
    }else if(unicode){
        return <i ref={ref} className={`iconfont ${cx('xmIcon', styles.xmIcon)} `} {...props}>{unicode}</i>
    }else{
        return <></>
    }
});

// export const IconFont: React.FC<IconType> = ({
//     color, hoverColor, size, fontClass, unicode,
//     className,
//     ...props
// }) => {

//     const useStyles = createStyles(({token, css}) => ({
//         xmIcon: css`
//             ${color? 'color:'+color+';': ''}
//             ${hoverColor? 'cursor: pointer;': ''}
//             font-size: ${size || '16'}px;
//             ${hoverColor? '&:hover{color: '+hoverColor+';}': ''}
//         `
//     }));
    
//     const { styles, cx, theme } = useStyles();

//     if(fontClass){
//         return <i className={`iconfont ${fontClass} ${cx('xmIcon', styles.xmIcon)} ${className || ''}`} {...props}></i>
//     }else if(unicode){
//         return <i className={`iconfont ${cx('xmIcon', styles.xmIcon)} `} {...props}>{unicode}</i>
//     }else{
//         return <></>
//     }

// };