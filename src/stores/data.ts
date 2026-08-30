import { defineStore } from "pinia";
import { baseRecords, ruleRecords, termRecords } from "../data/seed";
import type { BaseRecord, RuleRecord, TermRecord } from "../types";

const storageKey="petroleum-quality-libraries-v2";
interface LibraryState { terms:TermRecord[]; rules:RuleRecord[]; base:BaseRecord[]; }
function initialState():LibraryState{
  try{const saved=JSON.parse(localStorage.getItem(storageKey)??"") as Partial<LibraryState>;if(saved.terms&&saved.rules&&saved.base)return {terms:saved.terms,rules:saved.rules,base:saved.base};}catch{/* use seed */}
  return {terms:termRecords.map(x=>({...x,aliases:[...x.aliases]})),rules:ruleRecords.map(x=>({...x})),base:baseRecords.map(x=>({...x}))};
}
export const useDataStore=defineStore("data",{
  state:initialState,
  getters:{termCount:s=>s.terms.length,ruleCount:s=>s.rules.length,baseCount:s=>s.base.length,approvedCount:s=>s.terms.filter(x=>x.status==="已审核").length},
  actions:{
    persist(){localStorage.setItem(storageKey,JSON.stringify({terms:this.terms,rules:this.rules,base:this.base}));},
    addTerm(record:TermRecord){this.terms.unshift(record);this.persist();},deleteTerm(id:string){this.terms=this.terms.filter(x=>x.id!==id);this.persist();},
    addRule(record:RuleRecord){this.rules.unshift(record);this.persist();},deleteRule(id:string){this.rules=this.rules.filter(x=>x.id!==id);this.persist();},
    addBase(record:BaseRecord){this.base.unshift(record);this.persist();},deleteBase(id:string){this.base=this.base.filter(x=>x.id!==id);this.persist();},
    importTerms(records:TermRecord[]){const ids=new Set(this.terms.map(x=>x.id));records.forEach(x=>{if(!ids.has(x.id)){this.terms.push(x);ids.add(x.id);}});this.persist();},
    importRules(records:RuleRecord[]){const ids=new Set(this.rules.map(x=>x.id));records.forEach(x=>{if(!ids.has(x.id)){this.rules.push(x);ids.add(x.id);}});this.persist();},
    importBase(records:BaseRecord[]){const ids=new Set(this.base.map(x=>x.id));records.forEach(x=>{if(!ids.has(x.id)){this.base.push(x);ids.add(x.id);}});this.persist();},
  }
});
