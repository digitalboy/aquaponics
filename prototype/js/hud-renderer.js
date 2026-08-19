/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * hud-renderer.js: 3D 数字孪生多设施全息 HUD 弹窗与快速巡检矩阵渲染器 (HUD Renderer)
 * =========================================================================
 */

const HUDRenderer = {
  setQuickTab(engine, tabKey) {
    engine.activeQuickTab = tabKey;
    this.renderSelectedHUD(engine);
  },

  selectEntity(engine, entityId, entityType, entityName) {
    engine.selectedEntity = {
      id: entityId,
      type: entityType,
      name: entityName
    };

    if (entityId.startsWith('tank-')) {
      engine.activeQuickTab = 'fish';
      engine.currentAquaTankId = entityId;
      if (engine.updateAquacultureViewMetrics) engine.updateAquacultureViewMetrics();
    }
    else if (entityId.startsWith('raceway-')) {
      engine.activeQuickTab = 'raceway';
      engine.currentHydroRacewayId = entityId;
      if (engine.updateHydroponicsViewMetrics) engine.updateHydroponicsViewMetrics();
    }
    else if (entityId.startsWith('nursery-')) engine.activeQuickTab = 'nursery';
    else if (entityId === 'cabinet-hv') engine.activeQuickTab = 'cabinet-hv';
    else if (entityId === 'cabinet-lv') engine.activeQuickTab = 'cabinet-lv';

    this.renderSelectedHUD(engine);
  },

  /**
   * 渲染右侧细密跳动数据大屏
   */
  renderSelectedHUD(engine) {
    const hudContainer = document.getElementById('digital-twin-hud');
    if (!hudContainer) return;

    const { id, type } = engine.selectedEntity;
    const activeTab = engine.activeQuickTab;

    const tabClass = (t) => activeTab === t 
      ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-md shadow-emerald-500/25' 
      : 'bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100 border-emerald-200 font-medium';

    let selectorHeaderHtml = `
      <div class="border-t border-emerald-100 pt-3 space-y-2.5">
        
        <!-- 分类切换药丸按钮 -->
        <div class="flex items-center justify-between gap-1.5 flex-wrap">
          <div class="flex items-center gap-1.5 text-xs font-mono flex-wrap">
            <button onclick="DataEngine.setQuickTab('fish')" class="px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer ${tabClass('fish')}">
              🐟 10座鱼池
            </button>
            <button onclick="DataEngine.setQuickTab('raceway')" class="px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer ${tabClass('raceway')}">
              🥬 4座菜池
            </button>
            <button onclick="DataEngine.setQuickTab('nursery')" class="px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer ${tabClass('nursery')}">
              🌱 12座试验舱
            </button>
            <button onclick="DataEngine.setQuickTab('cabinet-hv')" class="px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer ${tabClass('cabinet-hv')}">
              ⚡ 强电柜
            </button>
            <button onclick="DataEngine.setQuickTab('cabinet-lv')" class="px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer ${tabClass('cabinet-lv')}">
              📡 弱电柜
            </button>
          </div>
          <span class="text-emerald-600 font-mono text-xs hidden xl:inline font-bold">100ms 联动</span>
        </div>

        <!-- 对应分类下的设施快捷网格 -->
    `;

    let selectorBodyHtml = '';

    if (activeTab === 'fish') {
      selectorBodyHtml += `<div class="grid grid-cols-5 gap-2 font-mono text-xs">`;
      for (let i = 1; i <= 10; i++) {
        const t = engine.fishTanks[`tank-${i}`];
        if (!t) continue;
        const isSelected = id === `tank-${i}`;
        const activeClass = isSelected 
          ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-md shadow-emerald-500/30' 
          : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 border-emerald-200';
        selectorBodyHtml += `
          <button onclick="DigitalTwin3D.selectById('tank-${i}')" class="p-2 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${activeClass}" title="${t.name}">
            <span class="font-bold">#${i.toString().padStart(2, '0')}池</span>
            <span class="text-xs font-bold ${isSelected ? 'text-white' : 'text-emerald-600'}">${t.do.toFixed(1)} mg</span>
          </button>
        `;
      }
      selectorBodyHtml += `</div>`;
    } else if (activeTab === 'raceway') {
      selectorBodyHtml += `<div class="grid grid-cols-4 gap-2 font-sans text-xs">`;
      const crops = [
        { key: 'raceway-a', char: 'A', name: '奶油生菜', tag: '95%熟' },
        { key: 'raceway-b', char: 'B', name: '罗马生菜', tag: '66%熟' },
        { key: 'raceway-c', char: 'C', name: '罗勒草', tag: '38%熟' },
        { key: 'raceway-d', char: 'D', name: '芝麻菜', tag: '10%熟' }
      ];
      crops.forEach(c => {
        const r = engine.raceways[c.key];
        if (!r) return;
        const isSelected = id === c.key;
        const activeClass = isSelected 
          ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-md shadow-emerald-500/30' 
          : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 border-emerald-200';
        selectorBodyHtml += `
          <button onclick="DigitalTwin3D.selectById('${c.key}')" class="p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${activeClass}">
            <span class="font-bold text-xs">#${c.char}槽 ${c.name}</span>
            <span class="text-xs font-mono font-bold ${isSelected ? 'text-white' : 'text-emerald-600'}">DO ${r.rootDO} (${c.tag})</span>
          </button>
        `;
      });
      selectorBodyHtml += `</div>`;
    } else if (activeTab === 'nursery') {
      selectorBodyHtml += `<div class="grid grid-cols-6 gap-1.5 font-mono text-xs">`;
      for (let i = 1; i <= 12; i++) {
        const n = engine.nurseryBlocks[`nursery-${i}`];
        if (!n) continue;
        const isSelected = id === `nursery-${i}`;
        const activeClass = isSelected 
          ? 'bg-teal-600 text-white font-extrabold border-teal-600 shadow-md shadow-teal-500/30' 
          : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 border-emerald-200';
        selectorBodyHtml += `
          <button onclick="DigitalTwin3D.selectById('nursery-${i}')" class="p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${activeClass}" title="${n.trialName}">
            <span class="font-bold">#${i.toString().padStart(2, '0')}舱</span>
            <span class="text-xs font-bold ${isSelected ? 'text-white' : 'text-teal-700'}">${n.healthIndex}%</span>
          </button>
        `;
      }
      selectorBodyHtml += `</div>`;
    } else if (activeTab === 'cabinet-hv') {
      const isSelected = id === 'cabinet-hv';
      const activeClass = isSelected 
        ? 'bg-amber-600 text-white font-extrabold border-amber-600 shadow-md' 
        : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 border-emerald-200';
      selectorBodyHtml += `
        <div class="grid grid-cols-1 gap-2 font-mono text-xs">
          <button onclick="DigitalTwin3D.selectById('cabinet-hv')" class="p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${activeClass}">
            <span class="font-bold">⚡ 强电动力配电柜 (380V 三相主动力 / 威胜0.5S智能电表)</span>
            <span class="text-xs font-bold ${isSelected ? 'text-white' : 'text-amber-700'}">有功: ${engine.cabinetHV.totalPowerKw} kW • 电流: ${engine.cabinetHV.currentA} A</span>
          </button>
        </div>
      `;
    } else {
      const isSelected = id === 'cabinet-lv';
      const activeClass = isSelected 
        ? 'bg-teal-600 text-white font-extrabold border-teal-600 shadow-md' 
        : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 border-emerald-200';
      selectorBodyHtml += `
        <div class="grid grid-cols-1 gap-2 font-mono text-xs">
          <button onclick="DigitalTwin3D.selectById('cabinet-lv')" class="p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${activeClass}">
            <span class="font-bold">📡 弱电自动化控制柜 (汇川 Easy320 PLC / 隔离安全栅)</span>
            <span class="text-xs font-bold ${isSelected ? 'text-white' : 'text-teal-700'}">PLC 100ms • 24V DC: ${engine.cabinetLV.dc24Voltage}V</span>
          </button>
        </div>
      `;
    }

    const allFacilitySelectorHtml = selectorHeaderHtml + selectorBodyHtml + `</div>`;

    let htmlContent = '';

    if (type === 'fish-tank' || id.startsWith('tank-')) {
      const tank = engine.fishTanks[id] || engine.fishTanks['tank-1'];
      const doBadgeColor = tank.do >= 5.0 
        ? 'text-emerald-800 bg-emerald-100 border-emerald-300' 
        : 'text-rose-800 bg-rose-100 border-rose-400 animate-pulse';

      htmlContent = `
        <div class="h-full flex flex-col justify-between space-y-3 font-sans text-slate-800">
          
          <div class="border-b border-emerald-100 pb-3 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 class="font-extrabold text-slate-900 text-lg tracking-tight">${tank.name}</h3>
              </div>
              <p class="text-sm text-slate-500 font-mono mt-1">
                Modbus Addr: <strong class="text-emerald-700 font-bold">0x${tank.index.toString(16).padStart(2, '0')}</strong> • 循环流量: <strong class="text-slate-800">${tank.waterFlowLpm} L/min</strong>
              </p>
            </div>
            <span class="px-3 py-1 rounded-xl border font-mono text-sm font-bold ${doBadgeColor}">
              DO: ${tank.do} mg/L
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 font-mono">
            
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <div class="flex justify-between text-xs text-slate-600 font-sans font-bold">
                <span>🫧 溶解氧 (DO)</span>
                <span class="text-xs font-mono font-bold ${tank.deltaDO >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${tank.deltaDO >= 0 ? '▲' : '▼'}${Math.abs(tank.deltaDO).toFixed(2)}</span>
              </div>
              <div class="text-2xl lg:text-3xl font-black text-slate-900">
                ${tank.do.toFixed(2)} <span class="text-sm font-normal text-slate-500">mg/L</span>
              </div>
              <div class="flex justify-between items-center text-xs font-sans border-t border-emerald-100 pt-1.5">
                <span class="text-emerald-700 font-semibold">安全区间 (5.0~8.0)</span>
                <span class="text-slate-500 font-medium">光学荧光法</span>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <div class="flex justify-between text-xs text-slate-600 font-sans font-bold">
                <span>🧪 总氨氮 (TAN)</span>
                <span class="text-xs font-mono font-bold ${tank.deltaTAN >= 0 ? 'text-amber-600' : 'text-emerald-600'}">${tank.deltaTAN >= 0 ? '▲' : '▼'}${Math.abs(tank.deltaTAN).toFixed(2)}</span>
              </div>
              <div class="text-2xl lg:text-3xl font-black text-teal-800">
                ${tank.tan.toFixed(2)} <span class="text-sm font-normal text-slate-500">mg/L</span>
              </div>
              <div class="flex justify-between items-center text-xs font-sans border-t border-emerald-100 pt-1.5">
                <span class="text-emerald-700 font-semibold">安全上限 (&lt;1.50)</span>
                <span class="text-slate-500 font-medium">离子选择电极</span>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <div class="flex justify-between text-xs text-slate-600 font-sans font-bold">
                <span>☣️ 游离有毒氨 (UIA)</span>
                <span class="text-xs text-slate-400 font-mono">pKa=9.24</span>
              </div>
              <div class="text-2xl lg:text-3xl font-black text-cyan-800">
                ${tank.uia.toFixed(3)} <span class="text-sm font-normal text-slate-500">mg/L</span>
              </div>
              <div class="flex justify-between items-center text-xs font-sans border-t border-emerald-100 pt-1.5">
                <span class="text-slate-500">致死红线 0.050</span>
                <span class="text-emerald-700 font-bold">安全受控</span>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <div class="flex justify-between text-xs text-slate-600 font-sans font-bold">
                <span>🌡️ pH 酸碱度 / 水温</span>
                <span class="text-xs text-teal-700 font-sans">旁路流通槽</span>
              </div>
              <div class="text-xl lg:text-2xl font-black text-slate-900 mt-0.5">
                ${tank.ph.toFixed(2)} <span class="text-base text-slate-400">/</span> <span class="text-teal-800">${tank.waterTemp.toFixed(1)}°C</span>
              </div>
              <div class="flex justify-between items-center text-xs font-sans border-t border-emerald-100 pt-1.5">
                <span class="text-slate-600">流速: 0.8 L/min</span>
                <button onclick="openCalibrationModal()" class="text-emerald-700 hover:text-emerald-900 hover:underline font-bold">SOP 标定</button>
              </div>
            </div>

          </div>

          <div class="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-2 text-xs font-sans shadow-sm">
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">🐟 池内总生物量:</span>
              <strong class="text-slate-900 font-mono text-sm">${tank.biomassKg} kg <span class="text-xs font-normal text-slate-500">(均重 ${tank.avgWeightG} g/尾)</span></strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">💨 0.4MPa 气动吹扫倒计时:</span>
              <strong class="text-teal-800 font-mono text-sm">${Math.floor(tank.purgeCountdownSec / 3600)}小时 ${Math.floor((tank.purgeCountdownSec % 3600) / 60)}分 ${tank.purgeCountdownSec % 60}秒</strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">🛡️ 汇川 PLC 0.1s 增氧硬联锁:</span>
              <strong class="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                READY (待命就绪)
              </strong>
            </div>
          </div>

          <!-- 全厂多区设施快捷切换网格 -->
          ${allFacilitySelectorHtml}

        </div>
      `;
    } else if (type === 'raceway' || id.startsWith('raceway-')) {
      const raceway = engine.raceways[id] || engine.raceways['raceway-a'];
      htmlContent = `
        <div class="h-full flex flex-col justify-between space-y-3 font-sans text-slate-800">
          
          <div class="border-b border-emerald-100 pb-3 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 class="font-extrabold text-slate-900 text-lg tracking-tight">${raceway.name}</h3>
              </div>
              <p class="text-sm text-slate-500 font-sans mt-1">深水浮板水培跑道 (280mm) • 21天标准生长周期</p>
            </div>
            <span class="px-3 py-1 rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-100 font-mono text-sm font-bold shadow-sm">
              成熟度: ${raceway.growthPercent}%
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 font-mono">
            
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🧭 饱和蒸汽压差 (VPD)</span>
              <div class="text-2xl lg:text-3xl font-black text-emerald-800">${raceway.vpd} <span class="text-sm font-normal text-slate-500">kPa</span></div>
              <div class="text-xs text-emerald-700 font-sans font-medium border-t border-emerald-100 pt-1.5">
                最适舒适区 (0.8~1.2 kPa)
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🫧 根区溶解氧 (Root DO)</span>
              <div class="text-2xl lg:text-3xl font-black text-teal-800">${raceway.rootDO} <span class="text-sm font-normal text-slate-500">mg/L</span></div>
              <div class="text-xs text-emerald-700 font-sans font-medium border-t border-emerald-100 pt-1.5">
                微孔曝气充氧 (6.0~8.0)
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">☀️ 今日光量子积分 (DLI)</span>
              <div class="text-2xl lg:text-3xl font-black text-amber-700">${raceway.dliToday} <span class="text-sm font-normal text-slate-500">mol/m²/d</span></div>
              <div class="text-xs text-slate-600 font-sans font-medium border-t border-emerald-100 pt-1.5">
                PPFD: ${raceway.ppfd} µmol/m²/s
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🧪 EC 电导率 / 根区水温</span>
              <div class="text-xl lg:text-2xl font-black text-slate-900">${raceway.ec} <span class="text-sm text-slate-400">mS/cm</span> / ${raceway.rootTemp}°C</div>
              <div class="text-xs text-teal-700 font-sans font-medium border-t border-emerald-100 pt-1.5">
                防根腐恒温控制中
              </div>
            </div>

          </div>

          <div class="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-2 text-xs font-sans shadow-sm">
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">📅 定植时间 / 苗龄:</span>
              <strong class="text-slate-900 font-mono text-sm">第 ${raceway.growthDays} 天 / 21 天</strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">💨 槽底微孔曝气/文丘里:</span>
              <strong class="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                微气泡连续充氧 (DO安全受控)
              </strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">🤖 AMR 自动搬运车调度:</span>
              <strong class="text-teal-800 font-bold text-xs">${raceway.amrStatus}</strong>
            </div>
          </div>

          <!-- 全厂多区设施快捷切换网格 -->
          ${allFacilitySelectorHtml}

        </div>
      `;
    } else if (type === 'nursery' || id.startsWith('nursery-')) {
      const nursery = engine.nurseryBlocks[id] || engine.nurseryBlocks['nursery-1'];
      htmlContent = `
        <div class="h-full flex flex-col justify-between space-y-3 font-sans text-slate-800">
          
          <div class="border-b border-emerald-100 pb-3 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-teal-500 animate-ping"></span>
                <h3 class="font-extrabold text-slate-900 text-lg tracking-tight">${nursery.name}</h3>
              </div>
              <p class="text-sm text-emerald-800 font-bold font-sans mt-1">课题: ${nursery.trialName}</p>
            </div>
            <span class="px-3 py-1 rounded-xl border border-teal-300 text-teal-800 bg-teal-100 font-mono text-sm font-bold shadow-sm">
              健康度: ${nursery.healthIndex}%
            </span>
          </div>

          <div class="grid grid-cols-3 gap-3 font-mono">
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">舱内微气候温度</span>
              <div class="text-2xl font-black text-slate-900">${nursery.tempCanopy}°C</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">相对湿度</span>
              <div class="text-2xl font-black text-emerald-800">${nursery.rh}%RH</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">试验光配方</span>
              <div class="text-xs font-bold text-pink-700 mt-2 font-sans">${nursery.ledSpectrum}</div>
            </div>
          </div>

          <div class="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-2 text-xs font-sans shadow-sm">
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">🧪 试验批次编号:</span>
              <strong class="text-slate-900 font-mono text-sm">${nursery.batchNo}</strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">⏱️ 试验周期进行中:</span>
              <strong class="text-teal-700 font-mono text-sm">已持续运行 ${nursery.trialDays} 天 (机理模型采集)</strong>
            </div>
          </div>

          <!-- 全厂多区设施快捷切换网格 -->
          ${allFacilitySelectorHtml}

        </div>
      `;
    } else if (id === 'cabinet-lv' || type === 'cabinet-lv') {
      // 📡 弱电自动化控制柜 HUD
      htmlContent = `
        <div class="h-full flex flex-col justify-between space-y-3 font-sans text-slate-800">
          
          <div class="border-b border-emerald-100 pb-3 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-teal-500 animate-ping"></span>
                <h3 class="font-extrabold text-slate-900 text-lg tracking-tight">📡 弱电自动化控制柜</h3>
              </div>
              <p class="text-sm text-slate-500 font-mono mt-1">${engine.cabinetLV.plcModel}</p>
            </div>
            <span class="px-3 py-1 rounded-xl border border-teal-300 text-teal-800 bg-teal-100 font-mono text-sm font-bold shadow-sm">
              PLC 扫描: ${engine.cabinetLV.plcCycleMs}ms
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 font-mono">
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🔋 24V DC 工业稳压母线</span>
              <div class="text-2xl lg:text-3xl font-black text-teal-800">${engine.cabinetLV.dc24Voltage} <span class="text-sm font-normal text-slate-500">V</span></div>
              <div class="text-xs text-emerald-700 font-sans border-t border-emerald-100 pt-1.5 font-medium">双冗余工业开关电源</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🛡️ 0.1s 增氧硬安全联锁</span>
              <div class="text-lg font-black text-emerald-700 mt-1">硬接线就绪</div>
              <div class="text-xs text-slate-600 font-sans border-t border-emerald-100 pt-1.5 font-medium">PLC 无需软件介入</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🌐 RS-485 Modbus RTU</span>
              <div class="text-xs font-bold text-slate-900 mt-1">${engine.cabinetLV.modbusStatus}</div>
              <div class="text-xs text-emerald-700 font-sans border-t border-emerald-100 pt-1.5 font-medium">波特率: 9600 8-N-1</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🔌 IO 信号点位</span>
              <div class="text-base font-bold text-slate-900 mt-1">${engine.cabinetLV.ioPoints}</div>
              <div class="text-xs text-teal-700 font-sans border-t border-emerald-100 pt-1.5 font-medium">${engine.cabinetLV.barrierStatus}</div>
            </div>
          </div>

          <div class="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-1.5 text-xs font-sans shadow-sm">
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">⚙️ 主控 PLC 状态:</span>
              <strong class="text-emerald-700 font-bold">汇川 Easy320 RUNNING (无报警)</strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">⏱️ 上次传感器自动吹扫:</span>
              <strong class="text-slate-900 font-mono">${engine.cabinetLV.lastPurgeIso}</strong>
            </div>
          </div>

          <!-- 全厂多区设施快捷切换网格 -->
          ${allFacilitySelectorHtml}

        </div>
      `;
    } else {
      // ⚡ 强电动力配电柜 HUD
      htmlContent = `
        <div class="h-full flex flex-col justify-between space-y-3 font-sans text-slate-800">
          
          <div class="border-b border-emerald-100 pb-3 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                <h3 class="font-extrabold text-slate-900 text-lg tracking-tight">⚡ 强电动力配电柜</h3>
              </div>
              <p class="text-sm text-slate-500 font-sans mt-1">380V 三相主动力 • 威胜 DTSD342-P5 (0.5S级)</p>
            </div>
            <span class="px-3 py-1 rounded-xl border border-amber-300 text-amber-800 bg-amber-100 font-mono text-sm font-bold shadow-sm">
              380V 主断路器 ON
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 font-mono">
            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">⚡ 全厂总有功功率</span>
              <div class="text-2xl lg:text-3xl font-black text-amber-700">${engine.cabinetHV.totalPowerKw} <span class="text-sm font-normal text-slate-500">kW</span></div>
              <div class="text-xs text-slate-500 font-sans border-t border-emerald-100 pt-1.5">功率因数: ${engine.cabinetHV.powerFactor}</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">💰 TOU 分时电价</span>
              <div class="text-2xl lg:text-3xl font-black text-purple-700">¥${engine.cabinetHV.touRate} <span class="text-sm font-normal text-slate-500">/度</span></div>
              <div class="text-xs text-slate-600 font-sans font-medium border-t border-emerald-100 pt-1.5">平段负荷调度中</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">📊 A/B/C 三相电压</span>
              <div class="text-lg font-bold text-slate-900 mt-1">${engine.cabinetHV.voltageA}V / ${engine.cabinetHV.voltageB}V / ${engine.cabinetHV.voltageC}V</div>
              <div class="text-xs text-emerald-700 font-sans font-medium border-t border-emerald-100 pt-1.5">三相平衡度: 98.4%</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-sm">
              <span class="text-xs text-slate-600 font-sans font-bold block">🔌 主回路电流</span>
              <div class="text-2xl font-black text-teal-800">${engine.cabinetHV.currentA} <span class="text-sm font-normal text-slate-500">A</span></div>
              <div class="text-xs text-slate-500 font-sans border-t border-emerald-100 pt-1.5">变比: ${engine.cabinetHV.ctRatio} (CT 200/5A)</div>
            </div>
          </div>

          <div class="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-1.5 text-xs font-sans shadow-sm">
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">⚡ 主动力配电回路:</span>
              <strong class="text-slate-900">变频水泵 / 增氧风机 / 热泵机组 / 植物补光</strong>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">📊 电网工频:</span>
              <strong class="text-emerald-700 font-mono">${engine.cabinetHV.freqHz} Hz</strong>
            </div>
          </div>

          <!-- 全厂多区设施快捷切换网格 -->
          ${allFacilitySelectorHtml}

        </div>
      `;
    }

    hudContainer.innerHTML = htmlContent;
  }
};
