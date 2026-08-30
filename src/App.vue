<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { pages } from "./router";
import "./return-home.css";
import "./library-management.css";
import "./library-dialog.css";
import { useDataStore } from "./stores/data";

const route = useRoute();
const store = useDataStore();
const activeName = computed(() => route.name as string);
watch(() => route.meta.label, label => { document.title = `${String(label)} - 石油工程数据质控`; }, { immediate: true });
</script>

<template>
  <div class="app-shell">
    <aside class="side-panel">
      <RouterLink class="side-brand" to="/"><span class="brand-mark">⌁</span><span class="brand-copy"><strong>石油工程数据质控</strong><small>管理平台</small></span></RouterLink>
      <nav class="side-nav" aria-label="主导航"><p>导航</p><RouterLink v-for="page in pages" :key="page.name" :class="{ active: activeName === page.name }" :to="page.path"><span class="nav-icon">{{ page.icon }}</span><span class="nav-label">{{ page.label }}</span></RouterLink></nav>
      <div class="side-summary"><span><i class="status-dot" />系统服务正常</span><small>术语 {{ store.termCount }} 条 · 规则 {{ store.ruleCount }} 条</small></div>
    </aside>
    <main class="workspace"><RouterView /></main>
  </div>
</template>
