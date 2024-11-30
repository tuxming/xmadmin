

/**
 * 国际化
 * @param ns 命名空间，或 叫做分类 
 * @returns 
 */
const useTranslation = (ns: string) => {

    const translationMessage = (key: string, ns?: string) => {

        return key;
    }
    
    const formatMessage = (key: string, values: any[], ns?: string) => {
    
        return key;
    }

    return {
        t: translationMessage,
        f: formatMessage
    }
}

export default useTranslation;

