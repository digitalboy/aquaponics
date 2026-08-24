import React, { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { PlantWideTopology } from '@aquaponics/schema';
import { Sheet1SLD } from './sheets/Sheet1SLD';
import { Sheet2PLC } from './sheets/Sheet2PLC';
import { Sheet3RS485 } from './sheets/Sheet3RS485';
import { CadHoverInfo } from './types';

interface CadViewportProps {
  topology: PlantWideTopology | null;
  activeSheet: number;
  theme: 'dark' | 'light';
  zoom: number;
  pan: { x: number; y: number };
  onZoomChange: (newZoom: number) => void;
  onPanChange: (newPan: { x: number; y: number }) => void;
}

export const CadViewport: React.FC<CadViewportProps> = ({
  topology,
  activeSheet,
  theme,
  zoom,
  pan,
  onZoomChange,
  onPanChange,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState<CadHoverInfo | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    onZoomChange(Math.min(Math.max(zoom * factor, 0.2), 4.0));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setHoverInfo(null);
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    onPanChange({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const renderSheetContent = () => {
    if (!topology) return null;
    if (activeSheet === 1) {
      return <Sheet1SLD topology={topology} onHover={setHoverInfo} />;
    }
    if (activeSheet === 2) {
      return <Sheet2PLC topology={topology} onHover={setHoverInfo} />;
    }
    return <Sheet3RS485 topology={topology} onHover={setHoverInfo} />;
  };

  return (
    <main
      ref={containerRef}
      className={`flex-1 relative overflow-hidden ${theme === 'dark' ? 'cad-grid-dark' : 'cad-grid-light'} cursor-grab active:cursor-grabbing`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 悬浮详情提示卡 (中文舒适字号：标题 14px，正文 12.5px，行距充裕) */}
      {hoverInfo && !isDragging && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900/98 backdrop-blur-md border border-amber-500/50 rounded-xl p-4 shadow-2xl font-cad text-xs text-slate-100 min-w-[280px] max-w-md transition-opacity duration-150 animate-in fade-in zoom-in-95"
          style={{
            left: Math.min(hoverInfo.x + 16, window.innerWidth - 340),
            top: Math.min(hoverInfo.y + 16, window.innerHeight - 240),
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5">
            <span className="font-bold text-slate-100 text-sm leading-snug">{hoverInfo.title}</span>
            {hoverInfo.badge && (
              <Badge variant={hoverInfo.badgeVariant || 'warning'} className="text-xs px-2 py-0.5 shrink-0 font-bold">
                {hoverInfo.badge}
              </Badge>
            )}
          </div>
          <div className="space-y-2 text-xs">
            {hoverInfo.details.map((item, idx) => (
              <div key={idx} className="flex items-baseline justify-between gap-3 text-slate-300">
                <span className="text-slate-400 shrink-0">{item.label}:</span>
                <span className="font-bold text-slate-100 text-right leading-tight">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SVG 矢量绘制层 */}
      <svg
        ref={svgRef}
        className="w-[2400px] h-[1600px] absolute transition-transform duration-75 origin-top-left"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        viewBox="0 0 2400 1600"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderSheetContent()}
      </svg>
    </main>
  );
};
