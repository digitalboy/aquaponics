/**
 * =========================================================================
 * @aquaponics/schema/schedule · 生产排产计划与跨域校验契约 (SSOT)
 * 涵盖：排产任务分配、批次追溯、ISO 8601 时间戳及与作物/设施目录的跨文件外键联动校验
 * =========================================================================
 */
import { z } from 'zod';
import { IsoUtcDateTimeSchema } from '../common';
import type { CropCatalog } from '../agronomy';
import type { FacilityTopology } from '../facility';

// ============================================================================
// 1. 排产状态枚举
// ============================================================================

export const ScheduleStatusEnum = z.enum([
  'draft',        // 草案规划中
  'confirmed',    // 已确认待播种
  'nursery_stage',// 育苗中 (海绵暗室催芽/分苗期)
  'transplanted', // 已定植入水/入槽
  'active_growth',// 旺盛生长期
  'harvesting',   // 采收进行中
  'completed',    // 本茬采收完毕
  'cancelled'     // 已撤销
]);

// ============================================================================
// 2. 单项排产分配任务 Schema (Assignment)
// ============================================================================

export const ProductionScheduleAssignmentSchema = z.object({
  assignment_id: z.string().regex(/^SCH-ASN-[0-9]{8}-[0-9]{3,}$/, 'assignment_id 格式如 SCH-ASN-20261015-001'),
  target_unit_id: z.string().describe('外键引用 facility_topology 中的生产单元 unit_id'),
  crop_id: z.string().describe('外键引用 crops_catalog 中的作物唯一标识 crop_id'),
  batch_lot_number: z.string().describe('批次追溯号，注入 e-COA'),
  
  // 严格 ISO 8601 UTC 时间节点
  start_seeding_date: IsoUtcDateTimeSchema,
  start_transplanting_date: IsoUtcDateTimeSchema,
  expected_harvest_date: IsoUtcDateTimeSchema,
  actual_harvest_date: IsoUtcDateTimeSchema.optional(),
  
  // 数量与密度
  target_plant_quantity: z.number().int().positive(),
  allocated_raft_count: z.number().int().positive().optional().describe('若为 DWC 跑道，占用的浮板张数'),
  
  // 执行元数据
  supervisor_id: z.string(),
  status: ScheduleStatusEnum.default('confirmed'),
  notes: z.string().optional(),
});

export type ProductionScheduleAssignment = z.infer<typeof ProductionScheduleAssignmentSchema>;

// ============================================================================
// 3. 全厂生产排产大纲计划 Schema (Plan)
// ============================================================================

export const ProductionSchedulePlanSchema = z.object({
  plan_id: z.string().regex(/^PLAN-[A-Z0-9_-]+$/),
  facility_id: z.string(),
  plan_title: z.string(),
  time_horizon: z.string().describe('排产周期，如 2026-Q4'),
  created_at: IsoUtcDateTimeSchema,
  updated_at: IsoUtcDateTimeSchema,
  assignments: z.array(ProductionScheduleAssignmentSchema).min(1),
  notes: z.string().optional(),
});

export type ProductionSchedulePlan = z.infer<typeof ProductionSchedulePlanSchema>;

// ============================================================================
// 4. 跨文件外键联动与农艺相容性校验器 (Cross-File Validator)
// ============================================================================

export interface ScheduleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 校验排产计划是否与独立的作物档案 (crops_catalog) 及大棚设施拓扑 (facility_topology) 相容
 */
export function validateScheduleAgainstCatalogs(
  plan: ProductionSchedulePlan,
  cropsCatalog: CropCatalog,
  facilityTopology: FacilityTopology
): ScheduleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 建立字典加速索引
  const cropMap = new Map(cropsCatalog.crops.map(c => [c.crop_id, c]));
  const unitMap = new Map(facilityTopology.production_units.map(u => [u.unit_id, u]));
  const loopMap = new Map(facilityTopology.hydraulic_loops.map(l => [l.loop_id, l]));

  // 2. 遍历检查每一个任务的外键存在性与系统适配性
  for (const asn of plan.assignments) {
    // 检查 crop_id 是否存在
    const crop = cropMap.get(asn.crop_id);
    if (!crop) {
      errors.push(`[外键失效] assignment ${asn.assignment_id} 引用的 crop_id "${asn.crop_id}" 不存在于 crops_catalog.json 中！`);
      continue;
    }

    // 检查 target_unit_id 是否存在
    const unit = unitMap.get(asn.target_unit_id);
    if (!unit) {
      errors.push(`[外键失效] assignment ${asn.assignment_id} 引用的 target_unit_id "${asn.target_unit_id}" 不存在于 facility_topology 中！`);
      continue;
    }

    // 检查该作物是否支持该设施系统
    if (!crop.supported_systems.includes(unit.unit_type as any)) {
      errors.push(`[系统不相容] 作物 "${crop.common_name}" (${crop.crop_id}) 不支持在设施类型 "${unit.unit_type}" (${unit.unit_id}) 中栽培！支持类型: [${crop.supported_systems.join(', ')}]`);
    }

    // 检查定植容量是否超载
    if (unit.unit_type === 'dwc_raceway' && asn.target_plant_quantity > unit.total_planting_holes) {
      warnings.push(`[定植超容预警] assignment ${asn.assignment_id} 计划种植 ${asn.target_plant_quantity} 株，超过跑道 ${unit.unit_id} 最大孔数上限 ${unit.total_planting_holes} 株！`);
    }
  }

  // 3. 水力回路共线冲突校验 (同时间、同水路下的作物相容性)
  const loopUsage = new Map<string, Array<{ asn: ProductionScheduleAssignment; crop_id: string }>>();
  for (const asn of plan.assignments) {
    const unit = unitMap.get(asn.target_unit_id);
    if (unit && unit.bound_hydraulic_loop_id) {
      const existing = loopUsage.get(unit.bound_hydraulic_loop_id) || [];
      existing.push({ asn, crop_id: asn.crop_id });
      loopUsage.set(unit.bound_hydraulic_loop_id, existing);
    }
  }

  for (const [loopId, usage] of loopUsage.entries()) {
    if (usage.length > 1) {
      const distinctCrops = Array.from(new Set(usage.map(u => u.crop_id)));
      for (let i = 0; i < distinctCrops.length; i++) {
        for (let j = i + 1; j < distinctCrops.length; j++) {
          const cropA = cropMap.get(distinctCrops[i]);
          const cropB = cropMap.get(distinctCrops[j]);
          if (cropA && cropB) {
            // 检查显式相克列表
            if (cropA.incompatible_crop_ids.includes(cropB.crop_id) || cropB.incompatible_crop_ids.includes(cropA.crop_id)) {
              errors.push(`[水力回路共线致命冲突] 作物 "${cropA.common_name}" 与 "${cropB.common_name}" 共享同一水力回路 "${loopId}"，二者存在显式相克禁忌！`);
            }
            // 检查 EC 浓度交集
            const [minEcA, maxEcA] = cropA.fertigation.optimal_ec_ms_cm;
            const [minEcB, maxEcB] = cropB.fertigation.optimal_ec_ms_cm;
            const hasEcOverlap = Math.max(minEcA, minEcB) <= Math.min(maxEcA, maxEcB);
            if (!hasEcOverlap) {
              errors.push(`[水力回路EC浓度冲突] 作物 "${cropA.common_name}" (EC: ${minEcA}~${maxEcA}) 与 "${cropB.common_name}" (EC: ${minEcB}~${maxEcB}) 共享水力回路 "${loopId}"，营养液浓度区间无交集！`);
            }
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
