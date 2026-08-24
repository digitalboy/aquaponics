import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, Cpu } from 'lucide-react';
import { PlantWideTopology } from '@aquaponics/schema';

interface StatusBarProps {
  topology: PlantWideTopology | null;
  zoom: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ topology, zoom }) => {
  return (
    <footer className="h-7 border-t border-border bg-slate-950 px-3 flex items-center justify-between text-xs font-cad text-slate-300 select-none shrink-0 z-30 whitespace-nowrap">
      {/* 左侧：国家设计与国际电气规范标准 */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400" />
          设计规范: <span className="text-amber-400 font-bold">GB/T 18135 • IEC 60617</span>
        </span>
        <span className="text-slate-600">|</span>
        <span>
          供电制式: <span className="text-slate-100 font-bold">{topology?.voltage_system || 'TN-S 380V/220V 50Hz'}</span>
        </span>
      </div>

      {/* 中间：D1 边缘云与引擎状态 */}
      <div className="hidden md:flex items-center gap-3 text-slate-400">
        <span className="flex items-center gap-1.5">
          <Database className="size-3.5 text-sky-400" />
          Cloudflare D1 边缘云: <span className="text-emerald-400 font-bold">已连接</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="flex items-center gap-1.5">
          <Cpu className="size-3.5 text-amber-400" />
          矢量渲染引擎: <span className="text-slate-100 font-bold">满帧 60 FPS</span>
        </span>
      </div>

      {/* 右侧：契约版本与视口比例 */}
      <div className="flex items-center gap-2.5">
        <Badge variant="warning" className="px-2 py-0.5 text-xs font-bold">
          Schema {topology?.schema_version || '2.0.0'}
        </Badge>
        <span className="text-slate-300">
          视口: <span className="text-amber-400 font-bold">{Math.round(zoom * 100)}%</span>
        </span>
      </div>
    </footer>
  );
};
