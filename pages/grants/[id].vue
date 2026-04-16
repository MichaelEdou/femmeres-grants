<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const { data, pending } = await useFetch<any>(`/api/grants/${id}`);

useHead({
  title: () => (data.value?.grant?.title ? `${data.value.grant.title} — Femmeres Grants` : "Grant details"),
});

const tracking = ref(false);

const trackedApp = computed(() => {
  const apps = data.value?.grant?.applications ?? [];
  return apps[0] ?? null;
});

async function trackGrant() {
  tracking.value = true;
  try {
    const app = await $fetch<any>("/api/applications", {
      method: "POST",
      body: { grantId: id },
    });
    if (app?.id) {
      await router.push(`/applications/${app.id}`);
    }
  } finally {
    tracking.value = false;
  }
}

function fmt(min: any, max: any) {
  const toNum = (v: any) =>
    v === null || v === undefined || v === "" ? null : parseFloat(String(v));
  const mn = toNum(min);
  const mx = toNum(max);
  const f = (n: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(n);
  if (mn && mx) return `${f(mn)} – ${f(mx)}`;
  if (mx) return `Up to ${f(mx)}`;
  if (mn) return `From ${f(mn)}`;
  return "Amount varies";
}

function fmtDate(d: string | null) {
  if (!d) return "Rolling deadline";
  return new Date(d).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}
</script>

<template>
  <div v-if="pending" class="mx-auto max-w-3xl px-6 py-20 text-center text-ink-500">
    Loading grant…
  </div>
  <div v-else-if="!data?.grant" class="mx-auto max-w-3xl px-6 py-20 text-center">
    <p class="text-ink-700 font-medium mb-2">Grant not found.</p>
    <NuxtLink to="/grants" class="text-brand-700 hover:text-brand-800">← Back to grants</NuxtLink>
  </div>
  <div v-else class="mx-auto max-w-4xl px-6 py-10">
    <!-- Back -->
    <NuxtLink
      to="/grants"
      class="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-700 mb-6 no-underline"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to grants
    </NuxtLink>

    <!-- Header -->
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <SourceBadge :type="data.grant.source_type" />
      <span class="text-sm text-ink-500">{{ data.grant.source_name }}</span>
      <span v-if="data.grant.is_open" class="badge bg-green-100 text-green-800">
        <span class="w-1.5 h-1.5 rounded-full bg-green-600" />
        Accepting applications
      </span>
      <span v-else class="badge bg-red-100 text-red-800">Closed</span>
    </div>

    <h1 class="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight mb-6">
      {{ data.grant.title }}
    </h1>

    <!-- Key info card -->
    <div class="card mb-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-ink-500 mb-1">
            Funding amount
          </p>
          <p class="font-display text-2xl font-bold text-brand-700">
            {{ fmt(data.grant.amount_min, data.grant.amount_max) }}
          </p>
          <p class="text-xs text-ink-400 mt-1">Non-refundable grant</p>
        </div>
        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-ink-500 mb-1">
            Deadline
          </p>
          <p class="font-display text-2xl font-bold text-ink-900">
            {{ fmtDate(data.grant.deadline) }}
          </p>
          <DeadlinePill :deadline="data.grant.deadline" />
        </div>
        <div v-if="data.grant.category?.length">
          <p class="text-xs font-semibold tracking-wider uppercase text-ink-500 mb-2">
            Categories
          </p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="c in data.grant.category"
              :key="c"
              class="badge bg-ink-100 text-ink-700"
            >
              {{ c }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3 mb-10">
      <NuxtLink
        v-if="trackedApp"
        :to="`/applications/${trackedApp.id}`"
        class="btn-primary"
      >
        View application
      </NuxtLink>
      <button
        v-else
        @click="trackGrant"
        :disabled="tracking"
        class="btn-primary disabled:opacity-50"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
        </svg>
        {{ tracking ? "Saving…" : "Track this grant" }}
      </button>

      <a
        v-if="data.grant.source_url"
        :href="data.grant.source_url"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-outline"
      >
        Visit source
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>

    <!-- Description -->
    <section v-if="data.grant.description" class="mb-10">
      <h2 class="font-display text-2xl font-bold text-ink-900 mb-3">
        About this grant
      </h2>
      <div class="card">
        <p class="text-ink-700 leading-relaxed whitespace-pre-line">
          {{ data.grant.description }}
        </p>
      </div>
    </section>

    <!-- Eligibility -->
    <section v-if="data.grant.eligibility" class="mb-10">
      <h2 class="font-display text-2xl font-bold text-ink-900 mb-3">
        Eligibility
      </h2>
      <div class="card border-l-4 border-l-brand-500">
        <p class="text-ink-700 leading-relaxed whitespace-pre-line">
          {{ data.grant.eligibility }}
        </p>
      </div>
    </section>

    <!-- How to apply -->
    <section v-if="data.grant.how_to_apply" class="mb-10">
      <h2 class="font-display text-2xl font-bold text-ink-900 mb-3">
        How to apply
      </h2>
      <div class="card border-l-4 border-l-gold-500">
        <p class="text-ink-700 leading-relaxed whitespace-pre-line">
          {{ data.grant.how_to_apply }}
        </p>
      </div>
    </section>

    <!-- Info table -->
    <section class="mb-10">
      <h2 class="font-display text-2xl font-bold text-ink-900 mb-3">
        Grant information
      </h2>
      <div class="bg-white rounded-card border border-ink-100 shadow-card overflow-hidden">
        <div v-for="row in [
          { label: 'Source organization', value: data.grant.source_name },
          { label: 'Source type', value: data.grant.source_type, capitalize: true },
          { label: 'Grant type', value: 'Non-refundable contribution' },
          { label: 'Funding range', value: fmt(data.grant.amount_min, data.grant.amount_max) },
          { label: 'Deadline', value: fmtDate(data.grant.deadline) },
          { label: 'Status', value: data.grant.is_open ? 'Open — accepting applications' : 'Closed' },
        ]" :key="row.label"
           class="flex items-center justify-between px-6 py-3 border-b border-ink-100 last:border-b-0">
          <span class="text-sm text-ink-500">{{ row.label }}</span>
          <span :class="['text-sm font-medium text-ink-900', row.capitalize && 'capitalize']">
            {{ row.value }}
          </span>
        </div>
      </div>
    </section>

    <!-- Related -->
    <section v-if="data.related?.length">
      <h2 class="font-display text-2xl font-bold text-ink-900 mb-4">
        Related grants
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          v-for="g in data.related"
          :key="g.id"
          :to="`/grants/${g.id}`"
          class="card no-underline"
        >
          <div class="mb-2">
            <SourceBadge :type="g.source_type" />
          </div>
          <h3 class="font-display text-base font-semibold leading-tight mb-2 text-ink-900">
            {{ g.title }}
          </h3>
          <p class="text-xs text-ink-500 mb-3 truncate">{{ g.source_name }}</p>
          <div class="flex items-center justify-between text-sm">
            <span class="font-semibold text-brand-700">
              {{ g.amount_max ? fmt(null, g.amount_max) : 'Varies' }}
            </span>
            <DeadlinePill :deadline="g.deadline" />
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
