<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`,
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="space-y-1.5 w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-xs font-semibold text-slate-700 tracking-wide"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>

    <div class="relative rounded-lg shadow-sm">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        @change="$emit('update:modelValue', $event.target.value)"
        class="w-full appearance-none rounded-lg border text-sm transition-colors min-h-[44px] pl-3.5 pr-10 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
        :class="[
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-navy-700 focus:ring-navy-200',
        ]"
      >
        <slot />
      </select>

      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <p v-if="error" class="text-xs text-rose-600 font-medium mt-1">
      {{ error }}
    </p>
  </div>
</template>
