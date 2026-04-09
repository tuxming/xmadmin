<template>
    <div class="qc" @keyup.enter="doQuery">
        <table class="qc-table">
            <colgroup>
                <col v-for="n in colCount" :key="`col-${n}`"
                    :style="(n === colCount && colCount > 1) ? 'width: 300px;' : ''" />
            </colgroup>
            <tbody v-if="colCount === 1">
                <tr v-if="isQueryBasic">
                    <td>
                        <div class="qc-basic-row">
                            <div class="qc-basic-input">
                                <t-input v-model="values.basicValue" clearable :placeholder="basicPlaceholder">
                                    <template #prefix-icon><t-icon name="search" /></template>
                                </t-input>
                            </div>
                            <div class="qc-basic-actions">
                                <t-space :size="8" align="center">
                                    <t-button theme="primary" @click="doQuery">
                                        <template #icon><t-icon name="search" /></template>
                                        搜索
                                    </t-button>
                                    <t-button theme="primary" variant="outline" @click="resetForm">
                                        <template #icon><t-icon name="refresh" /></template>
                                        重置
                                    </t-button>
                                    <t-button v-if="hasAdvanced" theme="default" variant="text" @click="toggleMode">
                                        {{ isQueryBasic ? '高级' : '基础' }}
                                        <template #icon>
                                            <t-icon name="chevron-left-double"
                                                :style="{ transform: `rotate(${isQueryBasic ? '-90deg' : '90deg'})` }" />
                                        </template>
                                    </t-button>
                                </t-space>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr v-else v-for="(row, ridx) in tableRows" :key="ridx">
                    <template v-for="(cell, cidx) in row" :key="`${ridx}-${cidx}`">
                        <td v-if="cell.type === 'empty'" :colspan="cell.colspan" />
                        <td v-else-if="cell.type === 'item'" :colspan="cell.colspan">
                            <div class="qc-item">
                                <div class="qc-label">{{ cell.label }}</div>
                                <div class="qc-control">
                                    <component :is="cell.component" v-model="values[cell.name]"
                                        v-bind="getProps(cell)" />
                                </div>
                            </div>
                        </td>
                        <td v-else class="qc-td-actions">
                            <t-space :size="8" align="center">
                                <t-button theme="primary" @click="doQuery">
                                    <template #icon><t-icon name="search" /></template>
                                    搜索
                                </t-button>
                                <t-button theme="primary" variant="outline" @click="resetForm">
                                    <template #icon><t-icon name="refresh" /></template>
                                    重置
                                </t-button>
                                <t-button v-if="hasAdvanced" theme="default" variant="text" @click="toggleMode">
                                    {{ isQueryBasic ? '高级' : '基础' }}
                                    <template #icon>
                                        <t-icon name="chevron-left-double"
                                            :style="{ transform: `rotate(${isQueryBasic ? '-90deg' : '90deg'})` }" />
                                    </template>
                                </t-button>
                            </t-space>
                        </td>
                    </template>
                </tr>
            </tbody>
            <tbody v-else>
                <tr v-if="isQueryBasic">
                    <td :colspan="colCount">
                        <div class="qc-basic-row">
                            <div class="qc-basic-input">
                                <t-input v-model="values.basicValue" clearable :placeholder="basicPlaceholder">
                                    <template #prefix-icon><t-icon name="search" /></template>
                                </t-input>
                            </div>
                            <div class="qc-basic-actions">
                                <t-space :size="8" align="center">
                                    <t-button theme="primary" @click="doQuery">
                                        <template #icon><t-icon name="search" /></template>
                                        搜索
                                    </t-button>
                                    <t-button theme="primary" variant="outline" @click="resetForm">
                                        <template #icon><t-icon name="refresh" /></template>
                                        重置
                                    </t-button>
                                    <t-button v-if="hasAdvanced" theme="default" variant="text" @click="toggleMode">
                                        {{ isQueryBasic ? '高级' : '基础' }}
                                        <template #icon>
                                            <t-icon name="chevron-left-double"
                                                :style="{ transform: `rotate(${isQueryBasic ? '-90deg' : '90deg'})` }" />
                                        </template>
                                    </t-button>
                                </t-space>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr v-else v-for="(row, ridx) in tableRows" :key="ridx">
                    <template v-for="(cell, cidx) in row" :key="`${ridx}-${cidx}`">
                        <td v-if="cell.type === 'empty'" :colspan="cell.colspan" />
                        <td v-else-if="cell.type === 'item'" :colspan="cell.colspan">
                            <div class="qc-item">
                                <div class="qc-label">{{ cell.label }}</div>
                                <div class="qc-control">
                                    <component :is="cell.component" v-model="values[cell.name]"
                                        v-bind="getProps(cell)" />
                                </div>
                            </div>
                        </td>
                        <td v-else class="qc-td-actions">
                            <t-space :size="8" align="center">
                                <t-button theme="primary" @click="doQuery">
                                    <template #icon><t-icon name="search" /></template>
                                    搜索
                                </t-button>
                                <t-button theme="primary" variant="outline" @click="resetForm">
                                    <template #icon><t-icon name="refresh" /></template>
                                    重置
                                </t-button>
                                <t-button v-if="hasAdvanced" theme="default" variant="text" @click="toggleMode">
                                    {{ isQueryBasic ? '高级' : '基础' }}
                                    <template #icon>
                                        <t-icon name="chevron-left-double"
                                            :style="{ transform: `rotate(${isQueryBasic ? '-90deg' : '90deg'})` }" />
                                    </template>
                                </t-button>
                            </t-space>
                        </td>
                    </template>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

type QueryItem = {
    name: string;
    label: string;
    component: any;
    props?: Record<string, any>;
    value?: any;
    width?: number | string;
};

const props = withDefaults(defineProps<{
    items?: QueryItem[];
    basicPlaceholder?: string;
}>(), {
    items: () => [],
    basicPlaceholder: '输入关键字搜索用户',
});

const emit = defineEmits<{
    (e: 'query', values: any): void;
}>();

const isQueryBasic = ref(true);
const hasAdvanced = computed(() => props.items.length > 0);

const values = reactive<Record<string, any>>({
    basicValue: '',
});

const initialValues = ref<Record<string, any>>({
    basicValue: '',
});

watch(
    () => props.items,
    (items) => {
        const nextInit: Record<string, any> = { basicValue: initialValues.value.basicValue ?? '' };
        items.forEach((it) => {
            const isDateRange = it.component === 't-date-range-picker' ||
                (typeof it.component === 'string' && it.component.includes('range'));
            const defaultVal = isDateRange ? [] : '';

            nextInit[it.name] = it.value ?? nextInit[it.name] ?? defaultVal;
            if (values[it.name] === undefined) {
                values[it.name] = it.value ?? defaultVal;
            }
        });
        initialValues.value = nextInit;
    },
    { immediate: true },
);

const isEmpty = (val: any) => {
    if (val === undefined || val === null) return true;
    if (typeof val === 'string') return val.trim() === '';
    if (Array.isArray(val)) return val.length === 0;
    return false;
};

const doQuery = () => {
    const param: Record<string, any> = {};

    if (isQueryBasic.value) {
        param.basicValue = isEmpty(values.basicValue) ? undefined : values.basicValue;
        props.items.forEach(it => {
            param[it.name] = undefined;
        });
    } else {
        param.basicValue = undefined;
        Object.keys(values).forEach((k) => {
            if (k === 'basicValue') return;
            const v = values[k];
            param[k] = isEmpty(v) ? undefined : v;
        });
    }

    // 对于高级模式中未填写的字段，也补充 undefined 确保旧查询条件被清除
    props.items.forEach(it => {
        if (!(it.name in param)) {
            param[it.name] = undefined;
        }
    });

    // Ensure the emitted object always contains explicitly undefined keys for empty fields
    // so that `{ ...oldQuery, ...param }` overrides old values.
    emit('query', param);
};

const resetForm = () => {
    Object.keys(initialValues.value).forEach((k) => {
        values[k] = initialValues.value[k];
    });
    values.basicValue = '';
    // 移除 emit('query', {}) 确保重置只是清空表单，而不触发网络请求
};

const toggleMode = () => {
    isQueryBasic.value = !isQueryBasic.value;
};

const getProps = (item: QueryItem) => {
    const p = item.props || {};
    const style = typeof p.style === 'object' && p.style ? { ...p.style, width: '100%' } : { width: '100%' };
    return { ...p, style };
};

const width = ref(window.innerWidth);
const onResize = () => { width.value = window.innerWidth; };
onMounted(() => { window.addEventListener('resize', onResize); });
onUnmounted(() => { window.removeEventListener('resize', onResize); });

// 把屏宽映射到列数（1~6）
const colCount = computed(() => {
    const w = width.value;
    if (w <= 640) return 1;
    if (w <= 900) return 2;
    if (w <= 1200) return 3;
    if (w <= 1400) return 4;
    if (w <= 1600) return 5;
    return 6;
});

type TableCell =
    | { type: 'empty'; colspan: number }
    | { type: 'actions'; colspan: 1 }
    | { type: 'item'; name: string; label: string; component: any; props?: Record<string, any>; colspan: number };

const getAdvSpan = (it: any, cols: number) => {
    const isDate = it.name === 'created';
    if (!isDate) return 1;
    if (cols <= 2) return cols;
    return 2;
};

const tableRows = computed(() => {
    const cols = colCount.value;
    if (cols <= 0) return [];
    const rows: TableCell[][] = [];
    let row: TableCell[] = [];
    let used = 0;

    const pushRow = () => {
        rows.push(row);
        row = [];
        used = 0;
    };

    const fillEmpty = (count: number) => {
        if (count <= 0) return;
        row.push({ type: 'empty', colspan: count });
        used += count;
    };

    props.items.forEach((it) => {
        const span = Math.min(cols, getAdvSpan(it, cols));
        if (span === cols) {
            if (used > 0) {
                fillEmpty(cols - used);
                pushRow();
            }
            row.push({ type: 'item', name: it.name, label: it.label, component: it.component, props: it.props, colspan: cols });
            pushRow();
            return;
        }

        if (used + span > cols) {
            fillEmpty(cols - used);
            pushRow();
        }

        row.push({ type: 'item', name: it.name, label: it.label, component: it.component, props: it.props, colspan: span });
        used += span;

        if (used === cols) {
            pushRow();
        }
    });

    if (used === 0 && row.length === 0) {
        row = [{ type: 'empty', colspan: cols }];
        used = cols;
    }

    if (used > 0 && used < cols) {
        const filler = cols - 1 - used;
        fillEmpty(filler);
        row.push({ type: 'actions', colspan: 1 });
        used += 1;
        pushRow();
    } else if (used === cols) {
        pushRow();
        row.push({ type: 'empty', colspan: cols - 1 });
        row.push({ type: 'actions', colspan: 1 });
        pushRow();
    } else if (used === 0) {
        row = [{ type: 'empty', colspan: cols - 1 }, { type: 'actions', colspan: 1 }];
        pushRow();
    }

    return rows;
});
</script>

<style scoped>
.qc {
    width: 100%;
}

.qc-item {
    display: grid;
    grid-template-columns: 70px 1fr;
    column-gap: 8px;
    align-items: center;
    min-height: 32px;
}

.qc-label {
    white-space: nowrap;
    text-align: right;
    width: 70px;
}

.qc-control {
    min-width: 0;
}

.qc-actions {
    justify-self: end;
    text-align: right;
}

.qc-basic {
    padding: 8px 12px;
}

.qc-basic {
    display: flex;
    align-items: center;
    min-height: 32px;
}

.qc-basic-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.qc-basic-input {
    flex: 0 0 60%;
    min-width: 0;
}

.qc-basic-actions {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    min-width: 0;
}

.qc-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
}

.qc-table td {
    vertical-align: middle;
}

.qc-td-actions {
    text-align: right;
    white-space: nowrap;
}
</style>
