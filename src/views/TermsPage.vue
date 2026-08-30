<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useDataStore } from "../stores/data";
import type { TermRecord } from "../types";
import "./TermsPage.css";

type ReviewStatus=TermRecord["status"];
const store=useDataStore();
const records=computed(()=>store.terms);
const query=ref("");
const domain=ref("全部专业");
const status=ref("全部状态");
const selectedIds=ref<string[]>([]);
const domains=computed(()=>["全部专业",...Array.from(new Set(records.value.map(x=>x.domain)))]);
const domainCount=(value:string)=>value==="全部专业"?records.value.length:records.value.filter(x=>x.domain===value).length;
const normalized=computed(()=>query.value.trim().toLocaleLowerCase());
const results=computed(()=>records.value.filter(item=>{
  const text=[item.id,item.zh,item.en,item.abbr,item.domain,item.subdomain,item.definition,item.unit,item.aliases.join(" "),item.source].join(" ").toLocaleLowerCase();
  return (!normalized.value||text.includes(normalized.value))&&(domain.value==="全部专业"||item.domain===domain.value)&&(status.value==="全部状态"||item.status===status.value);
}));
const reviewCounts=computed(()=>({approved:results.value.filter(item=>item.status==="已审核").length,rejected:results.value.filter(item=>item.status==="驳回").length,pending:results.value.filter(item=>item.status==="待审核").length}));
const allResultsSelected=computed(()=>results.value.length>0&&results.value.every(item=>selectedIds.value.includes(item.id)));
function setReviewStatus(ids:string[],nextStatus:ReviewStatus){const targets=new Set(ids);records.value.forEach(item=>{if(targets.has(item.id))item.status=nextStatus;});selectedIds.value=selectedIds.value.filter(id=>!targets.has(id));store.persist();}
function confirmReview(ids:string[],nextStatus:ReviewStatus,action:string){if(!ids.length)return;if(!window.confirm(`确认${action}选中的 ${ids.length} 条术语吗？\n确认后状态将变为“${nextStatus}”。`))return;setReviewStatus(ids,nextStatus);}
function toggleCurrentResults(){const currentIds=results.value.map(item=>item.id);selectedIds.value=allResultsSelected.value?selectedIds.value.filter(id=>!currentIds.includes(id)):Array.from(new Set([...selectedIds.value,...currentIds]));}
const addOpen=ref(false);const defaultDomains=["油藏与地质","钻井工程","完井与固井","采油工程","地面工程","储运工程","安全环保"];
const form=reactive({zh:"",en:"",abbr:"",domain:"钻井工程",subdomain:"",definition:"",unit:"",aliases:"",source:"用户新增",status:"待审核" as ReviewStatus});
function openAdd(){Object.assign(form,{zh:"",en:"",abbr:"",domain:domain.value==="全部专业"?"钻井工程":domain.value,subdomain:"",definition:"",unit:"",aliases:"",source:"用户新增",status:"待审核"});addOpen.value=true;}
function addTerm(){if(!form.zh.trim())return;const number=Math.max(0,...records.value.map(x=>Number(x.id.replace(/\D/g,""))||0))+1;store.addTerm({id:`T${String(number).padStart(4,"0")}`,zh:form.zh.trim(),en:form.en.trim(),abbr:form.abbr.trim(),domain:form.domain,subdomain:form.subdomain.trim(),definition:form.definition.trim(),unit:form.unit.trim(),aliases:form.aliases.split(/[、,;；]/).map(x=>x.trim()).filter(Boolean),source:form.source.trim(),status:form.status});domain.value=form.domain;addOpen.value=false;}
function deleteTerm(item:TermRecord){if(window.confirm(`确认删除术语“${item.zh}”吗？`)){store.deleteTerm(item.id);selectedIds.value=selectedIds.value.filter(id=>id!==item.id);}}
</script>

<template>
  <section class="data-page">
    <div class="data-heading"><div><h1>术语库</h1><p>石油工程规范术语、英文名称、缩写、定义和标准来源。</p></div><div class="heading-actions"><div class="term-count-summary"><div class="result-count">共 <b>{{ results.length }}</b> 条术语</div><div class="term-review-counts"><span class="approved"><i></i>审核通过 <b>{{ reviewCounts.approved }}</b></span><span class="rejected"><i></i>驳回 <b>{{ reviewCounts.rejected }}</b></span><span class="pending"><i></i>待审核 <b>{{ reviewCounts.pending }}</b></span></div></div><button class="library-add" @click="openAdd">＋ 新增</button><RouterLink class="home-return" to="/">← 返回首页</RouterLink></div></div>
    <div class="term-layout"><aside class="base-menu term-category"><button v-for="item in domains" :key="item" :class="{active:domain===item}" @click="domain=item"><span>{{ item }}</span><b>{{ domainCount(item) }}</b></button></aside><div class="term-content">
    <div class="filter-bar">
      <div class="search-box"><span>⌕</span><input v-model="query" placeholder="模糊查询中文、英文、缩写、定义、别名或来源"/><button v-if="query" @click="query=''">×</button></div>
      <select v-model="status"><option>全部状态</option><option>已审核</option><option>待审核</option><option>驳回</option></select>
    </div>
    <div class="term-batch-bar"><label><input type="checkbox" :checked="allResultsSelected" :disabled="!results.length" @change="toggleCurrentResults"/> 全选当前结果</label><span>已选择 {{ selectedIds.length }} 条</span><button class="approve" :disabled="!selectedIds.some(id=>records.find(item=>item.id===id)?.status==='待审核')" @click="confirmReview(selectedIds.filter(id=>records.find(item=>item.id===id)?.status==='待审核'),'已审核','批量审核')">批量审核</button><button class="reject" :disabled="!selectedIds.some(id=>records.find(item=>item.id===id)?.status!=='驳回')" @click="confirmReview(selectedIds.filter(id=>records.find(item=>item.id===id)?.status!=='驳回'),'驳回','批量驳回')">批量驳回</button><button class="restore" :disabled="!selectedIds.some(id=>records.find(item=>item.id===id)?.status==='驳回')" @click="confirmReview(selectedIds.filter(id=>records.find(item=>item.id===id)?.status==='驳回'),'已审核','恢复审核')">恢复已审核</button><button v-if="selectedIds.length" class="clear" @click="selectedIds=[]">取消选择</button></div>
    <div class="table-card term-table">
      <table><thead><tr><th><span class="sr-only">选择</span></th><th>编号</th><th>规范术语</th><th>英文/缩写</th><th>专业分类</th><th>定义</th><th>标准单位</th><th>来源</th><th>状态</th><th>操作</th></tr></thead>
        <tbody><tr v-for="item in results" :key="item.id" :class="{selected:selectedIds.includes(item.id)}"><td><input v-model="selectedIds" type="checkbox" :value="item.id" :aria-label="`选择${item.zh}`"/></td><td class="mono">{{ item.id }}</td><td><strong>{{ item.zh }}</strong><small v-if="item.aliases.length">别名：{{ item.aliases.join('、') }}</small></td><td>{{ item.en }}<small v-if="item.abbr">{{ item.abbr }}</small></td><td>{{ item.domain }}<small>{{ item.subdomain }}</small></td><td class="definition">{{ item.definition }}</td><td>{{ item.unit||'—' }}</td><td>{{ item.source }}</td><td><span class="review-status" :class="item.status==='已审核'?'approved':item.status==='驳回'?'rejected':'pending'">{{ item.status }}</span></td><td><div class="term-actions"><button class="approve" :disabled="item.status!=='待审核'" @click="confirmReview([item.id],'已审核',`审核术语“${item.zh}”`)">审核</button><button class="reject" :disabled="item.status==='驳回'" @click="confirmReview([item.id],'驳回',`驳回术语“${item.zh}”`)">驳回</button><button class="restore" :disabled="item.status!=='驳回'" title="将驳回状态恢复为已审核" @click="confirmReview([item.id],'已审核',`恢复术语“${item.zh}”`)">恢复</button><button class="delete" @click="deleteTerm(item)">删除</button></div></td></tr></tbody>
      </table><div v-if="!results.length" class="table-empty">没有找到匹配的术语，请调整查询条件。</div>
    </div></div></div>
  </section><div v-if="addOpen" class="library-modal" @click.self="addOpen=false"><form class="library-dialog large" @submit.prevent="addTerm"><header><div><h2>新增专业术语</h2><p>一次填写完整术语记录，保存后进入审核流程</p></div><button type="button" @click="addOpen=false">×</button></header><div class="library-form-grid"><label><span>规范中文名称 *</span><input v-model="form.zh" required/></label><label><span>英文名称</span><input v-model="form.en"/></label><label><span>缩写</span><input v-model="form.abbr"/></label><label><span>专业分类 *</span><select v-model="form.domain"><option v-for="item in defaultDomains" :key="item">{{item}}</option></select></label><label><span>二级分类</span><input v-model="form.subdomain"/></label><label><span>标准单位</span><input v-model="form.unit"/></label><label class="wide"><span>术语定义</span><textarea v-model="form.definition" rows="4"></textarea></label><label class="wide"><span>别名</span><input v-model="form.aliases" placeholder="多个别名用逗号或顿号分隔"/></label><label><span>来源</span><input v-model="form.source"/></label><label><span>审核状态</span><select v-model="form.status"><option>待审核</option><option>已审核</option><option>驳回</option></select></label></div><footer><button type="button" class="secondary" @click="addOpen=false">取消</button><button type="submit" class="primary">保存术语</button></footer></form></div>
</template>
