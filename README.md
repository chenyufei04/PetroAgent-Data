# 石油工程术语与数据质控系统（初级版）

这是一个基于 Vue 3、TypeScript、Vite 和 FastAPI 的本地石油工程数据质控系统。当前版本面向原型验证、课程设计和内部辅助试用，通过术语库、基础数据及确定性规则，对文件或直接输入的文字执行基础质量检查。

> 当前定位是“初级质控辅助系统”，不能替代石油工程专家作出井控、安全或生产决策。

## 当前开发进度

更新时间：2026-08-27

| 模块 | 当前状态 | 已完成内容 |
|---|---|---|
| 质控工作台 | 初级版可用 | 文件上传、文本输入、语音转文字、校验前内容预览、手动触发校验、分级标注、问题列表和结果统计 |
| 文件管理 | 初级版可用 | 上传文件保存到本地目录，页面启动时自动恢复 `uploads/` 已有文件，删除时同步清理后台文件 |
| 术语库 | 初级版可用 | 65条术语、模糊查询、专业和状态筛选、单条/批量审核、驳回、恢复及操作确认 |
| 术语审核统计 | 已完成 | 动态显示审核通过、驳回和待审核数量，并随查询、筛选及状态操作实时变化 |
| 规则库 | 初级版可用 | 53条规则、模糊查询、多条件筛选、已实现/配置模板/待开发状态展示 |
| 基础数据 | 初级版可用 | 48条专业分类、单位、缩写和公开来源数据，支持分类与模糊查询 |
| 数据导入 | 基础功能可用 | 术语和规则分开选择、导入及保存 |
| 规则执行引擎 | 初级版可用 | 18条确定性规则参与实际质控，输出错误、警告和建议 |
| 规则自检 | 待开发 | 当前保留页面入口，尚未实现自动回归测试和规则冲突检测 |
| 后端质控引擎 | 待开发 | 当前后端负责文件保存、XLSX解析及删除，规则仍主要运行在前端 |
| 大模型语义质控 | 待开发 | 尚未接入上下文理解、否定条件、跨章节一致性和综合评价 |

当前已经形成如下基础闭环：

```text
文件上传 / 文本输入 / 语音输入
              ↓
         加入待校验列表
              ↓
        用户主动点击校验
              ↓
      执行18条确定性规则
              ↓
   标红错误 / 标黄警告 / 建议下划线
              ↓
       展示问题与修改建议
```

## 当前数据规模

- 术语库：65 条
- 规则库：53 条
- 基础数据：48 条
- 已接入质控引擎的确定性规则：18 条

规则库中的规则分为三种状态：

- `已实现`：当前质控引擎会实际执行。
- `配置模板`：需要补充区块、井型、地层、工况或企业容差后才能执行。
- `待开发`：已完成规则定义，但尚未编写执行器。

规则页面支持按实现状态筛选，质控结果标题会显示本次实际执行的规则数量。

## 已实现功能

### 数据质控

- 上传 XLSX、CSV、DOCX、TXT、Markdown、JSON、XML 等文件。
- 选择文件后点击“上传”，文件才会保存并进入待校验列表。
- 点击单个项目右侧“校验”，才会执行质控。
- 未点击校验时，点击待校验文件会在右侧预览文件类型、大小和内容；XLSX/CSV/TSV绘制带网格线的表格，DOCX/TXT/Markdown等以居中文档纸张版式展示。
- 文件保存到本地 `uploads/`，删除列表文件时同步删除后台文件。
- 页面重新打开或刷新时自动检测 `uploads/`，将已有文件恢复到待校验列表。
- 支持直接输入最多 5000 字的文本，不需要上传完整文件。
- 支持麦克风权限申请和中文语音转文字；语音内容只写入文本框，不保存录音。
- 错误标红、警告标黄、建议使用波浪下划线。
- 展示规则编号、问题说明、修改建议以及错误/警告/建议数量。

### 当前可执行检查

- 非规范术语“泥浆”提示使用“钻井液”。
- 产量术语和压力类型明确性。
- 压力数值缺少单位。
- 英文缩写首次出现建议补充全称。
- 孔隙度、饱和度和含水率的 0%～100% 范围。
- 井斜角和方位角范围。
- 产量、井深、黏度、转速和泵排量负值。
- 温度低于绝对零度。
- 密度小于或等于零。
- `mpa`、`kpa` 等单位符号大小写错误。

### 数据管理

- 术语库：中英文名称、缩写、定义、单位、别名、专业分类和来源；支持已审核、待审核、驳回三种状态，以及单条和批量审核/驳回；被驳回的数据可以单条或批量恢复为已审核。所有状态变更操作均需通过确认弹窗，右上角实时统计审核通过、驳回和待审核数量，审核状态保存在浏览器本地。
- 规则库：类型、专业、严重等级、条件、提示、依据、适用范围和实现状态。
- 基础数据：专业分类、计量单位、常用缩写和公开数据来源。
- 三个模块均支持模糊查询，规则库额外支持类型、专业、级别和实现状态筛选。
- 数据导入页面支持术语和规则分别导入、分别保存。

## 数据来源

公开基础数据主要参考 WITSML 2.1、PRODML 2.3、PWLS 4.0、Energistics UOM，以及公开的国家标准元数据。详细来源、许可边界和未纳入内容见 [PUBLIC_DATA_SOURCES.md](PUBLIC_DATA_SOURCES.md)。

项目没有复制付费标准全文，没有将来源不明的网络经验值设为强制规则，也没有把国外油田统计阈值直接用于国内区块。

## 项目结构

```text
demo-test/
├─ .venv/                         # Python 3.10虚拟环境（不提交Git）
├─ backend/
│  ├─ __init__.py
│  └─ main.py                     # FastAPI、文件保存、XLSX解析和删除接口
├─ dist/                          # Vite生产构建产物
├─ node_modules/                  # Node依赖（不提交Git）
├─ src/
│  ├─ data/
│  │  ├─ seed.ts                  # 原始术语、规则和基础数据
│  │  └─ publicSeed.ts            # 公开来源扩充数据
│  ├─ services/
│  │  └─ qualityEngine.ts         # 可执行规则、文本检查和标注切片
│  ├─ stores/
│  │  └─ data.ts                  # 顶部术语/规则数量状态
│  ├─ views/
│  │  ├─ QualityPage.vue          # 文件、文本、语音输入与质控结果
│  │  ├─ QualityPage.css
│  │  ├─ RulesPage.vue            # 规则库、筛选及实现状态
│  │  ├─ RulesPage.css
│  │  ├─ TermsPage.vue            # 术语库与模糊查询
│  │  ├─ TermsPage.css            # 术语审核、批量操作和状态样式
│  │  ├─ BaseDataPage.vue         # 基础数据与模糊查询
│  │  ├─ ImportPage.vue           # 术语/规则分离导入
│  │  └─ BlankPage.vue            # 规则自检占位页
│  ├─ App.vue                     # 顶部导航和动态数据计数
│  ├─ main.ts
│  ├─ router.ts
│  ├─ styles.css
│  └─ types.ts
├─ uploads/                       # 质控上传文件保存目录
├─ .gitignore
├─ index.html
├─ package.json
├─ package-lock.json
├─ PUBLIC_DATA_SOURCES.md         # 公开来源及使用边界
├─ requirements.txt
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts                 # 开发服务器和/api代理
```

## 环境要求

- Node.js 18 或更高版本
- npm
- Python 3.10
- Windows 10/11 或 macOS 12 及以上版本
- Chrome 或 Edge（使用语音识别时推荐；macOS 也可以使用 Safari，但语音识别行为可能不同）

可先确认环境版本：

```text
node --version
npm --version
python --version
```

> 项目固定使用 Python 3.10。若系统中的 `python` 不是 3.10，请按下方对应系统的命令创建虚拟环境。

## Windows 部署

### 1. 获取项目并进入目录

```powershell
git clone https://github.com/chenyufei04/PetroAgent-Data.git
cd PetroAgent-Data
```

如果已经拥有本地项目，可直接进入实际目录：

```powershell
cd F:\Projects\demo-test
```

### 2. 安装前端依赖

```powershell
npm install
```

### 3. 创建 Python 3.10 虚拟环境并安装后端依赖

```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

如果 PowerShell 阻止虚拟环境脚本运行，可仅对当前终端临时放开限制后再次激活：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 4. 启动项目

打开两个终端。在终端一启动 FastAPI 后端：

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

在终端二启动 Vue 前端：

```powershell
npm run dev
```

## macOS 部署

以下命令同时适用于 Intel Mac 和 Apple Silicon（M1/M2/M3/M4）Mac。

### 1. 安装基础工具

先安装 Xcode Command Line Tools：

```bash
xcode-select --install
```

推荐使用 Homebrew 安装 Node.js 和 Python 3.10。如果尚未安装 Homebrew，请先按照 [Homebrew 官网](https://brew.sh/) 的说明安装，然后执行：

```bash
brew install node python@3.10
```

Apple Silicon 的 Homebrew 通常位于 `/opt/homebrew`，Intel Mac 通常位于 `/usr/local`；通过 `brew` 执行安装时无需在项目中硬编码该路径。

### 2. 获取项目并进入目录

```bash
git clone https://github.com/chenyufei04/PetroAgent-Data.git
cd PetroAgent-Data
```

如果项目已经在本机，请将上述目录替换为实际路径，例如：

```bash
cd ~/Projects/PetroAgent-Data
```

### 3. 安装前端依赖

```bash
npm install
```

### 4. 创建 Python 3.10 虚拟环境并安装后端依赖

```bash
python3.10 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

以后重新打开终端时，只需在项目目录执行 `source .venv/bin/activate` 即可重新进入虚拟环境。

### 5. 启动项目

打开两个终端。在终端一启动 FastAPI 后端：

```bash
cd ~/Projects/PetroAgent-Data
source .venv/bin/activate
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

在终端二启动 Vue 前端：

```bash
cd ~/Projects/PetroAgent-Data
npm run dev
```

如果需要让同一局域网内的其他设备访问，可使用 `npm run dev -- --host 0.0.0.0` 启动前端；后端也需要改为监听 `0.0.0.0`。此时请仅在可信网络中使用，并在 macOS 防火墙弹窗中按需允许访问。

## 访问地址

访问：

```text
http://127.0.0.1:5173
```

后端接口文档：

```text
http://127.0.0.1:8000/docs
```

如果出现 `ECONNREFUSED 127.0.0.1:8000`，说明前端已经启动，但 FastAPI 后端没有运行。

如果提示端口 `8000` 或 `5173` 已被占用，请先关闭占用该端口的旧进程，或为前后端指定其他端口；修改后端端口时还需要同步修改 Vite 代理配置。

## 麦克风权限

- 使用 `localhost`、`127.0.0.1` 或 HTTPS 打开页面。
- 首次点击麦克风时允许浏览器访问麦克风。
- 如果曾拒绝权限，在浏览器地址栏的网站权限设置中重新允许。
- 当前采用浏览器 Web Speech API，不保存音频；不同浏览器的可用性和识别服务可能不同。

## 构建验证

Windows PowerShell 与 macOS Terminal 均执行：

```text
npm run build
```

该命令先执行 Vue/TypeScript 类型检查，再生成 `dist/` 生产构建。

截至2026-08-27，当前版本已经通过完整的 Vue、TypeScript 和 Vite 生产构建验证。

## 当前限制

- 质控逻辑仍运行在前端，属于确定性正则和数值判断。
- 53 条规则中目前只有 18 条已接入执行引擎。
- XLSX 由 Python 后端解析；旧版 XLS、DOC 尚未完整支持。
- CSV、JSON、XML 当前主要按文本处理，尚未针对完整字段结构执行全部跨字段规则。
- 页面刷新后可以恢复 `uploads/` 中的文件，但不会恢复直接输入的临时文本、已完成的质控结果和选中状态。
- 术语、规则和基础数据仍为项目内置数据，尚未接入正式数据库；术语审核状态当前保存在浏览器 `localStorage` 中。
- 尚未实现复杂上下文、否定条件、跨章节一致性和大模型语义质控。
- 区块、井型、地层和工况阈值需要企业数据与专家审核后配置。

## 下一阶段

1. 将确定性规则迁移到 FastAPI 后端，建立统一 `/api/quality/check` 接口。
2. 将 Excel、CSV 等文件解析为结构化字段和记录。
3. 实现 MD/TVD、钻头深度/井底深度、时间区间等跨字段规则。
4. 为每条可执行规则增加正确、错误、边界和误报测试样本。
5. 引入数据库、质控任务历史、规则版本和人工复核记录。
6. 在确定性规则稳定后增加大模型语义质控。
