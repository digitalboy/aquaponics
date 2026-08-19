/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * 全局模态框组件 (SOP 标定弹窗 & 电子质检证明书 & 单株全息数字档案)
 * =========================================================================
 */
window.ViewTemplates = window.ViewTemplates || {};
window.ViewTemplates['modals'] = `
  <!-- ========================================================================= -->
  <!-- 4. 模态框组件 (SOP 标定弹窗 & 电子质检证明书) -->
  <!-- ========================================================================= -->

  <!-- Modal 1: 氨氮传感器双周标定 SOP 交互弹窗 -->
  <div id="modal-calibration" class="hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="glass-card rounded-2xl p-6 max-w-lg w-full space-y-4 border border-emerald-300 shadow-2xl">
      <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
        <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <span>🧪</span> 塞恩 SN-3003 在线氨氮双周两点标定 SOP
        </h3>
        <button onclick="closeCalibrationModal()" class="text-slate-500 hover:text-slate-900 text-lg">✕</button>
      </div>

      <div class="space-y-3 text-xs text-slate-700 font-sans">
        <div class="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 space-y-1">
          <span class="text-emerald-800 font-bold">步骤 1: 10 ppm 点标定</span>
          <p class="text-slate-600">将探头置入 10.0 mg/L 标准液，静置 15 分钟稳定后，向 0x1200 写 1，向 0x1201 写 1000。</p>
        </div>
        <div class="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 space-y-1">
          <span class="text-emerald-800 font-bold">步骤 2: 100 ppm 点标定</span>
          <p class="text-slate-600">清洗后置入 100.0 mg/L 标准液，静置 15 分钟稳定后，向 0x1200 写 2，向 0x1201 写 10000。</p>
        </div>
        <div class="flex justify-between text-slate-700 text-xs pt-1">
          <span>当前电极使用天数: <strong class="text-slate-900 font-mono">42 天</strong> (膜头寿命 90~180 天)</span>
          <span class="text-emerald-700 font-bold">斜率健康度: 94.2%</span>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button onclick="closeCalibrationModal()" class="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300">关闭</button>
        <button onclick="executeCalibrationSuccess()" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">模拟完成标定</button>
      </div>
    </div>
  </div>

  <!-- Modal 2: B2B 电子防伪质检合格单 -->
  <div id="modal-inspection" class="hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="glass-card rounded-2xl p-6 max-w-xl w-full space-y-4 border border-emerald-300 shadow-2xl">
      <div class="flex items-center justify-between border-b border-emerald-100 pb-3">
        <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <span>📄</span> 批次出厂检验与防伪质量证明书 (电子防伪版)
        </h3>
        <button onclick="closeInspectionReport()" class="text-slate-500 hover:text-slate-900 text-lg">✕</button>
      </div>

      <div class="bg-white text-slate-900 rounded-xl p-5 font-sans text-xs space-y-3 select-text shadow-sm border border-emerald-100">
        <div class="text-center border-b border-slate-200 pb-2">
          <h2 class="font-bold text-sm tracking-wider text-emerald-950">连锁数字化农业工厂 · 产品出厂合格证明书</h2>
          <span class="text-xs text-slate-500">Certificate of Agricultural Quality Assurance</span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>产品名称: <strong>特级水培奶油生菜</strong></div>
          <div>批次编号: <strong>LOT-20260819-01</strong></div>
          <div>定植区域: <strong>苏州一号数字化工厂 #A03 槽</strong></div>
          <div>采收时间: <strong>2026-08-19 08:30:00</strong></div>
          <div>检测项目: <strong>农药残留 / 重金属 / 硝酸盐</strong></div>
          <div>检测结果: <strong class="text-emerald-700">全部未检出 (合格)</strong></div>
        </div>

        <div class="border-t border-slate-200 pt-2 flex justify-between items-center text-xs text-slate-600">
          <span>数字签名: 0x8F4A...D982 (SHA-256)</span>
          <span class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold">质检官: AI自治系统 / 验讫</span>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button onclick="closeInspectionReport()" class="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300">关闭</button>
        <button onclick="alert('已模拟生成 PDF 并发送至客户专属邮箱！')" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">下载 PDF 副本</button>
      </div>
    </div>
  </div>

  <!-- Modal 3: 单株全息数字档案 (Plant Micro-Passport) 模态框 -->
  <div id="modal-plant-passport" class="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-xl w-full border border-emerald-300 shadow-2xl overflow-hidden font-sans text-slate-800 animate-in fade-in zoom-in duration-200">
      
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
            🥬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 id="passport-title" class="font-extrabold text-lg">特级奶油生菜 · 单株数字档案</h3>
              <span id="passport-health-badge" class="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-400/30 text-white border border-white/40">98.5分 健康</span>
            </div>
            <p id="passport-uid" class="text-xs font-mono text-emerald-100 mt-0.5">UID: RA-B03-R02C04</p>
          </div>
        </div>
        <button onclick="DataEngine.closePlantPassportModal()" class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition">
          ✕
        </button>
      </div>

      <!-- 内容主体 -->
      <div class="p-6 space-y-4">
        
        <div class="grid grid-cols-3 gap-3 font-mono text-center">
          <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span class="text-xs text-slate-500 block font-sans">估算单株鲜重</span>
            <span id="passport-weight" class="text-2xl font-black text-slate-900">215 <span class="text-xs font-normal text-slate-500">g</span></span>
            <span id="passport-weight-target" class="text-xs text-emerald-700 block mt-0.5">目标: 250g (86%)</span>
          </div>
          <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span class="text-xs text-slate-500 block font-sans">3D 点云冠幅</span>
            <span id="passport-canopy" class="text-2xl font-black text-teal-800">18.5 <span class="text-xs font-normal text-slate-500">cm</span></span>
            <span class="text-xs text-teal-600 block mt-0.5">展开度饱满</span>
          </div>
          <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span class="text-xs text-slate-500 block font-sans">叶绿素 SPAD</span>
            <span id="passport-spad" class="text-2xl font-black text-emerald-700">46.2</span>
            <span class="text-xs text-emerald-600 block mt-0.5">翡翠绿 (无缺素)</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-sans">
          <div class="flex justify-between items-center">
            <span class="text-slate-500">🔍 轨道巡检病虫害初筛:</span>
            <strong id="passport-pest-status" class="text-emerald-700 font-bold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> 🟢 健康无斑 (无蚜虫/无顶烧心)</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">⏱️ 定植时刻与苗龄:</span>
            <strong id="passport-transplant-time" class="font-mono text-slate-900">2026-07-28 08:00 (定植第 20 天)</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">🤖 AMR 与收割机械臂:</span>
            <strong id="passport-harvest-eta" class="text-teal-700 font-bold font-mono">预计明日 08:00 采收 (AMR #02)</strong>
          </div>
        </div>

        <div class="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs font-sans">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white rounded-xl border border-emerald-300 flex items-center justify-center text-xs font-mono font-bold text-emerald-800 shadow-sm">
              QR码
            </div>
            <div>
              <span class="font-bold text-slate-900 block">C 端一物一码溯源证书已绑定</span>
              <span class="text-slate-500 text-xs">商超货架扫码直达此单株 21 天全延时摄影</span>
            </div>
          </div>
          <button onclick="alert('已生成该单株专属溯源证书 URL: https://trace.aquaponics.io/plant/RA-B03-R02C04')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition text-xs shadow-sm whitespace-nowrap">
            预览溯源证书
          </button>
        </div>

      </div>

      <!-- 底部关闭按钮 -->
      <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button onclick="DataEngine.closePlantPassportModal()" class="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition">
          关闭档案
        </button>
      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- Modal 4: 🚨 特级工业紧急报警硬安全联锁对话框 (High Alert Modal) -->
  <!-- ========================================================================= -->
  <div id="modal-emergency-alarm" class="hidden fixed inset-0 z-50 bg-red-950/75 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
    <div id="modal-alarm-card" class="bg-white rounded-3xl max-w-2xl w-full border-2 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.55),0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-slate-800 animate-in zoom-in-95 duration-200">
      
      <!-- 1. 顶部工业危险警戒斑马纹 (Hazard Stripe Bar) -->
      <div id="modal-alarm-stripe" class="h-3.5 w-full hazard-stripe-red"></div>

      <!-- 2. 警报核心大标题与声光警示徽章 -->
      <div class="p-6 pb-4 border-b border-red-100 bg-red-50/50 flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <!-- 巨大警示声光图标 -->
          <div id="modal-alarm-icon-box" class="w-16 h-16 rounded-2xl bg-red-100 border-2 border-red-400 flex items-center justify-center text-3xl shadow-inner relative shrink-0">
            <span id="modal-alarm-icon" class="animate-bounce">🚨</span>
            <span id="modal-alarm-ping" class="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping absolute -top-1 -right-1"></span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 id="modal-alarm-title" class="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
                【现场 PLC 0.1s 硬安全触发】严重缺氧警报！
              </h2>
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-1.5">
              <span id="modal-alarm-badge" class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-600 text-white border border-red-700 animate-pulse">
                SIL-2 硬件硬联锁 ACTIVE
              </span>
              <span id="modal-alarm-location" class="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-red-200">
                📍 鱼池区 #01 加州鲈鱼成鱼池
              </span>
              <span id="modal-alarm-time" class="text-xs font-mono text-slate-500 font-bold">
                2026-08-19T14:18:00.000Z
              </span>
            </div>
          </div>
        </div>

        <!-- 右上角快捷关闭按钮 -->
        <button onclick="closeEmergencyAlarmModal()" class="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center cursor-pointer transition shrink-0 font-bold">
          ✕
        </button>
      </div>

      <!-- 3. 数据大字特写对比与物理偏离分析 (Huge KPI Alert Box) -->
      <div class="p-6 space-y-5">
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
          <div id="modal-alarm-box-1" class="p-3.5 bg-red-50 rounded-2xl border-2 border-red-300 shadow-sm">
            <span class="text-xs text-red-800 font-sans font-bold block">🚨 实时遥测实测值</span>
            <span id="modal-alarm-val-current" class="text-3xl font-black text-red-600 block mt-0.5">3.42 <span class="text-xs font-normal">mg/L</span></span>
            <span id="modal-alarm-val-status" class="text-xs text-red-700 font-bold block mt-0.5 font-sans">严重击穿生理窒息死线</span>
          </div>

          <div id="modal-alarm-box-2" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span class="text-xs text-slate-600 font-sans font-bold block">🛡️ 安全红线阈值</span>
            <span id="modal-alarm-val-limit" class="text-2xl font-black text-slate-800 block mt-1">4.00 <span class="text-xs font-normal">mg/L</span></span>
            <span id="modal-alarm-val-limit-sub" class="text-xs text-slate-500 block mt-0.5 font-sans">最低容许 DO 下限</span>
          </div>

          <div id="modal-alarm-box-3" class="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
            <span class="text-xs text-amber-800 font-sans font-bold block">⚡ 越限偏离幅度</span>
            <span id="modal-alarm-val-diff" class="text-2xl font-black text-amber-700 block mt-1">-14.5%</span>
            <span id="modal-alarm-val-diff-sub" class="text-xs text-amber-700 block mt-0.5 font-sans font-bold">立即启动应急增氧</span>
          </div>
        </div>

        <!-- 4. PLC 硬件级硬联锁已自动执行动作清单 -->
        <div class="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 text-xs font-mono shadow-inner border border-slate-700">
          <div class="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5 font-sans font-bold">
            <span class="flex items-center gap-1.5 text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ⚡ 现场 PLC 看门狗 0.1s 自治执行动作 (无需人工干预):
            </span>
            <span class="text-xs text-slate-500 font-mono">硬件级动作已闭环</span>
          </div>

          <div id="modal-alarm-actions" class="space-y-1.5 text-slate-200 font-sans">
            <div class="flex items-center gap-2 text-emerald-300">
              <span>✅</span> <span>[硬件断电] 强制切断自动投喂机电源，杜绝饱食鱼高代谢耗氧死亡</span>
            </div>
            <div class="flex items-center gap-2 text-emerald-300">
              <span>✅</span> <span>[应急增氧] 毫秒级打开 PureOx-50 高压纯氧电磁阀 (补气流量 35 L/min)</span>
            </div>
            <div class="flex items-center gap-2 text-amber-300">
              <span>📢</span> <span>[特急升级] 已向驻厂值班工程师手机推送最高等级语音呼叫与短信报警</span>
            </div>
          </div>
        </div>

        <!-- 5. 专家处置 SOP 指引 -->
        <div class="p-3.5 bg-red-50/80 rounded-2xl border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
          <span class="text-base shrink-0">💡</span>
          <div>
            <strong class="block font-bold mb-0.5">现场应急处置 SOP 指引:</strong>
            <span id="modal-alarm-sop" class="text-slate-700 leading-relaxed font-sans">
              请巡检人员立即穿戴防护装备，前往 #01 鱼池观察鱼体游动表征；检查制氧机出口压力是否正常（标准 0.4~0.6 MPa）。排查完毕后点击【消除警报并恢复正常】。
            </span>
          </div>
        </div>

      </div>

      <!-- 6. 底部行动操作栏 -->
      <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>事件编号: <strong id="modal-alarm-event-id" class="text-slate-800">EVT-20260819-ALARM-01</strong></span>
        </div>

        <div class="flex items-center gap-2.5">
          <button onclick="closeEmergencyAlarmModal()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition shadow-xs">
            知道了 / 静音巡检 (Mute)
          </button>
          <button onclick="resetScenarioFromModal()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs cursor-pointer transition shadow-md flex items-center gap-1.5">
            <span>🔄</span> 消除警报 · 恢复正常状态
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- Modal 4: 🤖 AI 农艺多源机理推演与决策中台对话框 (AI Agronomy Reasoning Modal) -->
  <!-- ========================================================================= -->
  <div id="modal-ai-reasoning" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-4xl w-full border-2 border-emerald-400 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
      
      <!-- 1. 对话框头部 (深色科技生机风) -->
      <div class="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 text-white flex items-center justify-between shrink-0 border-b border-emerald-800/60">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shadow-inner">
            🤖
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-black text-base text-emerald-300 tracking-tight">AI 虚拟农艺科学家 · 多源机理推演与决策中台</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-400/40">
                GraphRAG Grounding
              </span>
            </div>
            <p class="text-xs text-emerald-400/90 mt-0.5 font-medium flex items-center gap-1.5">
              <span>当前推演课题:</span>
              <strong id="modal-ai-topic" class="text-white font-bold underline decoration-emerald-400 underline-offset-2">波士顿奶油生菜 采收前48h 降硝酸盐至800mg以下</strong>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1.5 bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700/60 text-xs font-mono text-emerald-300">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>推演求解耗时: <strong class="text-white font-bold">0.82s</strong></span>
          </div>
          <button onclick="ScientistConsole.closeReasoningModal()" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700 text-base">
            ✕
          </button>
        </div>
      </div>

      <!-- 2. 对话框滚动内容区 -->
      <div class="p-6 overflow-y-auto space-y-6 text-slate-800 font-sans text-xs flex-1">
        
        <!-- 模块 A: 全景多源数据输入与感知底座 (学术/工厂实时/试验舱) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <span>🌐</span> 第一步：聚合检索之多源数据输入与感知证据链 (Multi-Source Inputs)
            </span>
            <span class="text-xs text-slate-500 font-mono">3 大数据源 100% 校验通过</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            <!-- 数据源 1: 开源学术与本体 -->
            <div class="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
              <div class="flex items-center justify-between">
                <strong class="text-xs font-bold text-indigo-950 flex items-center gap-1">
                  <span>📚</span> 开源学术本体与文献
                </strong>
                <span class="px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-mono font-bold text-[11px]">CO / SCI</span>
              </div>
              <div id="modal-ai-source-academic" class="space-y-1 text-slate-700 font-medium">
                <div>• <strong>Crop Ontology:</strong> CO_325:0000042</div>
                <div>• <strong>USDA GRIN:</strong> 种质编号 PI 536834</div>
                <div>• <strong>顶刊引文:</strong> HortScience 2025 (4:1.2 远红波段刺激 SPS 蔗糖合成酶)</div>
              </div>
            </div>

            <!-- 数据源 2: 工厂现场多物理场实时遥测 (水/气/化合物) -->
            <div class="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div class="flex items-center justify-between">
                <strong class="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  <span>🏭</span> 工厂实时遥测 (水/气/化)
                </strong>
                <span class="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold text-[11px]">IIoT 实时</span>
              </div>
              <div id="modal-ai-source-factory" class="space-y-1 text-slate-700 font-medium">
                <div>• <strong>水质:</strong> 水温 19.8°C · DO 6.85 mg/L · pH 6.22</div>
                <div>• <strong>空气:</strong> 气温 22.4°C · VPD 0.85 kPa · CO₂ 820ppm</div>
                <div>• <strong>化合物:</strong> Ca²⁺ 185 mg/L · NO₃⁻ 42 mg/L · TAN 0.82</div>
              </div>
            </div>

            <!-- 数据源 3: 12座试验舱历史标定 -->
            <div class="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
              <div class="flex items-center justify-between">
                <strong class="text-xs font-bold text-teal-950 flex items-center gap-1">
                  <span>🧬</span> 12 座试验舱基线数据
                </strong>
                <span class="px-1.5 py-0.5 rounded bg-teal-200 text-teal-900 font-mono font-bold text-[11px]">Nursery R&D</span>
              </div>
              <div id="modal-ai-source-chamber" class="space-y-1 text-slate-700 font-medium">
                <div>• <strong>基准试验:</strong> 舱 #01~#04 连续 14 天光谱验证</div>
                <div>• <strong>实测成效:</strong> 硝酸盐由 1,820 降至 620.5 mg/kg</div>
                <div>• <strong>感官评价:</strong> 糖度 4.3°Bx · 质构硬度 820g</div>
              </div>
            </div>

          </div>
        </div>

        <!-- 模块 B: AI 思考流与机理方程联立求解过程 (CoT Reasoning Log) -->
        <div class="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs space-y-2 shadow-inner border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
            <span class="flex items-center gap-1.5 font-bold text-emerald-400">
              <span>⚡</span> AI 生物机理动力学联立求解过程 (Biophysical CoT Engine):
            </span>
            <span class="text-slate-500">ISO 8601 UTC 对齐</span>
          </div>
          <div id="modal-ai-cot-logs" class="space-y-1 text-slate-300 leading-relaxed font-sans text-xs">
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-mono">[00.12s]</span>
              <span><strong>FvCB 光合方程求解:</strong> PPFD 260 µmol/m²/s 下净光合速率 Pn = 14.2 µmol CO₂/m²/s，未触及光饱和抑制点 (350 µmol)。</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-mono">[00.38s]</span>
              <span><strong>Stanghellini 蒸腾验算:</strong> 当前 VPD 0.85 kPa，气孔阻抗 rs = 142 s/m，维持合理蒸腾拉力，钙离子向生长点正常运输。</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-400 font-mono">[00.65s]</span>
              <span><strong>硝酸还原酶 (NR) 耗竭动力学:</strong> 停氮 48h 激活内源 NR 酶活性，预测硝酸盐指数衰减至 620.5 mg/kg (达母婴级标准)。</span>
            </div>
          </div>
        </div>

        <!-- 模块 C: AI 生成的建议工艺方案对比矩阵 (Two Process Proposals) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <span>💡</span> 第二步：AI 基于多源数据生成的两大推荐工艺方案 (Grounded Proposals)
            </span>
            <span class="text-xs text-emerald-700 font-bold font-mono">置信度: 99.1%</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- 方案 1: 推荐首选方案 (母婴级极速降硝) -->
            <div class="p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 shadow-md space-y-3.5 relative overflow-hidden flex flex-col justify-between">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs tracking-wider">
                    ★ 方案一：研发主管推荐 · 极速降硝增糖工艺
                  </span>
                  <span class="text-emerald-700 font-bold text-xs font-mono">母婴级严选</span>
                </div>
                <h4 class="font-black text-sm text-slate-900">
                  采收前 48h 红蓝远红三波段连续光照 + 调理池停氮活化工艺
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  通过 $R:B:FR = 4:1:1.2$ (PPFD 260 µmol) 激发远红光效应与 SPS 蔗糖合成酶，调理池切断外源氮肥，促使内源硝酸盐转化为优质氨基酸。
                </p>
                
                <div class="grid grid-cols-3 gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-xs font-mono text-center">
                  <div>
                    <span class="text-slate-500 text-[11px] block">预期硝酸盐</span>
                    <strong class="text-teal-700 font-bold text-sm">620.5 mg</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 text-[11px] block">预期糖度</span>
                    <strong class="text-amber-700 font-bold text-sm">4.3 °Bx</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 text-[11px] block">单株电耗</span>
                    <strong class="text-indigo-700 font-bold text-sm">¥ 0.28</strong>
                  </div>
                </div>
              </div>

              <div class="pt-2 border-t border-emerald-100 flex items-center gap-2">
                <button 
                  onclick="ScientistConsole.applyRecipeFromModal('RECIPE-2026-BUTTERHEAD-SUPREME-V2', '方案一')" 
                  class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                  <span>🚀</span> 采纳并一键下发至 12 座试验舱执行
                </button>
              </div>
            </div>

            <!-- 方案 2: 经济节能平衡方案 (备选) -->
            <div class="p-5 rounded-2xl border border-slate-300 bg-white/95 shadow-sm space-y-3.5 flex flex-col justify-between">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-xs tracking-wider">
                    方案二：经济节能适度降硝工艺 (备选)
                  </span>
                  <span class="text-slate-500 font-bold text-xs font-mono">符合欧盟标准</span>
                </div>
                <h4 class="font-black text-sm text-slate-900">
                  双波段红蓝 3:1 节能补光 + 采收前 24h 清水适度冲洗
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed font-medium">
                  维持传统红蓝 3:1 光谱 (PPFD 180 µmol)，避开电网尖峰电价补光，采收前 24h 仅降低 EC 至 1.0，实现 0 电费增量下的达标采收。
                </p>
                
                <div class="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-center">
                  <div>
                    <span class="text-slate-500 text-[11px] block">预期硝酸盐</span>
                    <strong class="text-slate-900 font-bold text-sm">1,100 mg</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 text-[11px] block">预期糖度</span>
                    <strong class="text-slate-900 font-bold text-sm">3.6 °Bx</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 text-[11px] block">电费节省</span>
                    <strong class="text-emerald-700 font-bold text-sm">¥ 0.15</strong>
                  </div>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button 
                  onclick="ScientistConsole.applyRecipeFromModal('RECIPE-2026-BUTTERHEAD-ECO-V1', '方案二')" 
                  class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer border border-slate-300 flex items-center justify-center gap-1.5">
                  <span>⚡</span> 采纳经济节能方案
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- 3. 对话框底部操作栏 -->
      <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>存证时间: <strong id="modal-ai-timestamp" class="text-slate-800">2026-08-19T06:57:00.000Z</strong></span>
          <span class="text-emerald-700 font-bold">· Cloudflare Vectorize 已就绪</span>
        </div>

        <div class="flex items-center gap-2.5">
          <button onclick="ScientistConsole.closeReasoningModal()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition">
            关闭窗口
          </button>
          <button onclick="ScientistConsole.exportPdfReport('RECIPE-AI-GROUNDED-V2')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm flex items-center gap-1.5">
            <span>📄</span> 导出完整科研推演报告 (PDF)
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- Modal 5: 📱 社媒帖子全景下钻与 AI 公关回复/KOL合作弹窗 (Social Post Detail Modal) -->
  <!-- ========================================================================= -->
  <div id="modal-social-post-detail" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-3xl w-full border-2 border-rose-300 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
      
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-rose-950 via-slate-900 to-orange-950 p-5 text-white flex items-center justify-between shrink-0 border-b border-rose-800/60">
        <div class="flex items-center gap-3">
          <div id="modal-social-icon" class="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-2xl shadow-inner">
            📕
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 id="modal-social-author" class="font-black text-base text-rose-300 tracking-tight">@萌宝辅食日记</h3>
              <span id="modal-social-tag" class="px-2.5 py-0.5 rounded-full bg-rose-400/20 text-rose-300 text-xs font-mono font-bold border border-rose-400/40">
                小红书母婴达人
              </span>
            </div>
            <p id="modal-social-time" class="text-xs text-rose-400/90 mt-0.5 font-medium font-mono">
              2026-08-19 14:15 · 杭州 · 粉丝 12.5w
            </p>
          </div>
        </div>

        <button onclick="RetailCopilotController.closeSocialModal()" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700 text-base">
          ✕
        </button>
      </div>

      <!-- 内容区 -->
      <div class="p-6 overflow-y-auto space-y-5 text-slate-800 font-sans text-xs flex-1">
        
        <!-- 帖子原文字句与互动数据 -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <span>📝</span> 原帖全文与社媒数据
            </span>
            <span id="modal-social-sentiment-badge" class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
              💖 极度好评 (99%)
            </span>
          </div>
          <p id="modal-social-content" class="text-slate-700 text-xs leading-relaxed font-medium select-text">
            “终于买到了做宝宝辅食的真·母婴级生菜！带去实验室测了硝酸盐只有 620mg，远低于欧盟 2500mg 标准，生吃脆甜无苦味，宝宝一口气吃了大半碗蔬菜泥！顺丰冷链包装太专业了！”
          </p>
          <div id="modal-social-stats" class="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-slate-500 font-mono text-xs">
            <span>❤️ 2,840 赞</span>
            <span>💬 382 评论</span>
            <span>⭐ 1,420 收藏</span>
            <span class="text-rose-600 font-bold">🛒 带货转化: 142 盒</span>
          </div>
        </div>

        <!-- 评论区高频热词词云与心智洞察 -->
        <div class="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2.5">
          <span class="font-bold text-xs text-rose-950 flex items-center gap-1.5">
            <span>☁️</span> 评论区高频热词与消费者心智洞察:
          </span>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 font-medium">🍃 清脆爽口 (84%)</span>
            <span class="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 font-medium">👶 宝宝爱吃 (76%)</span>
            <span class="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 font-medium">🧪 无硝酸盐苦涩 (68%)</span>
            <span class="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 font-medium">📦 顺丰冷链保鲜 (92%)</span>
            <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium">💰 价格略贵 (24%)</span>
          </div>
        </div>

        <!-- AI 官方互动/达人合作跟进建议 -->
        <div class="p-4 rounded-2xl bg-white border-2 border-emerald-400 space-y-3 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
              <span>🤖</span> AI 智能生成的品牌官方互动回复 (已关联 e-COA 报告):
            </span>
            <span class="text-xs text-slate-400 font-mono">置信度: 99.4%</span>
          </div>
          <div id="modal-social-ai-reply" class="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-slate-800 text-xs leading-relaxed font-sans select-text">
            “感谢宝妈的专业认可！我们的奶油生菜在工厂采收前经过了 48 小时远红光转化与活化停氮，让内源硝酸盐彻底转化为甘氨酸，宝宝吃得健康，妈妈更安心！私信为您送上本批次北京普析 62 项盲检 e-COA 电子防伪报告与专属体验礼遇！”
          </div>
        </div>

      </div>

      <!-- 底部操作栏 -->
      <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>工单状态: <strong class="text-emerald-700">AI 自动跟进中</strong></span>
        </div>

        <div class="flex items-center gap-2.5">
          <button onclick="RetailCopilotController.closeSocialModal()" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition">
            关闭
          </button>
          <button onclick="RetailCopilotController.sendOfficialReply()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-extrabold text-xs cursor-pointer transition shadow-sm flex items-center gap-1.5">
            <span>💬</span> 一键向博主发送官方回复与私信
          </button>
        </div>
      </div>

    </div>
  </div>
`;
