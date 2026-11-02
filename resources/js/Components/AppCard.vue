<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  padding: {
    type: String,
    default: 'p-6',
  },
});
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200/90 shadow-xs transition-shadow">
    <div
      v-if="title || subtitle || $slots.header || $slots.action"
      class="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4"
    >
      <div>
        <slot name="header">
          <h3 v-if="title" class="text-sm font-semibold text-slate-900 tracking-tight">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">
            {{ subtitle }}
          </p>
        </slot>
      </div>
      <div v-if="$slots.action" class="shrink-0">
        <slot name="action" />
      </div>
    </div>

    <div :class="padding">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-xl"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
