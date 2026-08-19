/**
 * =========================================================================
 * 鱼菜共生数字工业化工厂 · Aquaponics Cloud OS
 * data-engine.js: 全厂细密遥测数据中枢主门面 (Data Engine Master Facade)
 * 已完成高内聚、低耦合微模块解耦：
 *   - mock-data.js             : 128+ 测点基准数据与数据工厂
 *   - sensor-simulator.js      : 800ms 物理高频扰动与环境计算引擎
 *   - aqua-hydro-view.js       : 养殖长 (10鱼池) 与种植长 (4菜池/24孔浮板) 控制器
 *   - retail-copilot.js        : 零售大屏、动力甘特图与 AI 客服决策 Copilot
 *   - hud-renderer.js          : 3D 数字孪生多设施全息 HUD 弹窗与巡检矩阵
 * =========================================================================
 */

const DataEngine = {
  ...MockDataFactory.createDefaultState(),

  /**
   * 初始化引擎：装载设施矩阵、首次渲染并启动 800ms 高频微扰动时钟
   */
  init() {
    // 1. 初始化生成 10 座鱼池、4 座水培跑道、浮板 24 孔位、试验舱与测温立柱
    MockDataFactory.populateFacilities(this);

    // 2. 首次渲染养殖长矩阵、种植长矩阵、浮板孔位矩阵、动力时序甘特图、会员工单流、B2B履约调度与品质实验室大盘
    this.renderAquaTankMatrix();
    this.renderHydroRacewayMatrix();
    this.renderRaftSlotGrid();
    this.renderEquipmentTimeline();
    this.renderMemberTicketStream();
    this.renderB2BFulfillmentTable();
    this.renderB2BTicketsStream();
    this.renderQualityInstruments();
    this.renderInProcessQCStream();
    this.renderQualityBatchesTable();
    this.renderQualityRetentionRooms();
    this.renderQualityCAPATickets();

    // 3. 启动 800ms 连续物理微扰动时序仿真
    setInterval(() => this.tick(), 800);
  },

  // ---------------------------------------------------------------------------
  // 1. 物理感知仿真与环境计算 (委托至 SensorSimulator)
  // ---------------------------------------------------------------------------
  calculateUIA(tank) {
    return SensorSimulator.calculateUIA(tank);
  },

  tick() {
    SensorSimulator.tick(this);
  },

  triggerDroneLaunch() {
    SensorSimulator.triggerDroneLaunch(this);
  },

  // ---------------------------------------------------------------------------
  // 2. 养殖长与种植长调度工作台 (委托至 AquaHydroViewController)
  // ---------------------------------------------------------------------------
  selectAquaTank(tankId) {
    AquaHydroViewController.selectAquaTank(this, tankId);
  },

  updateAquacultureViewMetrics() {
    AquaHydroViewController.updateAquacultureViewMetrics(this);
  },

  renderAquaTankMatrix() {
    AquaHydroViewController.renderAquaTankMatrix(this);
  },

  selectHydroRaceway(racewayId) {
    AquaHydroViewController.selectHydroRaceway(this, racewayId);
  },

  updateHydroponicsViewMetrics() {
    AquaHydroViewController.updateHydroponicsViewMetrics(this);
  },

  renderHydroRacewayMatrix() {
    AquaHydroViewController.renderHydroRacewayMatrix(this);
  },

  selectRaft(raftId) {
    AquaHydroViewController.selectRaft(this, raftId);
  },

  renderRaftSlotGrid() {
    AquaHydroViewController.renderRaftSlotGrid(this);
  },

  openPlantSlotModal(slotUid) {
    AquaHydroViewController.openPlantSlotModal(this, slotUid);
  },

  closePlantPassportModal() {
    AquaHydroViewController.closePlantPassportModal();
  },

  // ---------------------------------------------------------------------------
  // 3. 零售大屏、动力甘特图与 AI 客服决策 (委托至 RetailCopilotController)
  // ---------------------------------------------------------------------------
  switchExecutiveRole(role) {
    RetailCopilotController.switchExecutiveRole(this, role);
  },

  renderEquipmentTimeline() {
    RetailCopilotController.renderEquipmentTimeline(this);
  },

  renderMemberTicketStream() {
    RetailCopilotController.renderMemberTicketStream(this);
  },

  switchMiniAppTab(tab) {
    RetailCopilotController.switchMiniAppTab(tab);
  },

  quickSendFeedback(text) {
    RetailCopilotController.quickSendFeedback(this, text);
  },

  handleCustomFeedbackInput() {
    RetailCopilotController.handleCustomFeedbackInput(this);
  },

  sendMemberFeedback(content) {
    RetailCopilotController.sendMemberFeedback(this, content);
  },

  applyAICopilotSuggestion(type) {
    RetailCopilotController.applyAICopilotSuggestion(type);
  },

  renderB2BFulfillmentTable() {
    RetailCopilotController.renderB2BFulfillmentTable(this);
  },

  renderB2BTicketsStream() {
    RetailCopilotController.renderB2BTicketsStream(this);
  },

  dispatchEmergencyReplenishment(ticketId) {
    RetailCopilotController.dispatchEmergencyReplenishment(ticketId);
  },

  exportECOACertificate(batchId) {
    RetailCopilotController.exportECOACertificate(batchId);
  },

  applyDelayMitigation(shipmentId) {
    RetailCopilotController.applyDelayMitigation(this, shipmentId);
  },

  // ---------------------------------------------------------------------------
  // 4. 🔬 品质主管与驻厂实验室中台门面 (委托至 RetailCopilotController)
  // ---------------------------------------------------------------------------
  renderQualityInstruments() {
    RetailCopilotController.renderQualityInstruments(this);
  },

  renderInProcessQCStream() {
    RetailCopilotController.renderInProcessQCStream(this);
  },

  triggerPreemptiveIntervention(ipqcId) {
    RetailCopilotController.triggerPreemptiveIntervention(this, ipqcId);
  },

  renderQualityBatchesTable() {
    RetailCopilotController.renderQualityBatchesTable(this);
  },

  renderQualityRetentionRooms() {
    RetailCopilotController.renderQualityRetentionRooms(this);
  },

  renderQualityCAPATickets() {
    RetailCopilotController.renderQualityCAPATickets(this);
  },

  approveQualityBatch(batchId) {
    RetailCopilotController.approveQualityBatch(this, batchId);
  },

  dispatchQualityCAPA(capaId) {
    RetailCopilotController.dispatchQualityCAPA(this, capaId);
  },

  openLabReportModal(batchId) {
    RetailCopilotController.openLabReportModal(this, batchId);
  },

  // ---------------------------------------------------------------------------
  // 5. 3D 数字孪生全息 HUD 弹窗与巡检矩阵 (委托至 HUDRenderer)
  // ---------------------------------------------------------------------------
  setQuickTab(tabKey) {
    HUDRenderer.setQuickTab(this, tabKey);
  },

  selectEntity(entityId, entityType, entityName) {
    HUDRenderer.selectEntity(this, entityId, entityType, entityName);
  },

  renderSelectedHUD() {
    HUDRenderer.renderSelectedHUD(this);
  }
};

// 启动全厂遥测数据引擎
DataEngine.init();
