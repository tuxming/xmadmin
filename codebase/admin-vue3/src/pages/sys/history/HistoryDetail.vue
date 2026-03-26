<template>
  <Modal
    :open="visible"
    :title="t('日志详情')"
    :width="600"
    :show-mask="false"
    :offset-x="offsetX"
    :offset-y="offsetY"
    @close="onCloseModal"
  >
    <div style="padding: 10px 20px;">
      <t-skeleton v-if="loading" animation="flashed" />
      
      <t-descriptions v-else bordered :column="columnCount">
        <t-descriptions-item :label="t('操作人')">{{ detail?.username }}</t-descriptions-item>
        <t-descriptions-item :label="t('IP地址')">{{ detail?.ipAddr }}</t-descriptions-item>
        <t-descriptions-item :label="t('操作类型')">{{ detail?.type }}</t-descriptions-item>
        <t-descriptions-item :label="t('操作时间')">{{ detail?.created }}</t-descriptions-item>
        <t-descriptions-item :label="t('请求参数')" :span="columnCount">
          <span style="word-break: break-all;">
            {{ detail?.remark }}
          </span>
        </t-descriptions-item>
      </t-descriptions>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, inject } from 'vue';
import Modal from '@/components/Modal/index.vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { api } from '@/utils/api';
import { computePx } from '@/utils/kit';
import { AdminHistory } from '@/utils/I18NNamespace';

const props = defineProps<{
  historyId: number | string;
  open: boolean;
  offsetX?: number;
  offsetY?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminHistory);
const request = useRequest();
const showResult = useShowResult(AdminHistory);
const offsetX = computed(() => props.offsetX ?? 0);
const offsetY = computed(() => props.offsetY ?? 0);

const visible = ref(props.open);
const loading = ref(true);
const detail = ref<any>(null);

const modalPos = inject<any>('modalContext', null);

const columnCount = computed(() => {
  if (!modalPos?.value?.width) return 2;
  const w = computePx(modalPos.value.width);
  if (w > 500) return 2;
  return 1;
});

const getDetail = async () => {
  if (!props.historyId) return;
  
  loading.value = true;
  const result = await request.get(`${api.history.get}?historyId=${props.historyId}`);
  showResult.show(result);

  if (result.status) {
    detail.value = result.data;
    loading.value = false;
  }
};

onMounted(() => {
  if (props.open && props.historyId) {
    getDetail();
  }
});

watch(() => [props.open, props.historyId], ([newOpen, newId]) => {
  visible.value = newOpen as boolean;
  if (newOpen && newId) {
    getDetail();
  }
});

const onCloseModal = () => {
  visible.value = false;
  emit('update:open', false);
  setTimeout(() => {
    emit('close');
  }, 300);
};
</script>
