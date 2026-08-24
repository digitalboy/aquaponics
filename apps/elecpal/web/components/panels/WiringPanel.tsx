import React, { useState, useEffect, useMemo } from 'react';
import { Download, Tag, Search, AlertTriangle, ShieldCheck, Zap, Cpu, Radio } from 'lucide-react';
import { PlantWideTopology } from '@aquaponics/schema';
import {
  generateCategorizedWiringSchedule,
  exportCategorizedWiringCSV,
  exportCategorizedFerruleText,
  WireScheduleItem,
  WireCategory,
} from '@renderers/wiring-exporter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface WiringPanelProps {
  topology: PlantWideTopology | null;
  activeSheet: number;
}

type TabType = 'power' | 'plc' | 'rs485' | 'all';

export const WiringPanel: React.FC<WiringPanelProps> = ({ topology, activeSheet }) => {
  // 视口与接线表智能联动：根据当前顶栏激活的图卷自动同步
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (activeSheet === 1) return 'power';
    if (activeSheet === 2) return 'plc';
    return 'rs485';
  });

  useEffect(() => {
    if (activeSheet === 1) setActiveTab('power');
    else if (activeSheet === 2) setActiveTab('plc');
    else if (activeSheet === 3) setActiveTab('rs485');
  }, [activeSheet]);

  const [completedWires, setCompletedWires] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scheduleData = useMemo(() => {
    if (!topology) {
      return { all: [], power: [], plc: [], rs485: [] };
    }
    return generateCategorizedWiringSchedule(topology);
  }, [topology]);

  const currentList: WireScheduleItem[] = scheduleData[activeTab];

  const filteredWires = useMemo(() => {
    if (!searchQuery) return currentList;
    const q = searchQuery.toLowerCase();
    return currentList.filter(
      (w) =>
        w.wireId.toLowerCase().includes(q) ||
        w.loadName.toLowerCase().includes(q) ||
        w.circuitId.toLowerCase().includes(q) ||
        w.colorName.toLowerCase().includes(q)
    );
  }, [currentList, searchQuery]);

  const totalCurrent = currentList.length;
  const doneCurrent = currentList.filter((w) => completedWires.has(w.wireId)).length;
  const progressPct = totalCurrent > 0 ? Math.round((doneCurrent / totalCurrent) * 100) : 0;

  const toggleWire = (wireId: string) => {
    setCompletedWires((prev) => {
      const next = new Set(prev);
      if (next.has(wireId)) next.delete(wireId);
      else next.add(wireId);
      return next;
    });
  };

  const handleExportCSV = () => {
    if (!topology) return;
    const csv = exportCategorizedWiringCSV(topology, activeTab);
    const tabName =
      activeTab === 'power' ? 'ELEC01_强电动力' : activeTab === 'plc' ? 'ELEC02_PLC自控' : activeTab === 'rs485' ? 'ELEC03_485总线' : '全厂汇总';
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `接线清单_${tabName}_${topology.workshop_code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFerrules = () => {
    if (!topology) return;
    const txt = exportCategorizedFerruleText(topology, activeTab);
    const tabName =
      activeTab === 'power' ? '动力线号' : activeTab === 'plc' ? 'PLC线号' : activeTab === 'rs485' ? '485线号' : '全量线号';
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `线号打管机序列_${tabName}_${topology.workshop_code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 font-cad text-xs flex flex-col h-full">
      {/* 1. 三大专业分类防呆 Tabs (与顶栏 3 张图严格对应) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab('power')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'power'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="ELEC-01 380V/220V 强电动力接线表 (XT1 端子排)"
        >
          <Zap className="size-3.5 shrink-0" />
          <span>动力表</span>
        </button>

        <button
          onClick={() => setActiveTab('plc')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'plc'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="ELEC-02 24VDC PLC 自控接线表 (XT2 端子排)"
        >
          <Cpu className="size-3.5 shrink-0" />
          <span>PLC 表</span>
        </button>

        <button
          onClick={() => setActiveTab('rs485')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'rs485'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="ELEC-03 RS-485 现场总线差分接线表 (XT3 绿色端子排)"
        >
          <Radio className="size-3.5 shrink-0" />
          <span>485 表</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="全厂强弱电与总线汇总总表"
        >
          <span>全汇总</span>
        </button>
      </div>

      {/* 2. 施工防呆安全通告条 (随分类自动切换专业防呆指南) */}
      <div className="shrink-0">
        {activeTab === 'power' && (
          <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl flex items-start gap-2 text-amber-200 text-xs leading-relaxed">
            <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">⚡ 380V 强电施工防呆：</span>
              严格按 <span className="underline font-bold">L1(黄)/L2(绿)/L3(红)</span> 相序压接防止水泵反转倒吸；严禁与 24VDC 弱电共用线槽；PE 保护地线必须牢固压紧（力矩 2.0N·m）。
            </div>
          </div>
        )}

        {activeTab === 'plc' && (
          <div className="bg-sky-950/40 border border-sky-500/40 p-2.5 rounded-xl flex items-start gap-2 text-sky-200 text-xs leading-relaxed">
            <ShieldCheck className="size-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sky-300">🤖 24VDC PLC 自控防呆：</span>
              全部 DI/DO 信号线仅限使用 24V 弱电回路；<span className="underline font-bold">严禁 220V 强电误入 I0.0~I0.7</span>（混接将瞬间击穿 PLC 主板）；走柜内专用绝缘线槽。
            </div>
          </div>
        )}

        {activeTab === 'rs485' && (
          <div className="bg-indigo-950/40 border border-indigo-500/40 p-2.5 rounded-xl flex items-start gap-2 text-indigo-200 text-xs leading-relaxed">
            <Radio className="size-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300">📶 RS-485 差分总线防呆：</span>
              手拉手菊花链拓扑；<span className="underline font-bold">A+(白) 与 B-(蓝) 极性严禁反接</span>；必须单端接地；物理最末端必须激活 120Ω 终端吸收电阻；硬件拨码地址必须与表格严格对齐。
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <span>全厂总导线数: <strong className="text-amber-400">{allCount(scheduleData)} 根</strong> (强电 {scheduleData.power.length} / 自控 {scheduleData.plc.length} / 485 {scheduleData.rs485.length})</span>
          </div>
        )}
      </div>

      {/* 3. 施工进度与快捷导出 */}
      <div className="space-y-2 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="default" size="default" className="font-bold h-8 text-xs shadow-md" onClick={handleExportCSV}>
            <Download className="size-3.5 mr-1.5" />
            导出当前表 (CSV)
          </Button>
          <Button variant="secondary" size="default" className="font-bold h-8 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" onClick={handleExportFerrules}>
            <Tag className="size-3.5 mr-1.5 text-amber-400" />
            导出打管机 (TXT)
          </Button>
        </div>

        {/* 接线进度指示条 */}
        <Card className="p-2.5 border-slate-800 bg-slate-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">本表接线进度:</span>
            <span className="text-amber-400">
              {doneCurrent} / {totalCurrent} 根 ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </Card>
      </div>

      {/* 4. 搜索框 */}
      <div className="relative shrink-0">
        <Search className="size-3.5 absolute left-2.5 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="搜索线号/设备/相别/引脚..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* 5. 详细点对点 From-To 接线列表 (单滚动条) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {filteredWires.map((wire) => {
          const isDone = completedWires.has(wire.wireId);

          return (
            <Card
              key={wire.wireId}
              onClick={() => toggleWire(wire.wireId)}
              className={`p-3 border transition cursor-pointer select-none ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400'
                  : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50 text-slate-200'
              }`}
            >
              {/* 头部：防呆线号管印字 + 颜色球 + 导线规格 */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleWire(wire.wireId)}
                    className="size-3.5 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <Badge
                    variant="warning"
                    className={`px-2 py-0.5 font-mono text-xs font-bold border ${
                      wire.category === 'power'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : wire.category === 'plc'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    }`}
                  >
                    {wire.wireId}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="size-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: wire.colorHex }} />
                    <span className="font-bold text-slate-200">{wire.colorName}</span>
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">{wire.spec}</span>
              </div>

              {/* 设备名称与回路 */}
              <div className="text-xs font-bold text-slate-100 mb-2 pl-5.5 flex items-center justify-between">
                <span>{wire.loadName}</span>
                {wire.extraMeta?.slaveAddress && (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                    从站地址: {wire.extraMeta.slaveAddress}
                  </Badge>
                )}
              </div>

              {/* From ➔ To 物理接线起点与终点 */}
              <div className="pl-5.5 space-y-1.5 text-xs bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 shrink-0">起点 (From):</span>
                  <span className="font-bold text-slate-100 text-right">{wire.fromComponent} ➔ <span className="text-amber-300">{wire.fromTerminal}</span></span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 shrink-0">终点 (To):</span>
                  <span className="font-bold text-amber-400 text-right">{wire.toComponent} ➔ <span className="text-emerald-300">{wire.toTerminal}</span></span>
                </div>
                
                <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1.5 border-t border-slate-800">
                  <span>剥线: <strong className="text-slate-200">{wire.stripLengthMm}mm</strong> • 力矩: <strong className="text-slate-200">{wire.torqueNm}N·m</strong></span>
                  <span className="text-slate-300">{wire.toolType}</span>
                </div>

                {wire.safetyRemark && (
                  <div className="text-[10.5px] text-amber-400/90 pt-1 border-t border-slate-800/60 leading-tight">
                    ⚠️ {wire.safetyRemark}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

function allCount(data: { all: WireScheduleItem[] }) {
  return data.all.length;
}
