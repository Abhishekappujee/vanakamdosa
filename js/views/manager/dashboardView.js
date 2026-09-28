/* ==========================================================================
   CAFE MANAGER OPERATIONAL DASHBOARD VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatters.js';

export const renderManagerDashboardView = async () => {
  const tables = await api.getTables();
  const orders = await api.getOrders();
  const bills = await api.getBills();

  const todayOrders = orders;
  const pendingOrders = orders.filter(o => o.status === 'PENDING_APPROVAL');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');
  
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'order_pending');
  const billRequestedTables = tables.filter(t => t.status === 'bill_requested');
  const availableTables = tables.filter(t => t.status === 'available');

  const totalSalesToday = bills.reduce((sum, b) => sum + b.amount, 0);

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Manager Operations Dashboard</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Real-time table orders, KOT status & active billing</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="#manager/orders" class="btn btn-primary btn-sm">⚡ Order Approval Queue (${pendingOrders.length})</a>
          <a href="#manager/tables" class="btn btn-secondary btn-sm">🪑 Table Layout</a>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-4 gap-4" style="margin-bottom: 1.5rem;">
        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Today's Revenue</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--primary);">${formatCurrency(totalSalesToday)}</h2>
          </div>
          <div style="font-size: 2rem;">💰</div>
        </div>

        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Pending Approvals</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--warning);">${pendingOrders.length}</h2>
          </div>
          <div style="font-size: 2rem;">⏳</div>
        </div>

        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Active Tables Occupied</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--success);">${occupiedTables.length} / ${tables.length}</h2>
          </div>
          <div style="font-size: 2rem;">🪑</div>
        </div>

        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Bill Payment Requests</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--info);">${billRequestedTables.length}</h2>
          </div>
          <div style="font-size: 2rem;">🧾</div>
        </div>
      </div>

      <!-- Table Status Quick Grid -->
      <div class="card glass-panel" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <span>Live Table Layout Status</span>
          <a href="#manager/tables" style="font-size: 0.85rem; color: var(--primary);">View Details & QR Codes →</a>
        </h3>

        <div class="grid grid-cols-4 gap-3">
          ${tables.map(t => {
            let badgeClass = 'badge-success';
            let statusText = 'AVAILABLE';

            if (t.status === 'occupied') { badgeClass = 'badge-info'; statusText = 'OCCUPIED'; }
            else if (t.status === 'order_pending') { badgeClass = 'badge-warning'; statusText = 'ORDER PENDING'; }
            else if (t.status === 'bill_requested') { badgeClass = 'badge-danger'; statusText = 'BILL REQUESTED'; }

            return `
              <div class="card" style="padding: 1rem; border-color: var(--border-color); text-align: center;">
                <h4 style="margin: 0 0 0.5rem 0;">${t.number}</h4>
                <span class="badge ${badgeClass}">${statusText}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Active Preparing & Ready Kitchen Orders -->
      <div class="grid grid-cols-2 gap-4" style="margin-bottom: 1.5rem;">
        <div class="card glass-panel">
          <h4 style="margin-bottom: 0.75rem; color: var(--warning);">👨‍🍳 In Kitchen Preparation (${preparingOrders.length})</h4>
          ${preparingOrders.length === 0 ? `
            <p style="font-size: 0.85rem; color: var(--text-muted); padding: 1rem 0;">No orders currently being prepared in kitchen.</p>
          ` : preparingOrders.map(o => `
            <div class="flex justify-between items-center" style="padding: 0.5rem 0; border-bottom: 1px dashed var(--border-color);">
              <div>
                <strong>${o.tableNumber}</strong> (${o.items.length} items)
                <div style="font-size: 0.75rem; color: var(--text-muted);">${o.items.map(i => i.name).join(', ')}</div>
              </div>
              <a href="#manager/orders" class="btn btn-outline btn-sm">Update Status</a>
            </div>
          `).join('')}
        </div>

        <div class="card glass-panel">
          <h4 style="margin-bottom: 0.75rem; color: var(--success);">🔔 Ready for Serving (${readyOrders.length})</h4>
          ${readyOrders.length === 0 ? `
            <p style="font-size: 0.85rem; color: var(--text-muted); padding: 1rem 0;">No dishes awaiting serving staff.</p>
          ` : readyOrders.map(o => `
            <div class="flex justify-between items-center" style="padding: 0.5rem 0; border-bottom: 1px dashed var(--border-color);">
              <div>
                <strong>${o.tableNumber}</strong> - ${o.customerName}
                <div style="font-size: 0.75rem; color: var(--success);">Dishes Ready at Counter</div>
              </div>
              <a href="#manager/orders" class="btn btn-success btn-sm">Mark Served</a>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Paid Bills Section -->
      <div class="card glass-panel" style="padding: 1.25rem;">
        <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
          <div>
            <h4 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>💳 Recent Paid Bills & Settlements</span>
              <span class="badge badge-success" style="font-size: 0.75rem;">${bills.filter(b => b.status === 'PAID').length} Settled</span>
            </h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Latest settled transactions</p>
          </div>
          <a href="#manager/billing" class="btn btn-outline btn-sm">Full Billing Center →</a>
        </div>

        ${bills.filter(b => b.status === 'PAID').length === 0 ? `
          <p style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem 0;">No bills settled yet today.</p>
        ` : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                  <th style="padding: 0.5rem;">Invoice #</th>
                  <th style="padding: 0.5rem;">Table</th>
                  <th style="padding: 0.5rem;">Customer</th>
                  <th style="padding: 0.5rem;">Method</th>
                  <th style="padding: 0.5rem;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${bills.filter(b => b.status === 'PAID').slice(0, 5).map(b => `
                  <tr style="border-bottom: 1px dashed var(--border-color);">
                    <td style="padding: 0.5rem; font-weight: 700; color: var(--primary);">${b.id}</td>
                    <td style="padding: 0.5rem; font-weight: 600;">${b.tableNumber}</td>
                    <td style="padding: 0.5rem;">${b.customerName || 'Guest'}</td>
                    <td style="padding: 0.5rem;"><span class="badge badge-info">${b.method || 'Cash'}</span></td>
                    <td style="padding: 0.5rem; font-weight: 700; color: var(--success);">${formatCurrency(b.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;

  return viewHTML;
};
