/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 10: 🧑‍🔬 研发主管科研与学术中台 (R&D Lead Lab & Knowledge Copilot)
 * 作用：模拟研发主管工作台，包含论文检索、历史记录、人机协同工艺推演、12座试验舱状态与全厂异常根因穿透
 * 字体规范：针对中文阅读体验全面优化，严格杜绝低于 12px 的过小字体，确保清晰舒适
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-scientist'] = `
    <!-- ----------------------------------------------------------------------- -->
    <!-- 视图 10: 🧑‍🔬 研发主管科研与学术中台 (R&D Lead Lab) -->
    <!-- ----------------------------------------------------------------------- -->
    <div id="view-scientist" class="view-panel hidden space-y-6">
      
      <!-- 1. 四大核心科研 Hero 大卡 (Scientist Core Metrics) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- 🧬 已发布商业数字配方 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-emerald-300 shadow-md bg-gradient-to-br from-emerald-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">🧬 商业数字种植配方库</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">Release v2.4</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-slate-900 font-mono">18 套</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">/ 覆盖 6 大品类</span>
          </div>
          <p class="text-xs text-emerald-800 font-sans font-semibold">奶油生菜 · 小叶茼蒿 · 羽衣甘蓝 · 加州鲈</p>
        </div>

        <!-- 🧪 12 座独立试验舱运行率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-teal-300 shadow-md bg-gradient-to-br from-teal-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">🧪 12 座科研试验舱状态</span>
            <span class="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold">100% 满负荷中试</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-teal-700 font-mono">12 / 12</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">座独立舱运行中</span>
          </div>
          <p class="text-xs text-teal-800 font-sans font-semibold">3 组多光谱 DOE 正交试验进行中 (Day 14)</p>
        </div>

        <!-- 🌐 作物本体与学术文献中台 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-indigo-300 shadow-md bg-gradient-to-br from-indigo-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">🌐 作物本体与文献知识库</span>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-mono font-bold">Crop Ontology</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-indigo-700 font-mono">4,820 篇</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">顶刊文献 + 320 条本体</span>
          </div>
          <p class="text-xs text-indigo-800 font-sans font-semibold">直连 USDA GRIN / FAO / PubMed 向量库</p>
        </div>

        <!-- 🤖 AI 根因推演与机理拟合率 -->
        <div class="glass-card rounded-2xl p-5 border-2 border-purple-300 shadow-md bg-gradient-to-br from-purple-50/90 to-white space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600 font-bold font-sans">🤖 机理模拟器与 AI 诊断</span>
            <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-mono font-bold">FvCB & Monod</span>
          </div>
          <div class="flex items-baseline gap-2">
            <strong class="text-3xl font-black text-purple-700 font-mono">99.2%</strong>
            <span class="text-xs text-slate-500 font-sans font-medium">拟合优度 R²</span>
          </div>
          <p class="text-xs text-purple-800 font-sans font-semibold">平均异常根因穿透定位耗时 1.8 秒</p>
        </div>

      </div>

      <!-- 2. 核心交互区：智能学术检索栏 + 历史科研记录抽屉 + AI 协同方案推演 -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        <!-- 左侧 8 栏：多源学术检索与 AI 协同工艺推演工作区 -->
        <div class="xl:col-span-8 space-y-6">
          
          <!-- (1) 智能多源学术检索框 (Scholar Search & AI Copilot Input) -->
          <div class="glass-card rounded-3xl p-6 border-2 border-emerald-400/80 shadow-lg bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white space-y-4">
            
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">🧑‍🔬</span>
                <div>
                  <h3 class="font-extrabold text-base tracking-tight text-emerald-300">研发主管科研工作台 · 知识推演中台</h3>
                  <p class="text-xs text-emerald-400/90 font-medium">跨库检索 Crop Ontology、USDA 种质、顶刊机理模型并与 AI 联合生成新工艺</p>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40">
                GraphRAG Grounding Engine
              </span>
            </div>

            <!-- 输入框与操作按钮 -->
            <div class="relative flex items-center">
              <input 
                id="scientist-search-input"
                type="text" 
                value="波士顿奶油生菜 采收前48h 降硝酸盐至800mg以下 红蓝远红光配方"
                placeholder="输入农艺检索词（如：小叶茼蒿 弱光耐受 / 加州鲈 18°C 消化率 / Pythium 根腐病防治）..."
                class="w-full pl-4 pr-36 py-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/50 text-emerald-100 placeholder-slate-400 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition shadow-inner"
              />
              <div class="absolute right-2 flex items-center gap-1.5">
                <button 
                  onclick="ScientistConsole.search()" 
                  class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1">
                  <span>✨</span> AI 推演
                </button>
              </div>
            </div>

            <!-- 快捷学术标签过滤 -->
            <div class="flex flex-wrap items-center gap-2.5 text-xs">
              <span class="text-slate-300 font-bold">快捷本体过滤:</span>
              <button onclick="ScientistConsole.quickFilter('生菜降硝酸盐')" class="px-3 py-1.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/70 transition cursor-pointer font-sans font-semibold">
                🌱 生菜采收前降硝酸盐
              </button>
              <button onclick="ScientistConsole.quickFilter('小叶茼蒿耐低氧')" class="px-3 py-1.5 rounded-xl bg-teal-900/70 hover:bg-teal-800 text-teal-200 border border-teal-600/70 transition cursor-pointer font-sans font-semibold">
                🥬 小叶茼蒿耐低氧极限
              </button>
              <button onclick="ScientistConsole.quickFilter('加州鲈土腥味代谢')" class="px-3 py-1.5 rounded-xl bg-blue-900/70 hover:bg-blue-800 text-blue-200 border border-blue-600/70 transition cursor-pointer font-sans font-semibold">
                🐟 加州鲈土腥味Geosmin消除
              </button>
              <button onclick="ScientistConsole.quickFilter('高VPD顶烧心')" class="px-3 py-1.5 rounded-xl bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-600/70 transition cursor-pointer font-sans font-semibold">
                ⚠️ 高VPD气孔阻抗与顶烧心
              </button>
            </div>

          </div>

          <!-- (2) AI 联合推演工艺方案卡片矩阵 (AI-Generated Process Solutions) -->
          <div class="space-y-4">
            
            <div class="flex items-center justify-between">
              <h4 class="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>💡</span> AI 联合生成的候选工艺方案与机理对比
                <span class="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">3 组方案已完成机理验算</span>
              </h4>
              <span class="text-xs text-slate-500 font-mono font-medium">置信度: 98.6% (基于 4 篇 SCI 顶刊 + 12座试验舱数据)</span>
            </div>

            <!-- 方案 A：特级母婴级降硝增糖工艺 (推荐方案) -->
            <div class="glass-card rounded-2xl p-6 border-2 border-emerald-500 shadow-md bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 space-y-4 relative overflow-hidden">
              <div class="absolute top-0 right-0 px-3.5 py-1.5 rounded-bl-xl bg-emerald-600 text-white font-extrabold text-xs tracking-wider shadow">
                ★ 研发主管推荐 · 极速降硝增糖工艺
              </div>

              <div class="flex items-start justify-between pr-36">
                <div>
                  <h5 class="font-black text-lg text-slate-900 flex items-center gap-2">
                    <span>方案 A:</span> 采收前 48h 红蓝远红三波段连续光照 + 停氮活化硝酸还原酶工艺
                  </h5>
                  <p class="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium">
                    依据 Farquhar 光合模型与 SPS 蔗糖合成酶动力学，通过上调远红光比刺激气孔开放并加速内源硝酸盐转化为氨基酸。
                  </p>
                </div>
              </div>

              <!-- 工艺参数矩阵 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 bg-white/90 p-4 rounded-xl border border-emerald-200 text-xs">
                <div>
                  <span class="text-slate-500 font-medium block">光谱配比 (R:B:FR)</span>
                  <strong class="text-emerald-700 text-base font-black font-mono">4 : 1 : 1.2</strong>
                </div>
                <div>
                  <span class="text-slate-500 font-medium block">目标 PPFD / 光周期</span>
                  <strong class="text-slate-900 text-base font-black font-mono">260 µmol / 16h</strong>
                </div>
                <div>
                  <span class="text-slate-500 font-medium block">预期硝酸盐含量</span>
                  <strong class="text-teal-700 text-base font-black font-mono">620.5 mg/kg (-65%)</strong>
                </div>
                <div>
                  <span class="text-slate-500 font-medium block">预期叶片糖度 Brix</span>
                  <strong class="text-amber-700 text-base font-black font-mono">4.3 °Bx (+35%)</strong>
                </div>
              </div>

              <!-- 文献证据链与下发操作 -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-100">
                <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <span class="font-bold text-slate-700">📚 证据链:</span>
                  <span class="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono text-xs font-semibold">HortScience 2025 (DOI:10.21273)</span>
                  <span class="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-semibold">CropOntology: CO_325:0000042</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <button 
                    onclick="ScientistConsole.applyRecipeToChamber('RECIPE-2026-BUTTERHEAD-SUPREME-V2', 'nursery-1')" 
                    class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5">
                    <span>🚀</span> 一键下发至 12 座试验舱验证
                  </button>
                  <button 
                    onclick="ScientistConsole.exportPdfReport('RECIPE-2026-BUTTERHEAD-SUPREME-V2')" 
                    class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer border border-slate-300 flex items-center gap-1">
                    <span>📄</span> 导出科研配方
                  </button>
                </div>
              </div>
            </div>

            <!-- 方案 B 与 方案 C 备选卡片折叠/对比 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- 方案 B: 经济节能平衡型工艺 -->
              <div class="glass-card rounded-2xl p-5 border border-slate-300 shadow-sm bg-white/95 space-y-3">
                <div class="flex items-center justify-between">
                  <h6 class="font-extrabold text-sm text-slate-900">方案 B: 双波段节能适度降硝工艺</h6>
                  <span class="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-bold">经济节能型</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  保持传统红蓝 3:1 光谱，采收前 24h 仅降低 EC 至 1.0，完全避开尖峰电价补光，综合能耗 0 增量。
                </p>
                <div class="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                  <span class="text-slate-600 font-medium">硝酸盐: <strong class="text-slate-900 font-mono text-sm">1,100 mg/kg</strong></span>
                  <span class="text-slate-600 font-medium">糖度: <strong class="text-slate-900 font-mono text-sm">3.6 °Bx</strong></span>
                  <span class="text-emerald-700 font-bold font-sans">电费节省 ¥0.15/株</span>
                </div>
              </div>

              <!-- 方案 C: 富硒高钙抗逆增强工艺 -->
              <div class="glass-card rounded-2xl p-5 border border-slate-300 shadow-sm bg-white/95 space-y-3">
                <div class="flex items-center justify-between">
                  <h6 class="font-extrabold text-sm text-slate-900">方案 C: 富硒高钙抗逆与耐储增强工艺</h6>
                  <span class="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-mono font-bold">冷链耐储型</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  通过螯合钙+纳米亚硒酸钠脉冲微喷，强化细胞壁果胶硬度（质构硬度提高 35%），货架保鲜期延长 48h。
                </p>
                <div class="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                  <span class="text-slate-600 font-medium">质构硬度: <strong class="text-slate-900 font-mono text-sm">820 g</strong></span>
                  <span class="text-slate-600 font-medium">货架期: <strong class="text-purple-700 font-mono text-sm">120 小时</strong></span>
                  <span class="text-purple-700 font-bold font-sans">适合长途冷链商超</span>
                </div>
              </div>

            </div>

          </div>

          <!-- (3) 交互式参数调优与动态机理敏感度推演滑块 -->
          <div class="glass-card rounded-2xl p-6 border border-emerald-200 shadow-sm bg-white/95 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>🎛️</span> 农艺参数动态敏感度推演模拟器 (FvCB & Stanghellini 实时求解)
              </h4>
              <span class="text-xs text-slate-500 font-sans font-medium">拖动滑块实时求解碳同化与耗电</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- 滑块 1: PPFD 光照强度 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-700 font-bold">补光 PPFD 设定:</span>
                  <span id="slider-ppfd-val" class="font-mono font-black text-sm text-emerald-700">240 µmol/m²/s</span>
                </div>
                <input 
                  type="range" min="100" max="400" value="240" step="10" 
                  oninput="ScientistConsole.updateSimulation()"
                  id="slider-ppfd" 
                  class="w-full accent-emerald-600 cursor-pointer h-2"
                />
                <span class="text-xs text-slate-500 block font-sans font-medium">光饱和点临界: 350 µmol</span>
              </div>

              <!-- 滑块 2: 采收前停氮小时数 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-700 font-bold">采收前停氮干预:</span>
                  <span id="slider-deplete-val" class="font-mono font-black text-sm text-teal-700">48 小时</span>
                </div>
                <input 
                  type="range" min="0" max="72" value="48" step="6" 
                  oninput="ScientistConsole.updateSimulation()"
                  id="slider-deplete" 
                  class="w-full accent-teal-600 cursor-pointer h-2"
                />
                <span class="text-xs text-slate-500 block font-sans font-medium">硝酸还原酶半衰期: 18h</span>
              </div>

              <!-- 滑块 3: 目标电价限额预算 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-700 font-bold">单株允许电费上限:</span>
                  <span id="slider-cost-val" class="font-mono font-black text-sm text-indigo-700">¥ 0.35 / 株</span>
                </div>
                <input 
                  type="range" min="0.10" max="0.80" value="0.35" step="0.05" 
                  oninput="ScientistConsole.updateSimulation()"
                  id="slider-cost" 
                  class="w-full accent-indigo-600 cursor-pointer h-2"
                />
                <span class="text-xs text-slate-500 block font-sans font-medium">商超溢价对冲空间: ¥ 2.50</span>
              </div>
            </div>

            <!-- 动态推演推论总结条 (优化字号与换行，杜绝挤压重叠) -->
            <div id="sim-output-box" class="bg-emerald-50/90 border border-emerald-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-sans shadow-sm">
              <div class="text-emerald-950 font-medium flex items-center gap-2">
                <span class="text-base">📊</span> 
                <span>
                  实时解算结果：预计干物质累积 <strong class="text-slate-900 font-mono font-bold text-sm">14.8g</strong> · 硝酸盐 <strong class="text-teal-700 font-mono font-black text-sm">618 mg/kg</strong> · 糖度 <strong class="text-amber-700 font-mono font-bold text-sm">4.3°Bx</strong> · 单株电耗 <strong class="text-indigo-700 font-mono font-bold text-sm">¥ 0.28</strong>
                </span>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold text-xs shrink-0 shadow-sm border border-emerald-300">
                ✓ 符合母婴级标准
              </span>
            </div>

          </div>

        </div>

        <!-- 右侧 4 栏：历史科研记录抽屉 + 异常根因穿透机理链 -->
        <div class="xl:col-span-4 space-y-6">
          
          <!-- (1) 历史科研检索与工艺推演记录抽屉 (Research History & Pinboard) -->
          <div class="glass-card rounded-2xl p-5 border border-slate-200 shadow-sm bg-white/95 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>🕒</span> 科研检索与方案历史
              </h4>
              <span class="text-xs text-emerald-700 font-mono font-bold">共 5 组记录</span>
            </div>

            <div class="space-y-3">
              
              <!-- 记录 1 -->
              <div onclick="ScientistConsole.loadHistory('波士顿奶油生菜 采收前48h 降硝酸盐至800mg以下')" class="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/90 transition cursor-pointer space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900">🥬 奶油生菜采收前红蓝远红降硝酸盐</span>
                  <span class="text-xs text-slate-500 font-mono">2026-08-18</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-1 font-medium">推演结论：硝酸盐降至 620mg/kg，已下发试验舱 #01~#04</p>
                <div class="flex items-center gap-2 text-xs text-emerald-700 font-medium pt-0.5">
                  <span class="font-bold">★ 命中 4 篇文献</span> • <span class="text-slate-500">状态: 已入库</span>
                </div>
              </div>

              <!-- 记录 2 -->
              <div onclick="ScientistConsole.loadHistory('小叶茼蒿深水水培耐低氧极限与Km吸收动力学')" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900">🌱 小叶茼蒿耐低氧极限与 Km 常数</span>
                  <span class="text-xs text-slate-500 font-mono">2026-08-16</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-1 font-medium">推演结论：最低 DO 容忍线 3.8 mg/L，根温需控制 19~21°C</p>
                <div class="flex items-center gap-2 text-xs text-teal-700 font-medium pt-0.5">
                  <span class="font-bold">★ 命中 3 篇文献</span> • <span class="text-slate-500">状态: 试验舱 #09 中试</span>
                </div>
              </div>

              <!-- 记录 3 -->
              <div onclick="ScientistConsole.loadHistory('加州鲈微纳米气泡土腥味Geosmin消除动力学')" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900">🐟 加州鲈微气泡土腥味消除半衰期</span>
                  <span class="text-xs text-slate-500 font-mono">2026-08-12</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-1 font-medium">推演结论：72h 停食流水吊水使 Geosmin 降解 99.4%</p>
                <div class="flex items-center gap-2 text-xs text-blue-700 font-medium pt-0.5">
                  <span class="font-bold">★ 命中 5 篇文献</span> • <span class="text-slate-500">状态: 量产应用</span>
                </div>
              </div>

              <!-- 记录 4 -->
              <div onclick="ScientistConsole.loadHistory('高温低湿高VPD诱发生理缺钙顶烧心机理')" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900">⚠️ 高 VPD 诱发生理缺钙与顶烧心</span>
                  <span class="text-xs text-slate-500 font-mono">2026-08-08</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-1 font-medium">推演结论：VPD > 1.4 kPa 时启动微雾增湿与夜间混风</p>
                <div class="flex items-center gap-2 text-xs text-amber-700 font-medium pt-0.5">
                  <span class="font-bold">★ 命中 6 篇文献</span> • <span class="text-slate-500">状态: 纳入温控策略</span>
                </div>
              </div>

              <!-- 记录 5 -->
              <div onclick="ScientistConsole.loadHistory('羽衣甘蓝富硒与花青素累积光温联动工艺')" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900">🥬 羽衣甘蓝富硒与花青素累积工艺</span>
                  <span class="text-xs text-slate-500 font-mono">2026-08-03</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-1 font-medium">推演结论：UV-A 脉冲激发查尔酮合成酶，花青素提升 80%</p>
                <div class="flex items-center gap-2 text-xs text-purple-700 font-medium pt-0.5">
                  <span class="font-bold">★ 命中 2 篇文献</span> • <span class="text-slate-500">状态: 试验舱 #05 中试</span>
                </div>
              </div>

            </div>

          </div>

          <!-- (2) 全厂疑难异常根因穿透与因果链诊断 (Anomaly Root-Cause & Causal Chain) -->
          <div class="glass-card rounded-2xl p-5 border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50/50 to-white space-y-4">
            <div class="flex items-center justify-between border-b border-purple-100 pb-3">
              <h4 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>🔍</span> 典型疑难农艺杂症 · 根因因果链穿透
              </h4>
              <span class="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-mono font-bold">AI 根因分析</span>
            </div>

            <!-- 因果推演节点链 -->
            <div class="space-y-3 text-xs leading-relaxed font-sans">
              
              <div class="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span class="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">1</span>
                <div>
                  <strong class="text-slate-900 block text-xs font-bold">表象现象：</strong>
                  <span class="text-slate-600 font-medium">菜池 #B 槽生菜心叶边缘出现微弱干枯焦黑，传统经验误判为细菌性软腐病。</span>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">2</span>
                <div>
                  <strong class="text-slate-900 block text-xs font-bold">时空数据穿透 (过去 72h)：</strong>
                  <span class="text-slate-600 font-medium">调理池 Ca²⁺ 充足 (180mg/L)，但夜间温室 VPD 持续 &lt; 0.3 kPa (湿度 96%)。</span>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">3</span>
                <div>
                  <strong class="text-slate-900 block text-xs font-bold">机理推演定性 (Stanghellini 蒸腾)：</strong>
                  <span class="text-slate-600 font-medium">夜间蒸腾拉力降为 0 ➔ 钙离子无法随木质部汁液运送至心叶生长点 ➔ 局部缺钙顶烧心。</span>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 shadow-sm">
                <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">✓</span>
                <div>
                  <strong class="text-emerald-950 block text-xs font-bold">下发闭环对策 (无需打药)：</strong>
                  <span class="text-emerald-800 font-medium">指令 PLC 开启夜间垂直轴流通风 (风速 0.4m/s) 促进气孔蒸腾，48h 后心叶焦边完全停止扩散。</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- 3. 12 座独立环境科研种植试验舱 (Nursery R&D) 实时矩阵数字看板 (字号与排版全面升级) -->
      <div class="glass-card rounded-2xl p-6 border-2 border-teal-300 shadow-md bg-white/95 space-y-4">
        
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🌱</span>
            <div>
              <h4 class="font-black text-base text-slate-900">12 座科研种植试验舱 (Nursery Chambers) 实时运行矩阵</h4>
              <p class="text-xs text-slate-500 font-medium">每座试验舱独立配置多光谱 LED、蠕动加药泵、高精度 DO/EC/pH 与 3D 视觉点云</p>
            </div>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="flex items-center gap-1 font-bold text-slate-700"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 正常中试 (12)</span>
            <span class="flex items-center gap-1 text-slate-500 pl-2 font-medium">门径状态: Gate 2 (中试验证期)</span>
          </div>
        </div>

        <!-- 12 试验舱网格 (12-Chambers Grid) 自适应排版 -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          
          <!-- 舱 01 -->
          <div onclick="ScientistConsole.showChamberDetail(1)" class="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 hover:border-emerald-600 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #01</span>
              <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-bold">A组 4:1:1.2</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">波士顿奶油生菜</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-emerald-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 14 / 20</strong></div>
              <div class="flex justify-between"><span>硝酸盐:</span> <strong class="text-teal-700 font-mono font-bold">620 mg</strong></div>
              <div class="flex justify-between"><span>糖度:</span> <strong class="text-amber-700 font-mono font-bold">4.3°Bx</strong></div>
            </div>
          </div>

          <!-- 舱 02 -->
          <div onclick="ScientistConsole.showChamberDetail(2)" class="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 hover:border-emerald-600 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #02</span>
              <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-bold">A组 重复1</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">波士顿奶油生菜</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-emerald-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 14 / 20</strong></div>
              <div class="flex justify-between"><span>硝酸盐:</span> <strong class="text-teal-700 font-mono font-bold">615 mg</strong></div>
              <div class="flex justify-between"><span>糖度:</span> <strong class="text-amber-700 font-mono font-bold">4.4°Bx</strong></div>
            </div>
          </div>

          <!-- 舱 03 -->
          <div onclick="ScientistConsole.showChamberDetail(3)" class="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 hover:border-emerald-600 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #03</span>
              <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-bold">A组 重复2</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">波士顿奶油生菜</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-emerald-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 14 / 20</strong></div>
              <div class="flex justify-between"><span>硝酸盐:</span> <strong class="text-teal-700 font-mono font-bold">628 mg</strong></div>
              <div class="flex justify-between"><span>糖度:</span> <strong class="text-amber-700 font-mono font-bold">4.2°Bx</strong></div>
            </div>
          </div>

          <!-- 舱 04 -->
          <div onclick="ScientistConsole.showChamberDetail(4)" class="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 hover:border-emerald-600 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #04</span>
              <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-bold">A组 对照CK</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">波士顿奶油生菜</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-emerald-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 14 / 20</strong></div>
              <div class="flex justify-between"><span>硝酸盐:</span> <strong class="text-slate-700 font-mono font-bold">1,820 mg</strong></div>
              <div class="flex justify-between"><span>糖度:</span> <strong class="text-slate-700 font-mono font-bold">3.2°Bx</strong></div>
            </div>
          </div>

          <!-- 舱 05 -->
          <div onclick="ScientistConsole.showChamberDetail(5)" class="p-4 rounded-2xl bg-purple-50/90 border-2 border-purple-300 hover:border-purple-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #05</span>
              <span class="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-xs font-bold">B组 富硒UV</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">羽衣甘蓝</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-purple-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 18 / 25</strong></div>
              <div class="flex justify-between"><span>花青素:</span> <strong class="text-purple-700 font-mono font-bold">82 mg/g</strong></div>
              <div class="flex justify-between"><span>硬度:</span> <strong class="text-purple-700 font-mono font-bold">850 g</strong></div>
            </div>
          </div>

          <!-- 舱 06 -->
          <div onclick="ScientistConsole.showChamberDetail(6)" class="p-4 rounded-2xl bg-purple-50/90 border-2 border-purple-300 hover:border-purple-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #06</span>
              <span class="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-xs font-bold">B组 重复1</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">羽衣甘蓝</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-purple-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 18 / 25</strong></div>
              <div class="flex justify-between"><span>花青素:</span> <strong class="text-purple-700 font-mono font-bold">80 mg/g</strong></div>
              <div class="flex justify-between"><span>硬度:</span> <strong class="text-purple-700 font-mono font-bold">840 g</strong></div>
            </div>
          </div>

          <!-- 舱 07 -->
          <div onclick="ScientistConsole.showChamberDetail(7)" class="p-4 rounded-2xl bg-purple-50/90 border-2 border-purple-300 hover:border-purple-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #07</span>
              <span class="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-xs font-bold">B组 重复2</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">羽衣甘蓝</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-purple-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 18 / 25</strong></div>
              <div class="flex justify-between"><span>花青素:</span> <strong class="text-purple-700 font-mono font-bold">83 mg/g</strong></div>
              <div class="flex justify-between"><span>硬度:</span> <strong class="text-purple-700 font-mono font-bold">860 g</strong></div>
            </div>
          </div>

          <!-- 舱 08 -->
          <div onclick="ScientistConsole.showChamberDetail(8)" class="p-4 rounded-2xl bg-purple-50/90 border-2 border-purple-300 hover:border-purple-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #08</span>
              <span class="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-xs font-bold">B组 对照CK</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">羽衣甘蓝</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-purple-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 18 / 25</strong></div>
              <div class="flex justify-between"><span>花青素:</span> <strong class="text-slate-700 font-mono font-bold">45 mg/g</strong></div>
              <div class="flex justify-between"><span>硬度:</span> <strong class="text-slate-700 font-mono font-bold">620 g</strong></div>
            </div>
          </div>

          <!-- 舱 09 -->
          <div onclick="ScientistConsole.showChamberDetail(9)" class="p-4 rounded-2xl bg-teal-50/90 border-2 border-teal-300 hover:border-teal-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #09</span>
              <span class="px-2 py-0.5 rounded bg-teal-200 text-teal-900 text-xs font-bold">C组 耐热苗</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">小叶茼蒿</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-teal-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 6 / 25</strong></div>
              <div class="flex justify-between"><span>冠幅扩展:</span> <strong class="text-teal-700 font-mono font-bold">18.5 cm²</strong></div>
              <div class="flex justify-between"><span>成活率:</span> <strong class="text-teal-700 font-mono font-bold">100%</strong></div>
            </div>
          </div>

          <!-- 舱 10 -->
          <div onclick="ScientistConsole.showChamberDetail(10)" class="p-4 rounded-2xl bg-teal-50/90 border-2 border-teal-300 hover:border-teal-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #10</span>
              <span class="px-2 py-0.5 rounded bg-teal-200 text-teal-900 text-xs font-bold">C组 重复1</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">小叶茼蒿</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-teal-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 6 / 25</strong></div>
              <div class="flex justify-between"><span>冠幅扩展:</span> <strong class="text-teal-700 font-mono font-bold">18.2 cm²</strong></div>
              <div class="flex justify-between"><span>成活率:</span> <strong class="text-teal-700 font-mono font-bold">100%</strong></div>
            </div>
          </div>

          <!-- 舱 11 -->
          <div onclick="ScientistConsole.showChamberDetail(11)" class="p-4 rounded-2xl bg-teal-50/90 border-2 border-teal-300 hover:border-teal-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #11</span>
              <span class="px-2 py-0.5 rounded bg-teal-200 text-teal-900 text-xs font-bold">C组 重复2</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">小叶茼蒿</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-teal-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 6 / 25</strong></div>
              <div class="flex justify-between"><span>冠幅扩展:</span> <strong class="text-teal-700 font-mono font-bold">18.8 cm²</strong></div>
              <div class="flex justify-between"><span>成活率:</span> <strong class="text-teal-700 font-mono font-bold">100%</strong></div>
            </div>
          </div>

          <!-- 舱 12 -->
          <div onclick="ScientistConsole.showChamberDetail(12)" class="p-4 rounded-2xl bg-teal-50/90 border-2 border-teal-300 hover:border-teal-500 transition cursor-pointer space-y-2 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="font-black text-sm text-slate-900 font-mono">试验舱 #12</span>
              <span class="px-2 py-0.5 rounded bg-teal-200 text-teal-900 text-xs font-bold">C组 对照CK</span>
            </div>
            <p class="text-xs text-slate-700 font-sans font-bold truncate">小叶茼蒿</p>
            <div class="text-xs font-sans text-slate-600 space-y-1 pt-1 border-t border-teal-200/60">
              <div class="flex justify-between"><span>周期:</span> <strong class="text-slate-900 font-mono">Day 6 / 25</strong></div>
              <div class="flex justify-between"><span>冠幅扩展:</span> <strong class="text-slate-700 font-mono font-bold">14.1 cm²</strong></div>
              <div class="flex justify-between"><span>成活率:</span> <strong class="text-slate-700 font-mono font-bold">96.5%</strong></div>
            </div>
          </div>

        </div>

      </div>

    </div>
`;

/**
 * 研发主管控制台中台前端交互业务对象
 */
window.ScientistConsole = {
  
  // 课题多源数据知识库字典
  ReasoningScenarios: {
    '生菜降硝酸盐': {
      topic: '波士顿奶油生菜 采收前48h 降硝酸盐至800mg以下 红蓝远红光配方',
      academic: [
        '• <strong>Crop Ontology:</strong> CO_325:0000042 (Lactuca Sativa)',
        '• <strong>USDA GRIN:</strong> 种质编号 PI 536834 (高耐光低富集品系)',
        '• <strong>顶刊引文:</strong> HortScience 2025 (4:1.2 远红波段激活 SPS 蔗糖合成酶)'
      ],
      factory: [
        '• <strong>水质:</strong> 水温 19.8°C · DO 6.85 mg/L · pH 6.22 · EC 1.85 mS/cm',
        '• <strong>空气:</strong> 气温 22.4°C · VPD 0.85 kPa · CO₂ 820 ppm · 风速 0.25 m/s',
        '• <strong>化合物:</strong> Ca²⁺ 185 mg/L · NO₃⁻ 42 mg/L · TAN 0.82 mg/L · UIA 0.012'
      ],
      chamber: [
        '• <strong>基准试验:</strong> 舱 #01~#04 连续 14 天光谱验证完成',
        '• <strong>实测成效:</strong> 硝酸盐由 1,820 降至 620.5 mg/kg (降幅 65.9%)',
        '• <strong>理化检测:</strong> 可溶性固形物糖度 4.3 °Bx · 质构硬度 820g'
      ],
      cot: [
        { time: '00.12s', title: 'FvCB 光合方程求解:', text: 'PPFD 260 µmol/m²/s 下净光合速率 Pn = 14.2 µmol CO₂/m²/s，未触及光饱和抑制点 (350 µmol)。' },
        { time: '00.38s', title: 'Stanghellini 蒸腾验算:', text: '当前 VPD 0.85 kPa，气孔阻抗 rs = 142 s/m，维持合理蒸腾拉力，钙离子向生长点正常运输。' },
        { time: '00.65s', title: '硝酸还原酶 (NR) 耗竭动力学:', text: '停氮 48h 激活内源 NR 酶活性，预测硝酸盐指数衰减至 620.5 mg/kg (达母婴级标准)。' }
      ],
      plan1: {
        title: '★ 方案一：研发主管推荐 · 极速降硝增糖工艺',
        tag: '母婴级严选',
        name: '采收前 48h 红蓝远红三波段连续光照 + 调理池停氮活化工艺',
        desc: '通过 R:B:FR = 4:1:1.2 (PPFD 260 µmol) 激发远红光效应与 SPS 蔗糖合成酶，调理池切断外源氮肥，促使内源硝酸盐转化为优质氨基酸。',
        nitrate: '620.5 mg',
        brix: '4.3 °Bx',
        cost: '¥ 0.28',
        recipeId: 'RECIPE-2026-BUTTERHEAD-SUPREME-V2'
      },
      plan2: {
        title: '方案二：经济节能适度降硝工艺 (备选)',
        tag: '符合欧盟标准',
        name: '双波段红蓝 3:1 节能补光 + 采收前 24h 清水适度冲洗',
        desc: '维持传统红蓝 3:1 光谱 (PPFD 180 µmol)，避开电网尖峰电价补光，采收前 24h 仅降低 EC 至 1.0，实现 0 电费增量下的达标采收。',
        nitrate: '1,100 mg',
        brix: '3.6 °Bx',
        cost: '¥ 0.15 节省',
        recipeId: 'RECIPE-2026-BUTTERHEAD-ECO-V1'
      }
    },
    '小叶茼蒿耐低氧': {
      topic: '小叶茼蒿 深水水培耐低氧极限与 Km 养分吸收动力学 根温控制',
      academic: [
        '• <strong>Crop Ontology:</strong> CO_325:0000089 (Chrysanthemum Coronarium)',
        '• <strong>USDA GRIN:</strong> 亚洲耐湿热种质分型库 GS-902',
        '• <strong>顶刊引文:</strong> Ann. Appl. Biol. 2024 (茼蒿根系线粒体细胞色素氧化酶在 DO < 3.5mg/L 活性衰减)'
      ],
      factory: [
        '• <strong>水质:</strong> 水温 20.2°C · 跑道根区 DO 7.10 mg/L · pH 6.35 · EC 1.62 mS/cm',
        '• <strong>空气:</strong> 气温 21.8°C · VPD 0.92 kPa · 光照 DLI 15.4 mol/m²/d',
        '• <strong>化合物:</strong> K⁺ 240 mg/L · Mg²⁺ 45 mg/L · TAN 0.65 mg/L'
      ],
      chamber: [
        '• <strong>基准试验:</strong> 舱 #09~#12 苗期耐热筛选中 (Day 6)',
        '• <strong>生长表型:</strong> 冠幅扩展速率 18.5 cm²/d，成活率 100%',
        '• <strong>抗逆指征:</strong> 根系无褐变、无腐霉菌滋生'
      ],
      cot: [
        { time: '00.15s', title: 'Michaelis-Menten 动力学求解:', text: '解算小叶茼蒿氮磷吸收速率，Km = 0.42 mmol/L，Vmax 在水温 20°C 达到峰值。' },
        { time: '00.42s', title: '根区临界 DO 阈值解算:', text: '解出最低安全 DO 容忍线为 3.8 mg/L，当前工厂水体 7.10 mg/L 留有 86% 安全裕度。' },
        { time: '00.70s', title: '蒸腾气孔响应:', text: '预测在 18.5 cm² 冠幅下全棚日耗水量 3.2 L/m²，调理池补水脉冲已完成时序计算。' }
      ],
      plan1: {
        title: '★ 方案一：高溶氧微气泡恒根温促根壮苗工艺 (推荐)',
        tag: '抗病速生型',
        name: '微纳米气泡超饱和增氧 (DO 7.5mg/L) + 根区恒温 20.0°C 精准调控',
        desc: '保持深水跑道 DO ≥ 7.0 mg/L 激发根系 ATP 合成酶活力，定植期缩短 3 天，单株鲜重提升 22%。',
        nitrate: '850 mg',
        brix: '3.8 °Bx',
        cost: '¥ 0.22',
        recipeId: 'RECIPE-2026-TONGHAO-ROOT-BOOST-V1'
      },
      plan2: {
        title: '方案二：大温差抗逆炼苗与芳香烃富集工艺 (备选)',
        tag: '浓郁风味型',
        name: '昼夜 8°C 大温差 + 采收前 72h 适度轻微水肥胁迫 (EC 1.2)',
        desc: '通过昼夜温差刺激茼蒿精油与萜烯类芳香物质合成，风味浓郁度提升 40%，适合高端火锅连锁商超。',
        nitrate: '780 mg',
        brix: '4.1 °Bx',
        cost: '¥ 0.18',
        recipeId: 'RECIPE-2026-TONGHAO-AROMA-PREMIUM'
      }
    },
    '加州鲈土腥味代谢': {
      topic: '加州鲈 恒温22°C 微纳米气泡水流 几何土味素 Geosmin 消除半衰期',
      academic: [
        '• <strong>FAO Fisheries Tech:</strong> RAS 封闭循环水加州鲈土腥味消除规程 (No.582)',
        '• <strong>PubMed NCBI:</strong> Aquaculture 2024 (Geosmin 与 2-MIB 在无饵流水中逆脂溶扩散代谢)',
        '• <strong>GB 标规范:</strong> 食品安全国家标准 GB 2733 水产感官要求'
      ],
      factory: [
        '• <strong>水质:</strong> 吊水槽水温 21.5°C · 纯氧 DO 8.40 mg/L · pH 7.20 · ORP 340 mV',
        '• <strong>水流循环:</strong> 截面积流速 0.25 m/s 逆流巡游 · 水力停留时间 HRT 45 min',
        '• <strong>化合物:</strong> Geosmin 初始浓度 18.5 ng/kg · 亚硝酸盐 0.02 mg/L'
      ],
      chamber: [
        '• <strong>吊水历史数据:</strong> 连续 80 批次起捕加州鲈 100% 盲测 0 土腥味',
        '• <strong>肌肉品质:</strong> 停食 72h 肌肉硬度从 550g 提升至 820g (脆爽紧致)',
        '• <strong>放行指标:</strong> e-COA 放行合格率 100%'
      ],
      cot: [
        { time: '00.10s', title: '脂溶性逆扩散动力学求解:', text: '解算加州鲈肌肉脂肪中 Geosmin 分子逆浓度梯度扩散速率，半衰期 t1/2 = 14.2 小时。' },
        { time: '00.36s', title: '溶氧与微气泡界面气浮验算:', text: '微纳米气泡破裂释放羟基自由基，加速水体悬浮微量挥发物氧化分解。' },
        { time: '00.62s', title: '代谢终点推演:', text: '停食流水冲洗 72 小时后，肌肉中 Geosmin 预测残留 < 1.2 ng/kg (远低于 10ng/kg 嗅觉阈值)。' }
      ],
      plan1: {
        title: '★ 方案一：72h 微纳米纯氧活水吊水净化工艺 (推荐)',
        tag: '0 土腥味放行',
        name: '停食 72h + 0.25m/s 纯氧逆流水槽冲洗 + 微纳米气泡水质净化',
        desc: '彻底排空消化道残饵，Geosmin 与 2-MIB 土腥味分子代谢归零，肌肉紧致 Q 弹，符合免洗生鲜标准。',
        nitrate: '0 检出',
        brix: '肉硬度 820g',
        cost: '¥ 0.45 / 尾',
        recipeId: 'RECIPE-2026-BASS-PURGE-SUPREME'
      },
      plan2: {
        title: '方案二：48h 极速水力快净工艺 (大宗商超备选)',
        tag: '高效周转',
        name: '48h 停食 + 强化底层排污与冷水井水持续置换',
        desc: '缩短吊水周转周期 24h，失重率从 4.2% 降至 2.5%，适合大宗批发商超快进快出交付。',
        nitrate: '0 检出',
        brix: '肉硬度 740g',
        cost: '¥ 0.28 / 尾',
        recipeId: 'RECIPE-2026-BASS-FAST-PURGE'
      }
    }
  },

  // 1. 模拟执行学术检索与 AI 工艺推演 (唤起 AI 对话框)
  search: function() {
    const input = document.getElementById('scientist-search-input');
    const query = input ? input.value.trim() : '';
    if (!query) {
      alert('请输入农艺学术检索词');
      return;
    }

    // 匹配课题配置
    let key = '生菜降硝酸盐';
    if (query.includes('茼蒿') || query.includes('低氧')) key = '小叶茼蒿耐低氧';
    else if (query.includes('鲈') || query.includes('土腥')) key = '加州鲈土腥味代谢';
    
    const sc = this.ReasoningScenarios[key] || this.ReasoningScenarios['生菜降硝酸盐'];

    // 动态装配模态对话框数据
    const topicEl = document.getElementById('modal-ai-topic');
    if (topicEl) topicEl.textContent = query;

    const acadEl = document.getElementById('modal-ai-source-academic');
    if (acadEl) acadEl.innerHTML = sc.academic.join('');

    const factEl = document.getElementById('modal-ai-source-factory');
    if (factEl) factEl.innerHTML = sc.factory.join('');

    const chamEl = document.getElementById('modal-ai-source-chamber');
    if (chamEl) chamEl.innerHTML = sc.chamber.join('');

    const cotEl = document.getElementById('modal-ai-cot-logs');
    if (cotEl) {
      cotEl.innerHTML = sc.cot.map(item => `
        <div class="flex items-start gap-2">
          <span class="text-emerald-400 font-mono">[${item.time}]</span>
          <span><strong>${item.title}</strong> ${item.text}</span>
        </div>
      `).join('');
    }

    const timeEl = document.getElementById('modal-ai-timestamp');
    if (timeEl) timeEl.textContent = new Date().toISOString();

    // 打开对话框
    const modal = document.getElementById('modal-ai-reasoning');
    if (modal) modal.classList.remove('hidden');

    // 同步更新页面内小条目
    const outputBox = document.getElementById('sim-output-box');
    if (outputBox) {
      outputBox.innerHTML = `
        <div class="text-emerald-950 font-medium flex items-center gap-2">
          <span class="text-base">📊</span> 
          <span>已完成【${query}】多源推演：生成两大建议方案！推荐 ${sc.plan1.title}</span>
        </div>
        <span class="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold text-xs shrink-0 shadow-sm border border-emerald-300">
          ✓ 已弹窗呈现
        </span>
      `;
    }
  },

  // 2. 关闭 AI 推演对话框
  closeReasoningModal: function() {
    const modal = document.getElementById('modal-ai-reasoning');
    if (modal) modal.classList.add('hidden');
  },

  // 3. 从对话框中一键采纳方案
  applyRecipeFromModal: function(recipeId, planTitle) {
    this.closeReasoningModal();
    alert(`【方案采纳并下发成功】\n\n您已采纳：${planTitle}\n配方编号：${recipeId}\n\n• 已将多光谱/水肥调控参数下发至 12 座试验舱！\n• 现场 PLC 脉冲加药泵与补光灯控制器已接收新指令\n• 闭环工单已生成并存证至 Cloudflare D1`);
  },

  // 4. 快捷标签回填与检索
  quickFilter: function(keyword) {
    const input = document.getElementById('scientist-search-input');
    if (input) {
      if (keyword === '生菜降硝酸盐') {
        input.value = '波士顿奶油生菜 采收前48h 降硝酸盐至800mg以下 红蓝远红光配方';
      } else if (keyword === '小叶茼蒿耐低氧') {
        input.value = '小叶茼蒿 深水水培耐低氧极限 Km 养分吸收动力学 根温控制';
      } else if (keyword === '加州鲈土腥味代谢') {
        input.value = '加州鲈 恒温22°C 微纳米气泡水流 几何土味素 Geosmin 消除半衰期';
      } else if (keyword === '高VPD顶烧心') {
        input.value = '大棚高温低湿 VPD > 1.4 kPa 作物气孔阻抗 钙吸收受阻 顶烧心机理';
      }
      this.search();
    }
  },

  // 5. 点击历史记录回填并触发推演
  loadHistory: function(query) {
    const input = document.getElementById('scientist-search-input');
    if (input) {
      input.value = query;
      this.search();
    }
  },

  // 6. 一键下发配方至 12 座试验舱
  applyRecipeToChamber: function(recipeId, chamberId) {
    alert(`【配方下发成功】已将商业科研配方 [${recipeId}] 下发至 12 座独立试验舱控制器！\n\n• 红蓝远红光谱比: 4:1:1.2 (PPFD 260 µmol/m²/s)\n• 调理池停氮活化指令: 已同步 PLC 脉冲加药系统\n• 预计 48 小时后产出母婴级低硝酸盐鲜菜 (实测 < 620.5 mg/kg)`);
  },

  // 7. 导出科研报告 PDF
  exportPdfReport: function(recipeId) {
    alert(`【科研配方报告导出】\n\n已成功生成《${recipeId} 商业化数字种植配方说明书 (v2.4)》\n\n• 包含 Farquhar 光合碳同化模型方程\n• 包含 Stanghellini 蒸腾与气孔阻抗参数矩阵\n• 整合工厂现场实时空气/水质/化合物多物理场遥测\n• 附带北京普析原子吸收/分光光度计盲测化验单 e-COA`);
  },

  // 8. 动态机理敏感度滑块更新推演
  updateSimulation: function() {
    const ppfdEl = document.getElementById('slider-ppfd');
    const depleteEl = document.getElementById('slider-deplete');
    const costEl = document.getElementById('slider-cost');

    const ppfd = ppfdEl ? parseInt(ppfdEl.value) : 240;
    const deplete = depleteEl ? parseInt(depleteEl.value) : 48;
    const maxCost = costEl ? parseFloat(costEl.value) : 0.35;

    const ppfdValEl = document.getElementById('slider-ppfd-val');
    const depleteValEl = document.getElementById('slider-deplete-val');
    const costValEl = document.getElementById('slider-cost-val');

    if (ppfdValEl) ppfdValEl.textContent = `${ppfd} µmol/m²/s`;
    if (depleteValEl) depleteValEl.textContent = `${deplete} 小时`;
    if (costValEl) costValEl.textContent = `¥ ${maxCost.toFixed(2)} / 株`;

    // 动态算式推演
    const brix = (3.2 + (ppfd / 350) * 1.1 + (deplete / 72) * 0.4).toFixed(1);
    const nitrate = Math.round(1800 * Math.exp(-deplete / 26) + 400);
    const cost = ((ppfd / 240) * 0.22 + 0.05).toFixed(2);
    const dm = (12.0 + (ppfd / 240) * 2.8).toFixed(1);

    const outputBox = document.getElementById('sim-output-box');
    if (outputBox) {
      const isCompliant = nitrate <= 800;
      outputBox.innerHTML = `
        <div class="text-emerald-950 font-medium flex items-center gap-2">
          <span class="text-base">📊</span> 
          <span>
            实时解算结果：预计干物质累积 <strong class="text-slate-900 font-mono font-bold text-sm">${dm}g</strong> · 硝酸盐 <strong class="${isCompliant ? 'text-teal-700' : 'text-rose-600'} font-mono font-black text-sm">${nitrate} mg/kg</strong> · 糖度 <strong class="text-amber-700 font-mono font-bold text-sm">${brix}°Bx</strong> · 单株电耗 <strong class="text-indigo-700 font-mono font-bold text-sm">¥ ${cost}</strong>
          </span>
        </div>
        <span class="px-3 py-1 rounded-full ${isCompliant ? 'bg-emerald-200 text-emerald-900 border-emerald-300' : 'bg-rose-200 text-rose-900 border-rose-300'} font-bold text-xs shrink-0 shadow-sm border">
          ${isCompliant ? '✓ 符合母婴级标准' : '⚠️ 硝酸盐超标风险'}
        </span>
      `;
    }
  },

  // 9. 查看单座试验舱详情
  showChamberDetail: function(chamberNum) {
    alert(`【试验舱 #${chamberNum < 10 ? '0' + chamberNum : chamberNum} 独立微环境遥测】\n\n• 当前试验课题: 采收前红蓝远红三波段高糖降硝正交验证\n• 实时水温: 19.8°C | 根区 DO: 6.82 mg/L | EC: 1.28 mS/cm | pH: 6.22\n• 3D 冠幅面积: 485 cm² | SPAD 叶绿素: 42.8\n• 状态: 运行正常，已连续采集 14 天高质量表型数据！`);
  }

};

