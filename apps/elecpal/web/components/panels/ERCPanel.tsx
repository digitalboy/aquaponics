import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { ERCValidationResult } from '@core/erc-validator';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ERCPanelProps {
  ercResult: ERCValidationResult | null;
}

export const ERCPanel: React.FC<ERCPanelProps> = ({ ercResult }) => {
  return (
    <div className="space-y-3.5 font-cad text-xs">
      {ercResult?.passed ? (
        <Alert variant="success" className="p-3.5">
          <CheckCircle2 className="size-4.5" />
          <AlertTitle className="text-sm font-bold">100% 规则校验通过</AlertTitle>
          <AlertDescription className="text-xs mt-1 leading-relaxed text-slate-200">
            全部动力支路断路器级差选择性、电机 D 型脱扣曲线、电缆安全载流量与压降校验均符合 GB 50054。
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="p-3.5">
          <XCircle className="size-4.5" />
          <AlertTitle className="text-sm font-bold">存在物理安全隐患 (出图已阻断)</AlertTitle>
          <AlertDescription className="text-xs mt-1 leading-relaxed text-red-200">
            检测到 <span className="font-bold underline">{ercResult?.error_count}</span> 项严重物理隐患与 <span className="font-bold underline">{ercResult?.warning_count}</span> 项工业告警。
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
          物理规则检测清单 ({ercResult?.issues.length || 0})
        </span>
        {(ercResult?.issues || []).map((issue, idx) => (
          <Card key={idx} className="border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={issue.severity === 'error' ? 'danger' : 'warning'} className="text-xs px-2 py-0.5 font-bold">
                {issue.rule_id}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">{issue.location}</span>
            </div>
            <div className="text-xs text-slate-200 font-bold leading-relaxed">{issue.message}</div>
            {issue.recommendation && (
              <div className="text-xs text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30 leading-relaxed">
                💡 整改建议: {issue.recommendation}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
