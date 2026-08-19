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
        <div class="lg:col-span-7 glass-card rounded-2xl p-4 border border-emerald-200 shadow-lg flex flex-col justify-between space-y-3">
          
          <!-- 纯单行顶栏：左侧标题与右侧室外微气象完全水平对齐 (零折行) -->
          <div class="flex items-center justify-between gap-2 border-b border-emerald-100/80 pb-2">
            
            <!-- 左侧: 极简纯粹主标题 -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-base">🌐</span>
              <h3 class="font-extrabold text-slate-900 text-sm md:text-base tracking-tight">
                3D 数字孪生全景温室工厂
              </h3>
            </div>

            <!-- 右侧: 室外微气象六要素单行胶囊 (与左侧标题严格水平) -->
            <div class="flex items-center gap-1.5 sm:gap-2 bg-emerald-50/90 px-2.5 sm:px-3 py-1 rounded-xl border border-emerald-200 font-mono text-xs shadow-inner backdrop-blur-md shrink-0">
              <div class="flex items-center gap-1 text-slate-800">
                <span class="text-xs">🌤️</span>
                <span class="text-slate-500 font-sans font-bold hidden md:inline">室外气象:</span>
              </div>
              <span id="weather-temp" class="font-black text-slate-900">31.2°C</span>
              <span class="text-slate-300">/</span>
              <span id="weather-rh" class="font-bold text-teal-800">58%RH</span>
              <span class="text-slate-300 hidden sm:inline">|</span>
              <span class="text-slate-500 font-sans hidden lg:inline">辐射:</span>
              <span id="weather-solar" class="font-black text-amber-700 hidden sm:inline">685 W/m²</span>
              <span class="text-slate-300 hidden md:inline">|</span>
              <span id="weather-wind" class="font-bold text-emerald-800 hidden md:inline">3.4m/s 东南</span>
              <span class="text-slate-300 hidden xl:inline">|</span>
              <span id="weather-rain" class="font-bold text-teal-700 hidden xl:inline">0.0mm (无雨)</span>
            </div>

          </div>

          <!-- 3D WebGL Canvas 渲染视口 (释放高度，内部集成悬浮玻璃控制台) -->
          <div id="three-canvas-container" class="relative rounded-xl overflow-hidden border border-emerald-200 flex-1 min-h-[580px]">
            
            <!-- 3D 视口左上角轻量状态芯片 -->
            <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-200 font-sans text-xs text-slate-800 font-bold flex items-center gap-2 shadow-md">
              <span id="live-status-dot" class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span id="three-live-status">🚀 自动巡检中 (3s周期) • 🐟 10座鱼池 (#01 加州鲈鱼成鱼池)</span>
            </div>

            <!-- 3D 视口底部悬浮玻璃态控制台 (严格单行 1 行 Dock，零折行) -->
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-nowrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-emerald-300 shadow-xl max-w-[98%] whitespace-nowrap overflow-x-auto scrollbar-none font-mono text-xs">
              
              <!-- 6 大空间实体快速跳转按钮 (单行紧凑排列) -->
              <button id="btn-zone-all" onclick="DigitalTwin3D.jumpToZone('all')" class="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium cursor-pointer shadow-xs shrink-0">
                🌐 全景
              </button>
              <button id="btn-zone-fish" onclick="DigitalTwin3D.jumpToZone('fish')" class="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold transition shadow-xs cursor-pointer shrink-0">
                🐟 鱼池
              </button>
              <button id="btn-zone-vege" onclick="DigitalTwin3D.jumpToZone('vege')" class="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium cursor-pointer shadow-xs shrink-0">
                🥬 菜池
              </button>
              <button id="btn-zone-nursery" onclick="DigitalTwin3D.jumpToZone('nursery')" class="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium cursor-pointer shadow-xs shrink-0">
                🌱 试验舱
              </button>
              <button id="btn-zone-cabinet-hv" onclick="DigitalTwin3D.jumpToZone('cabinet-hv')" class="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium cursor-pointer shadow-xs shrink-0">
                ⚡ 强电柜
              </button>
              <button id="btn-zone-cabinet-lv" onclick="DigitalTwin3D.jumpToZone('cabinet-lv')" class="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-200 transition font-medium cursor-pointer shadow-xs shrink-0">
                📡 弱电柜
              </button>

              <div class="h-3.5 w-px bg-emerald-300 shrink-0 mx-0.5"></div>

              <!-- 🚀 3 秒自动轮巡科技感控制器 (单行集成) -->
              <div class="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-300 shrink-0">
                <button id="btn-tour-toggle" onclick="DigitalTwin3D.toggleAutoTour()" class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs cursor-pointer text-xs" title="点击暂停或恢复 3 秒自动巡检轮巡">
                  <span id="tour-toggle-icon" class="animate-pulse">⚡</span>
                  <span id="tour-toggle-text">3s 轮巡</span>
                </button>
                <div class="flex items-center gap-1 text-emerald-900 font-bold px-0.5" title="距离下一次自动切换实体剩余时间">
                  <span id="tour-ping-dot" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span id="tour-countdown-text" class="font-mono text-emerald-800 font-black text-xs">3.0s</span>
                </div>
              </div>

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

        <div class="glass-card rounded-2xl p-5 glass-card-hover border-l-4 border-teal-500 flex flex-col justify-between min-h-[155px] space-y-3 bg-gradient-to-br from-teal-50/50 to-white">
          <div class="flex items-center justify-between text-slate-600 text-xs">
            <span class="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">🛡️ 权威质检/母婴级安全</span>
            <span class="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 font-mono text-xs font-bold border border-teal-300">100% e-COA</span>
          </div>
          <div class="text-2xl font-black text-teal-700 font-mono tracking-tight flex items-baseline gap-1.5">
            0 农残 <span class="text-xs text-slate-400">·</span> 0 抗生素
          </div>
          <p class="text-xs text-slate-600 leading-relaxed border-t border-teal-100 pt-2 font-sans">
            硝酸盐 <strong class="text-teal-800 font-mono">620.5 mg/kg</strong> (较欧标降82%) • 维C <strong class="text-purple-700 font-mono">+110%</strong>
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

      <!-- ===================================================================== -->
      <!-- 🔬 驻厂理化与微生物实验室 · 权威质检与食品安全信任背书大屏 (Lab Trust Capsule) -->
      <!-- ===================================================================== -->
      <div class="glass-card rounded-2xl p-6 border-2 border-emerald-300 shadow-lg space-y-5 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50">
        
        <!-- 头部标题栏与互动快捷键 -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/30">
              🔬
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
                驻厂理化与微生物实验室 · 权威质检与食品安全信任背书
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  科研级仪器直连 • 100% 批批检验
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                北京普析双光束分光光度计 + 智云达 62 项农残快速检测仪 + TAS-990 原子吸收仪，每批次产品 100% 自动签发不可篡改 e-COA 电子合格证
              </p>
            </div>
          </div>
          
          <!-- 快捷操作按钮 -->
          <div class="flex items-center gap-2.5">
            <button onclick="DataEngine.openLabReportModal('LOT-20260819-01')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold text-xs cursor-pointer shadow-md shadow-teal-500/20 transition flex items-center gap-1.5 whitespace-nowrap">
              📄 调取最新批次权威检验报告 (e-COA)
            </button>
            <button onclick="document.getElementById('drawer-item-quality')?.click()" class="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5 whitespace-nowrap">
              🔬 进入驻厂实验室工作台 →
            </button>
          </div>
        </div>

        <!-- 4 大核心质检权威对比卡片网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          <!-- 1. 母婴级低硝酸盐 -->
          <div class="p-4 bg-white/95 rounded-2xl border border-teal-200 shadow-xs space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span>🥬</span> 硝酸盐 (紫外可见分光法)
              </span>
              <span class="text-xs px-2 py-0.5 rounded font-mono font-bold bg-teal-100 text-teal-800 border border-teal-300">
                降 82% 欧标
              </span>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="font-mono">
                <span class="text-2xl font-black text-teal-700">620.5</span>
                <span class="text-xs text-slate-500">mg/kg</span>
              </div>
              <div class="text-right text-xs font-mono text-slate-400">
                <div>传统大棚: 3200</div>
                <div>欧盟限值: 4000</div>
              </div>
            </div>
            <div class="p-2 bg-teal-50/70 rounded-xl text-teal-950 text-xs leading-tight">
              <strong>普析 T6-1650E:</strong> 8 联自动旋转池每日标样校正 ($R^2 = 0.9998$)，达母婴辅食级特选标准
            </div>
          </div>

          <!-- 2. 62项农残与抗生素 0 检出 -->
          <div class="p-4 bg-white/95 rounded-2xl border border-emerald-200 shadow-xs space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span>🧪</span> 62项农残与水产抗生素
              </span>
              <span class="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                0 容忍标准
              </span>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="font-mono">
                <span class="text-2xl font-black text-emerald-700">0 检出</span>
                <span class="text-xs text-slate-500">LOD&lt;0.01</span>
              </div>
              <div class="text-right text-xs font-mono text-slate-400">
                <div>孔雀石绿: 0</div>
                <div>氯霉素/呋喃: 0</div>
              </div>
            </div>
            <div class="p-2 bg-emerald-50/70 rounded-xl text-emerald-950 text-xs leading-tight">
              <strong>智云达 ZYD-NP6:</strong> 胆碱酯酶抑制法批批检测；共生闭环下用药即死鱼，生态物理免洗
            </div>
          </div>

          <!-- 3. 超额活性营养与风味 Brix -->
          <div class="p-4 bg-white/95 rounded-2xl border border-purple-200 shadow-xs space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span>💎</span> 维生素 C 与糖度 Brix
              </span>
              <span class="text-xs px-2 py-0.5 rounded font-mono font-bold bg-purple-100 text-purple-800 border border-purple-300">
                超额富集 +110%
              </span>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="font-mono">
                <span class="text-2xl font-black text-purple-700">28.5</span>
                <span class="text-xs text-slate-500">mg • 4.2°Bx</span>
              </div>
              <div class="text-right text-xs font-mono text-slate-400">
                <div>传统生菜: 13.5mg</div>
                <div>传统糖度: 2.8°Bx</div>
              </div>
            </div>
            <div class="p-2 bg-purple-50/70 rounded-xl text-purple-950 text-xs leading-tight">
              <strong>HPLC & PAL-1:</strong> 采收前 48h 连续红蓝光谱增糖，多酚与活性维C富集，口感清脆甘甜
            </div>
          </div>

          <!-- 4. 重金属极微与活鱼 0 土腥味 -->
          <div class="p-4 bg-white/95 rounded-2xl border border-indigo-200 shadow-xs space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span>🐟</span> 重金属极微 / 0 土腥味
              </span>
              <span class="text-xs px-2 py-0.5 rounded font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                降 98% 国标
              </span>
            </div>
            <div class="flex items-baseline justify-between">
              <div class="font-mono">
                <span class="text-2xl font-black text-indigo-700">&lt;0.001</span>
                <span class="text-xs text-slate-500">mg/kg (Pb/Cd)</span>
              </div>
              <div class="text-right text-xs font-mono text-slate-400">
                <div>国标上限: 0.10</div>
                <div>土腥味: 0 ng/kg</div>
              </div>
            </div>
            <div class="p-2 bg-indigo-50/70 rounded-xl text-indigo-950 text-xs leading-tight">
              <strong>普析 TAS-990:</strong> 原子吸收石墨炉测定；成鱼经 72h 微纳米活水吊水排毒，肉质紧实 Q 弹
            </div>
          </div>

        </div>

        <!-- 底部电子防伪验证条 -->
        <div class="p-3 bg-slate-900 text-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-slate-400">最新 e-COA 证书存证:</span>
            <strong class="text-emerald-300">eCOA-20260819-ROM01-8849</strong>
          </div>
          <div class="text-slate-400 truncate max-w-md hidden sm:block">
            SHA-256: <span class="text-slate-300 select-all">0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</span>
          </div>
          <div class="flex items-center gap-2 text-emerald-400 font-sans font-bold">
            <span>🛡️ 数字私钥签名 (王工 · 003)</span>
            <span class="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-xs">大客户扫码直验</span>
          </div>
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
                  <td class="py-3.5 px-3.5 font-bold text-slate-900">🥗 农药抗生素与母婴级硝酸盐</td>
                  <td class="py-3.5 px-3.5 text-slate-500">易有化学农残; 硝酸盐 3200 mg/kg</td>
                  <td class="py-3.5 px-3.5 font-black text-emerald-700 bg-emerald-50 font-mono">0 检出 • 硝酸盐 620.5 (降82%)</td>
                  <td class="py-3.5 px-3.5 text-slate-800">免洗即食, 维C+110%, 溢价300%</td>
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
