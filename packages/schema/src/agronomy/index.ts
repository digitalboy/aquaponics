/**
 * =========================================================================
 * @aquaponics/schema/agronomy · 作物生理与农艺知识主数据契约 (SSOT)
 * 涵盖：作物分类、适生温光水肥容忍阈值、栽培系统适配与采收模式
 * =========================================================================
 */
import { z } from 'zod';

// ============================================================================
// 1. 作物分类与生态习性枚举
// ============================================================================

export const CropCategoryEnum = z.enum([
  'lettuce',          // 散叶/结球生菜 (菊科莴苣属)
  'aquatic_herb',      // 水生草本 (如西洋菜/豆瓣菜)
  'brassica_greens',  // 十字花科绿叶菜 (如菜心、羽衣甘蓝、小白菜)
  'leafy_greens',     // 其他特色绿叶菜 (如菠菜、茼蒿、油麦菜、冬寒菜)
  'medicinal_herb',   // 药食同源功能蔬菜 (如忧遁草、片仔癀草/白背三七)
  'solanaceous_fruit',// 茄果类 (如各色圣女果/小番茄、彩椒)
  'cucurbit_fruit',   // 瓜果类 (如黄瓜、西瓜、网纹甜瓜)
  'berry_fruit',      // 浆果类 (如高架草莓)
  'warm_summer_greens'// 盛夏耐热绿叶菜 (如空心菜/水蕹菜、苋菜、木耳菜)
]);

export const SeasonalityEnum = z.enum([
  'cool_season',      // 冷凉型 (最适昼温 18~22℃，怕热易抽薹)
  'warm_season',      // 喜温/耐热型 (最适昼温 26~32℃，怕冷僵苗)
  'neutral_flexible'  // 广温四季型 (适应 18~28℃)
]);

export const CultivationSystemEnum = z.enum([
  'ground_tarpaulin_bed', // 刀刮布落地水培菜池 (800g/㎡防渗夹网布，低成本大宗量产)
  'elevated_stainless_bed',// 不锈钢离地水培菜池 (SUS304离地0.85m，站立操作，极净精品)
  'a_frame_substrate_rack',// A字架立体基质栽培架 (三角形双侧斜面多层，高坪效草莓/香草)
  'dwc_raceway',          // 通用水培深水池 (Deep Water Culture)
  'nft_gully',            // 浅液流水培管道 (Nutrient Film Technique)
  'substrate_trough',     // 通用单层高架基质槽
  'dutch_bucket',         // 独立荷兰桶/种植袋 (滴灌吊蔓果菜)
  'aeroponics_tower'      // 垂直气雾栽培塔
]);

export const HarvestModeEnum = z.enum([
  'single_cut_head',  // 整株一次性切根采收 (如生菜、白菜)
  'continuous_cut',   // 割茬连续多次采收 (如西洋菜、空心菜、忧遁草嫩梢)
  'fruit_picking',    // 挂果分批采摘 (如圣女果、草莓、黄瓜、西瓜)
  'leaf_stripping'    // 剥叶多批采收 (如羽衣甘蓝)
]);

// ============================================================================
// 2. 温光水肥生理容忍度 Schema
// ============================================================================

export const OptimalTemperatureRangeSchema = z.object({
  day_temp_c: z.tuple([z.number(), z.number()]),     // [最低最适昼温, 最高最适昼温]
  night_temp_c: z.tuple([z.number(), z.number()]),   // [最低最适夜温, 最高最适夜温]
  water_temp_c: z.tuple([z.number(), z.number()]),   // [最低最适水温, 最高最适水温]
  critical_high_temp_c: z.number().describe('超过此温度触发热害或开花抽薹'),
  critical_low_temp_c: z.number().describe('低于此温度触发冷害或生长停滞'),
});

export const FertigationRequirementsSchema = z.object({
  optimal_ec_ms_cm: z.tuple([z.number(), z.number()]), // [下限 EC, 上限 EC]
  optimal_ph: z.tuple([z.number(), z.number()]),        // [下限 pH, 上限 pH]
  min_dissolved_oxygen_mg_l: z.number().positive().default(6.5),
  tipburn_sensitivity: z.enum(['low', 'medium', 'high', 'severe']), // 顶烧病/缺钙敏感度
  ammonia_tolerance: z.enum(['low', 'medium', 'high']),             // 对鱼水分子氨的耐受度
});

export const LightingPhotoperiodSchema = z.object({
  optimal_dli_mol_m2_day: z.tuple([z.number(), z.number()]), // 日累积光照量 DLI
  photoperiod_hours: z.tuple([z.number(), z.number()]),      // 最适日照小时
  light_saturation_point_lux: z.number().positive(),         // 光饱和点
});

// ============================================================================
// 3. 目标品质、安全红线与营养风味指标 Schema (权威信源锚定与防幻觉模型)
// ============================================================================

/**
 * 经验教训记录 (Lessons Learned)：
 * 1. 【严防 AI 浮夸与指标幻觉】：营养成分绝不能脱离植物生理学极限。例如叶菜单糖极少，宣传糖度 8°~10° 纯属荒谬；水培提质增糖能达到 4.0°~4.5° 已是极佳脆甜口感。
 * 2. 【鲜重 (FW) 与干重 (DW) 基准红线】：在药食同源作物（如忧遁草、片仔癀草）的活性成分标定中，科研文献通常以“干重 (DW)”测定（如总黄酮 400~600 mg/100g DW），折算鲜重（含水量~88%）仅约 40~70 mg/100g FW。若把干重数值直接扣在鲜品上，将构成虚假夸大。必须用 `basis` 严格隔离鲜重与干重。
 * 3. 【检测可行性分级】：区分“基地现场快检 (onsite_rapid)”、“第三方国标送检 (lab_third_party)”与“中长期理论攻关方向 (strategic_reserve)”，保证当下能落地，未来有方向。
 */

export const TestingReadinessEnum = z.enum([
  'onsite_rapid',      // 基地已具备或可现场快检 (如 PAL-1 数显折射糖度计、便携硝酸盐试纸/反射仪)
  'lab_third_party',   // 具备国家标准方法，需委托具有 CMA/CNAS 资质的第三方实验室 (HPLC、ICP-MS 等)
  'strategic_reserve'  // 现阶段尚未常态化检测，作为光配方提质与中长期育种调优的战略储备指标与奋斗方向
]);

export const MoistureBasisEnum = z.enum([
  'fresh_weight', // 鲜重基准 (Fresh Weight, FW - 直接采收食用形态)
  'dry_weight'    // 恒重干样基准 (Dry Weight, DW - 105℃烘干脱水形态)
]);

export const SafetyCeilingsSchema = z.object({
  nitrate_mg_kg_ceiling: z.number().positive().describe('硝酸盐上限 (鲜重 mg/kg)'),
  nitrite_mg_kg_ceiling: z.number().positive().default(2.0).describe('亚硝酸盐上限 (鲜重 mg/kg，GB 2762 要求 ≤ 4.0，工厂内控 ≤ 2.0)'),
  heavy_metals_compliance: z.string().describe('重金属限值合规声明与执行标准 (如 GB 2762-2022)'),
  pesticide_residue_limit: z.string().default('ND (Not Detected，纯物理/天敌防虫与鱼水共生，化学农药零检出)'),
  authoritative_source: z.string().describe('法定或权威标准依据 (如 Commission Regulation (EU) 2021/1323, NY/T 743-2020)'),
});

export const SensoryFlavorProfileSchema = z.object({
  target_brix: z.number().positive().describe('目标可溶性固形物糖度 (Brix°)'),
  min_acceptable_brix: z.number().positive().describe('出厂最低验收糖度 (Brix°，低于此值不予按精品包装出厂)'),
  sugar_acid_ratio: z.tuple([z.number(), z.number()]).optional().describe('最适糖酸比区间 (针对茄果类/草莓等)'),
  bitterness_astringency_control: z.string().optional().describe('苦涩味抑制或风味纯化说明 (如莴苣素抑制、采收前断氮控草酸)'),
  texture_crispness: z.string().describe('口感与质构特征描述 (如清脆多汁、无筋无渣、肥厚柔嫩)'),
  authoritative_source: z.string().describe('风味标准或行业测定规范 (如 NY/T 2637-2014)'),
});

export const FunctionalNutritionalMetricSchema = z.object({
  metric_id: z.string().regex(/^[a-z0-9_]+$/, 'metric_id 必须全小写下划线'),
  name_cn: z.string().min(1).describe('营养或功效物质中文名'),
  target_value: z.number().positive().describe('水培设施精细调控下的目标值'),
  traditional_benchmark: z.number().positive().describe('传统露地或常规土壤栽培的对照参考基线'),
  unit: z.string().min(1).describe('计量单位 (如 mg/100g, μg/100g, g/100g)'),
  basis: MoistureBasisEnum.describe('计算基准：鲜重 (fresh_weight) 还是干重 (dry_weight)'),
  authoritative_source: z.string().min(1).describe('权威信源 (必须明确列出书目/标准/期卷，如《中国食物成分表》第6版第二册、GB 5009.86-2016)'),
  testing_readiness: TestingReadinessEnum.describe('检测可行性与实施阶段'),
  biological_significance: z.string().optional().describe('生物学意义或保健机理说明'),
});

export const TargetQualityProfileSchema = z.object({
  safety_ceilings: SafetyCeilingsSchema,
  sensory_flavor: SensoryFlavorProfileSchema,
  functional_nutrition: z.array(FunctionalNutritionalMetricSchema).default([]),
});

export type TargetQualityProfile = z.infer<typeof TargetQualityProfileSchema>;
export type FunctionalNutritionalMetric = z.infer<typeof FunctionalNutritionalMetricSchema>;

// ============================================================================
// 4. 作物档案主数据完整 Schema
// ============================================================================

export const CropProfileSchema = z.object({
  crop_id: z.string().regex(/^crop_[a-z0-9_]+$/, 'crop_id 必须以 crop_ 开头并全小写下划线'),
  common_name: z.string().min(1),
  botanical_name: z.string().optional(),
  variety_name: z.string(),
  category: CropCategoryEnum,
  seasonality: SeasonalityEnum,
  supported_systems: z.array(CultivationSystemEnum).min(1),
  harvest_mode: HarvestModeEnum,
  
  // 生理参数
  temperature: OptimalTemperatureRangeSchema,
  fertigation: FertigationRequirementsSchema,
  lighting: LightingPhotoperiodSchema,
  
  // 生产节拍与空间占位
  nursery_cycle_days: z.number().int().nonnegative(),
  growth_cycle_days: z.number().int().positive(),
  recommended_plant_spacing_cm: z.number().positive(),
  target_plant_density_per_m2: z.number().positive(),
  expected_yield_kg_per_m2_cycle: z.number().positive(),
  
  // 目标品质、安全红线与营养风味标准
  target_quality_profile: TargetQualityProfileSchema.optional(),
  
  // 伴生与相克关系
  incompatible_crop_ids: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export type CropProfile = z.infer<typeof CropProfileSchema>;

// ============================================================================
// 5. 独立作物主数据库 Catalog Schema
// ============================================================================

export const CropCatalogSchema = z.object({
  catalog_version: z.string(),
  updated_at: z.string(), // 严格 ISO 8601
  crops: z.array(CropProfileSchema),
});

export type CropCatalog = z.infer<typeof CropCatalogSchema>;

