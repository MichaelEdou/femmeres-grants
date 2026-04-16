<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const { data, refresh, pending } = await useFetch<any>(`/api/applications/${id}`);

useHead({
  title: () => (data.value?.grant?.title ? `Workspace — ${data.value.grant.title}` : "Application workspace"),
});

const status = ref<string>("");
const notes = ref<string>("");
const drafts = ref<Array<{ question: string; answer: string }>>([]);
const saving = ref(false);

watchEffect(() => {
  if (data.value) {
    status.value = data.value.status ?? "interested";
    notes.value = data.value.notes ?? "";
    const draftAnswers = data.value.draft_answers;
    drafts.value = Array.isArray(draftAnswers) && draftAnswers.length > 0
      ? draftAnswers
      : [{ question: "Organization overview & mission alignment", answer: "" }];
  }
});

const statusOptions = [
  { value: "interested", label: "Interested" },
  { value: "drafting", label: "Drafting" },
  { value: "submitted", label: "Submitted" },
  { value: "awarded", label: "Awarded" },
  { value: "declined", label: "Declined" },
];

async function save(partial: any) {
  saving.value = true;
  try {
    await $fetch(`/api/applications/${id}`, {
      method: "PATCH",
      body: partial,
    });
  } finally {
    saving.value = false;
  }
}

function addDraft() {
  drafts.value.push({ question: "", answer: "" });
}

function removeDraft(i: number) {
  drafts.value.splice(i, 1);
  save({ draftAnswers: drafts.value });
}

async function deleteApp() {
  if (!confirm("Stop tracking this grant? Your notes and drafts will be lost.")) return;
  await $fetch(`/api/applications/${id}`, { method: "DELETE" });
  router.push("/applications");
}

function fmtAmt(min: any, max: any) {
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
</script>

<template>
  <div v-if="pending" class="mx-auto max-w-3xl px-6 py-20 text-center text-ink-500">
    Loading application…
  </div>
  <div v-else-if="!data" class="mx-auto max-w-3xl px-6 py-20 text-center">
    <p class="text-ink-700 mb-2">Application not found.</p>
    <NuxtLink to="/applications" class="text-brand-700">← Back to applications</NuxtLink>
  </div>
  <div v-else class="mx-auto max-w-4xl px-6 py-10">
    <NuxtLink
      to="/applications"
      class="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-700 mb-6 no-underline"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to applications
    </NuxtLink>

    <!-- Grant summary -->
    <div class="card mb-6">
      <div class="flex items-center gap-2 mb-3">
        <SourceBadge :type="data.grant.source_type" />
        <span class="text-sm text-ink-500">{{ data.grant.source_name }}</span>
      </div>
      <h1 class="font-display text-3xl font-bold text-ink-900 mb-4">
        {{ data.grant.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-5">
        <div>
          <p class="text-xs text-ink-500 mb-1">Funding</p>
          <p class="font-semibold text-brand-700">
            {{ fmtAmt(data.grant.amount_min, data.grant.amount_max) }}
          </p>
        </div>
        <div>
          <p class="text-xs text-ink-500 mb-1">Deadline</p>
          <DeadlinePill :deadline="data.grant.deadline" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-ink-500 mb-1">Grant type</p>
          <p class="font-medium text-ink-900">Non-refundable contribution</p>
        </div>
      </div>
    </div>

    <!-- Status + actions -->
    <div class="flex flex-wrap items-center gap-3 mb-8">
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold tracking-wider uppercase text-ink-500">
          Status
        </label>
        <select
          v-model="status"
          @change="save({ status })"
          class="input !py-2 !w-auto"
        >
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>
      <span v-if="saving" class="text-xs text-ink-500">Saving…</span>
      <div class="flex-1" />
      <a
        v-if="data.grant.source_url"
        :href="data.grant.source_url"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-outline"
      >
        Visit source
      </a>
      <button @click="deleteApp" class="btn-outline !border-red-200 !text-red-700 hover:!border-red-400">
        Stop tracking
      </button>
    </div>

    <!-- Notes -->
    <section class="mb-6">
      <label class="block font-semibold text-ink-900 mb-2">Notes</label>
      <textarea
        v-model="notes"
        @blur="save({ notes })"
        rows="4"
        placeholder="Internal notes about this application…"
        class="textarea"
      />
    </section>

    <!-- Draft answers -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <label class="font-semibold text-ink-900">Draft answers</label>
        <button
          @click="addDraft"
          class="text-xs font-medium text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1 rounded-full"
        >
          + Add section
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(d, i) in drafts"
          :key="i"
          class="card !p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <input
              v-model="d.question"
              @blur="save({ draftAnswers: drafts })"
              placeholder="Section title / question…"
              class="flex-1 font-medium text-ink-900 bg-transparent focus:outline-none"
            />
            <button
              @click="removeDraft(i)"
              class="text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          <textarea
            v-model="d.answer"
            @blur="save({ draftAnswers: drafts })"
            rows="5"
            placeholder="Write your draft response…"
            class="w-full bg-transparent text-ink-700 focus:outline-none resize-vertical"
          />
        </div>
      </div>
    </section>

    <!-- Grant reference -->
    <details class="card !p-0">
      <summary class="cursor-pointer px-6 py-4 font-medium text-ink-700 hover:text-ink-900">
        Grant details (reference)
      </summary>
      <div class="border-t border-ink-100 px-6 py-5 space-y-4 text-sm text-ink-700">
        <div v-if="data.grant.description">
          <h4 class="font-semibold text-ink-900 mb-1">Description</h4>
          <p class="whitespace-pre-line leading-relaxed">{{ data.grant.description }}</p>
        </div>
        <div v-if="data.grant.eligibility">
          <h4 class="font-semibold text-ink-900 mb-1">Eligibility</h4>
          <p class="whitespace-pre-line leading-relaxed">{{ data.grant.eligibility }}</p>
        </div>
        <div v-if="data.grant.how_to_apply">
          <h4 class="font-semibold text-ink-900 mb-1">How to apply</h4>
          <p class="whitespace-pre-line leading-relaxed">{{ data.grant.how_to_apply }}</p>
        </div>
      </div>
    </details>
  </div>
</template>
