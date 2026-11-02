<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
    <div
      v-if="$slots.icon"
      class="mx-auto w-12 h-12 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center mb-3.5 border border-navy-100"
    >
      <slot name="icon" />
    </div>
    <h3 class="text-sm font-semibold text-slate-800">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
