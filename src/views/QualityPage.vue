<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { executableRuleCount, inspectText, markText, type IssueLevel, type QualityIssue } from "../services/qualityEngine";
import "./QualityPage.css";

interface SpeechRecognitionEventLike extends Event { results:ArrayLike<{0:{transcript:string};isFinal:boolean}>; resultIndex:number; }
interface SpeechRecognitionLike { lang:string; continuous:boolean; interimResults:boolean; start():void; stop():void; onresult:((event:SpeechRecognitionEventLike)=>void)|null; onerror:((event:{error:string})=>void)|null; onend:(()=>void)|null; }
type SpeechRecognitionConstructor = new()=>SpeechRecognitionLike;
interface QualityFile { id:string; kind:"file"|"text"; file:File; text:string; extractedText?:string; tableData?:string[][]; originalSize?:number; status:"waiting"|"parsing"|"ready"|"error"; saveStatus:"saving"|"saved"|"deleting"|"save-error"; savedPath?:string; savedFilename?:string; error?:string; deleteError?:string; }
const accepted=".xlsx,.xls,.csv,.tsv,.doc,.docx,.txt,.md,.json,.xml";
const files=ref<QualityFile[]>([]);const stagedFiles=ref<File[]>([]);const textInput=ref("");const voiceStatus=ref("");const listening=ref(false);const uploading=ref(false);const activeId=ref("");const picker=ref<HTMLInputElement>();const dragging=ref(false);const selectedIssue=ref("");let recognition:SpeechRecognitionLike|undefined;
const activeFile=computed(()=>files.value.find(x=>x.id===activeId.value));
const issues=computed(()=>activeFile.value?.status==="ready"?inspectText(activeFile.value.text):[]);
const segments=computed(()=>activeFile.value?markText(activeFile.value.text,issues.value):[]);
const counts=computed(()=>({error:issues.value.filter(x=>x.level==="error").length,warning:issues.value.filter(x=>x.level==="warning").length,suggestion:issues.value.filter(x=>x.level==="suggestion").length}));
const previewText=computed(()=>activeFile.value?.extractedText??activeFile.value?.text??"");
const levelLabel:Record<IssueLevel,string>={error:"错误",warning:"警告",suggestion:"建议"};
function formatFileSize(size:number){if(size<1024)return `${size} B`;if(size<1024*1024)return `${(size/1024).toFixed(1)} KB`;return `${(size/1024/1024).toFixed(1)} MB`;}

async function parseFile(file:File):Promise<string>{
  const extension=file.name.split(".").pop()?.toLowerCase();
  if(extension==="xlsx")throw new Error("Excel文件需要由本地Python服务解析。");
  if(extension==="xls")throw new Error("旧版XLS暂不支持浏览器安全解析，请另存为XLSX后上传。");
  if(extension==="docx"){const {default:mammoth}=await import("mammoth");const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return result.value;}
  if(extension==="doc")throw new Error("旧版DOC暂不支持浏览器解析，请另存为DOCX后上传。");
  return await file.text();
}
async function saveUploadedFile(item:QualityFile):Promise<string|undefined>{
  const formData=new FormData();formData.append("file",item.file);
  try{const response=await fetch("/api/quality/upload",{method:"POST",body:formData});const result=await response.json() as {filename?:string;path?:string;extracted_text?:string|null;table_data?:string[][]|null;detail?:string};if(!response.ok)throw new Error(result.detail??`保存失败（${response.status}）`);item.savedPath=result.path;item.savedFilename=result.filename;item.tableData=result.table_data??undefined;item.saveStatus="saved";return result.extracted_text??undefined;}
  catch(error){item.saveStatus="save-error";item.error=`文件未保存到uploads：${(error as Error).message}`;return undefined;}
}
async function restoreUploadedFiles(){
  try{
    const response=await fetch("/api/quality/uploads");
    const result=await response.json() as Array<{filename:string;path:string;size:number;modified_at:string;extracted_text:string|null;table_data:string[][]|null;parse_error:string|null}>|{detail?:string};
    if(!response.ok||!Array.isArray(result))throw new Error(!Array.isArray(result)?result.detail:`读取失败（${response.status}）`);
    const existing=new Set(files.value.filter(item=>item.savedFilename).map(item=>item.savedFilename));
    const restored:QualityFile[]=result.filter(item=>!existing.has(item.filename)).map(item=>({id:crypto.randomUUID(),kind:"file",file:new File([],item.filename,{lastModified:new Date(item.modified_at).getTime()}),text:"",extractedText:item.extracted_text??undefined,tableData:item.table_data??undefined,originalSize:item.size,status:item.parse_error?"error":"waiting",saveStatus:"saved",savedPath:item.path,savedFilename:item.filename,error:item.parse_error??undefined}));
    files.value.push(...restored);if(!activeId.value&&restored[0])activeId.value=restored[0].id;
  }catch(error){console.error("恢复uploads文件失败",error);}
}
function fileKey(file:File){return `${file.name}-${file.size}-${file.lastModified}`;}
function stageFiles(input:FileList|File[]){
  const keys=new Set([...files.value.map(x=>fileKey(x.file)),...stagedFiles.value.map(fileKey)]);
  stagedFiles.value.push(...Array.from(input).filter(file=>!keys.has(fileKey(file))));
  if(picker.value)picker.value.value="";
}
async function uploadFiles(){
  if(!stagedFiles.value.length||uploading.value)return;uploading.value=true;
  const added:QualityFile[]=stagedFiles.value.map(file=>({id:crypto.randomUUID(),kind:"file",file,text:"",originalSize:file.size,status:"waiting",saveStatus:"saving"}));
  stagedFiles.value=[];files.value.push(...added);if(!activeId.value&&added[0])activeId.value=added[0].id;
  for(const item of added){item.extractedText=await saveUploadedFile(item);}
  uploading.value=false;
}
function addText(){
  const content=textInput.value.trim();if(!content)return;
  const index=files.value.filter(item=>item.kind==="text").length+1;
  const file=new File([content],`文本输入-${index}.txt`,{type:"text/plain"});
  const item:QualityFile={id:crypto.randomUUID(),kind:"text",file,text:content,extractedText:content,status:"waiting",saveStatus:"saved"};
  files.value.push(item);activeId.value=item.id;textInput.value="";
}
async function toggleVoiceInput(){
  if(listening.value){recognition?.stop();return;}
  const SpeechRecognition=(window as typeof window & {SpeechRecognition?:SpeechRecognitionConstructor;webkitSpeechRecognition?:SpeechRecognitionConstructor}).SpeechRecognition??(window as typeof window & {webkitSpeechRecognition?:SpeechRecognitionConstructor}).webkitSpeechRecognition;
  if(!SpeechRecognition){voiceStatus.value="当前浏览器不支持语音识别，请使用最新版Chrome或Edge。";return;}
  if(!navigator.mediaDevices?.getUserMedia){voiceStatus.value="当前页面无法访问麦克风，请使用localhost或HTTPS打开。";return;}
  voiceStatus.value="正在请求麦克风权限…";
  try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(track=>track.stop());}
  catch(error){voiceStatus.value=(error as DOMException).name==="NotAllowedError"?"麦克风权限被拒绝，请在浏览器地址栏中重新允许。":"无法使用麦克风，请检查设备和系统权限。";return;}
  recognition=new SpeechRecognition();recognition.lang="zh-CN";recognition.continuous=true;recognition.interimResults=true;
  let finalText="";const original=textInput.value;
  recognition.onresult=event=>{let interim="";for(let index=event.resultIndex;index<event.results.length;index++){const result=event.results[index];if(result.isFinal)finalText+=result[0].transcript;else interim+=result[0].transcript;}textInput.value=`${original}${original&&finalText?' ':''}${finalText}${interim}`.slice(0,5000);};
  recognition.onerror=event=>{voiceStatus.value=event.error==="not-allowed"?"麦克风权限被拒绝。":event.error==="no-speech"?"未检测到语音，请重试。":`语音识别失败：${event.error}`;};
  recognition.onend=()=>{listening.value=false;if(!voiceStatus.value.includes("失败")&&!voiceStatus.value.includes("拒绝")&&!voiceStatus.value.includes("未检测"))voiceStatus.value="语音输入已停止。";};
  try{recognition.start();listening.value=true;voiceStatus.value="正在聆听，识别文字会自动写入输入框…";}catch{voiceStatus.value="语音识别启动失败，请稍后重试。";}
}
async function validateFile(item:QualityFile){
  if(item.saveStatus!=="saved"||item.status==="parsing")return;
  activeId.value=item.id;selectedIssue.value="";item.status="parsing";item.error=undefined;
  try{const extension=item.file.name.split(".").pop()?.toLowerCase();if(extension==="xlsx"&&!item.extractedText)throw new Error("Excel解析服务不可用，请确认后端已启动。");item.text=item.extractedText??await parseFile(item.file);item.status="ready";}
  catch(error){item.status="error";item.error=(error as Error).message;}
}
function onDrop(event:DragEvent){event.preventDefault();dragging.value=false;if(event.dataTransfer)stageFiles(event.dataTransfer.files);}
async function removeFile(item:QualityFile){
  if(item.saveStatus==="saving"||item.saveStatus==="deleting")return;
  if(item.saveStatus==="saved"&&item.savedFilename){
    item.saveStatus="deleting";item.deleteError=undefined;
    try{const response=await fetch(`/api/quality/upload/${encodeURIComponent(item.savedFilename)}`,{method:"DELETE"});const result=await response.json() as {detail?:string};if(!response.ok)throw new Error(result.detail??`删除失败（${response.status}）`);}
    catch(error){item.saveStatus="saved";item.deleteError=`删除失败：${(error as Error).message}`;return;}
  }
  files.value=files.value.filter(x=>x.id!==item.id);if(activeId.value===item.id)activeId.value=files.value[0]?.id??"";
}
function selectIssue(issue:QualityIssue){selectedIssue.value=issue.id;document.querySelector(`[data-issue="${issue.id}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});}
onMounted(restoreUploadedFiles);
</script>

<template>
  <section class="quality-page">
    <aside class="quality-left">
      <div class="quality-title"><h1>数据质控</h1><p>上传实验或工程数据进行校验</p></div>
      <div class="quality-upload" :class="{dragging}" @dragenter="dragging=true" @dragleave="dragging=false" @dragover.prevent @drop="onDrop" @click="picker?.click()">
        <div>＋</div><strong>选择或拖拽文件</strong><span>Excel、CSV、Word、TXT、JSON、XML</span><input ref="picker" type="file" multiple :accept="accepted" @change="event=>stageFiles((event.target as HTMLInputElement).files!)"/>
      </div>
      <div v-if="stagedFiles.length" class="quality-staged">已选择 {{ stagedFiles.length }} 个文件：{{ stagedFiles.map(file=>file.name).join('、') }}</div>
      <button class="quality-upload-button" :disabled="!stagedFiles.length||uploading" @click="uploadFiles">{{ uploading?'上传中…':`上传${stagedFiles.length?`（${stagedFiles.length}）`:''}` }}</button>
      <div class="quality-text-entry"><div><strong>文本质控</strong><span>{{ textInput.length }}/5000</span></div><div class="quality-textarea-wrap"><textarea v-model="textInput" maxlength="5000" placeholder="在此输入、粘贴或语音录入需要质控的文字……" @keydown.ctrl.enter="addText"></textarea><button class="quality-microphone" :class="{listening}" :title="listening?'停止语音输入':'启动语音输入'" type="button" @click="toggleVoiceInput"><span>🎙</span></button></div><small v-if="voiceStatus" class="quality-voice-status" :class="{listening}">{{ voiceStatus }}</small><button class="quality-add-text" :disabled="!textInput.trim()" @click="addText">加入待校验</button></div>
      <div class="quality-files-heading"><strong>待校验内容</strong><span>{{ files.length }}</span></div>
      <div v-if="!files.length" class="quality-files-empty">尚未上传文件或添加文本</div>
      <div class="quality-files">
        <div v-for="item in files" :key="item.id" class="quality-file-row" :class="{active:activeId===item.id}" @click="activeId=item.id">
          <span class="quality-file-icon">{{ item.kind==='text'?'文本':item.file.name.split('.').pop()?.toUpperCase() }}</span><span class="quality-file-info"><strong>{{ item.file.name }}</strong><small>{{ item.deleteError??`${item.status==='parsing'?'校验中…':item.status==='error'?'校验失败':item.status==='ready'?'校验完成':'待校验'} · ${item.kind==='text'?'文本输入':item.saveStatus==='saved'?'已保存':item.saveStatus==='deleting'?'删除中…':item.saveStatus==='save-error'?'保存失败':'保存中…'}` }}</small></span><button class="quality-check" :disabled="item.saveStatus!=='saved'||item.status==='parsing'" @click.stop="validateFile(item)">{{ item.status==='ready'?'重新校验':'校验' }}</button><button class="quality-remove" :title="item.kind==='text'?'删除文本':'同时从后台删除'" :disabled="item.saveStatus==='saving'||item.saveStatus==='deleting'" @click.stop="removeFile(item)">×</button>
        </div>
      </div>
    </aside>
    <main class="quality-right">
      <div v-if="!activeFile" class="quality-welcome"><div>✓</div><h2>石油工程数据智能质控</h2><p>请从左侧上传实验数据、工程报表或技术文档，系统将根据规则库、术语库和基础数据自动校验并标注。</p><div class="legend"><span class="legend-error">错误标红</span><span class="legend-warning">警告标黄</span><span class="legend-suggestion">建议下划线</span></div></div>
      <template v-else>
        <div class="quality-toolbar"><div><h2>{{ activeFile.file.name }}</h2><span>{{ activeFile.status==='ready'?`校验完成 · 已执行 ${executableRuleCount} 条确定性规则`:activeFile.status==='parsing'?`正在执行 ${executableRuleCount} 条确定性规则…`:activeFile.status==='waiting'?`内容已加入 · 当前可执行 ${executableRuleCount} 条规则`:activeFile.error }}</span></div><div class="quality-stats"><b class="error">{{ counts.error }}<small>错误</small></b><b class="warning">{{ counts.warning }}<small>警告</small></b><b class="suggestion">{{ counts.suggestion }}<small>建议</small></b></div></div>
        <div v-if="activeFile.status==='error'" class="parse-error">{{ activeFile.error }}</div>
        <div v-else-if="activeFile.status==='parsing'" class="quality-loading">正在解析并执行质控规则…</div>
        <section v-else-if="activeFile.status==='waiting'" class="quality-preview" :class="{tabular:activeFile.tableData?.length}"><div class="quality-preview-header"><div><strong>文件内容预览</strong><span>预览仅用于查看，点击左侧“校验”后才执行质控规则</span></div><div class="quality-preview-meta"><span>{{ activeFile.kind==='text'?'文本输入':activeFile.file.name.split('.').pop()?.toUpperCase()||'文件' }}</span><span>{{ formatFileSize(activeFile.originalSize??activeFile.file.size) }}</span></div></div><div v-if="activeFile.tableData?.length" class="quality-table-preview"><table><thead><tr><th v-for="(cell,column) in activeFile.tableData[0]" :key="column">{{ cell||`第${column+1}列` }}</th></tr></thead><tbody><tr v-for="(row,rowIndex) in activeFile.tableData.slice(1)" :key="rowIndex"><td v-for="(_,column) in activeFile.tableData[0]" :key="column">{{ row[column]??'' }}</td></tr></tbody></table></div><div v-else-if="previewText" class="quality-document-stage"><article class="quality-document-preview">{{ previewText }}</article></div><div v-else class="quality-preview-empty"><b>暂无可显示的文本预览</b><span>该文件可能为空，或属于当前版本暂不支持解析的旧版 DOC/XLS 格式。</span><span>可以点击左侧“校验”查看具体提示。</span></div></section>
        <div v-else class="quality-result">
          <section class="annotated-panel"><div class="panel-header"><strong>数据标注结果</strong><div class="legend small"><span class="legend-error">错误</span><span class="legend-warning">警告</span><span class="legend-suggestion">建议</span></div></div><div class="annotated-content"><template v-for="(segment,index) in segments" :key="index"><mark v-if="segment.level" :class="segment.level" :data-issue="segment.issueId" :title="levelLabel[segment.level]" @click="selectedIssue=segment.issueId!">{{ segment.text }}</mark><span v-else>{{ segment.text }}</span></template></div></section>
          <aside class="issue-panel"><div class="panel-header"><strong>发现的问题</strong><span>{{ issues.length }} 项</span></div><div v-if="!issues.length" class="no-issues">✓<strong>未发现典型问题</strong><span>当前内容已通过已启用规则检查</span></div><button v-for="issue in issues" v-else :key="issue.id" class="issue-card" :class="[issue.level,{active:selectedIssue===issue.id}]" @click="selectIssue(issue)"><span class="issue-level">{{ levelLabel[issue.level] }}</span><div><strong>{{ issue.title }} · {{ issue.ruleId }}</strong><p>{{ issue.message }}</p><small>{{ issue.suggestion }}</small></div></button></aside>
        </div>
      </template>
    </main>
  </section>
</template>