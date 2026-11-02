<script setup>
import { computed } from 'vue';

const props = defineProps({
  stock: { type: Number, required: true },
  threshold: { type: Number, default: 10 },
  size: { type: String, default: 'md' },
  showCount: { type: Boolean, default: true },
});

const status = computed(() => {
  if (props.stock <= 0) return 'out';
  if (props.stock <= props.threshold) return 'low';
  return 'in';
});

const label = computed(() => {
  if (status.value === 'out') return 'Habis (0)';
  if (status.value === 'low') {
    return props.showCount ? `Menipis (${props.stock})` : 'Stok Menipis';
  }
  return props.showCount ? `${props.stock} unit` : 'Tersedia';
});

const styles = computed(() => {
  if (status.value === 'out') {
    return {
      pill: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    };
  }
  if (status.value === 'low') {
    return {
      pill: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    };
  }
  return {
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  };
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 font-medium rounded-full border tabular-nums"
    :class="[
      styles.pill,
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
    ]"
  >
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="styles.dot"></span>
    <span class="font-mono font-medium">{{ label }}</span>
  </span>
</template>
