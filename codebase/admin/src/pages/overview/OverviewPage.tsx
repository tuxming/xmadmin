import { Button, Space } from "antd"
import { DeleteIcon } from "../../components/icon/svg/Icons"
import { useLayer } from "../../components"

export const OverviewPage : React.FC = () => {

    const {message} = useLayer();

    return <>
        
        <div style={{
            height: 1000,
            overflowY: 'auto',
            padding: 20
        }}>
            <Space>
                <Button icon={<DeleteIcon type="default"/> } onClick={() => message.open({content: "打开了一个提示消息", type: "success"})} type="default">text</Button>
                <Button icon={<DeleteIcon type="default" danger/> } type="default" danger>text</Button>
                <Button icon={<DeleteIcon type="default" ghost/> } type="default" ghost>text</Button>
                <Button icon={<DeleteIcon type="default" ghost danger/> } type="default" ghost danger>text</Button>
                <Button icon={<DeleteIcon type="primary"/> } type="primary">text</Button>
                <Button icon={<DeleteIcon type="primary" danger/> } type="primary" danger>text</Button>
                <Button icon={<DeleteIcon type="primary" ghost/> } type="primary" ghost>text</Button>
                <Button icon={<DeleteIcon type="primary" ghost danger/> } type="primary" ghost danger>text</Button>
            </Space>
        </div>
    </>
}