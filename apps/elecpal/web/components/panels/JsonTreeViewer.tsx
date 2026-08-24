import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JsonTreeViewerProps {
  data: any;
  onSelectNode?: (path: string, val: any) => void;
}

interface TreeNodeProps {
  keyName?: string | number;
  value: any;
  depth: number;
  path: string;
  collapsedPaths: Set<string>;
  onToggle: (path: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  depth,
  path,
  collapsedPaths,
  onToggle,
}) => {
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isContainer = isObject || isArray;
  const isCollapsed = collapsedPaths.has(path);

  const indentStyle = { paddingLeft: `${depth * 14}px` };

  if (isContainer) {
    const keys = Object.keys(value);
    const count = keys.length;
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';

    return (
      <div className="font-mono text-xs leading-relaxed select-text">
        <div
          style={indentStyle}
          onClick={() => onToggle(path)}
          className="flex items-center gap-1 hover:bg-slate-800/60 rounded px-1 py-0.5 cursor-pointer text-slate-300 transition-colors group"
        >
          <span className="size-4 flex items-center justify-center text-slate-400 group-hover:text-amber-400 shrink-0">
            {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </span>

          {keyName !== undefined && (
            <span className="text-sky-400 font-bold">
              {typeof keyName === 'number' ? `[${keyName}]` : `"${keyName}"`}
              <span className="text-slate-500">: </span>
            </span>
          )}

          <span className="text-amber-400/80 font-bold">{bracketOpen}</span>

          {isCollapsed ? (
            <span className="text-slate-500 text-[11px] bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700 ml-1">
              ... {count} {isArray ? '项' : '键'} ...
            </span>
          ) : (
            <span className="text-slate-500 text-[10px] ml-1">
              {count} {isArray ? 'items' : 'props'}
            </span>
          )}

          {isCollapsed && <span className="text-amber-400/80 font-bold">{bracketClose}</span>}
        </div>

        {!isCollapsed && (
          <div>
            {keys.map((k, idx) => {
              const childKey = isArray ? Number(k) : k;
              const childVal = value[k];
              const childPath = `${path}.${k}`;
              return (
                <TreeNode
                  key={idx}
                  keyName={childKey}
                  value={childVal}
                  depth={depth + 1}
                  path={childPath}
                  collapsedPaths={collapsedPaths}
                  onToggle={onToggle}
                />
              );
            })}
            <div style={indentStyle} className="text-amber-400/80 font-bold px-1 pl-5">
              {bracketClose}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 标量渲染 (String, Number, Boolean, Null)
  let valRender = null;
  if (value === null) {
    valRender = <span className="text-slate-500 italic">null</span>;
  } else if (typeof value === 'boolean') {
    valRender = <span className="text-purple-400 font-bold">{String(value)}</span>;
  } else if (typeof value === 'number') {
    valRender = <span className="text-amber-400 font-bold">{value}</span>;
  } else if (typeof value === 'string') {
    valRender = <span className="text-emerald-300">"{value}"</span>;
  } else {
    valRender = <span className="text-slate-300">{String(value)}</span>;
  }

  return (
    <div
      style={indentStyle}
      className="flex items-center gap-1 hover:bg-slate-800/40 rounded px-1 pl-5 py-0.5 font-mono text-xs leading-relaxed"
    >
      {keyName !== undefined && (
        <span className="text-sky-300 font-medium shrink-0">
          {typeof keyName === 'number' ? `[${keyName}]` : `"${keyName}"`}
          <span className="text-slate-500">: </span>
        </span>
      )}
      <span className="break-all">{valRender}</span>
    </div>
  );
};

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({ data }) => {
  // 默认折叠深层节点（深度 > 1）
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => {
    const set = new Set<string>();
    // 默认折叠 sub_panels 下的具体回路列表与 plc 内部列表
    set.add('root.power_distribution.sub_panels.0.circuits');
    set.add('root.power_distribution.sub_panels.1.circuits');
    set.add('root.power_distribution.sub_panels.2.circuits');
    return set;
  });
  const [copied, setCopied] = useState<boolean>(false);

  const togglePath = (path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleExpandAll = () => setCollapsedPaths(new Set());

  const handleCollapseAll = () => {
    const set = new Set<string>();
    const collectPaths = (obj: any, currentPath: string) => {
      if (obj !== null && typeof obj === 'object') {
        set.add(currentPath);
        Object.keys(obj).forEach((k) => collectPaths(obj[k], `${currentPath}.${k}`));
      }
    };
    collectPaths(data, 'root');
    setCollapsedPaths(set);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* 快捷操作栏 */}
      <div className="h-8.5 bg-slate-900 border-b border-slate-800 px-2.5 flex items-center justify-between shrink-0 text-xs select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExpandAll}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-cad transition"
          >
            全部展开
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-cad transition"
          >
            全部折叠
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-cad transition"
          title="复制标准 JSON"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? '已复制' : '复制 JSON'}</span>
        </button>
      </div>

      {/* 树状折叠滚动区 (唯一单滚动条) */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5 font-mono select-text">
        <TreeNode
          value={data}
          depth={0}
          path="root"
          collapsedPaths={collapsedPaths}
          onToggle={togglePath}
        />
      </div>
    </div>
  );
};
