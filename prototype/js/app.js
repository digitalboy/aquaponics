/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * app.js: 主交互控制器 (抽屉式侧边栏菜单、视图切换、3D 初始化、模态框交互)
 * =========================================================================
 */

// 角色元数据字典
const RoleMeta = {
  investor: { name: '战略成果与投资作战室', tag: 'Gov / VC / 战略投资', icon: '🏛️' },
  aquaculture: { name: '水产养殖指挥台', tag: '养殖长 / 现场作业', icon: '🐟' },
  hydroponics: { name: '水培种植调度台', tag: '种植长 / 农艺调度', icon: '🥬' },
  energy: { name: '工程能耗与预测维护', tag: '工程主管 / 设施维保', icon: '⚡' },
  executive: { name: '集团多基地运营中台', tag: 'COO / CFO / 供应链', icon: '📊' },
  'b2b-fulfillment': { name: 'B2B 大客户与冷链履约中台', tag: 'B2B 业务经理', icon: '🚚' },
  quality: { name: '品质检验与实验室中台', tag: '品质主管 / 驻厂检验', icon: '🔬' },
  scientist: { name: '研发主管科研中台', tag: '研发主管 / 农艺科研', icon: '🧑‍🔬' },
  b2b: { name: 'B2C 自有品牌与零售运营台', tag: '零售业务经理', icon: '🛍️' },
  b2c: { name: 'C端手机扫码溯源', tag: '终端家庭消费者', icon: '📱' }
};

/**
 * 抽屉式侧边栏控制器 (打开/关闭/切换)
 */
function toggleDrawer() {
  const drawer = document.getElementById('role-drawer');
  if (!drawer) return;
  if (drawer.classList.contains('hidden')) {
    openDrawer();
  } else {
    closeDrawer();
  }
}

function openDrawer() {
  const drawer = document.getElementById('role-drawer');
  const panel = document.getElementById('drawer-panel');
  if (!drawer || !panel) return;

  drawer.classList.remove('hidden');
  // 延迟一帧触发滑入动画
  setTimeout(() => {
    panel.classList.remove('drawer-closed');
    panel.classList.add('drawer-open');
  }, 10);
}

function closeDrawer() {
  const drawer = document.getElementById('role-drawer');
  const panel = document.getElementById('drawer-panel');
  if (!drawer || !panel) return;

  panel.classList.remove('drawer-open');
  panel.classList.add('drawer-closed');
  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 320);
}

/**
 * 切换角色专属工作台
 * @param {string} roleId 角色标识
 */
function switchRole(roleId) {
  AppState.currentRole = roleId;

  // 1. 隐藏所有工作台面板
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  // 2. 激活当前选中的工作台
  const activeView = document.getElementById(`view-${roleId}`);
  if (activeView) activeView.classList.remove('hidden');

  // 3. 更新抽屉内各个菜单项的高亮状态
  document.querySelectorAll('.drawer-item').forEach(item => {
    item.classList.remove('active', 'border-emerald-500');
    item.classList.add('border-slate-800');
  });
  const activeDrawerItem = document.getElementById(`drawer-item-${roleId}`);
  if (activeDrawerItem) {
    activeDrawerItem.classList.add('active', 'border-emerald-500');
    activeDrawerItem.classList.remove('border-slate-800');
  }

  // 4. 更新顶部导航栏当前工作台徽章显示
  const meta = RoleMeta[roleId] || RoleMeta.investor;
  const currentBadge = document.getElementById('header-active-role-text');
  const currentTag = document.getElementById('header-active-role-tag');
  if (currentBadge) currentBadge.textContent = `${meta.icon} ${meta.name}`;
  if (currentTag) currentTag.textContent = meta.tag;

  // 5. 自动收起抽屉式侧边栏
  closeDrawer();

  // 6. 通知 Chart.js 与 3D 引擎自适应重绘
  setTimeout(() => {
    AppCharts.resizeForRole(roleId);
    if (typeof DigitalTwin3D !== 'undefined') {
      DigitalTwin3D.onWindowResize();
    }
  }, 60);
}

/**
 * 模态框 1: 打开/关闭 氨氮电极双周两点标定 SOP
 */
function openCalibrationModal() {
  const modal = document.getElementById('modal-calibration');
  if (modal) modal.classList.remove('hidden');
}
function closeCalibrationModal() {
  const modal = document.getElementById('modal-calibration');
  if (modal) modal.classList.add('hidden');
}
function executeCalibrationSuccess() {
  closeCalibrationModal();
  alert('【标定成功】塞恩氨氮传感器两点标定参数已成功写入 0x1200/0x1201，电极斜率 98.6%，校准台账已同步 Cloudflare D1！');
}

/**
 * 模态框 2: 打开/关闭 B2B 电子防伪质检合格单
 */
function openInspectionReport() {
  const modal = document.getElementById('modal-inspection');
  if (modal) modal.classList.remove('hidden');
}
function closeInspectionReport() {
  const modal = document.getElementById('modal-inspection');
  if (modal) modal.classList.add('hidden');
}

/**
 * 键盘快捷键监听 (按 M 键唤出/收起抽屉菜单，按 Esc 键关闭)
 */
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') {
    // 未聚焦输入框时触发
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      toggleDrawer();
    }
  } else if (e.key === 'Escape') {
    closeDrawer();
    closeCalibrationModal();
    closeInspectionReport();
  }
});

/**
 * 页面加载完成生命周期入口
 */
window.addEventListener('DOMContentLoaded', () => {
  // 1. 启动 ISO 8601 时钟与时序日志心跳
  initClockTicker();

  // 2. 初始化 Three.js 3D 全景数字孪生大棚
  if (typeof DigitalTwin3D !== 'undefined') {
    DigitalTwin3D.init('three-canvas-container');
  }

  // 3. 初始化所有 Chart.js 图表
  AppCharts.initAll();

  // 4. 启动 Canvas 鱼群摄食与 YOLO11 视觉动画
  initFishFeedingCanvas();

  // 5. 首次渲染各表盘数据
  renderGauges();

  // 6. 支持通过 URL 查询参数直接直达某角色视图 (例如: ?role=investor 或 ?role=b2c)
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  if (roleParam) {
    switchRole(roleParam);
  }
});
