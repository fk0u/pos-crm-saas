<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'navy', // navy, emerald, amber, rose, sky, slate, gold, purple
  },
  size: {
    type: String,
    default: 'md', // sm, md
  },
  dot: {
    type: Boolean,
    default: false,
  },
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'emerald':
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case 'amber':
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'rose':
    case 'danger':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'sky':
    case 'info':
      return 'bg-sky-50 text-sky-700 border-sky-200/80';
    case 'gold':
      return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
    case 'slate':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-navy-50 text-navy-700 border-navy-200/80 font-medium';
  }
});

const dotClasses = computed(() => {
  switch (props.variant) {
    case 'emerald':
    case 'success':
      return 'bg-emerald-500';
    case 'amber':
    case 'warning':
    case 'gold':
      return 'bg-amber-500';
    case 'rose':
    case 'danger':
      return 'bg-rose-500';
    case 'sky':
    case 'info':
      return 'bg-sky-500';
    case 'slate':
      return 'bg-slate-400';
    default:
      return 'bg-navy-600';
  }
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors"
    :class="[
      variantClasses,
      size === 'sm' ? 'text-[11px] px-2 py-0.25' : 'text-xs px-2.5 py-0.5'
    ]"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full" :class="dotClasses"></span>
    <slot />
  </span>
</template>
