import { Upload, Image } from "antd"
import { PlusOutlined } from '@ant-design/icons';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { useEffect, useState } from "react";
import { api } from "../../../common/api";
import { useRequest } from "../../../hooks";
import { DefaultNS } from "../../../common/I18NNamespace";
import { useShowResult } from "../../../hooks/useShowResult";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
type ListType = GetProp<UploadProps, 'listType'>;

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

/**
 * 文件上传组件，这个组件用于放在antd里面的form.item里面，
 * form.getFieldValue和onSubmit的时候，获取的到的是文件上传成功返回的id列表，
 * 在form渲染的时候，会根据form设置的值从后台渲染文件列表
 */
export const FileUploadFormItem : React.FC<{
    /**
     * upload组件的文件列表展示方式
     */
    listType?: ListType,
    /**
     * 文件的分组，就是传在哪个文件下，
     */
    category?: string,
    maxCount?: number,
    value?: number[], 
    onChange?: (values: number[])=>void,
    onRemove?: (value: number) => void,
}> = ({
    listType,
    category,
    value,
    maxCount,
    onChange,
    onRemove
}) => {

    const request = useRequest();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const showResult = useShowResult(DefaultNS);

    useEffect(()=>{
        if(value && value.length>0){
            let list = value.map(id => ({
                uid: id+"",
                name: id+"",
                url: api.document.img+"?id="+id,
                status: 'done'
            })) as any;
            if(fileList.length == 0){
                setFileList(list);
            }else{
                let ls = fileList.filter(s => s.status != 'done');
                setFileList([...list, ...ls]);
            }
        
        }
    }, [value])

    const handlePreview = async (file: UploadFile) => {
        // console.log("preview", file);
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        setFileList(info.fileList);
        let ids = [];
        info.fileList.forEach(file => {
            if(file.status == 'done'){
                if(file.response){
                    ids.push(file.response.data);
                }else{
                    if(/^\d+$/.test(file.uid)){
                        ids.push((file.uid as any) * 1);
                    }
                }
            }
        });
       
        if(onChange){
            onChange(ids);
        }
    }

    const handleRemove = (file)=>{
        const doDelete = async () => {
            let id = file.response?.data || file.uid; 
            let result = await request.get(api.document.deletes+"?ids="+id)
            showResult.show(result);
        }
        doDelete();
        if(onRemove){
            onRemove(file.response?.data || file.uid);
        }
    }

    // const customRequest = (options) => {
    //     console.log(options.onSuccess());
    // }

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return <>
        <Upload
            action={api.document.upload+"?type="+(category || "")}
            withCredentials
            listType={listType}
            fileList={fileList}
            maxCount={maxCount}
            onPreview={handlePreview}
            onChange={handleChange}
            onRemove={handleRemove}
            // customRequest={customRequest}
        >
            {fileList.length >= (maxCount || 1) ? null : uploadButton}
        </Upload>
        {previewImage && (
            <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
            />
        )}
    </>
}