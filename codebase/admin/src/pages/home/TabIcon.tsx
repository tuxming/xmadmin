import { useEffect, useRef, useState } from "react"
import { IconFont } from "../../components"
import { useSelector } from "../../redux/hooks"


export type TabIconType = {
    icon: string,
    tabKey: string
}
export const TabIcon : React.FC<TabIconType> = ({icon, tabKey}) => {

    const iconRef = useRef(null);
    const activeKey = useSelector(state => state.activeTabKey.value);
    const [fullIcon, setFullIcon] = useState("icon-maximize");
    const [currIcon, setCurrIcon] = useState(icon);

    useEffect(()=>{

        if(!iconRef.current) return;

        // console.log(iconRef);
        let mouseEnter = () => {
            // console.log("enter");
            if(activeKey != tabKey) return;

            setCurrIcon(fullIcon);
        }

        let mouseOut = () => {
            // console.log("out");
            if(activeKey != tabKey) return;

            setCurrIcon(icon);
        }

        iconRef.current.addEventListener("mouseenter", mouseEnter)
        iconRef.current.addEventListener("mouseout", mouseOut);

        return () => {
            if(iconRef.current){
                iconRef.current.removeEventListener("mouseenter", mouseEnter)
                iconRef.current.removeEventListener("mouseout", mouseOut);
            }
        }

    }, [])

    return <IconFont ref={iconRef} fontClass={currIcon} className='tab-icon'/>
} 