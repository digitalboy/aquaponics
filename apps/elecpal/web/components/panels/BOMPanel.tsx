import React from 'react';
import { Download } from 'lucide-react';
import { PlantWideTopology } from '@aquaponics/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BOMPanelProps {
  topology: PlantWideTopology | null;
  onExportBOM: () => void;
}

export const BOMPanel: React.FC<BOMPanelProps> = ({ topology, onExportBOM }) => {
  return (
    <div className="space-y-4 font-cad text-xs">
      <Button variant="default" size="sm" className="w-full font-bold h-8 text-xs" onClick={onExportBOM}>
        <Download className="size-3.5 mr-1.5" />
        导出标准采购 CSV 清单
      </Button>

      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
          全厂主要电气设备物料清单
        </span>
        <div className="space-y-2.5">
          {/* 一级配电总柜 */}
          <Card className="p-3.5 border-slate-800 bg-slate-950/60">
            <div className="text-xs font-bold text-amber-400 mb-1.5 flex items-center justify-between">
              <span>一级动力总配柜 (AP-MAIN)</span>
              <span className="text-slate-500 font-normal">380V 主干</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
              <div>• 主断路器: <span className="font-bold text-slate-100">{topology?.power_distribution.main_incomer.main_breaker.model}</span> ({topology?.power_distribution.main_incomer.main_breaker.rated_current_a}A)</div>
              <div>• 浪涌保护器: <span className="font-bold text-slate-100">{topology?.power_distribution.main_incomer.spd_surge_protection.nominal_discharge_current_ka}kA (T1级)</span></div>
            </div>
          </Card>

          {/* 二级动力箱组 */}
          {(topology?.power_distribution.sub_panels || []).map((p) => (
            <Card key={p.panel_id} className="p-3.5 border-slate-800 bg-slate-950/60">
              <div className="text-xs font-bold text-sky-400 mb-1.5 flex items-center justify-between">
                <span>{p.name} ({p.panel_id})</span>
                <span className="text-emerald-400 font-normal">{p.ip_rating}</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                <div>• 进线开关: <span className="font-bold text-slate-100">{p.incoming_switch.model}</span> ({p.incoming_switch.rated_current_a}A)</div>
                <div>• 动力支路: <span className="font-bold text-slate-100">{p.circuits.length} 条</span> 动力受电回路</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
