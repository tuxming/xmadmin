<template>
  <span v-if="tip && isPermitted" style="display: inline-block;">
    <t-tooltip :content="tip">
      <t-button v-bind="$attrs" @click="$emit('click', $event)">
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps || {}"></slot>
        </template>
      </t-button>
    </t-tooltip>
  </span>
  <t-button v-else-if="isPermitted" v-bind="$attrs" @click="$emit('click', $event)">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </t-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/hooks/useAuth';

const props = defineProps<{
  requiredPermissions: string | string[];
  tip?: string;
}>();

defineEmits(['click']);

const auth = useAuth();
const isPermitted = computed(() => auth.has(props.requiredPermissions));
</script>