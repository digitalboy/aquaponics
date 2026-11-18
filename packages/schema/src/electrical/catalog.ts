/**
 * =========================================================================
 * @aquaponics/schema/electrical/catalog · 元器件开源规格契约 (IEC 81346-2)
 * 定义工业/弱电元器件的物理尺寸、安装方式、电气功耗、端子定义与施工防坑备注
 * =========================================================================
 */
import { z } from 'zod';

/** IEC 81346-2 标准单字母产品分类码 */
export const Iec81346ClassEnum = z.enum([
  'A', // 复杂组件 / 控制器 / 电源 / 交换机 / PoE分离器 / 工控机
  'B', // 传感器 / 变送器 / 摄像头
  'F', // 保护器件 (微断 / 漏保 / SPD浪涌 / 熔断端子)
  'K', // 继电器 / 接触器
  'M', // 电机
  'P', // 指示灯 / 仪表 / HMI
  'Q', // 强电主开关 / 隔离开关
  'R', // 电阻
  'S', // 按钮 / 旋钮开关
  'T', // 变压器 / 互感器
  'W', // 线缆 / 母线
  'X', // 端子排 / 插座 / 接插件
  'Y', // 电磁阀 / 电动执行器
]);

/** 元器件物理安装方式 */
export const MountTypeEnum = z.enum([
  'din_rail',    // 35mm DIN 导轨卡扣安装
  'plate_screw', // 安装底板螺丝直装 (如无导轨卡扣的 PoE 分离器/金属壳电源)
  'shelf_tray',  // 机柜承重托盘放置 (如 24口交换机/NVR/N100工控机)
  'door_cutout', // 柜门开孔安装 (如指示灯/急停按钮/轴流风扇)
]);

/** 供电与信号类型 */
export const SupplyTypeEnum = z.enum([
  '380VAC',
  '220VAC',
  '24VDC',
  '12VDC',
  'PoE_802_3af',
  'PoE_802_3at',
  'PoE_802_3bt',
  'passive', // 无源干触点 / 纯接线端子
]);

/** 标准化接线端子颜色与极性规范 */
export const TerminalColorEnum = z.enum([
  'grey_24v_plus',   // 灰色: +24VDC 正极
  'blue_0v',         // 蓝色: 0VDC 负极/公共端
  'yellow_green_pe', // 黄绿: PE 保护接地
  'brown_l',         // 棕色/红/黄/绿: AC 火线 (L)
  'blue_n',          // 蓝色: AC 零线 (N)
  'rs485_a',         // RS-485 A+
  'rs485_b',         // RS-485 B-
  'dry_contact',     // 无源干触点 (COM/NO/NC)
  'rj45',            // 以太网 RJ45 接口
  'fiber_sfp',       // 光纤 SFP 接口
  'other',
]);

/** 单个接线端子定义 */
export const TerminalSpecSchema = z.object({
  pin_id: z.string().min(1, '端子编号不能为空'),
  label: z.string().min(1),
  color_code: TerminalColorEnum.optional().default('other'),
  signal_type: z.string().optional(),
  max_wire_mm2: z.number().positive().optional(),
});

/** 元器件物理尺寸 (毫米) */
export const DimensionsMmSchema = z.object({
  width: z.number().positive('宽度必须大于 0 mm'),
  height: z.number().positive('高度必须大于 0 mm'),
  depth: z.number().positive('深度必须大于 0 mm'),
});

/** 元器件核验状态与原文溯源 (用于未来规格书解析审核流) */
export const VerificationStatusEnum = z.enum(['draft', 'vendor_confirmed', 'verified']);

export const SourceEvidenceSchema = z.object({
  field: z.string(),
  page: z.number().int().positive().optional(),
  excerpt: z.string().optional(),
});

/** 开源元器件标准规格定义 */
export const CatalogComponentSchema = z.object({
  part_id: z.string().min(1, '器件唯一ID不能为空'),
  brand: z.string().min(1),
  model: z.string().min(1),
  name: z.string().min(1),
  iec_class: Iec81346ClassEnum,
  category: z.string().min(1),
  dimensions_mm: DimensionsMmSchema,
  mount_type: MountTypeEnum,
  /** 建议左右预留的最小散热/操作间隙 (mm) */
  clearance_mm: z.number().nonnegative().optional().default(0),
  supply_type: SupplyTypeEnum,
  /** 额定功耗 (W)；作为供电设备(如电源/PoE分离器)时代表自身损耗 */
  rated_power_w: z.number().nonnegative().optional().default(0),
  /** 柜内热耗散 (W)，用于 IEC 61439 温升评估 */
  heat_dissipation_w: z.number().nonnegative().optional().default(0),
  /** 若该器件向外输出供电 (如 24V 电源、PoE 交换机、PoE 分离器)，声明最大输出功率 (W) */
  max_output_power_w: z.number().nonnegative().optional(),
  terminals: z.array(TerminalSpecSchema).optional().default([]),
  /** 现场施工与验收防坑备注 (自动汇总至施工 Checklist) */
  install_notes: z.array(z.string()).optional().default([]),
  verification_status: VerificationStatusEnum.optional().default('verified'),
  source_evidence: z.array(SourceEvidenceSchema).optional(),
});

export type Iec81346Class = z.infer<typeof Iec81346ClassEnum>;
export type MountType = z.infer<typeof MountTypeEnum>;
export type SupplyType = z.infer<typeof SupplyTypeEnum>;
export type TerminalSpec = z.infer<typeof TerminalSpecSchema>;
export type CatalogComponent = z.infer<typeof CatalogComponentSchema>;
