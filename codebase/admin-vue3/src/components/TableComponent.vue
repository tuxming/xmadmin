<template>
    <div class="xm-table-wrap" ref="tableWrapRef">
        <t-table ref="tableRef" :data="data" :columns="tdColumns" :row-key="rowKey" :loading="loading"
            :pagination="pagination" :selected-row-keys="selectedRowKeys" :height="tableHeight"
            :filter-value="filterValue" :filter-row="null" :sort="tdSort" :show-sort-column-bg-color="true"
            :stripe="true" :size="themeStore.componentSize" :scroll="{ type: 'virtual', rowHeight: 48, bufferSize: 20 }"
            :resizable="true" bordered class="full-height-table" @page-change="onPageChange"
            @select-change="onSelectChange" @sort-change="onSortChange" @filter-change="onFilterChange">
            <template #topContent>
                <div v-if="filterSummaryText" class="table-filter-summary">
                    <span>搜索“{{ filterSummaryText }}”，找到 {{ data.length }} 条结果</span>
                    <t-button variant="text" size="small" @click="onClearFilters">清空筛选</t-button>
                </div>
            </template>
            <template v-for="col in renderColumns" :key="col.key" #[col.key]="{ row, rowIndex }">
                <component v-if="col.render" :is="col.render(row[col.key], row, rowIndex)" />
                <span v-else>{{ row[col.key] }}</span>
            </template>
        </t-table>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, defineComponent, h, resolveComponent } from 'vue';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import type { PrimaryTableCol } from 'tdesign-vue-next';
import { DateRangePickerPanel } from 'tdesign-vue-next';
import { useDict } from '@/hooks/useDict';
import { DefaultNS } from '@/utils/I18NNamespace';
import { useThemeStore } from '@/store';

interface TableColumnType {
    title: string;
    key: string;
    sort?: boolean;
    filter?: 'single' | 'multiple' | 'input' | 'number' | 'datepicker' | 'select';
    filterOptions?: string | Array<{ label: string; value?: any; checkAll?: boolean }>;
    filterPlaceholder?: string;
    render?: (text: any, record: any, index: number) => any;
    ellipsis?: boolean;
    width?: number | string;
    align?: 'left' | 'right' | 'center';
    fixed?: 'left' | 'right';
}

interface Props {
    columns: TableColumnType[];
    pageSize: number;
    query: any;
    apiUrl: string;
    onSelect: (rows: any[]) => void;
    width?: number | string;
    height?: number | string;
    refresh?: { reset: boolean; tag: any };
    selectType?: 'checkbox' | 'radio';
    initLoad?: boolean;
    onDataLoaded?: (data: any[]) => void;
    rowKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
    initLoad: true,
    selectType: 'checkbox',
    rowKey: 'id'
});

const request = useRequest();
const showResult = useShowResult(DefaultNS);
const themeStore = useThemeStore();

const baseData = ref<any[]>([]);
const data = ref<any[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<any[]>([]);
const tableWrapRef = ref<HTMLElement | null>(null);

const pagination = ref({
    current: 1,
    pageSize: props.pageSize,
    total: 0,
    pageSizeOptions: [10, 20, 50, 100, 200, 500],
    showJumper: true
});

const dictCache = new Map<string, any>();
const getDictOptions = (key: string) => {
    if (!dictCache.has(key)) {
        dictCache.set(key, useDict(key));
    }
    return dictCache.get(key);
};

const FilterOpPanel = defineComponent({
    name: 'FilterOpPanel',
    props: {
        value: { type: Object as any, default: () => ({ op: 'contains', value: '' }) },
        onChange: { type: Function as any, default: undefined },
        placeholder: { type: String, default: '输入关键词过滤' },
        mode: { type: String as any, default: 'input' },
    },
    setup(props) {
        const op = ref((props.value as any)?.op ?? 'contains');
        const text = ref((props.value as any)?.value ?? '');

        watch(
            () => props.value,
            (v: any) => {
                op.value = v?.op ?? 'contains';
                text.value = v?.value ?? '';
            },
            { deep: true },
        );

        const emitChange = () => {
            (props.onChange as any)?.({ op: op.value, value: text.value });
        };

        return () => {
            const TRadioGroup = resolveComponent('t-radio-group');
            const TRadioButton = resolveComponent('t-radio-button');
            const TInput = resolveComponent('t-input');
            const ops = props.mode === 'number' ? ['>', '<', '=', '>=', '<=', 'contains'] : ['contains'];
            const labels: Record<string, string> = {
                contains: '包含',
                '>': '>',
                '<': '<',
                '=': '=',
                '>=': '>=',
                '<=': '<=',
            };
            return h(
                'div',
                { style: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '4px 2px' } },
                [
                    h(
                        TRadioGroup as any,
                        {
                            modelValue: op.value,
                            'onUpdate:modelValue': (v: any) => {
                                op.value = v;
                                emitChange();
                            },
                            variant: 'default-filled',
                            size: 'small',
                            style: { display: 'flex' }
                        },
                        () =>
                            ops.map((k) =>
                                h(TRadioButton as any, { value: k }, () => labels[k] ?? k),
                            ),
                    ),
                    h(TInput as any, {
                        modelValue: text.value,
                        'onUpdate:modelValue': (v: any) => {
                            text.value = v;
                        },
                        clearable: true,
                        placeholder: props.placeholder,
                        style: { width: '100%' },
                        onEnter: emitChange,
                        onBlur: emitChange,
                    }),
                ],
            );
        };
    },
});

// Transform columns for TDesign
const tdColumns = computed<PrimaryTableCol[]>(() => {
    const cols: PrimaryTableCol[] = [];

    if (props.selectType) {
        cols.push({
            colKey: 'row-select',
            type: props.selectType === 'radio' ? 'single' : 'multiple',
            width: 50,
            fixed: 'left'
        });
    }

    // Calculate dynamic widths based on the wrapper width
    let twidth = props.width;
    if (!twidth && tableWrapRef.value) {
        twidth = tableWrapRef.value.clientWidth - 10;
    }

    if (typeof twidth === 'number') {
        let selectionWidth = props.selectType ? 50 : 0;
        let availableWidth = twidth - selectionWidth - 2;

        let fixedTotalWidth = 0;
        let flexColsCount = 0;

        props.columns.forEach(col => {
            if (col.width && typeof col.width === 'number') {
                fixedTotalWidth += col.width;
            } else {
                flexColsCount++;
            }
        });

        if (fixedTotalWidth < availableWidth) {
            const extraWidth = availableWidth - fixedTotalWidth;

            if (flexColsCount > 0) {
                // Distribute remaining width to unassigned columns
                const flexWidth = Math.floor(extraWidth / flexColsCount);
                props.columns.forEach(col => {
                    if (!col.width) {
                        (col as any)._calculatedWidth = flexWidth;
                    } else {
                        (col as any)._calculatedWidth = col.width;
                    }
                });
            } else {
                // All columns have width but total is less than available, scale them up proportionally
                const ratio = availableWidth / fixedTotalWidth;
                props.columns.forEach(col => {
                    (col as any)._calculatedWidth = Math.floor((col.width as number) * ratio);
                });
            }
        } else {
            // Total exceeds available, or no extra width. Provide a fallback for flex columns.
            props.columns.forEach(col => {
                if (!col.width) {
                    (col as any)._calculatedWidth = 150;
                } else {
                    (col as any)._calculatedWidth = col.width;
                }
            });
        }
    } else {
        // If we can't determine container width yet, just pass through original widths
        props.columns.forEach(col => {
            (col as any)._calculatedWidth = col.width;
        });
    }

    props.columns.forEach(col => {
        let filterConf: any = undefined;
        if (col.filter) {
            if (col.filter === 'single' || col.filter === 'multiple' || col.filter === 'select') {
                let list: Array<{ label: string; value?: any; checkAll?: boolean }> = [];
                if (col.filter === 'select') {
                    // Dynamic options from data
                    const uniqueValues = Array.from(new Set(baseData.value.map(item => item[col.key]))).filter(v => v !== undefined && v !== null && v !== '');
                    list = uniqueValues.map(v => ({ label: String(v), value: v }));
                } else if (typeof col.filterOptions === 'string') {
                    const dict = getDictOptions(col.filterOptions);
                    list = (dict?.value || []).map((d: any) => ({
                        label: d.label ?? d.name ?? String(d.value),
                        value: d.value
                    }));
                } else if (Array.isArray(col.filterOptions)) {
                    list = col.filterOptions as any;
                } else {
                    list = [];
                }
                filterConf = {
                    type: col.filter === 'single' ? 'single' : 'multiple',
                    ...(list.length ? { list } : {}),
                    resetValue: col.filter === 'single' ? undefined : [],
                    showConfirmAndReset: true
                };
            } else if (col.filter === 'input') {
                filterConf = {
                    type: 'input',
                    resetValue: '',
                    confirmEvents: ['onEnter'],
                    props: {
                        placeholder: col.filterPlaceholder ?? '输入关键词过滤'
                    },
                    showConfirmAndReset: true
                };
            } else if (col.filter === 'number') {
                filterConf = {
                    component: FilterOpPanel,
                    resetValue: { op: 'contains', value: '' },
                    showConfirmAndReset: true,
                    props: {
                        placeholder: col.filterPlaceholder ?? '输入关键词过滤',
                        mode: 'number'
                    }
                };
            } else if (col.filter === 'datepicker') {
                filterConf = {
                    component: DateRangePickerPanel,
                    resetValue: [],
                    showConfirmAndReset: true
                };
            }
        }
        cols.push({
            title: col.title,
            colKey: col.key,
            width: (col as any)._calculatedWidth,
            align: col.align || 'center',
            fixed: col.fixed,
            ellipsis: col.ellipsis,
            sorter: col.sort ? true : false,
            filter: filterConf
        });
    });

    return cols;
});

const tableHeight = computed(() => {
    return props.height ? props.height : 'auto';
});

const renderColumns = computed(() => props.columns.filter(c => c.render));

const sortInfo = ref<{ sortBy: string; sortOrder: 'asc' | 'desc' } | null>(null);
const filterValue = ref<any>({});

const tdSort = computed(() => {
    if (!sortInfo.value) return undefined as any;
    return { sortBy: sortInfo.value.sortBy, descending: sortInfo.value.sortOrder === 'desc' } as any;
});

const getOptionList = (col: TableColumnType) => {
    if (!col.filter) return [];
    if (col.filter !== 'single' && col.filter !== 'multiple' && col.filter !== 'select') return [];
    let list: Array<{ label: string; value?: any; checkAll?: boolean }> = [];
    if (col.filter === 'select') {
        const uniqueValues = Array.from(new Set(baseData.value.map(item => item[col.key]))).filter(v => v !== undefined && v !== null && v !== '');
        list = uniqueValues.map(v => ({ label: String(v), value: v }));
    } else if (typeof col.filterOptions === 'string') {
        const dict = getDictOptions(col.filterOptions);
        list = (dict?.value || []).map((d: any) => ({
            label: d.label ?? d.name ?? String(d.value),
            value: d.value
        }));
    } else if (Array.isArray(col.filterOptions)) {
        list = col.filterOptions as any;
    }
    return list;
};

const opLabels: Record<string, string> = {
    contains: '包含',
    '>': '>',
    '<': '<',
    '=': '=',
    '>=': '>=',
    '<=': '<=',
};

const toDateStr = (v: any) => {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === 'number') return new Date(v).toISOString().slice(0, 10);
    if (typeof v === 'string') {
        const ms = Date.parse(v);
        if (Number.isFinite(ms)) return new Date(ms).toISOString().slice(0, 10);
        return v.slice(0, 10);
    }
    return String(v);
};

const filterSummaryText = computed(() => {
    const fv = filterValue.value || {};
    const parts: string[] = [];
    props.columns.forEach((col) => {
        const raw = fv[col.key];
        if (isEmptyFilter(raw)) return;
        if (col.filter === 'single') {
            const list = getOptionList(col);
            const found = list.find((it) => it.value === raw);
            const label = found ? found.label : String(raw);
            parts.push(`${col.title}：${label}`);
            return;
        }
        if (col.filter === 'multiple' || col.filter === 'select') {
            const list = getOptionList(col);
            const arr = Array.isArray(raw) ? raw : [raw];
            const labels = arr.map((v) => list.find((it) => it.value === v)?.label ?? String(v));
            parts.push(`${col.title}：${labels.join('，')}`);
            return;
        }
        if (col.filter === 'input') {
            const label = String(raw ?? '').trim();
            if (label) parts.push(`${col.title}：${label}`);
            return;
        }
        if (col.filter === 'number') {
            const op = typeof raw === 'object' ? (raw as any).op : 'contains';
            const val = typeof raw === 'object' ? (raw as any).value : raw;
            const needle = String(val ?? '').trim();
            if (!needle) return;
            const opl = opLabels[op] ?? op;
            parts.push(`${col.title}：${opl} ${needle}`);
            return;
        }
        if (col.filter === 'datepicker') {
            const val = raw;
            if (Array.isArray(val) && val.length === 2) {
                parts.push(`${col.title}：${toDateStr(val[0])} ~ ${toDateStr(val[1])}`);
            }
            return;
        }
    });
    return parts.join('，');
});

const isNumeric = (val: any) => {
    if (typeof val === 'number') return Number.isFinite(val);
    if (typeof val !== 'string') return false;
    const s = val.trim();
    if (!s) return false;
    return Number.isFinite(Number(s));
};

const toNumber = (val: any) => (typeof val === 'number' ? val : Number(String(val).trim()));

const toDateMs = (val: any) => {
    if (val instanceof Date) return val.getTime();
    if (typeof val === 'number') return val;
    if (typeof val !== 'string') return NaN;
    const ms = Date.parse(val);
    return Number.isFinite(ms) ? ms : NaN;
};

const getByPath = (obj: any, path: string) => {
    if (!obj || !path) return undefined;
    if (!path.includes('.')) return obj[path];
    return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
};

const compareValues = (a: any, b: any) => {
    if (a === b) return 0;
    if (a === undefined || a === null || a === '') return 1;
    if (b === undefined || b === null || b === '') return -1;

    if (isNumeric(a) && isNumeric(b)) {
        return toNumber(a) - toNumber(b);
    }

    const da = toDateMs(a);
    const db = toDateMs(b);
    if (Number.isFinite(da) && Number.isFinite(db)) {
        return da - db;
    }

    return String(a).localeCompare(String(b), 'zh', { numeric: true, sensitivity: 'base' });
};

const applyLocalSort = (rows: any[]) => {
    if (!sortInfo.value) return rows.slice();
    const { sortBy, sortOrder } = sortInfo.value;
    return rows.slice().sort((ra, rb) => {
        const diff = compareValues(getByPath(ra, sortBy), getByPath(rb, sortBy));
        return sortOrder === 'asc' ? diff : -diff;
    });
};

const isEmptyFilter = (v: any) => {
    if (v === undefined || v === null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object') {
        if ('value' in v) return String((v as any).value ?? '').trim() === '';
    }
    return false;
};

const applyLocalFilter = (rows: any[]) => {
    const fv = filterValue.value || {};
    let base = rows.slice();
    props.columns.forEach(col => {
        const raw = fv[col.key];
        if (isEmptyFilter(raw)) return;
        const key = col.key;

        if (col.filter === 'single') {
            base = base.filter(r => getByPath(r, key) === raw);
            return;
        }

        if (col.filter === 'multiple' || col.filter === 'select') {
            const arr = Array.isArray(raw) ? raw : [raw];
            base = base.filter(r => arr.includes(getByPath(r, key)));
            return;
        }

        if (col.filter === 'datepicker') {
            const val = raw;
            if (Array.isArray(val) && val.length === 2) {
                const start = toDateMs(val[0]);
                const end = toDateMs(val[1]);
                base = base.filter(r => {
                    const d = toDateMs(getByPath(r, key));
                    return Number.isFinite(d) && d >= start && d <= end;
                });
            }
            return;
        }

        if (col.filter === 'input') {
            const needle = String(raw ?? '').trim();
            if (!needle) return;
            base = base.filter(r => String(getByPath(r, key) ?? '').includes(needle));
            return;
        }

        if (col.filter === 'number') {
            const op = typeof raw === 'object' ? (raw as any).op : 'contains';
            const val = typeof raw === 'object' ? (raw as any).value : raw;
            const needle = String(val ?? '').trim();
            if (!needle) return;

            if (op === 'contains') {
                base = base.filter(r => String(getByPath(r, key) ?? '').includes(needle));
                return;
            }

            const num = Number(needle);
            if (Number.isFinite(num)) {
                base = base.filter(r => {
                    const v = Number(getByPath(r, key));
                    if (!Number.isFinite(v)) return false;
                    if (op === '>') return v > num;
                    if (op === '<') return v < num;
                    if (op === '>=') return v >= num;
                    if (op === '<=') return v <= num;
                    return v === num;
                });
                return;
            }

            base = base.filter(r => String(getByPath(r, key) ?? '').includes(needle));
        }
    });
    return base;
};

const applyLocalView = () => {
    const filtered = applyLocalFilter(baseData.value);
    data.value = applyLocalSort(filtered);
};

const fetchData = async () => {
    loading.value = true;
    const result = await request.post(props.apiUrl, {
        ...props.query,
        start: (pagination.value.current - 1) * pagination.value.pageSize,
        length: pagination.value.pageSize
    });

    loading.value = false;

    if (result.status) {
        selectedRowKeys.value = [];
        baseData.value = result.data.list || [];
        applyLocalView();

        // Only update total if it's the first page or total is valid. If total is 0 but there is data, keep old total.
        if (result.data.total !== undefined && result.data.total !== null) {
            if (result.data.total === 0 && data.value.length > 0 && pagination.value.current > 1) {
                // Keep existing total
            } else if (result.data.total === 0 && pagination.value.current > 1 && data.value.length === 0) {
                // if no data and current > 1, update total
                pagination.value.total = 0;
            } else {
                pagination.value.total = result.data.total;
            }
        } else if (pagination.value.current === 1) {
            pagination.value.total = 0;
        }
        if (props.onDataLoaded) {
            props.onDataLoaded(result.data.list);
        }
    } else {
        showResult.show(result);
    }
};

const onPageChange = (pageInfo: any) => {
    pagination.value.current = pageInfo.current;
    pagination.value.pageSize = pageInfo.pageSize;
    fetchData();
};

const onSelectChange = (keys: any[], ctx: any) => {
    selectedRowKeys.value = keys;
    props.onSelect(ctx.selectedRowData);
};

const onSortChange = (val: any) => {
    if (Array.isArray(val)) {
        if (val.length > 0 && val[0]?.sortBy) {
            sortInfo.value = {
                sortBy: val[0].sortBy,
                sortOrder: val[0].descending ? 'desc' : 'asc',
            };
        } else {
            sortInfo.value = null;
        }
    } else if (val && val.sortBy) {
        sortInfo.value = {
            sortBy: val.sortBy,
            sortOrder: val.descending ? 'desc' : 'asc',
        };
    } else {
        sortInfo.value = null;
    }
    applyLocalView();
};

// Table component specific code
const onFilterChange = (filters: any) => {
    filterValue.value = filters || {};
    applyLocalView();
};

const onClearFilters = () => {
    filterValue.value = {};
    applyLocalView();
};

watch(() => props.query, (newVal, oldVal) => {
    pagination.value.current = 1;
    fetchData();
}, { deep: true });

watch(() => props.refresh?.tag, (newTag, oldTag) => {
    if (newTag !== oldTag) {
        if (props.refresh?.reset) {
            pagination.value.current = 1;
        }
        fetchData();
    }
});



onMounted(() => {
    if (props.initLoad) {
        fetchData();
    }
});

defineExpose({
    fetchData
});
</script>

<style scoped>
.xm-table-wrap {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
}

.full-height-table {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

:deep(.t-table) {
    display: flex;
    flex-direction: column;
}

:deep(.t-table__content) {
    overflow: auto;
}

:deep(.t-table__content .t-table) {
    --td-table-border-radius: 0;
}

:deep(.t-table__pagination) {
    flex-shrink: 0;
    padding: 12px 0 0 0;
}

.table-filter-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    font-size: 12px;
    color: var(--td-text-color-secondary);
}
</style>
