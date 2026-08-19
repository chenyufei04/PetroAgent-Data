export type IssueLevel = "error" | "warning" | "suggestion";
export interface QualityIssue { id:string; ruleId:string; level:IssueLevel; title:string; matched:string; message:string; suggestion:string; start:number; end:number; }
export interface MarkedSegment { text:string; level?:IssueLevel; issueId?:string; }

interface Check { ruleId:string; level:IssueLevel; title:string; pattern:RegExp; message:string; suggestion:string; validate?:(match:RegExpExecArray)=>boolean; }
const checks:Check[]=[
  {ruleId:"R0001",level:"error",title:"非规范术语",pattern:/泥浆/g,message:"“泥浆”不是当前术语库首选名称。",suggestion:"建议替换为“钻井液”。"},
  {ruleId:"R0003",level:"warning",title:"产量术语不明确",pattern:/日产量/g,message:"日产量未说明具体介质。",suggestion:"明确为日产油量、日产气量、日产液量或日产水量。"},
  {ruleId:"R0004",level:"warning",title:"压力类型不明确",pattern:/(?<!井口|井底|地层|油管|套管|注入)压力(?!梯度|单位)/g,message:"压力未明确测点或类型。",suggestion:"补充井口、井底、地层、油管、套管或注入等限定。"},
  {ruleId:"R0005",level:"warning",title:"压力缺少单位",pattern:/(?:压力|压强)[：:=\s]*(-?\d+(?:\.\d+)?)(?![\d.]|\s*(?:MPa|kPa|Pa|bar))/gi,message:"压力数值缺少计量单位。",suggestion:"补充MPa、kPa等单位并声明表压或绝压。"},
  {ruleId:"R0009",level:"error",title:"孔隙度越界",pattern:/孔隙度[：:=\s]*(-?\d+(?:\.\d+)?)\s*%?/g,message:"孔隙度必须处于0%～100%。",suggestion:"检查小数/百分数表达、单位或原始测量值。",validate:m=>Number(m[1])<0||Number(m[1])>100},
  {ruleId:"R0010",level:"error",title:"饱和度越界",pattern:/(?:含油|含气|含水)?饱和度[：:=\s]*(-?\d+(?:\.\d+)?)\s*%?/g,message:"流体饱和度必须处于0%～100%。",suggestion:"核对数值、单位和样品深度。",validate:m=>Number(m[1])<0||Number(m[1])>100},
  {ruleId:"R0012",level:"error",title:"含水率越界",pattern:/含水率[：:=\s]*(-?\d+(?:\.\d+)?)\s*%?/g,message:"含水率必须处于0%～100%。",suggestion:"核对油水产量或百分数转换。",validate:m=>Number(m[1])<0||Number(m[1])>100},
  {ruleId:"R0013",level:"error",title:"井斜角越界",pattern:/井斜角[：:=\s]*(-?\d+(?:\.\d+)?)\s*°?/g,message:"井斜角超出0°～180°有效范围。",suggestion:"检查轨迹数据和角度单位。",validate:m=>Number(m[1])<0||Number(m[1])>180},
  {ruleId:"R0014",level:"error",title:"方位角越界",pattern:/方位角[：:=\s]*(-?\d+(?:\.\d+)?)\s*°?/g,message:"方位角应在0°～360°范围内。",suggestion:"检查方位基准和角度单位。",validate:m=>Number(m[1])<0||Number(m[1])>=360},
  {ruleId:"R0015",level:"error",title:"产量为负值",pattern:/(?:日产油量|日产气量|日产水量|日产液量|累计产量)[：:=\s]*(-\d+(?:\.\d+)?)/g,message:"生产量不能为负数。",suggestion:"检查冲销记录、符号、单位或数据版本。"},
  {ruleId:"PR001",level:"error",title:"井深为负值",pattern:/(?:测量深度|垂直深度|钻头深度|井底深度|井深|MD|TVD)[：:=\s]*(-\d+(?:\.\d+)?)\s*(?:m|米)?/gi,message:"井深不能为负数。",suggestion:"核对深度基准、符号和原始记录。"},
  {ruleId:"PR006",level:"warning",title:"单位符号不规范",pattern:/\b(?:mpa|kpa)\b/g,message:"压力单位符号大小写不符合单位字典。",suggestion:"分别使用MPa或kPa。"},
  {ruleId:"PR007",level:"error",title:"温度低于绝对零度",pattern:/(?:温度|井温)[：:=\s]*(-?\d+(?:\.\d+)?)\s*(℃|°C|K)/gi,message:"温度低于物理允许的绝对零度。",suggestion:"检查温标、符号和传感器数据。",validate:m=>m[2].toUpperCase()==="K"?Number(m[1])<0:Number(m[1])<-273.15},
  {ruleId:"PR008",level:"error",title:"密度不是正数",pattern:/(?:钻井液密度|流体密度|体积密度|密度)[：:=\s]*(-?\d+(?:\.\d+)?)/g,message:"质量密度必须大于0。",suggestion:"检查数值、单位或缺失值编码。",validate:m=>Number(m[1])<=0},
  {ruleId:"PR009",level:"error",title:"黏度为负值",pattern:/(?:塑性黏度|漏斗黏度|动力黏度|粘度|黏度)[：:=\s]*(-\d+(?:\.\d+)?)/g,message:"黏度不能为负数。",suggestion:"检查原始测量值和缺失值编码。"},
  {ruleId:"PR010",level:"error",title:"转速为负值",pattern:/(?:转盘转速|顶驱转速|转速|RPM)[：:=\s]*(-\d+(?:\.\d+)?)/gi,message:"未声明方向约定时转速不应为负。",suggestion:"检查符号约定、传感器零点和原始值。"},
  {ruleId:"PR011",level:"error",title:"泵排量为负值",pattern:/(?:泵排量|排量|flow rate)[：:=\s]*(-\d+(?:\.\d+)?)/gi,message:"未声明流向约定时泵排量不应为负。",suggestion:"检查流向标识、单位和原始值。"},
  {ruleId:"R0002",level:"suggestion",title:"缩写建议补充全称",pattern:/\b(?:MD|TVD|ROP|WOB|ECD|GOR|WHP)\b/g,message:"专业缩写首次出现时宜同时给出全称。",suggestion:"在首次出现处补充中文或英文全称。"},
];

export const executableRuleIds = new Set(checks.map(check=>check.ruleId));
export const executableRuleCount = executableRuleIds.size;

export function inspectText(text:string):QualityIssue[]{
  const issues:QualityIssue[]=[];
  for(const check of checks){check.pattern.lastIndex=0;let match:RegExpExecArray|null;while((match=check.pattern.exec(text))){if(check.validate&&!check.validate(match))continue;issues.push({id:`${check.ruleId}-${match.index}-${issues.length}`,ruleId:check.ruleId,level:check.level,title:check.title,matched:match[0],message:check.message,suggestion:check.suggestion,start:match.index,end:match.index+match[0].length});if(match[0].length===0)check.pattern.lastIndex++;}}
  return issues.sort((a,b)=>a.start-b.start||({error:0,warning:1,suggestion:2}[a.level]-{error:0,warning:1,suggestion:2}[b.level]));
}

export function markText(text:string,issues:QualityIssue[]):MarkedSegment[]{
  const segments:MarkedSegment[]=[];let cursor=0;
  for(const issue of issues){if(issue.start<cursor)continue;if(issue.start>cursor)segments.push({text:text.slice(cursor,issue.start)});segments.push({text:text.slice(issue.start,issue.end),level:issue.level,issueId:issue.id});cursor=issue.end;}
  if(cursor<text.length)segments.push({text:text.slice(cursor)});return segments;
}
