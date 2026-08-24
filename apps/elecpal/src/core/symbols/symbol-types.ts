/**
 * =========================================================================
 * ElecPal (电气伴侣) · 标准电气符号与引脚连接点类型契约
 * 严格遵循 GB/T 4728 与 IEC 60617 标准
 * =========================================================================
 */

export type PinType = 
  | 'AC_380V'       // 交流三相高压动力
  | 'AC_220V'       // 交流单相动力/控制
  | 'DC_24V_POS'    // 直流 24V 正极
  | 'DC_24V_GND'    // 直流 0V/COM 负极
  | 'DC_SIGNAL'     // 直流传感器/485 信号
  | 'DRY_CONTACT'   // 无源干触点 (隔离继电器)
  | 'PE_GROUND';    // 保护接地 PE

export type PinDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/**
 * 电气连接点 (Connection Pin / Terminal) 定义
 */
export interface ConnectionPin {
  id: string;             // 物理端子编号: 如 "1/L1", "2/T1", "A1", "A2", "13", "14", "X01"
  name: string;           // 语义说明: 如 "三相L1进线端", "控制线圈正极"
  type: PinType;          // 电气属性 (用于强弱电防窜电与类型校验)
  dx: number;             // 相对于符号几何中心 (0,0) 的 X 偏移量 (像素)
  dy: number;             // 相对于符号几何中心 (0,0) 的 Y 偏移量 (像素)
  direction: PinDirection;// 导线引出方向
}

/**
 * 标准电气符号元模型定义 (Electrical Symbol Definition)
 */
export interface ElectricalSymbolDef {
  symbol_id: string;      // 符号唯一标识: 如 "MCCB_3P", "MCB_D_3P", "CONTACTOR_3P", "RELAY_KA_8P"
  name: string;           // 符号中文名称: 如 "三相塑壳断路器", "三相交流接触器"
  standard: 'GB_4728' | 'IEC_60617';
  width: number;          // 符号包围盒宽度
  height: number;         // 符号包围盒高度
  pins: ConnectionPin[];  // 所有的标准连接点/端子列表
  
  /**
   * 局部无损 SVG 矢量绘制函数 (输出自闭合局部标签)
   * @param color 主线条颜色
   * @param isDarkTheme 是否深色模式
   */
  drawSvg: (color: string, isDarkTheme?: boolean) => string;

  /**
   * AutoCAD 标准 DXF 图元生成函数 (实体输出)
   */
  drawDxf?: (originX: number, originY: number) => string;
}
