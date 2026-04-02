<template>
  <t-drawer
    class="skin-setting-drawer"
    v-model:visible="visible"
    :header="t('系统设置')"
    :footer="false"
    size="450px"
  >
    <t-tabs v-model="activeTab" placement="left" style="height: 100%;">
      <t-tab-panel value="theme" :label="t('主题')">
        <div class="setting-panel">
          <div class="setting-item">
            <div class="setting-title">{{ t('暗色模式') }}</div>
            <t-switch 
              :model-value="themeStore.theme === 'dark'"
              @update:model-value="(val: boolean) => themeStore.setTheme(val ? 'dark' : 'light')"
            >
              <template #label="slotProps">
                <t-icon :name="slotProps.value ? 'moon' : 'sunny'" />
              </template>
            </t-switch>
          </div>
          
          <div class="setting-item">
            <div class="setting-title">{{ t('主颜色') }}</div>
            <div class="color-picker-wrap">
              <span 
                v-for="c in colors" 
                :key="c"
                class="color-block"
                :style="{ background: c }"
                @click="themeStore.setPrimaryColor(c)"
              >
                <t-icon v-if="themeStore.primaryColor === c" name="check" class="color-check" />
              </span>
              <t-color-picker-panel
                style="margin-top: 10px;"
                :value="themeStore.primaryColor"
                @change="(val: string) => themeStore.setPrimaryColor(val)"
              />
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-title">{{ t('组件圆角') }}</div>
            <t-slider 
              :value="themeStore.borderRadius" 
              :min="0" 
              :max="40" 
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.setBorderRadius(val as number)" 
            />
          </div>

          <div class="setting-item">
            <div class="setting-title">{{ t('只显示图标') }}</div>
            <t-switch 
              :model-value="themeStore.onlyIcon"
              @update:model-value="(val: boolean) => themeStore.setOnlyIcon(val as boolean)"
            />
          </div>

          <div class="setting-item">
            <div class="setting-title">{{ t('组件尺寸') }}</div>
            <t-radio-group 
              :value="themeStore.componentSize" 
              @change="(val: any) => themeStore.setComponentSize(val as string)"
            >
              <t-radio-button value="small">{{ t('小') }}</t-radio-button>
              <t-radio-button value="medium">{{ t('中') }}</t-radio-button>
              <t-radio-button value="large">{{ t('大') }}</t-radio-button>
            </t-radio-group>
          </div>

          <div class="setting-actions">
            <t-button block theme="primary" variant="outline" @click="themeStore.resetTheme">
              <template #icon><t-icon name="refresh" /></template>
              {{ t('重置') }}
            </t-button>
          </div>
        </div>
      </t-tab-panel>
      
      <t-tab-panel value="background" :label="t('背景')">
        <div class="setting-panel bg-panel">
          <div class="setting-group">
            <div class="group-title">{{ t('主题模式') }}</div>
            <div class="setting-item">
              <div class="setting-title">{{ t('暗色模式') }}</div>
              <t-switch 
                :model-value="themeStore.theme === 'dark'"
                @update:model-value="(val: boolean) => themeStore.setTheme(val ? 'dark' : 'light')"
              >
                <template #label="slotProps">
                  <t-icon :name="slotProps.value ? 'moon' : 'sunny'" />
                </template>
              </t-switch>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-title">{{ t('壁纸') }}</div>
            <div style="margin-top: 8px; position: relative;">
              <img :src="themeStore.wallpaperUrl || ''" style="width: 100%; height: 140px; object-fit: cover;" />
              <t-button style="position: absolute; bottom: 10px; left: 10px;" @click="showWallpaper = true">更换壁纸</t-button>
              <t-button theme="danger" variant="outline" style="position: absolute; bottom: 10px; right: 10px;" @click="themeStore.setWallpaperUrl(null)">清除</t-button>
            </div>
          </div>

          <div class="setting-group">
            <div class="group-title">{{ t('背景') }}</div>
          <div class="setting-item">
            <div class="setting-title">{{ t('背景透明度') }}</div>
            <t-slider 
              :value="themeStore.bgOpacity" 
              :min="0" 
              :max="1" 
              :step="0.1"
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.setBgOpacity(val as number)" 
            />
          </div>

          <div class="setting-item">
            <div class="setting-title">{{ t('容器背景透明度') }}</div>
            <t-slider 
              :value="themeStore.containerOpacity" 
              :min="0" 
              :max="1" 
              :step="0.1"
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.setContainerOpacity(val as number)" 
            />
          </div>
          <div class="setting-item">
            <div class="setting-title">{{ t('背景模糊') }}</div>
            <t-slider 
              :value="themeStore.bgBlur" 
              :min="0" 
              :max="100" 
              :step="1"
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.setBgBlur(val as number)" 
            />
          </div>
          </div>

          <div class="setting-group">
            <div class="group-title">{{ t('侧边栏') }}</div>
            <div>
              <div class="setting-item">
                <div class="setting-title">{{ t('暗色侧边栏') }}</div>
                <t-switch 
                  :model-value="themeStore.sideTheme === 'dark'"
                  @update:model-value="(val: boolean) => themeStore.setSideTheme(val ? 'dark' : 'light')"
                >
                  <template #label="slotProps">
                    <t-icon :name="slotProps.value ? 'moon' : 'sunny'" />
                  </template>
                </t-switch>
              </div>
              <div class="setting-item">
                <div class="setting-title">{{ t('侧边栏宽度') }}</div>
                <t-slider 
                  :value="themeStore.sideWidth" 
                  :min="150" 
                  :max="800" 
                  :step="10"
                  :input-number-props="{ theme: 'column' }"
                  @change="(val: any) => themeStore.setSideWidth(val as number)" 
                />
              </div>
            </div>

          <div class="setting-item">
            <div class="setting-title">{{ t('侧边菜单项透明度') }}</div>
            <t-slider 
              :value="themeStore.sideItemOpacity" 
              :min="0" 
              :max="1" 
              :step="0.1"
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.setSideItemOpacity(val as number)" 
            />
          </div>
          <div class="setting-item">
            <div class="setting-title">{{ t('侧边菜单选中透明度') }}</div>
            <t-slider 
              :value="themeStore.sideItemSelectOpacity" 
              :min="0" 
              :max="1" 
              :step="0.1"
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.setSideItemSelectOpacity(val as number)" 
            />
          </div>
          </div>

          <div class="setting-group">
            <div class="group-title">{{ t('弹窗') }}</div>
          <div class="setting-item">
            <div class="setting-title">{{ t('弹窗应用壁纸') }}</div>
            <t-switch 
              :model-value="themeStore.modalWallpaperEnabled"
              @update:model-value="(val: boolean) => themeStore.modalWallpaperEnabled = val"
            />
          </div>

          <div>
          <div class="setting-item">
            <div class="setting-title">{{ t('弹窗背景透明度') }}</div>
            <t-slider 
              :value="themeStore.modalOpacity" 
              :min="0" 
              :max="1" 
              :step="0.1"
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.modalOpacity = (val as number)" 
            />
          </div>

          <div class="setting-item">
            <div class="setting-title">{{ t('弹窗背景模糊') }}</div>
            <t-slider 
              :value="themeStore.modalBgBlur" 
              :min="0" 
              :max="100" 
              :step="1"
              :input-number-props="{ theme: 'column' }"
              @change="(val: any) => themeStore.modalBgBlur = (val as number)" 
            />
          </div>
          </div>
          </div>
        </div>
      </t-tab-panel>
    </t-tabs>
    <div class="global-actions">
      <t-button theme="primary" variant="outline" @click="() => { themeStore.resetTheme(); themeStore.resetSidebar(); }">
        <template #icon><t-icon name="refresh" /></template>
        {{ t('重置') }}
      </t-button>
    </div>
  </t-drawer>

  <!-- 壁纸选择器（设置内弹窗） -->
  <t-dialog v-model:visible="showWallpaper" :header="t('选择壁纸')" :footer="false" width="800px">
    <div style="display: flex; gap: 16px;">
      <div style="width: 220px; flex-shrink: 0;">
        <t-menu :value="currWallpaperCat" @change="onSelectWallpaperCat">
          <t-menu-item v-for="c in wallpaperCats" :key="c.value" :value="c.value">{{ c.label }}</t-menu-item>
        </t-menu>
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div v-for="img in wallpaperList" :key="img.url" style="border-radius: 8px; overflow: hidden; cursor: pointer; position: relative;"
               @click="applyWallpaper(img.url)">
            <img :src="img.url_thumb || img.url" style="width: 100%; height: 120px; object-fit: cover;" />
          </div>
        </div>
        <div style="margin-top: 12px; text-align: center;">
          <t-button variant="text" @click="start += pageCount; fetchWallpaperList(currWallpaperCat, false)">加载更多</t-button>
        </div>
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminSkinSetting } from '@/utils/I18NNamespace';
import { api } from '@/utils/api';
import { useRequest } from '@/hooks/useRequest';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const themeStore = useThemeStore();
const { t } = useTranslation(AdminSkinSetting);
const request = useRequest();

const activeTab = ref('theme');
const showWallpaper = ref(false);

const colors = [
  '#e54d42', '#ff7d00', '#ed7b2f', '#d9a01c', '#e3c424', '#87c02f', '#2ba471', '#00a870', '#1677ff', '#0052d9', '#722ed1', '#d54941'
];

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 壁纸数据
const wallpaperCats = ref<Array<{label: string, value: string}>>([]);
const wallpaperList = ref<Array<{url: string; url_thumb?: string}>>([]);
const currWallpaperCat = ref<string>('');

const fetchWallpaperCats = async () => {
  try {
    const res: any = await request.get(api.wallpaper.wallpaperAllCategories);
    if (res && (res.errno === '0' || res.status)) {
      const list = res.data || [];
      wallpaperCats.value = list.map((c: any) => ({
        label: c?.name || c?.label || String(c),
        value: c?.id || c?.value || String(c)
      }));
      if (wallpaperCats.value.length > 0) {
        currWallpaperCat.value = wallpaperCats.value[0].value;
        start.value = 0;
        await fetchWallpaperList(currWallpaperCat.value, true);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const start = ref<number>(0);
const pageCount = 20;

const fetchWallpaperList = async (catId: string, reset = false) => {
  try {
    const url = `${api.wallpaper.wallpaperImageList}?id=${encodeURIComponent(catId)}&start=${start.value}&count=${pageCount}`;
    const res: any = await request.get(url);
    if (res && (res.errno === '0' || res.status)) {
      const data = res.data || [];
      const mapped = data.map((i: any) => ({
        url: i.url,
        url_thumb: i.url_thumb
      })).filter((x: any) => !!x.url);
      wallpaperList.value = reset ? mapped : [...wallpaperList.value, ...mapped];
    }
  } catch (e) {
    console.error(e);
  }
};

const onSelectWallpaperCat = async (val: string) => {
  currWallpaperCat.value = val;
  start.value = 0;
  await fetchWallpaperList(val, true);
};

const applyWallpaper = (url: string) => {
  themeStore.setWallpaperUrl(url);
  showWallpaper.value = false;
};

watch(showWallpaper, async (val) => {
  if (!val) return;
  if (wallpaperCats.value.length > 0) return;
  start.value = 0;
  wallpaperList.value = [];
  currWallpaperCat.value = '';
  await fetchWallpaperCats();
});
</script>

<style scoped>
.setting-panel {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}
.bg-panel {
  padding: 12px;
}
.setting-item {
  margin-bottom: 24px;
}
.bg-panel .setting-item {
  margin-bottom: 12px;
}
.setting-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
}
.bg-panel .setting-title {
  font-size: 13px;
  margin-bottom: 8px;
}
.color-picker-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.color-block {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.color-check {
  font-size: 14px;
}
.setting-actions {
  margin-top: 32px;
  text-align: center;
}
.setting-group {
  margin-bottom: 12px;
}
.group-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--td-text-color-secondary);
  margin: 4px 0 8px;
}
.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.global-actions {
  padding: 8px 16px;
  border-top: 1px solid var(--td-component-border);
}
</style>
