<script setup lang="ts">
useHead({ title: "Settings — Femmeres Grants" });

const { data: profile, refresh } = await useFetch<any>("/api/settings/profile");

const form = reactive({
  name: profile.value?.name ?? "Femmeres",
  mission: profile.value?.mission ?? "",
  registrationNumber: profile.value?.registration_number ?? "",
  contactEmail: profile.value?.contact_email ?? "",
  contactPhone: profile.value?.contact_phone ?? "",
  address: profile.value?.address ?? "",
  city: profile.value?.city ?? "Gatineau",
  province: profile.value?.province ?? "QC",
});

const saving = ref(false);
const saved = ref(false);

async function saveProfile() {
  saving.value = true;
  saved.value = false;
  try {
    await $fetch("/api/settings/profile", { method: "PUT", body: form });
    saved.value = true;
    setTimeout(() => (saved.value = false), 2500);
  } finally {
    saving.value = false;
  }
}

const fields: Array<{ key: keyof typeof form; label: string; type?: string; wide?: boolean; hint?: string }> = [
  { key: "name", label: "Organization name" },
  { key: "registrationNumber", label: "Registration / CRA number" },
  { key: "contactEmail", label: "Contact email", type: "email" },
  { key: "contactPhone", label: "Contact phone", type: "tel" },
  { key: "address", label: "Street address", wide: true },
  { key: "city", label: "City" },
  { key: "province", label: "Province", hint: "e.g. QC" },
  { key: "mission", label: "Mission statement", wide: true, hint: "Used as boilerplate for grant applications" },
];
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-10">
    <div class="mb-8">
      <h1 class="font-display text-4xl font-bold tracking-tight text-ink-900 mb-2">
        Settings
      </h1>
      <p class="text-ink-600">
        Your organization profile powers grant application boilerplate and helps match relevant opportunities.
      </p>
    </div>

    <!-- Org profile -->
    <section class="mb-10">
      <div class="card">
        <h2 class="font-display text-2xl font-bold text-ink-900 mb-6">
          Organization profile
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            v-for="f in fields"
            :key="f.key"
            :class="f.wide ? 'md:col-span-2' : ''"
          >
            <label class="block text-xs font-semibold tracking-wider uppercase text-ink-500 mb-2">
              {{ f.label }}
            </label>
            <textarea
              v-if="f.key === 'mission'"
              v-model="form.mission"
              rows="4"
              class="textarea"
              placeholder="Describe your organization's mission…"
            />
            <input
              v-else
              v-model="form[f.key]"
              :type="f.type || 'text'"
              class="input"
            />
            <p v-if="f.hint" class="text-xs text-ink-400 mt-1">{{ f.hint }}</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-ink-100">
          <span v-if="saved" class="text-sm text-green-700 font-medium">
            ✓ Saved
          </span>
          <button
            @click="saveProfile"
            :disabled="saving"
            class="btn-primary disabled:opacity-50"
          >
            {{ saving ? "Saving…" : "Save profile" }}
          </button>
        </div>
      </div>
    </section>

    <!-- About -->
    <section>
      <div class="card bg-brand-50 border-brand-200">
        <h2 class="font-display text-xl font-bold text-ink-900 mb-2">
          About Femmeres Grants
        </h2>
        <p class="text-sm text-ink-600 leading-relaxed mb-4">
          This platform curates only <strong>non-refundable</strong> grants — contributions that do not need to be repaid. We focus on opportunities available to women-serving NGOs in Gatineau and across Canada.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div class="bg-white rounded-lg p-3 border border-brand-100">
            <p class="text-xs text-ink-500 mb-1">Focus</p>
            <p class="font-medium text-ink-900">Women & gender equality</p>
          </div>
          <div class="bg-white rounded-lg p-3 border border-brand-100">
            <p class="text-xs text-ink-500 mb-1">Region</p>
            <p class="font-medium text-ink-900">Outaouais · Canada</p>
          </div>
          <div class="bg-white rounded-lg p-3 border border-brand-100">
            <p class="text-xs text-ink-500 mb-1">Type</p>
            <p class="font-medium text-ink-900">Non-repayable only</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
