<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { termRecords } from "../data/seed";
import type { TermRecord } from "../types";
import "./TermsPage.css";

type ReviewStatus=TermRecord["status"];
const storageKey="petroleum-term-review-statuses";
const savedStatuses=(()=>{try{return JSON.parse(localStorage.getItem(storageKey)??"{}") as Record<string,ReviewStatus>;}catch{return {};}})();
const records=ref<TermRecord[]>(termRecords.map(item=>({...item,status:savedStatuses[item.id]??item.status})));
const query=ref("");
const domain=ref("全部专业");
const status=ref("全部状态");
const selectedIds=ref<string[]>([]);
const domains=["全部专业",...Array.from(new Set(termRecords.map(x=>x.domain)))];
const normalized=computed(()=>query.value.trim().toLocaleLowerCase());
const results=computed(()=>records.value.filter(item=>{
  const text=[item.id,item.zh,item.en,item.abbr,item.domain,item.subdomain,item.definition,item.unit,item.aliases.join(" "),item.source].join(" ").toLocaleLowerCase();
  return (!normalized.value||text.includes(normalized.value))&&(domain.value==="全部专业"||item.domain===domain.value)&&(status.value==="全部状态"||item.status===status.value);
}));
const reviewCounts=computed(()=>({approved:results.value.filter(item=>item.status==="已审核").length,rejected:results.value.filter(item=>item.status==="驳回").length,pending:results.value.filter(item=>item.status==="待审核").length}));
const allResultsSelected=computed(()=>results.value.length>0&&results.value.every(item=>selectedIds.value.includes(item.id)));
watch(records,value=>localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(value.map(item=>[item.id,item.status])))),{deep:true});
function setReviewStatus(ids:string[],nextStatus:ReviewStatus){const targets=new Set(ids);records.value.forEach(item=>{if(targets.has(item.id))item.status=nextStatus;});selectedIds.value=selectedIds.value.filter(id=>!targets.has(id));}
function confirmReview(ids:string[],nextStatus:ReviewStatus,action:string){if(!ids.length)return;if(!window.confirm(`确认${action}选中的 ${ids.length} 条术语吗？\n确认后状态将变为“${nextStatus}”。`))return;setReviewStatus(ids,nextStatus);}
function toggleCurrentResults(){const currentIds=results.value.map(item=>item.id);selectedIds.value=allResultsSelected.value?selectedIds.value.filter(id=>!currentIds.includes(id)):Array.from(new Set([...selectedIds.value,...currentIds]));}
</script>

<template>
  <section class="data-page">
    <div class="data-heading"><div><h1>术语库</h1><p>石油工程规范术语、英文名称、缩写、定义和标准来源。</p></div><div class="term-count-summary"><div class="result-count">共 <b>{{ results.length }}</b> 条术语</div><div class="term-review-counts"><span class="approved"><i></i>审核通过 <b>{{ reviewCounts.approved }}</b></span><span class="rejected"><i></i>驳回 <b>{{ reviewCounts.rejected }}</b></span><span class="pending"><i></i>待审核 <b>{{ reviewCounts.pending }}</b></span></div></div></div>
    <div class="filter-bar">
      <div class="search-box"><span>⌕</span><input v-model="query" placeholder="模糊查询中文、英文、缩写、定义、别名或来源"/><button v-if="query" @click="query=''">×</button></div>
      <select v-model="domain"><option v-for="item in domains" :key="item">{{ item }}</option></select>
      <select v-model="status"><option>全部状态</option><option>已审核</option><option>待审核</option><option>驳回</option></select>
    </div>
    <div class="term-batch-bar"><label><input type="checkbox" :checked="allResultsSelected" :disabled="!results.length" @change="toggleCurrentResults"/> 全选当前结果</label><span>已选择 {{ selectedIds.length }} 条</span><button class="approve" :disabled="!selectedIds.some(id=>records.find(item=>item.id===id)?.status==='待审核')" @click="confirmReview(selectedIds.filter(id=>records.find(item=>item.id===id)?.status==='待审核'),'已审核','批量审核')">批量审核</button><button class="reject" :disabled="!selectedIds.some(id=>records.find(item=>item.id===id)?.status!=='驳回')" @click="confirmReview(selectedIds.filter(id=>records.find(item=>item.id===id)?.status!=='驳回'),'驳回','批量驳回')">批量驳回</button><button class="restore" :disabled="!selectedIds.some(id=>records.find(item=>item.id===id)?.status==='驳回')" @click="confirmReview(selectedIds.filter(id=>records.find(item=>item.id===id)?.status==='驳回'),'已审核','恢复审核')">恢复已审核</button><button v-if="selectedIds.length" class="clear" @click="selectedIds=[]">取消选择</button></div>
    <div class="table-card term-table">
      <table><thead><tr><th><span class="sr-only">选择</span></th><th>编号</th><th>规范术语</th><th>英文/缩写</th><th>专业分类</th><th>定义</th><th>标准单位</th><th>来源</th><th>状态</th><th>操作</th></tr></thead>
        <tbody><tr v-for="item in results" :key="item.id" :class="{selected:selectedIds.includes(item.id)}"><td><input v-model="selectedIds" type="checkbox" :value="item.id" :aria-label="`选择${item.zh}`"/></td><td class="mono">{{ item.id }}</td><td><strong>{{ item.zh }}</strong><small v-if="item.aliases.length">别名：{{ item.aliases.join('、') }}</small></td><td>{{ item.en }}<small v-if="item.abbr">{{ item.abbr }}</small></td><td>{{ item.domain }}<small>{{ item.subdomain }}</small></td><td class="definition">{{ item.definition }}</td><td>{{ item.unit||'—' }}</td><td>{{ item.source }}</td><td><span class="review-status" :class="item.status==='已审核'?'approved':item.status==='驳回'?'rejected':'pending'">{{ item.status }}</span></td><td><div class="term-actions"><button class="approve" :disabled="item.status!=='待审核'" @click="confirmReview([item.id],'已审核',`审核术语“${item.zh}”`)">审核</button><button class="reject" :disabled="item.status==='驳回'" @click="confirmReview([item.id],'驳回',`驳回术语“${item.zh}”`)">驳回</button><button class="restore" :disabled="item.status!=='驳回'" title="将驳回状态恢复为已审核" @click="confirmReview([item.id],'已审核',`恢复术语“${item.zh}”`)">恢复</button></div></td></tr></tbody>
      </table><div v-if="!results.length" class="table-empty">没有找到匹配的术语，请调整查询条件。</div>
    </div>
  </section>
</template>
