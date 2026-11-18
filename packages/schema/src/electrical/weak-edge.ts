/**
 * =========================================================================
 * @aquaponics/schema/electrical/weak-edge · 弱电、PoE+ 与边缘智能化契约
 * 对齐 ISO/IEC 14763-2 (布线与标识) 与工厂 05/06/09 边缘工程规范
 * =========================================================================
 */
import { z } from 'zod';
import { Ipv4AddressSchema } from '../common';
import { TerminalColorEnum } from './catalog';

/** 弱电与网络线缆类型枚举 (补齐 Cat6_STP 与光纤) */
export const WeakCableTypeEnum = z.enum([
  'Cat5e_STP',
  'Cat6_STP',
  'RVSP',       // 双绞屏蔽信号线 (RS-485 / 传感器)
  'RVV',        // 多芯护套控制线
  'BVR',        // 柜内软跳线
  'SingleMode_Fiber',
  'MultiMode_Fiber',
]);

/** 交换机端口类型与工作模式 */
export const SwitchPortRoleEnum = z.enum([
  'poe_camera',     // PoE 监控摄像头
  'poe_edge_box',   // PoE+ 边缘控制箱供电+数据
  'lan_device',     // 普通非 PoE 设备 (PLC / 工控机 / 路由器)
  'uplink_nvr',     // 非 PoE 上行口 (接 NVR 等)
  'sfp_fiber',      // 光口级联
  'spare',          // 预留备用
]);

export const PoeStandardEnum = z.enum([
  'none',
  '802.3af', // 最大 15.4W
  '802.3at', // PoE+ 最大 30W
  '802.3bt', // PoE++ 最大 60W/90W
]);

/** 单个交换机端口分配项 */
export const SwitchPortAllocationSchema = z.object({
  port_id: z.string().min(1), // 如 "Port 09" / "Uplink G1" / "SFP 1"
  role: SwitchPortRoleEnum,
  poe_standard: PoeStandardEnum.optional().default('none'),
  /** 实估负载功耗 (W)，用于汇总校验交换机总 PoE 预算 */
  allocated_power_w: z.number().nonnegative().optional().default(0),
  target_device_id: z.string().optional(),
  target_device_name: z.string().optional(),
  target_ip: Ipv4AddressSchema.optional(),
  cable_tag: z.string().optional(), // 关联三段式线号
});

/** 工业 PoE 交换机矩阵定义 */
export const PoeSwitchMatrixSchema = z.object({
  component_ref: z.string().min(1), // 如 "-A1" (IEC 81346)
  model: z.string().min(1),
  ip_address: Ipv4AddressSchema.optional(),
  /** 交换机硬件拨码模式：在混接边缘箱/PLC/摄像头时必须为 default_open 禁用端口隔离 */
  dip_switch_mode: z.enum(['default_open', 'vlan_isolated', 'extend_250m']).default('default_open'),
  poe_budget_w: z.number().nonnegative(),
  ports: z.array(SwitchPortAllocationSchema),
});

/** PoE 转 24VDC 隔离分离器 (用于去 220V 化的边缘控制箱) */
export const PoeSplitterSpecSchema = z.object({
  component_ref: z.string().min(1),
  model: z.string().min(1),
  input_poe_standard: z.enum(['802.3at', '802.3bt']),
  output_voltage_v: z.union([z.literal(12), z.literal(24)]),
  max_output_w: z.number().positive(), // 如 PS2403BG 实际建议 <= 24W~30W
  downlink_load_w: z.number().nonnegative(),
});

/** 边缘通信节点 (Modbus-TCP 耦合器 / 串口服务器 / 485 Hub / 摄像头) */
export const EdgeNetworkNodeSchema = z.object({
  node_id: z.string().min(1),
  component_ref: z.string().optional(),
  kind: z.enum([
    'plc_main',
    'modbus_tcp_coupler',
    'serial_server',
    'rs485_hub',
    'edge_ipc',
    'nvr',
    'ip_camera',
    'router_gateway',
  ]),
  name: z.string().min(1),
  ip_address: Ipv4AddressSchema.optional(),
  tcp_port: z.number().int().positive().max(65535).optional(),
  visibility: z.enum(['internal_ops', 'public_trace']).optional(),
  power_w: z.number().nonnegative().optional().default(0),
  /** 若挂在串口服务器或 485 总线下，列出从站传感器 */
  modbus_slaves: z
    .array(
      z.object({
        slave_id: z.number().int().min(1).max(247),
        sensor_name: z.string().min(1),
        sensor_model: z.string().optional(),
        fuse_terminal_ref: z.string().optional(), // 如 "-F1" (SAKSI 4N LD)
        power_w: z.number().nonnegative().optional().default(0),
      }),
    )
    .optional()
    .default([]),
});

/** 线缆端点定义 (对齐 ISO/IEC 14763-2 两端对称互指标签) */
export const WireEndpointSchema = z.object({
  cabinet_or_zone: z.string().min(1), // 如 "AP-CTRL" 或 "池边"
  component_ref: z.string().min(1),   // 如 "-A1" 或 "-X1" 或 "pH探头"
  terminal_or_port: z.string().min(1), // 如 "Port 09" / "1+" / "COM"
});

/** 端到端傻瓜接线与线号定义 */
export const WireConnectionSchema = z.object({
  wire_id: z.string().min(1),
  /** 三段式对称线号标签，如 "[AP-CTRL:P09] <-> [AP-EDGE-01:PoE]" */
  cable_tag: z.string().min(1),
  cable_type: WeakCableTypeEnum,
  wire_spec: z.string().optional(), // 如 "4×0.75mm²" 或 "Cat6 STP"
  color_code: TerminalColorEnum.optional().default('other'),
  signal_desc: z.string().min(1),
  from: WireEndpointSchema,
  to: WireEndpointSchema,
  length_m: z.number().positive().optional(),
});

export type SwitchPortAllocation = z.infer<typeof SwitchPortAllocationSchema>;
export type PoeSwitchMatrix = z.infer<typeof PoeSwitchMatrixSchema>;
export type PoeSplitterSpec = z.infer<typeof PoeSplitterSpecSchema>;
export type EdgeNetworkNode = z.infer<typeof EdgeNetworkNodeSchema>;
export type WireConnection = z.infer<typeof WireConnectionSchema>;
