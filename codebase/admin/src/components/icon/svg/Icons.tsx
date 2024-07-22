
import { ReactComponent as UserSVG } from './user.svg';
import { ReactComponent as SearchSVG } from './search.svg';
import { ReactComponent as UserAddSVG } from './user-add.svg';
import { ReactComponent as UserEditSVG } from './user-edit.svg';
import { ReactComponent as UserDeleteSVG } from './user-del.svg';
import { ReactComponent as SettingSVG } from './setting.svg';
import { ReactComponent as EditSVG } from './edit.svg';
import { ReactComponent as DeleteSVG } from './delete.svg';
import { ReactComponent as ViewSVG } from './view.svg';
import { XmSVG } from './XmSVG'

export type XmSVGIconType = {
    primaryColor?: string,
    secondColor?: string,
    width?: number | string,
    height?: number | string
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

/**
 * 放大镜图标
 * @param props XmSVGIconType
 * @returns 
 */
export const SearchIcon : React.FC<XmSVGIconType> = (props) => {
    return <XmSVG SVGElement={SearchSVG } {...props}/>
}

/**
 * 用户图标
 * @param props XmSVGIconType
 * @returns 
 */
export const UserIcon : React.FC<XmSVGIconType> = (props) => {
    return <XmSVG SVGElement={UserSVG } {...props}/>
}


/**
 * 编辑用户图标
 * @param props XmSVGIconType
 * @returns 
 */
export const UserEditIcon : React.FC<XmSVGIconType> = (props) => {
    return <XmSVG SVGElement={UserEditSVG } {...props}/>
}

/**
 * 新增用户图标
 * @param props XmSVGIconType
 * @returns 
 */
export const UserAddIcon : React.FC<XmSVGIconType> = (props) => {
    return <XmSVG SVGElement={UserAddSVG } {...props}/>
}


/**
 * 删除用户图标
 * @param props XmSVGIconType
 * @returns 
 */
export const UserDeleteIcon : React.FC<XmSVGIconType> = (props) => {
   return <XmSVG SVGElement={UserDeleteSVG } {...props}/>
}

/**
 * 设置（齿轮）图标
 * @param props XmSVGIconType
 * @returns 
 */
export const SettingIcon : React.FC<XmSVGIconType> = (props) => {
   return <XmSVG SVGElement={SettingSVG } {...props}/>
}

/**
 * 编辑图标
 * @param props XmSVGIconType
 * @returns 
 */
export const EditIcon : React.FC<XmSVGIconType> = (props) => {
    return <XmSVG SVGElement={EditSVG } {...props}/>
 }

/**
 * 编辑图标
 * @param props XmSVGIconType
 * @returns 
 */
export const DeleteIcon : React.FC<XmSVGIconType> = (props) => {
    return <XmSVG SVGElement={DeleteSVG } {...props}/>
 }


/**
 * 查看（眼睛）图标
 * @param props XmSVGIconType
 * @returns 
 */
export const ViewIcon : React.FC<XmSVGIconType> = (props) => {
    return <XmSVG SVGElement={ViewSVG } {...props}/>
 }

