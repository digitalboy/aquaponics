/**
 * =========================================================================
 * @aquaponics/schema/electrical · 全要素电气与智能化统一数据契约
 * 严格对齐《08_全要素电气与智能化拓扑数据契约规范 (PlantWideTopologySchema)》
 * 标准规范 (Schema) 保持厂商中立与物理抽象
 * =========================================================================
 */
import { z } from 'zod';
import { IsoUtcDateTimeSchema, Ipv4AddressSchema } from '../common';

// ============================================================================
// 1. 基础电气枚举与标量
// ============================================================================

export const VoltageSystemEnum = z.enum([
  'TN-S 380V/220V 50Hz',
  'TN-C-S 380V/220V 50Hz',
  'TT 380V/220V 50Hz'
]);

export const PoleCountEnum = z.enum(['1P', '2P', '3P', '4P', '3P+N']);
export const TripCurveEnum = z.enum(['B', 'C', 'D']);
export const CableTypeEnum = z.enum(['YJV', 'VV', 'RVV', 'RVSP', 'Cat5e_STP', 'BVR']);

export const LoadTypeEnum = z.enum([
  'pump_motor',        // 循环水泵 (重载动力电机，强制配 D 型微断)
  'blower_motor',      // 鼓风机 (重载动力电机，强制配 D 型微断)
  'screen_filter',     // 机械微滤机减速电机
  'hvac_fan',          // 高空环流风机
  'actuator_motor',    // 电动开窗机/卷膜/遮阳电机
  'dosing_pump',       // 脉冲计量加药泵
  'ups_it_load',       // 弱电中台 / 工控机 / PLC
  'facility_lighting', // 厂房照明与检修用电
  'general_load'       // 通用负荷
]);

// ============================================================================
// 2. 强电断路器、电缆与变频器 Schema (厂商中立)
// ============================================================================

export const CircuitBreakerSchema = z.object({
  brand: z.string().optional(),
  model: z.string(),
  poles: PoleCountEnum,
  rated_current_a: z.number().positive('额定电流必须大于 0A'),
  trip_curve: TripCurveEnum,
  breaking_capacity_ka: z.number().positive('短路分断能力必须大于 0kA').optional(),
  magnetic_trip_instant_a: z.number().positive().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'TRIPPED']).optional().default('CLOSED'),
});

export const CableSchema = z.object({
  cable_type: CableTypeEnum.optional().default('YJV'),
  spec: z.string(),
  conductors: z.object({
    live_conductors_count: z.number().int().min(1).max(8).optional(),
    live_cross_section_mm2: z.number().positive().optional(),
    has_neutral: z.boolean().optional(),
    neutral_cross_section_mm2: z.number().nonnegative().optional(),
    pe_cross_section_mm2: z.number().nonnegative().optional(),
  }).optional(),
  installation_method: z.enum(['CT', 'SC25', 'SC32', 'SC50', 'FC']).optional().default('CT'),
  length_m: z.number().positive('敷设长度必须大于 0米'),
  allowable_ampacity_a: z.number().positive('允许持续载流量必须大于 0A'),
  calculated_voltage_drop_pct: z.number().nonnegative().max(5.0, '末端计算电压降严禁超过 5.0%').optional(),
});

export const VfdDriveSchema = z.object({
  brand: z.string().optional(),
  vfd_brand: z.string().optional(),
  model: z.string().optional(),
  vfd_model: z.string().optional(),
  rated_power_kw: z.number().positive(),
  control_terminals: z.object({
    start_stop_di: z.string().optional().default('DI1'),
    fault_relay: z.string().optional().default('TA/TC'),
    analog_freq_input: z.string().optional(),
  }).optional(),
});

// ============================================================================
// 3. 动力分支回路 Schema
// ============================================================================

export const CircuitSchema = z.object({
  circuit_id: z.string(),
  name: z.string(),
  breaker: CircuitBreakerSchema,
  cable: CableSchema,
  load: z.object({
    device_id: z.string().optional(),
    name: z.string(),
    type: LoadTypeEnum,
    rated_power_kw: z.number().positive(),
    rated_voltage_v: z.union([z.literal(380), z.literal(220)]).optional().default(380),
    rated_current_a: z.number().positive(),
    is_vfd_driven: z.boolean().optional().default(false),
    vfd_config: VfdDriveSchema.optional(),
    duty_cycle_hours_per_day: z.number().min(0).max(24).optional().default(24),
  }),
  telemetry: z.object({
    timestamp: IsoUtcDateTimeSchema,
    current_a: z.number().nonnegative(),
    power_kw: z.number().nonnegative(),
    status: z.enum(['RUNNING', 'STANDBY', 'WARNING', 'OVERLOAD', 'OFFLINE']),
  }).optional(),
});

export const SubPanelSchema = z.object({
  panel_id: z.string(),
  name: z.string(),
  ip_rating: z.enum(['IP54', 'IP65', 'IP66']).optional().default('IP54'),
  physical_location: z.string().optional(),
  incoming_switch: CircuitBreakerSchema,
  feeder_cable: CableSchema,
  circuits: z.array(CircuitSchema).min(1),
});

export const PowerDistributionSchema = z.object({
  transformer_capacity_kva: z.number().positive(),
  main_incomer: z.object({
    panel_id: z.literal('AP-MAIN').or(z.string()),
    name: z.string(),
    physical_location: z.string().optional(),
    main_breaker: CircuitBreakerSchema,
    metering: z.object({
      meter_model: z.string(),
      ct_ratio: z.string(),
      ct_spec: z.string().optional(),
      ct_brand_and_model: z.string().optional(),
    }),
    spd_surge_protection: z.object({
      nominal_discharge_current_ka: z.number().positive(),
      test_class: z.enum(['T1', 'T2']).optional().default('T1'),
    }),
  }),
  sub_panels: z.array(SubPanelSchema),
});

// ============================================================================
// 4. 弱电直流、UPS 与集中供电 Schema
// ============================================================================

export const DcAndUpsSystemSchema = z.object({
  ups_unit: z.object({
    brand: z.string().optional(),
    model: z.string(),
    capacity_kva: z.number().positive(),
    battery_spec: z.string().optional(),
    backup_hours_at_full_load: z.number().positive().optional().default(5.1),
  }).optional(),
  dc_power_supply: z.object({
    brand: z.string().optional(),
    model: z.string(),
    output_voltage_v: z.literal(24).optional().default(24),
    output_current_a: z.number().positive().optional().default(5),
    max_measured_line_drop_v: z.number().max(2.4, 'DC 24V 末端压降严禁超过 2.4V (即最低工作电压 >= 21.6V)').optional().default(0.8),
  }).optional(),
});

// ============================================================================
// 5. PLC 控制器与 I/O 映射 Schema
// ============================================================================

export const DigitalInputPointSchema = z.object({
  point_id: z.string(),
  signal_name: z.string(),
  description: z.string(),
  contact_type: z.enum(['NO', 'NC']).optional().default('NO'),
  wire_id: z.string(),
});

export const DigitalOutputPointSchema = z.object({
  point_id: z.string(),
  signal_name: z.string(),
  description: z.string(),
  wire_id: z.string(),
});

export const PlcIoMappingSchema = z.object({
  controller_brand: z.string().optional(),
  controller_model: z.string().optional().default('CPU 1214C DC/DC/DC'),
  ip_address: Ipv4AddressSchema.optional().default('192.168.1.10'),
  port: z.number().optional().default(502),
  protocol: z.literal('Modbus-TCP').optional().default('Modbus-TCP'),
  digital_inputs: z.array(DigitalInputPointSchema).optional().default([]),
  digital_outputs: z.array(DigitalOutputPointSchema).optional().default([]),
});

// ============================================================================
// 6. RS-485 现场总线与从站字典 Schema
// ============================================================================

export const Rs485SlaveDeviceSchema = z.object({
  slave_address_hex: z.string().optional(),
  addr: z.string().optional(),
  device_name: z.string().optional(),
  name: z.string().optional(),
  model: z.string().optional(),
  manufacturer_and_model: z.string().optional(),
  baud_rate: z.literal(9600).optional().default(9600),
  data_bits: z.literal(8).optional().default(8),
  stop_bits: z.literal(1).optional().default(1),
  parity: z.literal('None').optional().default('None'),
  polling_interval_ms: z.number().positive().optional(),
  poll_ms: z.number().positive().optional(),
});

export const Rs485FieldbusSchema = z.object({
  bus_id: z.string().optional().default('RS485-BUS-01'),
  topology_type: z.literal('Daisy-Chain-Hand-In-Hand').optional().default('Daisy-Chain-Hand-In-Hand'),
  has_120_ohm_terminator_at_end: z.boolean().optional().default(true),
  slaves: z.array(Rs485SlaveDeviceSchema).min(1),
});

// ============================================================================
// 7. 边缘工控机与安防视频网络 Schema
// ============================================================================

export const EdgeAndNetworkSchema = z.object({
  edge_ipc: z.object({
    model: z.string().optional(),
    brand_and_model: z.string().optional(),
    ip_address: Ipv4AddressSchema.optional().default('192.168.1.200'),
    os: z.string().optional().default('Ubuntu 24.04 LTS RT-Preempt'),
    services_running: z.array(z.string()).optional().default([]),
  }).optional(),
  poe_switch: z.object({
    model: z.string().optional().default('8口全千兆工业级PoE交换机'),
    total_power_budget_w: z.number().positive().optional().default(120),
  }).optional(),
  nvr_recorder: z.object({
    model: z.string().optional().default('16路超清网络硬盘录像机'),
    ip_address: Ipv4AddressSchema.optional().default('192.168.1.250'),
    storage_capacity_tb: z.number().positive().optional().default(8),
  }).optional(),
  ip_cameras: z.array(z.object({
    camera_id: z.string(),
    ip_address: Ipv4AddressSchema,
    location_and_target: z.string(),
    poe_powered: z.boolean().optional().default(true),
  })).optional().default([]),
});

// ============================================================================
// 8. 全场景线材标准与双层桥架 Schema
// ============================================================================

export const CablingSystemSchema = z.object({
  cat5e_stp_pinout: z.object({
    pair1_blue_white_blue: z.string().optional().default('RS-485 A/B 差分信号'),
    pair2_3_orange_green_parallel: z.string().optional().default('DC 24V 并联供电 (+/-)'),
    pair4_brown_white_brown: z.string().optional().default('备份备用'),
    shield_pe: z.string().optional().default('屏蔽层单端入箱接地'),
  }).optional(),
  rvsp_m12_pinout: z.object({
    pin1_brown: z.string().optional().default('DC 24V+'),
    pin2_white: z.string().optional().default('RS485-A'),
    pin3_blue: z.string().optional().default('GND (0V)'),
    pin4_black: z.string().optional().default('RS485-B'),
  }).optional(),
  containment_trays: z.object({
    tray_material: z.string().optional().default('热浸锌防腐槽式'),
    upper_power_tray_spec: z.string().optional().default('200x100mm 封闭式动力槽'),
    lower_data_tray_spec: z.string().optional().default('150x100mm 网格式弱电架'),
    vertical_clearance_mm: z.number().min(300, '强弱电双层桥架垂直净间距必须 >= 300mm').optional().default(300),
  }).optional(),
});

// ============================================================================
// 9. 联合防雷接地与等电位联结 Schema
// ============================================================================

export const EarthingSystemSchema = z.object({
  measured_earthing_resistance_ohm: z.number().max(1.0, '联合接地网工频接地电阻实测严禁超过 1.0 Ω').optional().default(0.78),
  meb_box_location: z.string().optional().default('一级配电总柜旁 MEB 端子箱'),
  spd_levels: z.object({
    level1_main_panel: z.string().optional().default('40kA T1/T2 复合型'),
    level2_sub_panels: z.string().optional().default('20kA T2 级'),
    level3_control_cabinet: z.string().optional().default('10kA 信号/电源双重浪涌'),
  }).optional(),
});

// ============================================================================
// 10. 全厂电气与智能化统一数据模型根契约 (Root Schema)
// ============================================================================

export const PlantWideTopologySchema = z.object({
  schema_version: z.literal('2.0.0').optional().default('2.0.0'),
  system_id: z.string(),
  facility_name: z.string(),
  workshop_code: z.string(),
  voltage_system: VoltageSystemEnum.optional().default('TN-S 380V/220V 50Hz'),
  updated_at: IsoUtcDateTimeSchema,
  
  // 八大实体子系统
  power_distribution: PowerDistributionSchema,
  dc_and_ups_system: DcAndUpsSystemSchema.optional(),
  plc_controller: PlcIoMappingSchema.optional(),
  rs485_fieldbus: Rs485FieldbusSchema.optional(),
  edge_and_network: EdgeAndNetworkSchema.optional(),
  cabling_system: CablingSystemSchema.optional(),
  earthing_system: EarthingSystemSchema.optional(),
});

/** 导出核心类型定义 */
export type PlantWideTopology = z.infer<typeof PlantWideTopologySchema>;
export type ElectricalTopology = PlantWideTopology; // 兼容别名
export type ElectricalCircuit = z.infer<typeof CircuitSchema>;
export type SubPanel = z.infer<typeof SubPanelSchema>;
export type CircuitBreaker = z.infer<typeof CircuitBreakerSchema>;
export type Cable = z.infer<typeof CableSchema>;
