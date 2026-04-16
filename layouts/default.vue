<script setup lang="ts">
const route = useRoute();

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/grants", label: "Grants" },
  { to: "/applications", label: "Applications" },
  { to: "/settings", label: "Settings" },
];

const isActive = (to: string) => {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
};
</script>

<template>
  <div class="min-h-screen bg-cream">
    <header class="sticky top-0 z-40 border-b border-ink-100 bg-cream/80 backdrop-blur-md">
      <div class="mx-auto max-w-6xl px-6">
        <div class="flex h-16 items-center justify-between">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 text-ink-900 no-underline"
          >
            <span class="grid place-items-center w-9 h-9 rounded-full bg-brand-700 text-white font-display text-lg font-bold">
              F
            </span>
            <span class="font-display text-lg font-bold tracking-tight">
              Femmeres <span class="text-brand-700">Grants</span>
            </span>
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              :class="['pill-nav', isActive(link.to) ? 'active' : '']"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <div class="hidden md:flex items-center gap-3">
            <span class="hidden lg:flex items-center gap-2 text-xs text-ink-500">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
              Gatineau, QC
            </span>
          </div>

          <button
            class="md:hidden p-2 rounded-full hover:bg-ink-100"
            aria-label="Open menu"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <div class="md:hidden border-t border-ink-100">
        <nav class="flex items-center gap-1 px-6 py-2 overflow-x-auto">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :class="['pill-nav whitespace-nowrap', isActive(link.to) ? 'active' : '']"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
