/**
 * =========================================================================
 * ElecPal (电气伴侣) · 强电动力核心图元库 (Power Symbol Library)
 * 包含：变压器、塑壳断路器、微型断路器、交流接触器、变频器、电机、CT、SPD
 * 严格定义每个组件的物理端子连接点 (Pins) 与方向
 * =========================================================================
 */
import { ElectricalSymbolDef } from './symbol-types';

export const POWER_SYMBOLS: Record<string, ElectricalSymbolDef> = {
  // 1. 三相塑壳断路器 (MCCB 3P)
  'MCCB_3P': {
    symbol_id: 'MCCB_3P',
    name: '三相塑壳断路器 (MCCB)',
    standard: 'GB_4728',
    width: 24,
    height: 52,
    pins: [
      { id: '1/L1', name: '相线L1进线', type: 'AC_380V', dx: 0, dy: -26, direction: 'UP' },
      { id: '2/T1', name: '相线L1出线', type: 'AC_380V', dx: 0, dy: 26, direction: 'DOWN' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <rect x="-12" y="-18" width="24" height="36" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="${color}" stroke-width="2" />
        <line x1="-12" y1="-18" x2="12" y2="18" stroke="${color}" stroke-width="2" />
        <line x1="-12" y1="18" x2="12" y2="-18" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="-26" x2="0" y2="-18" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="18" x2="0" y2="26" stroke="${color}" stroke-width="2" />
      </g>
    `
  },

  // 2. 三相微型断路器 (MCB D-Curve 3P)
  'MCB_D_3P': {
    symbol_id: 'MCB_D_3P',
    name: '三相微型断路器 (D型动力微断)',
    standard: 'GB_4728',
    width: 24,
    height: 44,
    pins: [
      { id: '1', name: '上端进线', type: 'AC_380V', dx: 0, dy: -22, direction: 'UP' },
      { id: '2', name: '下端出线', type: 'AC_380V', dx: 0, dy: 22, direction: 'DOWN' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <line x1="0" y1="-22" x2="0" y2="-10" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="-10" x2="-8" y2="8" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="10" x2="0" y2="22" stroke="${color}" stroke-width="2" />
        <rect x="-14" y="-6" width="6" height="12" fill="none" stroke="${color}" stroke-width="1.5" />
      </g>
    `
  },

  // 3. 交流接触器 (Contactor 3P)
  'CONTACTOR_3P': {
    symbol_id: 'CONTACTOR_3P',
    name: '三相交流接触器 (KM)',
    standard: 'IEC_60617',
    width: 40,
    height: 48,
    pins: [
      { id: '1/L1', name: '主触头进线', type: 'AC_380V', dx: 0, dy: -24, direction: 'UP' },
      { id: '2/T1', name: '主触头出线', type: 'AC_380V', dx: 0, dy: 24, direction: 'DOWN' },
      { id: 'A1',   name: '控制线圈正极', type: 'AC_220V', dx: -20, dy: 0, direction: 'LEFT' },
      { id: 'A2',   name: '控制线圈负极', type: 'AC_220V', dx: 20, dy: 0, direction: 'RIGHT' },
      { id: '13',   name: '辅助常开触点13', type: 'DRY_CONTACT', dx: -15, dy: 10, direction: 'LEFT' },
      { id: '14',   name: '辅助常开触点14', type: 'DRY_CONTACT', dx: -15, dy: 20, direction: 'LEFT' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <line x1="0" y1="-24" x2="0" y2="-10" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="-10" x2="-8" y2="8" stroke="${color}" stroke-width="2" />
        <path d="M-8,8 A4,4 0 0,0 -4,12" fill="none" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="12" x2="0" y2="24" stroke="${color}" stroke-width="2" />
        <!-- 线圈方框 -->
        <rect x="-18" y="-8" width="36" height="16" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="${color}" stroke-width="1.5" stroke-dasharray="2,2" />
      </g>
    `
  },

  // 4. 变频驱动器 (VFD)
  'VFD_DRIVE': {
    symbol_id: 'VFD_DRIVE',
    name: '交流变频驱动器 (VFD)',
    standard: 'GB_4728',
    width: 48,
    height: 56,
    pins: [
      { id: 'R/S/T', name: '三相动力电源输入', type: 'AC_380V', dx: 0, dy: -28, direction: 'UP' },
      { id: 'U/V/W', name: '变频输出至电机', type: 'AC_380V', dx: 0, dy: 28, direction: 'DOWN' },
      { id: 'DI1',   name: 'PLC无源启停干触点', type: 'DRY_CONTACT', dx: -24, dy: -6, direction: 'LEFT' },
      { id: 'TA/TC', name: '常闭故障报警继电器', type: 'DRY_CONTACT', dx: 24, dy: 6, direction: 'RIGHT' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <rect x="-24" y="-20" width="48" height="40" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="${color}" stroke-width="2" rx="4" />
        <line x1="-24" y1="-20" x2="24" y2="20" stroke="${color}" stroke-width="1.2" />
        <text x="-16" y="-4" fill="${color}" font-size="10" font-family="monospace">~</text>
        <text x="6" y="14" fill="${color}" font-size="10" font-family="monospace">=</text>
        <text x="-8" y="5" fill="${color}" font-size="8" font-family="monospace">VFD</text>
        <line x1="0" y1="-28" x2="0" y2="-20" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="20" x2="0" y2="28" stroke="${color}" stroke-width="2" />
      </g>
    `
  },

  // 5. 三相交流电动机 (Motor 3P)
  'MOTOR_3P': {
    symbol_id: 'MOTOR_3P',
    name: '三相交流电动机 (M 3~)',
    standard: 'GB_4728',
    width: 36,
    height: 44,
    pins: [
      { id: 'U1/V1/W1', name: '三相动力电源端子', type: 'AC_380V', dx: 0, dy: -22, direction: 'UP' },
      { id: 'PE',       name: '电机外壳接地保护', type: 'PE_GROUND', dx: 18, dy: 0, direction: 'RIGHT' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <circle cx="0" cy="0" r="18" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="${color}" stroke-width="2" />
        <text x="-7" y="5" fill="${color}" font-size="13" font-weight="bold" font-family="sans-serif">M</text>
        <text x="3" y="10" fill="${color}" font-size="9" font-family="monospace">3~</text>
        <line x1="0" y1="-22" x2="0" y2="-18" stroke="${color}" stroke-width="2" />
      </g>
    `
  },

  // 6. 电涌保护器 (SPD T1)
  'SPD_T1': {
    symbol_id: 'SPD_T1',
    name: '电涌保护器 (防雷器 SPD)',
    standard: 'GB_4728',
    width: 24,
    height: 46,
    pins: [
      { id: 'LINE', name: '相线电涌接入端', type: 'AC_380V', dx: 0, dy: -18, direction: 'UP' },
      { id: 'PE',   name: '接地泄放端', type: 'PE_GROUND', dx: 0, dy: 28, direction: 'DOWN' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <rect x="-12" y="-12" width="24" height="24" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="${color}" stroke-width="1.8" />
        <path d="M-8,6 L0,-6 L8,-6 L0,6 Z" fill="${color}" />
        <line x1="0" y1="-18" x2="0" y2="-12" stroke="${color}" stroke-width="2" />
        <line x1="0" y1="12" x2="0" y2="20" stroke="${color}" stroke-width="2" />
        <line x1="-10" y1="20" x2="10" y2="20" stroke="${color}" stroke-width="2" />
        <line x1="-6" y1="24" x2="6" y2="24" stroke="${color}" stroke-width="2" />
        <line x1="-2" y1="28" x2="2" y2="28" stroke="${color}" stroke-width="2" />
      </g>
    `
  }
};
