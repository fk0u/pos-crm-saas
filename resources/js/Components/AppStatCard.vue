<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  trend: {
    type: [String, Number],
    default: null,
  },
  trendUp: {
    type: Boolean,
    default: true,
  },
  trendLabel: {
    type: String,
    default: 'vs kemarin',
  },
});
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all">
    <div class="flex items-center justify-between gap-3">
      <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {{ title }}
      </span>
      <div
        v-if="$slots.icon"
        class="w-9 h-9 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center shrink-0 border border-navy-100"
      >
        <slot name="icon" />
      </div>
    </div>

    <div class="mt-3 flex items-baseline gap-2">
      <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
        {{ value }}
      </div>
    </div>

    <div v-if="trend !== null || subtitle" class="mt-2.5 flex items-center gap-2 text-xs">
      <span
        v-if="trend !== null"
        class="inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded text-[11px]"
        :class="trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
      >
        <svg
          class="w-3 h-3"
          :class="trendUp ? '' : 'rotate-180'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        {{ trend }}
      </span>
      <span class="text-slate-500 truncate">
        {{ subtitle || trendLabel }}
      </span>
    </div>
  </div>
</template>
