import React from 'react';
import {
  ShieldCheck,
  Calculator,
  FileSpreadsheet,
  Folder,
  FileCode,
} from 'lucide-react';
import { ERCValidationResult } from '@core/erc-validator';
import { LoadCalculationSummary } from '@core/calculator';
import { PlantWideTopology } from '@aquaponics/schema';
import { TopologyVersionSnapshot } from '@services/project-service';
import { ERCPanel } from '../panels/ERCPanel';
import { LoadCalcPanel } from '../panels/LoadCalcPanel';
import { BOMPanel } from '../panels/BOMPanel';
import { ProjectsPanel } from '../panels/ProjectsPanel';
import { JsonEditorPanel } from '../panels/JsonEditorPanel';

export type SidebarTab = 'erc' | 'calc' | 'bom' | 'projects' | 'json' | null;

interface ToolSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  ercResult: ERCValidationResult | null;
  calcReport: LoadCalculationSummary | null;
  topology: PlantWideTopology | null;
  snapshots: TopologyVersionSnapshot[];
  jsonText: string;
  onJsonChange: (val: string) => void;
  onApplyJson: () => void;
  onCommitSnapshot: () => void;
  onExportBOM: () => void;
}

export const ToolSidebar: React.FC<ToolSidebarProps> = ({
  activeTab,
  onTabChange,
  ercResult,
  calcReport,
  topology,
  snapshots,
  jsonText,
  onJsonChange,
  onApplyJson,
  onCommitSnapshot,
  onExportBOM,
}) => {
  return (
    <>
      {/* 1. 极简垂直图标导航轨 (Icon Rail) */}
      <aside className="w-12 border-r border-border bg-slate-950 flex flex-col items-center py-3 justify-between shrink-0 z-20 select-none shadow-md">
        <div className="flex flex-col items-center gap-2.5">
          {/* 🛡️ ERC 物理体检 */}
          <button
            onClick={() => onTabChange(activeTab === 'erc' ? null : 'erc')}
            className={`size-9 rounded-xl flex items-center justify-center transition relative ${
              activeTab === 'erc'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="ERC 物理规则体检 (GB 50054 / IEC 60364)"
          >
            <ShieldCheck className="size-5" />
            {ercResult && (
              <span
                className={`absolute top-1 right-1 size-2 rounded-full ${
                  ercResult.passed ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
                }`}
              />
            )}
          </button>

          {/* 🧮 负荷计算 */}
          <button
            onClick={() => onTabChange(activeTab === 'calc' ? null : 'calc')}
            className={`size-9 rounded-xl flex items-center justify-center transition ${
              activeTab === 'calc'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="电力负荷计算与变压器选型 (GB 50052)"
          >
            <Calculator className="size-5" />
          </button>

          {/* 📊 采购 BOM */}
          <button
            onClick={() => onTabChange(activeTab === 'bom' ? null : 'bom')}
            className={`size-9 rounded-xl flex items-center justify-center transition ${
              activeTab === 'bom'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="全要素设备采购 BOM 清单"
          >
            <FileSpreadsheet className="size-5" />
          </button>

          {/* 📁 多工程与快照 */}
          <button
            onClick={() => onTabChange(activeTab === 'projects' ? null : 'projects')}
            className={`size-9 rounded-xl flex items-center justify-center transition ${
              activeTab === 'projects'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="工程管理与版本快照时间线 (Cloudflare D1)"
          >
            <Folder className="size-5" />
          </button>

          {/* 📝 JSON 热编辑 */}
          <button
            onClick={() => onTabChange(activeTab === 'json' ? null : 'json')}
            className={`size-9 rounded-xl flex items-center justify-center transition ${
              activeTab === 'json'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="全要素 JSON 拓扑热编辑"
          >
            <FileCode className="size-5" />
          </button>
        </div>

        {/* 底部 CAD 徽标 */}
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <span className="text-[9px] font-cad font-bold">CAD</span>
        </div>
      </aside>

      {/* 2. 展开的侧边工作区面板 (Expanded Tool Drawer) */}
      {activeTab && (
        <aside className="w-96 border-r border-border bg-slate-900/98 backdrop-blur flex flex-col shrink-0 z-10 shadow-2xl transition-all duration-200 ease-in-out font-cad">
          {/* 面板标题栏 */}
          <div className="h-11 px-4 border-b border-border flex items-center justify-between shrink-0 bg-slate-950/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              {activeTab === 'erc' && (
                <>
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>ERC 物理规则体检诊断</span>
                </>
              )}
              {activeTab === 'calc' && (
                <>
                  <Calculator className="size-4 text-amber-400" />
                  <span>负荷计算与变压器选型</span>
                </>
              )}
              {activeTab === 'bom' && (
                <>
                  <FileSpreadsheet className="size-4 text-emerald-400" />
                  <span>全厂设备采购 BOM 清单</span>
                </>
              )}
              {activeTab === 'projects' && (
                <>
                  <Folder className="size-4 text-amber-400" />
                  <span>工程资产与版本快照 (D1)</span>
                </>
              )}
              {activeTab === 'json' && (
                <>
                  <FileCode className="size-4 text-indigo-400" />
                  <span>全要素 JSON 拓扑热编辑</span>
                </>
              )}
            </div>

            <button
              onClick={() => onTabChange(null)}
              className="size-6 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition"
              title="收起侧边栏"
            >
              ✕
            </button>
          </div>

          {/* 面板内容容器 (JSON 模式下自适应撑满，消灭双滚动条) */}
          <div
            className={`flex-1 ${
              activeTab === 'json' ? 'overflow-hidden flex flex-col p-3 min-h-0' : 'overflow-y-auto p-4 space-y-4'
            } text-xs`}
          >
            {activeTab === 'erc' && <ERCPanel ercResult={ercResult} />}
            {activeTab === 'calc' && <LoadCalcPanel calcReport={calcReport} />}
            {activeTab === 'bom' && <BOMPanel topology={topology} onExportBOM={onExportBOM} />}
            {activeTab === 'projects' && (
              <ProjectsPanel snapshots={snapshots} onCommitSnapshot={onCommitSnapshot} />
            )}
            {activeTab === 'json' && (
              <JsonEditorPanel
                jsonText={jsonText}
                onJsonChange={onJsonChange}
                onApplyJson={onApplyJson}
              />
            )}
          </div>
        </aside>
      )}
    </>
  );
};
