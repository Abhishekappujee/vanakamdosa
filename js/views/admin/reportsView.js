/* ==========================================================================
   SUPER ADMIN ANALYTICS & REPORTS VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const renderAdminReportsView = async () => {
  const bills = await api.getBills();
  const orders = await api.getOrders();
  const items = await api.getMenuItems();
  const expenses = await api.getExpenses();

  const totalSales = bills.reduce((sum, b) => sum + b.amount, 0);

  // Item contribution calculation
  const itemSalesMap = {};
  orders.forEach(o => {
    if (o.status !== 'REJECTED') {
      o.items.forEach(i => {
        if (!itemSalesMap[i.name]) {
          itemSalesMap[i.name] = { qty: 0, revenue: 0 };
        }
        itemSalesMap[i.name].qty += i.quantity;
        itemSalesMap[i.name].revenue += i.total;
      });
    }
  });

  const popularItems = Object.keys(itemSalesMap).map(name => ({
    name,
    qty: itemSalesMap[name].qty,
    revenue: itemSalesMap[name].revenue
  })).sort((a, b) => b.qty - a.qty);

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Business Reports & Analytical Intelligence</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Sales statements, menu item contribution, and expense breakdowns</p>
        </div>
        <button onclick="window.print()" class="btn btn-secondary btn-sm">🖨️ Print Report</button>
      </div>

      <!-- Top Performing Items Table -->
      <div class="card glass-panel" style="margin-bottom: 1.5rem; padding: 0; overflow: hidden;">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color);">
          <h3 style="margin: 0;">Top Selling Menu Items & Revenue Contribution</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.85rem 1.25rem;">RANK</th>
              <th style="padding: 0.85rem 1.25rem;">ITEM DISH NAME</th>
              <th style="padding: 0.85rem 1.25rem;">QUANTITY SOLD</th>
              <th style="padding: 0.85rem 1.25rem;">REVENUE GENERATED</th>
              <th style="padding: 0.85rem 1.25rem; text-align: right;">CONTRIBUTION %</th>
            </tr>
          </thead>
          <tbody>
            ${popularItems.map((pi, idx) => {
              const contrib = totalSales > 0 ? ((pi.revenue / totalSales) * 100).toFixed(1) : 0;
              return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: var(--primary);">#${idx + 1}</td>
                  <td style="padding: 0.85rem 1.25rem; font-weight: 600;">${pi.name}</td>
                  <td style="padding: 0.85rem 1.25rem;">${pi.qty} Portions</td>
                  <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: var(--success);">${formatCurrency(pi.revenue)}</td>
                  <td style="padding: 0.85rem 1.25rem; text-align: right; font-weight: bold; color: var(--text-secondary);">${contrib}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return viewHTML;
};
