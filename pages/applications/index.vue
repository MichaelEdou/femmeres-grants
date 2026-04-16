<script setup lang="ts">
useHead({ title: "Applications — Femmeres Grants" });

const { data, refresh, pending } = await useFetch<any[]>("/api/applications");

const columns = [
  { key: "interested", label: "Interested", accent: "border-t-blue-400" },
  { key: "drafting", label: "Drafting", accent: "border-t-gold-400" },
  { key: "submitted", label: "Submitted", accent: "border-t-brand-400" },
  { key: "awarded", label: "Awarded", accent: "border-t-green-500" },
  { key: "declined", label: "Declined", accent: "border-t-red-400" },
];

function byStatus(status: string) {
  return (data.value ?? []).filter((a: any) => a.status === status);
}

async function moveStatus(id: string, status: string) {
  await $fetch(`/api/applications/${id}`, {
    method: "PATCH",
    body: { status },
  });
  await refresh();
}

function fmtAmt(v: any) {
  if (!v) return "Varies";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "Varies";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-10">
    <div class="flex items-end justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="font-display text-4xl font-bold tracking-tight text-ink-900 mb-2">
          Applications
        </h1>
        <p class="text-ink-600">
          {{ data?.length ?? 0 }} grants tracked in your pipeline.
        </p>
      </div>
      <NuxtLink to="/grants" class="btn-primary">
        Track a new grant
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-center py-20 text-ink-500">Loading…</div>

    <div v-else-if="!data?.length" class="card text-center py-16">
      <p class="font-medium text-ink-800 mb-2">No applications yet.</p>
      <p class="text-sm text-ink-500 mb-6">Start tracking grants to see them here.</p>
      <NuxtLink to="/grants" class="btn-primary">Browse grants</NuxtLink>
    </div>

    <div v-else class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in columns"
        :key="col.key"
        :class="['w-72 shrink-0 bg-white rounded-card border-t-4 shadow-card', col.accent]"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-ink-100">
          <h3 class="font-semibold text-ink-900">{{ col.label }}</h3>
          <span class="badge bg-ink-100 text-ink-700">{{ byStatus(col.key).length }}</span>
        </div>
        <div class="p-3 space-y-3 min-h-[120px]">
          <div
            v-for="app in byStatus(col.key)"
            :key="app.id"
            class="bg-cream rounded-xl border border-ink-100 p-3 hover:border-brand-400 transition-colors"
          >
            <NuxtLink :to="`/applications/${app.id}`" class="no-underline block mb-2">
              <h4 class="font-medium text-sm text-ink-900 hover:text-brand-700 transition-colors line-clamp-2">
                {{ app.grant.title }}
              </h4>
            </NuxtLink>
            <div class="flex items-center justify-between mb-2">
              <SourceBadge :type="app.grant.source_type" />
              <span class="text-xs font-semibold text-brand-700">
                {{ fmtAmt(app.grant.amount_max) }}
              </span>
            </div>
            <DeadlinePill :deadline="app.grant.deadline" />
            <div class="flex flex-wrap gap-1 mt-3 pt-3 border-t border-ink-100">
              <button
                v-for="c in columns.filter((x) => x.key !== col.key)"
                :key="c.key"
                @click="moveStatus(app.id, c.key)"
                class="text-[10px] font-medium text-ink-500 hover:text-brand-700 hover:bg-white rounded px-1.5 py-0.5 transition-colors"
              >
                → {{ c.label }}
              </button>
            </div>
          </div>
          <p v-if="!byStatus(col.key).length" class="text-center text-xs text-ink-400 py-4">
            Nothing here yet
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
