import fs from 'fs';
import path from 'path';
import {
  CropCatalogSchema,
  FacilityTopologySchema,
  ProductionSchedulePlanSchema,
  validateScheduleAgainstCatalogs,
} from '../packages/schema/src';

function runValidation() {
  console.log('=== [1] 开始加载独立 JSON 数据文件 ===');
  const dataDir = path.resolve('packages/schema/data');
  
  const cropsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'crops_catalog.json'), 'utf-8'));
  const facilityRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'facility_guangming_jingkou.json'), 'utf-8'));
  const scheduleRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'schedule_2026_q4.json'), 'utf-8'));

  console.log('=== [2] 执行 Zod Schema 基础语法解析 ===');
  const cropsCatalog = CropCatalogSchema.parse(cropsRaw);
  console.log(`✅ CropCatalogSchema 校验通过！成功解析 ${cropsCatalog.crops.length} 种作物主数据。`);

  const facilityTopology = FacilityTopologySchema.parse(facilityRaw);
  console.log(`✅ FacilityTopologySchema 校验通过！大棚: ${facilityTopology.site_name}, 分区数: ${facilityTopology.zones.length}, 生产单元: ${facilityTopology.production_units.length}`);

  const schedulePlan = ProductionSchedulePlanSchema.parse(scheduleRaw);
  console.log(`✅ ProductionSchedulePlanSchema 校验通过！计划: ${schedulePlan.plan_title}, 任务数: ${schedulePlan.assignments.length}`);

  console.log('=== [3] 执行跨文件外键与农艺相容性校验 ===');
  const result = validateScheduleAgainstCatalogs(schedulePlan, cropsCatalog, facilityTopology);
  console.log('跨文件校验结果:', result);

  if (!result.valid) {
    console.error('❌ 生产排产计划校验失败:', result.errors);
    process.exit(1);
  } else {
    console.log('🎉 所有排产任务与作物主数据、大棚物理拓扑完美契合！0 冲突！');
  }

  console.log('=== [4] 故意制造异常冲突以测试规则引擎拦截能力 ===');
  // 故意将仅支持荷兰桶吊蔓的小番茄排入刀刮布落地水培菜池 BED-TARPAULIN-01
  const badPlan = {
    ...schedulePlan,
    assignments: [
      {
        assignment_id: 'SCH-ASN-20261015-999',
        target_unit_id: 'BED-TARPAULIN-01', // 刀刮布水培菜池
        crop_id: 'crop_cherry_tomato_red', // 圣女果 (仅支持 dutch_bucket / substrate_trough)
        batch_lot_number: 'LOT-BAD-01',
        start_seeding_date: '2026-10-01T08:00:00.000Z',
        start_transplanting_date: '2026-10-15T08:00:00.000Z',
        expected_harvest_date: '2026-12-01T08:00:00.000Z',
        target_plant_quantity: 500,
        supervisor_id: 'TEST',
        status: 'confirmed' as const,
      }
    ]
  };

  const badResult = validateScheduleAgainstCatalogs(badPlan, cropsCatalog, facilityTopology);
  console.log('异常测试拦截结果（期望报错）:', badResult.errors);
  if (badResult.errors.length > 0 && badResult.errors[0].includes('系统不相容')) {
    console.log('🛡️ 规则引擎防御成功拦截“小番茄排入水培菜池”错误配置！');
  } else {
    console.error('❌ 规则引擎未能按预期拦截错误！');
    process.exit(1);
  }

  console.log('=== 全部测试圆满通过 ===');
}

runValidation();
