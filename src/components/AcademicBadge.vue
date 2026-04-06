<template>
  <span class="academic-badge shadow-sm" :class="variantClass">
    <i v-if="icon" :class="`bi ${icon} me-1`"></i>
    <slot></slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, default: '' },
  variant: { type: String, default: 'default' } // 'default', 'success', 'warning'
})

const variantClass = computed(() => {
  if (props.variant === 'success') return 'badge-success'
  if (props.variant === 'warning') return 'badge-warning'
  return 'badge-default'
})
</script>

<style scoped>
.academic-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.05em;
}

.badge-default { background-color: var(--tertiary-fixed); color: var(--on-tertiary-fixed); }
.badge-success { background-color: #d1e7dd; color: #0f5132; }
.badge-warning { background-color: var(--warning-bg); color: var(--warning-text); }
</style>