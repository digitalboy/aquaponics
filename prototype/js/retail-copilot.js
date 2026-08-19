/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * retail-copilot.js: 零售大屏运营、动力甘特图与 AI 客服决策 Copilot (Retail & Member AI Copilot)
 * =========================================================================
 */

const RetailCopilotController = {
  /**
   * 集团决策视角切换 ('all' | 'coo' | 'cfo')
   */
  switchExecutiveRole(engine, role) {
    engine.executiveRole = role;

    ['all', 'coo', 'cfo'].forEach(r => {
      const btn = document.getElementById(`btn-role-${r}`);
      if (btn) {
        if (r === role) {
          btn.className = 'px-3.5 py-1.5 rounded-xl transition cursor-pointer font-extrabold bg-emerald-600 text-white shadow-sm';
        } else {
          btn.className = 'px-3.5 py-1.5 rounded-xl transition cursor-pointer font-bold text-slate-600 hover:text-slate-900';
        }
      }
    });

    const cooSec = document.getElementById('section-coo-view');
    const cfoSec = document.getElementById('section-cfo-view');

    if (role === 'all') {
      if (cooSec) cooSec.classList.remove('hidden');
      if (cfoSec) cfoSec.classList.remove('hidden');
    } else if (role === 'coo') {
      if (cooSec) cooSec.classList.remove('hidden');
      if (cfoSec) cfoSec.classList.add('hidden');
    } else if (role === 'cfo') {
      if (cooSec) cooSec.classList.add('hidden');
      if (cfoSec) cfoSec.classList.remove('hidden');
    }
  },

  /**
   * 渲染全厂主要动力设备 24h 运行时序甘特图
   */
  renderEquipmentTimeline(engine) {
    const tbody = document.getElementById('equipment-timeline-tbody');
    if (!tbody) return;

    let html = '';
    engine.equipmentTimeline.forEach(eq => {
      let cellsHtml = '';
      eq.periods.forEach(p => {
        if (p === 'RUN') {
          cellsHtml += `<td class="py-2 px-1 text-center"><span class="inline-block w-6 h-5 rounded bg-emerald-500 text-white font-black text-xs leading-5 shadow-xs">开</span></td>`;
        } else if (p === 'ECO') {
          cellsHtml += `<td class="py-2 px-1 text-center bg-rose-50/50"><span class="inline-block w-6 h-5 rounded bg-amber-400 text-slate-900 font-bold text-xs leading-5 shadow-xs">降</span></td>`;
        } else {
          cellsHtml += `<td class="py-2 px-1 text-center"><span class="inline-block w-6 h-5 rounded bg-slate-200 text-slate-400 font-normal text-xs leading-5">停</span></td>`;
        }
      });

      html += `
        <tr class="hover:bg-emerald-50/50 transition">
          <td class="py-2.5 px-3 font-bold text-slate-900 font-sans text-xs">${eq.name}</td>
          ${cellsHtml}
          <td class="py-2.5 px-3 text-right font-black text-slate-900 font-mono text-xs">${eq.hours}</td>
          <td class="py-2.5 px-3 font-sans text-xs">
            <span class="font-bold text-slate-800">${eq.status}</span>
            <span class="text-slate-500 text-xs block font-mono mt-0.5">${eq.rule}</span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  /**
   * 渲染会员工单与 AI 自动处理流 (View 6)
   */
  renderMemberTicketStream(engine) {
    const streamEl = document.getElementById('member-ticket-stream');
    if (!streamEl) return;

    let html = '';
    engine.memberTickets.forEach(t => {
      html += `
        <div class="p-3 bg-white/95 rounded-xl border border-slate-200 shadow-sm space-y-1.5 transition hover:border-purple-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-xs">${t.member}</span>
              <span class="text-xs px-2 py-0.5 rounded font-mono font-bold border whitespace-nowrap ${t.typeBadge}">${t.type}</span>
            </div>
            <span class="text-xs text-slate-400 font-mono">${t.time}</span>
          </div>
          <div class="p-2 bg-slate-50 rounded-lg text-slate-700 font-sans text-xs">
            💬 <strong>会员原话:</strong> “${t.content}”
          </div>
          <div class="p-2 bg-purple-50/70 border border-purple-100 rounded-lg text-purple-950 font-sans text-xs flex items-start gap-2">
            <span class="text-sm">🤖</span>
            <div>
              <strong>AI 自动回复:</strong> ${t.aiReply}
              <div class="text-xs text-emerald-700 font-bold font-mono mt-0.5">${t.status}</div>
            </div>
          </div>
        </div>
      `;
    });

    streamEl.innerHTML = html;
  },

  /**
   * 小程序 Tab 切换 (View 7)
   */
  switchMiniAppTab(tab) {
    const traceTab = document.getElementById('miniapp-tab-trace');
    const serviceTab = document.getElementById('miniapp-tab-service');
    const btnTrace = document.getElementById('tab-btn-trace');
    const btnService = document.getElementById('tab-btn-service');

    if (tab === 'trace') {
      if (traceTab) traceTab.classList.remove('hidden');
      if (serviceTab) serviceTab.classList.add('hidden');
      if (btnTrace) btnTrace.className = 'flex-1 py-1.5 rounded-lg font-bold text-xs bg-white text-slate-900 shadow-sm transition';
      if (btnService) btnService.className = 'flex-1 py-1.5 rounded-lg font-bold text-xs text-slate-600 hover:text-slate-900 transition';
    } else {
      if (traceTab) traceTab.classList.add('hidden');
      if (serviceTab) serviceTab.classList.remove('hidden');
      if (btnTrace) btnTrace.className = 'flex-1 py-1.5 rounded-lg font-bold text-xs text-slate-600 hover:text-slate-900 transition';
      if (btnService) btnService.className = 'flex-1 py-1.5 rounded-lg font-bold text-xs bg-white text-slate-900 shadow-sm transition';
    }
  },

  /**
   * 小程序快捷提报诉求
   */
  quickSendFeedback(engine, text) {
    const inputEl = document.getElementById('miniapp-input-text');
    if (inputEl) inputEl.value = text;
    this.sendMemberFeedback(engine, text);
  },

  handleCustomFeedbackInput(engine) {
    const inputEl = document.getElementById('miniapp-input-text');
    if (!inputEl || !inputEl.value.trim()) return;
    this.sendMemberFeedback(engine, inputEl.value.trim());
    inputEl.value = '';
  },

  /**
   * 模拟会员发送诉求并由 AI 客服毫秒级处理
   */
  sendMemberFeedback(engine, content) {
    const bubblesEl = document.getElementById('miniapp-chat-bubbles');
    if (!bubblesEl) return;

    // 1. 插入用户气泡
    const userBubble = document.createElement('div');
    userBubble.className = 'bg-purple-600 text-white p-2.5 rounded-xl rounded-tr-none text-xs leading-relaxed ml-6';
    userBubble.innerHTML = `<strong>张女士:</strong> ${content}`;
    bubblesEl.appendChild(userBubble);
    bubblesEl.scrollTop = bubblesEl.scrollHeight;

    // 2. 判断诉求类型并生成 AI 智能回复
    let type = '建议反馈';
    let typeBadge = 'bg-teal-100 text-teal-800 border-teal-300';
    let aiReply = '';

    if (content.includes('黄') || content.includes('烂') || content.includes('坏') || content.includes('慢') || content.includes('投诉')) {
      type = '品控客诉';
      typeBadge = 'bg-rose-100 text-rose-800 border-rose-300';
      aiReply = '已调取您周配批次 LOT-0818-VEG03 档案（0农残/DLI 16.5）。因夏季冷链末端微温差影响，已为您自动补发一张 ¥20 鲜萃券，并已联动冷链强化保温！';
    } else if (content.includes('羽衣甘蓝') || content.includes('菜') || content.includes('品种') || content.includes('增加')) {
      type = '选品建议';
      typeBadge = 'bg-purple-100 text-purple-800 border-purple-300';
      aiReply = '感谢张女士的宝贵建议！系统已将诉求自动汇入农艺排产 Copilot，预计下期周配即可支持自选嫩叶羽衣甘蓝。';
    } else if (content.includes('直播') || content.includes('机位') || content.includes('认养') || content.includes('生长')) {
      type = '认养探视';
      typeBadge = 'bg-teal-100 text-teal-800 border-teal-300';
      aiReply = '已为您连通 #A03 跑道 RTSP-02 专用水下双目机位，当前作物日龄 16天，均重 210g，长势极佳！';
    } else {
      aiReply = `已收到您的诉求：“${content}”。专属 AI 农庄管家已为您登记并同步至零售经理决策后台，祝您用餐愉快！`;
    }

    // 3. 400ms 后插入 AI 气泡
    setTimeout(() => {
      const aiBubble = document.createElement('div');
      aiBubble.className = 'bg-slate-100 p-2.5 rounded-xl rounded-tl-none text-slate-800 text-xs leading-relaxed mr-4 border border-slate-200';
      aiBubble.innerHTML = `<strong>🤖 AI 管家:</strong> ${aiReply}`;
      bubblesEl.appendChild(aiBubble);
      bubblesEl.scrollTop = bubblesEl.scrollHeight;

      // 4. 将该工单推入零售大屏工单流顶部
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      engine.memberTickets.unshift({
        id: `TKT-0819-${Math.floor(Math.random() * 800 + 100)}`,
        member: '👑 张女士 (钻石认养会员)',
        time: timeStr,
        type: type,
        typeBadge: typeBadge,
        content: content,
        aiReply: aiReply,
        status: '✅ AI 已秒级闭环处理'
      });

      this.renderMemberTicketStream(engine);
    }, 400);
  },

  /**
   * 采纳 AI Copilot 运营建议
   */
  applyAICopilotSuggestion(type) {
    if (type === 'crop') {
      alert('🌱 【AI 选品调整指令已下发】\n\n已成功采纳 AI 建议：系统已向供应链 APS 中台与育苗区下发工单，将 #04 跑道 20% 面积切换为“嫩叶羽衣甘蓝”育苗排产，预计下周五正式上线会员周配自选库！');
    } else if (type === 'coldchain') {
      alert('❄️ 【冷链温控策略已优化】\n\n已成功下发冷链优化工单：系统已通知顺丰冷链交接仓，针对午间配送箱统一增投 150g 相变蓄冷冰袋，确保全程维持在 2~4°C！');
    } else if (type === 'vip') {
      alert('👑 【VIP 续费礼遇已批量派发】\n\n已成功向 15 位临期年卡会员推送《钻石会员专属续费礼遇包》（含 ¥200 续费减免券 + 专属有机蓝莓体验盒），系统将持续跟踪转化率！');
    }
  },

  /**
   * 渲染 B2B 大客户专属在途冷链履约监控与动态时效预警雷达表
   */
  renderB2BFulfillmentTable(engine) {
    const tbody = document.getElementById('b2b-fulfillment-tbody');
    if (!tbody) return;

    let html = '';
    engine.b2bShipments.forEach(s => {
      let actionBtns = `
        <div class="flex items-center gap-2 justify-end whitespace-nowrap shrink-0">
          <button onclick="DataEngine.exportECOACertificate('${s.batchId}')" class="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs cursor-pointer transition shadow-xs whitespace-nowrap shrink-0">
            📄 质检单
          </button>
      `;

      if (s.canMitigate) {
        if (s.riskLevel === 'red') {
          actionBtns += `
            <button onclick="DataEngine.applyDelayMitigation('${s.id}')" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition shadow-xs animate-pulse whitespace-nowrap shrink-0" title="一键下发常州前置仓紧急派车代发">
              ⚡ 消除延误
            </button>
          `;
        } else if (s.riskLevel === 'blue') {
          actionBtns += `
            <button onclick="DataEngine.applyDelayMitigation('${s.id}')" class="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer transition shadow-xs whitespace-nowrap shrink-0" title="通知商超买手提前入库">
              📑 提前入库
            </button>
          `;
        }
      }
      actionBtns += `</div>`;

      html += `
        <tr class="hover:bg-purple-50/40 transition border-b border-slate-100 font-sans text-xs">
          <td class="py-3 px-3">
            <div class="font-extrabold text-slate-900">${s.client}</div>
            <div class="text-xs text-purple-700 font-mono font-bold mt-0.5">${s.cutoffTime}</div>
          </td>
          <td class="py-3 px-3">
            <span class="font-bold text-slate-800">${s.cargo}</span>
            <span class="text-xs block font-mono text-slate-500 mt-0.5">${s.batchId}</span>
          </td>
          <td class="py-3 px-3 font-mono">
            <div class="text-slate-900 font-bold">${s.truckPlate}</div>
            <div class="text-xs text-teal-700 font-bold mt-0.5">${s.temp}</div>
          </td>
          <td class="py-3 px-3 font-mono">
            <div class="text-slate-500 text-xs">计划: <span class="line-through">${s.plannedEta}</span></div>
            <div class="text-slate-900 font-black text-sm">预测: <span class="${s.riskLevel === 'red' ? 'text-rose-600 font-black underline' : 'text-emerald-700 font-bold'}">${s.predictedEta}</span></div>
          </td>
          <td class="py-3 px-3">
            <span class="px-2 py-0.5 rounded-lg border text-xs font-mono font-bold inline-block whitespace-nowrap ${s.varianceBadge}">
              ${s.varianceText}
            </span>
            <div class="text-xs text-slate-600 font-sans mt-1 max-w-[220px] leading-tight">
              🔍 归因: ${s.rootCause}
            </div>
          </td>
          <td class="py-3 px-3 text-right">
            ${actionBtns}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  /**
   * 一键实施延误消除/提前入库干预缓解
   */
  applyDelayMitigation(engine, shipmentId) {
    const s = engine.b2bShipments.find(item => item.id === shipmentId);
    if (!s) return;

    if (s.riskLevel === 'red') {
      s.predictedEta = '05:18 (常州直配)';
      s.varianceMin = -12;
      s.varianceText = '🟢 已改派常州前置仓 (提前 12 分钟)';
      s.varianceBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      s.rootCause = '已避开 G15 拥堵路段，改由常州二期基地保供专车出库';
      s.status = '✅ 已消除延误违约风险';
      s.canMitigate = false;
      s.riskLevel = 'green';

      this.renderB2BFulfillmentTable(engine);

      alert('⚡ 【智能延误干预成功 · 跨基地前置仓代送已生效！】\n\n' +
        '• 目标大客户：山姆会员店 (华东嘉兴总仓)\n' +
        '• 原定延误时刻：06:15 (触碰 06:00 截单罚款红线)\n' +
        '• 智能调度决策：系统已改派【常州二期前置卫星仓 顺丰冷链专车 苏D·8832L】直接出库代送\n' +
        '• 最新预测到达：05:18 (提前 42 分钟入库，解除违约风险，OTIF 保住 100%！)');
    } else if (s.riskLevel === 'blue') {
      s.varianceText = '✅ 买手已确认 06:55 提前开仓接货';
      s.varianceBadge = 'bg-teal-100 text-teal-800 border-teal-300 font-bold';
      s.canMitigate = false;

      this.renderB2BFulfillmentTable(engine);

      alert('📑 【提前入库申请已通过】\n\n' +
        '• 目标大客户：Ole\' 精品超市 (上海大区各门店)\n' +
        '• 原因：温室深水跑道光合积分 DLI 超预期，生菜提前 1 天达到 250g 采收标准\n' +
        '• 协同结果：商超买手与中央仓冷库已完成排班确认，开放 06:55 绿色提前验收通道！');
    }
  },

  /**
   * 渲染 B2B 商业客诉与 15 分钟应急调拨工单流
   */
  renderB2BTicketsStream(engine) {
    const container = document.getElementById('b2b-tickets-stream');
    if (!container) return;

    let html = '';
    engine.b2bTickets.forEach(t => {
      let actionBtnHtml = '';
      if (t.canAction) {
        if (t.id === 'TKT-B2B-02') {
          actionBtnHtml = `
            <div class="pt-1.5 border-t border-slate-100 flex justify-end">
              <button onclick="DataEngine.dispatchEmergencyReplenishment('${t.id}')" class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 whitespace-nowrap">
                ${t.actionText}
              </button>
            </div>
          `;
        } else if (t.id === 'TKT-B2B-03') {
          actionBtnHtml = `
            <div class="pt-1.5 border-t border-slate-100 flex justify-end">
              <button onclick="DataEngine.exportECOACertificate('LOT-20260819-HERB01')" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-teal-500/20 transition flex items-center gap-1.5 whitespace-nowrap">
                ${t.actionText}
              </button>
            </div>
          `;
        }
      }

      html += `
        <div class="p-3.5 bg-white/95 rounded-2xl border border-slate-200 shadow-sm space-y-2 transition hover:border-emerald-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900 text-xs">${t.client}</span>
              <span class="text-xs px-2 py-0.5 rounded font-mono font-bold border whitespace-nowrap ${t.typeBadge}">${t.type}</span>
            </div>
            <span class="text-xs text-slate-400 font-mono">${t.time}</span>
          </div>

          <div class="p-2 bg-slate-50 rounded-xl text-slate-700 font-sans text-xs">
            📑 <strong>诉求原话:</strong> “${t.content}”
          </div>

          <div class="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-950 font-sans text-xs flex items-start gap-2">
            <span class="text-base">⚡</span>
            <div class="w-full">
              <strong>中台调度决策:</strong> ${t.solution}
              <div id="b2b-status-${t.id}" class="text-xs text-teal-800 font-bold font-mono mt-1">${t.status}</div>
            </div>
          </div>

          ${actionBtnHtml}
        </div>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * 一键确认跨基地紧急调拨派车
   */
  dispatchEmergencyReplenishment(ticketId) {
    const el = document.getElementById(`b2b-status-${ticketId}`);
    if (el) {
      el.textContent = '✅ 已派发【顺丰冷链专车 苏E·9932L】由常州基地紧急调拨中 (预计 22分钟后抵达成仓)';
      el.className = 'text-xs text-purple-700 font-black font-mono mt-1 animate-pulse';
    }

    alert('🚀 【跨基地紧急冷链调拨已成功下发！】\n\n' +
      '• 目标大客户：山姆会员店 (华东嘉兴总仓)\n' +
      '• 调拨品类与规格：特级奶油生菜 200kg (250g/盒)\n' +
      '• 出库来源：常州二期基地 #B02 跑道 (95%成熟)\n' +
      '• 调度专车：顺丰冷链专车 苏E·9932L (全程 2.5°C 恒温)\n' +
      '• 预计到达：05:22 (严格早于商超 06:00 截单窗口，OTIF 100% 达成！)');
  },

  /**
   * 导出与调取批次电子质检单 (e-COA)
   */
  exportECOACertificate(batchId) {
    alert(`📄 【批次电子质检合格证书 (e-COA - Electronic Certificate of Analysis)】\n\n` +
      `• 质检报告编号: eCOA-${batchId}\n` +
      `• 生产基地: 鱼菜共生数字工业化一号标杆示范工厂 (苏州基地)\n` +
      `• 定植/采收周期: 2026-07-28 ~ 2026-08-18 (21天纯净深水浮板水培)\n` +
      `• 光照累积积分: DLI 16.8 mol/m²/d (特级促脆全光谱)\n` +
      `• 水质全息指标: DO 6.8 mg/L • pH 7.15 • 根区水温 20.8°C\n` +
      `• 农残与重金属检测: 0 化学农药残留 (SGS 308项未检出) • 硝酸盐 620.5 mg/kg (特级母婴级 <800)\n` +
      `• 营养风味检测: 维 C 28.5 mg/100g (+110%) • 糖度 4.2°Brix\n` +
      `• 机械臂切根打码: 1080P 采收称重视频与冷链装箱 (2.8°C)\n` +
      `• 权威防伪签章: [已加盖国家现代农业产业园数字 CA 电子公章 SHA-256: 0x8f4a...9982]`);
  },

  // ===========================================================================
  // 🔬 4. 品质主管与驻厂实验室中台控制器 (Quality Director & Lab Center)
  // ===========================================================================

  /**
   * 渲染驻厂实验室核心仪器台账与校准状态
   */
  renderQualityInstruments(engine) {
    const container = document.getElementById('quality-instruments-grid');
    if (!container || !engine.qualityInstruments) return;

    let html = '';
    engine.qualityInstruments.forEach(inst => {
      html += `
        <div class="p-3.5 bg-white/95 rounded-xl border border-emerald-100 shadow-2xs hover:border-emerald-300 transition space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-slate-900 text-xs truncate flex-1 min-w-0" title="${inst.name}">${inst.name}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold border border-emerald-300 whitespace-nowrap shrink-0">${inst.status}</span>
          </div>
          <div class="text-xs text-slate-600 font-mono truncate">型号: <strong class="text-slate-800">${inst.model}</strong></div>
          <div class="p-2 bg-emerald-50/70 rounded-xl text-xs font-sans text-emerald-950">
            🎯 <strong>检测项目:</strong> ${inst.target}
          </div>
          <div class="flex justify-between items-center text-xs text-slate-500 font-mono pt-1 border-t border-slate-100">
            <span class="truncate">精度: <strong class="text-emerald-700">${inst.accuracy}</strong></span>
            <span class="whitespace-nowrap shrink-0 ml-2">校准: ${inst.lastCalibrated}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * 渲染每日出厂批次双维度抽检与放行工作台表格
   */
  renderQualityBatchesTable(engine) {
    const tbody = document.getElementById('quality-batches-tbody');
    if (!tbody || !engine.qualityBatches) return;

    let html = '';
    engine.qualityBatches.forEach(b => {
      let actionBtnHtml = `
        <div class="flex items-center gap-2 justify-end whitespace-nowrap shrink-0">
          <button onclick="DataEngine.openLabReportModal('${b.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs cursor-pointer transition shadow-xs whitespace-nowrap shrink-0">
            📄 报告详情
          </button>
      `;

      if (b.canApprove) {
        actionBtnHtml += `
          <button onclick="DataEngine.approveQualityBatch('${b.id}')" class="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer transition shadow-xs whitespace-nowrap shrink-0 animate-pulse">
            ✍️ 签名放行
          </button>
        `;
      }

      actionBtnHtml += `</div>`;

      html += `
        <tr class="border-b border-slate-100 hover:bg-emerald-50/30 transition text-xs font-sans">
          <td class="py-3 px-3">
            <div class="font-extrabold text-slate-900 text-xs">${b.id}</div>
            <div class="text-xs text-slate-600 mt-0.5">${b.productName}</div>
            <div class="text-xs text-emerald-700 font-mono font-medium mt-0.5">${b.sourceRaceway}</div>
          </td>
          <td class="py-3 px-3 font-mono">
            <div class="text-slate-800 text-xs font-semibold">采收: ${b.harvestTime}</div>
            <div class="text-slate-600 text-xs mt-0.5">化验: ${b.inspectTime}</div>
            <div class="text-xs text-slate-500 font-sans mt-0.5">${b.inspector}</div>
          </td>
          <td class="py-3 px-3">
            <div class="text-xs font-bold ${b.nitrate <= 800 ? 'text-emerald-800' : 'text-amber-800'} font-mono">
              硝酸盐: ${b.nitrate} mg/kg <span class="text-xs text-slate-500 font-sans font-normal">(限值 ${b.nitrateLimit})</span>
            </div>
            <div class="text-xs text-emerald-800 font-mono mt-0.5 font-medium">农残: 0 检出 (62项) • 重金属: 极微</div>
            <div class="text-xs text-slate-700 font-sans mt-0.5 font-medium">${b.safetyVerdictText}</div>
          </td>
          <td class="py-3 px-3">
            <div class="font-mono text-xs">
              <span class="text-purple-800 font-bold">维C: ${b.vitaminC} mg</span> • <span class="text-amber-700 font-bold">糖度: ${b.sugarBrix}°Bx</span>
            </div>
            <div class="text-xs text-slate-600 font-mono mt-0.5">蛋白: ${b.crudeProtein}% • 微量铁: ${b.microFe}mg</div>
            <div class="text-xs text-teal-800 font-sans mt-0.5 font-medium">${b.nutritionVerdictText}</div>
          </td>
          <td class="py-3 px-3">
            <span id="quality-batch-status-${b.id}" class="inline-block px-2.5 py-1 rounded-lg border text-xs font-mono whitespace-nowrap ${b.statusBadge}">
              ${b.statusText}
            </span>
            <div class="text-xs text-slate-500 font-mono mt-1 truncate max-w-[160px]" title="${b.ecoaId}">${b.ecoaId}</div>
          </td>
          <td class="py-3 px-3 text-right">
            ${actionBtnHtml}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  /**
   * 渲染 4°C 留样观察室数据
   */
  renderQualityRetentionRooms(engine) {
    const room = engine.qualityRetentionRooms;
    if (!room) return;

    const tempEl = document.getElementById('quality-room-temp');
    const rhEl = document.getElementById('quality-room-rh');
    const countEl = document.getElementById('quality-room-count');
    const weightLossEl = document.getElementById('quality-room-weightloss');
    const vcRetentionEl = document.getElementById('quality-room-vcretention');
    const alertEl = document.getElementById('quality-room-alert');

    if (tempEl) tempEl.textContent = `${room.tempC}°C`;
    if (rhEl) rhEl.textContent = `${room.rhPercent}%RH`;
    if (countEl) countEl.textContent = `${room.totalSamplesCount} 批次`;
    if (weightLossEl) weightLossEl.textContent = room.weightLoss5dAvg;
    if (vcRetentionEl) vcRetentionEl.textContent = room.vcRetention5dAvg;
    if (alertEl) alertEl.textContent = room.currentAlert;
  },

  /**
   * 渲染 🔄 生产过程动态质检与前置干预卡片流 (IPQC In-Process QC Gates)
   */
  renderInProcessQCStream(engine) {
    const container = document.getElementById('in-process-qc-stream');
    if (!container || !engine.inProcessQualityInspections) return;

    let html = '';
    engine.inProcessQualityInspections.forEach(item => {
      let actionBtnHtml = '';
      if (!item.isDispatched && item.actionType !== 'none') {
        actionBtnHtml = `
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-sans">💡 建议品质主管提前介入：</span>
            <button onclick="DataEngine.triggerPreemptiveIntervention('${item.id}')" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 whitespace-nowrap">
              ⚡ 一键下发前置农艺干预
            </button>
          </div>
        `;
      } else if (item.isDispatched) {
        actionBtnHtml = `
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-emerald-700 font-bold font-mono">🟢 前置干预程序运行中</span>
            <span class="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold">指令已送达对应生产台</span>
          </div>
        `;
      }

      // 提取动态指标展示
      let metricsSummary = '';
      if (item.id === 'IPQC-20260819-01') {
        metricsSummary = `
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
            <div class="p-2 bg-white rounded-lg border border-amber-200">
              <span class="text-slate-500 font-sans block">汁液硝酸盐速测</span>
              <strong class="text-amber-800 text-sm font-black">${item.metrics.nitrateCurrent} mg/kg</strong>
              <span class="text-slate-400 text-xs block">预警线 1200</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200">
              <span class="text-slate-500 font-sans block">叶绿素 SPAD</span>
              <strong class="text-emerald-700 text-sm font-black">${item.metrics.spad}</strong>
              <span class="text-emerald-600 text-xs block">冠层长势旺盛</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-amber-200 col-span-2 sm:col-span-1">
              <span class="text-slate-500 font-sans block">TAS-990 钙/铁微量元素</span>
              <strong class="text-slate-800 text-xs font-bold">${item.metrics.calciumAbsorption}</strong>
            </div>
          </div>
        `;
      } else if (item.id === 'IPQC-20260819-02') {
        metricsSummary = `
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
            <div class="p-2 bg-white rounded-lg border border-purple-200">
              <span class="text-slate-500 font-sans block">折光糖度 Brix 预检</span>
              <strong class="text-purple-800 text-sm font-black">${item.metrics.sugarBrixCurrent} °Bx</strong>
              <span class="text-slate-400 text-xs block">目标: ${item.metrics.targetBrix}</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200">
              <span class="text-slate-500 font-sans block">采收面 ATP 洁净度</span>
              <strong class="text-emerald-700 text-sm font-black">${item.metrics.atpCleanliness}</strong>
              <span class="text-emerald-600 text-xs block">十万级无菌环境</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
              <span class="text-slate-500 font-sans block">3D 点云冠幅均匀度</span>
              <strong class="text-slate-800 text-xs font-bold">${item.metrics.canopyUniformity}</strong>
            </div>
          </div>
        `;
      } else if (item.id === 'IPQC-20260819-03') {
        metricsSummary = `
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
            <div class="p-2 bg-white rounded-lg border border-teal-200">
              <span class="text-slate-500 font-sans block">Geosmin 几何土味素</span>
              <strong class="text-teal-800 text-sm font-black">${item.metrics.geosminCurrent}</strong>
              <span class="text-slate-400 text-xs block">红线限值: 10 ng/kg</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200">
              <span class="text-slate-500 font-sans block">饲料转化率 (FCR)</span>
              <strong class="text-emerald-700 text-sm font-black">${item.metrics.fcr}</strong>
              <span class="text-emerald-600 text-xs block">饵料系数极佳</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
              <span class="text-slate-500 font-sans block">质构仪肌肉弹性评级</span>
              <strong class="text-slate-800 text-xs font-bold">${item.metrics.muscleFirmness}</strong>
            </div>
          </div>
        `;
      } else if (item.id === 'IPQC-20260819-04') {
        metricsSummary = `
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
            <div class="p-2 bg-white rounded-lg border border-emerald-200">
              <span class="text-slate-500 font-sans block">苗期 SPAD 初值</span>
              <strong class="text-emerald-800 text-sm font-black">${item.metrics.spadCurrent}</strong>
              <span class="text-emerald-600 text-xs block">基准合格线 ≥35</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200">
              <span class="text-slate-500 font-sans block">胚轴粗壮度</span>
              <strong class="text-slate-800 text-sm font-black">${item.metrics.stemDiameter}</strong>
              <span class="text-emerald-600 text-xs block">粗壮抗病</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
              <span class="text-slate-500 font-sans block">显微镜根系与死苗率</span>
              <strong class="text-emerald-700 text-xs font-bold">${item.metrics.rootHealth}</strong>
            </div>
          </div>
        `;
      }

      html += `
        <div class="p-4 bg-white/95 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-emerald-300 transition">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div class="flex items-center gap-2.5">
              <span class="font-extrabold text-slate-900 text-sm">${item.targetName}</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border whitespace-nowrap ${item.riskLevelBadge}">${item.riskLevelText}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-700">${item.growthStage}</span>
              <span>抽检: ${item.sampleTime}</span>
            </div>
          </div>

          <div class="text-xs text-slate-600 font-sans">
            🔬 <strong>检测仪器与方法:</strong> ${item.testMethod}
          </div>

          ${metricsSummary}

          <div class="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-950 font-sans text-xs space-y-1">
            <div><strong>🛡️ 质量前置预警方案:</strong> ${item.preemptiveActionName}</div>
            <div id="ipqc-status-${item.id}" class="text-xs text-teal-800 font-bold font-mono">${item.status === 'PENDING_ACTION' ? '🟡 待品质主管前置干预确认' : item.status}</div>
          </div>

          ${actionBtnHtml}
        </div>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * 一键下发生产过程动态干预指令 (Preemptive Quality Intervention)
   */
  triggerPreemptiveIntervention(engine, ipqcId) {
    const item = engine.inProcessQualityInspections.find(i => i.id === ipqcId);
    if (!item) return;

    item.isDispatched = true;

    if (item.actionType === 'nitrate_flush') {
      item.status = '✅ 已提前 6 天下发硝酸盐代谢促降指令 (进水硝态氮降低 30% · 采收前 48h 开启纯水微流代谢)';
      item.riskLevelText = '🟢 促降程序执行中 (预测出厂 <650 mg/kg)';
      item.riskLevelBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';

      this.renderInProcessQCStream(engine);

      alert(`⚡ 【前置干预成功 · 提前 6 天启动硝酸盐代谢促降程序！】\n\n` +
        `• 抽检单元: ${item.targetName} (${item.growthStage})\n` +
        `• 过程抽检发现: 叶柄组织汁液硝酸盐 1180 mg/kg (预测若不干预将超出母婴级 <800 标杆)\n` +
        `• 前置农艺干预调度:\n` +
        `  1. 水培进水回路硝态氮补入比即刻下调 30%；\n` +
        `  2. 采收前 48 小时自动切入微流纯水富氧代谢冲洗程序；\n` +
        `  3. 激活叶肉光合硝酸还原酶活性，促进其充分转化为蛋白质；\n` +
        `• 预测出厂品质: 硝酸盐稳定降至 620~680 mg/kg，100% 确保母婴级特级品质放行！`);
    } else if (item.actionType === 'sugar_boost') {
      item.status = '✅ 已提前 48 小时开启连续红蓝光增糖配方 (PPFD 280 · 夜间温差扩大至 10°C)';
      item.riskLevelText = '🟢 增糖诱导中 (预测出厂 4.25°Bx)';
      item.riskLevelBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';

      this.renderInProcessQCStream(engine);

      alert(`⚡ 【前置干预成功 · 采收前 48h 光温增糖配方已生效！】\n\n` +
        `• 抽检单元: ${item.targetName} (${item.growthStage})\n` +
        `• 过程抽检发现: 现阶段糖度为 3.65°Brix (距标杆 4.2°Brix 微欠)\n` +
        `• 前置农艺干预调度:\n` +
        `  1. 智能顶棚植物补光灯开启采收前连续红蓝光增糖配方 (延长 4 小时光照，PPFD 提升至 280 µmol/m²/s)；\n` +
        `  2. 联动温室环控将夜间目标温度下调 3.5°C，扩大昼夜温差至 10°C；\n` +
        `  3. 迫使光合碳水化合物在最后 48 小时内充分转化为可溶性单糖；\n` +
        `• 预测出厂品质: 采收时糖度将跃升至 4.25°Brix，清脆甘甜，达成免检特级标准！`);
    } else if (item.actionType === 'fish_depuration') {
      item.status = '✅ 已提前 7 天下发活水吊水工单 (已转入微气泡富氧吊水槽 72h 停食排毒)';
      item.riskLevelText = '🟢 吊水净化中 (预测出塘 0 ng/kg)';
      item.riskLevelBadge = 'bg-teal-100 text-teal-800 border-teal-300 font-bold';

      this.renderInProcessQCStream(engine);

      alert(`🌊 【前置干预成功 · 起捕前 7 天活水吊水净化调度已触发！】\n\n` +
        `• 抽检单元: ${item.targetName} (${item.growthStage})\n` +
        `• 过程抽检发现: 气相色谱测出微量 Geosmin (几何土味素) 8.5 ng/kg (接近 10 ng/kg 红线)\n` +
        `• 前置水产干预调度:\n` +
        `  1. 系统在起捕前 7 天自动生成调度指令，将成鱼转入【微气泡富氧活水吊水槽】；\n` +
        `  2. 开启 72~120 小时停食吊水与大流量无饵纯水冲淋；\n` +
        `  3. 启动微纳米气泡暴气，加速鱼体鳃部与脂肪组织排出土味素；\n` +
        `• 预测出厂品质: 复检 Geosmin 降为 0 ng/kg 完全无腥，守牢免检出塘口碑！`);
    }
  },

  /**
   * 渲染质量 CAPA 纠偏工单流
   */
  renderQualityCAPATickets(engine) {
    const container = document.getElementById('quality-capa-stream');
    if (!container || !engine.qualityCAPATickets) return;

    let html = '';
    engine.qualityCAPATickets.forEach(t => {
      let dispatchBtnHtml = '';
      if (t.canDispatch) {
        dispatchBtnHtml = `
          <div class="pt-1.5 border-t border-slate-100 flex justify-end">
            <button onclick="DataEngine.dispatchQualityCAPA('${t.id}')" class="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 whitespace-nowrap">
              🚀 一键下发 CAPA 纠偏指令
            </button>
          </div>
        `;
      }

      html += `
        <div class="p-3.5 bg-white/95 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900 text-xs">${t.id}</span>
              <span class="text-xs px-2 py-0.5 rounded font-mono font-bold bg-purple-100 text-purple-800 border border-purple-300 whitespace-nowrap">${t.type}</span>
            </div>
            <span class="text-xs text-slate-500 font-mono whitespace-nowrap">责任: ${t.department}</span>
          </div>
          <div class="p-2 bg-slate-50 rounded-xl text-slate-700 font-sans text-xs">
            ⚠️ <strong>触发原因:</strong> ${t.triggerReason}
          </div>
          <div class="p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl text-purple-950 font-sans text-xs">
            💡 <strong>CAPA 纠正与预防方案:</strong> ${t.actionPlan}
            <div id="quality-capa-status-${t.id}" class="text-xs text-purple-700 font-bold font-mono mt-1">${t.status}</div>
          </div>
          ${dispatchBtnHtml}
        </div>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * 品质主管一键数字签名放行
   */
  approveQualityBatch(engine, batchId) {
    const target = engine.qualityBatches.find(b => b.id === batchId);
    if (!target) return;

    target.status = 'RELEASED';
    target.statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    target.statusText = '✅ 电子签名放行 (已生成 e-COA)';
    target.canApprove = false;
    target.ecoaId = `eCOA-20260819-${batchId.replace('LOT-', '')}-RELEASED`;
    target.sha256 = '0x38b29c910a88bf20084c81b29a8f4c1b99824c90b2';

    this.renderQualityBatchesTable(engine);

    alert(`✍️ 【批次 ${batchId} 质检放行成功！】\n\n` +
      `• 放行产品: ${target.productName}\n` +
      `• 签署质检官: 品质主管 · 王工 (数字私钥验签通过)\n` +
      `• 生成 e-COA 编号: ${target.ecoaId}\n` +
      `• 区块链 SHA-256 存证: ${target.sha256}\n` +
      `• 联动效果: 该批次已自动同步允许 B2B 冷链专车装车出厂，并已向 C 端一物一码主链注入质检合格证明！`);
  },

  /**
   * 一键下发质量 CAPA 纠偏指令
   */
  dispatchQualityCAPA(engine, capaId) {
    const target = engine.qualityCAPATickets.find(t => t.id === capaId);
    if (!target) return;

    if (capaId === 'CAPA-2026-0819-01') {
      target.status = '✅ 指令已送达种植长工作台 (下茬光配方已动态修正)';
    } else if (capaId === 'CAPA-2026-0819-02') {
      target.status = '✅ 指令已送达养殖长工作台 (微滤机压差反冲洗频次已提高 25%)';
    } else {
      target.status = '✅ 指令已送达生产调度台 (闭环执行中)';
    }
    target.canDispatch = false;

    this.renderQualityCAPATickets(engine);

    alert(`🚀 【质量 CAPA 纠偏指令已正式下发！】\n\n` +
      `• 工单编号: ${target.id}\n` +
      `• 接收部门: ${target.department}\n` +
      `• 触发原因: ${target.triggerReason}\n` +
      `• 纠偏动作: ${target.actionPlan}\n` +
      `• 闭环机制: 生产调度台已自动接入并调整执行参数，持续消除质量偏离！`);
  },

  /**
   * 调取并查看全项理化检验报告 (e-COA)
   */
  openLabReportModal(engine, batchId) {
    const target = engine.qualityBatches.find(b => b.id === batchId);
    if (!target) return;

    alert(`🔬 【全项理化与微生物出厂检验报告 (e-COA 原始记录)】\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `【基本信息】\n` +
      `• 批次编号: ${target.id}\n` +
      `• 产品品类: ${target.productName}\n` +
      `• 来源产区: ${target.sourceRaceway}\n` +
      `• 检验时间: ${target.inspectTime} (质检官: ${target.inspector})\n\n` +
      `【第一维度：安全红线指标】\n` +
      `• 硝酸盐 (UV-Vis): ${target.nitrate} mg/kg (母婴级严选限值 < 800.0 mg/kg) 🟢 合格\n` +
      `• 62项化学农残 (胆碱酯酶抑制法): 0 检出 (检出限 < 0.01 mg/kg) 🟢 合格\n` +
      `• 4项重金属 (AAS 原子吸收): Pb<0.002, Cd<0.001 mg/kg 🟢 远优于国标\n` +
      `• 致病菌 (沙门氏菌/单增李斯特菌): ${target.salmonella} 🟢 合格\n\n` +
      `【第二维度：营养与风味指标】\n` +
      `• 维生素 C (HPLC): ${target.vitaminC} mg/100g (较传统大棚 +110%) 💎 超额富集\n` +
      `• 糖度 Brix (折光仪): ${target.sugarBrix} °Brix (清脆鲜甜无苦涩)\n` +
      `• 粗蛋白质含量: ${target.crudeProtein}%\n` +
      `• 微量元素 (铁 Fe): ${target.microFe} mg/100g\n\n` +
      `【出厂放行与防伪认证】\n` +
      `• 放行状态: ${target.statusText}\n` +
      `• e-COA 编号: ${target.ecoaId}\n` +
      `• 数字私钥签章: ${target.sha256}`);
  }
};

