/**
 * =========================================================================
 * @aquaponics/schema/hydraulic · 全厂水动力与水循环统一数据契约
 * 严格对齐《09_全厂水动力拓扑与水循环数据契约规范 (PlantWideHydraulicSchema)》
 * 标准规范 (Schema) 保持物理抽象与规则校验
 * =========================================================================
 */
import { z } from 'zod';
import { IsoUtcDateTimeSchema } from '../common';

// ============================================================================
// 1. 基础水力枚举
// ============================================================================

export const WaterSourceTypeEnum = z.enum([
  'municipal_tap_water',     // 市政自来水 (必须配置活性炭脱氯)
  'groundwater_well',        // 地下深井水 (必须配置曝气充氧与除铁锰)
  'rainwater_harvesting'     // 雨水收集回用 (必须配置沉淀过滤与 UV 消毒)
]);

export const PipeFlowTypeEnum = z.enum([
  'gravity_free_surface',    // 重力明渠/有坡度重力自流管
  'gravity_overflow',        // 溢流堰自流
  'gravity_distribution',    // 调理池重力分配
  'pressurized_closed_pipe'  // 水泵密闭压力输水管
]);

export const PipeMaterialEnum = z.enum([
  'PVC-U',
  'HDPE',
  'PPR',
  'StainlessSteel_304',
  'ConcreteChannel'
]);

// ============================================================================
// 2. 多源补水与前置脱毒预处理 Schema
// ============================================================================

export const WaterSourceSchema = z.object({
  source_id: z.string(),
  source_type: WaterSourceTypeEnum,
  nominal_pipeline_dn: z.number().positive(),
  supply_pressure_mpa: z.number().positive().optional(),
  baseline_temp_c: z.number(),
  residual_chlorine_mg_l: z.number().nonnegative(),
  dissolved_oxygen_mg_l: z.number().nonnegative().optional(),
  iron_content_mg_l: z.number().nonnegative(),
  required_pre_treatment: z.string(),
});

export const PreTreatmentUnitsSchema = z.object({
  carbon_filter: z.object({
    unit_id: z.string(),
    media: z.string(),
    design_flow_capacity_m3_per_h: z.number().positive(),
    target_chlorine_outlet_mg_l: z.number().max(0.02, '自来水经活性炭脱氯后余氯严禁超过 0.02 mg/L (防杀死硝化细菌与烧伤鱼鳃)').optional().default(0.01),
  }).optional(),
  aeration_and_degassing_tower: z.object({
    unit_id: z.string(),
    type: z.string(),
    target_do_outlet_mg_l: z.number().min(5.0, '地下井水经曝气后溶氧必须 >= 5.0 mg/L (防死水缺氧)').optional().default(6.5),
    co2_stripping_efficiency_pct: z.number().positive().optional().default(85),
  }).optional(),
  manganese_sand_iron_filter: z.object({
    unit_id: z.string(),
    media: z.string(),
    target_iron_outlet_mg_l: z.number().max(0.3, '除铁滤后水铁含量必须 <= 0.3 mg/L (防氧化沉淀堵塞管网)').optional().default(0.1),
  }).optional(),
});

export const MakeupWaterSystemSchema = z.object({
  active_source_type: WaterSourceTypeEnum.optional().default('municipal_tap_water'),
  sources_available: z.array(WaterSourceSchema).optional().default([]),
  pre_treatment_units: PreTreatmentUnitsSchema.optional(),
  makeup_buffer_tank: z.object({
    vessel_id: z.string(),
    geometry: z.object({
      shape: z.enum(['rectangular', 'circular']).optional().default('rectangular'),
      volume_m3: z.number().positive(),
    }),
    sensors: z.object({
      level_sensor_type: z.string().optional().default('静压投入式液位计'),
      temp_sensor: z.string().optional().default('PT1000'),
      do_sensor: z.string().optional().default('荧光法 DO'),
    }).optional(),
  }).optional(),
  evaporation_makeup_rules: z.object({
    estimated_daily_evaporation_m3: z.number().positive().optional().default(3.8),
    dosing_mode: z.literal('continuous_micro_pulse').optional().default('continuous_micro_pulse'),
    max_hourly_makeup_volume_m3: z.number().positive().optional().default(0.25),
    temp_gradient_limit_c_per_hour: z.number().max(1.0, '补水引发的系统水温温变率严禁超过 1.0 ℃/h').optional().default(0.3),
  }).optional(),
});

// ============================================================================
// 3. 水体容器与生化处理单元 Schema
// ============================================================================

export const VesselNodeSchema = z.object({
  node_id: z.string(),
  name: z.string(),
  unit_type: z.enum([
    'fish_rearing_tank',         // 养殖圆池
    'mechanical_screen_filter',  // 机械微滤机
    'biological_filter_mbbr',    // MBBR 生物滤池
    'water_conditioning_tank',   // 水质调理中继池
    'hydroponic_dwc_runway',     // 水培深水跑道
    'sump_pit'                   // 循环泵吸水井/坑
  ]),
  count: z.number().int().positive().optional().default(1),
  effective_volume_m3: z.number().positive().optional(),
  total_group_volume_m3: z.number().positive().optional(),
  target_turnover_rate_per_hour: z.number().positive().optional(),
});

// ============================================================================
// 4. 水泵与驱动执行器 Schema
// ============================================================================

export const HydraulicPumpSchema = z.object({
  pump_id: z.string(),
  name: z.string(),
  duty_type: z.enum(['duty_active', 'standby_auto_switch', 'maintenance_spare']).optional().default('duty_active'),
  rated_power_kw: z.number().positive(),
  rated_flow_m3_per_h: z.number().positive(),
  rated_head_m: z.number().positive(),
  efficiency_pct: z.number().positive().optional().default(78),
  is_vfd_speed_controlled: z.boolean().optional().default(true),
});

// ============================================================================
// 5. 水力输配管道 Schema
// ============================================================================

export const PipelineSchema = z.object({
  pipe_id: z.string(),
  name: z.string(),
  from_node: z.string(),
  to_node: z.string(),
  material: PipeMaterialEnum.optional().default('PVC-U'),
  nominal_diameter_dn: z.number().positive(),
  length_m: z.number().positive(),
  flow_type: PipeFlowTypeEnum,
  slope_pct: z.number().nonnegative().optional(),
  design_flow_m3_per_h: z.number().positive(),
  velocity_m_per_s: z.number().positive().optional(),
  calculated_head_loss_m: z.number().nonnegative().optional(),
});

// ============================================================================
// 6. 全厂水循环系统根契约 (Root Schema)
// ============================================================================

export const PlantWideHydraulicSchema = z.object({
  schema_version: z.literal('2.0.0').optional().default('2.0.0'),
  system_id: z.string(),
  facility_name: z.string(),
  workshop_code: z.string(),
  updated_at: IsoUtcDateTimeSchema,
  
  water_balance_summary: z.object({
    total_system_volume_m3: z.number().positive(),
    total_fish_tank_volume_m3: z.number().positive(),
    total_hydroponic_runway_volume_m3: z.number().positive(),
    treatment_and_buffer_volume_m3: z.number().positive(),
    target_circulation_flow_rate_m3_per_h: z.number().positive(),
    fish_tank_turnover_rate_per_hour: z.number().positive().optional().default(1.07),
  }),

  makeup_water_system: MakeupWaterSystemSchema.optional(),
  vessels_and_units: z.array(VesselNodeSchema).min(1),
  pumps_and_actuators: z.array(HydraulicPumpSchema).min(1),
  pipe_network: z.array(PipelineSchema).min(1),
  operating_hydraulic_modes: z.array(z.object({
    mode_code: z.string(),
    mode_name: z.string(),
    description: z.string().optional().default(''),
    valve_states: z.record(z.string(), z.string()).optional().default({}),
  })).optional().default([]),
});

export type PlantWideHydraulic = z.infer<typeof PlantWideHydraulicSchema>;
export type VesselNode = z.infer<typeof VesselNodeSchema>;
export type HydraulicPump = z.infer<typeof HydraulicPumpSchema>;
export type Pipeline = z.infer<typeof PipelineSchema>;
