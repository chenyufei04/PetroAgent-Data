<script setup lang="ts">
import { computed } from "vue";
import { useDataStore } from "../stores/data";
const store = useDataStore();
const distribution = computed(() => [
  {label:"术语",value:store.termCount,color:"#168bd2"},
  {label:"规则",value:store.ruleCount,color:"#7956e8"},
  {label:"基础数据",value:store.baseCount,color:"#e49a38"},
  {label:"已审核术语",value:store.approvedCount,color:"#20ad7a"},
]);
const totalCount = computed(() => distribution.value.reduce((sum,item)=>sum+item.value,0));
const chartStyle = computed(() => {
  let current=0;
  const segments=distribution.value.map(item=>{const start=current;current+=item.value/totalCount.value*100;return `${item.color} ${start}% ${current}%`;});
  return {background:`conic-gradient(${segments.join(",")})`};
});
const modules=[
{path:"/quality",eyebrow:"QUALITY CONTROL",title:"数据质控",description:"上传工程文件或输入文本，依据规则与术语执行分级校验和问题标注。",tone:"blue",icon:"✓",action:"开始质控"},
{path:"/rules",eyebrow:"RULE ENGINE",title:"规则库",description:"维护数值范围、单位格式、工程逻辑与术语表达等质控规则。",tone:"violet",icon:"⌘",action:"查看规则"},
{path:"/terms",eyebrow:"TERMINOLOGY",title:"术语库",description:"浏览石油工程标准术语、英文名称、缩写、定义及审核状态。",tone:"green",icon:"T",action:"查看术语"},
{path:"/base",eyebrow:"BASE DATA",title:"基础数据",description:"管理专业分类、计量单位、常用缩写和公开数据来源。",tone:"orange",icon:"D",action:"查看数据"},
{path:"/import",eyebrow:"DATA IMPORT",title:"数据导入",description:"分别导入和保存术语与规则文件，扩充本地知识数据。",tone:"cyan",icon:"↑",action:"导入数据"},
{path:"/preprocessing",eyebrow:"DATA PREPROCESSING",title:"数据预处理",description:"上传工程数据，为缺失、失真、陈旧和格式问题处理预留算法工作台。",tone:"blue",icon:"⚙",action:"进入预处理"},
{path:"/check",eyebrow:"RULE INSPECTION",title:"规则自检",description:"检查规则执行状态，为后续冲突检测和回归验证预留统一入口。",tone:"slate",icon:"◎",action:"进入自检"}];
</script>
<template><section class="home-page"><div class="home-dashboard">
<aside class="distribution-panel"><div class="distribution-heading"><p class="home-eyebrow">DATA OVERVIEW</p><h2>数据分布</h2><span>当前知识数据构成</span></div><div class="donut-wrap"><div class="donut-chart" :style="chartStyle"><div><strong>{{totalCount}}</strong><small>统计总量</small></div></div></div><div class="distribution-legend"><div v-for="item in distribution" :key="item.label"><span :style="{background:item.color}"/><p>{{item.label}}</p><strong>{{item.value}}</strong><small>{{(item.value/totalCount*100).toFixed(1)}}%</small></div></div><p class="chart-note">统计数据随术语库、规则库和审核状态动态更新</p></aside>
<div class="home-content"><header class="home-hero"><div><p class="home-eyebrow">PETROLEUM ENGINEERING DATA QUALITY</p><h1>石油工程数据质控平台</h1><p class="hero-description">基于术语库、规则库和基础数据，对工程文件与文本进行可解释的质量检查。</p></div><span class="service-pill"><i/>质控服务运行中</span></header>
<div class="overview-grid"><article><span>T</span><strong>{{store.termCount}}</strong><small>术语总数</small></article><article><span>R</span><strong>{{store.ruleCount}}</strong><small>规则总数</small></article><article><span>D</span><strong>{{store.baseCount}}</strong><small>基础数据</small></article><article><span>✓</span><strong>{{store.approvedCount}}</strong><small>已审核术语</small></article></div>
<div class="module-heading"><div><p class="home-eyebrow">WORKSPACE</p><h2>功能中心</h2></div><span>选择卡片进入对应工作空间</span></div>
<div class="module-grid"><RouterLink v-for="item in modules" :key="item.path" :to="item.path" class="module-card" :class="item.tone"><span class="module-icon">{{item.icon}}</span><p>{{item.eyebrow}}</p><h3>{{item.title}}</h3><div>{{item.description}}</div><strong>{{item.action}} <b>→</b></strong></RouterLink></div>
<footer class="home-footer"><span>初级质控辅助系统</span><span>所有高风险工程结论均需专业人员复核</span></footer></div>
</div></section></template><style src="./HomePage.css"></style><style src="./HomeChart.css"></style><style src="./HomeChartAlign.css"></style>
