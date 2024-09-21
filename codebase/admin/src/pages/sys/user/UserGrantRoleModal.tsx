import { useState } from "react"
import { Modal } from "../../../components"
import { UserGrantRole } from "./UserGrantRole"
import { CustomScroll } from "react-custom-scroll"


export const UserGrantRoleModal : React.FC<{
    open: boolean,
    userId: number,
    onClose: () => void,
}> = ({
    open,
    userId,
    onClose
}) => {
    const [visible, setVisible] = useState(open)
    const onModalClose = () => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 500);
    }

    return <Modal open={visible} onClose={onModalClose} height={250} width={350}>
        <CustomScroll heightRelativeToParent="100%" >
            <UserGrantRole userId={userId} titleLevel={4} 
                titleStyle={{textAlign: 'center', margin: '25px 0 15px 0'}} 
                wrapperStyle={{paddingLeft: 20, paddingRight: 20}}    
            />
        </CustomScroll>
    </Modal>
}