<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useDataStore } from "../stores/data";
import type { RuleRecord } from "../types";
import { executableRuleIds } from "../services/qualityEngine";
import "./RulesPage.css";

type ImplementationStatus="已实现"|"配置模板"|"待开发";
const store=useDataStore();
const records=computed(()=>store.rules);
const query=ref("");const type=ref("全部类型");const domain=ref("全部专业");const severity=ref("全部级别");const implementation=ref("全部状态");
const types=computed(()=>["全部类型",...Array.from(new Set(records.value.map(x=>x.type)))]);
const domains=computed(()=>["全部专业",...Array.from(new Set(records.value.map(x=>x.domain)))]);
const implementationStatus=(item:RuleRecord):ImplementationStatus=>executableRuleIds.has(item.id)?"已实现":item.template?"配置模板":"待开发";
const implementedCount=computed(()=>records.value.filter(item=>executableRuleIds.has(item.id)).length);
const results=computed(()=>{const keyword=query.value.trim().toLocaleLowerCase();return records.value.filter(item=>{
  const text=[item.id,item.name,item.type,item.domain,item.condition,item.message,item.source,item.scope].join(" ").toLocaleLowerCase();
  return (!keyword||text.includes(keyword))&&(type.value==="全部类型"||item.type===type.value)&&(domain.value==="全部专业"||item.domain===domain.value)&&(severity.value==="全部级别"||item.severity===severity.value)&&(implementation.value==="全部状态"||implementationStatus(item)===implementation.value);
});});
const addOpen=ref(false);const ruleTypes:RuleRecord["type"][]=["术语规范","单位格式","数值范围","字段完整性","逻辑关系","时间顺序","编码命名"];const ruleDomains=["通用","油藏与地质","钻井工程","完井与固井","采油工程","地面工程"];
const form=reactive({name:"",type:"逻辑关系" as RuleRecord["type"],domain:"通用",severity:"警告" as RuleRecord["severity"],condition:"",message:"",source:"用户新增",scope:"全部文档",status:"启用" as RuleRecord["status"]});
function openAdd(){Object.assign(form,{name:"",type:"逻辑关系",domain:"通用",severity:"警告",condition:"",message:"",source:"用户新增",scope:"全部文档",status:"启用"});addOpen.value=true;}
function addRule(){if(!form.name.trim()||!form.condition.trim())return;const number=Math.max(0,...records.value.map(x=>Number(x.id.replace(/\D/g,""))||0))+1;store.addRule({id:`R${String(number).padStart(4,"0")}`,...form,name:form.name.trim(),condition:form.condition.trim(),message:form.message.trim(),template:true});addOpen.value=false;}
function deleteRule(item:RuleRecord){if(window.confirm(`确认删除规则“${item.name}”吗？`))store.deleteRule(item.id);}
</script>

<template>
  <section class="data-page rules-page">
    <div class="data-heading"><div><h1>规则库</h1><p>石油工程术语、单位、数据范围与业务逻辑质控规则。</p></div><div class="heading-actions"><div class="result-count">共 <b>{{ results.length }}</b> 条规则</div><button class="library-add" @click="openAdd">＋ 新增</button><RouterLink class="home-return" to="/">← 返回首页</RouterLink></div></div>
    <div class="rule-notice"><strong>初级版本</strong><span>规则库共 {{ records.length }} 条，其中 {{ implementedCount }} 条已接入质控引擎；配置模板和待开发规则目前不会参与校验。</span></div>
    <div class="filter-bar">
      <div class="search-box"><span>⌕</span><input v-model="query" placeholder="模糊查询规则名称、条件、提示、依据或适用范围"/><button v-if="query" @click="query=''">×</button></div>
      <select v-model="type"><option v-for="item in types" :key="item">{{ item }}</option></select>
      <select v-model="domain"><option v-for="item in domains" :key="item">{{ item }}</option></select>
      <select v-model="severity"><option>全部级别</option><option>错误</option><option>警告</option><option>建议</option></select>
      <select v-model="implementation"><option>全部状态</option><option>已实现</option><option>配置模板</option><option>待开发</option></select>
    </div>
    <div class="table-card rule-table"><table><thead><tr><th>编号</th><th>规则名称</th><th>类型/专业</th><th>级别</th><th>校验条件</th><th>提示信息</th><th>依据/范围</th><th>状态</th><th>操作</th></tr></thead><tbody>
      <tr v-for="item in results" :key="item.id"><td class="mono">{{ item.id }}</td><td><strong>{{ item.name }}</strong><small v-if="item.template" class="template-tag">建议模板</small></td><td>{{ item.type }}<small>{{ item.domain }}</small></td><td><span class="severity" :class="item.severity">{{ item.severity }}</span></td><td class="definition">{{ item.condition }}</td><td class="definition">{{ item.message }}</td><td>{{ item.source }}<small>{{ item.scope }}</small></td><td><span class="implementation-status" :class="implementationStatus(item)">{{ implementationStatus(item) }}</span></td><td><button class="library-delete" @click="deleteRule(item)">删除</button></td></tr>
    </tbody></table><div v-if="!results.length" class="table-empty">没有找到匹配的规则，请调整查询条件。</div></div>
  </section><div v-if="addOpen" class="library-modal" @click.self="addOpen=false"><form class="library-dialog large" @submit.prevent="addRule"><header><div><h2>新增质控规则</h2><p>规则以标准结构保存，便于后续同步数据库与规则引擎</p></div><button type="button" @click="addOpen=false">×</button></header><div class="library-form-grid"><label class="wide"><span>规则名称 *</span><input v-model="form.name" required/></label><label><span>规则类型 *</span><select v-model="form.type"><option v-for="item in ruleTypes" :key="item">{{item}}</option></select></label><label><span>所属专业 *</span><select v-model="form.domain"><option v-for="item in ruleDomains" :key="item">{{item}}</option></select></label><label><span>问题级别 *</span><select v-model="form.severity"><option>错误</option><option>警告</option><option>建议</option></select></label><label><span>适用范围</span><input v-model="form.scope"/></label><label class="wide"><span>校验条件 *</span><textarea v-model="form.condition" required rows="3"></textarea></label><label class="wide"><span>提示信息</span><textarea v-model="form.message" rows="3"></textarea></label><label><span>规则依据</span><input v-model="form.source"/></label><label><span>状态</span><select v-model="form.status"><option>启用</option><option>停用</option></select></label></div><footer><button type="button" class="secondary" @click="addOpen=false">取消</button><button type="submit" class="primary">保存规则</button></footer></form></div>
</template>
