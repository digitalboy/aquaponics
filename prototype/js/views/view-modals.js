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
`;
