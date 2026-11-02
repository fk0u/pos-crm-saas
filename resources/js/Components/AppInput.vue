<script setup>
import { computed } from 'vue';

const props = defineProps({
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
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
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
  monospace: {
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
      <div
        v-if="$slots.prefix"
        class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full rounded-lg border text-sm transition-colors min-h-[44px] px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
        :class="[
          $slots.prefix ? 'pl-10' : '',
          $slots.suffix ? 'pr-10' : '',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-navy-700 focus:ring-navy-200',
          monospace ? 'font-mono' : 'font-sans',
        ]"
        v-bind="$attrs"
      />

      <div
        v-if="$slots.suffix"
        class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400"
      >
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
      <svg class="w-3.5 h-3.5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      <span>{{ error }}</span>
    </p>
    <p v-else-if="hint" class="text-xs text-slate-500 mt-1">
      {{ hint }}
    </p>
  </div>
</template>
