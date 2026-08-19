export interface ImportFile { id: string; file: File; category: string; status: "ready" | "saving" | "done" | "error"; }
export interface TermRecord {
  id: string; zh: string; en: string; abbr: string; domain: string; subdomain: string;
  definition: string; unit: string; aliases: string[]; source: string; status: "已审核" | "待审核" | "驳回";
}
export interface BaseRecord {
  id: string; type: "专业分类" | "计量单位" | "常用缩写" | "数据来源";
  name: string; code: string; description: string; parent: string; status: "启用" | "停用";
}
export interface RuleRecord {
  id: string; name: string; type: "术语规范" | "单位格式" | "数值范围" | "字段完整性" | "逻辑关系" | "时间顺序" | "编码命名";
  domain: string; severity: "错误" | "警告" | "建议"; condition: string; message: string;
  source: string; scope: string; status: "启用" | "停用"; template: boolean;
}
