<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useDataStore } from "../stores/data";
import type { BaseRecord } from "../types";
const store=useDataStore();
const records=computed(()=>store.base);

const types:BaseRecord["type"][]=["专业分类","计量单位","常用缩写","数据来源"];
const activeType=ref<BaseRecord["type"]>("专业分类");
const query=ref("");
const results=computed(()=>{const keyword=query.value.trim().toLocaleLowerCase();return records.value.filter(item=>item.type===activeType.value&&(!keyword||[item.id,item.name,item.code,item.description,item.parent].join(" ").toLocaleLowerCase().includes(keyword)));});
const count=(type:BaseRecord["type"])=>records.value.filter(x=>x.type===type).length;
const addOpen=ref(false);const form=reactive({type:"专业分类" as BaseRecord["type"],name:"",code:"",parent:"",description:"",status:"启用" as BaseRecord["status"]});
function openAdd(){Object.assign(form,{type:activeType.value,name:"",code:"",parent:activeType.value,description:"",status:"启用"});addOpen.value=true;}
function addRecord(){if(!form.name.trim())return;const number=Math.max(0,...records.value.map(x=>Number(x.id.replace(/\D/g,""))||0))+1;store.addBase({id:`B${String(number).padStart(4,"0")}`,...form,name:form.name.trim(),code:form.code.trim(),parent:form.parent.trim(),description:form.description.trim()});activeType.value=form.type;addOpen.value=false;}
function deleteRecord(item:BaseRecord){if(window.confirm(`确认删除基础数据“${item.name}”吗？`))store.deleteBase(item.id);}
</script>

<template>
  <section class="data-page">
    <div class="data-heading"><div><h1>基础数据</h1><p>维护术语质控使用的专业分类、计量单位、缩写和权威来源。</p></div><div class="heading-actions"><div class="result-count">当前 <b>{{ results.length }}</b> 条</div><button class="library-add" @click="openAdd">＋ 新增</button><RouterLink class="home-return" to="/">← 返回首页</RouterLink></div></div>
    <div class="base-layout">
      <aside class="base-menu"><button v-for="type in types" :key="type" :class="{active:activeType===type}" @click="activeType=type"><span>{{ type }}</span><b>{{ count(type) }}</b></button></aside>
      <div class="base-content">
        <div class="filter-bar compact"><div class="search-box"><span>⌕</span><input v-model="query" :placeholder="`模糊查询${activeType}名称、编码或说明`"/><button v-if="query" @click="query=''">×</button></div></div>
        <div class="table-card"><table><thead><tr><th>编号</th><th>名称</th><th>编码/符号</th><th>所属分类</th><th>说明</th><th>状态</th><th>操作</th></tr></thead><tbody>
          <tr v-for="item in results" :key="item.id"><td class="mono">{{ item.id }}</td><td><strong>{{ item.name }}</strong></td><td><code>{{ item.code }}</code></td><td>{{ item.parent }}</td><td class="definition">{{ item.description }}</td><td><span class="review-status approved">{{ item.status }}</span></td><td><button class="library-delete" @click="deleteRecord(item)">删除</button></td></tr>
        </tbody></table><div v-if="!results.length" class="table-empty">没有找到匹配的基础数据。</div></div>
      </div>
    </div>
    <div v-if="addOpen" class="library-modal" @click.self="addOpen=false"><form class="library-dialog" @submit.prevent="addRecord"><header><div><h2>新增基础数据</h2><p>填写完整记录，后续可直接对接数据库接口</p></div><button type="button" @click="addOpen=false">×</button></header><div class="library-form-grid"><label><span>数据类型 *</span><select v-model="form.type"><option v-for="item in types" :key="item">{{item}}</option></select></label><label><span>名称 *</span><input v-model="form.name" required/></label><label><span>编码/符号</span><input v-model="form.code"/></label><label><span>所属分类</span><input v-model="form.parent"/></label><label class="wide"><span>说明</span><textarea v-model="form.description" rows="4"></textarea></label><label><span>状态</span><select v-model="form.status"><option>启用</option><option>停用</option></select></label></div><footer><button type="button" class="secondary" @click="addOpen=false">取消</button><button type="submit" class="primary">保存基础数据</button></footer></form></div>
  </section>
</template>
