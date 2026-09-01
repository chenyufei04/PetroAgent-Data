import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "./views/HomePage.vue";
import BlankPage from "./views/BlankPage.vue";
import ImportPage from "./views/ImportPage.vue";
import TermsPage from "./views/TermsPage.vue";
import BaseDataPage from "./views/BaseDataPage.vue";
import RulesPage from "./views/RulesPage.vue";
import QualityPage from "./views/QualityPage.vue";
import CheckPage from "./views/CheckPage.vue";
import PreprocessingPage from "./views/PreprocessingPage.vue";

export const pages = [
  { path: "/", name: "home", label: "首页", icon: "⌂" },
  { path: "/quality", name: "quality", label: "数据质控", icon: "◇" },
  { path: "/rules", name: "rules", label: "规则库", icon: "▤" },
  { path: "/terms", name: "terms", label: "术语库", icon: "T" },
  { path: "/base", name: "base", label: "基础数据", icon: "D" },
  { path: "/import", name: "import", label: "数据导入", icon: "↑" },
  { path: "/preprocessing", name: "preprocessing", label: "数据预处理", icon: "⚙" },
  { path: "/check", name: "check", label: "规则自检", icon: "✓" },
] as const;

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    ...pages.map(page => ({
      path: page.path,
      name: page.name,
      component: page.name === "home" ? HomePage : page.name === "import" ? ImportPage : page.name === "preprocessing" ? PreprocessingPage : page.name === "terms" ? TermsPage : page.name === "base" ? BaseDataPage : page.name === "rules" ? RulesPage : page.name === "quality" ? QualityPage : page.name === "check" ? CheckPage : BlankPage,
      meta: { label: page.label },
    })),
  ],
});
