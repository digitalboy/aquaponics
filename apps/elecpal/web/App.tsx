import React, { useState, useEffect } from 'react';
import {
  PlantWideTopology,
  PlantWideTopologySchema,
} from '@aquaponics/schema';
import { ERCValidator, ERCValidationResult } from '@core/erc-validator';
import { ElectricalCalculator, LoadCalculationSummary } from '@core/calculator';
import { DXFExporter } from '@renderers/dxf-exporter';
import { BOMExporter } from '@renderers/bom-exporter';
import { AuthService, CurrentUser } from '@services/auth-service';
import { ProjectService, TopologyVersionSnapshot } from '@services/project-service';

// 导入解耦后的子组件
import { Topbar } from './components/layout/Topbar';
import { ToolSidebar, SidebarTab } from './components/layout/ToolSidebar';
import { StatusBar } from './components/layout/StatusBar';
import { CadViewport } from './components/cad/CadViewport';

export function App() {
  // 核心工程状态
  const [topology, setTopology] = useState<PlantWideTopology | null>(null);
  const [activeSheet, setActiveSheet] = useState<number>(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [zoom, setZoom] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });

  // 侧边栏工具箱状态 (默认展开 ERC 诊断侧边栏)
  const [activeSidebar, setActiveSidebar] = useState<SidebarTab>('erc');

  // 计算诊断与版本数据
  const [ercResult, setErcResult] = useState<ERCValidationResult | null>(null);
  const [calcReport, setCalcReport] = useState<LoadCalculationSummary | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(AuthService.getCurrentUser());
  const [snapshots, setSnapshots] = useState<TopologyVersionSnapshot[]>([]);
  const [jsonText, setJsonText] = useState<string>('');

  // 1. 初始化工程数据与鉴权监听
  useEffect(() => {
    const unsubAuth = AuthService.subscribe((u) => setCurrentUser(u));

    fetch('/workshop_01_sample.json')
      .then((res) => res.json())
      .then((data) => {
        try {
          const validated = PlantWideTopologySchema.parse(data);
          loadTopologyData(validated);
        } catch (e) {
          console.warn('默认样例加载回退', e);
        }
      })
      .catch((err) => console.error('加载示例失败', err));

    return () => unsubAuth();
  }, []);

  const loadTopologyData = (data: PlantWideTopology) => {
    setTopology(data);
    setJsonText(JSON.stringify(data, null, 2));

    // 执行 ERC 物理规则诊断与负荷推演
    const erc = ERCValidator.validate(data);
    setErcResult(erc);
    const calc = ElectricalCalculator.calculate(data);
    setCalcReport(calc);

    ProjectService.listSnapshots(data.system_id).then(setSnapshots);
  };

  // 视口平移缩放辅助方法
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 4.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z * 0.833, 0.2));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 40, y: 40 });
  };
  const handleFitZoom = () => {
    setZoom(0.82);
    setPan({ x: 20, y: 20 });
  };

  // 导出 AutoCAD DXF (严格 ERC 门禁)
  const handleExportDXF = () => {
    if (!topology) return;
    try {
      let dxfContent = '';
      let filename = '';

      if (activeSheet === 1) {
        dxfContent = DXFExporter.exportELEC01DXF(topology);
        filename = `${topology.workshop_code}_ELEC-01_SingleLineDiagram.dxf`;
      } else if (activeSheet === 2) {
        dxfContent = DXFExporter.exportELEC02DXF(topology);
        filename = `${topology.workshop_code}_ELEC-02_PLC_WiringDiagram.dxf`;
      } else {
        dxfContent = DXFExporter.exportELEC03DXF(topology);
        filename = `${topology.workshop_code}_ELEC-03_RS485_BusTopology.dxf`;
      }

      downloadBlob(dxfContent, filename, 'application/dxf');
    } catch (err: any) {
      alert(`【CAD 出图拦截】\n${err.message}`);
      setActiveSidebar('erc');
    }
  };

  // 导出采购 BOM
  const handleExportBOM = () => {
    if (!topology) return;
    const csv = BOMExporter.exportBOMToCSV(topology);
    const filename = `${topology.workshop_code}_Procurement_BOM.csv`;
    downloadBlob('\uFEFF' + csv, filename, 'text/csv;charset=utf-8;');
  };

  const downloadBlob = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 保存版本快照 (Commit)
  const handleCommitSnapshot = async () => {
    if (!topology || !ercResult) return;
    const summary = prompt('请输入本次拓扑修订说明 (Commit Message):', '优化支路配置与电缆截面');
    if (!summary) return;

    const snap = await ProjectService.commitVersionSnapshot(
      topology.system_id,
      summary,
      topology,
      ercResult
    );
    setSnapshots((prev) => [snap, ...prev]);
    alert(`版本快照 ${snap.versionTag} 已成功提交至 Cloudflare D1 边缘云！`);
  };

  // 应用 JSON 拓扑热变更
  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validated = PlantWideTopologySchema.parse(parsed);
      loadTopologyData(validated);
      alert('拓扑契约校验通过，CAD 画布已重新排版渲染！');
    } catch (err: any) {
      alert(`JSON 契约格式错误:\n${err.message}`);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('light', next === 'light');
  };

  // 用户认证操作
  const handleAuthAction = () => {
    if (currentUser.isGuest) {
      AuthService.signInWithGoogle();
    } else {
      AuthService.signOutUser();
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden select-none bg-background text-foreground ${theme}`}>
      {/* 1. 顶部极简工具栏 */}
      <Topbar
        workshopCode={topology?.workshop_code || '01号车间'}
        activeSheet={activeSheet}
        onSheetChange={setActiveSheet}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitZoom={handleFitZoom}
        onExportDXF={handleExportDXF}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onAuthAction={handleAuthAction}
        onToggleProjects={() =>
          setActiveSidebar(activeSidebar === 'projects' ? null : 'projects')
        }
      />

      {/* 2. 主体区：左侧工控侧边栏 + 中央矢量画布 */}
      <div className="flex-1 flex overflow-hidden relative">
        <ToolSidebar
          activeTab={activeSidebar}
          onTabChange={setActiveSidebar}
          ercResult={ercResult}
          calcReport={calcReport}
          topology={topology}
          snapshots={snapshots}
          jsonText={jsonText}
          onJsonChange={setJsonText}
          onApplyJson={handleApplyJson}
          onCommitSnapshot={handleCommitSnapshot}
          onExportBOM={handleExportBOM}
        />

        <CadViewport
          topology={topology}
          activeSheet={activeSheet}
          theme={theme}
          zoom={zoom}
          pan={pan}
          onZoomChange={setZoom}
          onPanChange={setPan}
        />
      </div>

      {/* 3. 底部工控状态栏 (国家制图规范/供电制式/D1状态/缩放比) */}
      <StatusBar topology={topology} zoom={zoom} />
    </div>
  );
}
