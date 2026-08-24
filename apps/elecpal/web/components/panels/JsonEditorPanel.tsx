import React, { useState, useMemo } from 'react';
import { Zap, Code2, ListTree, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JsonTreeViewer } from './JsonTreeViewer';

interface JsonEditorPanelProps {
  jsonText: string;
  onJsonChange: (val: string) => void;
  onApplyJson: () => void;
}

export const JsonEditorPanel: React.FC<JsonEditorPanelProps> = ({
  jsonText,
  onJsonChange,
  onApplyJson,
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');

  // 解析并缓存 JSON 对象用于树状视图
  const { parsedJson, parseError } = useMemo(() => {
    try {
      const obj = JSON.parse(jsonText);
      return { parsedJson: obj, parseError: null };
    } catch (err: any) {
      return { parsedJson: null, parseError: err.message };
    }
  }, [jsonText]);

  return (
    <div className="flex flex-col h-full space-y-3 font-cad text-xs">
      {/* 1. 视图模式切换与状态 */}
      <div className="flex items-center justify-between shrink-0 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition ${
              viewMode === 'tree'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ListTree className="size-3.5" />
            <span>结构折叠视图</span>
          </button>

          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition ${
              viewMode === 'raw'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="size-3.5" />
            <span>源码编辑</span>
          </button>
        </div>

        {parseError ? (
          <span className="flex items-center gap-1 text-[11px] text-red-400 pr-2">
            <AlertCircle className="size-3" />
            JSON 语法错误
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 pr-2">
            <CheckCircle2 className="size-3" />
            语法合法
          </span>
        )}
      </div>

      {/* 2. 主体区 (单滚动条容器，撑满剩余空间) */}
      <div className="flex-1 min-h-0 relative">
        {viewMode === 'tree' ? (
          parsedJson ? (
            <JsonTreeViewer data={parsedJson} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950 border border-slate-800 rounded-xl text-red-400 space-y-2">
              <AlertCircle className="size-8" />
              <div className="font-bold text-xs">JSON 解析失败，无法渲染树状折叠</div>
              <div className="text-[11px] text-slate-400">{parseError}</div>
              <Button variant="outline" size="sm" onClick={() => setViewMode('raw')}>
                切换至源码模式修正
              </Button>
            </div>
          )
        ) : (
          <textarea
            value={jsonText}
            onChange={(e) => onJsonChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-amber-500 resize-none overflow-y-auto leading-relaxed"
          />
        )}
      </div>

      {/* 3. 底部操作按钮 */}
      <div className="shrink-0 pt-1">
        <Button
          variant="default"
          size="default"
          className="w-full font-bold h-8.5 text-xs shadow-md"
          onClick={onApplyJson}
        >
          <Zap className="size-3.5 mr-1.5" />
          应用热更新并重绘 CAD 画布
        </Button>
      </div>
    </div>
  );
};
