<script setup>
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: String,
    default: '2xl', // sm, md, lg, xl, 2xl, 4xl
  },
  closeable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['close']);

const close = () => {
  if (props.closeable) {
    emit('close');
  }
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});

const maxWidthClass = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '4xl': 'sm:max-w-4xl',
}[props.maxWidth];
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        @click="close"
      ></div>

      <!-- Dialog Panel -->
      <div
        class="relative bg-white rounded-2xl border border-slate-200/90 shadow-2xl transform transition-all sm:w-full overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
        :class="maxWidthClass"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <slot name="title">
              <h3 v-if="title" class="text-base font-semibold text-slate-900">
                {{ title }}
              </h3>
            </slot>
          </div>
          <button
            v-if="closeable"
            @click="close"
            type="button"
            class="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-navy-300"
            aria-label="Tutup Modal"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto flex-1">
          <slot />
        </div>

        <!-- Modal Footer -->
        <div
          v-if="$slots.footer"
          class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
