<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: [Number, String], required: true },
  currency: { type: String, default: 'IDR' },
  colored: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // 'sm', 'md', 'lg', 'xl'
  prefix: { type: String, default: 'Rp ' },
});

const numValue = computed(() => {
  const v = Number(props.value);
  return isNaN(v) ? 0 : v;
});

const formattedNumber = computed(() => {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.abs(numValue.value));
});

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base font-semibold',
  xl: 'text-xl font-bold',
};
</script>

<template>
  <span
    class="font-mono tabular-nums tracking-tight inline-flex items-baseline"
    :class="[
      sizeClasses[size] || sizeClasses.md,
      colored
        ? (numValue > 0 ? 'text-emerald-600' : (numValue < 0 ? 'text-rose-600' : 'text-slate-600'))
        : 'text-inherit'
    ]"
  >
    <span v-if="numValue < 0" class="mr-0.5">-</span>
    <span class="text-[0.82em] opacity-75 mr-0.5">{{ prefix }}</span>
    <span>{{ formattedNumber }}</span>
  </span>
</template>
