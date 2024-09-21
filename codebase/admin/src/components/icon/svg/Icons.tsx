
import { ReactComponent as UserSVG } from './user.svg';
import { ReactComponent as SearchSVG } from './search.svg';
import { ReactComponent as UserAddSVG } from './user-add.svg';
import { ReactComponent as UserEditSVG } from './user-edit.svg';
import { ReactComponent as UserDeleteSVG } from './user-del.svg';
import { ReactComponent as SettingSVG } from './setting.svg';
import { ReactComponent as EditSVG } from './edit.svg';
import { ReactComponent as DeleteSVG } from './delete.svg';
import { ReactComponent as ViewSVG } from './view.svg';
import { ReactComponent as ViewOffSVG } from './view-off.svg';
import { ReactComponent as ScanSVG } from './scan.svg';
import { ReactComponent as AddSVG } from './add.svg';
import { ReactComponent as MenuAddSVG } from './menu-add.svg';
import { ReactComponent as MenuDeleteSVG } from './menu-delete.svg';
import { ReactComponent as LangAddSVG } from './lang-add.svg';
import { ReactComponent as LangDeleteSVG } from './lang-delete.svg';
import { ReactComponent as LangEditSVG } from './lang-edit.svg';
import { ReactComponent as FileAddSVG } from './file-add.svg';
import { ReactComponent as FileDeleteSVG } from './file-delete.svg';
import { ReactComponent as FileEditSVG } from './file-edit.svg';
import { ReactComponent as DictAddSVG } from './dict-add.svg';
import { ReactComponent as DictDeleteSVG } from './dict-delete.svg';
import { ReactComponent as DictEditSVG } from './dict-edit.svg';
import { ReactComponent as UploadSVG } from './upload.svg';
import { ReactComponent as CopySVG } from './copy.svg';
import { ReactComponent as RefreshSVG } from './refresh.svg';
import { ReactComponent as DataLockSVG } from './data-lock.svg';
import { ReactComponent as GrantUserSVG } from './grant-user.svg';
import { ReactComponent as GrantMenuSVG } from './grant-menu.svg';
import { ReactComponent as GrantPermissionSVG } from './grant-permission.svg';
import { XmSVG, XmSVGType} from './XmSVG'

/**
 * 放大镜图标
 * @param props XmSVGType
 * @returns 
 */
export const SearchIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={SearchSVG } {...props}/>
}

/**
 * 用户图标
 * @param props XmSVGType
 * @returns 
 */
export const UserIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={UserSVG } {...props}/>
}


/**
 * 编辑用户图标
 * @param props XmSVGType
 * @returns 
 */
export const UserEditIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={UserEditSVG } {...props}/>
}

/**
 * 新增用户图标
 * @param props XmSVGType
 * @returns 
 */
export const UserAddIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={UserAddSVG } {...props}/>
}


/**
 * 删除用户图标
 * @param props XmSVGType
 * @returns 
 */
export const UserDeleteIcon : React.FC<XmSVGType> = (props) => {
   return <XmSVG SVGElement={UserDeleteSVG } {...props} />
}

/**
 * 设置（齿轮）图标
 * @param props XmSVGType
 * @returns 
 */
export const SettingIcon : React.FC<XmSVGType> = (props) => {
   return <XmSVG SVGElement={SettingSVG } {...props}/>
}

/**
 * 编辑图标
 * @param props XmSVGType
 * @returns 
 */
export const EditIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={EditSVG } {...props}/>
 }

/**
 * 删除图标
 * @param props XmSVGType
 * @returns 
 */
export const DeleteIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={DeleteSVG } {...props}  iconName='delete'/>
 }


/**
 * 查看（眼睛）图标
 * @param props XmSVGType
 * @returns 
 */
export const ViewIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={ViewSVG } {...props}/>
}

/**
 * 隐藏查看（眼睛）图标
 * @param props XmSVGType
 * @returns 
 */
export const ViewOffIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={ViewOffSVG } {...props}/>
}

/**
 * 扫描图标
 * @param props XmSVGType
 * @returns 
 */
export const ScanIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={ScanSVG } {...props}/>
}

/**
 * 添加图标
 * @param props XmSVGType
 * @returns 
 */
export const AddIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={AddSVG } {...props}/>
}

/**
 * 添加菜单图标
 * @param props XmSVGType
 * @returns 
 */
export const MenuAddIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={MenuAddSVG } {...props}/>
}

/**
 * 删除菜单图标
 * @param props XmSVGType
 * @returns 
 */
export const MenuDeleteIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={MenuDeleteSVG } {...props}/>
}

/**
 * 添加语言图标
 * @param props XmSVGType
 * @returns 
 */
export const LangAddIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={LangAddSVG } {...props}/>
}

/**
 * 编辑语言图标
 * @param props XmSVGType
 * @returns 
 */
export const LangEditIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={LangEditSVG } {...props}/>
}

/**
 * 删除语言图标
 * @param props XmSVGType
 * @returns 
 */
export const LangDeleteIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={LangDeleteSVG } {...props}/>
}


/**
 * 添加文件图标
 * @param props XmSVGType
 * @returns 
 */
export const FileAddIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={FileAddSVG } {...props}/>
}

/**
 * 编辑文件图标
 * @param props XmSVGType
 * @returns 
 */
export const FileEditIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={FileEditSVG } {...props}/>
}

/**
 * 删除文件图标
 * @param props XmSVGType
 * @returns 
 */
export const FileDeleteIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={FileDeleteSVG } {...props}/>
}

/**
 * 添加字典图标
 * @param props XmSVGType
 * @returns 
 */
export const DictAddIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={DictAddSVG } {...props}/>
}

/**
 * 编辑字典图标
 * @param props XmSVGType
 * @returns 
 */
export const DictEditIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={DictEditSVG } {...props}/>
}

/**
 * 删除字典图标
 * @param props XmSVGType
 * @returns 
 */
export const DictDeleteIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={DictDeleteSVG } {...props}/>
}


/**
 * 上传图标
 * @param props XmSVGType
 * @returns 
 */
export const UploadIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={UploadSVG } {...props}/>
}

/**
 * 复制图标
 * @param props XmSVGType
 * @returns 
 */
export const CopyIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={CopySVG } {...props}/>
}

/**
 * 刷新图标
 * @param props XmSVGType
 * @returns 
 */
export const RefreshIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={RefreshSVG } {...props}/>
}

/**
 * 锁定数据图标
 * @param props XmSVGType
 * @returns 
 */
export const DataLockIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={DataLockSVG } {...props}/>
}

/**
 * 分配角色图标
 * @param props XmSVGType
 * @returns 
 */
export const GrantUserIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={GrantUserSVG } {...props}/>
}

/**
 * 分配菜单图标
 * @param props XmSVGType
 * @returns 
 */
export const GrantMenuIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={GrantMenuSVG } {...props}/>
}

/**
 * 分配权限图标
 * @param props XmSVGType
 * @returns 
 */
export const GrantPermissionIcon : React.FC<XmSVGType> = (props) => {
    return <XmSVG SVGElement={GrantPermissionSVG } {...props}/>
}



