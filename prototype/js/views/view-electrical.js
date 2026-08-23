/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 视图 13: ⚡ 全厂电气一次系统图与全要素拓扑 (Electrical SLD & IIoT Viewer)
 * 严格基于 08 规范与 workshop_01_aquaculture_hydroponics_phase1.json 真实数据驱动
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['view-electrical'] = `
    <div id="view-electrical" class="view-panel hidden space-y-6">
      
      <!-- ========================================================================= -->
      <!-- 1. 顶部控制栏: 车间切换器、Zod 规则体检徽章、全厂实时电气总指标 -->
      <!-- ========================================================================= -->
      <div class="glass-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border-l-4 border-amber-500 shadow-sm">
        <div class="flex items-center gap-4 flex-wrap">
          <div>
            <span class="text-xs text-slate-500 font-mono font-medium block">当前车间与电气拓扑模型:</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-lg">⚡</span>
              <select id="electrical-workshop-select" class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 font-extrabold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="WS-01-AQUA-HYDRO">01号车间: 一期鱼菜共生综合车间 (WS-01)</option>
                <option value="WS-02-HATCHERY" disabled>02号车间: 鱼苗孵化车间 (规划中)</option>
                <option value="WS-03-PROCESSING" disabled>03号车间: 净菜冷链加工车间 (规划中)</option>
              </select>
            </div>
          </div>

          <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <!-- 📐 打开独立工程师专用 CAD 工具 -->
          <a href="electrical-cad.html" target="_blank" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer">
            <span>📐</span> 工程师 CAD 图纸工具 (独立新窗口) ➔
          </a>

          <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <!-- 🛡️ Zod 物理规则引擎体检徽章 -->
          <div class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold shadow-inner">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div class="font-extrabold text-slate-900 flex items-center gap-1">
                <span>🛡️ Zod 规则引擎体检:</span>
                <span class="text-emerald-700">100% 规则合规</span>
              </div>
              <span class="text-[11px] text-emerald-800 font-normal">无越级跳闸 • 电机强制D型微断 • 电缆载流量不过载</span>
            </div>
          </div>
        </div>

        <!-- 实时电参计量芯片 (威胜 0.5S 级) -->
        <div class="flex items-center gap-4 bg-slate-900 text-white px-4 py-2 rounded-xl font-mono text-xs shadow-md">
          <div>
            <span class="text-slate-400 block text-[10px]">系统制式</span>
            <span class="font-bold text-amber-400">TN-S 380V/220V</span>
          </div>
          <div class="h-6 w-px bg-slate-700"></div>
          <div>
            <span class="text-slate-400 block text-[10px]">总计算电流</span>
            <span class="font-black text-emerald-400 text-sm">28.2 A</span>
          </div>
          <div class="h-6 w-px bg-slate-700"></div>
          <div>
            <span class="text-slate-400 block text-[10px]">总有功功率</span>
            <span class="font-black text-teal-300 text-sm">18.45 kW</span>
          </div>
          <div class="h-6 w-px bg-slate-700"></div>
          <div>
            <span class="text-slate-400 block text-[10px]">功率因数 PF</span>
            <span class="font-bold text-slate-200">0.962</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 2. 电气一次系统图 (Single-Line Diagram, SLD) 交互式核心画布 -->
      <!-- ========================================================================= -->
      <div class="glass-card rounded-2xl p-6 relative overflow-hidden border border-slate-200 shadow-md">
        
        <!-- 画布标题与图例 -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
          <div>
            <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>📐</span> 电气一次接线系统图 (Single-Line Diagram · SLD)
            </h2>
            <p class="text-xs text-slate-500 mt-0.5 font-mono">
              IEC 60364 / GB 50054 规范标准 • 点击图中任何开关、电缆或变频器可查看右侧数字孪生参数
            </p>
          </div>

          <!-- 图例 -->
          <div class="flex items-center gap-3 text-xs font-mono">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 运行合闸</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span> 备用分闸</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span> 故障报警</span>
            <span class="flex items-center gap-1.5"><span class="w-4 h-1 bg-amber-500"></span> 380V主母线</span>
          </div>
        </div>

        <!-- ⚡ 一次接线拓扑结构 (分级流式布局) -->
        <div class="space-y-8 overflow-x-auto min-w-[900px] py-2">
          
          <!-- ----------------------------------------------------------------- -->
          <!-- 2.1 第一级: 变压器 100kVA + ATS 双电源 + 一级动力总柜 AP-MAIN (160A) -->
          <!-- ----------------------------------------------------------------- -->
          <div class="flex items-center justify-center gap-6">
            
            <!-- 电源进线 -->
            <div onclick="inspectElement('transformer')" class="cursor-pointer p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 transition text-center min-w-[170px] shadow-sm hover:border-amber-500">
              <div class="text-xs text-slate-500 font-mono">10kV市电 / 发电机</div>
              <div class="font-extrabold text-slate-900 text-sm mt-0.5">100kVA 动力变压器</div>
              <div class="text-[11px] text-teal-700 font-mono font-bold mt-1">400V 50Hz • ATS自投</div>
            </div>

            <div class="text-2xl text-slate-400 font-bold">➔</div>

            <!-- AP-MAIN 一级动力总柜卡片 -->
            <div onclick="inspectElement('ap-main')" class="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500 transition text-left min-w-[380px] shadow-md hover:shadow-amber-500/20">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded bg-amber-500 text-white font-mono font-black text-xs">AP-MAIN</span>
                <span class="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 运行中 (合闸)
                </span>
              </div>
              <div class="font-black text-slate-900 text-base mt-2 flex items-center justify-between">
                <span>正泰 NXM-250S/3300 塑壳总闸</span>
                <span class="font-mono text-amber-800 text-sm">160A 3P</span>
              </div>
              <div class="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-amber-200/80 text-[11px] font-mono text-slate-600">
                <div>分断: <strong class="text-slate-900">36kA</strong></div>
                <div>互感器: <strong class="text-slate-900">200/5A</strong></div>
                <div>防雷: <strong class="text-slate-900">40kA T1</strong></div>
              </div>
            </div>

          </div>

          <!-- 380V 主母线排 (金色流光) -->
          <div class="relative py-2">
            <div class="h-2.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full shadow-md shadow-amber-500/30"></div>
            <span class="absolute right-4 -top-3 px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-mono font-bold">
              380V/220V 铜母排 (TMY 3x[40x4]+1x[25x3])
            </span>
          </div>

          <!-- ----------------------------------------------------------------- -->
          <!-- 2.2 第二级: 三大区域动力分箱 (AP-AQUA 养殖 / AP-HYDRO 水培 / AP-CTRL 弱电) -->
          <!-- ----------------------------------------------------------------- -->
          <div class="grid grid-cols-3 gap-6">
            
            <!-- 【箱体 1: AP-AQUA 养殖动力箱 63A】 -->
            <div class="rounded-2xl border-2 border-emerald-400 bg-emerald-50/40 p-4 space-y-4 shadow-sm">
              <div onclick="inspectElement('ap-aqua')" class="cursor-pointer flex items-center justify-between border-b border-emerald-200 pb-2">
                <div>
                  <span class="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-black text-xs">AP-AQUA</span>
                  <h3 class="font-extrabold text-slate-900 text-sm mt-1">二级养殖动力配电箱 (IP65)</h3>
                </div>
                <div class="text-right">
                  <div class="text-xs font-mono font-bold text-slate-900">NXB-63 D63A 3P</div>
                  <div class="text-[10px] text-slate-500 font-mono">YJV 4x16+1x10 (45m)</div>
                </div>
              </div>

              <!-- AP-AQUA 下属回路清单 -->
              <div class="space-y-2.5">
                
                <!-- 回路 1: 1号主循环泵 3.0kW (变频运行) -->
                <div onclick="inspectElement('pump-01')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-emerald-100/80 border border-emerald-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <div>
                      <div class="font-bold text-slate-900">#1 变频主水循环泵</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 D16A 3P • YJV 4x2.5</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-emerald-700 font-extrabold">3.0kW / 6.4A</div>
                    <div class="text-[10px] text-teal-700">汇川 MD290 变频</div>
                  </div>
                </div>

                <!-- 回路 2: 2号主循环泵 3.0kW (运行) -->
                <div onclick="inspectElement('pump-02')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-emerald-100/80 border border-emerald-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <div>
                      <div class="font-bold text-slate-900">#2 变频主水循环泵</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 D16A 3P • YJV 4x2.5</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-emerald-700 font-extrabold">3.0kW / 6.4A</div>
                    <div class="text-[10px] text-emerald-600">正常恒流运行</div>
                  </div>
                </div>

                <!-- 回路 3: 3号备用水泵 3.0kW (分闸备用) -->
                <div onclick="inspectElement('pump-03')" class="cursor-pointer p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 transition flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <div>
                      <div class="font-medium text-slate-600">#3 备用主水循环泵</div>
                      <div class="text-[10px] text-slate-400 font-mono">正泰 D16A 3P • 自动轮换</div>
                    </div>
                  </div>
                  <div class="text-right font-mono text-[11px] text-slate-400">
                    <div>3.0kW (待机)</div>
                    <div class="text-[10px]">PLC 故障自投</div>
                  </div>
                </div>

                <!-- 回路 4: 1号罗茨鼓风机 3.7kW (运行) -->
                <div onclick="inspectElement('blower-01')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-emerald-100/80 border border-emerald-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <div>
                      <div class="font-bold text-slate-900">#1 变频高压罗茨鼓风机</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 D20A 3P • YJV 4x4.0</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-emerald-700 font-extrabold">3.7kW / 7.8A</div>
                    <div class="text-[10px] text-teal-700">纯氧微孔曝气</div>
                  </div>
                </div>

                <!-- 回路 5: 微滤机马达 0.75kW -->
                <div onclick="inspectElement('filter-01')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-emerald-100/80 border border-emerald-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <div>
                      <div class="font-bold text-slate-900">滚筒微滤机旋转马达</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 D6A 3P • YJV 4x1.5</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-slate-800 font-bold">0.75kW / 1.8A</div>
                    <div class="text-[10px] text-slate-500">200目固液分离</div>
                  </div>
                </div>

              </div>
            </div>

            <!-- 【箱体 2: AP-HYDRO 水培动力箱 40A】 -->
            <div class="rounded-2xl border-2 border-teal-400 bg-teal-50/40 p-4 space-y-4 shadow-sm">
              <div onclick="inspectElement('ap-hydro')" class="cursor-pointer flex items-center justify-between border-b border-teal-200 pb-2">
                <div>
                  <span class="px-2 py-0.5 rounded bg-teal-600 text-white font-mono font-black text-xs">AP-HYDRO</span>
                  <h3 class="font-extrabold text-slate-900 text-sm mt-1">二级水培动力配电箱 (IP65)</h3>
                </div>
                <div class="text-right">
                  <div class="text-xs font-mono font-bold text-slate-900">NXB-63 D40A 3P</div>
                  <div class="text-[10px] text-slate-500 font-mono">YJV 4x10+1x6 (65m)</div>
                </div>
              </div>

              <!-- AP-HYDRO 下属回路清单 -->
              <div class="space-y-2.5">
                
                <!-- 回路 1: A跑道射流泵 1.5kW -->
                <div onclick="inspectElement('hydro-pump-a')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-teal-100/80 border border-teal-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                    <div>
                      <div class="font-bold text-slate-900">A跑道深水增氧射流泵</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 D10A 3P • YJV 4x2.5</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-teal-700 font-extrabold">1.5kW / 3.4A</div>
                    <div class="text-[10px] text-slate-500">避峰运行 21h/天</div>
                  </div>
                </div>

                <!-- 回路 2: B跑道射流泵 1.5kW -->
                <div onclick="inspectElement('hydro-pump-b')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-teal-100/80 border border-teal-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                    <div>
                      <div class="font-bold text-slate-900">B跑道深水增氧射流泵</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 D10A 3P • YJV 4x2.5</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-teal-700 font-extrabold">1.5kW / 3.4A</div>
                    <div class="text-[10px] text-slate-500">避峰运行 21h/天</div>
                  </div>
                </div>

                <!-- 回路 3: 调理池加药泵 0.25kW -->
                <div onclick="inspectElement('dosing-pump')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-teal-100/80 border border-teal-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <div>
                      <div class="font-bold text-slate-900">调理池脉冲加药/搅拌泵</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 D6A 3P • YJV 4x1.5</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-slate-800 font-bold">0.25kW / 0.8A</div>
                    <div class="text-[10px] text-purple-700 font-bold">PLC PID脉冲注入</div>
                  </div>
                </div>

              </div>
            </div>

            <!-- 【箱体 3: AP-CTRL 弱电控制与 UPS 保命箱 20A】 -->
            <div class="rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 p-4 space-y-4 shadow-sm">
              <div onclick="inspectElement('ap-ctrl')" class="cursor-pointer flex items-center justify-between border-b border-indigo-200 pb-2">
                <div>
                  <span class="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono font-black text-xs">AP-CTRL</span>
                  <h3 class="font-extrabold text-slate-900 text-sm mt-1">弱电智能化与 UPS 配电 (IP65)</h3>
                </div>
                <div class="text-right">
                  <div class="text-xs font-mono font-bold text-slate-900">NXB-63 C20A 2P</div>
                  <div class="text-[10px] text-slate-500 font-mono">YJV 3x4+1x2.5 (30m)</div>
                </div>
              </div>

              <!-- AP-CTRL 下属回路清单 -->
              <div class="space-y-2.5">
                
                <!-- 回路 1: 1kVA 在线式工控 UPS (保命核心) -->
                <div onclick="inspectElement('ups-unit')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-indigo-100/80 border border-indigo-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    <div>
                      <div class="font-extrabold text-indigo-950">1kVA 在线双变换式工控 UPS</div>
                      <div class="text-[10px] text-slate-500 font-mono">正泰 C16A 2P • RVV 3x2.5</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-indigo-700 font-black">续航 ≥ 5.1 小时</div>
                    <div class="text-[10px] text-slate-500">市电中断 0ms 切换</div>
                  </div>
                </div>

                <!-- 弱电 24V 集中供电 -->
                <div onclick="inspectElement('meanwell-power')" class="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-indigo-100/80 border border-indigo-300 transition flex items-center justify-between text-xs shadow-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <div>
                      <div class="font-bold text-slate-900">明纬导轨电源 DC 24V/5A</div>
                      <div class="text-[10px] text-slate-500 font-mono">NDR-120-24 • 集中供电回路</div>
                    </div>
                  </div>
                  <div class="text-right font-mono">
                    <div class="text-slate-800 font-bold">120W (24V/5A)</div>
                    <div class="text-[10px] text-emerald-700 font-bold">末端压降 0.59V (合规)</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 3. 弱电与工控要素三合一集成卡片: PLC I/O 映射 / RS-485 站号 / 工控网络与接地 -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- 卡片 1: 🤖 汇川 PLC 控制器与 I/O 映射矩阵 -->
        <div class="glass-card rounded-2xl p-5 space-y-3 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span>🤖</span> 汇川 PLC 控制器与 I/O 点位
            </h3>
            <span class="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">192.168.1.10:502</span>
          </div>

          <div class="space-y-2 text-xs font-mono">
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-slate-900">X01 (RAIN-ALARM)</span>
              </div>
              <span class="text-slate-500">气象站雨雪 (0.1s关天窗)</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-slate-900">X04 (FISH-LV01)</span>
              </div>
              <span class="text-slate-500">1号鱼池高低防溢浮球</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-slate-900">X05 (VFD-FAULT)</span>
              </div>
              <span class="text-slate-500">变频器故障常闭反馈</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-slate-900">Y01 (PUMP-RUN)</span>
              </div>
              <span class="text-slate-500">水泵启停中间继电器</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-slate-900">Y02 (VALVE-BLOW)</span>
              </div>
              <span class="text-slate-500">24V DO探头气动吹扫阀</span>
            </div>
          </div>
        </div>

        <!-- 卡片 2: 📶 RS-485 现场总线站号字典 -->
        <div class="glass-card rounded-2xl p-5 space-y-3 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span>📶</span> RS-485 现场总线从站字典
            </h3>
            <span class="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">9600-8-N-1 (120Ω终端)</span>
          </div>

          <div class="space-y-2 text-xs font-mono">
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span class="font-bold text-amber-700">0x01</span>
              <span class="text-slate-800 font-bold">威胜 DTSD342-P5 智能电表</span>
              <span class="text-emerald-700 text-[11px]">1000ms</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span class="font-bold text-teal-700">0x02</span>
              <span class="text-slate-800 font-bold">塞恩在线氨氮/pH/水温三合一</span>
              <span class="text-emerald-700 text-[11px]">2000ms</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span class="font-bold text-emerald-700">0x03</span>
              <span class="text-slate-800 font-bold">深圳国数荧光法 DO 探头</span>
              <span class="text-emerald-700 text-[11px]">500ms</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span class="font-bold text-purple-700">0x04</span>
              <span class="text-slate-800 font-bold">联测调理池双盐桥 pH/EC</span>
              <span class="text-emerald-700 text-[11px]">1000ms</span>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span class="font-bold text-indigo-700">0x11~0x16</span>
              <span class="text-slate-800 font-bold">6根立柱 3D 测温测湿百叶箱</span>
              <span class="text-emerald-700 text-[11px]">5000ms</span>
            </div>
          </div>
        </div>

        <!-- 卡片 3: 💻 边缘工控机、网络与接地防雷 -->
        <div class="glass-card rounded-2xl p-5 space-y-3 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span>🛡️</span> 工控机、PoE 网络与防雷接地
            </h3>
            <span class="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">R ≤ 1.0Ω (实测0.82Ω)</span>
          </div>

          <div class="space-y-2.5 text-xs font-mono">
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900">研华 UNO-2271G-V2 工控机</span>
                <span class="text-emerald-700 font-bold">192.168.1.50</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1 font-sans">无风扇嵌入式 • 运行 5s 宽表聚合与 YOLO11 摄食推理</p>
            </div>

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900">海康 16路 NVR + 10路枪机</span>
                <span class="text-teal-700 font-bold">192.168.1.100~110</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1 font-sans">16口工业 PoE 交换机 (150W预算) • 4TB 酷鹰循环存储</p>
            </div>

            <div class="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-950">联合接地网与总等电位 (MEB)</span>
                <span class="text-emerald-700 font-bold">0.82 Ω (极优)</span>
              </div>
              <p class="text-[11px] text-emerald-800 mt-1 font-sans">三级 SPD (40kA/20kA/10kA) • RVSP 屏蔽层控制柜单端接地</p>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- 4. 右侧全参数数字孪生下钻抽屉 (Device Inspector Modal) -->
    <!-- ========================================================================= -->
    <div id="inspector-drawer" class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl transform translate-x-full transition-transform duration-300 ease-in-out p-6 overflow-y-auto hidden">
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-2">
          <span id="inspect-icon" class="text-2xl">⚡</span>
          <div>
            <h3 id="inspect-title" class="font-black text-slate-900 text-base">元件参数详情</h3>
            <span id="inspect-subtitle" class="text-xs text-slate-500 font-mono">IEC / GB 标准参数</span>
          </div>
        </div>
        <button onclick="closeInspector()" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold">✕ 关闭</button>
      </div>

      <!-- 参数内容容器 -->
      <div id="inspect-content" class="mt-5 space-y-4 text-xs font-mono">
        <!-- 动态注入 -->
      </div>
    </div>
`;

// ============================================================================
// 5. 元件详情字典与交互控制器
// ============================================================================

const ElectricalInspectorData = {
  transformer: {
    icon: '⚡',
    title: '100kVA 动力变压器与 ATS 双电源',
    subtitle: 'TRANSFORMER-ATS-MAIN',
    html: `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
        <div><strong>额定容量:</strong> 100 kVA (装机 44.0kW，负荷率 38.6%)</div>
        <div><strong>电压等级:</strong> 10kV / 0.4kV (50Hz)</div>
        <div><strong>双电源切换 (ATS):</strong> 施耐德/正泰 4P 160A (自投自复 ≤ 15秒)</div>
        <div><strong>备用电源:</strong> 50kW 静音柴油发电机组 (市电中断自动起动)</div>
      </div>
    `
  },
  'ap-main': {
    icon: '🏛️',
    title: '一级动力总柜 AP-MAIN (正泰 160A 塑壳总断路器)',
    subtitle: 'NXM-250S/3300 160A 3P (现场实物规格)',
    html: `
      <div class="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
        <div class="font-bold text-amber-950 text-sm border-b border-amber-200 pb-1">断路器核心电气参数 (GB 14048.2)</div>
        <div><strong>制造品牌:</strong> 正泰 (CHNT)</div>
        <div><strong>产品型号:</strong> NXM-250S/3300 (3极配电型)</div>
        <div><strong>额定电流 ($I_n$):</strong> 160 A (负荷率 38.6%，冗余 2.6倍)</div>
        <div><strong>脱扣特性曲线:</strong> D 型 (电磁瞬时脱扣 $I_i = 10I_n = 1600\\text{A}$)</div>
        <div><strong>额定极限短路分断 ($I_{cu}$):</strong> 36 kA (400V)</div>
        <div><strong>额定绝缘电压 ($U_i$):</strong> 800 V • 冲击耐压: 8 kV</div>
        <div><strong>出线工艺:</strong> LOAD 侧双拼电缆并联出线 (黄/绿/红热缩套管)</div>
        <div><strong>互感器:</strong> 丁本 DBKCT24 (200/5A, 0.5级, P1 朝向电源侧)</div>
        <div><strong>防雷浪涌 (SPD):</strong> 40kA T1 级保护 (残压 ≤ 2.5kV)</div>
      </div>
    `
  },
  'ap-aqua': {
    icon: '🐟',
    title: '二级养殖动力配电箱 AP-AQUA (63A)',
    subtitle: 'SUB-PANEL-AP-AQUA',
    html: `
      <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
        <div class="font-bold text-emerald-950 border-b border-emerald-200 pb-1">进线与主干电缆</div>
        <div><strong>进线断路器:</strong> 正泰 NXB-63 D63A 3P (短路分断 6kA)</div>
        <div><strong>馈线电缆:</strong> YJV 4×16 + 1×10 (长 45米)</div>
        <div><strong>允许持续载流量:</strong> 80 A (大于 63A 开关，安全不过载)</div>
        <div><strong>末端计算压降:</strong> 0.95% (远低于 5.0% 规范红线)</div>
        <div><strong>防护等级:</strong> IP65 (耐高湿氨气腐蚀喷塑柜体)</div>
      </div>
    `
  },
  'pump-01': {
    icon: '🌊',
    title: '#1 变频主水循环泵动力回路',
    subtitle: 'CIRCUIT-WL-AQUA-01 / PUMP-RAS-01',
    html: `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div class="font-bold text-slate-900 border-b border-slate-200 pb-1">电机与断路器匹配</div>
        <div><strong>额定功率 / 电流:</strong> 3.0 kW / 6.4 A (380V 三相)</div>
        <div><strong>选配断路器:</strong> 正泰 NXB-63 D16A 3P (强制 D 型抗启动冲击)</div>
        <div><strong>配电电缆:</strong> YJV 4×2.5 + 1×2.5 (载流量 24A, 压降 0.35%)</div>
        <div><strong>变频驱动器:</strong> 汇川 MD290-037G (3.7kW 变频器)</div>
        <div><strong>端子控制:</strong> DI1 无源干触点启停 • TA/TC 故障报警常闭接 PLC X05</div>
        <div><strong>运行工况:</strong> 24小时连续运转保命 (水动力闭环)</div>
      </div>
    `
  },
  'blower-01': {
    icon: '💨',
    title: '#1 变频高压罗茨鼓风机动力回路',
    subtitle: 'CIRCUIT-WL-AQUA-04 / BLOWER-RAS-01',
    html: `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div><strong>额定功率 / 电流:</strong> 3.7 kW / 7.8 A (380V 三相)</div>
        <div><strong>选配断路器:</strong> 正泰 NXB-63 D20A 3P (D 型脱扣)</div>
        <div><strong>配电电缆:</strong> YJV 4×4.0 + 1×4.0 (载流量 32A, 压降 0.28%)</div>
        <div><strong>用途:</strong> 17座养殖池底部微孔纯氧曝气与 MBBR 填料流化</div>
      </div>
    `
  },
  'ups-unit': {
    icon: '🔋',
    title: '1kVA 在线式工控 UPS 保命电源',
    subtitle: 'UPS-HUB-01 (断电提供 ≥ 5.1 小时续航)',
    html: `
      <div class="p-3 rounded-xl bg-indigo-50 border border-indigo-300 space-y-2">
        <div class="font-bold text-indigo-950 border-b border-indigo-200 pb-1">工控保命核心指标</div>
        <div><strong>额定容量:</strong> 1.0 kVA / 800 W (在线双变换式，0ms 切换)</div>
        <div><strong>蓄电池组:</strong> 24V 20Ah 密闭免维护电池 (有效储能 408 Wh)</div>
        <div><strong>带载清单:</strong> 汇川PLC (15W) + 研华工控机 (20W) + 485传感器 (15W) + 交换机 (30W)</div>
        <div><strong>实测常态功耗:</strong> 80 W</div>
        <div><strong>断电续航时间:</strong> $408 \\times 0.85 \\div 80 = \\mathbf{5.13\\;\\text{小时}}$</div>
      </div>
    `
  }
};

/**
 * 弹出元件参数检查抽屉
 */
function inspectElement(key) {
  const data = ElectricalInspectorData[key] || ElectricalInspectorData['ap-main'];
  const drawer = document.getElementById('inspector-drawer');
  const icon = document.getElementById('inspect-icon');
  const title = document.getElementById('inspect-title');
  const subtitle = document.getElementById('inspect-subtitle');
  const content = document.getElementById('inspect-content');

  if (!drawer || !icon || !title || !subtitle || !content) return;

  icon.textContent = data.icon;
  title.textContent = data.title;
  subtitle.textContent = data.subtitle;
  content.innerHTML = data.html;

  drawer.classList.remove('hidden');
  setTimeout(() => {
    drawer.classList.remove('translate-x-full');
  }, 10);
}

/**
 * 关闭检查抽屉
 */
function closeInspector() {
  const drawer = document.getElementById('inspector-drawer');
  if (!drawer) return;
  drawer.classList.add('translate-x-full');
  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 300);
}

window.inspectElement = inspectElement;
window.closeInspector = closeInspector;
