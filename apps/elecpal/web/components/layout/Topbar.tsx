import React from 'react';
import {
  Zap,
  Bot,
  Radio,
  Folder,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
  Moon,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrentUser } from '@services/auth-service';

interface TopbarProps {
  workshopCode: string;
  activeSheet: number;
  onSheetChange: (sheet: number) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitZoom: () => void;
  onExportDXF: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUser: CurrentUser;
  onAuthAction: () => void;
  onToggleProjects: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  workshopCode,
  activeSheet,
  onSheetChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitZoom,
  onExportDXF,
  theme,
  onToggleTheme,
  currentUser,
  onAuthAction,
  onToggleProjects,
}) => {
  return (
    <header className="h-13 border-b border-border bg-slate-900/95 backdrop-blur px-3.5 flex items-center justify-between gap-3 shrink-0 z-30 shadow-sm whitespace-nowrap">
      {/* 左侧：Logo + 工程项目标识 */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition shrink-0 select-none"
          onClick={onToggleProjects}
        >
          <div className="size-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm shrink-0">
            <Zap className="size-4" />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-extrabold text-sm text-foreground tracking-tight font-cad whitespace-nowrap">
              ElecPal <span className="text-amber-400">电气伴侣</span>
            </span>
            <Badge variant="warning" className="px-1.5 py-0 text-[10px] whitespace-nowrap shrink-0">
              v2.0
            </Badge>
          </div>
        </div>

        <Button
          variant="cad"
          size="sm"
          onClick={onToggleProjects}
          className="shrink-0 flex items-center gap-1.5 whitespace-nowrap h-7 px-2.5 text-xs font-bold"
        >
          <Folder className="size-3 text-amber-400 shrink-0" />
          <span>{workshopCode || '01号车间'}</span>
        </Button>
      </div>

      {/* 中间：三大工程图卷快速切换 (Centered Tabs) */}
      <div className="shrink-0">
        <Tabs value={String(activeSheet)} onValueChange={(val) => onSheetChange(Number(val))}>
          <TabsList className="h-8">
            <TabsTrigger value="1" className="h-6.5 text-xs px-2.5 whitespace-nowrap">
              <Zap className="size-3 text-amber-400" />
              ELEC-01 动力一次图
            </TabsTrigger>
            <TabsTrigger value="2" className="h-6.5 text-xs px-2.5 whitespace-nowrap">
              <Bot className="size-3 text-emerald-400" />
              ELEC-02 PLC自控图
            </TabsTrigger>
            <TabsTrigger value="3" className="h-6.5 text-xs px-2.5 whitespace-nowrap">
              <Radio className="size-3 text-indigo-400" />
              ELEC-03 485网络图
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 右侧：画布视口控制 + 一键出图 + 主题 + 用户 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 视口控制器 */}
        <div className="flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-lg border border-border shrink-0">
          <Button variant="ghost" size="icon" onClick={onZoomIn} title="放大" className="size-6.5">
            <ZoomIn className="size-3 text-slate-300" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onZoomOut} title="缩小" className="size-6.5">
            <ZoomOut className="size-3 text-slate-300" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onResetZoom} title="1:1 复位" className="h-6.5 px-1.5 text-[10px] font-cad">
            1:1
          </Button>
          <Button variant="cadActive" size="sm" onClick={onFitZoom} title="适屏显示" className="h-6.5 px-2 text-[10px]">
            <Maximize2 className="size-2.5 mr-1" />
            适屏
          </Button>
          <span className="px-1 text-slate-400 text-[10px] font-cad w-10 text-center select-none font-bold">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* 📐 AutoCAD DXF 核心出图 */}
        <Button
          variant="default"
          size="sm"
          onClick={onExportDXF}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold whitespace-nowrap shrink-0 h-7 text-xs shadow-sm"
        >
          <Download className="size-3.5 shrink-0" />
          导出 DXF
        </Button>

        {/* 🌓 主题切换 */}
        <Button variant="cad" size="icon" onClick={onToggleTheme} title="切换暗黑/白图" className="size-7 shrink-0">
          {theme === 'dark' ? <Moon className="size-3.5" /> : <Sun className="size-3.5 text-amber-500" />}
        </Button>

        {/* 👤 Google 登录状态 */}
        <Button
          variant="cad"
          size="sm"
          onClick={onAuthAction}
          className="whitespace-nowrap shrink-0 flex items-center gap-1.5 h-7 px-2 text-xs"
        >
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="Avatar" className="size-3.5 rounded-full shrink-0" />
          ) : (
            <UserIcon className="size-3.5 text-slate-400 shrink-0" />
          )}
          <span className="max-w-[70px] truncate text-[11px]">
            {currentUser.isGuest ? '登录' : currentUser.displayName}
          </span>
        </Button>
      </div>
    </header>
  );
};
