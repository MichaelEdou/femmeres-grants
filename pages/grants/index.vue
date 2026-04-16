<script setup lang="ts">
useHead({ title: "Grants — Femmeres Grants" });

const route = useRoute();
const router = useRouter();

const page = computed(() => parseInt((route.query.page as string) ?? "1") || 1);
const search = ref((route.query.search as string) ?? "");
const sourceType = ref((route.query.sourceType as string) ?? "");
const category = ref((route.query.category as string) ?? "");
const status = ref((route.query.status as string) ?? "");
const sort = ref((route.query.sort as string) ?? "deadline");

const query = computed(() => ({
  page: page.value,
  search: search.value,
  sourceType: sourceType.value,
  category: category.value,
  status: status.value,
  sort: sort.value,
  limit: 20,
}));

const { data, pending } = await useFetch<any>("/api/grants", { query });

const sourceTypes = ["federal", "provincial", "municipal", "foundation", "private"];
const categories = ["Women", "GBV", "Employment", "Immigration", "Youth", "Education", "Health", "Culture", "Environment", "General"];
const statuses = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "closing", label: "Closing soon" },
  { value: "closed", label: "Closed" },
];
const sorts = [
  { value: "deadline", label: "Deadline (soonest)" },
  { value: "amount", label: "Amount (highest)" },
  { value: "newest", label: "Recently added" },
];

function updateQuery(k: string, v: string) {
  const q = { ...route.query };
  if (v) q[k] = v;
  else delete q[k];
  delete q.page;
  router.push({ query: q });
}

function submitSearch() {
  updateQuery("search", search.value);
}

function goToPage(p: number) {
  router.push({ query: { ...route.query, page: p } });
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-10">
    <!-- Header -->
    <section class="mb-8">
      <h1 class="font-display text-4xl font-bold tracking-tight text-ink-900 mb-2">
        Grants
      </h1>
      <p class="text-ink-600">
        {{ data?.total ?? 0 }} non-refundable grants available for Femmeres.
      </p>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      <!-- Filter sidebar -->
      <aside class="space-y-6">
        <div>
          <label class="block text-xs font-semibold tracking-wider uppercase text-ink-500 mb-2">
            Search
          </label>
          <form @submit.prevent="submitSearch">
            <input
              v-model="search"
              type="text"
              placeholder="Keywords…"
              class="input"
            />
          </form>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-wider uppercase text-ink-500 mb-2">
            Source
          </label>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="updateQuery('sourceType', '')"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                !sourceType
                  ? 'bg-brand-700 text-white'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-brand-400',
              ]"
            >
              All
            </button>
            <button
              v-for="t in sourceTypes"
              :key="t"
              @click="updateQuery('sourceType', t)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors',
                sourceType === t
                  ? 'bg-brand-700 text-white'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-brand-400',
              ]"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-wider uppercase text-ink-500 mb-2">
            Category
          </label>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="updateQuery('category', '')"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                !category
                  ? 'bg-brand-700 text-white'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-brand-400',
              ]"
            >
              All
            </button>
            <button
              v-for="c in categories"
              :key="c"
              @click="updateQuery('category', c)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                category === c
                  ? 'bg-brand-700 text-white'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-brand-400',
              ]"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-wider uppercase text-ink-500 mb-2">
            Status
          </label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="s in statuses"
              :key="s.value"
              @click="updateQuery('status', s.value)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                status === s.value
                  ? 'bg-brand-700 text-white'
                  : 'bg-white border border-ink-200 text-ink-700 hover:border-brand-400',
              ]"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold tracking-wider uppercase text-ink-500 mb-2">
            Sort by
          </label>
          <select
            v-model="sort"
            @change="updateQuery('sort', sort)"
            class="input"
          >
            <option v-for="s in sorts" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
      </aside>

      <!-- Grid -->
      <div>
        <div v-if="pending" class="text-center py-20 text-ink-500">Loading…</div>
        <div v-else-if="!data?.grants?.length" class="card text-center py-16">
          <p class="text-ink-700 mb-2 font-medium">No grants match your filters.</p>
          <p class="text-sm text-ink-500">Try clearing filters or a different search term.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GrantCard v-for="g in data.grants" :key="g.id" :grant="g" />
        </div>

        <!-- Pagination -->
        <div v-if="data && data.totalPages > 1" class="flex items-center justify-center gap-3 mt-8">
          <button
            v-if="page > 1"
            @click="goToPage(page - 1)"
            class="btn-outline"
          >
            ← Previous
          </button>
          <span class="text-sm text-ink-500">
            Page {{ page }} of {{ data.totalPages }}
          </span>
          <button
            v-if="page < data.totalPages"
            @click="goToPage(page + 1)"
            class="btn-outline"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
