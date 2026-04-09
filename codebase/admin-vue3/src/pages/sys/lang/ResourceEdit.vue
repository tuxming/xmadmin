<template>
    <Modal :open="visible" :title="t('编辑语言资源')" :width="500" :height="500" :show-mask="false"
        @close="onModalClose(false)">
        <div style="width: 100%">
            <div style="padding: 0px 20px 10px 20px; margin: 0px auto">
                <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ t('编辑语言资源') }}</h4>

                <t-form ref="formRef" :data="formData" layout="horizontal" :rules="rules" @submit="onFinish"
                    label-align="left" :label-width="80">
                    <t-form-item name="resKey" :label="t('KEY')">
                        <t-input v-model="formData.resKey" :disabled="!!resource"></t-input>
                    </t-form-item>

                    <t-form-item v-if="!resource" name="category" :label="t('分组')">
                        <t-auto-complete v-model="formData.category" :options="groupOptions" @change="onSearchGroups" />
                    </t-form-item>

                    <template v-for="(val, index) in formData.resValues" :key="index">
                        <t-form-item :label="langs[index].code">
                            <t-textarea v-model="val.resValue" :rows="2" :maxlength="255"></t-textarea>
                        </t-form-item>
                    </template>
                </t-form>

                <t-divider />

                <div style="text-align: right">
                    <t-space>
                        <t-button variant="outline" @click="onModalClose(false)">
                            <template #icon><t-icon name="close" /></template>
                            {{ t('取消') }}
                        </t-button>
                        <t-button theme="primary" @click="onSubmit">
                            <template #icon><t-icon name="send" /></template>
                            {{ t('确定') }}
                        </t-button>
                    </t-space>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import Modal from '@/components/Modal/index.vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { AdminLang } from '@/utils/I18NNamespace';
import { api } from '@/utils/api';
import type { SubmitContext } from 'tdesign-vue-next';

interface ResourceEditType {
    resource?: any;
    groups?: any[];
    langs: any[];
    open: boolean;
}

const props = defineProps<ResourceEditType>();

const emit = defineEmits<{
    (e: 'close', refresh: boolean): void;
    (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminLang);
const request = useRequest();
const showResult = useShowResult(AdminLang);

const visible = ref(props.open);
const formRef = ref<any>(null);

const formData = reactive({
    resKey: '',
    category: '',
    resValues: [] as any[]
});

const rules = {
    resKey: [{ required: true, message: t('KEY不能为空') }],
    category: [{ required: true, message: t('分组不能为空') }]
};

const allGroupOptions = computed(() => {
    return (props.groups || []).map(g => ({
        label: g,
        value: g
    }));
});

const groupOptions = ref(allGroupOptions.value);

const onSearchGroups = (text: string) => {
    if (!text || /\s+/.test(text)) {
        groupOptions.value = allGroupOptions.value;
        return;
    }

    groupOptions.value = allGroupOptions.value.filter(g =>
        g.label.toLowerCase().includes(text.toLowerCase())
    );
};

const getResesAndBuildFormData = async () => {
    const result = await request.get(`${api.lang.resourceByKey}?id=${encodeURIComponent(props.resource.id)}`);
    if (result.status) {
        const reses = result.data;

        formData.resKey = props.resource.resKey;
        formData.category = props.resource.category;
        formData.resValues = [];

        props.langs.forEach(lang => {
            const res = reses.find((s: any) => s.languageId === lang.id);
            if (res) {
                formData.resValues.push({
                    id: res.id,
                    resValue: res.resValue,
                    languageId: lang.id,
                });
            } else {
                formData.resValues.push({
                    id: null,
                    resValue: '',
                    languageId: lang.id,
                });
            }
        });
    }
};

onMounted(() => {
    if (props.open && props.langs) {
        if (props.resource) {
            getResesAndBuildFormData();
        } else {
            formData.resKey = '';
            formData.category = '';
            formData.resValues = [];

            props.langs.forEach(lang => {
                formData.resValues.push({
                    id: null,
                    resValue: '',
                    languageId: lang.id,
                });
            });
        }
    }
});

watch(() => props.open, (val) => {
    visible.value = val;
});

const onModalClose = (refresh: boolean) => {
    visible.value = false;
    emit('update:open', false);
    setTimeout(() => {
        emit('close', refresh);
    }, 300);
};

const onSubmit = () => {
    formRef.value.submit();
};

const onFinish = async ({ validateResult }: SubmitContext) => {
    if (validateResult === true) {
        const data = formData.resValues.map(v => ({
            ...v,
            resKey: formData.resKey,
            category: formData.category
        }));

        const result = await request.post(api.lang.updateRes, data);
        showResult.show(result);

        if (result.status) {
            onModalClose(true);
        }
    }
};
</script>
