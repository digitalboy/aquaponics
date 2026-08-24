import React from 'react';
import { LoadCalculationSummary } from '@core/calculator';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';

interface LoadCalcPanelProps {
  calcReport: LoadCalculationSummary | null;
}

export const LoadCalcPanel: React.FC<LoadCalcPanelProps> = ({ calcReport }) => {
  if (!calcReport) {
    return <div className="text-slate-400 text-xs">正在计算负荷...</div>;
  }

  return (
    <div className="space-y-4 font-cad text-xs">
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="p-3 border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400 font-medium">总安装容量 (Pe)</div>
          <div className="text-base font-extrabold text-amber-400 mt-1">{calcReport.installed_power_pe_kw} kW</div>
        </Card>
        <Card className="p-3 border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400 font-medium">有功计算负荷 (Pjs)</div>
          <div className="text-base font-extrabold text-emerald-400 mt-1">{calcReport.calculated_active_power_pjs_kw} kW</div>
        </Card>
        <Card className="p-3 border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400 font-medium">计算总电流 (Ijs)</div>
          <div className="text-base font-extrabold text-sky-400 mt-1">{calcReport.calculated_current_ijs_a} A</div>
        </Card>
        <Card className="p-3 border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400 font-medium">推荐变压器容量</div>
          <div className="text-base font-extrabold text-purple-400 mt-1">{calcReport.recommended_transformer_kva} kVA</div>
        </Card>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
          二级配电箱负荷分表 (GB 50052)
        </span>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs p-2.5">配电箱</TableHead>
              <TableHead className="text-xs p-2.5">Pe(kW)</TableHead>
              <TableHead className="text-xs p-2.5">Pjs(kW)</TableHead>
              <TableHead className="text-xs p-2.5">Ijs(A)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calcReport.sub_panel_summaries.map((row) => (
              <TableRow key={row.panel_id}>
                <TableCell className="p-2.5 font-bold text-xs">{row.panel_id}</TableCell>
                <TableCell className="p-2.5 text-xs">{row.pe_kw}</TableCell>
                <TableCell className="p-2.5 text-xs text-emerald-400 font-bold">{row.pjs_kw}</TableCell>
                <TableCell className="p-2.5 text-xs text-sky-400 font-bold">{row.ijs_a}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
