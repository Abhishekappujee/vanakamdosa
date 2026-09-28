/* ==========================================================================
   POS ORDER APPROVAL & QUEUE MANAGEMENT VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { renderOrderCard } from '../../components/orderCard.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderOrderQueueView = async () => {
  const orders = await api.getOrders();
  let currentFilter = 'PENDING_APPROVAL';

  const renderQueueGrid = () => {
    const filtered = orders.filter(o => {
      if (currentFilter === 'ALL') return true;
      return o.status === currentFilter;
    });

    if (filtered.length === 0) {
      return `
        <div class="card text-center" style="grid-column: 1 / -1; padding: 3rem 1.5rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📋</div>
          <h4>No Orders Found in ${currentFilter.replace('_', ' ')} Queue</h4>
          <p style="margin-bottom: 0;">New customer orders will appear here automatically.</p>
        </div>
      `;
    }

    return filtered.map(order => renderOrderCard(order)).join('');
  };

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">POS Order Approval Queue</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Review, approve, and manage customer kitchen order tickets</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-refresh-queue" class="btn btn-secondary btn-sm">🔄 Refresh Queue</button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-container" style="margin-bottom: 1.25rem;">
        <button class="tab-filter-btn tab-btn active" data-status="PENDING_APPROVAL">Pending Approval (${orders.filter(o => o.status === 'PENDING_APPROVAL').length})</button>
        <button class="tab-filter-btn tab-btn" data-status="APPROVED">Approved (${orders.filter(o => o.status === 'APPROVED').length})</button>
        <button class="tab-filter-btn tab-btn" data-status="PREPARING">Preparing (${orders.filter(o => o.status === 'PREPARING').length})</button>
        <button class="tab-filter-btn tab-btn" data-status="READY">Ready (${orders.filter(o => o.status === 'READY').length})</button>
        <button class="tab-filter-btn tab-btn" data-status="SERVED">Served</button>
        <button class="tab-filter-btn tab-btn" data-status="ALL">All Orders</button>
      </div>

      <!-- Order Queue Cards Grid -->
      <div id="queue-cards-container" class="grid grid-cols-3 gap-4">
        ${renderQueueGrid()}
      </div>
    </div>
  `;

  setTimeout(() => {
    // Refresh Handler
    const refreshBtn = document.getElementById('btn-refresh-queue');
    if (refreshBtn) refreshBtn.onclick = () => window.location.reload();

    // Tab Filters
    const tabs = document.querySelectorAll('.tab-filter-btn');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.status;
        const container = document.getElementById('queue-cards-container');
        if (container) container.innerHTML = renderQueueGrid();
      };
    });

    // Delegate Click Actions for Approve, Reject, Next Status, KOT
    document.addEventListener('click', async (e) => {
      const approveBtn = e.target.closest('.btn-approve');
      const rejectBtn = e.target.closest('.btn-reject');
      const statusBtn = e.target.closest('.btn-status');
      const kotBtn = e.target.closest('.btn-kot');

      if (approveBtn) {
        if (approveBtn.disabled) return;
        approveBtn.disabled = true;
        approveBtn.textContent = 'Approving...';
        const orderId = approveBtn.dataset.id;
        await api.updateOrderStatus(orderId, 'APPROVED');
        showToast(`Order ${orderId} APPROVED! KOT generated.`, 'success');
        window.location.reload();
      }

      if (rejectBtn) {
        const orderId = rejectBtn.dataset.id;
        // Open Rejection Reason Modal
        const modalContent = `
          <div class="form-group">
            <label class="form-label" for="reject-reason">Reason for Order Rejection</label>
            <textarea id="reject-reason" class="form-textarea" rows="3" placeholder="e.g. Item out of stock / Kitchen busy"></textarea>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-reject">Cancel</button>
          <button class="btn btn-danger btn-sm" id="btn-confirm-reject">Confirm Rejection</button>
        `;

        const modal = createModal({
          title: 'Reject Order Request',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-reject').onclick = modal.close;
        document.getElementById('btn-confirm-reject').onclick = async () => {
          const reason = document.getElementById('reject-reason').value || 'Order could not be accepted by staff.';
          await api.updateOrderStatus(orderId, 'REJECTED', reason);
          modal.close();
          showToast(`Order ${orderId} rejected.`, 'info');
          window.location.reload();
        };
      }

      if (statusBtn) {
        const orderId = statusBtn.dataset.id;
        const nextStatus = statusBtn.dataset.next;
        await api.updateOrderStatus(orderId, nextStatus);
        showToast(`Order status updated to ${nextStatus}`, 'success');
        window.location.reload();
      }

      if (kotBtn) {
        window.location.hash = '#manager/kot';
      }
    });
  }, 50);

  return viewHTML;
};
