/**
 * =========================================================================
 * ElecPal (电气伴侣) · 工程项目与拓扑版本服务
 * 支持 Cloudflare D1 边缘关系数据库、Firebase Firestore 与 LocalStorage 本地沙盒
 * 支持多车间工程 CRUD 与拓扑版本快照 (Version Snapshots) 时间线
 * =========================================================================
 */
import { PlantWideTopology } from '../core/schema';
import { ERCValidationResult } from '../core/erc-validator';
import { AuthService, CurrentUser } from './auth-service';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';

export interface TopologyVersionSnapshot {
  versionId: string;
  versionTag: string;
  commitSummary: string;
  schemaVersion: string;
  createdAt: string; // 严格 ISO 8601 UTC
  topology: PlantWideTopology;
  ercResult?: ERCValidationResult;
}

export interface ProjectRecord {
  projectId: string;
  projectName: string;
  facilityCode: string;
  updatedAt: string; // 严格 ISO 8601 UTC
  activeVersionId: string;
  activeTopology: PlantWideTopology;
  snapshots?: TopologyVersionSnapshot[];
}

export interface CloudSyncResult {
  cloudSynced: boolean;
  error?: string;
}

export interface CommitSnapshotResult extends CloudSyncResult {
  snapshot: TopologyVersionSnapshot;
}

export class ProjectService {
  private static STORAGE_KEY = 'elecpal_local_projects';

  /**
   * 按用户维度生成工程 ID，避免多用户加载同一默认样例时在 D1 主键冲突
   */
  public static getScopedProjectId(systemId: string, user: CurrentUser = AuthService.getCurrentUser()): string {
    if (user.isGuest) return systemId;
    const prefix = `${user.uid}:`;
    return systemId.startsWith(prefix) ? systemId : `${prefix}${systemId}`;
  }

  /**
   * 获取所有工程项目列表 (已登录: Cloudflare D1 -> Firebase -> LocalStorage; 游客: 仅 LocalStorage)
   */
  public static async listProjects(): Promise<ProjectRecord[]> {
    const user = AuthService.getCurrentUser();
    const idToken = await AuthService.getIdToken();

    // 1. 已登录用户优先尝试 Cloudflare D1 Edge API
    if (!user.isGuest && idToken) {
      try {
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data.map((row: any) => ({
              projectId: row.id,
              projectName: row.name,
              facilityCode: `${row.facility_name} (${row.workshop_code})`,
              updatedAt: row.updated_at,
              activeVersionId: 'v_latest',
              activeTopology: row.current_topology_json ? JSON.parse(row.current_topology_json) : null
            })).filter((p: any) => p.activeTopology !== null);
          }
        }
      } catch (d1Err) {
        // D1 API 不可用时平滑降级
      }
    }

    // 2. 尝试 Firebase Firestore
    if (!user.isGuest && db) {
      try {
        const userProjectsRef = collection(db, 'users', user.uid, 'projects');
        const snap = await getDocs(userProjectsRef);
        const list: ProjectRecord[] = [];
        snap.forEach(d => {
          list.push(d.data() as ProjectRecord);
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('【ProjectService】从 Firestore 读取项目失败，降级使用本地存储:', err);
      }
    }

    // 3. 离线沙盒模式 (LocalStorage)
    return this.getLocalProjects();
  }

  /**
   * 保存或更新工程项目，返回云端 D1 同步状态
   */
  public static async saveProject(project: ProjectRecord): Promise<CloudSyncResult> {
    project.updatedAt = new Date().toISOString();
    const user = AuthService.getCurrentUser();
    const idToken = await AuthService.getIdToken();

    // 1. 同步保存至本地 LocalStorage
    const localList = (await this.getLocalProjects()).filter(p => p.projectId !== project.projectId);
    localList.unshift(project);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(localList));

    let cloudSynced = false;
    let error: string | undefined;

    // 2. 已登录用户同步至 Cloudflare D1（游客模式仅保存在本地）
    if (!user.isGuest && idToken) {
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`
          },
          body: JSON.stringify({
            id: project.projectId,
            name: project.projectName,
            facility_name: project.activeTopology?.facility_name || '示范基地',
            workshop_code: project.activeTopology?.workshop_code || project.facilityCode || 'WS-01',
            current_topology_json: project.activeTopology
          })
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) {
          cloudSynced = true;
        } else {
          error = json?.error || `HTTP ${res.status}`;
        }
      } catch (d1Err: any) {
        error = d1Err?.message || '网络请求失败';
        console.warn('【ProjectService】同步至 Cloudflare D1 失败:', d1Err);
      }
    }

    // 3. 同步至 Firestore
    if (!user.isGuest && db) {
      try {
        const projectDocRef = doc(db, 'users', user.uid, 'projects', project.projectId);
        await setDoc(projectDocRef, project, { merge: true });
      } catch (err) {
        console.error('【ProjectService】同步项目至 Firestore 失败:', err);
      }
    }

    return { cloudSynced, error };
  }

  /**
   * 创建拓扑版本快照 (Commit Version Snapshot)
   */
  public static async commitVersionSnapshot(
    projectId: string,
    commitSummary: string,
    topology: PlantWideTopology,
    ercResult: ERCValidationResult
  ): Promise<CommitSnapshotResult> {
    const user = AuthService.getCurrentUser();
    const idToken = await AuthService.getIdToken();
    const now = new Date().toISOString();
    const versionId = `ver_${Date.now()}`;
    const versionTag = `V${(Date.now() % 10000).toString().padStart(4, '0')}`;

    const snapshot: TopologyVersionSnapshot = {
      versionId,
      versionTag,
      commitSummary,
      schemaVersion: topology.schema_version || '2.0.0',
      createdAt: now,
      topology,
      ercResult
    };

    // 1. 本地保存
    const snapKey = `elecpal_snapshots_${projectId}`;
    const rawSnaps = localStorage.getItem(snapKey);
    const snaps: TopologyVersionSnapshot[] = rawSnaps ? JSON.parse(rawSnaps) : [];
    snaps.unshift(snapshot);
    localStorage.setItem(snapKey, JSON.stringify(snaps));

    let cloudSynced = false;
    let error: string | undefined;

    // 2. 已登录用户提交至 Cloudflare D1
    if (!user.isGuest && idToken) {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/versions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`
          },
          body: JSON.stringify({
            id: versionId,
            version_tag: versionTag,
            commit_message: commitSummary,
            topology_snapshot_json: topology
          })
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success) {
          cloudSynced = true;
        } else {
          error = json?.error || `HTTP ${res.status}`;
        }
      } catch (d1Err: any) {
        error = d1Err?.message || '网络请求失败';
        console.warn('【ProjectService】提交快照至 Cloudflare D1 失败:', d1Err);
      }
    }

    // 3. 提交至 Firestore
    if (!user.isGuest && db) {
      try {
        const versionDocRef = doc(db, 'users', user.uid, 'projects', projectId, 'versions', versionId);
        await setDoc(versionDocRef, snapshot);
      } catch (err) {
        console.error('【ProjectService】保存快照至 Firestore 失败:', err);
      }
    }

    return { snapshot, cloudSynced, error };
  }

  /**
   * 获取某工程的历史版本快照列表
   */
  public static async listSnapshots(projectId: string): Promise<TopologyVersionSnapshot[]> {
    const user = AuthService.getCurrentUser();
    const idToken = await AuthService.getIdToken();

    // 1. 已登录用户尝试 Cloudflare D1
    if (!user.isGuest && idToken) {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/versions`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data.map((row: any) => ({
              versionId: row.id,
              versionTag: row.version_tag,
              commitSummary: row.commit_message,
              schemaVersion: '2.0.0',
              createdAt: row.committed_at,
              topology: row.topology_snapshot_json ? JSON.parse(row.topology_snapshot_json) : null
            })).filter((v: any) => v.topology !== null);
          }
        }
      } catch (d1Err) {
        // 降级
      }
    }

    // 2. 尝试 Firestore
    if (!user.isGuest && db) {
      try {
        const versionsRef = collection(db, 'users', user.uid, 'projects', projectId, 'versions');
        const q = query(versionsRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list: TopologyVersionSnapshot[] = [];
        snap.forEach(d => list.push(d.data() as TopologyVersionSnapshot));
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('【ProjectService】从 Firestore 读取快照失败，降级本地:', err);
      }
    }

    // 3. 本地存储
    const snapKey = `elecpal_snapshots_${projectId}`;
    const rawSnaps = localStorage.getItem(snapKey);
    return rawSnaps ? JSON.parse(rawSnaps) : [];
  }

  private static async getLocalProjects(): Promise<ProjectRecord[]> {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}
