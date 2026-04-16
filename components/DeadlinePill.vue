<script setup lang="ts">
const props = defineProps<{ deadline: string | Date | null }>();

const days = computed<number | null>(() => {
  if (!props.deadline) return null;
  const date = new Date(props.deadline);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

const color = computed(() => {
  if (days.value === null) return "text-ink-500";
  if (days.value < 0) return "text-red-700";
  if (days.value <= 7) return "text-red-600";
  if (days.value <= 30) return "text-gold-700";
  return "text-green-700";
});

const label = computed(() => {
  if (days.value === null) return "Rolling";
  if (days.value < 0) return "Closed";
  if (days.value === 0) return "Due today";
  if (days.value === 1) return "1 day left";
  return `${days.value} days left`;
});

const dateFmt = computed(() => {
  if (!props.deadline) return "";
  return new Date(props.deadline).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});
</script>

<template>
  <div class="flex items-center gap-2 text-sm">
    <span :class="[color, 'font-semibold']">{{ label }}</span>
    <span v-if="dateFmt" class="text-ink-400 text-xs">·</span>
    <span v-if="dateFmt" class="text-ink-500 text-xs">{{ dateFmt }}</span>
  </div>
</template>
