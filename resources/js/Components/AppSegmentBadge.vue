<script setup>
import { computed } from 'vue';

const props = defineProps({
  segment: { type: String, default: 'new' }, // 'new', 'regular', 'loyal', 'vip'
  size: { type: String, default: 'md' }, // 'sm', 'md'
});

const normalizedSegment = computed(() => {
  const s = (props.segment || 'new').toLowerCase();
  if (['new', 'baru'].includes(s)) return 'new';
  if (['regular', 'reguler', 'silver'].includes(s)) return 'regular';
  if (['loyal', 'gold'].includes(s)) return 'loyal';
  if (['vip', 'platinum'].includes(s)) return 'vip';
  return s;
});

const label = computed(() => {
  switch (normalizedSegment.value) {
    case 'new': return 'New Customer';
    case 'regular': return 'Regular Member';
    case 'loyal': return 'Loyal Member';
    case 'vip': return 'VIP Member';
    default: return props.segment;
  }
});

const styles = computed(() => {
  switch (normalizedSegment.value) {
    case 'new':
      return {
        pill: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
    case 'regular':
      return {
        pill: 'bg-navy-50 text-navy-800 border-navy-200/80',
        dot: 'bg-navy-600',
      };
    case 'loyal':
      return {
        pill: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'vip':
      return {
        pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    default:
      return {
        pill: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 font-medium rounded-full border"
    :class="[
      styles.pill,
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
    ]"
  >
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="styles.dot"></span>
    <span class="font-semibold">{{ label }}</span>
  </span>
</template>
