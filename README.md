# 石油工程术语与数据质控系统（初级版）

这是一个基于 Vue 3、TypeScript、Vite 和 FastAPI 的本地石油工程数据质控系统。当前版本面向原型验证、课程设计和内部辅助试用，通过术语库、基础数据及确定性规则，对结构化文件、技术文档或直接输入的文字执行基础质量检查，并已建立工程图像上传、保存和预览入口。

> 当前定位是“初级质控辅助系统”，不能替代石油工程专家作出井控、安全或生产决策。

## 当前开发进度

更新时间：2026-08-30

| 模块 | 当前状态 | 已完成内容 |
|---|---|---|
| 平台首页 | 已完成 | 固定侧栏、运行状态、动态数据概览、数据分布环形图及六个功能模块入口，作为系统默认页面 |
| 质控工作台 | 初级版可用 | 文件上传、文本输入、语音转文字、图像上传、校验前内容预览、手动触发校验、分级标注、问题列表和结果统计 |
| 图像预览 | 基础功能可用 | 图片选择/拖拽、上传到 `uploads/`、加入待校验列表、刷新恢复、右侧大图预览及同步删除；OCR尚未接入 |
| 文件管理 | 初级版可用 | 文档、表格和图片保存到本地目录，页面启动时自动恢复 `uploads/` 已有文件，删除时同步清理后台文件 |
| 术语库 | 初级版可用 | 按专业分类导航、模糊查询、完整表单新增、单条删除，以及单条/批量审核、驳回和恢复 |
| 术语审核统计 | 已完成 | 动态显示审核通过、驳回和待审核数量，并随查询、筛选及状态操作实时变化 |
| 规则库 | 初级版可用 | 多条件筛选、完整表单新增、单条删除及已实现/配置模板/待开发状态展示 |
| 基础数据 | 初级版可用 | 分类导航、模糊查询、完整表单新增与单条删除 |
| 数据导入 | 初级版可用 | 术语、规则和基础数据独立导入；保存原件、字段规整、生成标准化JSON并写入目标库 |
| 规则执行引擎 | 初级版可用 | 18条确定性规则参与实际质控，输出错误、警告和建议 |
| 规则自检 | 待开发 | 当前保留页面入口，尚未实现自动回归测试和规则冲突检测 |
| 后端质控引擎 | 待开发 | 当前后端负责文档/图片保存与读取、上传列表恢复、XLSX解析及删除，规则仍主要运行在前端 |
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

工程图像当前采用独立的基础流程：

```text
选择或拖拽图片
        ↓
本地缩略图预览
        ↓
上传并保存到 uploads
        ↓
加入待校验列表
        ↓
点击列表项目在右侧大图预览
        ↓
OCR / 图像内容识别（待接入）
```

## 当前数据规模与持久化

- 术语库：65 条
- 规则库：53 条
- 基础数据：48 条
- 已接入质控引擎的确定性规则：18 条

上述三类种子数据是首次运行时的初始规模。用户新增、删除或导入后，术语、规则、基础数据及首页统计会动态变化。

当前三类数据统一由 Pinia 管理并写入浏览器 `localStorage`：

- 页面刷新后保留新增、删除、审核和导入结果。
- 首页环形图和数量卡片直接读取当前记录数量。
- 当前仍属于单机原型数据层；后续接入数据库时，可将 Store 操作替换为后端 API。

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
- 支持 PNG、JPG/JPEG、WEBP、GIF、BMP、TIF/TIFF、SVG 等常见图片格式。
- 图片选择后先显示本地缩略图，点击“上传并加入待校验”后保存到 `uploads/`。
- 已保存图片会进入待校验列表；点击图片项目后在右侧居中、自适应显示大图预览。
- 图片删除时同步删除后台文件；页面刷新后自动恢复 `uploads/` 中已有图片。
- 当前图片项目显示“待识别”，尚不执行文本规则或OCR识别。
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

- 术语库按油藏与地质、钻井工程、完井与固井、采油工程等专业分类展示；新增采用一次性大型表单，通过下拉框确定专业分类，并填写中英文名称、缩写、定义、单位、别名、二级分类、来源和审核状态。
- 术语审核支持已审核、待审核、驳回三种状态，以及单条和批量审核、驳回与恢复；状态变更需要确认，统计结果实时变化。
- 规则库支持单条新增与删除。新增表单集中填写规则名称、规则类型、所属专业、严重等级、校验条件、提示信息、依据、适用范围和启停状态。
- 基础数据按专业分类、计量单位、常用缩写和数据来源分类展示；新增表单通过下拉框确定数据类型。
- 三个模块的新增操作均为完整表单一次提交，不再连续弹出输入框；删除操作需要用户确认。
- 三个模块均支持模糊查询，规则库额外支持类型、专业、级别和实现状态筛选。

### 数据导入与自动规整

- 提供“术语导入”“规则导入”“基础数据导入”三个独立标签、文件队列和保存目录。
- 点击“导入并自动规整”后保存原始文件，并对可解析内容执行中英文表头映射。
- 成功解析的文件会生成 `原文件名.normalized.json`，同时将标准记录写入对应数据模块。
- CSV、TSV、JSON、TXT、Markdown、XML 和 DOCX 当前可尝试解析与规整。
- DOC、XLS/XLSX、PDF、RTF、ODT/ODS、PPT/PPTX 可选择并保存原件，但浏览器端暂不能保证可靠结构化，建议先转换为 CSV、JSON 或 DOCX。

| 目标库 | 可识别表头示例 |
|---|---|
| 术语库 | `术语`、`中文术语`、`zh`、`英文`、`缩写`、`专业分类`、`定义`、`单位`、`别名`、`来源` |
| 规则库 | `规则名称`、`name`、`规则类型`、`专业`、`级别`、`校验条件`、`提示信息`、`依据`、`适用范围` |
| 基础数据 | `名称`、`name`、`类型`、`编码`、`符号`、`说明`、`所属分类` |

## 数据来源

公开基础数据主要参考 WITSML 2.1、PRODML 2.3、PWLS 4.0、Energistics UOM，以及公开的国家标准元数据。详细来源、许可边界和未纳入内容见 [PUBLIC_DATA_SOURCES.md](PUBLIC_DATA_SOURCES.md)。

项目没有复制付费标准全文，没有将来源不明的网络经验值设为强制规则，也没有把国外油田统计阈值直接用于国内区块。

## 安装与更新文档

项目首次拉取、GitHub 账户关联与推送认证、Windows/macOS 环境安装、使用清华 PyPI 镜像安装 `requirements.txt`、启动以及后续更新的完整流程，请参阅 [部署与更新指南.md](部署与更新指南.md)。

## 项目结构

```text
demo-test/
├─ .venv/                         # Python 3.10虚拟环境（不提交Git）
├─ backend/
│  ├─ __init__.py
│  ├─ main.py                     # FastAPI、文件保存/读取、XLSX解析和删除接口
│  └─ algorithms/                 # 数据处理和算法接入预留
│     ├─ preprocessing/           # 标准化、单位换算、去重
│     ├─ imputation/              # 缺失值分析与填补
│     ├─ anomaly_detection/       # 失真、异常、突变与漂移检测
│     ├─ staleness/               # 陈旧数据与新鲜度评分
│     ├─ models/                  # 模型封装、版本和推理接口
│     ├─ pipelines/               # 算法处理流水线
│     └─ evaluation/              # 评估、回归测试与质量指标
├─ dist/                          # Vite生产构建产物
├─ node_modules/                  # Node依赖（不提交Git）
├─ src/
│  ├─ data/
│  │  ├─ seed.ts                  # 原始术语、规则和基础数据
│  │  └─ publicSeed.ts            # 公开来源扩充数据
│  ├─ services/
│  │  └─ qualityEngine.ts         # 可执行规则、文本检查和标注切片
│  ├─ stores/
│  │  └─ data.ts                  # 三类库状态、localStorage持久化及增删/导入操作
│  ├─ views/
│  │  ├─ HomePage.vue             # 平台首页、数据概览和功能入口
│  │  ├─ HomePage.css             # 首页卡片、侧栏适配和响应式样式
│  │  ├─ HomeChart.css             # 首页数据分布环形图和两栏布局
│  │  ├─ HomeChartAlign.css        # 首页图表面板宽度及上下对齐
│  │  ├─ QualityPage.vue          # 文件、文本、语音输入与质控结果
│  │  ├─ QualityPage.css
│  │  ├─ QualityImage.css          # 图像选择和缩略图预览
│  │  ├─ QualityImagePreview.css   # 图像上传按钮及右侧大图预览
│  │  ├─ RulesPage.vue            # 规则库、筛选及实现状态
│  │  ├─ RulesPage.css
│  │  ├─ TermsPage.vue            # 术语分类、查询、新增表单与审核
│  │  ├─ TermsPage.css            # 术语分类、审核和批量操作样式
│  │  ├─ BaseDataPage.vue         # 基础数据分类、查询、新增与删除
│  │  ├─ ImportPage.vue           # 三类数据独立导入及自动规整
│  │  ├─ CheckPage.vue            # 规则自检占位页
│  │  └─ BlankPage.vue            # 通用空白功能页
│  ├─ App.vue                     # 全局侧栏导航、运行状态和动态数据计数
│  ├─ library-management.css      # 数据管理按钮及表格适配
│  ├─ library-dialog.css          # 三类数据大型新增表单
│  ├─ return-home.css             # 功能页返回首页按钮
│  ├─ main.ts
│  ├─ router.ts
│  ├─ styles.css
│  └─ types.ts
├─ uploads/                       # 质控上传文件保存目录
├─ logs/
│  ├─ model_runs.log              # 独立的模型步骤运行日志
│  └─ README.md                   # 日志字段、格式与安全说明
├─ model-artifacts/               # 不提交Git的模型产物与中间结果
│  ├─ models/                     # 模型权重和序列化文件
│  ├─ reports/                    # 算法质量报告
│  └─ intermediate/               # 可再生成的中间数据
├─ .gitignore
├─ index.html
├─ 部署与更新指南.md              # GitHub关联、项目拉取、安装、启动及更新指南
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

- Node.js 20.19+ 或 Node.js 22.12+（推荐 Node.js 22 LTS）
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

截至2026-08-30，当前版本已经通过完整的 Vue、TypeScript 和 Vite 生产构建验证。

## 当前限制

- 质控逻辑仍运行在前端，属于确定性正则和数值判断。
- 53 条规则中目前只有 18 条已接入执行引擎。
- XLSX 由 Python 后端解析；旧版 XLS、DOC 尚未完整支持。
- CSV、TSV 和 JSON 已支持导入字段规整，但字段映射仍属于启发式匹配；正式入库前需要预览、校验和人工审核。
- 页面刷新后可以恢复 `uploads/` 中的文件，但不会恢复直接输入的临时文本、已完成的质控结果和选中状态。
- 术语、规则和基础数据以种子数据初始化，用户新增、删除、审核和导入结果保存在浏览器 `localStorage` 中，尚未接入正式数据库、多用户权限和服务端事务。
- 复杂 Office、PDF 文件可以保存原件，但还不能全部可靠转换为标准记录；后续需要后端解析、字段映射预览和失败回滚。
- 尚未实现复杂上下文、否定条件、跨章节一致性和大模型语义质控。
- 工程图片目前仅支持上传、保存、恢复、删除和预览，尚未实现OCR文字提取、表格恢复或CT/岩心图像分析。
- OCR技术路线需要在获得真实图片样本后，根据扫描表格、报告截图、仪表照片、测井图、地层CT等类型分别设计；不能使用一个通用模型替代全部任务。
- 区块、井型、地层和工况阈值需要企业数据与专家审核后配置。

## 算法接入预留

项目已为后续数据处理算法预留 `backend/algorithms/`，覆盖预处理、缺失值处理、失真与异常检测、陈旧度判断、模型封装、流水线编排和评估。模型权重、报告与中间数据统一放入 `model-artifacts/`，运行步骤写入独立的 `logs/model_runs.log`。

当前仅建立工程结构，不代表算法已经实现。正式接入时应先确认真实数据格式，并遵循以下要求：

- 原始数据只读保存，算法不得直接覆盖；
- 每次执行生成唯一任务ID；
- 记录输入版本、处理步骤、参数、耗时、模型版本和异常；
- 输出原始值、建议值、置信度和是否需要人工复核；
- 大文件、模型权重和敏感中间数据不得提交到 Git；
- 日志不得记录完整敏感数据、密钥、手机号或企业机密字段。

## 下一阶段

1. 将确定性规则迁移到 FastAPI 后端，建立统一 `/api/quality/check` 接口。
2. 将 Pinia/localStorage 数据层迁移至数据库，增加唯一约束、分页、审计日志、版本控制和批量事务。
3. 接入后端 Excel、PDF 和复杂 Office 文档解析，增加导入预览、字段映射调整、重复合并和失败回滚。
4. 实现 MD/TVD、钻头深度/井底深度、时间区间等跨字段规则。
5. 为每条可执行规则增加正确、错误、边界和误报测试样本。
6. 引入质控任务历史、规则版本和人工复核记录。
7. 对实际可获取图片进行格式、清晰度、来源、模板、文字类型和标注情况的数据摸底。
8. 建立脱敏OCR测试集，分别评估扫描表格、工程报告、仪表照片和图件的识别准确率。
9. 接入图像预处理、OCR文字/表格识别及低置信度人工复核，并将结构化结果交给现有规则引擎。
10. 将地层CT、岩心照片中的孔隙、裂缝等视觉分析作为独立计算机视觉任务，不与OCR混为一体。
11. 在确定性规则稳定后增加大模型语义质控。
