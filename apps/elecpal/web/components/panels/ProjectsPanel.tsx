import React from 'react';
import { Save } from 'lucide-react';
import { TopologyVersionSnapshot } from '@services/project-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectsPanelProps {
  snapshots: TopologyVersionSnapshot[];
  onCommitSnapshot: () => void;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
  snapshots,
  onCommitSnapshot,
}) => {
  return (
    <div className="space-y-4 font-cad text-xs">
      <Button variant="default" size="sm" className="w-full font-bold h-8 text-xs" onClick={onCommitSnapshot}>
        <Save className="size-3.5 mr-1.5" />
        保存当前拓扑快照 (Commit)
      </Button>

      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
          版本历史时间线 ({snapshots.length})
        </span>
        <div className="space-y-2.5">
          {snapshots.map((snap) => (
            <Card key={snap.versionId} className="p-3 border-slate-800 bg-slate-950/60 hover:border-primary/50 transition">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="warning" className="text-xs px-2 py-0.5 font-bold">
                  {snap.versionTag}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(snap.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-200 leading-snug">{snap.commitSummary}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
