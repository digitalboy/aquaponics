/**
 * =========================================================================
 * ElecPal (电气伴侣) · 标准电气图元库总入口
 * 统一导出所有强电与弱电自控元件的符号定义与连接点
 * =========================================================================
 */
export * from './symbol-types';
export * from './library-power';
export * from './library-control';

import { ElectricalSymbolDef } from './symbol-types';
import { POWER_SYMBOLS } from './library-power';
import { CONTROL_SYMBOLS } from './library-control';

export const ALL_ELECTRICAL_SYMBOLS: Record<string, ElectricalSymbolDef> = {
  ...POWER_SYMBOLS,
  ...CONTROL_SYMBOLS
};

export function getElectricalSymbol(symbolId: string): ElectricalSymbolDef | undefined {
  return ALL_ELECTRICAL_SYMBOLS[symbolId];
}
