/**
 * =========================================================================
 * ElecPal (电气伴侣) · 弱电自控核心图元库 (Control Symbol Library)
 * 包含：中间继电器 KA、PLC 控制模块、开关电源、电磁阀 YV、485 传感器
 * 严格定义弱电隔离连接点 (Pins) 与方向
 * =========================================================================
 */
import { ElectricalSymbolDef } from './symbol-types';

export const CONTROL_SYMBOLS: Record<string, ElectricalSymbolDef> = {
  // 1. 中间继电器线圈与触点 (Relay KA)
  'RELAY_KA_COIL': {
    symbol_id: 'RELAY_KA_COIL',
    name: '中间继电器线圈 (KA)',
    standard: 'GB_4728',
    width: 28,
    height: 20,
    pins: [
      { id: '13/A1', name: '线圈驱动正极 (+24V)', type: 'DC_24V_POS', dx: -14, dy: 0, direction: 'LEFT' },
      { id: '14/A2', name: '线圈驱动负极 (0V/COM)', type: 'DC_24V_GND', dx: 14, dy: 0, direction: 'RIGHT' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <rect x="-14" y="-10" width="28" height="20" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="${color}" stroke-width="2" />
        <line x1="-14" y1="-10" x2="14" y2="10" stroke="${color}" stroke-width="1.2" />
      </g>
    `
  },

  // 2. 继电器无源常开触点 (Relay NO Contact)
  'RELAY_CONTACT_NO': {
    symbol_id: 'RELAY_CONTACT_NO',
    name: '继电器常开触点 (无源干触点)',
    standard: 'GB_4728',
    width: 30,
    height: 16,
    pins: [
      { id: '9', name: '公共端 COM', type: 'DRY_CONTACT', dx: -15, dy: 0, direction: 'LEFT' },
      { id: '5', name: '常开触点 NO', type: 'DRY_CONTACT', dx: 15, dy: 0, direction: 'RIGHT' }
    ],
    drawSvg: (color) => `
      <g>
        <line x1="-15" y1="0" x2="-5" y2="0" stroke="${color}" stroke-width="2" />
        <line x1="-5" y1="0" x2="5" y2="-8" stroke="${color}" stroke-width="2" />
        <line x1="5" y1="0" x2="15" y2="0" stroke="${color}" stroke-width="2" />
      </g>
    `
  },

  // 3. 气动电磁阀 (Solenoid Valve YV)
  'VALVE_SOLENOID': {
    symbol_id: 'VALVE_SOLENOID',
    name: '气动吹扫电磁阀 (YV 24V)',
    standard: 'GB_4728',
    width: 32,
    height: 24,
    pins: [
      { id: '+', name: '24V正极控制端', type: 'DC_24V_POS', dx: -16, dy: 0, direction: 'LEFT' },
      { id: '-', name: '0V公共地端', type: 'DC_24V_GND', dx: 16, dy: 0, direction: 'RIGHT' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <path d="M-12,-8 L12,8 L12,-8 L-12,8 Z" fill="${isDark ? '#0f172a' : '#ffffff'}" stroke="${color}" stroke-width="1.8" />
        <line x1="0" y1="-8" x2="0" y2="-14" stroke="${color}" stroke-width="1.5" />
        <rect x="-6" y="-18" width="12" height="6" fill="${color}" />
      </g>
    `
  },

  // 4. RS-485 智能传感器变送器 (Sensor Transmitter)
  'SENSOR_485_NODE': {
    symbol_id: 'SENSOR_485_NODE',
    name: 'RS-485 智能从站变送器 (M12)',
    standard: 'GB_4728',
    width: 60,
    height: 40,
    pins: [
      { id: '1/V+', name: 'DC 24V 供电正极', type: 'DC_24V_POS', dx: -30, dy: -10, direction: 'LEFT' },
      { id: '3/V-', name: 'DC 0V 供电负极', type: 'DC_24V_GND', dx: -30, dy: 10, direction: 'LEFT' },
      { id: '2/A',  name: 'RS-485 A (Data+)', type: 'DC_SIGNAL', dx: 30, dy: -10, direction: 'RIGHT' },
      { id: '4/B',  name: 'RS-485 B (Data-)', type: 'DC_SIGNAL', dx: 30, dy: 10, direction: 'RIGHT' }
    ],
    drawSvg: (color, isDark = true) => `
      <g>
        <rect x="-30" y="-20" width="60" height="40" fill="${isDark ? '#1e293b' : '#f1f5f9'}" stroke="${color}" stroke-width="2" rx="6" />
        <text x="-18" y="4" fill="${color}" font-size="10" font-weight="bold" font-family="monospace">RS-485</text>
      </g>
    `
  }
};
