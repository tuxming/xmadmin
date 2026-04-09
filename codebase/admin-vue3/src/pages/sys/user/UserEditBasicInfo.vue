<template>
    <div>
        <t-space align="center" style="margin-bottom: 20px;">
            <h5 style="margin: 0">{{ t('基本信息') }}</h5>
        </t-space>

        <t-row :gutter="24" style="margin-bottom: 15px;" justify="center">
            <t-col>
                <t-upload v-model="photoValue" theme="image" accept="image/*" :action="uploadAction"
                    :with-credentials="true" :format-response="formatUploadResponse" :max="1" />
            </t-col>
            <t-col style="padding-left: 30px;">
                <p>
                    <b>{{ t('ID') }}：</b> {{ user.id }}
                    <span style="margin-left: 35px;"><b>{{ t('推广码') }}：</b> {{ user.code }}</span>
                </p>
                <p><b>{{ t('用户名') }}：</b> {{ user.username }}</p>
                <p><b>{{ t('注册时间') }}：</b> {{ user.created }}</p>
            </t-col>
        </t-row>

        <t-descriptions bordered :column="columnCount" class="user-basic-info">
            <t-descriptions-item :label="t('姓名')">
                <EditableTextItem :value="user.fullname" copyable @change="(val) => onHandleChange('fullname', val)" />
            </t-descriptions-item>

            <t-descriptions-item :label="t('性别')">
                <EditableTagItem :value="user.gender" :options="genders" copyable="CopyLabel" :width="60"
                    @change="(val) => onHandleChange('gender', val)" />
            </t-descriptions-item>

            <t-descriptions-item :label="t('状态')" :span="columnCount === 1 ? 1 : (columnCount === 3 ? 1 : 2)">
                <EditableTagItem :value="user.status" :options="userStatus" copyable="CopyLabel" :width="80"
                    @change="(val) => onHandleChange('status', val)" />
            </t-descriptions-item>

            <t-descriptions-item :label="t('所在组织')" :span="columnCount === 1 ? 1 : (columnCount === 3 ? 3 : 2)">
                <EditableDeptItem :value="user.deptId" :dept-name="user.deptName" :dept-path="user.deptPath"
                    :dept-path-name="user.deptPathName" copyable="CopyAll"
                    @change="(val, obj) => onHandleChange('deptId', obj)" />
            </t-descriptions-item>
        </t-descriptions>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useDict } from '@/hooks/useDict';
import { api } from '@/utils/api';
import EditableTextItem from '@/components/EditableTextItem.vue';
import EditableTagItem from '@/components/EditableTagItem.vue';
import EditableDeptItem from '../dept/EditableDeptItem.vue';
import { computePx } from '@/utils/kit';
import { AdminUser } from '@/utils/I18NNamespace';

const props = defineProps<{
    user: any;
    modalPos: any;
    vertical?: boolean;
}>();

const emit = defineEmits<{
    (e: 'handleChange', key: string, value: any): void;
    (e: 'updateUser', updateUser: any, key: string): void;
}>();

const { t } = useTranslation(AdminUser);
const userStatus = useDict('UserStatus');
const genders = useDict('Gender');

const uploadUrl = api.document.upload;
const photoValue = ref<any[]>([]);

const buildPhotoUrl = (photo: any) => {
    if (photo === undefined || photo === null || photo === '' || photo === 0) return '';
    const s = String(photo);
    if (/^\d+$/.test(s)) return `${api.document.img}?id=${s}`;
    return s;
};
const uploadType = 'photo';
const uploadPress = 1;
const uploadAction = computed(() => `${uploadUrl}?type=${encodeURIComponent(uploadType)}&press=${uploadPress}`);

onMounted(() => {
    if (props.user.photo) {
        photoValue.value = [{ url: buildPhotoUrl(props.user.photo) }];
    }
});

const formatUploadResponse = (response: any) => {
    console.log("response", response);
    if (response?.error) {
        return { error: String(response.error), status: 'fail' };
    }

    if (!response.status) {
        return { error: String(response.error), status: 'fail' };
    }

    const pid = response?.data;
    const previewUrl = `${api.document.img}?id=${pid}`;
    emit('handleChange', 'photo', pid);

    return { status: 'success', url: previewUrl, id: pid };
};

const columnCount = computed(() => {
    if (props.vertical) return 1;
    if (!props.modalPos?.width) return 3;
    const w = computePx(props.modalPos.width);
    if (w > 768) return 3;
    if (w > 500) return 2;
    return 1;
});

const onHandleChange = (key: string, value: any) => {
    emit('handleChange', key, value);
};
</script>
