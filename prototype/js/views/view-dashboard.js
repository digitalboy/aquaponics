/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 1: 🏛️ 战略成果与政府/投资人作战大屏 (白玉生机绿)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-investor'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 1: 🏛️ 战略成果与政府/投资人作战大屏 (白玉生机绿) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-investor" class="view-panel space-y-8">
      
      <!-- ===================================================================== -->
      <!-- 🌟 左右对齐分栏布局：左侧 3D 数字孪生全景视界 + 右侧多维细密跳动数据大屏 -->
      <!-- ===================================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- 左侧: 3D 数字孪生全景视口 (占用 7 列) -->
        <div class="lg:col-span-7 glass-card rounded-2xl p-5 border border-emerald-200 shadow-lg flex flex-col justify-between space-y-4">
          
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3">
            
            <!-- 左侧: 标题与 3D 快速空间跳跃导航按钮 -->
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🌐</span>
                <div>
                  <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    3D 数字孪生全景温室工厂
                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                      左区48m × 右区116m × 高8.1m
                    </span>
                  </h3>
                </div>
              </div>

              <!-- 3D 快速空间跳跃导航按钮 -->
              <div class="flex items-center gap-1.5 bg-emerald-50/80 p-1.5 rounded-xl border border-emerald-200 font-mono text-xs">
                <button onclick="DigitalTwin3D.jumpToZone('all')" class="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold transition shadow-sm">
                  🌐 全景
                </button>
                <button onclick="DigitalTwin3D.jumpToZone('fish')" class="px-3 py-1 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium">
                  🐟 10座鱼池
                </button>
                <button onclick="DigitalTwin3D.jumpToZone('vege')" class="px-3 py-1 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium">
                  🥬 4座菜池
                </button>
                <button onclick="DigitalTwin3D.jumpToZone('nursery')" class="px-3 py-1 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium">
                  🌱 12座试验舱
                </button>
                <button onclick="DigitalTwin3D.jumpToZone('cabinet-hv')" class="px-3 py-1 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium">
                  ⚡ 强电柜
                </button>
                <button onclick="DigitalTwin3D.jumpToZone('cabinet-lv')" class="px-3 py-1 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium">
                  📡 弱电柜
                </button>
              </div>
            </div>

            <!-- 右侧红框区: 🌤️ 室外微气象六要素实时遥测站 -->
            <div class="flex items-center gap-2.5 bg-emerald-50/90 px-3.5 py-1.5 rounded-xl border border-emerald-300 font-mono text-xs shadow-inner backdrop-blur-md">
              <div class="flex items-center gap-1 text-slate-800">
                <span class="text-sm">🌤️</span>
                <span class="text-slate-500 font-sans font-bold hidden sm:inline">室外气象:</span>
              </div>

              <!-- 气温与湿度 -->
              <div class="flex items-center gap-1 text-slate-800" title="室外气温 / 相对湿度">
                <span id="weather-temp" class="font-black text-slate-900">31.2°C</span>
                <span class="text-slate-400">/</span>
                <span id="weather-rh" class="font-bold text-teal-800">58%RH</span>
              </div>

              <div class="h-3.5 w-px bg-emerald-300"></div>

              <!-- 总辐射 -->
              <div class="flex items-center gap-1 text-slate-800" title="太阳总辐射">
                <span class="text-slate-500 font-sans hidden md:inline">辐射:</span>
                <span id="weather-solar" class="font-black text-amber-700">685 W/m²</span>
              </div>

              <div class="h-3.5 w-px bg-emerald-300"></div>

              <!-- 风速与风向 -->
              <div class="flex items-center gap-1 text-slate-800" title="室外风速与风向">
                <span class="text-slate-500 font-sans hidden md:inline">风速:</span>
                <span id="weather-wind" class="font-bold text-emerald-800">3.4m/s 东南</span>
              </div>

              <div class="h-3.5 w-px bg-emerald-300"></div>

              <!-- 压电雨量 -->
              <div class="flex items-center gap-1 text-slate-800" title="压电雨量计与天窗防雨联锁">
                <span class="text-slate-500 font-sans hidden lg:inline">雨量:</span>
                <span id="weather-rain" class="font-bold text-teal-700">0.0mm (无雨)</span>
              </div>
            </div>

          </div>

          <!-- 3D WebGL Canvas 渲染视口 (高度 640px) -->
          <div id="three-canvas-container" class="relative rounded-xl overflow-hidden border border-emerald-200 flex-1">
            <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-300 font-sans text-xs text-emerald-900 font-bold flex items-center gap-2 shadow-sm">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>WebGL 60FPS • 🖱️ 拖拽旋转 / 点击鱼池菜池运镜聚焦</span>
            </div>
          </div>

        </div>

        <!-- 右侧: 细密高频跳动实时数据大屏 (占用 5 列) -->
        <div class="lg:col-span-5 right-data-panel rounded-2xl p-6 border border-emerald-200 shadow-lg flex flex-col justify-between overflow-y-auto">
          <div id="digital-twin-hud">
            <!-- 由 data-engine.js 实时细密跳动渲染 -->
          </div>
        </div>

      </div>

      <!-- ===================================================================== -->
      <!-- Top 5 Strategic KPI Hero Cards (白玉生机绿主题卡片) -->
      <!-- ===================================================================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        
        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-emerald-500 flex flex-col justify-between min-h-[155px] space-y-3">
          <div class="flex items-center justify-between text-slate-600 text-xs">
            <span class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">💧 循环节水效益</span>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-300">节水 95.2%</span>
          </div>
          <div class="text-3xl font-black text-slate-900 font-mono tracking-tight">
            12,850 <span class="text-xs font-sans text-slate-500 font-normal">吨/年</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed border-t border-emerald-100 pt-2.5">
            养殖水经硝化 100% 回用于蔬菜吸收，无任何污水外排
          </p>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-teal-500 flex flex-col justify-between min-h-[155px] space-y-3">
          <div class="flex items-center justify-between text-slate-600 text-xs">
            <span class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">🛡️ 零化学农药/抗生素</span>
            <span class="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 font-mono text-xs font-bold border border-teal-300">100% 合格</span>
          </div>
          <div class="text-3xl font-black text-teal-700 font-mono tracking-tight">
            0 <span class="text-xs font-sans text-slate-500 font-normal">检出</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed border-t border-emerald-100 pt-2.5">
            共生闭环下用药即死鱼，生态倒逼实现纯净免洗高品质
          </p>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-emerald-600 flex flex-col justify-between min-h-[155px] space-y-3">
          <div class="flex items-center justify-between text-slate-600 text-xs">
            <span class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">📈 土地坪效提升</span>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-300">提升 8.3 倍</span>
          </div>
          <div class="text-3xl font-black text-emerald-700 font-mono tracking-tight">
            68.5 <span class="text-xs font-sans text-slate-500 font-normal">kg/m²/年</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed border-t border-emerald-100 pt-2.5">
            传统土耕仅 8.2 kg/m²，立体光热微气候实现 21 天成熟
          </p>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-amber-500 flex flex-col justify-between min-h-[155px] space-y-3">
          <div class="flex items-center justify-between text-slate-600 text-xs">
            <span class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">💰 动态内部收益率 (IRR)</span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-mono text-xs font-bold border border-amber-300">回收期 14 个月</span>
          </div>
          <div class="text-3xl font-black text-amber-700 font-mono tracking-tight">
            285% <span class="text-xs font-sans text-slate-500 font-normal">动态ROI</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed border-t border-emerald-100 pt-2.5">
            较传统农业提升资产回报率 3 倍，标准化数字工厂极速复制
          </p>
        </div>

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-teal-600 flex flex-col justify-between min-h-[155px] space-y-3">
          <div class="flex items-center justify-between text-slate-600 text-xs">
            <span class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">🌱 MPC 绿色减碳量</span>
            <span class="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 font-mono text-xs font-bold border border-teal-300">低碳认证</span>
          </div>
          <div class="text-3xl font-black text-teal-700 font-mono tracking-tight">
            142.5 <span class="text-xs font-sans text-slate-500 font-normal">kg CO₂e</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed border-t border-emerald-100 pt-2.5">
            基于水体热容进行深夜谷电蓄热，单批生菜碳足迹降 34%
          </p>
        </div>

      </div>

      <!-- 对比表与时序数据终端 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- 对比表 -->
        <div class="lg:col-span-7 glass-card rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>⚖️</span> 传统农业 vs 鱼菜共生数字化工厂（6 大核心维度对标）
            </h3>
            <span class="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">权威实测数据</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs md:text-sm border-collapse font-sans">
              <thead>
                <tr class="border-b border-emerald-200 text-slate-600 font-bold">
                  <th class="py-3 px-3.5">对比评估维度</th>
                  <th class="py-3 px-3.5">传统大棚/土耕农业</th>
                  <th class="py-3 px-3.5 text-emerald-900 bg-emerald-50 rounded-t font-bold">鱼菜共生数字工业化工厂</th>
                  <th class="py-3 px-3.5">经济/社会价值</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-emerald-100 text-slate-700">
                <tr class="hover:bg-emerald-50/50">
                  <td class="py-3.5 px-3.5 font-bold text-slate-900">💧 每公斤蔬菜水耗</td>
                  <td class="py-3.5 px-3.5 text-slate-500">约 200 ~ 250 升</td>
                  <td class="py-3.5 px-3.5 font-black text-emerald-700 bg-emerald-50 font-mono">10 ~ 12 升 (降 95%)</td>
                  <td class="py-3.5 px-3.5 text-slate-800">节水抗旱，契约级环保</td>
                </tr>
                <tr class="hover:bg-emerald-50/50">
                  <td class="py-3.5 px-3.5 font-bold text-slate-900">🥗 农药抗生素残留</td>
                  <td class="py-3.5 px-3.5 text-slate-500">依赖化学喷洒，易超标</td>
                  <td class="py-3.5 px-3.5 font-black text-emerald-700 bg-emerald-50 font-mono">0 检出 (物理隔绝)</td>
                  <td class="py-3.5 px-3.5 text-slate-800">免洗即食，溢价空间大</td>
                </tr>
                <tr class="hover:bg-emerald-50/50">
                  <td class="py-3.5 px-3.5 font-bold text-slate-900">📊 单平米年产量 (坪效)</td>
                  <td class="py-3.5 px-3.5 text-slate-500">约 8 ~ 10 kg/m²</td>
                  <td class="py-3.5 px-3.5 font-black text-emerald-700 bg-emerald-50 font-mono">60 ~ 75 kg/m² (提升8倍)</td>
                  <td class="py-3.5 px-3.5 text-slate-800">集约化高产，节约耕地</td>
                </tr>
                <tr class="hover:bg-emerald-50/50">
                  <td class="py-3.5 px-3.5 font-bold text-slate-900">👨‍🌾 人均管理产能 (人效)</td>
                  <td class="py-3.5 px-3.5 text-slate-500">1 人管理约 2 亩地</td>
                  <td class="py-3.5 px-3.5 font-black text-emerald-700 bg-emerald-50 font-mono">1 人管理 30 亩 (提升15倍)</td>
                  <td class="py-3.5 px-3.5 text-slate-800">摆脱对高薪稀缺师傅依赖</td>
                </tr>
                <tr class="hover:bg-emerald-50/50">
                  <td class="py-3.5 px-3.5 font-bold text-slate-900">🚚 恶劣天气保供能力</td>
                  <td class="py-3.5 px-3.5 text-slate-500">看天吃饭，严寒暴雨停产</td>
                  <td class="py-3.5 px-3.5 font-black text-emerald-700 bg-emerald-50 font-mono">30天精准 ATP 期货保供</td>
                  <td class="py-3.5 px-3.5 text-slate-800">大型连锁商超刚需标的</td>
                </tr>
                <tr class="hover:bg-emerald-50/50">
                  <td class="py-3.5 px-3.5 font-bold text-slate-900">🏗️ 标准化可复制性与回收期</td>
                  <td class="py-3.5 px-3.5 text-slate-500">重资产高门槛，回收期 &gt; 5 年</td>
                  <td class="py-3.5 px-3.5 font-black text-emerald-700 bg-emerald-50 font-mono">14 个月极速回收 (高回报)</td>
                  <td class="py-3.5 px-3.5 text-slate-800">轻资产极速规模化复制</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 时序终端 -->
        <div class="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>🔬</span> 底层真实时序数据流（ISO 8601 可审计）
              </h3>
              <span class="text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                CRC16 Valid
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-2">
              所有遥测数据由汇川 PLC 与工控机每 5 秒聚合打包，打上毫秒级统一身份证，杜绝造假：
            </p>
          </div>

          <div class="bg-emerald-950/95 text-emerald-300 rounded-xl p-3.5 border border-emerald-800 font-mono text-xs h-64 overflow-y-auto space-y-1 select-text shadow-inner" id="telemetry-log">
            <!-- 动态日志 -->
          </div>

          <div class="grid grid-cols-2 gap-2.5 text-xs text-slate-700 font-sans">
            <div class="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>光学荧光溶氧分析仪 (316L)</span>
            </div>
            <div class="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>在线离子选择总氨氮分析仪</span>
            </div>
            <div class="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>0.5S 级高精度智能电能表</span>
            </div>
            <div class="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>热浸锌双层保温钢构温室</span>
            </div>
          </div>
        </div>

      </div>

      <!-- 现金流对冲模型图 -->
      <div class="glass-card rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div>
            <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>💳</span> 集团跨周期快慢资产现金流对冲模型 (Financial Cash Flow Hedge)
            </h3>
            <p class="text-xs text-slate-500 mt-1">30 天高频蔬菜即时回款垫付对冲 12 个月长周期高蛋白鱼类饲料（OPEX），实现全年平滑正现金流</p>
          </div>
          <span class="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
            无断流敞口
          </span>
        </div>
        <div class="h-64 w-full">
          <canvas id="chart-cashflow"></canvas>
        </div>
      </div>

    </div>
`;
