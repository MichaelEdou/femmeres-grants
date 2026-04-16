<script setup lang="ts">
useHead({ title: "Dashboard — Femmeres Grants" });

const { data, pending, refresh } = await useFetch<any>("/api/dashboard");

function fmtCurrency(amount: any) {
  if (amount === null || amount === undefined || amount === "") return "Varies";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "Varies";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-10">
    <!-- Hero -->
    <section class="mb-10">
      <div class="flex items-start justify-between flex-wrap gap-6">
        <div class="max-w-2xl">
          <p class="text-sm font-medium text-brand-700 mb-3 tracking-wide uppercase">
            Femmeres NGO · Gatineau, QC
          </p>
          <h1 class="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink-900 mb-4">
            Find the <span class="italic text-brand-700">non-refundable</span> funding your mission deserves.
          </h1>
          <p class="text-lg text-ink-600 leading-relaxed">
            Curated, active grant opportunities for women-serving organizations across Canada.
            Every grant listed here is a non-repayable contribution — no loans, no matching requirements you can't meet.
          </p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/grants" class="btn-primary">
            Browse grants
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/applications" class="btn-outline">Pipeline</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div v-for="stat in [
        { label: 'Total grants', value: data?.stats.totalGrants ?? 0, note: 'Verified non-refundable' },
        { label: 'New this week', value: data?.stats.newThisWeek ?? 0, note: 'Recently discovered' },
        { label: 'Closing soon', value: data?.stats.closingSoon ?? 0, note: 'Next 30 days' },
        { label: 'Applications', value: data?.stats.activeApps ?? 0, note: 'Active pipeline' },
      ]" :key="stat.label" class="card">
        <p class="text-xs font-medium tracking-wider uppercase text-ink-500 mb-1">
          {{ stat.label }}
        </p>
        <p class="font-display text-3xl font-bold text-ink-900">{{ stat.value }}</p>
        <p class="text-xs text-ink-400 mt-1">{{ stat.note }}</p>
      </div>
    </section>

    <!-- Quick filter by source type -->
    <section class="mb-10">
      <h2 class="font-display text-xl font-bold text-ink-900 mb-4">
        Browse by source type
      </h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="b in data?.bySource ?? []"
          :key="b.source_type"
          :to="`/grants?sourceType=${b.source_type}`"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50 transition-colors no-underline"
        >
          <span class="text-sm font-medium text-ink-800 capitalize">{{ b.source_type }}</span>
          <span class="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
            {{ b.count }}
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- Deadlines -->
    <section v-if="data?.deadlines?.length" class="mb-12">
      <div class="flex items-end justify-between mb-4">
        <div>
          <h2 class="font-display text-xl font-bold text-ink-900">
            Upcoming deadlines
          </h2>
          <p class="text-sm text-ink-500 mt-1">Next 30 days · Apply soon</p>
        </div>
        <NuxtLink to="/grants?status=closing" class="text-sm text-brand-700 hover:text-brand-800 font-medium">
          See all →
        </NuxtLink>
      </div>
      <div class="bg-white rounded-card border border-ink-100 shadow-card divide-y divide-ink-100 overflow-hidden">
        <NuxtLink
          v-for="d in data.deadlines"
          :key="d.id"
          :to="`/grants/${d.id}`"
          class="flex items-center justify-between px-6 py-4 hover:bg-cream transition-colors no-underline"
        >
          <div class="min-w-0 flex-1">
            <p class="font-medium text-ink-900 truncate">{{ d.title }}</p>
            <div class="flex items-center gap-2 mt-1">
              <SourceBadge :type="d.source_type" />
              <span class="text-xs text-ink-500 truncate">{{ d.source_name }}</span>
            </div>
          </div>
          <div class="flex flex-col items-end ml-4 shrink-0">
            <span class="text-sm font-semibold text-brand-700">
              {{ d.amount_max ? fmtCurrency(d.amount_max) : 'Varies' }}
            </span>
            <DeadlinePill :deadline="d.deadline" />
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Recent -->
    <section>
      <div class="flex items-end justify-between mb-4">
        <div>
          <h2 class="font-display text-xl font-bold text-ink-900">
            Recently discovered
          </h2>
          <p class="text-sm text-ink-500 mt-1">Freshly added to your database</p>
        </div>
        <NuxtLink to="/grants" class="text-sm text-brand-700 hover:text-brand-800 font-medium">
          See all grants →
        </NuxtLink>
      </div>
      <div v-if="!pending && data?.recent?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GrantCard v-for="g in data.recent" :key="g.id" :grant="g" />
      </div>
      <div v-else-if="pending" class="text-center py-12 text-ink-500">
        Loading…
      </div>
      <div v-else class="text-center py-12 text-ink-500">
        No grants found. Check your database connection.
      </div>
    </section>
  </div>
</template>
