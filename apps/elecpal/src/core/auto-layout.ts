/**
 * =========================================================================
 * ElecPal (电气伴侣) · 100% 正交几何自动排版引擎
 * 严谨计算主母线、分箱、断路器、电缆与电机的 X/Y 正交网格坐标
 * =========================================================================
 */
import { PlantWideTopology, SubPanel, ElectricalCircuit } from './schema';

export interface LayoutNode {
  id: string;
  type: 'transformer' | 'mccb' | 'busbar' | 'panel' | 'circuit' | 'motor';
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  subText?: string;
}

export class AutoLayoutEngine {
  public static computePowerSLDLayout(topology: PlantWideTopology): { nodes: LayoutNode[]; busY: number } {
    const nodes: LayoutNode[] = [];
    const busY = 485;

    // 1. 变压器与一级总柜
    nodes.push({ id: 'trans-01', type: 'transformer', x: 210, y: 150, label: '100kVA 变压器' });
    nodes.push({ id: 'mccb-main', type: 'mccb', x: 210, y: 270, label: '正泰 NXM-250S 160A' });

    // 2. 二级动力分箱与回路网格
    let currentX = 120;
    const subPanels: SubPanel[] = topology.power_distribution?.sub_panels || [];

    subPanels.forEach((panel: SubPanel) => {
      const circuitCount = panel.circuits.length;
      const panelWidth = Math.max(circuitCount * 125 + 60, 360);
      
      nodes.push({
        id: panel.panel_id,
        type: 'panel',
        x: currentX,
        y: busY + 60,
        width: panelWidth,
        height: 820,
        label: `${panel.panel_id} ${panel.name}`
      });

      panel.circuits.forEach((c: ElectricalCircuit, idx: number) => {
        const cX = currentX + 60 + idx * 125;
        nodes.push({
          id: c.circuit_id,
          type: 'circuit',
          x: cX,
          y: busY + 200,
          label: `${c.breaker.model} ${c.breaker.rated_current_a}A`
        });
        nodes.push({
          id: `motor-${c.circuit_id}`,
          type: 'motor',
          x: cX,
          y: busY + 580,
          label: c.name,
          subText: `${c.load.rated_power_kw}kW (${c.load.rated_current_a}A)`
        });
      });

      currentX += panelWidth + 50;
    });

    return { nodes, busY };
  }
}
