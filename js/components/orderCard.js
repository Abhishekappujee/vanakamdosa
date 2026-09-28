/* ==========================================================================
   POS ORDER KANBAN CARD COMPONENT
   ========================================================================== */

import { formatCurrency, formatTime } from '../utils/formatters.js';

export const renderOrderCard = (order, onApprove, onReject, onUpdateStatus, onPrintKot) => {
  const statusBadgeMap = {
    PENDING_APPROVAL: 'badge-warning',
    APPROVED: 'badge-info',
    PREPARING: 'badge-warning',
    READY: 'badge-success',
    SERVED: 'badge-neutral',
    COMPLETED: 'badge-success',
    REJECTED: 'badge-danger',
    CANCELLED: 'badge-danger'
  };

  const badgeClass = statusBadgeMap[order.status] || 'badge-neutral';

  const itemsListHTML = order.items.map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.35rem 0; border-bottom: 1px dashed var(--border-color);">
      <div>
        <span style="font-weight: 700; color: var(--primary);">${item.quantity}x</span> ${item.name}
        ${item.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Note: ${item.notes}</div>` : ''}
      </div>
      <div style="font-weight: 600;">${formatCurrency(item.unitPrice * item.quantity)}</div>
    </div>
  `).join('');

  let actionButtonsHTML = '';

  if (order.status === 'PENDING_APPROVAL') {
    actionButtonsHTML = `
      <button class="btn btn-success btn-sm btn-approve" data-id="${order.id}">✓ Approve</button>
      <button class="btn btn-danger btn-sm btn-reject" data-id="${order.id}">✕ Reject</button>
    `;
  } else if (order.status === 'APPROVED') {
    actionButtonsHTML = `
      <button class="btn btn-primary btn-sm btn-status" data-id="${order.id}" data-next="PREPARING">👨‍🍳 Start Preparing</button>
      <button class="btn btn-secondary btn-sm btn-kot" data-id="${order.id}">🖨️ KOT</button>
    `;
  } else if (order.status === 'PREPARING') {
    actionButtonsHTML = `
      <button class="btn btn-success btn-sm btn-status" data-id="${order.id}" data-next="READY">🔔 Mark Ready</button>
      <button class="btn btn-secondary btn-sm btn-kot" data-id="${order.id}">🖨️ KOT</button>
    `;
  } else if (order.status === 'READY') {
    actionButtonsHTML = `
      <button class="btn btn-outline btn-sm btn-status" data-id="${order.id}" data-next="SERVED">🍽️ Serve</button>
    `;
  }

  const cardHTML = `
    <div class="card order-card" style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div class="flex items-center justify-between">
        <div>
          <span class="badge ${badgeClass}">${order.status.replace('_', ' ')}</span>
          ${order.orderType === 'additional' ? '<span class="badge badge-info" style="margin-left: 4px;">ADDITIONAL</span>' : ''}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">${formatTime(order.createdAt)}</span>
      </div>

      <div class="flex items-center justify-between" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        <div>
          <h4 style="margin: 0; color: var(--text-primary);">${order.tableNumber}</h4>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">${order.customerName}</p>
        </div>
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">${order.id}</span>
      </div>

      <div class="order-items-container" style="max-height: 180px; overflow-y: auto;">
        ${itemsListHTML}
      </div>

      ${order.rejectionReason ? `
        <div style="background: var(--danger-bg); border: 1px solid var(--danger-border); padding: 0.5rem; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--danger);">
          Rejection Reason: ${order.rejectionReason}
        </div>
      ` : ''}

      <div class="flex items-center justify-between" style="padding-top: 0.5rem; border-top: 1px solid var(--border-color); font-weight: 700;">
        <span>Total (Incl. Tax)</span>
        <span style="color: var(--primary); font-size: 1.1rem;">${formatCurrency(order.total)}</span>
      </div>

      ${actionButtonsHTML ? `
        <div class="flex items-center gap-2 justify-end" style="padding-top: 0.5rem;">
          ${actionButtonsHTML}
        </div>
      ` : ''}
    </div>
  `;

  return cardHTML;
};
