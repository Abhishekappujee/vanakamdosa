/* ==========================================================================
   SUPER ADMIN EXECUTIVE FINANCIAL DASHBOARD VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatters.js';

export const renderAdminDashboardView = async () => {
  const managers = await api.getManagers();
  const tables = await api.getTables();
  const orders = await api.getOrders();
  const bills = await api.getBills();
  const expenses = await api.getExpenses();
  const capital = await api.getCapital();
  const inventory = await api.getInventory();

  const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCapital = capital.reduce((sum, c) => c.type === 'withdrawal' ? sum - c.amount : sum + c.amount, 0);
  
  // Formula: NET PROFIT = TOTAL REVENUE - TOTAL EXPENSES
  const netProfit = totalRevenue - totalExpenses;
  const inventoryValue = inventory.reduce((sum, i) => sum + (i.currentQty * i.purchasePrice), 0);

  const lowStockItems = inventory.filter(i => i.currentQty <= i.minQty);

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Super Admin Executive Dashboard</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Enterprise Multi-Branch Overview & Financial Analytics</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="#admin/finance" class="btn btn-primary btn-sm">+ Record Capital / Expense</a>
          <a href="#admin/reports" class="btn btn-secondary btn-sm">📊 Business Reports</a>
        </div>
      </div>

      <!-- Financial Key Performance Indicators (KPIs) -->
      <div class="grid grid-cols-4 gap-4" style="margin-bottom: 1.5rem;">
        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Gross Revenue</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--success);">${formatCurrency(totalRevenue)}</h2>
          </div>
          <div style="font-size: 2rem;">📈</div>
        </div>

        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Operating Expenses</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--danger);">${formatCurrency(totalExpenses)}</h2>
          </div>
          <div style="font-size: 2rem;">💸</div>
        </div>

        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Net Estimated Profit</span>
            <h2 style="margin: 0.25rem 0 0 0; color: ${netProfit >= 0 ? 'var(--primary)' : 'var(--danger)'};">${formatCurrency(netProfit)}</h2>
          </div>
          <div style="font-size: 2rem;">💵</div>
        </div>

        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Total Capital Invested</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--accent-purple);">${formatCurrency(totalCapital)}</h2>
          </div>
          <div style="font-size: 2rem;">🏦</div>
        </div>
      </div>

      <!-- Secondary Metrics -->
      <div class="grid grid-cols-4 gap-4" style="margin-bottom: 1.5rem;">
        <div class="card">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Total Managers</div>
          <h3 style="margin: 0.2rem 0 0 0;">${managers.length} Active</h3>
        </div>
        <div class="card">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Total Tables</div>
          <h3 style="margin: 0.2rem 0 0 0;">${tables.length} Tables</h3>
        </div>
        <div class="card">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Inventory Valuation</div>
          <h3 style="margin: 0.2rem 0 0 0; color: var(--primary);">${formatCurrency(inventoryValue)}</h3>
        </div>
        <div class="card">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Low Stock Alerts</div>
          <h3 style="margin: 0.2rem 0 0 0; color: ${lowStockItems.length > 0 ? 'var(--danger)' : 'var(--success)'};">${lowStockItems.length} Items</h3>
        </div>
      </div>

      <!-- Visual SVG Sales & Expenses Chart -->
      <div class="grid grid-cols-2 gap-4" style="margin-bottom: 1.5rem;">
        <div class="card glass-panel">
          <h3 style="margin-bottom: 1rem;">Daily Sales vs Expenses Overview</h3>
          <div style="height: 180px; display: flex; align-items: flex-end; gap: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div class="flex flex-col items-center gap-2" style="flex: 1;">
              <div style="width: 100%; height: 120px; background: var(--success); border-radius: var(--radius-sm); opacity: 0.85;"></div>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Sales Revenue</span>
            </div>
            <div class="flex flex-col items-center gap-2" style="flex: 1;">
              <div style="width: 100%; height: 75px; background: var(--danger); border-radius: var(--radius-sm); opacity: 0.85;"></div>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Operating Expenses</span>
            </div>
            <div class="flex flex-col items-center gap-2" style="flex: 1;">
              <div style="width: 100%; height: 45px; background: var(--primary); border-radius: var(--radius-sm); opacity: 0.85;"></div>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Net Profit</span>
            </div>
          </div>
        </div>

        <div class="card glass-panel">
          <h3 style="margin-bottom: 1rem; color: var(--warning);">Low Stock Inventory Warnings</h3>
          ${lowStockItems.length === 0 ? `
            <p style="color: var(--success); padding: 1rem 0;">All inventory items are currently above minimum stock thresholds.</p>
          ` : `
            <div>
              ${lowStockItems.map(item => `
                <div class="flex justify-between items-center" style="padding: 0.5rem 0; border-bottom: 1px dashed var(--border-color);">
                  <div>
                    <strong>${item.name}</strong> (${item.sku})
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Current: ${item.currentQty} ${item.unit} (Min: ${item.minQty} ${item.unit})</div>
                  </div>
                  <a href="#admin/inventory" class="badge badge-danger">Restock Now</a>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  return viewHTML;
};
