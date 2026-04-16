<script setup lang="ts">
defineProps<{
  grant: {
    id: string;
    title: string;
    description: string;
    source_name: string;
    source_type: string;
    category: string[];
    amount_min: string | number | null;
    amount_max: string | number | null;
    deadline: string | null;
  };
}>();

function formatAmount(min: any, max: any) {
  const toNum = (v: any) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? null : n;
  };
  const mn = toNum(min);
  const mx = toNum(max);
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(n);
  if (mn && mx) return `${fmt(mn)} – ${fmt(mx)}`;
  if (mx) return `Up to ${fmt(mx)}`;
  if (mn) return `From ${fmt(mn)}`;
  return "Amount varies";
}
</script>

<template>
  <NuxtLink
    :to="`/grants/${grant.id}`"
    class="group block card no-underline"
  >
    <div class="flex items-center gap-2 mb-3">
      <SourceBadge :type="grant.source_type" />
      <span class="text-xs text-ink-400 truncate">{{ grant.source_name }}</span>
    </div>

    <h3 class="font-display text-lg font-semibold leading-tight mb-2 text-ink-900 group-hover:text-brand-700 transition-colors">
      {{ grant.title }}
    </h3>

    <p class="text-sm text-ink-500 leading-relaxed line-clamp-2 mb-4">
      {{ grant.description }}
    </p>

    <div class="flex flex-wrap gap-1.5 mb-4">
      <span
        v-for="cat in grant.category.slice(0, 3)"
        :key="cat"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ink-100 text-ink-700"
      >
        {{ cat }}
      </span>
    </div>

    <div class="flex items-center justify-between border-t border-ink-100 pt-4">
      <span class="text-sm font-semibold text-brand-700">
        {{ formatAmount(grant.amount_min, grant.amount_max) }}
      </span>
      <DeadlinePill :deadline="grant.deadline" />
    </div>
  </NuxtLink>
</template>
