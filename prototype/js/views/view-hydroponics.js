/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 3: 🥬 水培种植调度台 (种植长 / 农艺调度)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-hydroponics'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 3: 🥬 水培种植调度台 (种植长) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-hydroponics" class="view-panel hidden space-y-6">
      
      <!-- 4座深水水培跑道菜池在线巡检与批次选择大盘 -->
      <div class="glass-card rounded-2xl p-4 border border-emerald-200 shadow-md space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🥬</span>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                4座深水水培跑道菜池在线巡检调度
                <span id="hydro-active-raceway-badge" class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  当前监测: #A 槽 · 特级奶油生菜
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">点击下方任意水培菜池，即可切换该槽专属 21 天生长成熟度、VPD/DLI 罗盘、根区水温与 AMR 协作臂工单</p>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              全厂水培跑道: 4/4 运行正常
            </span>
          </div>
        </div>

        <!-- 4 个菜池快速选择芯片矩阵 -->
        <div id="hydro-raceway-selector-matrix" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          <!-- 动态由 data-engine.js 实时渲染 -->
        </div>
      </div>

      <!-- 4大水培核心环境与根区水质指标大卡 (与水产养殖指挥台保持一致的高定设计) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div id="card-hydro-do" class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-emerald-500 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🫧</span> 根区溶解氧 (Root DO)
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">光学荧光法 (在线)</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="val-hydro-do" class="text-4xl font-black text-slate-900 font-mono tracking-tight">6.85</span>
            <span class="text-sm text-slate-500 font-mono">mg/L</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>安全区间: 6.0 ~ 8.0</span>
            <span class="text-emerald-700 font-bold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              微孔曝气: 运行中
            </span>
          </div>
        </div>

        <div id="card-hydro-vpd" class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-teal-500">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🧭</span> 饱和蒸汽压差 (VPD)
            </span>
            <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-xs font-bold">真叶面反演</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="val-hydro-vpd" class="text-4xl font-black text-teal-800 font-mono tracking-tight">0.85</span>
            <span class="text-sm text-slate-500 font-mono">kPa</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>最适舒适区: 0.8 ~ 1.2</span>
            <span class="text-teal-700 font-bold">气孔导度正常</span>
          </div>
        </div>

        <div id="card-hydro-dli" class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-amber-500">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>☀️</span> 今日光量子积分 (DLI)
            </span>
            <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-xs font-bold">PAR 量子计</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span id="val-hydro-dli" class="text-4xl font-black text-amber-700 font-mono tracking-tight">16.8</span>
            <span class="text-sm text-slate-500 font-mono">mol/m²/d</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>PPFD: <strong id="hydro-ppfd" class="font-bold">320</strong> µmol/m²/s</span>
            <span class="text-amber-700 font-bold">达标率: 93%</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-emerald-600">
          <div class="flex items-center justify-between text-slate-600 text-xs mb-1">
            <span class="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🧪</span> EC 电导率 / 根区水温
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">四电极流通槽</span>
          </div>
          <div class="flex items-center justify-between mt-2 font-mono">
            <div>
              <span class="text-xs text-slate-500 block font-sans">EC 电导率</span>
              <span class="text-2xl font-black text-slate-900"><span id="val-hydro-ec">1.65</span> <span class="text-xs font-normal text-slate-400">mS/cm</span></span>
            </div>
            <div class="h-8 w-px bg-slate-200"></div>
            <div>
              <span class="text-xs text-slate-500 block font-sans">根区水温</span>
              <span class="text-2xl font-black text-teal-800"><span id="val-hydro-root-temp">20.5</span> <span class="text-xs font-normal text-slate-400">°C</span></span>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-100 pt-2 font-mono">
            <span>调理池加药: 脉冲闭环</span>
            <span class="text-emerald-700 font-bold">恒温防根腐</span>
          </div>
        </div>

      </div>

      <!-- 🛸 室内多光谱无人机自动机巢与定时航测飞控中心 (主力巡检 · 零铺轨) -->
      <div class="glass-card rounded-2xl p-5 border border-teal-200/90 shadow-md space-y-3.5 bg-gradient-to-r from-teal-50/70 via-emerald-50/50 to-cyan-50/40">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl shadow-md shadow-teal-500/20">
              🛸
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                自动机巢定时航测飞控中心 (巡检无人机 Alpha-01)
                <span class="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 font-mono font-bold flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  主力巡检 · 零铺轨
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">搭载 4K RGB 变焦 + 多光谱/FLIR 热红外双光云台，利用 4 点 UWB 无线基站与双目视觉 SLAM 实行 ±2cm 级定时自主巡检</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="DataEngine.triggerDroneLaunch()" id="btn-drone-launch" class="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer transition shadow-md shadow-teal-500/25 flex items-center gap-1.5">
              <span>🚀</span> 立即一键起飞巡检
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          
          <div class="p-3 bg-white/90 rounded-xl border border-teal-100 space-y-1">
            <div class="flex justify-between text-slate-500 font-sans">
              <span>智能机巢状态:</span>
              <span id="drone-dock-status" class="text-emerald-700 font-bold">闭合充电中</span>
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-xl font-black text-slate-900" id="drone-battery">98%</span>
              <span class="text-xs text-teal-600 font-sans">无线接触快充</span>
            </div>
            <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full" style="width: 98%"></div>
            </div>
          </div>

          <div class="p-3 bg-white/90 rounded-xl border border-teal-100 space-y-1">
            <div class="flex justify-between text-slate-500 font-sans">
              <span>定时航测计划:</span>
              <span class="text-teal-700 font-bold">10:00 / 15:00 / 18:00</span>
            </div>
            <div class="text-slate-900 font-bold font-sans text-xs mt-1 truncate">
              下次航测: <span class="text-emerald-700 font-mono font-bold" id="drone-next-flight">10:00 (4K NDVI)</span>
            </div>
            <div class="text-xs text-slate-500 font-sans truncate">航线: #A~#D跑道 + 10鱼池宏观正射</div>
          </div>

          <div class="p-3 bg-white/90 rounded-xl border border-teal-100 space-y-1">
            <div class="flex justify-between text-slate-500 font-sans">
              <span>室内空间定位:</span>
              <span class="text-emerald-700 font-bold">UWB 4点定位基站</span>
            </div>
            <div class="text-slate-900 font-bold font-sans text-xs mt-1">
              悬停精度: <span class="text-teal-700 font-mono font-bold">±1.8 cm</span>
            </div>
            <div class="text-xs text-slate-500 font-sans">光流 SLAM + 避障雷达正常</div>
          </div>

          <div class="p-3 bg-white/90 rounded-xl border border-teal-100 space-y-1">
            <div class="flex justify-between text-slate-500 font-sans">
              <span>上次正射拼图成果:</span>
              <span class="text-teal-700 font-bold font-mono">1,280万像素</span>
            </div>
            <div class="text-slate-900 font-bold font-sans text-xs mt-1">
              全域覆盖率: <span class="text-emerald-700 font-mono font-bold">100% (无死角)</span>
            </div>
            <div class="text-xs text-slate-500 font-sans">已生成 24 孔位单株点云档案</div>
          </div>

        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 8.1米温室大空间立体微气候三层测温感知 -->
        <div class="lg:col-span-5 glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>🌡️</span> 8.1m 立体微气候垂直分层感知
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">6根测温立柱实时消除冷热死区与结露</p>
            </div>
            <span class="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
              垂直温差 ΔT: 2.3°C
            </span>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div class="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                  <span>🌱</span> L1 作物冠层 (1.2m)
                </span>
                <span class="text-slate-500 text-xs font-sans">蔬菜根叶微环境区</span>
              </div>
              <div class="text-right">
                <span class="text-lg font-black text-slate-900"><span id="hydro-canopy-temp">22.8</span>°C</span>
                <span class="text-slate-400">/</span>
                <span class="text-base font-bold text-emerald-700"><span id="hydro-canopy-rh">68</span>%RH</span>
              </div>
            </div>

            <div class="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                  <span>💨</span> L2 中层混风 (3.8m)
                </span>
                <span class="text-slate-500 text-xs font-sans">环流风机对流层 (0.6m/s)</span>
              </div>
              <div class="text-right">
                <span class="text-lg font-black text-teal-800">25.1°C</span>
                <span class="text-slate-400">/</span>
                <span class="text-base font-bold text-teal-600">62%RH</span>
              </div>
            </div>

            <div class="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                  <span>☀️</span> L3 顶脊热滞 (7.5m)
                </span>
                <span class="text-slate-500 text-xs font-sans">天窗自然排热 (开度 45%)</span>
              </div>
              <div class="text-right">
                <span class="text-lg font-black text-amber-700">29.4°C</span>
                <span class="text-slate-400">/</span>
                <span class="text-base font-bold text-amber-600">54%RH</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>🥬</span> 4 大水培区批次成熟度与 AMR 协作臂调度
            </h3>
            <span class="text-xs text-slate-500 font-mono">21 天标准生长周期</span>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div class="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-bold text-slate-900 flex items-center gap-2 text-sm font-sans">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> #A 槽 · 奶油生菜 (定植 20天)
                </span>
                <span class="text-emerald-800 font-bold text-xs">95% 成熟 (明日 08:00 收割)</span>
              </div>
              <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style="width: 95%"></div>
              </div>
              <div class="flex justify-between text-xs text-slate-600 font-sans">
                <span>预估产量: 450 kg (约 1,800 株)</span>
                <span class="text-teal-700 font-bold">派发 AMR 搬运车 #02</span>
              </div>
            </div>

            <div class="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-bold text-slate-800 flex items-center gap-2 text-sm font-sans">
                  <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span> #B 槽 · 罗马生菜 (定植 14天)
                </span>
                <span class="text-teal-800 font-bold text-xs">66% 旺盛生长期</span>
              </div>
              <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div class="bg-teal-600 h-full rounded-full" style="width: 66%"></div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs font-sans">
              <div class="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <span class="text-slate-500 block">#C 槽 · 罗勒 (定植 8天)</span>
                <span class="text-slate-900 font-bold text-sm">38% 幼苗期</span>
              </div>
              <div class="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <span class="text-slate-500 block">#D 槽 · 芝麻菜 (定植 2天)</span>
                <span class="text-slate-900 font-bold text-sm">10% 缓苗期</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 🌱 浮板单孔微点阵空间健康热力图 (一棵一码全息单株追踪) -->
      <div class="glass-card rounded-2xl p-6 border border-emerald-200 shadow-md space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🌱</span>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                浮板单孔微点阵空间健康热力图 (一棵一码全息单株追踪)
                <span id="hydro-active-raft-badge" class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  当前浮板: #B03 (1.2m×0.8m · 24孔微阵列)
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">采用“跑道-浮板-孔位”三级绝对编码 (如 RA-B03-R02C04)，点击下方任意定植孔即可调取 YOLO11 点云表型、鲜重反演与病虫害档案</p>
            </div>
          </div>

          <!-- 浮板选择切换 -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-600 font-sans font-medium">切换浮板:</span>
            <div class="flex items-center gap-1.5 font-mono text-xs">
              <button onclick="DataEngine.selectRaft('B01')" id="btn-raft-B01" class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer font-bold bg-emerald-50 text-emerald-800 border-emerald-200">#B01</button>
              <button onclick="DataEngine.selectRaft('B02')" id="btn-raft-B02" class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer font-bold bg-emerald-50 text-emerald-800 border-emerald-200">#B02</button>
              <button onclick="DataEngine.selectRaft('B03')" id="btn-raft-B03" class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer font-extrabold bg-emerald-600 text-white border-emerald-600 shadow-sm">#B03</button>
              <button onclick="DataEngine.selectRaft('B04')" id="btn-raft-B04" class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer font-bold bg-emerald-50 text-emerald-800 border-emerald-200">#B04</button>
            </div>
          </div>
        </div>

        <!-- 24 孔位网格 (6行 × 4列) -->
        <div id="hydro-raft-slot-grid" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 font-mono text-xs">
          <!-- 动态由 data-engine.js 渲染 -->
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-emerald-100 pt-3 font-sans">
          <div class="flex items-center gap-4 flex-wrap">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> 🟢 健康旺盛生长 (90%+)</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-400"></span> 🟡 早期微斑初筛 (48h拦截)</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-teal-600"></span> 🔵 达标预收割 (≥250g)</span>
          </div>
          <span class="text-slate-500 font-mono">RFID 板载芯片: 13.56MHz • 定植间距: 180×180mm</span>
        </div>
      </div>

    </div>
`;
