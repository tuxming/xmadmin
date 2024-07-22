
import './iconfont/iconfont.css';
import { createStyles } from 'antd-style';

interface IconType{
    fontClass?: string;
    unicode? : string; 
    size?: string;
    color?: string;
    hoverColor?: string;
}

export const IconFont: React.FC<IconType> = (prop) => {

    const useStyles = createStyles(({token, css}) => ({
        xmIcon: css`
            ${prop.color? 'color:'+prop.color+';': ''}
            ${prop.hoverColor? 'cursor: pointer;': ''}
            font-size: ${prop.size || '16'}px;
            ${prop.hoverColor? '&:hover{color: '+prop.hoverColor+';}': ''}
        `
    }));
    
    const { styles, cx, theme } = useStyles();

    if(prop.fontClass){
        return <i className={`iconfont ${prop.fontClass} ${cx('xmIcon', styles.xmIcon)}`}></i>
    }else if(prop.unicode){
        return <i className={`iconfont ${cx('xmIcon', styles.xmIcon)}`}>{prop.unicode}</i>
    }else{
        return <></>
    }

};