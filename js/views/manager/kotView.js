/* ==========================================================================
   KITCHEN ORDER TICKET (KOT) CENTER VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatTime } from '../../utils/formatters.js';

export const renderKotView = async () => {
  const kots = await api.getKots();

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Kitchen Order Ticket (KOT) Center</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Thermal print layout & kitchen status updates</p>
        </div>
      </div>

      ${kots.length === 0 ? `
        <div class="card text-center" style="padding: 3rem 1.5rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🖨️</div>
          <h4>No KOT Tickets Generated Yet</h4>
          <p style="margin-bottom: 0;">Approved orders automatically generate Kitchen Order Tickets here.</p>
        </div>
      ` : `
        <div class="grid grid-cols-3 gap-4">
          ${kots.map(kot => `
            <div class="card glass-panel print-area" style="padding: 1.25rem;">
              <div class="kot-print-ticket">
                <div class="kot-print-header">
                  <h2>GOURMET BISTRO</h2>
                  <div style="font-weight: bold; font-size: 1.1rem;">${kot.kotNumber}</div>
                  <div style="font-size: 0.85rem;">${kot.tableNumber} • ${kot.customerName}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${formatTime(kot.printedAt)}</div>
                </div>

                <table class="kot-print-items-table">
                  <thead>
                    <tr>
                      <th>QTY</th>
                      <th>ITEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${kot.items.map(item => `
                      <tr>
                        <td style="font-weight: bold; font-size: 1.1rem; width: 40px;">${item.quantity}x</td>
                        <td>
                          <div><strong>${item.name}</strong></div>
                          ${item.notes ? `<div style="font-size: 0.75rem; font-style: italic;">Note: ${item.notes}</div>` : ''}
                          ${item.modifiers && item.modifiers.length > 0 ? `<div style="font-size: 0.75rem;">+ ${item.modifiers.map(m=>m.name).join(', ')}</div>` : ''}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="no-print flex items-center justify-between" style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                <span class="badge badge-info">${kot.status}</span>
                <button class="btn btn-primary btn-sm btn-print-kot-ticket" data-id="${kot.id}">
                  🖨️ Print KOT
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  setTimeout(() => {
    document.querySelectorAll('.btn-print-kot-ticket').forEach(btn => {
      btn.onclick = () => window.print();
    });
  }, 50);

  return viewHTML;
};
