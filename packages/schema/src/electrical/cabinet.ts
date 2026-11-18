/**
 * =========================================================================
 * @aquaponics/schema/electrical/cabinet · 物理电箱配盘与施工交付契约
 * 对齐 IEC 81346 (位置/产品参照) 与 IEC 61439 (低压成套设备验证规则)
 * =========================================================================
 */
import { z } from 'zod';
import { IsoUtcDateTimeSchema } from '../common';
import {
  DimensionsMmSchema,
  Iec81346ClassEnum,
  MountTypeEnum,
  SupplyTypeEnum,
  TerminalColorEnum,
} from './catalog';
import {
  EdgeNetworkNodeSchema,
  PoeSplitterSpecSchema,
  PoeSwitchMatrixSchema,
  WireConnectionSchema,
} from './weak-edge';

/** 箱体额定与防护参数 (对齐 IEC 61439) */
export const CabinetEnclosureSchema = z.object({
  width_mm: z.number().positive(),
  height_mm: z.number().positive(),
  depth_mm: z.number().positive(),
  base_plinth_mm: z.number().nonnegative().optional().default(0), // 如 100mm 底座
  ip_rating: z.enum(['IP20', 'IP30', 'IP54', 'IP65', 'IP66']),
  material: z.enum(['cold_rolled_steel', 'stainless_304', 'abs_polycarbonate']).default('cold_rolled_steel'),
  cooling_type: z.enum(['natural_convection', 'forced_fan', 'air_conditioned']).default('natural_convection'),
  /** 柜内允许最高总发热量 (W)，用于温升校验 */
  max_heat_dissipation_w: z.number().positive().optional(),
  /** 额定工作电压 Ue (V) 与成套总电流 InA (A) */
  rated_voltage_ue_v: z.union([z.literal(24), z.literal(220), z.literal(380)]),
  rated_current_ina_a: z.number().positive(),
  rated_diversity_factor: z.number().min(0.1).max(1.0).optional().default(0.8),
});

/** 箱体底板/侧板防水葛兰头开孔规格 */
export const GlandCutoutSchema = z.object({
  gland_size: z.enum(['PG9', 'PG11', 'PG13.5', 'PG16', 'PG21', 'PG29', 'M20', 'M25', 'M32']),
  diameter_mm: z.number().positive(),
  quantity: z.number().int().positive(),
  position: z.enum(['bottom_plate', 'left_side', 'right_side', 'top_plate']).default('bottom_plate'),
  purpose: z.string().min(1),
});

/** 柜内单个已安装元器件实例 (关联 IEC 81346 参照代号) */
export const MountedComponentSchema = z.object({
  /** IEC 81346 产品代号，如 -Q1, -F1, -A1, -K1..K16, -X1 */
  component_ref: z.string().min(1),
  /** 关联开源元器件库 part_id (可选，允许自包含描述) */
  catalog_part_id: z.string().optional(),
  iec_class: Iec81346ClassEnum,
  function_aspect: z.string().optional(), // 如 "=POWER", "=PLC", "=WATER"
  name: z.string().min(1),
  model: z.string().min(1),
  mount_type: MountTypeEnum,
  width_mm: z.number().positive(),
  clearance_mm: z.number().nonnegative().optional().default(0),
  supply_type: SupplyTypeEnum,
  rated_power_w: z.number().nonnegative().optional().default(0),
  heat_dissipation_w: z.number().nonnegative().optional().default(0),
  /** 若为熔断保护端子 (如 SAKSI 4N LD)，标记为 true */
  is_fuse_terminal: z.boolean().optional().default(false),
  install_notes: z.array(z.string()).optional().default([]),
});

/** 35mm DIN 导轨安装区 */
export const DinRailZoneSchema = z.object({
  rail_id: z.string().min(1), // 如 "R1", "R2", "R3", "R4"
  location_label: z.string().min(1), // 如 "下层导轨 3 (端子与继电器区)"
  usable_width_mm: z.number().positive(),
  items: z.array(MountedComponentSchema),
});

/** 托盘层 / 底板螺丝直装区 */
export const NonRailZoneSchema = z.object({
  zone_id: z.string().min(1),
  mount_type: z.enum(['shelf_tray', 'plate_screw', 'door_cutout']),
  location_label: z.string().min(1),
  area_dimensions_mm: DimensionsMmSchema.optional(),
  items: z.array(MountedComponentSchema),
});

/** 标准化端子排 (支持灰蓝分色与熔断端子) */
export const TerminalStripSchema = z.object({
  strip_ref: z.string().min(1), // 如 "-X1"
  name: z.string().min(1),
  rail_id: z.string().optional(),
  terminals: z.array(
    z.object({
      index: z.number().int().positive(),
      label: z.string().min(1),
      color_code: TerminalColorEnum,
      has_fuse: z.boolean().optional().default(false),
      fuse_rating_a: z.number().positive().optional(),
      connected_signal: z.string().optional(),
    }),
  ),
});

/** 强弱电隔离与安全边界声明 */
export const SafetyBoundarySchema = z.object({
  has_ac_power: z.boolean(),
  has_dc_or_poe: z.boolean(),
  pe_grounding_max_ohm: z.number().positive().optional().default(1.0),
  pe_wire_min_mm2: z.number().positive().optional().default(2.5),
  /** 若为纯 PoE+ 边缘箱且预留二期强电控制，必须声明无源干触点隔离 */
  dry_contact_isolation_only: z.boolean().optional().default(false),
  notes: z.array(z.string()).optional().default([]),
});

/** 完整电箱配盘工程契约 (对齐 IEC 81346 + IEC 61439 + ISO/IEC 14763-2) */
export const PanelAssemblySchema = z
  .object({
    schema_version: z.literal('3.0.0'),
    panel_id: z.string().min(1), // 如 "AP-CTRL", "AP-EDGE-01"
    name: z.string().min(1),
    function_aspect: z.string().min(1), // 如 "=CENTRAL_CTRL", "=WATER_QUALITY"
    physical_location: z.string().min(1),
    updated_at: IsoUtcDateTimeSchema,
    enclosure: CabinetEnclosureSchema,
    safety_boundary: SafetyBoundarySchema,
    cutouts: z.array(GlandCutoutSchema).optional().default([]),
    din_rails: z.array(DinRailZoneSchema).default([]),
    non_rail_zones: z.array(NonRailZoneSchema).optional().default([]),
    terminal_strips: z.array(TerminalStripSchema).optional().default([]),
    poe_switches: z.array(PoeSwitchMatrixSchema).optional().default([]),
    poe_splitters: z.array(PoeSplitterSpecSchema).optional().default([]),
    network_nodes: z.array(EdgeNetworkNodeSchema).optional().default([]),
    wiring_connections: z.array(WireConnectionSchema).optional().default([]),
    acceptance_checklist: z.array(z.string()).optional().default([]),
  })
  .superRefine((panel, ctx) => {
    validateDinRailWidth(panel, ctx);
    validatePoeBudgets(panel, ctx);
    validateHeatDissipation(panel, ctx);
    validateSwitchDipAndSensors(panel, ctx);
    validateUniqueWireTags(panel, ctx);
  });

/** 1. 校验每根 DIN 导轨物理空间不溢出 */
function validateDinRailWidth(
  panel: z.infer<typeof PanelAssemblySchema> extends never ? any : any,
  ctx: z.RefinementCtx,
): void {
  for (let i = 0; i < panel.din_rails.length; i++) {
    const rail = panel.din_rails[i];
    const usedMm = rail.items.reduce(
      (sum: number, item: { width_mm: number; clearance_mm?: number }) =>
        sum + item.width_mm + (item.clearance_mm ?? 0),
      0,
    );
    if (usedMm > rail.usable_width_mm) {
      ctx.addIssue({
        code: 'custom',
        path: ['din_rails', i, 'items'],
        message: `导轨 ${rail.rail_id} 物理空间溢出: 已占 ${usedMm}mm > 可用 ${rail.usable_width_mm}mm`,
      });
    }
  }
}

/** 2. 校验 PoE 交换机总预算与 PoE 分离器单口负载不超载 */
function validatePoeBudgets(panel: any, ctx: z.RefinementCtx): void {
  for (let i = 0; i < panel.poe_switches.length; i++) {
    const sw = panel.poe_switches[i];
    const totalAllocated = sw.ports.reduce(
      (sum: number, p: { allocated_power_w?: number }) => sum + (p.allocated_power_w ?? 0),
      0,
    );
    if (totalAllocated > sw.poe_budget_w) {
      ctx.addIssue({
        code: 'custom',
        path: ['poe_switches', i, 'ports'],
        message: `交换机 ${sw.component_ref} PoE 功率超载: 已分配 ${totalAllocated}W > 预算 ${sw.poe_budget_w}W`,
      });
    }
  }

  for (let i = 0; i < panel.poe_splitters.length; i++) {
    const sp = panel.poe_splitters[i];
    if (sp.downlink_load_w > sp.max_output_w) {
      ctx.addIssue({
        code: 'custom',
        path: ['poe_splitters', i, 'downlink_load_w'],
        message: `PoE 分离器 ${sp.component_ref} 下行负载超载: ${sp.downlink_load_w}W > 上限 ${sp.max_output_w}W`,
      });
    }
  }
}

/** 3. 校验箱内总热耗散 (IEC 61439 温升限制) */
function validateHeatDissipation(panel: any, ctx: z.RefinementCtx): void {
  const maxHeat = panel.enclosure.max_heat_dissipation_w;
  if (!maxHeat) return;

  const railHeat = panel.din_rails.flatMap((r: any) => r.items).reduce(
    (sum: number, item: { heat_dissipation_w?: number }) => sum + (item.heat_dissipation_w ?? 0),
    0,
  );
  const nonRailHeat = panel.non_rail_zones.flatMap((z: any) => z.items).reduce(
    (sum: number, item: { heat_dissipation_w?: number }) => sum + (item.heat_dissipation_w ?? 0),
    0,
  );
  const totalHeat = railHeat + nonRailHeat;

  if (totalHeat > maxHeat) {
    ctx.addIssue({
      code: 'custom',
      path: ['enclosure', 'max_heat_dissipation_w'],
      message: `箱内总发热量超限: ${totalHeat}W > 允许上限 ${maxHeat}W`,
    });
  }
}

/** 4. 校验交换机混接隔离红线 & 24V 传感器熔断保护引用 */
function validateSwitchDipAndSensors(panel: any, ctx: z.RefinementCtx): void {
  for (let i = 0; i < panel.poe_switches.length; i++) {
    const sw = panel.poe_switches[i];
    const hasEdgeOrLan = sw.ports.some(
      (p: { role: string }) => p.role === 'poe_edge_box' || p.role === 'lan_device',
    );
    if (hasEdgeOrLan && sw.dip_switch_mode === 'vlan_isolated') {
      ctx.addIssue({
        code: 'custom',
        path: ['poe_switches', i, 'dip_switch_mode'],
        message: `交换机 ${sw.component_ref} 接入了边缘控制箱或 PLC，严禁使用 vlan_isolated 模式（必须置为 default_open）`,
      });
    }
  }

  for (let i = 0; i < panel.network_nodes.length; i++) {
    const node = panel.network_nodes[i];
    for (let j = 0; j < (node.modbus_slaves?.length ?? 0); j++) {
      const slave = node.modbus_slaves[j];
      if (!slave.fuse_terminal_ref) {
        ctx.addIssue({
          code: 'custom',
          path: ['network_nodes', i, 'modbus_slaves', j, 'fuse_terminal_ref'],
          message: `传感器 ${slave.sensor_name} (Slave ID ${slave.slave_id}) 未绑定独立 24V 熔断保护端子`,
        });
      }
    }
  }
}

/** 5. 校验同一电箱内线号唯一性 */
function validateUniqueWireTags(panel: any, ctx: z.RefinementCtx): void {
  const seen = new Set<string>();
  for (let i = 0; i < panel.wiring_connections.length; i++) {
    const tag = panel.wiring_connections[i].cable_tag;
    if (seen.has(tag)) {
      ctx.addIssue({
        code: 'custom',
        path: ['wiring_connections', i, 'cable_tag'],
        message: `线号重复: ${tag}`,
      });
    }
    seen.add(tag);
  }
}

export type CabinetEnclosure = z.infer<typeof CabinetEnclosureSchema>;
export type MountedComponent = z.infer<typeof MountedComponentSchema>;
export type DinRailZone = z.infer<typeof DinRailZoneSchema>;
export type NonRailZone = z.infer<typeof NonRailZoneSchema>;
export type TerminalStrip = z.infer<typeof TerminalStripSchema>;
export type PanelAssembly = z.infer<typeof PanelAssemblySchema>;
