/**
 * =========================================================================
 * ElecPal (电气伴侣) · 负荷计算与变压器选型推演引擎
 * 严格遵循《GB 50052 供配电系统设计规范》需要系数法
 * =========================================================================
 */
import { PlantWideTopology } from './schema';

export interface LoadCalculationSummary {
  installed_power_pe_kw: number;
  calculated_active_power_pjs_kw: number;
  calculated_apparent_power_sjs_kva: number;
  calculated_current_ijs_a: number;
  recommended_transformer_kva: number;
  transformer_loading_rate_pct: number;
  power_factor_cos_phi: number;
  demand_factor_kx: number;
  sub_panel_summaries: Array<{
    panel_id: string;
    panel_name: string;
    pe_kw: number;
    pjs_kw: number;
    ijs_a: number;
    circuit_count: number;
  }>;
}

export class ElectricalCalculator {
  /**
   * 采用需要系数法对全厂全要素电气负荷进行汇总与变压器容量测算
   */
  public static calculate(topology: PlantWideTopology): LoadCalculationSummary {
    let totalPe = 0;
    const subSummaries: LoadCalculationSummary['sub_panel_summaries'] = [];

    const subPanels = topology.power_distribution?.sub_panels || [];

    subPanels.forEach(panel => {
      let panelPe = 0;
      panel.circuits.forEach(c => {
        panelPe += c.load.rated_power_kw;
      });

      const panelKx = 0.8;
      const panelCosPhi = 0.85;
      const panelPjs = panelPe * panelKx;
      const panelSjs = panelPjs / panelCosPhi;
      const panelIjs = (panelSjs * 1000) / (Math.sqrt(3) * 380);

      subSummaries.push({
        panel_id: panel.panel_id,
        panel_name: panel.name,
        pe_kw: Math.round(panelPe * 100) / 100,
        pjs_kw: Math.round(panelPjs * 100) / 100,
        ijs_a: Math.round(panelIjs * 10) / 10,
        circuit_count: panel.circuits.length
      });

      totalPe += panelPe;
    });

    const kx = 0.75;      // 全厂同时系数 / 需要系数
    const cosPhi = 0.85;  // 综合自然功率因数
    const pjs = totalPe * kx;
    const sjs = pjs / cosPhi;
    const ijs = (sjs * 1000) / (Math.sqrt(3) * 380);

    // 推荐标准油浸/干式配电变压器容量系列 (按 75%~85% 经济运行负荷率推荐)
    const standardKva = [30, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000];
    const targetLoadRate = 0.80; // 80% 经济负荷率
    const rawTransformerKva = sjs / targetLoadRate;
    const recTransformer = standardKva.find(k => k >= rawTransformerKva) || 100;
    const loadingRate = Math.round((sjs / recTransformer) * 1000) / 10;

    return {
      installed_power_pe_kw: Math.round(totalPe * 100) / 100,
      calculated_active_power_pjs_kw: Math.round(pjs * 100) / 100,
      calculated_apparent_power_sjs_kva: Math.round(sjs * 100) / 100,
      calculated_current_ijs_a: Math.round(ijs * 10) / 10,
      recommended_transformer_kva: recTransformer,
      transformer_loading_rate_pct: loadingRate,
      power_factor_cos_phi: cosPhi,
      demand_factor_kx: kx,
      sub_panel_summaries: subSummaries
    };
  }
}
