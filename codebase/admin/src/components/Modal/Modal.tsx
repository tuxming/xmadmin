
import {createPortal} from 'react-dom'
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import './Modal.css';
import {ModalContext} from './ModalContext';
import {computePx} from '../../common/kit'
import { useDispatch, useSelector } from '../../redux/hooks';
import { globalVarSlice } from '../../redux/CommonSlice';
import store from '../../redux/store';

/**
 * 包装过的ant modal主要是能够自适应，窗体的变化，在不同尺寸的窗体下，显示大小
 */

export type ModalType = {
    /**
     * 是否显示
     */
    open: boolean,        
    /**
     * 宽度：默认500px
     */
    width?: number | string,
    /**
     * 高度：默认200
     */
    height?: number | string,
    /**
     * 是否全屏显示： 默认win
     */
    state?: "win" | "min" | "full",
    /**
     * 是否显示遮罩：默认显示
     */
    showMask?: boolean,
    /**
     * 是否点击遮罩可关闭
     */
    closeMask?: boolean,
    /**
     * zIndex： 可以手动设置，默认1000
     */
    zIndex?: number,
    /**
     * 在min模式下才显示
     */
    title?: string | ReactNode, 
    /**
     * 主题,dark , light 默认light
     */
    theme?: 'dark' | 'light',
    onClose: () => void,
    children?: JSX.Element,

    /**
     * 颜色resize, move按钮的颜色
     */
    btnColor? : string, 
    btnHoverColor?: string,

    /**
     * 是否显示resize按钮
     */
    showResize?: boolean,
    /**
     * 是否显示move移动按钮
     */
    showMove?: boolean,
    /**
     * 是否显示最大化按钮
     */
    showMaxize?: boolean,
    /**
     * 是否显示最小化那妞
     */
    showMinize?: boolean,
    /**
     * 如果是window窗体：在浏览器尺寸变化的时候，根据浏览器尺寸，改变器大小，位置
     * 如果是类似于确认的弹窗，始终保证其居中显示，默认是window
     */
    type?: "window" | "modal",
    /**
     * modal窗体尺寸
     * @param pos 尺寸: {width, height, left, top}
     * @returns 
     */
    onSizeChange?: (pos) => void
}

/**
 * 自定义modal，支持拖拽，最大化，最小化，窗口化， 窗口尺寸变化
 * .x-modal-conten设置 窗体大小 位置 背景，阴影，显示隐藏动画信息的地方
 * .x-modal-inner-content设置padding, border-width， margin的地方， 因为这些信息很会导致窗体的实际大小和获取到的宽高，所以给放到下级
 * @param prpos ModalType
 * @returns 
 */
export const Modal : React.FC<ModalType> = ({
    open,
    state = "win",
    children,
    width=500,
    height,
    showMask = true,
    closeMask = false,
    zIndex,
    title,
    theme = 'light',
    onClose,
    btnColor = "#00b96b",
    btnHoverColor = "#39de99",
    showResize = true,
    showMove = true,
    showMaxize = true,
    showMinize = true,
    type= "window",
    onSizeChange,
}) => {

    const inited = useRef(height && height!='auto');

    const [visible, setVisible] = useState(true);
    const modalRef = useRef(null);
    const [modalState, setModalState] = useState(state);
    const [topLevel, setTopLevel] = useState(false);

    const windowIndex = useSelector(state => state.globalVar.windowIndex);
    const currIndex = useRef<number>(windowIndex);
    const dispatch = useDispatch();

    useEffect(()=>{
        if(type == 'window'){
            dispatch(globalVarSlice.actions.addWindowZIndex(0));
        }else{
            dispatch(globalVarSlice.actions.addModalZIndex(0));
        }
    },[])

    let wheight = computePx(height, true);

    //窗口模式下的弹窗位置大小信息
    const [winPos, setWinPos] = useState<any>({
        width: computePx(width),
        height: wheight || 'auto',
        top: (window.innerHeight - wheight) / 2,
        left: (window.innerWidth - computePx(width)) /2,
        visibility: height && height!='auto'? 'visible' : "hidden",
        animationName: 'zoomIn'
    })

    //全屏模式下的弹窗位置大小信息
    const [fullPos, setFullPos] = useState<any>({
        width: "100vw",
        height: "100vh",
        top: "0px",
        left: "0px",
        visibility: 'visible'
    })

    //最小化模式下的弹窗位置大小信息
    const [minPos, setMinPos] = useState<any>({
        maxWidth: "300px",
        // maxHeight: "20px",
        top: window.innerHeight - 35,
        left: window.innerWidth - 315,
        visibility: 'visible'
    })

    //当前正在应用的弹窗位置的大小信息
    const [currPos, setCurrPos] = useState<any>(
        state == 'win'? winPos : state == 'full'? fullPos:minPos
    );
    
    //窗口在切换模式以后，保存的前一个模式，主要用于当窗体最小化以后，应该恢复成什么样子
    const [prevState, setPrevState] = useState<any>();

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [isDraggingSize, setIsDraggingSize] = useState(false);
    
    //根据当前模式设置窗体信息
    const completePos = () => {
        //在初始的化的时候，会被调用两次，意思就是useEffect监听modalState的时候，
        //在modalState没有变化的情况下执行了两次，所以在inited设置为true的地方，
        //延时设置为true, 这样这两次执行到这里的时候，都是false, 后面的逻辑就不会别执行，
        //导致这个的原因是因为，react在开发模式下，每各个组件在初始化的时候都会执行两次
        //在产品模式下就只会执行一次，所以在产品模式下是没有这个问题的

        if(!inited.current)
            return;
        if(modalState == "win"){
            setCurrPos(winPos);
            if(onSizeChange){
                onSizeChange(winPos);
            }
        }else if(modalState == 'full'){
            setCurrPos(fullPos);
            if(onSizeChange){
                onSizeChange(fullPos);
            }
        }else if(modalState == 'min'){
            setCurrPos(minPos);
            if(onSizeChange){
                onSizeChange(minPos);
            }
        }
    }

    useEffect(()=>{
        // console.log("open="+open+", visible="+visible);
        if(open == false && visible){
            closeModal();
        }else if(open){
            setVisible(true);
        }
    }, [open]);

    useEffect(()=> {
        completePos();
    }, [modalState]);

    //添加移动，改变窗口的拖拽监听
    useEffect(() => {
        const handleMoveMouseDown = (event) => {
            setIsDragging(true);
            setPosition({
                x: event.clientX - modalRef.current.offsetLeft,
                y: event.clientY - modalRef.current.offsetTop,
            });
        };

        const handleResizeMouseDown = (event) => {
            event.preventDefault(); //阻止浏览器的默认行为，比如选中文字
            setIsDraggingSize(true);
        };
    
        const handleMouseMove = (event) => {
            if (isDragging) {
                const newX = Math.min(Math.max(event.clientX - position.x, 0), window.innerWidth - modalRef.current.offsetWidth);
                const newY = Math.min(Math.max(event.clientY - position.y, 0), window.innerHeight - modalRef.current.offsetHeight);
                modalRef.current.style.left = `${newX}px`;
                modalRef.current.style.top = `${newY}px`;
            }else if (isDraggingSize) {
                let left = modalRef.current.offsetLeft;
                let top = modalRef.current.offsetTop;
                //最小不能小于100，最大不能超过窗体的宽度
                let newWidth = Math.min(Math.max(event.clientX - left, 100), window.innerWidth - left - 10);
                //最小不能小于50， 最大不能超过窗体的高度
                const newHeight = Math.min(Math.max(event.clientY - modalRef.current.offsetTop, 50), window.innerHeight - top - 15);
                modalRef.current.style.width = `${newWidth}px`;
                modalRef.current.style.height = `${newHeight}px`;
            }
        };
        
        //在拖拽鼠标放开以后，固定当前窗体信息到state中
        const handleMouseUp = () => {
            if(isDragging){
                if(modalState == 'win'){
                    setWinPos({...winPos, 
                        visibility: 'visible',
                        top: modalRef.current.offsetTop,
                        left: modalRef.current.offsetLeft
                    })
                }else if(modalState == "min"){
                    setMinPos({...minPos, 
                        top: modalRef.current.offsetTop,
                        left: modalRef.current.offsetLeft
                    })
                }
            }else if(isDraggingSize){
                setTimeout(() => {
                    if(modalState == 'win'){
                        let pos = {...currPos, 
                            visibility: 'visible',
                            width: modalRef.current.style.width,
                            height: modalRef.current.style.height
                        }
                        setWinPos(pos);
                        setCurrPos(pos);
                        if(onSizeChange){
                            onSizeChange(pos);
                        }
                    }
                }, 60);
            }
            setIsDragging(false);
            setIsDraggingSize(false);
        };
        
        let moveBtn = null;
        let resizeBtn = null;
        if(showMove){
            moveBtn = modalRef.current.querySelector(".x-modal-move-btn");
            moveBtn.addEventListener('mousedown', handleMoveMouseDown);
        }

        if(showResize){
            resizeBtn = modalRef.current.querySelector(".x-modal-resize-btn");
            resizeBtn.addEventListener('mousedown', handleResizeMouseDown);
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    
        return () => {
            if(showMove){
                moveBtn.removeEventListener('mousedown', handleMoveMouseDown);
            }
            if(resizeBtn){
                resizeBtn.removeEventListener('mousedown', handleResizeMouseDown);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isDraggingSize]);

    //当height为auto计算出实际的height, 方便定位和绘制窗口的大小
    //添加聚焦事件，modal获得聚焦的时候，显示在最顶层，
    //窗口尺寸变化的时候，重新计算位置
    useEffect(()=>{
        //ref存在了，重新设置定位
        //初始化，只执行一次
        if(modalRef.current && modalState == 'win' && !inited.current && currPos.visibility == 'hidden'){
            let aheight = modalRef.current.offsetHeight;
            // let aheight = modalRef.current.querySelector(".x-modal-body").offsetHeight;
            // console.log(aheight)
            // console.log(modalRef.current.innerHeight, modalRef.current.clientHeight, modalRef.current.offsetHeight);
            
            let winHeight = window.innerHeight;
            let npos = {
                width: computePx(width),
                height: wheight || aheight,
                top:   aheight>winHeight?0:(winHeight - aheight) / 3,
                left: (window.innerWidth - computePx(width)) /2,
                visibility: 'visible',
                animationName: 'zoomIn'
            }
            setWinPos(npos);
            setCurrPos(npos);
            if(onSizeChange){
                onSizeChange(npos);
            }

            setTimeout(() => {
                inited.current = true;
            }, 1000);
        }

        const blurHandler = () => {
            setTopLevel(false);
        }

        const focusHandler = (event) => {
            event.preventDefault(); //阻止浏览器的默认行为，比如选中文字
            dispatch(globalVarSlice.actions.addWindowZIndex(windowIndex));
            let currWindowIndex = store.store.getState().globalVar.windowIndex;
            currIndex.current = currWindowIndex;
            // console.log("focus");
            setTopLevel(true);
        }

        //浏览器窗体宽度发生变化时，调整弹窗位置和宽高
        //弹窗宽高受到padding, border-width, margin等因素影响，所以别在modalRef的元素上面设置padding, border-width, margin
        //可以在modalRef内在嵌套一个子div，专门用来设置padding, border-width, margin
        //那么modalRef所获取到的宽高就是实际的高度，而不用专门减去这些因素
        const handleResize = (event) => {

            if(!modalRef.current) return;

            let offsetHeight = modalRef.current.offsetHeight;
            let offsetWidth = modalRef.current.offsetWidth;
            let top = modalRef.current.offsetTop;
            let left = modalRef.current.offsetLeft;
            let winWidth = window.innerWidth;
            let winHeight = window.innerHeight;

            let newHeight = Math.min(offsetHeight, winHeight);
            let newWidth = Math.min(offsetWidth, winWidth);
            let newTop  = Math.min(top, winHeight - offsetHeight);
            let newLeft = Math.min(left, winWidth - offsetWidth); 

            if(type == 'window'){
                if(newHeight == winHeight){
                    newWidth = winWidth;
                    newTop = 0;
                    newLeft = 0;
                }
                if(newWidth == winWidth){
                    newHeight = winHeight;
                    newTop = 0;
                    newLeft = 0;
                }

            }else if(type == 'modal'){
                //调整位置使其始终居中
                newTop = (winHeight - offsetHeight) / 4;
                //微调一下，留一个左右边距
                // newLeft = (winWidth - width) / 2;
                
                if(newWidth == winWidth){
                    newWidth = newWidth - 20;
                } else {
                    let minWidth =  computePx(width);
                    if( winWidth > newWidth && newWidth < minWidth && winWidth - minWidth>0){
                        newWidth = width as any;
                    }
                }
                newLeft = (winWidth - newWidth) / 2;

            }

            let pos = {
                width: newWidth,
                height: newHeight,
                top: newTop,
                left: newLeft,
                visibility: 'visible',
            };
            // console.log(offsetHeight, offsetWidth, top, left, winWidth, winHeight);
            // console.log(pos);
            setCurrPos(pos);
            if(onSizeChange){
                onSizeChange(pos);
            }
        };

        if(modalRef.current ){
            if(type === 'window'){
                modalRef.current.addEventListener('focus', focusHandler);
                modalRef.current.addEventListener('blur', blurHandler);
            }
            window.addEventListener('resize', handleResize);
        }

        return () => {
            if(modalRef.current){
                if(type === 'window'){
                    modalRef.current.removeEventListener('focus', focusHandler);
                    modalRef.current.removeEventListener('blur', blurHandler);
                }
                window.removeEventListener('resize', handleResize);
            }
        }

    }, [modalRef]);

    //关闭窗体，执行关闭过度动画，在执行关闭操作
    const closeModal = () => {
        let css = modalRef.current.style;
        css.animationName ="zoomOut";

        setTimeout(() => {
            css.opacity ="0";
            css.display = "none";
            setVisible(false);
            onClose();
        }, 300);
    }

    //点击遮罩关闭弹窗
    const onClickMaskHandler = () => {
        if(closeMask){
            closeModal();
        }
    }

    //点击最小化，保存当前状态
    const onClickMinHandler = () => {
        setPrevState(modalState);
        setModalState("min");
    }

    //点击最大化
    const onClickMaxHandler = () => {

        if(modalState == 'min' && prevState){
            setModalState(prevState);
        }else{
            if(modalState == "win"){
                setModalState("full");
            }else if(modalState == "min"){
                setModalState("win");
            }else if(modalState == 'full'){
                let pos = {...winPos};
                delete pos.animationName;
                setWinPos(pos);
                setModalState('win');
            }
        }
    }
    
    //设置一些css信息
    const overlayStye = {
        zIndex: topLevel? windowIndex: (currIndex.current || zIndex),
    }

    if(visible){
    return createPortal(
        <div className={theme + " x-modal-overlay "} onClick={onClickMaskHandler}  style={overlayStye}>
            <style dangerouslySetInnerHTML={{
                __html: `
.x-modal-resize-btn svg{
    fill: ${btnColor};
}
.x-modal-resize-btn:hover svg{
    fill: ${btnHoverColor}
}
.x-modal-move-btn path{
    fill: ${btnColor};
}
.x-modal-move-btn:hover path{
    fill: ${btnHoverColor};
}`
            }} />
            <div className="x-modal-mask" style={{display: showMask?"block":"none"}}></div>
            <div 
                tabIndex={11}
                ref={modalRef}
                style={currPos}
                className="x-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="x-modal-inner-content" style={{width: currPos.width, height: currPos.height, overflow:'hidden', boxSizing: 'border-box'}}>
                    <div className="x-modal-ctrl" style={{
                            right: modalState == 'full'?20:6, maxWidth: modalState=='min'? currPos.width:"auto",
                            position: modalState == 'min'?'relative':'absolute',
                            top: modalState == 'min'?'0px':'6px',
                            paddingLeft: '15px',
                        }}>
                        <span className='x-modal-title' style={{display: modalState=="min"?'block':"none" }}>{title}</span>

                        {showMove && (
                        <span className="x-modal-ctrl-btn x-modal-move-btn" >
                            <svg width="15" height="15" viewBox="0 0 64 64" style={{display:  "inline-block"}}>
                                <path d="M36.6,14.5H32h14.9L31.9,0L17.2,14.5h10.3v13.5H13.6v9h13.8v13.6h9.1V37h13.7v-9H36.6V14.5z M31.9,64l13.8-13.4H18.3L31.9,64L31.9,64z M0,32.5L13.6,46v-27L0,32.5L0,32.5z M50.3,19.1v27L64,32.5L50.3,19.1L50.3,19.1z">
                                </path>
                            </svg>
                        </span> 
                        )
                        }
                        {showMinize && <span style={{display: modalState != 'min'?'inline-block':"none"}} className="x-modal-ctrl-btn x-modal-min-btn" onClick={onClickMinHandler}>
                            <span></span>
                        </span>}
                        {showMaxize &&  <span className="x-modal-ctrl-btn x-modal-max-btn" onClick={onClickMaxHandler}>
                            <svg width="7" height="7" viewBox="0 0 11 11">
                                <path id="modal-max-path" 
                                    d="M2.3,4.5v4.2h4.2c0.55,0 1,0.45 1,1v0.3c0,0.55 -0.45,1 -1,1h-5c-0.83,0 -1.5,-0.67 -1.5,-1.5v-5c0,-0.55 0.45,-1 1,-1h0.3c0.55,0 1,0.45 1,1zM9.5,0c0.83,0 1.5,0.67 1.5,1.5v5c0,0.55 -0.45,1 -1,1h-0.3c-0.55,0 -1,-0.45 -1,-1v-4.2h-4.2c-0.55,0 -1,-0.45 -1,-1v-0.3c0,-0.55 0.45,-1 1,-1z">
                                </path>
                            </svg>
                        </span>}
                        <span className="x-modal-ctrl-btn x-modal-close-btn" onClick={closeModal}>
                            <svg width="7" height="7" viewBox="0 0 11 11">
                                <path id="modal-close-path" d="M8.55 10.58L5.5 7.53L2.45 10.58C1.89 11.14 0.98 11.14 0.42 10.58C-0.14 10.02 -0.14 9.11 0.42 8.55L3.47 5.5L0.42 2.45C-0.14 1.89 -0.14 0.98 0.42 0.42C0.98 -0.14 1.89 -0.14 2.45 0.42L5.5 3.47L8.55 0.42C9.11 -0.14 10.02 -0.14 10.58 0.42C11.14 0.98 11.14 1.89 10.58 2.45L7.53 5.5L10.58 8.55C11.14 9.11 11.14 10.02 10.58 10.58C10.02 11.14 9.11 11.14 8.55 10.58Z"></path>
                            </svg>
                        </span>
                    </div>
                    <div className="x-modal-body" style={{display: modalState == 'min'?'none': 'block', height: '100%' }}>
                        <ModalContext.Provider value={currPos}>
                            {children}
                        </ModalContext.Provider>
                    </div>
                </div>
                {showResize && (
                <span className="x-modal-resize-btn" >
                    <svg width="24" height="24" viewBox="0 0 64 64">
                        <path d="M28.2,32.1l3.8-3.8l-6.1-6.1l4.1-4.1H18v12.1l4.2-4.2L28.2,32.1z M14,2L9.8,6.2L3.7,0.1L0,3.9L6.1,10l-4,3.9H14V2z">
                        </path>
                    </svg>
                </span> 
                )}
            </div>
        </div>,
        document.body
      );
    }else{
        return <></>
    }

}