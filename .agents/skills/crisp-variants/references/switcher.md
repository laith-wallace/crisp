# Dev-only variant switcher patterns

One render site hosts the switcher. Every pattern carries the marker `data-crisp-variants` so the cleanup grep finds it, and every pattern is guarded so production renders the original.

## React / Next.js (client)

```tsx
import { Hero } from './Hero';

const VARIANTS = process.env.NODE_ENV !== 'production'
  ? {
      b: require('./Hero.variant-b').Hero,   // crisp-variant
      c: require('./Hero.variant-c').Hero,   // crisp-variant
    }
  : {};

export function HeroSlot(props: React.ComponentProps<typeof Hero>) {
  if (process.env.NODE_ENV === 'production') return <Hero {...props} />;
  const id = new URLSearchParams(globalThis.location?.search ?? '').get('variant') ?? 'a';
  const V = (VARIANTS as Record<string, typeof Hero>)[id] ?? Hero;
  return <div data-crisp-variants={id}><V {...props} /></div>;
}
```

Next.js App Router server components: read `searchParams.variant` in the page, guard with `process.env.NODE_ENV`, and use `next/dynamic` imports inside the guarded branch so variant files are tree-shaken from the production bundle. If the bundler still includes them, move the switch behind a dev-only route instead.

Hydration: read the query param in one place only (server `searchParams` or client after mount), never both, or the server and client render different variants.

## Vue / Nuxt

```vue
<script setup>
import Hero from './Hero.vue';
const id = import.meta.env.DEV ? (useRoute().query.variant ?? 'a') : 'a';
const comp = import.meta.env.DEV && id !== 'a'
  ? defineAsyncComponent(() => import(`./Hero.variant-${id}.vue`))   // crisp-variant
  : Hero;
</script>
<template><component :is="comp" v-bind="$attrs" :data-crisp-variants="import.meta.env.DEV ? id : undefined" /></template>
```

## Svelte / SvelteKit

```svelte
<script>
  import { dev } from '$app/environment';
  import { page } from '$app/stores';
  import Hero from './Hero.svelte';
  const load = { b: () => import('./Hero.variant-b.svelte'), c: () => import('./Hero.variant-c.svelte') }; // crisp-variant
  $: id = dev ? ($page.url.searchParams.get('variant') ?? 'a') : 'a';
</script>
{#if dev && load[id]}
  {#await load[id]() then m}<div data-crisp-variants={id}><svelte:component this={m.default} {...$$props} /></div>{/await}
{:else}
  <Hero {...$$props} />
{/if}
```

## Floating toggle (`--switcher floating`)

A fixed, bottom-right, dev-only control that rewrites `?variant=` and reloads. Keep it small, keyboard reachable, and out of the way:

```tsx
{process.env.NODE_ENV !== 'production' && (
  <nav data-crisp-variants="switcher" aria-label="Design variants"
       style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 2147483647, display: 'flex', gap: 4 }}>
    {['a', 'b', 'c'].map(v => (
      <a key={v} href={`?variant=${v}`} aria-current={v === id ? 'true' : undefined}>{v}</a>
    ))}
  </nav>
)}
```

Optional: number keys 1-5 switch variants. Bind them only inside the guard.

## Guard proof

```bash
npm run build
grep -rl "data-crisp-variants\|variant-b\|variant-c" .next/ dist/ build/ .svelte-kit/output/ 2>/dev/null   # must print nothing
```

If the grep finds a hit, the guard is not tree-shaking. Fix it before handover; never hand over with `GUARD UNPROVEN`.

## Cleanup grep

```bash
grep -rn "variant-[b-e]\|data-crisp-variants\|crisp-variant" src app components lib 2>/dev/null   # must print nothing
```
