# 公开数据来源与使用边界

`src/data/publicSeed.ts` 用于字段归一化和质控原型验证，其中中文说明均为项目自行概括，不是标准正文复制。

| 来源 | 用途 | 官方地址 | 使用边界 |
|---|---|---|---|
| GB/T 28911-2012 | 国内钻井术语标准索引 | https://std.samr.gov.cn/gb/search/gbDetailed?id=71F772D803A6D3A7E05397BE0A0AB82A | 仅记录公开元数据和通用概念；标准正文应通过授权渠道使用 |
| WITSML 2.1 | 井、井筒、轨迹、钻井、测井和录井对象 | https://energistics.org/witsml-developers-users | Energistics公开实现资料，使用时保留来源署名 |
| PRODML 2.3 | 生产、注入、压力和流量对象 | https://energistics.org/prodml-developers-users | 当前生产数据标准版本，使用时保留来源署名 |
| Energistics UOM 1.0.1 | 单位、量纲、符号和换算 | https://energistics.org/energisticsr-consortium-publishes-new-version-its-unit-measure-standard | 用于单位兼容性和规范化，不在仓库复制完整字典 |
| PWLS 4.0 | 测井属性、数量类和曲线分类 | https://energistics.org/practical-well-log-standard | 厂商助记符以Curve Catalog当前版本为准 |
| PWLS Curve Catalog | 厂商曲线助记符映射 | https://curves.energistics.org/ | 社区维护的信息性数据，生产使用前核对厂商版本 |
| Equinor Volve | 真实油田测试文件 | https://www.equinor.com/energy/volve-data-sharing | 遵守Equinor Open Data Licence；仓库未打包原始数据 |
| NLOG | 井、测井、报告和生产测试数据 | https://www.nlog.nl/en/data | 遵守站点条款；仓库未打包原始数据 |

## 未直接纳入

- 付费或只允许在线预览的国家、行业、ISO、API标准全文。
- 来源不明的博客、论坛经验值和营销材料。
- 未经企业确认的区块、地层、井型及工况阈值。
- 未经脱敏和授权的井数据、设计书、日报和事故材料。
- 把国外油田统计范围直接用作国内工程强制阈值的规则。

## 数据状态

- `已审核`：已从公开官方字段模型、单位体系或通用物理约束核对。
- `待审核`：正式中文定义仍需持证标准正文和领域专家确认。
- `template: true`：必须配置企业容差或适用工况后才能用于强制判定。

生产部署前，每条规则还应补充条款号、授权状态、审核人、生效时间、版本和回归测试样本。
