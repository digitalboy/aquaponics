/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * state.js: 全局响应式状态管理、ISO 8601 时钟、Modbus 遥测仿真与情景模拟引擎
 * =========================================================================
 */

// 全局运行状态与传感器实时数据
const AppState = {
  currentRole: 'investor',
  currentScenario: 'normal', // 'normal', 'anoxia', 'ammonia', 'peak_tariff', 'storm'
  
  // 物理传感器实时数据 (与 BOM 硬件完全对齐)
  telemetry: {
    do: 6.85,           // 深圳国数 BSK-DO-100 全不锈钢 (mg/L)
    tan: 0.82,          // 山东塞恩 SN-3003 在线氨氮 (mg/L)
    uia: 0.012,         // Emerson 公式反演游离有毒氨 NH3 (mg/L)
    ph: 6.82,           // 双盐桥 pH 电极
    waterTemp: 23.5,    // 旁路流通槽水温 (°C)
    powerKw: 18.45,     // 威胜 DTSD342-P5 全厂总功率 (kW)
    powerFactor: 0.962, // 功率因数
    clusteringRate: 88.4, // YOLO11 鱼群摄食聚拢度 (%)
    vpd: 0.85,          // 饱和蒸汽压差 (kPa)
    dli: 16.8,          // 今日 DLI 光合积分 (mol/m²/d)
  }
};

/**
 * 严格 ISO 8601 UTC 毫秒时间生成器 (遵循全局数据宪法)
 * 格式: 2026-08-18T16:00:00.128Z
 */
function getStrictIsoTimestamp() {
  return new Date().toISOString();
}

/**
 * 实时时钟更新心跳 (1000ms)
 */
function initClockTicker() {
  function tick() {
    const isoString = getStrictIsoTimestamp();
    const clockEl = document.getElementById('utc-clock');
    if (clockEl) clockEl.textContent = isoString;

    // 随机追加一条 Modbus 底层时序报文日志
    if (Math.random() > 0.45) {
      appendTelemetryLog(isoString);
    }
  }
  tick();
  setInterval(tick, 1000);
}

/**
 * 在时序终端追加一条可审计的原始 Modbus-RTU 报文
 */
function appendTelemetryLog(isoTime) {
  const logContainer = document.getElementById('telemetry-log');
  if (!logContainer) return;

  const modbusDO = Math.round(AppState.telemetry.do * 100).toString(16).padStart(4, '0').toUpperCase();
  const modbusTAN = Math.round(AppState.telemetry.tan * 100).toString(16).padStart(4, '0').toUpperCase();
  
  const entry = document.createElement('div');
  entry.className = "hover:bg-slate-900/80 transition py-0.5";
  entry.innerHTML = `<span class="text-slate-500">[${isoTime.substring(11, 23)}]</span> <span class="text-cyan-400">PLC.Recv</span> [Addr:02 Func:03 Reg:0000 Val:0x${modbusTAN}] TAN=${AppState.telemetry.tan.toFixed(2)}mg/L | [Addr:03 Reg:0006] DO=${AppState.telemetry.do.toFixed(2)}mg/L <span class="text-emerald-400">CRC:OK</span>`;
  
  logContainer.insertBefore(entry, logContainer.firstChild);
  if (logContainer.children.length > 25) {
    logContainer.removeChild(logContainer.lastChild);
  }
}

/**
 * 刷新 UI 界面上的所有仪表盘读数
 */
function renderGauges() {
  const valDO = document.getElementById('val-do');
  const valTAN = document.getElementById('val-tan');
  const valUIA = document.getElementById('val-uia');
  const valPH = document.getElementById('val-ph');
  const valTemp = document.getElementById('val-temp');

  if (valDO) valDO.textContent = AppState.telemetry.do.toFixed(2);
  if (valTAN) valTAN.textContent = AppState.telemetry.tan.toFixed(2);
  if (valUIA) valUIA.textContent = AppState.telemetry.uia.toFixed(3);
  if (valPH) valPH.textContent = AppState.telemetry.ph.toFixed(2);
  if (valTemp) valTemp.textContent = AppState.telemetry.waterTemp.toFixed(1);
}

/**
 * 上帝视角情景突发模拟引擎
 */
function triggerScenario(scenario) {
  AppState.currentScenario = scenario;
  const banner = document.getElementById('emergency-banner');
  const bannerMsg = document.getElementById('emergency-msg');
  const cardDO = document.getElementById('card-do');
  const cardTAN = document.getElementById('card-tan');

  // 清除历史报警样式
  if (cardDO) cardDO.classList.remove('bg-rose-950/60', 'border-rose-500', 'animate-alarm');
  if (cardTAN) cardTAN.classList.remove('bg-rose-950/60', 'border-rose-500', 'animate-alarm');

  if (scenario === 'anoxia') {
    AppState.telemetry.do = 3.42; // 急性缺氧 (< 4.0 mg/L)
    if (banner) banner.classList.remove('hidden');
    if (bannerMsg) bannerMsg.textContent = "【现场 PLC 0.1s 硬安全触发】溶解氧跌破 4.0 mg/L (实测 3.42 mg/L)！已强制联锁开启备用高压增氧阀并切断自动投喂！";
    if (cardDO) cardDO.classList.add('bg-rose-950/60', 'border-rose-500', 'animate-alarm');
  } else if (scenario === 'ammonia') {
    AppState.telemetry.tan = 2.45; // TAN > 2.0
    AppState.telemetry.uia = 0.068; // UIA > 0.05 mg/L 致死红线
    if (banner) banner.classList.remove('hidden');
    if (bannerMsg) bannerMsg.textContent = "【塞恩氨氮传感器报警】游离有毒氨 UIA 达 0.068 mg/L (超死线 0.05)！PLC 强制强开稀释曝气，并在养殖长工单生成双周电极校准与换膜提示！";
    if (cardTAN) cardTAN.classList.add('bg-rose-950/60', 'border-rose-500', 'animate-alarm');
  } else if (scenario === 'peak_tariff') {
    if (banner) banner.classList.remove('hidden');
    if (bannerMsg) bannerMsg.textContent = "【MPC 电网峰谷避峰生效】当前进入尖峰电价 1.28元/度！系统自动停运 3kW 热泵与大功率补光灯，完全释放水体在深夜谷电累积的巨额热容！";
  } else if (scenario === 'storm') {
    if (banner) banner.classList.remove('hidden');
    if (bannerMsg) bannerMsg.textContent = "【室外超声微气象站雨雪硬触点闭合】室外风速 14.2 m/s 并伴随暴雨！汇川 PLC 0.1 秒强制天窗电机硬关窗，防止雨水倒灌淹没温室！";
  }

  renderGauges();
}

/**
 * 恢复正常运行状态
 */
function resetScenario() {
  AppState.currentScenario = 'normal';
  AppState.telemetry.do = 6.85;
  AppState.telemetry.tan = 0.82;
  AppState.telemetry.uia = 0.012;

  const banner = document.getElementById('emergency-banner');
  if (banner) banner.classList.add('hidden');

  const cardDO = document.getElementById('card-do');
  const cardTAN = document.getElementById('card-tan');
  if (cardDO) cardDO.classList.remove('bg-rose-950/60', 'border-rose-500', 'animate-alarm');
  if (cardTAN) cardTAN.classList.remove('bg-rose-950/60', 'border-rose-500', 'animate-alarm');

  renderGauges();
}
