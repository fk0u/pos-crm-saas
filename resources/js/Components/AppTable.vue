<script setup>
defineProps({
  headers: {
    type: Array,
    default: () => [],
  },
  striped: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
          <tr>
            <slot name="header">
              <th
                v-for="(header, idx) in headers"
                :key="idx"
                class="px-5 py-3.5"
                :class="typeof header === 'object' && header.align === 'right' ? 'text-right' : 'text-left'"
              >
                {{ typeof header === 'object' ? header.label : header }}
              </th>
            </slot>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <slot />
        </tbody>
      </table>
    </div>

    <div
      v-if="$slots.footer"
      class="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
