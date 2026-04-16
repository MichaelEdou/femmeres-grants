<script setup lang="ts">
defineProps<{ type: string }>();

const colors: Record<string, string> = {
  federal: "bg-brand-100 text-brand-800",
  provincial: "bg-blue-100 text-blue-800",
  municipal: "bg-green-100 text-green-800",
  foundation: "bg-gold-100 text-gold-800",
  private: "bg-purple-100 text-purple-800",
};
</script>

<template>
  <span
    :class="['badge capitalize', colors[type] || 'bg-ink-100 text-ink-700']"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {{ type }}
  </span>
</template>
