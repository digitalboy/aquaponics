/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * aqua-hydro-view.js: 养殖长指挥台与种植长调度台交互控制器 (Aqua & Hydro View Controller)
 * =========================================================================
 */

const AquaHydroViewController = {
  /**
   * 养殖长工作台：切换选中鱼池
   */
  selectAquaTank(engine, tankId) {
    engine.currentAquaTankId = tankId;
    this.updateAquacultureViewMetrics(engine);
    this.renderAquaTankMatrix(engine);

    // 同步 3D 聚焦
    if (typeof DigitalTwin3D !== 'undefined' && DigitalTwin3D.selectById) {
      DigitalTwin3D.selectById(tankId);
    }
  },

  /**
   * 刷新养殖长视界 DOM 读数
   */
  updateAquacultureViewMetrics(engine) {
    const t = engine.fishTanks[engine.currentAquaTankId];
    if (!t) return;

    // 1. 顶部徽章
    const badgeEl = document.getElementById('aqua-active-tank-badge');
    if (badgeEl) {
      badgeEl.textContent = `当前监测: #${t.index.toString().padStart(2, '0')} ${t.species}`;
    }

    // 2. 4 大指标卡片
    const doEl = document.getElementById('val-do');
    if (doEl) doEl.textContent = t.do.toFixed(2);
    const tanEl = document.getElementById('val-tan');
    if (tanEl) tanEl.textContent = t.tan.toFixed(2);
    const uiaEl = document.getElementById('val-uia');
    if (uiaEl) uiaEl.textContent = t.uia.toFixed(3);
    const phEl = document.getElementById('val-ph');
    if (phEl) phEl.textContent = t.ph.toFixed(2);
    const tempEl = document.getElementById('val-temp');
    if (tempEl) tempEl.textContent = t.waterTemp.toFixed(1);

    // 3. AI 摄像机与生物量卡片
    const camTitleEl = document.getElementById('aqua-cam-title');
    if (camTitleEl) {
      camTitleEl.textContent = `Cam #${t.index.toString().padStart(2, '0')}: #${t.index.toString().padStart(2, '0')}池 (${t.species}) 抢食监测 [1080P/25FPS]`;
    }
    const avgWeightEl = document.getElementById('aqua-avg-weight');
    if (avgWeightEl) avgWeightEl.textContent = t.avgWeightG;
    const biomassEl = document.getElementById('aqua-biomass');
    if (biomassEl) biomassEl.textContent = t.biomassKg.toLocaleString();
    const daysEl = document.getElementById('aqua-days-to-market');
    if (daysEl) daysEl.textContent = Math.max(5, Math.round(35 - (t.avgWeightG / 1000) * 20));
  },

  /**
   * 渲染养殖长视界 10 座鱼池状态选择芯片矩阵
   */
  renderAquaTankMatrix(engine) {
    const container = document.getElementById('aqua-tank-selector-matrix');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= 10; i++) {
      const t = engine.fishTanks[`tank-${i}`];
      if (!t) continue;
      const isSelected = (engine.currentAquaTankId === `tank-${i}`);
      const activeClass = isSelected
        ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
        : 'bg-emerald-50/80 text-emerald-950 hover:bg-emerald-100 border-emerald-200/90';
      
      const doDot = t.do >= 5.0 ? 'bg-emerald-400' : 'bg-rose-500 animate-ping';

      html += `
        <button onclick="DataEngine.selectAquaTank('tank-${i}')" class="p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between cursor-pointer ${activeClass}" title="${t.name}">
          <div class="flex items-center justify-between w-full">
            <span class="font-extrabold text-xs">#${i.toString().padStart(2, '0')}池</span>
            <span class="w-2.5 h-2.5 rounded-full ${doDot}"></span>
          </div>
          <div class="text-[11px] truncate w-full font-sans text-left mt-1 font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-700'}">${t.species}</div>
          <div class="text-xs font-bold font-mono mt-1 w-full text-right ${isSelected ? 'text-white' : 'text-emerald-800'}">${t.do.toFixed(1)} <span class="text-[10px] font-normal opacity-80">mg</span></div>
        </button>
      `;
    }
    container.innerHTML = html;
  },

  /**
   * 种植长调度台：切换选中水培菜池
   */
  selectHydroRaceway(engine, racewayId) {
    engine.currentHydroRacewayId = racewayId;
    this.updateHydroponicsViewMetrics(engine);
    this.renderHydroRacewayMatrix(engine);

    // 同步 3D 聚焦
    if (typeof DigitalTwin3D !== 'undefined' && DigitalTwin3D.selectById) {
      DigitalTwin3D.selectById(racewayId);
    }
  },

  /**
   * 刷新种植长视界 DOM 读数
   */
  updateHydroponicsViewMetrics(engine) {
    const r = engine.raceways[engine.currentHydroRacewayId];
    if (!r) return;

    // 1. 顶部徽章
    const badgeEl = document.getElementById('hydro-active-raceway-badge');
    if (badgeEl) {
      badgeEl.textContent = `当前监测: ${r.name.replace('🥬 ', '')}`;
    }

    // 2. 4 大核心 KPI 卡片读数
    const doEl = document.getElementById('val-hydro-do');
    if (doEl) doEl.textContent = r.rootDO.toFixed(2);

    const vpdEl = document.getElementById('val-hydro-vpd');
    if (vpdEl) vpdEl.textContent = r.vpd.toFixed(2);

    const dliEl = document.getElementById('val-hydro-dli');
    if (dliEl) dliEl.textContent = r.dliToday.toFixed(1);

    const ecEl = document.getElementById('val-hydro-ec');
    if (ecEl) ecEl.textContent = r.ec.toFixed(2);

    const rootTempEl = document.getElementById('val-hydro-root-temp');
    if (rootTempEl) rootTempEl.textContent = r.rootTemp.toFixed(1);

    const ppfdEl = document.getElementById('hydro-ppfd');
    if (ppfdEl) ppfdEl.textContent = `${r.ppfd}`;

    // 3. 立体微气候 L1 冠层温湿度
    const canopyTempEl = document.getElementById('hydro-canopy-temp');
    if (canopyTempEl) canopyTempEl.textContent = (r.rootTemp + 2.3).toFixed(1);
    const canopyRhEl = document.getElementById('hydro-canopy-rh');
    if (canopyRhEl) canopyRhEl.textContent = Math.round(66 + (r.vpd < 0.9 ? 3 : -2));
  },

  /**
   * 渲染种植长视界 4 大水培跑道菜池选择矩阵 (含根区溶氧 DO)
   */
  renderHydroRacewayMatrix(engine) {
    const container = document.getElementById('hydro-raceway-selector-matrix');
    if (!container) return;

    const cropMeta = [
      { key: 'raceway-a', char: 'A', name: '特级奶油生菜', days: 20, stage: '成熟采收期 (95%)' },
      { key: 'raceway-b', char: 'B', name: '罗马脆生菜', days: 14, stage: '旺盛生长期 (66%)' },
      { key: 'raceway-c', char: 'C', name: '无菌罗勒草', days: 8, stage: '幼苗生根期 (38%)' },
      { key: 'raceway-d', char: 'D', name: '嫩叶芝麻菜', days: 3, stage: '缓苗定植期 (10%)' }
    ];

    let html = '';
    cropMeta.forEach(c => {
      const r = engine.raceways[c.key];
      if (!r) return;
      const isSelected = (engine.currentHydroRacewayId === c.key);
      const activeClass = isSelected
        ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
        : 'bg-emerald-50/80 text-emerald-950 hover:bg-emerald-100 border-emerald-200/90';

      html += `
        <button onclick="DataEngine.selectHydroRaceway('${c.key}')" class="p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer space-y-2.5 ${activeClass}">
          <div class="flex items-center justify-between w-full">
            <span class="font-extrabold text-sm flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}"></span>
              #${c.char} 槽 · ${c.name}
            </span>
            <span class="text-xs font-mono font-bold ${isSelected ? 'text-emerald-100' : 'text-emerald-800'}">定植 ${r.growthDays}天</span>
          </div>

          <div class="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <div class="h-full rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}" style="width: ${r.growthPercent}%"></div>
          </div>

          <div class="flex items-center justify-between text-xs font-mono w-full ${isSelected ? 'text-emerald-100' : 'text-slate-700'}">
            <span class="font-bold flex items-center gap-1"><span class="text-[11px]">🫧</span> DO: <strong class="${isSelected ? 'text-white' : 'text-emerald-700'}">${r.rootDO.toFixed(2)}</strong></span>
            <span>VPD: <strong class="${isSelected ? 'text-white' : 'text-slate-900'}">${r.vpd}</strong></span>
            <span class="font-bold ${isSelected ? 'text-white' : 'text-teal-800'}">${r.growthPercent}% 熟</span>
          </div>
        </button>
      `;
    });
    container.innerHTML = html;
  },

  /**
   * 切换当前监测浮板编号 ('B01' ~ 'B04')
   */
  selectRaft(engine, raftId) {
    engine.currentRaftId = raftId;
    ['B01', 'B02', 'B03', 'B04'].forEach(id => {
      const btn = document.getElementById(`btn-raft-${id}`);
      if (btn) {
        if (id === raftId) {
          btn.className = 'px-2.5 py-1 rounded-lg border text-xs cursor-pointer font-extrabold bg-emerald-600 text-white border-emerald-600 shadow-sm';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg border text-xs cursor-pointer font-bold bg-emerald-50 text-emerald-800 border-emerald-200';
        }
      }
    });

    const badge = document.getElementById('hydro-active-raft-badge');
    if (badge) {
      badge.textContent = `当前浮板: #${raftId} (1.2m×0.8m · 24孔微阵列)`;
    }

    this.renderRaftSlotGrid(engine);
  },

  /**
   * 渲染浮板 24 孔位单株微点阵空间健康热力图
   */
  renderRaftSlotGrid(engine) {
    const container = document.getElementById('hydro-raft-slot-grid');
    if (!container) return;

    const slots = engine.raftSlots[engine.currentRaftId] || [];
    let html = '';

    slots.forEach(s => {
      let cardBorder = 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 text-slate-800';
      let dotColor = 'bg-emerald-500';
      let tagText = `${s.weight}g`;

      if (s.status === 'warning') {
        cardBorder = 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 ring-2 ring-amber-400 animate-pulse';
        dotColor = 'bg-amber-500';
        tagText = '🟡 预警';
      } else if (s.status === 'ready') {
        cardBorder = 'border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-950';
        dotColor = 'bg-teal-600';
        tagText = '🔵 待采';
      }

      html += `
        <button onclick="DataEngine.openPlantSlotModal('${s.uid}')" class="p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between space-y-1.5 shadow-sm ${cardBorder}" title="点击调取单株孔位数字档案">
          <div class="flex items-center justify-between w-full">
            <span class="font-extrabold text-xs font-mono text-slate-900">${s.slotCode}</span>
            <span class="w-2.5 h-2.5 rounded-full ${dotColor}"></span>
          </div>

          <div class="flex items-center justify-between text-base">
            <span class="text-xl">🥬</span>
            <span class="font-black font-mono text-slate-900 text-sm">${s.weight}<span class="text-[10px] font-normal text-slate-500">g</span></span>
          </div>

          <div class="flex items-center justify-between text-[11px] font-sans border-t border-slate-200/60 pt-1">
            <span class="text-slate-500 font-mono">${s.canopyCm}cm</span>
            <span class="font-bold font-mono ${s.status === 'warning' ? 'text-amber-700' : 'text-emerald-700'}">${tagText}</span>
          </div>
        </button>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * 打开单株全息数字档案 (Plant Micro-Passport)
   */
  openPlantSlotModal(engine, slotUid) {
    let slotData = null;
    Object.values(engine.raftSlots).forEach(raft => {
      const found = raft.find(s => s.uid === slotUid);
      if (found) slotData = found;
    });

    if (!slotData) return;

    const modal = document.getElementById('modal-plant-passport');
    if (!modal) return;

    const titleEl = document.getElementById('passport-title');
    if (titleEl) titleEl.textContent = `${slotData.cropName} · 单株数字档案`;

    const uidEl = document.getElementById('passport-uid');
    if (uidEl) uidEl.textContent = `UID: ${slotData.uid} (跑道 #${engine.currentHydroRacewayId.replace('raceway-', '').toUpperCase()} · 浮板 #${slotData.raftId} · ${slotData.slotCode})`;

    const badgeEl = document.getElementById('passport-health-badge');
    if (badgeEl) {
      if (slotData.status === 'warning') {
        badgeEl.className = 'px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-white';
        badgeEl.textContent = `${slotData.healthScore}分 早期微斑预警`;
      } else {
        badgeEl.className = 'px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-400/30 text-white border border-white/40';
        badgeEl.textContent = `${slotData.healthScore}分 健康`;
      }
    }

    const weightEl = document.getElementById('passport-weight');
    if (weightEl) weightEl.innerHTML = `${slotData.weight} <span class="text-xs font-normal text-slate-500">g</span>`;

    const targetEl = document.getElementById('passport-weight-target');
    if (targetEl) targetEl.textContent = `目标: 250g (${Math.round((slotData.weight / 250) * 100)}%)`;

    const canopyEl = document.getElementById('passport-canopy');
    if (canopyEl) canopyEl.innerHTML = `${slotData.canopyCm} <span class="text-xs font-normal text-slate-500">cm</span>`;

    const spadEl = document.getElementById('passport-spad');
    if (spadEl) spadEl.textContent = slotData.spad;

    const pestEl = document.getElementById('passport-pest-status');
    if (pestEl) {
      pestEl.textContent = slotData.pestInfo;
      pestEl.className = slotData.status === 'warning' ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold flex items-center gap-1';
    }

    const transEl = document.getElementById('passport-transplant-time');
    if (transEl) transEl.textContent = slotData.transplantDate;

    const harvestEl = document.getElementById('passport-harvest-eta');
    if (harvestEl) harvestEl.textContent = slotData.harvestEta;

    modal.classList.remove('hidden');
  },

  /**
   * 关闭单株全息数字档案
   */
  closePlantPassportModal() {
    const modal = document.getElementById('modal-plant-passport');
    if (modal) modal.classList.add('hidden');
  }
};
