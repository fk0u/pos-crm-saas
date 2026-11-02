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
  <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm text-slate-500 mt-1">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.action" class="flex items-center gap-3 shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>
