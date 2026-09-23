/**
 * =========================================================================
 * @aquaponics/schema/facility · 大棚设施物理拓扑与空间几何契约 (SSOT)
 * 涵盖：基地地理微气候、温室几何结构、独立环控分区、水力回路与多形态生产单元
 * =========================================================================
 */
import { z } from 'zod';

// ============================================================================
// 1. 结构材料与枚举类型
// ============================================================================

export const GreenhouseStructureTypeEnum = z.enum([
  'multi_span_film',     // 连栋薄膜温室 (如 8.1m 挑高大棚)
  'venlo_glass',         // 荷兰连栋文洛型玻璃温室
  'solar_greenhouse',    // 日光温室 (北方厚墙体)
  'single_arch_tunnel'   // 单体塑料大棚/冷棚
]);

export const ZoneMicroclimateTypeEnum = z.enum([
  'cool_compartment',    // 冷凉温区 (专跑生菜、西洋菜、草莓)
  'warm_compartment',    // 喜温高光区 (专跑空心菜、黄瓜、小番茄)
  'nursery_germination', // 育苗催芽暗室与幼苗炼苗缓冲舱
  'ras_aquaculture'      // 循环水产养殖闭环车间
]);

export const SubstrateMediumTypeEnum = z.enum([
  'coco_coir_perlite',   // 椰糠 7:3 珍珠岩混合基质
  'rockwool_slab',       // 农用岩棉条
  'expanded_clay_balls', // 陶粒 (鱼菜共生潮汐槽)
  'peat_moss_blend'      // 泥炭多孔配方基质
]);

export const HydraulicLoopTypeEnum = z.enum([
  'coupled_aquaponics_loop',   // 鱼菜共生深度闭环回流回路
  'de_coupled_dosing_loop',    // 解耦分流独立精密配方水肥回路
  'drain_to_waste_fertigation' // 滴灌基质排废/冲刷排污回路
]);

// ============================================================================
// 2. 生产单元几何规格判别联合体 (Discriminated Union)
// ============================================================================

// (1) 深水浮板跑道 (DWC Raceway)
export const DwcRacewayUnitSchema = z.object({
  unit_type: z.literal('dwc_raceway'),
  unit_id: z.string().regex(/^DWC-[A-Z0-9_-]+$/),
  name: z.string(),
  zone_id: z.string(),
  bound_hydraulic_loop_id: z.string(),
  
  // 槽体几何尺寸
  length_m: z.number().positive(),
  width_m: z.number().positive(),
  total_depth_m: z.number().positive(),
  operating_water_depth_m: z.number().positive(),
  effective_water_volume_m3: z.number().positive(),
  
  // 浮板规格与承载
  raft_dimension_m: z.tuple([z.number(), z.number()]), // [长, 宽] 如 [1.0, 0.6]
  raft_holes_per_board: z.number().int().positive(),   // 单板孔数 如 24
  max_raft_capacity: z.number().int().positive(),      // 跑道最大容纳浮板张数
  total_planting_holes: z.number().int().positive(),   // 总定植孔数
});

// (2) 高架基质栽培槽 (Substrate Trough，如草莓)
export const SubstrateTroughUnitSchema = z.object({
  unit_type: z.literal('substrate_trough'),
  unit_id: z.string().regex(/^SUB-[A-Z0-9_-]+$/),
  name: z.string(),
  zone_id: z.string(),
  bound_hydraulic_loop_id: z.string(),
  
  // 槽体几何
  bench_length_m: z.number().positive(),
  trough_width_m: z.number().positive(),
  trough_depth_m: z.number().positive(),
  elevated_height_m: z.number().nonnegative().default(1.2), // 架高离地高度
  
  // 基质与滴灌
  medium_type: SubstrateMediumTypeEnum,
  dripper_spacing_cm: z.number().positive(),
  dripper_flow_rate_l_per_h: z.number().positive().default(2.0),
  total_linear_meters: z.number().positive(),
  max_plant_capacity: z.number().int().positive(),
});

// (3) 独立荷兰桶/种植袋单元 (Dutch Bucket，如小番茄/黄瓜/西瓜)
export const DutchBucketUnitSchema = z.object({
  unit_type: z.literal('dutch_bucket'),
  unit_id: z.string().regex(/^BKT-[A-Z0-9_-]+$/),
  name: z.string(),
  zone_id: z.string(),
  bound_hydraulic_loop_id: z.string(),
  
  // 桶体规格与布局
  bucket_volume_liters: z.number().positive().default(11.0),
  medium_type: SubstrateMediumTypeEnum,
  plant_spacing_cm: z.number().positive(),
  row_spacing_m: z.number().positive(),
  total_buckets_count: z.number().int().positive(),
  
  // 吊蔓设施
  trellising_height_m: z.number().positive().default(3.2),
  max_vine_load_kg_per_linear_m: z.number().positive().default(35.0),
});

// (4) 循环水产养殖鱼池 (RAS Tank，如加州鲈)
export const RasTankUnitSchema = z.object({
  unit_type: z.literal('ras_tank'),
  unit_id: z.string().regex(/^RAS-[A-Z0-9_-]+$/),
  name: z.string(),
  zone_id: z.string(),
  bound_hydraulic_loop_id: z.string(),
  
  // 鱼池形状与尺寸
  shape: z.enum(['circular', 'octagonal', 'raceway_oval']),
  diameter_or_length_m: z.number().positive(),
  width_m: z.number().positive().optional(),
  water_depth_m: z.number().positive(),
  effective_water_volume_m3: z.number().positive(),
  conical_bottom_slope_degrees: z.number().min(0).max(60).default(30.0), // 排污锥底倾角
  
  // 养殖设计能力
  target_species: z.string().default('加州鲈 (Micropterus salmoides)'),
  max_biomass_density_kg_per_m3: z.number().positive().default(45.0),
  turnover_rate_times_per_hour: z.number().positive().default(1.5),
});

// (1-A) 刀刮布落地水培菜池 (Ground Tarpaulin Bed)
export const GroundTarpaulinBedUnitSchema = z.object({
  unit_type: z.literal('ground_tarpaulin_bed'),
  unit_id: z.string().regex(/^(BED-TARPAULIN|DWC)-[A-Z0-9_-]+$/),
  name: z.string(),
  zone_id: z.string(),
  bound_hydraulic_loop_id: z.string(),
  
  // 槽体几何尺寸
  length_m: z.number().positive(),
  width_m: z.number().positive(),
  basin_wall_height_m: z.number().positive().default(0.45),
  operating_water_depth_m: z.number().positive(),
  effective_water_volume_m3: z.number().positive(),
  tarpaulin_density_g_per_m2: z.number().positive().default(800.0).describe('PVC刀刮布克重 (如 800g/㎡ 食品级加厚防渗夹网布)'),
  
  // 浮板规格与定植孔
  raft_dimension_m: z.tuple([z.number(), z.number()]),
  raft_holes_per_board: z.number().int().positive(),
  max_raft_capacity: z.number().int().positive(),
  total_planting_holes: z.number().int().positive(),
});

// (1-B) 不锈钢离地水培菜池 (Elevated Stainless Steel Bed)
export const ElevatedStainlessBedUnitSchema = z.object({
  unit_type: z.literal('elevated_stainless_bed'),
  unit_id: z.string().regex(/^(BED-STAINLESS|DWC)-[A-Z0-9_-]+$/),
  name: z.string(),
  zone_id: z.string(),
  bound_hydraulic_loop_id: z.string(),
  
  // 槽体几何尺寸与人体工学
  length_m: z.number().positive(),
  width_m: z.number().positive(),
  elevated_stand_height_m: z.number().positive().default(0.85).describe('离地高度 (m，人体工学站立免弯腰作业高度)'),
  basin_depth_m: z.number().positive().default(0.40),
  operating_water_depth_m: z.number().positive(),
  effective_water_volume_m3: z.number().positive(),
  stainless_grade: z.string().default('SUS304食品级不锈钢'),
  
  // 浮板规格与定植孔
  raft_dimension_m: z.tuple([z.number(), z.number()]),
  raft_holes_per_board: z.number().int().positive(),
  max_raft_capacity: z.number().int().positive(),
  total_planting_holes: z.number().int().positive(),
});

// (2-B) A字架立体基质栽培架 (A-Frame Vertical Substrate Rack，如高架草莓/香草)
export const AFrameSubstrateRackUnitSchema = z.object({
  unit_type: z.literal('a_frame_substrate_rack'),
  unit_id: z.string().regex(/^(RACK-AFRAME|SUB)-[A-Z0-9_-]+$/),
  name: z.string(),
  zone_id: z.string(),
  bound_hydraulic_loop_id: z.string(),
  
  // A字架三维立体几何
  rack_length_m: z.number().positive().describe('A字架全长 (m)'),
  bottom_width_m: z.number().positive().default(1.40).describe('架底宽度 (m)'),
  total_height_m: z.number().positive().default(1.70).describe('A字架总高度 (m)'),
  slope_angle_degrees: z.number().positive().default(60.0).describe('双侧斜面倾角 (度)'),
  
  // 双侧斜面多层槽体
  total_trough_tiers: z.number().int().positive().default(6).describe('双侧斜面层架总槽数 (如两侧各3层，共6层槽)'),
  trough_width_m: z.number().positive().default(0.22),
  trough_depth_m: z.number().positive().default(0.18),
  
  // 基质与微滴灌
  medium_type: SubstrateMediumTypeEnum.default('coco_coir_perlite'),
  dripper_spacing_cm: z.number().positive().default(20.0),
  dripper_flow_rate_l_per_h: z.number().positive().default(2.0),
  total_linear_meters: z.number().positive().describe('总延米数 = 架长 × 层槽数'),
  max_plant_capacity: z.number().int().positive().describe('高坪效草莓/香草最大总定植株数'),
});

// 生产单元判别联合体 (支持全部现实与未来形态)
export const ProductionUnitSchema = z.discriminatedUnion('unit_type', [
  GroundTarpaulinBedUnitSchema,
  ElevatedStainlessBedUnitSchema,
  AFrameSubstrateRackUnitSchema,
  DwcRacewayUnitSchema,
  SubstrateTroughUnitSchema,
  DutchBucketUnitSchema,
  RasTankUnitSchema,
]);

export type ProductionUnit = z.infer<typeof ProductionUnitSchema>;

// ============================================================================
// 3. 水力回路与管道物理契约
// ============================================================================

export const HydraulicLoopSchema = z.object({
  loop_id: z.string().regex(/^LOOP-[A-Z0-9_-]+$/),
  name: z.string(),
  loop_type: HydraulicLoopTypeEnum,
  
  // 管道工程规格
  supply_pipe_material: z.string().default('PVC-U'),
  supply_pipe_nominal_dn: z.number().positive().describe('供水主管公称外径 (mm，如 DN63, DN90)'),
  return_pipe_nominal_dn: z.number().positive().describe('回水主管公称外径 (mm，如 DN110)'),
  design_flow_rate_m3_per_h: z.number().positive(),
  operating_pressure_mpa: z.number().nonnegative().default(0.25),
  
  // 绑定的生产单元
  bound_unit_ids: z.array(z.string()).min(1),
  notes: z.string().optional(),
});

// ============================================================================
// 4. 温室分区与大棚物理拓扑契约
// ============================================================================

export const GreenhouseZoneSchema = z.object({
  zone_id: z.string().regex(/^ZONE-[A-Z0-9_-]+$/),
  name: z.string(),
  microclimate_type: ZoneMicroclimateTypeEnum,
  floor_area_m2: z.number().positive(),
  
  // 环控硬件能力
  has_evaporative_cooling_pads: z.boolean().default(true),
  has_circulation_fans: z.boolean().default(true),
  external_shading_rate_percent: z.number().min(0).max(100).default(75),
  has_independent_water_chiller: z.boolean().default(false),
  has_supplemental_lighting: z.boolean().default(false),
});

export const FacilityTopologySchema = z.object({
  topology_version: z.string(),
  facility_id: z.string(),
  site_name: z.string(),
  
  // 地理与宏观微气候
  geo_location: z.object({
    province: z.string(),
    city: z.string(),
    district: z.string(),
    village_or_community: z.string(),
    coordinates: z.tuple([z.number(), z.number()]), // [经度, 纬度]
    altitude_meters: z.number(),
    climate_zone_description: z.string(),
  }),
  
  // 大棚本体几何
  greenhouse_structure: z.object({
    structure_type: GreenhouseStructureTypeEnum,
    total_length_m: z.number().positive(),
    total_width_m: z.number().positive(),
    shoulder_height_m: z.number().positive(),
    ridge_height_m: z.number().positive(),
    total_footprint_area_m2: z.number().positive(),
    roof_covering_material: z.string().default('15丝 PO高抗撕裂防滴消雾膜'),
  }),
  
  // 分区、水力与单元拓扑
  zones: z.array(GreenhouseZoneSchema).min(1),
  hydraulic_loops: z.array(HydraulicLoopSchema).min(1),
  production_units: z.array(ProductionUnitSchema).min(1),
});

export type FacilityTopology = z.infer<typeof FacilityTopologySchema>;
