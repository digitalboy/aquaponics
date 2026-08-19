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
  },

  /**
   * =========================================================================
   * 社媒舆情大盘与 AI 品牌心智分析交互控制器 (Social Sentiment Controllers)
   * =========================================================================
   */
  socialPostsData: {
    'post-1': {
      platform: 'xhs',
      platformIcon: '📕',
      author: '@萌宝辅食日记 (粉丝 12.5w)',
      tag: '小红书母婴达人',
      time: '2026-08-19 14:15 · 杭州',
      sentimentBadge: '💖 极度好评 (99%)',
      sentimentClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      content: '“终于买到了做宝宝辅食的真·母婴级生菜！带去实验室测了硝酸盐只有 620mg，远低于欧盟 2500mg 标准，生吃脆甜无苦味，宝宝一口气吃了大半碗蔬菜泥！顺丰冷链包装太专业了！”',
      stats: '<span>❤️ 2,840 赞</span><span>💬 382 评论</span><span>⭐ 1,420 收藏</span><span class="text-rose-600 font-bold">🛒 带货转化: 142 盒</span>',
      keywords: ['🍃 清脆爽口 (84%)', '👶 宝宝爱吃 (76%)', '🧪 无硝酸盐苦涩 (68%)', '📦 顺丰冷链保鲜 (92%)'],
      aiReply: '“感谢宝妈的专业认可！我们的奶油生菜在工厂采收前经过了 48 小时远红光转化与活化停氮，让内源硝酸盐彻底转化为甘氨酸，宝宝吃得健康，妈妈更安心！私信为您送上本批次北京普析 62 项盲检 e-COA 电子防伪报告与专属体验礼遇！”'
    },
    'post-2': {
      platform: 'douyin',
      platformIcon: '🎵',
      author: '@大雄的品质厨房 (点赞 35w)',
      tag: '抖音美食测评',
      time: '2026-08-19 11:20 · 上海',
      sentimentBadge: '💖 极度好评 (96%)',
      sentimentClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      content: '“【加州鲈盲测开箱】清蒸 8 分钟开盖真的一点土腥味都没有！肉质像蒜瓣一样紧致 Q 弹！最绝的是扫包装上的一物一码，能直接看到这条鱼在工厂恒温水槽里 21 天的生长延时视频，工业化养殖确实强！”',
      stats: '<span>❤️ 1.8w 赞</span><span>💬 1,240 评论</span><span>▶️ 18.5w 播放</span><span class="text-slate-900 font-bold">🛒 带货转化: 86 份</span>',
      keywords: ['🐟 0土腥味 (94%)', '🥩 蒜瓣肉Q弹 (88%)', '📱 扫码延时摄影 (91%)', '🧊 顺丰活水保鲜 (86%)'],
      aiReply: '“感谢大厨的硬核测评！我们的加州鲈在起捕前均经过 72 小时微纳米纯氧活水吊水净化，将 Geosmin 土腥味分子彻底降解为 0！期待下期与您联合共创《母婴级清蒸鲈鱼》米其林食谱！”'
    },
    'post-3': {
      platform: 'xhs',
      platformIcon: '📕',
      author: '@硬核成分党Dr.Li (粉丝 28w)',
      tag: '食品科学博士',
      time: '2026-08-18 19:40 · 北京',
      sentimentBadge: '🔬 专业背书 (98%)',
      sentimentClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      content: '“横评了市面上 6 款号称‘水培有机’的生菜。碧波鲜源的糖度达到了 4.3°Bx（普通水培只有 2.5），果胶硬度 820g，完全没有化肥水培菜那种水哒哒软塌塌的口感。他们的鱼菜共生微生态系统确实把硝态氮转化做得极其彻底。”',
      stats: '<span>❤️ 4,520 赞</span><span>💬 520 评论</span><span>⭐ 3,890 收藏</span><span class="text-indigo-700 font-bold">🛒 带货转化: 210 年卡</span>',
      keywords: ['🧬 果胶硬度820g (95%)', '🍭 糖度4.3°Bx (92%)', '🌿 微生物完全转化 (89%)'],
      aiReply: '“感谢李博士严谨的理化数据横评！数字化农业工厂正是通过 FvCB 光合模型与 SPS 蔗糖合成动力学精准调光，才实现了脆甜高糖与母婴级超低硝酸盐。已为您开放工厂 3D 数字孪生与试验舱数据通道！”'
    },
    'post-4': {
      platform: 'douyin',
      platformIcon: '🎵',
      author: '@减脂期的小甜 (真实买家)',
      tag: '周订会员',
      time: '2026-08-18 16:30 · 深圳',
      sentimentBadge: '💡 新品需求线索',
      sentimentClass: 'bg-amber-100 text-amber-800 border-amber-300',
      content: '“生菜和鲈鱼都很棒，但现在减脂打工人真的很需要【羽衣甘蓝鲜榨汁组合包】和【免浆免洗黑鱼/鲈鱼片】！希望能尽快上线新 SKU，我一定每周订！”',
      stats: '<span>❤️ 340 赞</span><span>💬 86 评论</span><span class="text-amber-700 font-bold">AI识别: 爆款高潜</span>',
      keywords: ['🥤 羽衣甘蓝青汁 (96%)', '🥩 免浆免洗鱼柳 (88%)', '📅 周订续费意愿 (100%)'],
      aiReply: '“您的建议已直达我们研发主管工作台！我们的 12 座科研种植试验舱已在测试【富硒高花青素羽衣甘蓝】与【瞬冷免浆鲈鱼片】，预计 14 天内完成中试并为您寄送首批尝鲜礼盒！”'
    }
  },

  /**
   * 刷新社媒舆情
   */
  refreshSocialSentiment() {
    alert('🔄 【全网社媒爬虫引擎已完成增量同步】\n\n• 小红书: 新捕获 42 篇笔记 (正面率 98.2%)\n• 抖音: 新捕获 18 条带货短视频 (播放量 +140w)\n• 微信视频号: 互动点赞 +2,400\n• 综合 NPS 得分保持在 92.6 分，暂无负面危机预警！');
  },

  /**
   * 筛选社媒平台
   */
  filterSocialPlatform(platform) {
    const btns = {
      all: document.getElementById('btn-social-all'),
      xhs: document.getElementById('btn-social-xhs'),
      douyin: document.getElementById('btn-social-douyin'),
      wx: document.getElementById('btn-social-wx')
    };

    Object.keys(btns).forEach(k => {
      if (btns[k]) {
        if (k === platform) {
          btns[k].className = 'px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold transition cursor-pointer';
        } else {
          btns[k].className = 'px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 transition cursor-pointer';
        }
      }
    });

    const container = document.getElementById('social-feed-container');
    if (!container) return;

    // 简单筛选展示
    const cards = container.children;
    for (let i = 0; i < cards.length; i++) {
      if (platform === 'all') {
        cards[i].classList.remove('hidden');
      } else if (platform === 'xhs') {
        if (i === 0 || i === 2) cards[i].classList.remove('hidden');
        else cards[i].classList.add('hidden');
      } else if (platform === 'douyin') {
        if (i === 1 || i === 3) cards[i].classList.remove('hidden');
        else cards[i].classList.add('hidden');
      } else if (platform === 'wx') {
        cards[i].classList.remove('hidden');
      }
    }
  },

  /**
   * 查看社媒帖子详情下钻
   */
  showSocialDetail(postId) {
    const post = this.socialPostsData[postId] || this.socialPostsData['post-1'];
    
    const iconEl = document.getElementById('modal-social-icon');
    if (iconEl) iconEl.textContent = post.platformIcon;

    const authorEl = document.getElementById('modal-social-author');
    if (authorEl) authorEl.textContent = post.author;

    const tagEl = document.getElementById('modal-social-tag');
    if (tagEl) tagEl.textContent = post.tag;

    const timeEl = document.getElementById('modal-social-time');
    if (timeEl) timeEl.textContent = post.time;

    const contentEl = document.getElementById('modal-social-content');
    if (contentEl) contentEl.textContent = post.content;

    const statsEl = document.getElementById('modal-social-stats');
    if (statsEl) statsEl.innerHTML = post.stats;

    const badgeEl = document.getElementById('modal-social-sentiment-badge');
    if (badgeEl) {
      badgeEl.textContent = post.sentimentBadge;
      badgeEl.className = `px-2.5 py-0.5 rounded-full font-bold text-xs border ${post.sentimentClass}`;
    }

    const aiReplyEl = document.getElementById('modal-social-ai-reply');
    if (aiReplyEl) aiReplyEl.textContent = post.aiReply;

    const modal = document.getElementById('modal-social-post-detail');
    if (modal) modal.classList.remove('hidden');
  },

  /**
   * 关闭社媒帖子详情弹窗
   */
  closeSocialModal() {
    const modal = document.getElementById('modal-social-post-detail');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * 发送官方回复与私信
   */
  sendOfficialReply() {
    this.closeSocialModal();
    alert('💌 【官方公关回复与私信已发送成功！】\n\n• 已通过小红书/抖音开放平台官方企业蓝V接口自动发表评论\n• 已附带北京普析 e-COA 电子质检单与 21 天生长延时溯源码\n• 已向博主私信派发【母婴辅食高端定制品鉴装】提货券！');
  },

  /**
   * 爆款新品直连研发主管 12 座试验舱
   */
  dispatchNewProductToRnd() {
    alert('🚀 【爆款新品研发工单已下发至研发主管中台！】\n\n' +
      '• 抓取线索: 小红书/抖音近期“羽衣甘蓝青汁抗氧化”与“免浆低脂鲈鱼片”搜索量暴涨 340%\n' +
      '• 派发目标: 研发主管工作台 · 12 座科研种植试验舱 (Nursery R&D)\n' +
      '• 试验任务: 启动 DOE 正交试验 (UV-A 激发花青素配方 + 瞬冷免浆工艺)\n' +
      '• 预期周期: 14 天内完成商业数字配方签发，无缝放大至 48 米跑道量产！');
  },

  /**
   * 包装与规格优化建议
   */
  applyPackagingUpgrade() {
    alert('📦 【包装升级工单已下发至后道包装线！】\n\n• 诉求来源: 28% 中产小家庭反馈 500g 生菜分量偏大\n• 优化方案: 推出 200g 奶油生菜 + 小叶茼蒿“免洗鲜萃双拼盒”\n• 联动动作: 已向机械臂包装分选机下发新打样尺寸指令，预计下周上市！');
  },

  /**
   * 生成成分党科普公关文案
   */
  generatePrContent() {
    alert('📄 【AI 成分党科普短视频与推文已生成！】\n\n' +
      '• 主题: 《从鱼粪到母婴级蔬菜：揭秘鱼菜共生硝化菌生物转化奥秘》\n' +
      '• 证据链: 附带本批次 e-COA 电子防伪质检单 (硝酸盐 620mg/kg, 62项农残0检出)\n' +
      '• 分发渠道: 已一键推送至小红书官方号、抖音蓝V及 1,280 位会员私域群！');
  },

  /**
   * =========================================================================
   * 会员 360° 全息档案与客户全生命周期智能检索控制器 (Customer 360 & CRM)
   * =========================================================================
   */
  customersData: {
    'zhang': {
      id: 'CUST-HZ-2025-08821',
      name: '张女士 (钻石认养年卡会员)',
      avatar: '👑',
      phone: '138****8821',
      city: '浙江省杭州市 · 余杭区绿城桃花源',
      joinDays: 342,
      tagClass: 'bg-purple-100 text-purple-900 border-purple-300',
      tags: ['👑 钻石认养年卡', '👶 育儿辅食家庭', '高品质敏感型', 'LTV ¥12,800', '周均复购 1 次', 'NPS 推荐 10分'],
      slotAsset: {
        slotId: '#RA-B03-R02C04',
        crop: '波士顿奶油生菜',
        day: 18,
        status: '生长健壮 (预计采收 Day 21)',
        streamOnline: true
      },
      metrics: {
        totalSpent: '¥ 5,940',
        fulfilledWeeks: '48 / 52 周',
        avgRating: '5.0 ★★★★★',
        csatRate: '100%'
      },
      orders: [
        {
          orderId: 'ORD-20260818-8821',
          date: '2026-08-18 10:30',
          items: '每周鲜萃母婴生菜礼盒 (250g×2) + 活泉加州鲈净菜包 (500g×1)',
          amount: '¥ 144.00',
          status: '已送达 (顺丰冷链车载 3.2°C)',
          ecoa: 'eCOA-20260818-VEG03 (实测硝酸盐 620mg/kg)'
        },
        {
          orderId: 'ORD-20260811-7712',
          date: '2026-08-11 09:15',
          items: '每周鲜萃母婴生菜礼盒 (250g×2) + 活泉加州鲈净菜包 (500g×1)',
          amount: '¥ 144.00',
          status: '已送达 (顺丰冷链车载 2.8°C)',
          ecoa: 'eCOA-20260811-VEG01 (实测硝酸盐 590mg/kg)'
        },
        {
          orderId: 'ORD-20260804-6631',
          date: '2026-08-04 10:00',
          items: '专属水培浮板认养年卡 (52周全季定制周配首期)',
          amount: '¥ 1,980.00',
          status: '年卡履约中 (剩余 4 周到期)',
          ecoa: '包含 52 期专属质检电子防伪单'
        }
      ],
      communications: [
        {
          time: '2026-08-14 18:14',
          channel: '📱 小程序在线客服',
          topic: '咨询生菜外叶微黄与保存方式',
          summary: '用户反馈收到生菜外缘有一片微黄。AI 客服在 0.8 秒内调取当日光照 DLI 与冷链温控数据，解释为远红光增糖生理自然褪色，并自动赠送 ¥20 礼遇券，用户非常满意给出 5 星好评。'
        },
        {
          time: '2026-08-01 10:20',
          channel: '📞 专属企微 1v1 管家',
          topic: '建议增加羽衣甘蓝周配选项',
          summary: '会员表示减脂期希望能搭配羽衣甘蓝榨汁。管家已登记并联动农艺排产中台。'
        },
        {
          time: '2026-07-15 09:30',
          channel: '📕 小红书互动',
          topic: '达人发帖 @萌宝辅食日记 好评分享',
          summary: '发帖“真·母婴级生菜辅食测评”获 2,840 赞，官方蓝V互动并赠送加州鲈冷鲜体验装。'
        }
      ],
      aiRecommendations: [
        {
          badge: '👑 年卡续费攻坚 (倒计时 28 天)',
          title: '该会员认养年卡即将到期，近期高频关注羽衣甘蓝新品',
          actionText: '一键派发续费礼遇 (赠52周羽衣甘蓝定制)',
          type: 'renewal'
        },
        {
          badge: '🎁 专属 VIP 关怀',
          title: '高净值忠实口碑用户，NPS 推荐 10 分',
          actionText: '发起企微 VIP 专属问候',
          type: 'vip'
        }
      ]
    },

    'lin': {
      id: 'CUST-SH-2026-05562',
      name: '林妈妈 (母婴辅食周期购会员)',
      avatar: '👶',
      phone: '139****5562',
      city: '上海市 · 浦东新区碧云国际社区',
      joinDays: 180,
      tagClass: 'bg-pink-100 text-pink-900 border-pink-300',
      tags: ['👶 母婴辅食核心客群', '极度关注低硝酸盐', '0化学农药敏感', 'LTV ¥6,200', '周订 2 盒生菜'],
      slotAsset: {
        slotId: '周配共享跑道 #RA-A02',
        crop: '母婴级奶油生菜',
        day: 14,
        status: '光照转化中 (硝酸盐 < 600mg)',
        streamOnline: true
      },
      metrics: {
        totalSpent: '¥ 3,420',
        fulfilledWeeks: '24 / 24 周',
        avgRating: '4.9 ★★★★★',
        csatRate: '100%'
      },
      orders: [
        {
          orderId: 'ORD-20260817-5562',
          date: '2026-08-17 11:20',
          items: '母婴级低硝酸盐生菜鲜萃礼盒 (250g×2)',
          amount: '¥ 76.00',
          status: '已送达 (冷链车载 3.0°C)',
          ecoa: 'eCOA-20260817-VEG02 (农残0检出)'
        },
        {
          orderId: 'ORD-20260810-4419',
          date: '2026-08-10 10:45',
          items: '母婴级低硝酸盐生菜鲜萃礼盒 (250g×2)',
          amount: '¥ 76.00',
          status: '已送达 (冷链车载 2.9°C)',
          ecoa: 'eCOA-20260810-VEG04 (硝酸盐610mg/kg)'
        }
      ],
      communications: [
        {
          time: '2026-08-12 14:30',
          channel: '📱 小程序在线客服',
          topic: '查验北京普析 62 项农残检测单',
          summary: '会员索取最新批次农残检测报告，AI 客服秒级推送权威 e-COA 报告，会员确认无误并续订 12 周。'
        }
      ],
      aiRecommendations: [
        {
          badge: '🍼 母婴营养升级',
          title: '宝宝已满 9 个月，可推荐搭配高蛋白活泉加州鲈鱼柳辅食包',
          actionText: '赠送鲈鱼柳辅食尝鲜装 (¥0元领)',
          type: 'sample'
        }
      ]
    },

    'chen': {
      id: 'CUST-SZ-2026-09918',
      name: '陈先生 (健身减脂轻食周配会员)',
      avatar: '🥗',
      phone: '136****9918',
      city: '广东省深圳市 · 南山区高新园',
      joinDays: 95,
      tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      tags: ['🥗 健身轻食白领', '高蛋白鲈鱼忠粉', '高频加购', 'LTV ¥4,100', '周订 2 份鱼柳'],
      slotAsset: {
        slotId: '活泉吊水池 #TANK-01',
        crop: '高蛋白加州鲈 (吊水72h)',
        day: 22,
        status: '微纳米纯氧净化中 (0土腥味)',
        streamOnline: true
      },
      metrics: {
        totalSpent: '¥ 2,240',
        fulfilledWeeks: '14 / 14 周',
        avgRating: '5.0 ★★★★★',
        csatRate: '100%'
      },
      orders: [
        {
          orderId: 'ORD-20260816-9918',
          date: '2026-08-16 09:30',
          items: '活泉加州鲈鲜切冷链净菜包 (500g×2) + 鲜萃生菜 (250g×1)',
          amount: '¥ 174.00',
          status: '已送达 (顺丰冷鲜直达)',
          ecoa: 'eCOA-20260816-FISH01 (Geosmin 0检出)'
        }
      ],
      communications: [
        {
          time: '2026-08-05 19:10',
          channel: '🎵 抖音带货直播间互动',
          topic: '好评反馈鱼肉无刺且无土腥味',
          summary: '在抖音直播间评论“加州鲈清蒸微波即食太方便”，获主播置顶并加赠 1 盒鲜萃生菜。'
        }
      ],
      aiRecommendations: [
        {
          badge: '🥩 新品优先内测',
          title: '针对高频健身买家，推荐优先试吃研发主管即将上市的【瞬冷免浆鲈鱼片】',
          actionText: '邀请加入新品体验官群',
          type: 'newproduct'
        }
      ]
    },

    'wang': {
      id: 'CUST-BJ-2025-03341',
      name: '王教授 (健康养生银发年卡 · 临期关怀)',
      avatar: '⚠️',
      phone: '137****3341',
      city: '北京市 · 海淀区万柳华府',
      joinDays: 350,
      tagClass: 'bg-amber-100 text-amber-900 border-amber-300',
      tags: ['👑 高净值银发养生族', '年卡剩余15天', '专属浮板认养', 'LTV ¥7,900', '对送货准时度敏感'],
      slotAsset: {
        slotId: '#RA-A01-R01C02',
        crop: '富硒羽衣甘蓝 + 生菜',
        day: 20,
        status: '生长成熟 (等待周配采收)',
        streamOnline: true
      },
      metrics: {
        totalSpent: '¥ 3,960',
        fulfilledWeeks: '50 / 52 周',
        avgRating: '4.8 ★★★★★',
        csatRate: '100%'
      },
      orders: [
        {
          orderId: 'ORD-20260815-3341',
          date: '2026-08-15 08:30',
          items: '专属浮板定制周配礼盒 (生菜×2 + 羽衣甘蓝×1)',
          amount: '¥ 0.00 (年卡扣减)',
          status: '已送达 (顺丰小哥送货上门)',
          ecoa: 'eCOA-20260815-VEG01'
        }
      ],
      communications: [
        {
          time: '2026-08-10 11:00',
          channel: '📱 小程序好评',
          topic: '表扬顺丰冷链小哥礼貌送上门',
          summary: '老人反馈每周六上午 9 点准时送达，蔬菜新鲜脆甜，家人非常放心。'
        }
      ],
      aiRecommendations: [
        {
          badge: '⚠️ 核心年卡续费防流失',
          title: '认养年卡还剩 15 天到期，系统判定续费意愿极高',
          actionText: '一键派发银发 VIP 续费 88 折 + 赠高钙菜礼遇',
          type: 'renewal_silver'
        }
      ]
    }
  },

  /**
   * 渲染会员 360° 全息档案
   */
  renderCustomerProfile(customerId) {
    const cust = this.customersData[customerId] || this.customersData['zhang'];
    const container = document.getElementById('customer-profile-card-container');
    if (!container) return;

    // 组装 HTML
    container.innerHTML = `
      <div class="space-y-5 animate-fadeIn font-sans text-xs">
        
        <!-- 1. 用户核心画像大卡 (Customer Persona Header) -->
        <div class="p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              ${cust.avatar}
            </div>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <strong class="text-base text-slate-900 font-bold font-sans">${cust.name}</strong>
                <span class="px-2.5 py-0.5 rounded-full ${cust.tagClass} text-xs font-mono font-bold border">
                  ${cust.id}
                </span>
                <span class="text-xs text-slate-500 font-mono">入会已 ${cust.joinDays} 天</span>
              </div>
              <div class="text-xs text-slate-600 font-medium flex items-center gap-3">
                <span>📱 电话: <strong class="text-slate-900 font-mono">${cust.phone}</strong></span>
                <span>📍 地址: ${cust.city}</span>
              </div>
              <!-- 画像标签 -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                ${cust.tags.map(t => `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">${t}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- 右侧关键资产与核心指标 -->
          <div class="flex flex-wrap items-center gap-4 text-right">
            <div class="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-left">
              <span class="text-[11px] text-purple-700 font-bold block">🌱 认养专属孔位资产</span>
              <strong class="text-xs text-slate-900 font-mono block">${cust.slotAsset.slotId}</strong>
              <span class="text-[11px] text-slate-600 font-sans">${cust.slotAsset.crop} · ${cust.slotAsset.status}</span>
            </div>
            <div class="space-y-1">
              <div><span class="text-slate-500">累计消费:</span> <strong class="text-purple-700 font-mono font-black text-sm">${cust.metrics.totalSpent}</strong></div>
              <div><span class="text-slate-500">履约周期:</span> <strong class="text-slate-900 font-mono font-bold">${cust.metrics.fulfilledWeeks}</strong></div>
              <div><span class="text-slate-500">历史满意度:</span> <strong class="text-emerald-700 font-mono font-bold">${cust.metrics.avgRating}</strong></div>
            </div>
          </div>

        </div>

        <!-- 2. 三栏并列：历史订单与冷链履约 (5列) + 交流与客诉历史 (4列) + AI 专属运营建议 (3列) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <!-- (1) 全生命周期历史订单与冷链轨迹 (5列) -->
          <div class="lg:col-span-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span>📦</span> 历史履约订单 (${cust.orders.length} 笔代表)
              </span>
              <span class="text-slate-400 font-mono text-[11px]">顺丰冷链车载直达</span>
            </div>

            <div class="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 font-sans">
              ${cust.orders.map(o => `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition space-y-1.5 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-mono font-bold text-slate-900 text-xs">${o.orderId}</span>
                    <span class="font-mono text-slate-500 text-[11px]">${o.date}</span>
                  </div>
                  <p class="text-slate-700 font-medium leading-relaxed">${o.items}</p>
                  <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono text-[11px]">
                    <span class="text-purple-700 font-bold text-xs">${o.amount}</span>
                    <span class="text-emerald-700 font-medium">${o.status}</span>
                  </div>
                  <div class="text-[11px] text-indigo-700 font-mono pt-0.5">
                    📄 ${o.ecoa}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- (2) 多渠道交流与 AI 客服互动历史 (4列) -->
          <div class="lg:col-span-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <span>💬</span> 沟通与服务工单记录 (${cust.communications.length} 条)
              </span>
              <span class="text-emerald-700 font-mono font-bold text-[11px]">满意度 100%</span>
            </div>

            <div class="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 font-sans">
              ${cust.communications.map(c => `
                <div class="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-indigo-900 text-xs">${c.channel}</span>
                    <span class="font-mono text-slate-400 text-[11px]">${c.time}</span>
                  </div>
                  <strong class="text-slate-800 text-xs block">${c.topic}</strong>
                  <p class="text-slate-600 leading-relaxed font-medium text-xs">${c.summary}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- (3) AI 客户经营洞察与专属行动引擎 (3列) -->
          <div class="lg:col-span-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-2 border-indigo-300 shadow-sm space-y-3 flex flex-col justify-between">
            
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-indigo-200 pb-2">
                <span class="font-extrabold text-xs text-indigo-950 flex items-center gap-1">
                  <span>💡</span> AI 客户经营策略
                </span>
                <span class="px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-mono font-bold text-[10px]">Copilot</span>
              </div>

              ${cust.aiRecommendations.map(r => `
                <div class="p-3 rounded-xl bg-white border border-indigo-200 space-y-2 shadow-xs">
                  <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[11px] block">
                    ${r.badge}
                  </span>
                  <p class="text-slate-700 text-xs leading-relaxed font-medium">
                    ${r.title}
                  </p>
                  <button 
                    onclick="RetailCopilotController.executeCustomerAction('${cust.name}', '${r.actionText}')" 
                    class="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition cursor-pointer shadow-xs">
                    ${r.actionText}
                  </button>
                </div>
              `).join('')}
            </div>

            <div class="pt-2 border-t border-indigo-200 text-[11px] text-slate-500 font-mono text-center">
              LTV 预测增益: <strong class="text-purple-700">+¥2,400</strong>
            </div>

          </div>

        </div>

      </div>
    `;
  },

  /**
   * 搜索客户档案
   */
  searchCustomer() {
    const input = document.getElementById('retail-user-search-input');
    const query = input ? input.value.trim() : '';
    if (!query) {
      alert('请输入会员姓名、手机号或卡号进行搜索');
      return;
    }

    // 匹配
    let key = 'zhang';
    if (query.includes('林') || query.includes('5562') || query.includes('母婴') || query.includes('上海')) {
      key = 'lin';
    } else if (query.includes('陈') || query.includes('9918') || query.includes('健身') || query.includes('深圳')) {
      key = 'chen';
    } else if (query.includes('王') || query.includes('3341') || query.includes('银发') || query.includes('北京')) {
      key = 'wang';
    }

    this.quickSelectCustomer(key);
  },

  /**
   * 快捷切换标杆会员
   */
  quickSelectCustomer(key) {
    const btns = {
      zhang: document.getElementById('btn-cust-zhang'),
      lin: document.getElementById('btn-cust-lin'),
      chen: document.getElementById('btn-cust-chen'),
      wang: document.getElementById('btn-cust-wang')
    };

    Object.keys(btns).forEach(k => {
      if (btns[k]) {
        if (k === key) {
          btns[k].className = 'px-3 py-1.5 rounded-xl bg-purple-600 text-white border border-purple-600 font-extrabold transition cursor-pointer shadow-xs';
        } else {
          btns[k].className = 'px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold transition cursor-pointer';
        }
      }
    });

    const input = document.getElementById('retail-user-search-input');
    if (input) {
      if (key === 'zhang') input.value = '张女士 (138****8821)';
      else if (key === 'lin') input.value = '林妈妈 (139****5562)';
      else if (key === 'chen') input.value = '陈先生 (136****9918)';
      else if (key === 'wang') input.value = '王教授 (137****3341)';
    }

    this.renderCustomerProfile(key);
  },

  /**
   * 执行针对具体客户的 AI 运营动作
   */
  executeCustomerAction(customerName, actionText) {
    alert(`🎯 【会员专属运营动作执行成功！】\n\n` +
      `• 目标会员: ${customerName}\n` +
      `• 执行动作: ${actionText}\n` +
      `• 联动触达: 已通过企微私域助手向该会员推送定制礼遇卡券与消息！\n` +
      `• 运营归档: 动作日志已存证至 CRM 客户生命周期数据表。`);
  }
};


