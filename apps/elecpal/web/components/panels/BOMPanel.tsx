import React, { useState, useMemo } from 'react';
import { Download, Search, FileSpreadsheet, Layers, CheckCircle2 } from 'lucide-react';
import { PlantWideTopology } from '@aquaponics/schema';
import { BOMExporter, BOMItem } from '@renderers/bom-exporter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface BOMPanelProps {
  topology: PlantWideTopology | null;
  onExportBOM: () => void;
}

type CategoryFilter = 'ALL' | 'POWER' | 'PLC' | 'SENSOR' | 'CABLE' | 'NETWORK';

export const BOMPanel: React.FC<BOMPanelProps> = ({ topology, onExportBOM }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const bomItems = useMemo<BOMItem[]>(() => {
    if (!topology) return [];
    return BOMExporter.generateBOM(topology);
  }, [topology]);

  const filteredItems = useMemo(() => {
    return bomItems.filter((item) => {
      let matchCat = true;
      if (selectedCategory === 'POWER') {
        matchCat = item.category.includes('断路器') || item.category.includes('动力配电') || item.category.includes('变频') || item.category.includes('防雷');
      } else if (selectedCategory === 'PLC') {
        matchCat = item.category.includes('PLC') || item.category.includes('继电器') || item.category.includes('电源') || item.category.includes('UPS');
      } else if (selectedCategory === 'SENSOR') {
        matchCat = item.category.includes('传感器') || item.category.includes('仪表') || item.category.includes('电表');
      } else if (selectedCategory === 'CABLE') {
        matchCat = item.category.includes('线缆') || item.category.includes('电缆') || item.quantity === '根据实际情况';
      } else if (selectedCategory === 'NETWORK') {
        matchCat = item.category.includes('工控机') || item.category.includes('交换机') || item.category.includes('摄像机') || item.category.includes('NVR');
      }

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(q) ||
        item.spec_model.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [bomItems, selectedCategory, searchQuery]);

  const cableCount = bomItems.filter((b) => b.quantity === '根据实际情况').length;
  const hardwareCount = bomItems.length - cableCount;

  return (
    <div className="space-y-3 font-cad text-xs flex flex-col h-full">
      {/* 1. 顶部操作与汇总概览 */}
      <div className="space-y-2 shrink-0">
        <Button variant="default" size="default" className="w-full font-bold h-8 text-xs shadow-md" onClick={onExportBOM}>
          <Download className="size-3.5 mr-1.5" />
          导出标准采购 CSV 清单
        </Button>

        <Card className="p-2.5 border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="size-4 text-amber-400" />
            <span>全厂物料总项数: <strong className="text-amber-400">{bomItems.length} 项</strong></span>
          </div>
          <span className="text-[11px] text-slate-500">
            实体硬件 {hardwareCount} 项 • 线材 {cableCount} 项
          </span>
        </Card>
      </div>

      {/* 2. 类别快速过滤 Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 text-xs font-bold">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`py-1 rounded-md text-xs transition ${
            selectedCategory === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          全部物料 ({bomItems.length})
        </button>

        <button
          onClick={() => setSelectedCategory('POWER')}
          className={`py-1 rounded-md text-xs transition ${
            selectedCategory === 'POWER'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          ⚡ 强电设备
        </button>

        <button
          onClick={() => setSelectedCategory('PLC')}
          className={`py-1 rounded-md text-xs transition ${
            selectedCategory === 'PLC'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          🤖 自控与中继
        </button>

        <button
          onClick={() => setSelectedCategory('SENSOR')}
          className={`py-1 rounded-md text-xs transition ${
            selectedCategory === 'SENSOR'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          📶 传感器仪表
        </button>

        <button
          onClick={() => setSelectedCategory('CABLE')}
          className={`py-1 rounded-md text-xs transition ${
            selectedCategory === 'CABLE'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          🔌 电缆与线材
        </button>

        <button
          onClick={() => setSelectedCategory('NETWORK')}
          className={`py-1 rounded-md text-xs transition ${
            selectedCategory === 'NETWORK'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          🌐 工控安防
        </button>
      </div>

      {/* 3. 搜索栏 */}
      <div className="relative shrink-0">
        <Search className="size-3.5 absolute left-2.5 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="搜索设备名称/型号规格/位置..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* 4. 详细物料卡片列表 (单滚动条) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {filteredItems.map((item) => {
          const isCable = item.quantity === '根据实际情况';

          return (
            <Card
              key={item.index}
              className="p-3 border-slate-800 bg-slate-950/80 hover:border-slate-700 transition space-y-1.5 text-xs select-text"
            >
              {/* 头部：序号 + 分类 + 采购数量 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    #{item.index}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-300 border-slate-700 bg-slate-900/60">
                    {item.category}
                  </Badge>
                </div>

                {/* ⭐️ 数量显示：线材明确为“根据实际情况”，硬件明确具体数量 */}
                {isCable ? (
                  <Badge variant="warning" className="text-xs px-2 py-0.5 font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    根据实际情况 ({item.unit})
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs px-2 py-0.5 font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {item.quantity} {item.unit}
                  </Badge>
                )}
              </div>

              {/* 物料名称 */}
              <div className="font-bold text-slate-100 text-xs leading-snug">
                {item.name}
              </div>

              {/* 规格型号 */}
              <div className="text-slate-300 text-xs font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 break-words leading-relaxed">
                {item.spec_model}
              </div>

              {/* 底部位置与备注 */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>位置: <strong className="text-slate-200">{item.location}</strong></span>
                {item.remarks && <span className="text-amber-400/80">{item.remarks}</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
