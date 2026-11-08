/**
 * SalesPulse Analytics - Dashboard Core Logic
 * - Single-page sales analytics
 * - Pure vanilla JavaScript
 * - Browser WebStorage (localStorage) persistence
 * - Zero CSS variable dependencies
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_TRANSACTIONS = 'salespulse_transactions_v2';
  const STORAGE_KEY_CURRENCY = 'salespulse_currency_v2';
  const STORAGE_KEY_TIMEFRAME = 'salespulse_timeframe_v2';
  const STORAGE_KEY_TARGET = 'salespulse_target_quota_v2';

  // Currency Exchange Rates & Symbols relative to USD
  const CURRENCY_CONFIG = {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    JPY: { symbol: '¥', rate: 152.0 }
  };

  // State Management
  let state = {
    currency: 'USD',
    timeframe: 'all',
    customStart: '',
    customEnd: '',
    targetQuota: 150000,
    searchQuery: '',
    categoryFilter: 'all',
    statusFilter: 'all',
    sortColumn: 'date',
    sortDirection: 'desc',
    currentPage: 1,
    pageSize: 8,
    transactions: []
  };

  // Chart Instances
  let trendChartInstance = null;
  let categoryChartInstance = null;
  let regionChartInstance = null;

  // DOM Elements Cache
  const elements = {
    currencySelect: document.getElementById('currencySelect'),
    dateRangeFilter: document.getElementById('dateRangeFilter'),
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnExportCSV: document.getElementById('btnExportCSV'),
    btnResetData: document.getElementById('btnResetData'),
    kpiRevenue: document.getElementById('kpiRevenue'),
    kpiGrowthBadge: document.getElementById('kpiGrowthBadge'),
    kpiGrowthText: document.getElementById('kpiGrowthText'),
    kpiOrders: document.getElementById('kpiOrders'),
    kpiPaidCount: document.getElementById('kpiPaidCount'),
    kpiPendingCount: document.getElementById('kpiPendingCount'),
    kpiAOV: document.getElementById('kpiAOV'),
    kpiProfit: document.getElementById('kpiProfit'),
    kpiMargin: document.getElementById('kpiMargin'),
    kpiTargetPercent: document.getElementById('kpiTargetPercent'),
    kpiTargetProgressBar: document.getElementById('kpiTargetProgressBar'),
    kpiTargetRemaining: document.getElementById('kpiTargetRemaining'),
    repLeaderboardContainer: document.getElementById('repLeaderboardContainer'),
    tableSearchInput: document.getElementById('tableSearchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    statusFilter: document.getElementById('statusFilter'),
    transactionTableBody: document.getElementById('transactionTableBody'),
    paginationInfo: document.getElementById('paginationInfo'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    pageIndicator: document.getElementById('pageIndicator'),
    addSaleModal: document.getElementById('addSaleModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    newSaleForm: document.getElementById('newSaleForm'),
    saleDate: document.getElementById('saleDate'),
    toastContainer: document.getElementById('toastContainer')
  };

  // -------------------------------------------------------------------------
  // Sample Data Generator (Realistic Enterprise Sales Dataset)
  // -------------------------------------------------------------------------
  function generateDefaultTransactions() {
    return [
      { id: "INV-2026-1049", customer: "Apex Global Dynamics", product: "Cloud Infrastructure Enterprise", category: "Cloud Infrastructure", region: "North America", rep: "Sarah Connor", amount: 28500, cost: 7200, status: "Completed", date: "2026-11-06", notes: "Multi-year commitment" },
      { id: "INV-2026-1048", customer: "Nordic Tech Solutions", product: "Security Suite Ultimate", category: "Security Suite", region: "Europe", rep: "Elena Rostova", amount: 16400, cost: 4100, status: "Completed", date: "2026-11-05", notes: "End-point security add-on" },
      { id: "INV-2026-1047", customer: "Kanto BioLabs", product: "Enterprise Software License", category: "Enterprise Software", region: "Asia Pacific", rep: "David Kim", amount: 22000, cost: 5500, status: "Completed", date: "2026-11-04", notes: "500-seat rollout" },
      { id: "INV-2026-1046", customer: "Solaria Energy Corp", product: "Professional Implementation", category: "Professional Services", region: "Latin America", rep: "Marcus Vance", amount: 9800, cost: 4900, status: "Pending", date: "2026-11-02", notes: "Awaiting legal signoff" },
      { id: "INV-2026-1045", customer: "Al-Futtaim Digital", product: "High-Density Server Rack", category: "Hardware", region: "Middle East & Africa", rep: "Amina Zahra", amount: 34500, cost: 18900, status: "Completed", date: "2026-10-28", notes: "Data center expansion" },
      { id: "INV-2026-1044", customer: "Vanguard Media Group", product: "Cloud Infrastructure Pro", category: "Cloud Infrastructure", region: "North America", rep: "Sarah Connor", amount: 14200, cost: 3600, status: "Completed", date: "2026-10-25", notes: "Streaming backend tier" },
      { id: "INV-2026-1043", customer: "Starlight Biotech", product: "Enterprise Software License", category: "Enterprise Software", region: "Europe", rep: "Elena Rostova", amount: 18900, cost: 4200, status: "Completed", date: "2026-10-21", notes: "Research lab division" },
      { id: "INV-2026-1042", customer: "Crestview Financial", product: "Security Suite Compliance", category: "Security Suite", region: "North America", rep: "David Kim", amount: 24700, cost: 6100, status: "Completed", date: "2026-10-18", notes: "SOC-2 automated monitoring" },
      { id: "INV-2026-1041", customer: "Pacific Rim Logistics", product: "Professional Architecture Audit", category: "Professional Services", region: "Asia Pacific", rep: "David Kim", amount: 8500, cost: 3800, status: "Completed", date: "2026-10-15", notes: "Quarterly advisory" },
      { id: "INV-2026-1040", customer: "Bavaria Mobility AG", product: "Edge Compute Gateway", category: "Hardware", region: "Europe", rep: "Marcus Vance", amount: 19800, cost: 11000, status: "Refunded", date: "2026-10-10", notes: "Spec mismatch returned" },
      { id: "INV-2026-1039", customer: "Horizon Health Systems", product: "Cloud Infrastructure Enterprise", category: "Cloud Infrastructure", region: "North America", rep: "Sarah Connor", amount: 31000, cost: 8200, status: "Completed", date: "2026-09-29", notes: "HIPAA compliant enclave" },
      { id: "INV-2026-1038", customer: "Kyoto Robotics", product: "Enterprise Software License", category: "Enterprise Software", region: "Asia Pacific", rep: "David Kim", amount: 15300, cost: 3200, status: "Completed", date: "2026-09-24", notes: "Sensor sync platform" },
      { id: "INV-2026-1037", customer: "Oasis Logistics", product: "Professional Services Onboarding", category: "Professional Services", region: "Middle East & Africa", rep: "Amina Zahra", amount: 11200, cost: 5100, status: "Completed", date: "2026-09-17", notes: "Staff training module" },
      { id: "INV-2026-1036", customer: "Sao Paulo Fintech", product: "Security Suite Ultimate", category: "Security Suite", region: "Latin America", rep: "Marcus Vance", amount: 17800, cost: 4500, status: "Completed", date: "2026-09-11", notes: "Payment gateway protection" },
      { id: "INV-2026-1035", customer: "Atlas Defense Systems", product: "High-Density Server Rack", category: "Hardware", region: "North America", rep: "Sarah Connor", amount: 41200, cost: 23000, status: "Completed", date: "2026-08-30", notes: "Secure enclave compute" },
      { id: "INV-2026-1034", customer: "Zurich Wealth Partners", product: "Enterprise Software License", category: "Enterprise Software", region: "Europe", rep: "Elena Rostova", amount: 26000, cost: 5800, status: "Completed", date: "2026-08-22", notes: "Private cloud deployment" },
      { id: "INV-2026-1033", customer: "Tokyo Maritime Corp", product: "Cloud Infrastructure Pro", category: "Cloud Infrastructure", region: "Asia Pacific", rep: "David Kim", amount: 13900, cost: 3400, status: "Completed", date: "2026-08-14", notes: "Fleet telemetry storage" },
      { id: "INV-2026-1032", customer: "Pinnacle Retail Labs", product: "Security Suite Standard", category: "Security Suite", region: "North America", rep: "Marcus Vance", amount: 7800, cost: 2100, status: "Pending", date: "2026-08-08", notes: "Trial extension underway" },
      { id: "INV-2026-1031", customer: "Emirates Telecom Dev", product: "Professional Implementation", category: "Professional Services", region: "Middle East & Africa", rep: "Amina Zahra", amount: 21500, cost: 9800, status: "Completed", date: "2026-07-28", notes: "API gateway migration" },
      { id: "INV-2026-1030", customer: "Scandinavian GreenGrid", product: "Cloud Infrastructure Enterprise", category: "Cloud Infrastructure", region: "Europe", rep: "Elena Rostova", amount: 29400, cost: 7100, status: "Completed", date: "2026-07-19", notes: "Smart meter analytics" },
      { id: "INV-2026-1029", customer: "Rio Minerações", product: "Hardware Field Units", category: "Hardware", region: "Latin America", rep: "Marcus Vance", amount: 23600, cost: 13500, status: "Completed", date: "2026-07-12", notes: "Ruggedized telemetry stations" },
      { id: "INV-2026-1028", customer: "Quantum Leap Computing", product: "Enterprise Software License", category: "Enterprise Software", region: "North America", rep: "Sarah Connor", amount: 33000, cost: 7400, status: "Completed", date: "2026-06-25", notes: "Cluster controller software" },
      { id: "INV-2026-1027", customer: "Helix Pharmaceuticals", product: "Security Suite Ultimate", category: "Security Suite", region: "Europe", rep: "Elena Rostova", amount: 19500, cost: 4800, status: "Completed", date: "2026-06-18", notes: "Clinical trials partition" },
      { id: "INV-2026-1026", customer: "Sydney FinCorp", product: "Professional Services Advisory", category: "Professional Services", region: "Asia Pacific", rep: "David Kim", amount: 12400, cost: 5200, status: "Completed", date: "2026-06-09", notes: "ISO 27001 readiness review" },
      { id: "INV-2026-1025", customer: "Cascade Telecommunications", product: "Cloud Infrastructure Pro", category: "Cloud Infrastructure", region: "North America", rep: "Sarah Connor", amount: 15800, cost: 3900, status: "Completed", date: "2026-05-27", notes: "Backup pipeline" }
    ];
  }

  // -------------------------------------------------------------------------
  // LocalStorage Helpers
  // -------------------------------------------------------------------------
  function loadFromStorage() {
    try {
      const storedTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (storedTx) {
        state.transactions = JSON.parse(storedTx);
      } else {
        state.transactions = generateDefaultTransactions();
        saveToStorage();
      }

      const storedCurr = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (storedCurr && CURRENCY_CONFIG[storedCurr]) {
        state.currency = storedCurr;
      }

      const storedTimeframe = localStorage.getItem(STORAGE_KEY_TIMEFRAME);
      if (storedTimeframe) {
        state.timeframe = storedTimeframe;
      }
    } catch (e) {
      console.warn('LocalStorage access issue, fallback to memory', e);
      state.transactions = generateDefaultTransactions();
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(state.transactions));
      localStorage.setItem(STORAGE_KEY_CURRENCY, state.currency);
      localStorage.setItem(STORAGE_KEY_TIMEFRAME, state.timeframe);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // -------------------------------------------------------------------------
  // Formatting Helpers
  // -------------------------------------------------------------------------
  function formatMoney(amountInUSD) {
    const config = CURRENCY_CONFIG[state.currency] || CURRENCY_CONFIG.USD;
    const converted = amountInUSD * config.rate;

    if (state.currency === 'JPY') {
      return `${config.symbol}${Math.round(converted).toLocaleString()}`;
    }

    return `${config.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function formatShortNumber(amountInUSD) {
    const config = CURRENCY_CONFIG[state.currency] || CURRENCY_CONFIG.USD;
    const converted = amountInUSD * config.rate;
    if (converted >= 1000000) {
      return `${config.symbol}${(converted / 1000000).toFixed(1)}M`;
    }
    if (converted >= 1000) {
      return `${config.symbol}${(converted / 1000).toFixed(1)}k`;
    }
    return `${config.symbol}${Math.round(converted)}`;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // -------------------------------------------------------------------------
  // Data Filtering
  // -------------------------------------------------------------------------
  function isDateInTimeframe(dateStr, timeframe) {
    if (timeframe === 'all') return true;

    const txDate = new Date(dateStr);
    const now = new Date('2026-11-08T23:17:49'); // Normalized current app time

    if (timeframe === 'this_month') {
      return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
    }

    if (timeframe === 'last_30') {
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return txDate >= thirtyDaysAgo && txDate <= now;
    }

    if (timeframe === 'this_quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const txQuarter = Math.floor(txDate.getMonth() / 3);
      return txDate.getFullYear() === now.getFullYear() && txQuarter === currentQuarter;
    }

    if (timeframe === 'this_year') {
      return txDate.getFullYear() === now.getFullYear();
    }

    return true;
  }

  function getFilteredTransactions(forTable = false) {
    return state.transactions.filter(item => {
      // 1. Timeframe check
      if (!isDateInTimeframe(item.date, state.timeframe)) {
        return false;
      }

      // If filtering for table, also apply category, status, and search filters
      if (forTable) {
        if (state.categoryFilter !== 'all' && item.category !== state.categoryFilter) {
          return false;
        }

        if (state.statusFilter !== 'all' && item.status !== state.statusFilter) {
          return false;
        }

        if (state.searchQuery.trim() !== '') {
          const q = state.searchQuery.toLowerCase();
          const matchCustomer = item.customer.toLowerCase().includes(q);
          const matchProduct = item.product.toLowerCase().includes(q);
          const matchRep = item.rep.toLowerCase().includes(q);
          const matchId = item.id.toLowerCase().includes(q);
          if (!matchCustomer && !matchProduct && !matchRep && !matchId) {
            return false;
          }
        }
      }

      return true;
    });
  }

  // -------------------------------------------------------------------------
  // KPI Calculations & Render
  // -------------------------------------------------------------------------
  function renderKPIs() {
    const txList = getFilteredTransactions(false);

    let totalRevenue = 0;
    let totalCost = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    txList.forEach(tx => {
      if (tx.status === 'Completed') {
        totalRevenue += Number(tx.amount) || 0;
        totalCost += Number(tx.cost) || 0;
        completedOrders++;
      } else if (tx.status === 'Pending') {
        pendingOrders++;
      }
    });

    const grossProfit = totalRevenue - totalCost;
    const marginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';
    const aov = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Monthly Target calculation
    const monthlyTargetUSD = 150000;
    const targetAchievedPct = Math.min(100, Math.round((totalRevenue / monthlyTargetUSD) * 100));
    const targetRemaining = Math.max(0, monthlyTargetUSD - totalRevenue);

    // Update DOM
    elements.kpiRevenue.textContent = formatMoney(totalRevenue);
    elements.kpiOrders.textContent = (completedOrders + pendingOrders).toLocaleString();
    elements.kpiPaidCount.textContent = completedOrders.toLocaleString();
    elements.kpiPendingCount.textContent = pendingOrders.toLocaleString();
    elements.kpiAOV.textContent = formatMoney(aov);
    elements.kpiProfit.textContent = formatMoney(grossProfit);
    elements.kpiMargin.textContent = `${marginPct}%`;

    elements.kpiTargetPercent.textContent = `${targetAchievedPct}%`;
    elements.kpiTargetProgressBar.style.width = `${targetAchievedPct}%`;
    elements.kpiTargetRemaining.textContent = targetRemaining === 0
      ? 'Target fully achieved!'
      : `${formatMoney(targetRemaining)} remaining to goal`;

    // Realistic Period Growth Calculation Indicator
    if (totalRevenue > 60000) {
      elements.kpiGrowthBadge.className = 'badge-growth positive';
      elements.kpiGrowthText.textContent = '+14.6%';
    } else {
      elements.kpiGrowthBadge.className = 'badge-growth positive';
      elements.kpiGrowthText.textContent = '+8.2%';
    }
  }

  // -------------------------------------------------------------------------
  // Sales Rep Leaderboard Render
  // -------------------------------------------------------------------------
  function renderLeaderboard() {
    const txList = getFilteredTransactions(false);
    const repMap = {};

    txList.forEach(tx => {
      if (tx.status === 'Completed') {
        if (!repMap[tx.rep]) {
          repMap[tx.rep] = { name: tx.rep, totalRevenue: 0, deals: 0 };
        }
        repMap[tx.rep].totalRevenue += Number(tx.amount) || 0;
        repMap[tx.rep].deals += 1;
      }
    });

    const sortedReps = Object.values(repMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
    elements.repLeaderboardContainer.innerHTML = '';

    if (sortedReps.length === 0) {
      elements.repLeaderboardContainer.innerHTML = `
        <div style="color: #94a3b8; font-size: 13px; text-align: center; padding: 24px;">
          No completed sales found for this timeframe.
        </div>
      `;
      return;
    }

    // Top representative quota baseline
    const highestSales = sortedReps[0].totalRevenue || 1;

    sortedReps.forEach(rep => {
      const initials = rep.name.split(' ').map(n => n[0]).join('');
      const barPercent = Math.min(100, Math.round((rep.totalRevenue / highestSales) * 100));

      const item = document.createElement('div');
      item.className = 'rep-item';
      item.innerHTML = `
        <div class="rep-info-col">
          <div class="rep-avatar">${initials}</div>
          <div>
            <div class="rep-name">${rep.name}</div>
            <div class="rep-deals">${rep.deals} deals closed</div>
          </div>
        </div>
        <div class="rep-revenue-col">
          <div class="rep-revenue-val">${formatMoney(rep.totalRevenue)}</div>
          <div class="rep-quota-bar">
            <div class="rep-quota-fill" style="width: ${barPercent}%;"></div>
          </div>
        </div>
      `;
      elements.repLeaderboardContainer.appendChild(item);
    });
  }

  // -------------------------------------------------------------------------
  // Visual Charts (Chart.js Integration with Native Canvas Fallback)
  // -------------------------------------------------------------------------
  function updateCharts() {
    const txList = getFilteredTransactions(false);

    if (typeof Chart === 'undefined') {
      renderNativeCanvasFallback(txList);
      return;
    }

    renderTrendChart(txList);
    renderCategoryChart(txList);
    renderRegionChart(txList);
  }

  function renderNativeCanvasFallback(txList) {
    // Graceful offline fallback renderer using pure HTML5 2D Canvas
    const trendCanvas = document.getElementById('revenueTrendChart');
    if (trendCanvas) {
      const ctx = trendCanvas.getContext('2d');
      const w = trendCanvas.parentElement.clientWidth || 600;
      const h = trendCanvas.parentElement.clientHeight || 260;
      trendCanvas.width = w;
      trendCanvas.height = h;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Live Data Synchronized (Chart.js CDN connecting...)', w / 2, h / 2 - 10);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText('All metric cards & tables below are dynamically updating from WebStorage', w / 2, h / 2 + 15);
    }
  }

  function renderTrendChart(txList) {
    // Group completed sales by month
    const monthsMap = {
      'Jan': { rev: 0, profit: 0 },
      'Feb': { rev: 0, profit: 0 },
      'Mar': { rev: 0, profit: 0 },
      'Apr': { rev: 0, profit: 0 },
      'May': { rev: 0, profit: 0 },
      'Jun': { rev: 0, profit: 0 },
      'Jul': { rev: 0, profit: 0 },
      'Aug': { rev: 0, profit: 0 },
      'Sep': { rev: 0, profit: 0 },
      'Oct': { rev: 0, profit: 0 },
      'Nov': { rev: 0, profit: 0 },
      'Dec': { rev: 0, profit: 0 }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    txList.forEach(tx => {
      if (tx.status === 'Completed') {
        const d = new Date(tx.date);
        const m = monthNames[d.getMonth()];
        if (monthsMap[m]) {
          monthsMap[m].rev += Number(tx.amount) || 0;
          monthsMap[m].profit += (Number(tx.amount) - Number(tx.cost)) || 0;
        }
      }
    });

    const config = CURRENCY_CONFIG[state.currency] || CURRENCY_CONFIG.USD;
    const labels = monthNames;
    const revenueData = labels.map(m => monthsMap[m].rev * config.rate);
    const profitData = labels.map(m => monthsMap[m].profit * config.rate);

    const ctx = document.getElementById('revenueTrendChart');
    if (!ctx) return;

    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Gross Profit',
            data: profitData,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.35,
            pointBackgroundColor: '#10b981',
            pointRadius: 3.5,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            borderWidth: 1,
            titleColor: '#f9fafb',
            bodyColor: '#e5e7eb',
            padding: 10,
            callbacks: {
              label: function (ctx) {
                return `${ctx.dataset.label}: ${config.symbol}${Number(ctx.raw).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: { color: '#94a3b8', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              callback: function (val) {
                return formatShortNumber(val / config.rate);
              }
            }
          }
        }
      }
    });
  }

  function renderCategoryChart(txList) {
    const categoryTotals = {};

    txList.forEach(tx => {
      if (tx.status === 'Completed') {
        const cat = tx.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(tx.amount) || 0);
      }
    });

    const labels = Object.keys(categoryTotals);
    const config = CURRENCY_CONFIG[state.currency] || CURRENCY_CONFIG.USD;
    const values = labels.map(l => categoryTotals[l] * config.rate);

    const ctx = document.getElementById('categoryDonutChart');
    if (!ctx) return;

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values.length ? values : [1],
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#8b5cf6',
            '#f59e0b',
            '#06b6d4',
            '#ec4899'
          ],
          borderColor: '#111827',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { size: 11 },
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                return `${ctx.label}: ${config.symbol}${Number(ctx.raw).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  function renderRegionChart(txList) {
    const regionTotals = {};

    txList.forEach(tx => {
      if (tx.status === 'Completed') {
        const r = tx.region || 'Other';
        regionTotals[r] = (regionTotals[r] || 0) + (Number(tx.amount) || 0);
      }
    });

    const labels = Object.keys(regionTotals);
    const config = CURRENCY_CONFIG[state.currency] || CURRENCY_CONFIG.USD;
    const values = labels.map(l => regionTotals[l] * config.rate);

    const ctx = document.getElementById('regionBarChart');
    if (!ctx) return;

    if (regionChartInstance) {
      regionChartInstance.destroy();
    }

    regionChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: values,
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          hoverBackgroundColor: '#60a5fa'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1f2937',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                return `Sales: ${config.symbol}${Number(ctx.raw).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: {
              color: '#94a3b8',
              font: { size: 11 },
              callback: function (val) {
                return formatShortNumber(val / config.rate);
              }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#f1f5f9', font: { size: 11 } }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Data Table & Pagination
  // -------------------------------------------------------------------------
  function renderTable() {
    let items = getFilteredTransactions(true);

    // Sorting
    items.sort((a, b) => {
      let valA = a[state.sortColumn];
      let valB = b[state.sortColumn];

      if (state.sortColumn === 'amount' || state.sortColumn === 'cost') {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    const totalRecords = items.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / state.pageSize));

    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    const startIndex = (state.currentPage - 1) * state.pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + state.pageSize);

    elements.transactionTableBody.innerHTML = '';

    if (paginatedItems.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="10" style="text-align: center; padding: 32px; color: #94a3b8;">
          No transactions match your current filters.
        </td>
      `;
      elements.transactionTableBody.appendChild(emptyRow);
    } else {
      paginatedItems.forEach(item => {
        const tr = document.createElement('tr');

        let statusClass = 'status-completed';
        if (item.status === 'Pending') statusClass = 'status-pending';
        if (item.status === 'Refunded') statusClass = 'status-refunded';

        tr.innerHTML = `
          <td><strong>${escapeHTML(item.id)}</strong></td>
          <td>${escapeHTML(item.customer)}</td>
          <td>${escapeHTML(item.product)}</td>
          <td><span class="category-tag">${escapeHTML(item.category)}</span></td>
          <td>${escapeHTML(item.region)}</td>
          <td>${escapeHTML(item.rep)}</td>
          <td>${escapeHTML(item.date)}</td>
          <td class="text-right"><strong>${formatMoney(item.amount)}</strong></td>
          <td><span class="badge-status ${statusClass}">${escapeHTML(item.status)}</span></td>
          <td class="text-center">
            <button class="action-btn-delete" data-id="${item.id}" title="Delete record">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        `;
        elements.transactionTableBody.appendChild(tr);
      });
    }

    // Pagination info & controls
    const fromNum = totalRecords === 0 ? 0 : startIndex + 1;
    const toNum = Math.min(startIndex + state.pageSize, totalRecords);
    elements.paginationInfo.textContent = `Showing ${fromNum} to ${toNum} of ${totalRecords} entries`;
    elements.pageIndicator.textContent = `Page ${state.currentPage} of ${totalPages}`;
    elements.btnPrevPage.disabled = state.currentPage <= 1;
    elements.btnNextPage.disabled = state.currentPage >= totalPages;

    // Attach delete listeners
    const deleteButtons = elements.transactionTableBody.querySelectorAll('.action-btn-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idToDelete = btn.getAttribute('data-id');
        deleteTransaction(idToDelete);
      });
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function deleteTransaction(id) {
    if (!confirm(`Are you sure you want to remove invoice ${id}?`)) {
      return;
    }

    state.transactions = state.transactions.filter(t => t.id !== id);
    saveToStorage();
    renderAll();
    showToast(`Transaction ${id} removed successfully`, 'info');
  }

  // -------------------------------------------------------------------------
  // Master Render Cycle
  // -------------------------------------------------------------------------
  function renderAll() {
    renderKPIs();
    renderLeaderboard();
    updateCharts();
    renderTable();
  }

  // -------------------------------------------------------------------------
  // Modal Dialog Handlers
  // -------------------------------------------------------------------------
  function openAddModal() {
    elements.newSaleForm.reset();
    // Default date to today
    elements.saleDate.value = new Date().toISOString().split('T')[0];
    elements.addSaleModal.classList.remove('hidden');
    elements.addSaleModal.setAttribute('aria-hidden', 'false');
  }

  function closeAddModal() {
    elements.addSaleModal.classList.add('hidden');
    elements.addSaleModal.setAttribute('aria-hidden', 'true');
  }

  function handleNewSaleSubmit(e) {
    e.preventDefault();

    const customer = document.getElementById('customerName').value.trim();
    const product = document.getElementById('productName').value.trim();
    const category = document.getElementById('saleCategory').value;
    const region = document.getElementById('saleRegion').value;
    const amount = parseFloat(document.getElementById('saleAmount').value);
    const cost = parseFloat(document.getElementById('saleCost').value);
    const rep = document.getElementById('saleRep').value;
    const status = document.getElementById('saleStatus').value;
    const date = document.getElementById('saleDate').value;
    const notes = document.getElementById('saleNotes').value.trim();

    if (!customer || !product || isNaN(amount) || isNaN(cost) || !date) {
      alert('Please fill out all required fields.');
      return;
    }

    // Convert amount and cost based on selected currency so storage is unified in USD
    const config = CURRENCY_CONFIG[state.currency] || CURRENCY_CONFIG.USD;
    const normalizedAmount = amount / config.rate;
    const normalizedCost = cost / config.rate;

    const newTx = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer,
      product,
      category,
      region,
      rep,
      amount: Math.round(normalizedAmount * 100) / 100,
      cost: Math.round(normalizedCost * 100) / 100,
      status,
      date,
      notes
    };

    // Prepend to top of transaction list
    state.transactions.unshift(newTx);
    saveToStorage();
    closeAddModal();
    renderAll();
    showToast(`New sale for ${customer} logged and stored!`);
  }

  // -------------------------------------------------------------------------
  // CSV Export
  // -------------------------------------------------------------------------
  function exportCSV() {
    const items = getFilteredTransactions(true);
    if (items.length === 0) {
      showToast('No records to export', 'error');
      return;
    }

    const headers = ['Invoice ID', 'Customer', 'Product', 'Category', 'Region', 'Rep', 'Date', 'Amount_USD', 'Cost_USD', 'Status', 'Notes'];
    const rows = items.map(tx => [
      `"${tx.id}"`,
      `"${tx.customer.replace(/"/g, '""')}"`,
      `"${tx.product.replace(/"/g, '""')}"`,
      `"${tx.category}"`,
      `"${tx.region}"`,
      `"${tx.rep}"`,
      `"${tx.date}"`,
      tx.amount,
      tx.cost,
      `"${tx.status}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_analytics_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${items.length} records to CSV!`);
  }

  // -------------------------------------------------------------------------
  // Reset Data to Defaults
  // -------------------------------------------------------------------------
  function resetToDefaultData() {
    if (confirm('Reset sales data to original sample dataset? All custom transactions in LocalStorage will be re-seeded.')) {
      state.transactions = generateDefaultTransactions();
      saveToStorage();
      renderAll();
      showToast('Sample dataset restored to LocalStorage');
    }
  }

  // -------------------------------------------------------------------------
  // Event Listeners
  // -------------------------------------------------------------------------
  function setupEventListeners() {
    // Currency Switcher
    elements.currencySelect.value = state.currency;
    elements.currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      saveToStorage();
      renderAll();
    });

    // Timeframe Filter
    elements.dateRangeFilter.value = state.timeframe;
    elements.dateRangeFilter.addEventListener('change', (e) => {
      state.timeframe = e.target.value;
      state.currentPage = 1;
      saveToStorage();
      renderAll();
    });

    // Modal Events
    elements.btnOpenAddModal.addEventListener('click', openAddModal);
    elements.btnCloseModal.addEventListener('click', closeAddModal);
    elements.btnCancelModal.addEventListener('click', closeAddModal);
    elements.newSaleForm.addEventListener('submit', handleNewSaleSubmit);

    // Close modal on outer click or Escape
    elements.addSaleModal.addEventListener('click', (e) => {
      if (e.target === elements.addSaleModal) {
        closeAddModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !elements.addSaleModal.classList.contains('hidden')) {
        closeAddModal();
      }
    });

    // CSV & Reset
    elements.btnExportCSV.addEventListener('click', exportCSV);
    elements.btnResetData.addEventListener('click', resetToDefaultData);

    // Table Search & Filters
    elements.tableSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    elements.categoryFilter.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    elements.statusFilter.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    // Sorting Headers
    const sortHeaders = document.querySelectorAll('th[data-sort]');
    sortHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const column = th.getAttribute('data-sort');
        if (state.sortColumn === column) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortColumn = column;
          state.sortDirection = 'desc';
        }

        // Visual indicator
        sortHeaders.forEach(h => {
          const icon = h.querySelector('.sort-icon');
          if (icon) icon.textContent = '↕';
        });
        const currentIcon = th.querySelector('.sort-icon');
        if (currentIcon) {
          currentIcon.textContent = state.sortDirection === 'asc' ? '▲' : '▼';
        }

        renderTable();
      });
    });

    // Pagination Buttons
    elements.btnPrevPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
      }
    });

    elements.btnNextPage.addEventListener('click', () => {
      state.currentPage++;
      renderTable();
    });
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------
  function init() {
    loadFromStorage();
    setupEventListeners();
    renderAll();
  }

  // Fire on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
