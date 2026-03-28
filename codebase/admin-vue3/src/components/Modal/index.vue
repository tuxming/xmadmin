<template>
  <Teleport to="body">
    <div v-if="visible" :class="[theme, 'x-modal-overlay']" @click="onClickMaskHandler" :style="overlayStyle">
      <component :is="'style'">
        {{ `.x-modal-resize-btn svg { fill: ${btnColor}; }` }}
        {{ `.x-modal-resize-btn:hover svg { fill: ${btnHoverColor}; }` }}
        {{ `.x-modal-move-btn path { fill: ${btnColor}; }` }}
        {{ `.x-modal-move-btn:hover path { fill: ${btnHoverColor}; }` }}
      </component>
      
      <div class="x-modal-mask" :style="{ display: showMask ? 'block' : 'none' }"></div>
      
      <div
        tabindex="11"
        ref="modalRef"
        class="x-modal-content"
        :style="modalContentStyle"
        @focus="focusHandler"
        @blur="blurHandler"
      >
        <div
          :style="modalInnerBgStyle"
          @click.stop
        >
          <div class="x-modal-inner-content" :style="innerContentStyle">
            <div class="x-modal-ctrl" :style="ctrlStyle">
              <span class="x-modal-title" :style="{ display: modalState === 'min' ? 'block' : 'none' }">
                <slot name="title">{{ title }}</slot>
              </span>

              <span v-if="showMove" class="x-modal-ctrl-btn x-modal-move-btn" @mousedown="handleMoveMouseDown">
                <svg width="15" height="15" viewBox="0 0 64 64" style="display: inline-block">
                  <path d="M36.6,14.5H32h14.9L31.9,0L17.2,14.5h10.3v13.5H13.6v9h13.8v13.6h9.1V37h13.7v-9H36.6V14.5z M31.9,64l13.8-13.4H18.3L31.9,64L31.9,64z M0,32.5L13.6,46v-27L0,32.5L0,32.5z M50.3,19.1v27L64,32.5L50.3,19.1L50.3,19.1z"></path>
                </svg>
              </span>

              <span v-if="showMinize" :style="{ display: modalState !== 'min' ? 'inline-block' : 'none' }" class="x-modal-ctrl-btn x-modal-min-btn" @click="onClickMinHandler">
                <span></span>
              </span>

              <span v-if="showMaxize" class="x-modal-ctrl-btn x-modal-max-btn" @click="onClickMaxHandler">
                <svg width="7" height="7" viewBox="0 0 11 11">
                  <path id="modal-max-path" d="M2.3,4.5v4.2h4.2c0.55,0 1,0.45 1,1v0.3c0,0.55 -0.45,1 -1,1h-5c-0.83,0 -1.5,-0.67 -1.5,-1.5v-5c0,-0.55 0.45,-1 1,-1h0.3c0.55,0 1,0.45 1,1zM9.5,0c0.83,0 1.5,0.67 1.5,1.5v5c0,0.55 -0.45,1 -1,1h-0.3c-0.55,0 -1,-0.45 -1,-1v-4.2h-4.2c-0.55,0 -1,-0.45 -1,-1v-0.3c0,-0.55 0.45,-1 1,-1z"></path>
                </svg>
              </span>

              <span class="x-modal-ctrl-btn x-modal-close-btn" @click="closeModal">
                <svg width="7" height="7" viewBox="0 0 11 11">
                  <path id="modal-close-path" d="M8.55 10.58L5.5 7.53L2.45 10.58C1.89 11.14 0.98 11.14 0.42 10.58C-0.14 10.02 -0.14 9.11 0.42 8.55L3.47 5.5L0.42 2.45C-0.14 1.89 -0.14 0.98 0.42 0.42C0.98 -0.14 1.89 -0.14 2.45 0.42L5.5 3.47L8.55 0.42C9.11 -0.14 10.02 -0.14 10.58 0.42C11.14 0.98 11.14 1.89 10.58 2.45L7.53 5.5L10.58 8.55C11.14 9.11 11.14 10.02 10.58 10.58C10.02 11.14 9.11 11.14 8.55 10.58Z"></path>
                </svg>
              </span>
            </div>
            
            <div class="x-modal-body" :style="bodyStyle">
              <slot></slot>
            </div>
          </div>
        </div>

        <span v-if="showResize" class="x-modal-resize-btn" @mousedown.prevent="handleResizeMouseDown">
          <svg width="24" height="24" viewBox="0 0 64 64">
            <path d="M28.2,32.1l3.8-3.8l-6.1-6.1l4.1-4.1H18v12.1l4.2-4.2L28.2,32.1z M14,2L9.8,6.2L3.7,0.1L0,3.9L6.1,10l-4,3.9H14V2z"></path>
          </svg>
        </span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick, provide } from 'vue';
import { useGlobalStore } from '@/store/modules/global';
import { useThemeStore } from '@/store/modules/theme';
import { computePx } from '@/utils/kit';
import './index.css';

interface Props {
  open: boolean;
  width?: number | string;
  height?: number | string;
  state?: 'win' | 'min' | 'full';
  showMask?: boolean;
  closeMask?: boolean;
  zIndex?: number;
  title?: string;
  theme?: 'dark' | 'light';
  btnColor?: string;
  btnHoverColor?: string;
  showResize?: boolean;
  showMove?: boolean;
  showMaxize?: boolean;
  showMinize?: boolean;
  type?: 'window' | 'modal';
  offsetX?: number;
  offsetY?: number;
  offset?: { x: number; y: number };
}

const props = withDefaults(defineProps<Props>(), {
  width: 500,
  height: 'auto',
  state: 'win',
  showMask: true,
  closeMask: false,
  theme: 'light',
  btnColor: '#00b96b',
  btnHoverColor: '#39de99',
  showResize: true,
  showMove: true,
  showMaxize: true,
  showMinize: true,
  type: 'modal',
  offsetX: 0,
  offsetY: 0,
});

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'close'): void;
  (e: 'sizeChange', pos: any): void;
}>();

const globalStore = useGlobalStore();
const themeStore = useThemeStore();

const inited = ref(props.height && props.height !== 'auto');
const visible = ref(props.open);
const modalRef = ref<HTMLElement | null>(null);
const modalState = ref(props.state);
const topLevel = ref(false);
const currIndex = ref<number>(props.type === 'window' ? globalStore.windowIndex : globalStore.modalIndex);

const wheight = computePx(props.height, true);
const winWidth = computePx(props.width);
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// 窗口模式下的弹窗位置大小信息
const winPos = reactive<any>({
  width: winWidth,
  height: wheight || 'auto',
  top: wheight
    ? clamp((window.innerHeight - wheight) / 2 + (props.offset?.y || props.offsetY || 0), 0, Math.max(window.innerHeight - wheight, 0))
    : clamp(window.innerHeight / 3 + (props.offset?.y || props.offsetY || 0), 0, Math.max(window.innerHeight - 60, 0)),
  left: clamp(
    (window.innerWidth - winWidth) / 2 + (props.offset?.x || props.offsetX || 0),
    0,
    Math.max(window.innerWidth - winWidth, 0),
  ),
  visibility: props.open ? 'visible' : 'hidden',
  animationName: 'zoomIn'
});

// 全屏模式下的弹窗位置大小信息
const fullPos = reactive<any>({
  width: '100vw',
  height: '100vh',
  top: '0px',
  left: '0px',
  visibility: 'visible'
});

// 最小化模式下的弹窗位置大小信息
const minPos = reactive<any>({
  maxWidth: '300px',
  top: window.innerHeight - 35,
  left: window.innerWidth - 315,
  visibility: 'visible'
});

// 当前正在应用的弹窗位置的大小信息
const currPos = ref<any>({
  ...(props.state === 'win' ? winPos : props.state === 'full' ? fullPos : minPos)
});

provide('modalContext', currPos);

const prevState = ref<any>();

const isDragging = ref(false);
const position = reactive({ x: 0, y: 0 });
const isDraggingSize = ref(false);

onMounted(() => {
  if (props.type === 'window') {
    globalStore.addWindowZIndex();
    currIndex.value = globalStore.windowIndex;
  } else {
    globalStore.addModalZIndex();
    currIndex.value = globalStore.modalIndex;
  }
  nextTick(() => {
    if (visible.value) {
      currPos.value = { ...currPos.value, visibility: 'visible' };
      if (modalRef.value) {
        modalRef.value.style.visibility = 'visible';
        modalRef.value.style.animationName = 'zoomIn';
      }
    }
    completePos();
  });
});

const completePos = () => {
  if (!inited.value) return;
  if (modalState.value === 'win') {
    currPos.value = { ...winPos, visibility: visible.value ? 'visible' : 'hidden' };
    emit('sizeChange', { ...winPos, visibility: visible.value ? 'visible' : 'hidden' });
  } else if (modalState.value === 'full') {
    currPos.value = { ...fullPos };
    emit('sizeChange', fullPos);
  } else if (modalState.value === 'min') {
    currPos.value = { ...minPos };
    emit('sizeChange', minPos);
  }
};

watch(() => props.open, (newOpen) => {
  if (newOpen === false && visible.value) {
    closeModal();
  } else if (newOpen && !visible.value) {
    visible.value = true;
    if (props.type === 'window') {
      globalStore.addWindowZIndex();
      currIndex.value = globalStore.windowIndex;
    } else {
      globalStore.addModalZIndex();
      currIndex.value = globalStore.modalIndex;
    }
    currPos.value = { ...currPos.value, visibility: 'visible' };
    setTimeout(() => {
      if (modalRef.value) {
        modalRef.value.style.visibility = 'visible';
        modalRef.value.style.animationName = 'zoomIn';
      }
    }, 10);
  } else if (newOpen && visible.value) {
    currPos.value = { ...currPos.value, visibility: 'visible' };
  }
});

watch(() => modalState.value, () => {
  completePos();
});

// 鼠标事件
const handleMoveMouseDown = (event: MouseEvent) => {
  if (!modalRef.value) return;
  isDragging.value = true;
  position.x = event.clientX - modalRef.value.offsetLeft;
  position.y = event.clientY - modalRef.value.offsetTop;
};

const handleResizeMouseDown = (event: MouseEvent) => {
  isDraggingSize.value = true;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!modalRef.value) return;
  if (isDragging.value) {
    const newX = Math.min(Math.max(event.clientX - position.x, 0), window.innerWidth - modalRef.value.offsetWidth);
    const newY = Math.min(Math.max(event.clientY - position.y, 0), window.innerHeight - modalRef.value.offsetHeight);
    modalRef.value.style.left = `${newX}px`;
    modalRef.value.style.top = `${newY}px`;
  } else if (isDraggingSize.value) {
    let left = modalRef.value.offsetLeft;
    let top = modalRef.value.offsetTop;
    let newWidth = Math.min(Math.max(event.clientX - left, 100), window.innerWidth - left - 10);
    const newHeight = Math.min(Math.max(event.clientY - top, 50), window.innerHeight - top - 15);
    modalRef.value.style.width = `${newWidth}px`;
    modalRef.value.style.height = `${newHeight}px`;
  }
};

const handleMouseUp = () => {
  if (isDragging.value && modalRef.value) {
    let topVal = modalRef.value.style.top ? parseFloat(modalRef.value.style.top) : modalRef.value.offsetTop;
    let leftVal = modalRef.value.style.left ? parseFloat(modalRef.value.style.left) : modalRef.value.offsetLeft;
    if (modalState.value === 'win') {
      Object.assign(winPos, {
        visibility: 'visible',
        top: topVal,
        left: leftVal
      });
      currPos.value = { ...currPos.value, ...winPos, visibility: 'visible' };
      emit('sizeChange', { ...winPos, visibility: 'visible' });
    } else if (modalState.value === 'min') {
      Object.assign(minPos, {
        top: topVal,
        left: leftVal
      });
      currPos.value = { ...currPos.value, ...minPos, visibility: 'visible' };
      emit('sizeChange', { ...minPos, visibility: 'visible' });
    }
  } else if (isDraggingSize.value && modalRef.value) {
    setTimeout(() => {
      if (modalState.value === 'win' && modalRef.value) {
        let pos = {
          ...currPos.value,
          visibility: 'visible',
          width: modalRef.value.style.width || modalRef.value.offsetWidth + 'px',
          height: modalRef.value.style.height || modalRef.value.offsetHeight + 'px'
        };
        Object.assign(winPos, pos);
        currPos.value = { ...pos };
        emit('sizeChange', pos);
      }
    }, 60);
  }
  isDragging.value = false;
  isDraggingSize.value = false;
};

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('resize', handleWindowResize);
});

const handleWindowResize = () => {
  if (!modalRef.value) return;

  let offsetHeight = modalRef.value.offsetHeight;
  let offsetWidth = modalRef.value.offsetWidth;
  let top = modalRef.value.offsetTop;
  let left = modalRef.value.offsetLeft;
  let winWidth = window.innerWidth;
  let winHeight = window.innerHeight;

  let newHeight = Math.min(offsetHeight, winHeight);
  let newWidth = Math.min(offsetWidth, winWidth);
  let newTop = Math.min(top, winHeight - offsetHeight);
  let newLeft = Math.min(left, winWidth - offsetWidth);

  if (props.type === 'window') {
    if (newHeight === winHeight) {
      newWidth = winWidth;
      newTop = 0;
      newLeft = 0;
    }
    if (newWidth === winWidth) {
      newHeight = winHeight;
      newTop = 0;
      newLeft = 0;
    }
  } else if (props.type === 'modal') {
    newTop = (winHeight - offsetHeight) / 4;
    if (newWidth === winWidth) {
      newWidth = newWidth - 20;
    } else {
      let minWidth = computePx(props.width);
      if (winWidth > newWidth && newWidth < minWidth && winWidth - minWidth > 0) {
        newWidth = props.width as any;
      }
    }
    newLeft = (winWidth - newWidth) / 2;
  }

  let pos = {
    width: newWidth + 'px',
    height: newHeight + 'px',
    top: newTop,
    left: newLeft,
    visibility: 'visible',
  };
  currPos.value = pos;
  emit('sizeChange', pos);
};

onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
});

watch(() => [modalRef.value, modalState.value, visible.value], () => {
  if (modalRef.value && modalState.value === 'win' && !inited.value && currPos.value.visibility === 'hidden') {
    let aheight = modalRef.value.offsetHeight;
    let winHeight = window.innerHeight;
    let npos = {
      width: computePx(props.width) + 'px',
      height: wheight ? wheight + 'px' : 'auto',
      top: aheight > winHeight ? 0 : (winHeight - aheight) / 3,
      left: (window.innerWidth - computePx(props.width)) / 2,
      visibility: 'visible',
      animationName: 'zoomIn'
    };
    Object.assign(winPos, npos);
    currPos.value = { ...npos };
    emit('sizeChange', npos);

    setTimeout(() => {
      inited.value = true;
    }, 1000);
  }
});

const focusHandler = (event: FocusEvent) => {
  event.preventDefault();
  if (props.type === 'window') {
    globalStore.addWindowZIndex();
    currIndex.value = globalStore.windowIndex;
  } else {
    globalStore.addModalZIndex();
    currIndex.value = globalStore.modalIndex;
  }
  topLevel.value = true;
};

const blurHandler = () => {
  topLevel.value = false;
};

const closeModal = () => {
  if (!modalRef.value) return;
  let css = modalRef.value.style;
  css.animationName = "zoomOut";

  setTimeout(() => {
    css.opacity = "0";
    css.display = "none";
    css.visibility = "hidden";
    css.animationName = "";
    visible.value = false;
    emit('update:open', false);
    emit('close');
  }, 300);
};

const onClickMaskHandler = () => {
  if (props.closeMask) {
    closeModal();
  }
};

const onClickMinHandler = () => {
  prevState.value = modalState.value;
  modalState.value = "min";
};

const onClickMaxHandler = () => {
  if (modalState.value === 'min' && prevState.value) {
    modalState.value = prevState.value;
  } else {
    if (modalState.value === "win") {
      modalState.value = "full";
    } else if (modalState.value === "min") {
      modalState.value = "win";
    } else if (modalState.value === 'full') {
      let pos = { ...winPos };
      delete pos.animationName;
      Object.assign(winPos, pos);
      modalState.value = 'win';
    }
  }
};

// Computed styles
const overlayStyle = computed(() => ({
  zIndex: topLevel.value 
    ? (props.type === 'window' ? globalStore.windowIndex : globalStore.modalIndex) 
    : (currIndex.value || props.zIndex || 1000),
}));

const modalContentStyle = computed(() => {
  let widthVal = currPos.value.width;
  if (typeof widthVal === 'number') widthVal = widthVal + 'px';
  let heightVal = currPos.value.height;
  if (typeof heightVal === 'number') heightVal = heightVal + 'px';
  let topVal = currPos.value.top;
  if (typeof topVal === 'number') topVal = topVal + 'px';
  let leftVal = currPos.value.left;
  if (typeof leftVal === 'number') leftVal = leftVal + 'px';

  return {
    ...currPos.value,
    width: widthVal,
    height: heightVal,
    top: topVal,
    left: leftVal,
    visibility: currPos.value.visibility || 'visible',
    background: themeStore.modalWallpaperEnabled && themeStore.wallpaperUrl
      ? `url('${themeStore.wallpaperUrl}') no-repeat center center / cover`
      : 'none',
  };
});

const modalInnerBgStyle = computed(() => ({
  width: '100%',
  height: '100%',
  backdropFilter: themeStore.modalBgBlur > 0 ? `blur(${themeStore.modalBgBlur}px)` : undefined,
  background: props.theme === 'dark'
    ? `rgba(0, 0, 0, ${themeStore.modalOpacity})`
    : `rgba(255, 255, 255, ${themeStore.modalOpacity})`,
}));

const innerContentStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: props.height && props.height !== 'auto' ? 'auto' : 'visible',
  boxSizing: 'border-box' as const
}));

const ctrlStyle = computed(() => ({
  right: modalState.value === 'full' ? '20px' : '6px',
  maxWidth: modalState.value === 'min' ? (typeof currPos.value.width === 'number' ? currPos.value.width + 'px' : currPos.value.width) : "auto",
  position: modalState.value === 'min' ? 'relative' as const : 'absolute' as const,
  top: modalState.value === 'min' ? '0px' : '6px',
  paddingLeft: '15px',
}));

const bodyStyle = computed(() => ({
  display: modalState.value === 'min' ? 'none' : 'block',
  height: props.height && props.height !== 'auto' ? '100%' : 'auto',
  overflow: props.height && props.height !== 'auto' ? 'auto' : 'visible',
  paddingTop: '0px' 
}));
</script>
