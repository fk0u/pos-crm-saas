<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, danger, ghost
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5';
    case 'lg':
      return 'text-base px-5 py-3 min-h-[48px] gap-2.5 font-semibold';
    default:
      return 'text-sm px-4 py-2 min-h-[44px] gap-2'; // 44px touch-friendly
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-navy-50 text-navy-800 hover:bg-navy-100 focus:ring-navy-300 border border-navy-200/60';
    case 'outline':
      return 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-300 focus:ring-navy-300';
    case 'danger':
      return 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-300 shadow-sm';
    case 'ghost':
      return 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300';
    default:
      return 'bg-navy-700 text-white hover:bg-navy-800 focus:ring-navy-300 shadow-sm';
  }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[baseClasses, sizeClasses, variantClasses]"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>
