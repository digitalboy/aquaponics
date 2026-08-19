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
 * 工业级特级报警情景数据配置字典
 */
const ScenarioAlarmConfigs = {
  anoxia: {
    stripeClass: 'hazard-stripe-red',
    icon: '🚨',
    iconBoxBorder: 'border-red-400 bg-red-100',
    title: '【现场 PLC 0.1s 硬安全触发】加州鲈成鱼池严重缺氧！',
    titleColor: 'text-red-600',
    badge: 'SIL-2 硬件硬联锁 ACTIVE',
    badgeClass: 'bg-red-600 border-red-700 text-white animate-pulse',
    location: '📍 鱼池区 #01 加州鲈鱼成鱼池',
    currentVal: '3.42',
    unit: 'mg/L',
    statusText: '严重击穿生理窒息死线',
    statusColor: 'text-red-700',
    limitVal: '4.00',
    limitSub: '最低容许 DO 下限',
    diffVal: '-14.5%',
    diffSub: '立即启动应急纯氧',
    actions: [
      { text: '[硬件断电] 强制切断自动投喂机电源，杜绝饱食鱼高代谢耗氧死亡', color: 'text-emerald-300', icon: '⚡' },
      { text: '[应急纯氧] 毫秒级打开 PureOx-50 高压纯氧电磁阀 (补气流量 35 L/min)', color: 'text-emerald-300', icon: '💨' },
      { text: '[特急升级] 已向驻厂水产工程师（李工）推送最高等级语音呼叫与短信报警', color: 'text-amber-300', icon: '📢' }
    ],
    sop: '请巡检人员立即穿戴防护装备，前往 #01 鱼池观察加州鲈游动与浮头表征；检查 PSA 制氧机出口压力（标准 0.4~0.6 MPa）与微孔暴气盘。排查完毕后点击【消除警报】。',
    zoneJump: 'fish',
    eventId: 'EVT-20260819-ALARM-01-DO'
  },
  ammonia: {
    stripeClass: 'hazard-stripe-amber',
    icon: '⚠️',
    iconBoxBorder: 'border-amber-400 bg-amber-100',
    title: '【水质生化红线击穿】游离剧毒非离子氨 (UIA) 严重超标！',
    titleColor: 'text-amber-700',
    badge: '生物安全一级告警 ACTIVE',
    badgeClass: 'bg-amber-600 border-amber-700 text-white animate-pulse',
    location: '📍 生化过滤与硝化反应槽 #02',
    currentVal: '0.068',
    unit: 'mg/L',
    statusText: '超致死浓度警戒线 (>0.05)',
    statusColor: 'text-amber-700',
    limitVal: '0.050',
    limitSub: '生物致死临界红线',
    diffVal: '+36.0%',
    diffSub: '急需加药与稀释曝气',
    actions: [
      { text: '[自动加药] 启动 1# 计量泵加注高活性硝化细菌浓缩复合液 (120 mL/min)', color: 'text-emerald-300', icon: '💧' },
      { text: '[强力曝气] 开启生化曝气风机变频至 50Hz 全速运行，促进游离气态氨挥发', color: 'text-emerald-300', icon: '🌪️' },
      { text: '[工单派发] 塞恩 SN-3003 在线电极漂移预警，已派发双周两点标定工单', color: 'text-amber-300', icon: '📋' }
    ],
    sop: '现场值班员请前往生化调节池取水样做试剂盒平行复测；若确属超标，立即开启沉淀池底层排污阀并补充地下恒温井水 10%；核实加药箱硝化菌储量。',
    zoneJump: 'vege',
    eventId: 'EVT-20260819-ALARM-02-UIA'
  },
  peak_tariff: {
    stripeClass: 'hazard-stripe-purple',
    icon: '⚡',
    iconBoxBorder: 'border-purple-400 bg-purple-100',
    title: '【电网需量响应 MPC】进入尖峰电价避峰负荷削峰模式！',
    titleColor: 'text-purple-700',
    badge: 'MPC 能量自治优化 ACTIVE',
    badgeClass: 'bg-purple-600 border-purple-700 text-white animate-pulse',
    location: '📍 全厂综合动力与热泵配电区',
    currentVal: '1.48',
    unit: '元/kWh',
    statusText: '处于尖峰负荷电价时段',
    statusColor: 'text-purple-700',
    limitVal: '0.32',
    limitSub: '谷电平价基准线',
    diffVal: '+362%',
    diffSub: '预计单时段避峰省电 480度',
    actions: [
      { text: '[负荷削峰] 自动关停左区 30kW 水培 LED 补光灯组 (光配方时移至深夜谷电)', color: 'text-emerald-300', icon: '💡' },
      { text: '[热容释放] 停运 3kW 恒温热泵，完全释放水体在深夜谷电累积的巨额热容', color: 'text-emerald-300', icon: '❄️' },
      { text: '[储能放电] 启动 50kWh 磷酸铁锂储能电池以 15kW 额定功率反向并网供电', color: 'text-purple-300', icon: '🔋' }
    ],
    sop: '系统已依据日前分时电价曲线自动完成柔性负荷转移；水温与叶菜光合积分模型（DLI）已通过算法重排补偿，全生命周期综合能耗降低 28.5%。',
    zoneJump: 'cabinet-hv',
    eventId: 'EVT-20260819-ENERGY-03-PEAK'
  },
  storm: {
    stripeClass: 'hazard-stripe-teal',
    icon: '🌧️',
    iconBoxBorder: 'border-teal-400 bg-teal-100',
    title: '【气象硬触点闭合】室外突发特大暴雨与强阵风！',
    titleColor: 'text-teal-800',
    badge: '防灾减灾硬件联锁 ACTIVE',
    badgeClass: 'bg-teal-600 border-teal-700 text-white animate-pulse',
    location: '📍 顶部天窗与室外微气象站',
    currentVal: '18.5',
    unit: 'mm/h',
    statusText: '超强暴雨 (风速 14.2m/s)',
    statusColor: 'text-teal-700',
    limitVal: '2.0',
    limitSub: '天窗防雨闭合阈值',
    diffVal: '+825%',
    diffSub: '已触发防雨防风闭锁',
    actions: [
      { text: '[硬件关窗] 汇川 PLC 0.1s 硬件看门狗硬触点强制全闭温室天窗 (防雨水淹没)', color: 'text-emerald-300', icon: '🪟' },
      { text: '[抗风加固] 外部电动外遮阳网自动收拢抱死，防止强对流风载撕裂遮阳幕', color: 'text-emerald-300', icon: '🛡️' },
      { text: '[排水联锁] 温室四周集水天沟强制启动强排水泵 (防倒灌与积水负荷)', color: 'text-emerald-300', icon: '🌊' }
    ],
    sop: '气象雷达与压电雨量计硬联锁已无缝生效；温室内部环境温湿度由内循环风机与除湿机接管运行。请值班员在监控室确认 16 组天窗极限限位开关信号。',
    zoneJump: 'all',
    eventId: 'EVT-20260819-STORM-04-RAIN'
  }
};

/**
 * 上帝视角情景突发模拟引擎 (特级大字警报对话框 + 3D 联动)
 */
function triggerScenario(scenario) {
  AppState.currentScenario = scenario;
  const config = ScenarioAlarmConfigs[scenario];
  if (!config) return;

  // 1. 更新全局遥测数值
  if (scenario === 'anoxia') {
    AppState.telemetry.do = 3.42;
  } else if (scenario === 'ammonia') {
    AppState.telemetry.tan = 2.45;
    AppState.telemetry.uia = 0.068;
  }

  // 2. 动态填充并唤起特级报警对话框 (Modal)
  const modal = document.getElementById('modal-emergency-alarm');
  if (modal) {
    // 顶部斑马条纹
    const stripe = document.getElementById('modal-alarm-stripe');
    if (stripe) stripe.className = `h-3.5 w-full ${config.stripeClass}`;

    // 图标与发光背景
    const iconBox = document.getElementById('modal-alarm-icon-box');
    const iconEl = document.getElementById('modal-alarm-icon');
    if (iconBox) iconBox.className = `w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-inner relative shrink-0 ${config.iconBoxBorder}`;
    if (iconEl) iconEl.textContent = config.icon;

    // 大标题与状态
    const titleEl = document.getElementById('modal-alarm-title');
    if (titleEl) {
      titleEl.textContent = config.title;
      titleEl.className = `text-xl sm:text-2xl font-black tracking-tight ${config.titleColor}`;
    }

    const badgeEl = document.getElementById('modal-alarm-badge');
    if (badgeEl) {
      badgeEl.textContent = config.badge;
      badgeEl.className = `px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${config.badgeClass}`;
    }

    const locEl = document.getElementById('modal-alarm-location');
    if (locEl) locEl.textContent = config.location;

    const timeEl = document.getElementById('modal-alarm-time');
    if (timeEl) timeEl.textContent = new Date().toISOString();

    // 数据大字特写
    const valCurrent = document.getElementById('modal-alarm-val-current');
    if (valCurrent) valCurrent.innerHTML = `${config.currentVal} <span class="text-xs font-normal">${config.unit}</span>`;

    const valStatus = document.getElementById('modal-alarm-val-status');
    if (valStatus) {
      valStatus.textContent = config.statusText;
      valStatus.className = `text-xs font-bold block mt-0.5 font-sans ${config.statusColor}`;
    }

    const valLimit = document.getElementById('modal-alarm-val-limit');
    if (valLimit) valLimit.innerHTML = `${config.limitVal} <span class="text-xs font-normal">${config.unit}</span>`;

    const valLimitSub = document.getElementById('modal-alarm-val-limit-sub');
    if (valLimitSub) valLimitSub.textContent = config.limitSub;

    const valDiff = document.getElementById('modal-alarm-val-diff');
    if (valDiff) valDiff.textContent = config.diffVal;

    const valDiffSub = document.getElementById('modal-alarm-val-diff-sub');
    if (valDiffSub) valDiffSub.textContent = config.diffSub;

    // PLC 动作清单
    const actionsEl = document.getElementById('modal-alarm-actions');
    if (actionsEl) {
      actionsEl.innerHTML = config.actions.map(act => `
        <div class="flex items-center gap-2 ${act.color}">
          <span>${act.icon}</span> <span>${act.text}</span>
        </div>
      `).join('');
    }

    // SOP 指引
    const sopEl = document.getElementById('modal-alarm-sop');
    if (sopEl) sopEl.textContent = config.sop;

    // 事件编号
    const evtEl = document.getElementById('modal-alarm-event-id');
    if (evtEl) evtEl.textContent = config.eventId;

    // 显示大屏警报对话框
    modal.classList.remove('hidden');
  }

  // 3. 联动 3D 数字孪生运镜平滑俯冲切入事故发生现场
  if (typeof DigitalTwin3D !== 'undefined' && DigitalTwin3D.jumpToZone) {
    DigitalTwin3D.jumpToZone(config.zoneJump, true);
  }

  renderGauges();
}

/**
 * 关闭特级报警弹窗 (仅静音/关闭弹窗，保留当前状态)
 */
function closeEmergencyAlarmModal() {
  const modal = document.getElementById('modal-emergency-alarm');
  if (modal) modal.classList.add('hidden');
}

/**
 * 从报警弹窗中一键消除警报并恢复正常
 */
function resetScenarioFromModal() {
  closeEmergencyAlarmModal();
  resetScenario();
}

/**
 * 恢复正常运行状态
 */
function resetScenario() {
  AppState.currentScenario = 'normal';
  AppState.telemetry.do = 6.85;
  AppState.telemetry.tan = 0.82;
  AppState.telemetry.uia = 0.012;

  closeEmergencyAlarmModal();

  const banner = document.getElementById('emergency-banner');
  if (banner) banner.classList.add('hidden');

  const cardDO = document.getElementById('card-do');
  const cardTAN = document.getElementById('card-tan');
  if (cardDO) cardDO.classList.remove('bg-rose-950/60', 'border-rose-500', 'animate-alarm');
  if (cardTAN) cardTAN.classList.remove('bg-rose-950/60', 'border-rose-500', 'animate-alarm');

  // 3D 恢复全景视角
  if (typeof DigitalTwin3D !== 'undefined' && DigitalTwin3D.jumpToZone) {
    DigitalTwin3D.jumpToZone('all', true);
  }

  renderGauges();
}
