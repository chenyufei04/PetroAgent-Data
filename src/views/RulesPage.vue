<script setup lang="ts">
import { computed, ref } from "vue";
import { ruleRecords } from "../data/seed";
import { executableRuleIds } from "../services/qualityEngine";
import "./RulesPage.css";

type ImplementationStatus="已实现"|"配置模板"|"待开发";
const query=ref("");const type=ref("全部类型");const domain=ref("全部专业");const severity=ref("全部级别");const implementation=ref("全部状态");
const types=["全部类型",...Array.from(new Set(ruleRecords.map(x=>x.type)))];
const domains=["全部专业",...Array.from(new Set(ruleRecords.map(x=>x.domain)))];
const implementationStatus=(item:typeof ruleRecords[number]):ImplementationStatus=>executableRuleIds.has(item.id)?"已实现":item.template?"配置模板":"待开发";
const implementedCount=ruleRecords.filter(item=>executableRuleIds.has(item.id)).length;
const results=computed(()=>{const keyword=query.value.trim().toLocaleLowerCase();return ruleRecords.filter(item=>{
  const text=[item.id,item.name,item.type,item.domain,item.condition,item.message,item.source,item.scope].join(" ").toLocaleLowerCase();
  return (!keyword||text.includes(keyword))&&(type.value==="全部类型"||item.type===type.value)&&(domain.value==="全部专业"||item.domain===domain.value)&&(severity.value==="全部级别"||item.severity===severity.value)&&(implementation.value==="全部状态"||implementationStatus(item)===implementation.value);
});});
</script>

<template>
  <section class="data-page rules-page">
    <div class="data-heading"><div><h1>规则库</h1><p>石油工程术语、单位、数据范围与业务逻辑质控规则。</p></div><div class="heading-actions"><div class="result-count">共 <b>{{ results.length }}</b> 条规则</div><RouterLink class="home-return" to="/">← 返回首页</RouterLink></div></div>
    <div class="rule-notice"><strong>初级版本</strong><span>规则库共 {{ ruleRecords.length }} 条，其中 {{ implementedCount }} 条已接入质控引擎；配置模板和待开发规则目前不会参与校验。</span></div>
    <div class="filter-bar">
      <div class="search-box"><span>⌕</span><input v-model="query" placeholder="模糊查询规则名称、条件、提示、依据或适用范围"/><button v-if="query" @click="query=''">×</button></div>
      <select v-model="type"><option v-for="item in types" :key="item">{{ item }}</option></select>
      <select v-model="domain"><option v-for="item in domains" :key="item">{{ item }}</option></select>
      <select v-model="severity"><option>全部级别</option><option>错误</option><option>警告</option><option>建议</option></select>
      <select v-model="implementation"><option>全部状态</option><option>已实现</option><option>配置模板</option><option>待开发</option></select>
    </div>
    <div class="table-card rule-table"><table><thead><tr><th>编号</th><th>规则名称</th><th>类型/专业</th><th>级别</th><th>校验条件</th><th>提示信息</th><th>依据/范围</th><th>状态</th></tr></thead><tbody>
      <tr v-for="item in results" :key="item.id"><td class="mono">{{ item.id }}</td><td><strong>{{ item.name }}</strong><small v-if="item.template" class="template-tag">建议模板</small></td><td>{{ item.type }}<small>{{ item.domain }}</small></td><td><span class="severity" :class="item.severity">{{ item.severity }}</span></td><td class="definition">{{ item.condition }}</td><td class="definition">{{ item.message }}</td><td>{{ item.source }}<small>{{ item.scope }}</small></td><td><span class="implementation-status" :class="implementationStatus(item)">{{ implementationStatus(item) }}</span></td></tr>
    </tbody></table><div v-if="!results.length" class="table-empty">没有找到匹配的规则，请调整查询条件。</div></div>
  </section>
</template>
