/**
 * =========================================================================
 * @aquaponics/schema/spatial · 光明基地 (B3 + B2) Three.js 三维空间数据契约
 * 坐标系约定（Three.js 标准右手坐标系，单位：米 m）：
 *   - 原点 (0, 0, 0)：总场地西南角地面（B2 大棚外角基准点）
 *   - +X 轴：向东（沿 SketchUp 红轴，从 B2 指向 B3）
 *   - +Y 轴：竖直向上（地面 y = 0）
 *   - +Z 轴：向南（垂直于红轴；向北为 -Z）
 * =========================================================================
 */
import { z } from 'zod';

const ISO_UTC_MS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export const MeasurementStatusEnum = z.enum([
  'confirmed',           // 现场实测或 CAD/SketchUp 明确确认
  'estimated',           // 现场目测估算，待精确复核
  'pending_measurement', // 尚未测量，待补全
]);

export const DimensionValueSchema = z.object({
  value_m: z.number().nonnegative().nullable(),
  status: MeasurementStatusEnum,
  note: z.string().optional(),
});

export const Pose3DSchema = z.object({
  x_m: z.number().nullable(),
  y_m: z.number().default(0),
  z_m: z.number().nullable(),
  yaw_deg: z.number().default(0),
  status: MeasurementStatusEnum,
  note: z.string().optional(),
});

export const WallSideEnum = z.enum(['north', 'south', 'east', 'west']);

export const WallOpeningSchema = z.object({
  opening_id: z.string(),
  kind: z.enum(['door', 'wet_pad', 'exhaust_fan_bank', 'air_shower']),
  name: z.string(),
  wall: WallSideEnum,
  offset_along_wall_m: DimensionValueSchema,
  width_m: DimensionValueSchema,
  height_m: DimensionValueSchema,
  sill_height_m: DimensionValueSchema.optional(),
});

export const ColumnGridSchema = z.object({
  bay_spacing_x_m: DimensionValueSchema,  // 沿 X 轴柱距（开间）
  span_spacing_z_m: DimensionValueSchema, // 沿 Z 轴跨度（跨距）
  column_section_m: z.tuple([z.number().positive(), z.number().positive()]).optional(),
  note: z.string().optional(),
});

export const BuildingEnvelopeSchema = z.object({
  building_id: z.enum(['B2', 'B3']),
  name: z.string(),
  role: z.string(),
  origin_m: z.object({
    x_m: z.number(),
    y_m: z.number().default(0),
    z_m: z.number(),
  }),
  length_x_m: DimensionValueSchema,
  width_z_m: DimensionValueSchema,
  eave_height_m: DimensionValueSchema,   // 横梁/檐口高度
  ridge_height_m: DimensionValueSchema,  // 屋脊最高点
  column_grid: ColumnGridSchema,
  openings: z.array(WallOpeningSchema).default([]),
});

const BaseSpatialObject = {
  object_id: z.string(),
  building_id: z.enum(['B2', 'B3']),
  name: z.string(),
  pose: Pose3DSchema,
  note: z.string().optional(),
};

export const SpatialObjectSchema = z.discriminatedUnion('kind', [
  z.object({
    ...BaseSpatialObject,
    kind: z.literal('walkway'),
    length_m: DimensionValueSchema,
    width_m: DimensionValueSchema,
    curb_trough_width_each_side_m: DimensionValueSchema.optional(),
    surface: z.string().default('brick'),
  }),
  z.object({
    ...BaseSpatialObject,
    kind: z.literal('hydro_raceway'),
    unit_id: z.string().optional(),
    count: z.number().int().positive(),
    length_m: DimensionValueSchema,
    width_m: DimensionValueSchema,
    height_m: DimensionValueSchema,
    aisle_gap_m: DimensionValueSchema.optional(),
  }),
  z.object({
    ...BaseSpatialObject,
    kind: z.literal('fish_tank_round'),
    unit_id: z.string().optional(),
    count: z.number().int().positive(),
    diameter_m: DimensionValueSchema,
    height_m: DimensionValueSchema,
  }),
  z.object({
    ...BaseSpatialObject,
    kind: z.literal('cold_room'),
    length_m: DimensionValueSchema,
    width_m: DimensionValueSchema,
    height_m: DimensionValueSchema,
  }),
  z.object({
    ...BaseSpatialObject,
    kind: z.literal('water_treatment'),
    length_m: DimensionValueSchema,
    width_m: DimensionValueSchema,
    height_m: DimensionValueSchema,
  }),
  z.object({
    ...BaseSpatialObject,
    kind: z.literal('cabinet'),
    panel_id: z.string().optional(),
    width_m: DimensionValueSchema,
    depth_m: DimensionValueSchema,
    height_m: DimensionValueSchema,
  }),
  z.object({
    ...BaseSpatialObject,
    kind: z.literal('camera_mount'),
    cam_id: z.string(),
    pitch_deg: z.number().default(-15),
  }),
]);

export const SiteSpatialModelSchema = z.object({
  schema_version: z.string(),
  site_id: z.string(),
  site_name: z.string(),
  calibrated_at_utc: z.string().regex(ISO_UTC_MS_RE),
  coordinate_system: z.object({
    handedness: z.literal('right_handed_y_up'),
    unit: z.literal('meter'),
    origin_description: z.string(),
    axes_mapping: z.object({
      plus_x: z.string(),
      plus_y: z.string(),
      plus_z: z.string(),
    }),
  }),
  buildings: z.array(BuildingEnvelopeSchema),
  objects: z.array(SpatialObjectSchema),
});

export type SiteSpatialModel = z.infer<typeof SiteSpatialModelSchema>;

/** 导出标准 JSON Schema (供 Three.js 前端与外部建模脚本校验使用) */
export function exportSpatialJsonSchema(): Record<string, unknown> {
  return z.toJSONSchema(SiteSpatialModelSchema) as Record<string, unknown>;
}
