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
// 3. 作物档案主数据完整 Schema
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
  
  // 伴生与相克关系
  incompatible_crop_ids: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export type CropProfile = z.infer<typeof CropProfileSchema>;

// ============================================================================
// 4. 独立作物主数据库 Catalog Schema
// ============================================================================

export const CropCatalogSchema = z.object({
  catalog_version: z.string(),
  updated_at: z.string(), // 严格 ISO 8601
  crops: z.array(CropProfileSchema),
});

export type CropCatalog = z.infer<typeof CropCatalogSchema>;
