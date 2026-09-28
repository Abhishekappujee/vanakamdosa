/* ==========================================================================
   CUSTOMER LIVE SESSION BILL & PAID INVOICE VIEW (REFRESH SAFE)
   ========================================================================== */

import { api } from '../../services/api.js';
import { store } from '../../state.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { showToast } from '../../utils/toast.js';

export const renderBillView = async () => {
  let session = store.getState().activeSession || JSON.parse(localStorage.getItem('qr_last_session'));
  let user = store.getState().currentUser || JSON.parse(localStorage.getItem('qr_customer_user'));

  if (!user) {
    user = { id: 'CUST-001', name: 'Rahul Kumar', phone: '9876543210', role: 'customer' };
    store.setUser(user);
  }

  if (!session) {
    session = {
      id: 'SES-004',
      tableId: 'TBL-004',
      tableNumber: 'Table 04',
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      status: 'active',
      startedAt: new Date().toISOString()
    };
    store.setSession(session);
  }

  // Guaranteed sync to active table session in storage
  if (session && session.tableId) {
    const liveSession = await api.getActiveSessionByTable(session.tableId);
    if (liveSession) {
      session = liveSession;
      store.setSession(liveSession);
    }
  }

  const sessionId = session ? session.id : 'SES-004';
  const billData = await api.getBillBySession(sessionId);
  const { isPaid, paidBill, orders, approvedOrders, pendingOrders, allOrdersSubtotal, allOrdersTax, allOrdersTotal, approvedSubtotal, approvedTax, approvedTotal } = billData;

  const currentSessionData = billData.session || session;
  const isBillPaid = isPaid || (currentSessionData && currentSessionData.status === 'closed') || (paidBill && paidBill.status === 'PAID');

  const activeOrdersList = isBillPaid ? approvedOrders : (orders && orders.length > 0 ? orders : approvedOrders);
  const displaySubtotal = isBillPaid ? approvedSubtotal : (allOrdersSubtotal || approvedSubtotal);
  const displayTax = isBillPaid ? approvedTax : (allOrdersTax || approvedTax);
  const displayTotal = isBillPaid ? (paidBill ? paidBill.amount : approvedTotal) : (allOrdersTotal || approvedTotal);

  const itemsMap = {};
  (activeOrdersList || []).forEach(order => {
    order.items.forEach(item => {
      if (itemsMap[item.name]) {
        itemsMap[item.name].quantity += item.quantity;
        itemsMap[item.name].total += item.total;
      } else {
        itemsMap[item.name] = { ...item, status: order.status };
      }
    });
  });

  const itemsList = Object.values(itemsMap);

  const isBillRequested = currentSessionData && currentSessionData.status === 'bill_requested';

  const viewHTML = `
    <div class="content-area customer-view-container">
      ${isBillRequested && !isBillPaid ? `
        <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid var(--primary); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.25rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.25rem;">🔔</div>
          <h3 style="margin: 0 0 0.25rem 0; color: var(--primary);">Final Bill Requested for Settlement</h3>
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">Your request is active. Cafe manager has been notified and is bringing your receipt to <strong>${currentSessionData ? currentSessionData.tableNumber : 'your table'}</strong>.</p>
        </div>
      ` : ''}

      ${isBillPaid ? `
        <div style="background: rgba(34, 197, 94, 0.15); border: 2px solid var(--success); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.25rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.25rem;">🎉</div>
          <h3 style="margin: 0 0 0.25rem 0; color: var(--success);">Bill Paid & Settled</h3>
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">Payment of <strong style="color: var(--primary);">${formatCurrency(paidBill ? paidBill.amount : approvedTotal)}</strong> recorded via <strong>${paidBill ? paidBill.method : 'POS Settlement'}</strong>.</p>
        </div>
      ` : ''}

      <!-- Ongoing Live Active Bill -->
      <div class="card glass-panel print-area invoice-print-container" style="padding: 1.5rem; margin-bottom: 1.5rem;">
        <!-- Header -->
        <div class="text-center" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
          <h2 style="margin: 0; color: var(--text-primary);">Gourmet Bistro & Cafe</h2>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">Ongoing Live Table Bill</p>
          <div class="flex items-center justify-center gap-2" style="margin-top: 0.5rem;">
            <span class="badge badge-warning">📍 ${currentSessionData ? currentSessionData.tableNumber : 'Table 04'}</span>
            <span class="badge ${isBillPaid ? 'badge-success' : (isBillRequested ? 'badge-warning' : 'badge-danger')}">
              ${isBillPaid ? 'PAID & SETTLED ✓' : (isBillRequested ? 'BILL REQUESTED' : 'STATUS: UNPAID')}
            </span>
          </div>
        </div>

        <div class="flex justify-between" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          <span>Customer: ${currentSessionData ? currentSessionData.customerName : (user ? user.name : 'Guest')}</span>
          <span>Phone: ${currentSessionData ? currentSessionData.customerPhone : (user ? user.phone : '-')}</span>
        </div>

        <!-- Ordered Items Summary -->
        <h4 style="margin-bottom: 0.75rem; color: var(--primary);">Ongoing Itemized Summary</h4>
        
        ${itemsList.length === 0 ? `
          <p style="font-size: 0.9rem; color: var(--text-muted); text-align: center; padding: 1.5rem;">No items on ongoing bill yet.</p>
        ` : `
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
            ${itemsList.map(item => `
              <div class="flex justify-between items-center" style="padding: 0.35rem 0; font-size: 0.95rem;">
                <div>
                  <span style="font-weight: 700; color: var(--primary);">${item.quantity}x</span> ${item.name}
                  ${item.status === 'PENDING_APPROVAL' ? `<span class="badge badge-warning" style="font-size: 0.65rem; margin-left: 0.35rem;">PENDING APPROVAL</span>` : ''}
                </div>
                <div style="font-weight: 600;">${formatCurrency(item.total)}</div>
              </div>
            `).join('')}
          </div>
        `}

        <!-- Financial Calculation -->
        <div style="padding-top: 0.5rem;">
          <div class="flex justify-between" style="margin-bottom: 0.35rem; font-size: 0.95rem;">
            <span style="color: var(--text-secondary);">Subtotal</span>
            <span>${formatCurrency(displaySubtotal)}</span>
          </div>

          <div class="flex justify-between" style="margin-bottom: 0.35rem; font-size: 0.85rem; color: var(--text-muted);">
            <span>CGST (6%)</span>
            <span>${formatCurrency(displayTax / 2)}</span>
          </div>

          <div class="flex justify-between" style="margin-bottom: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
            <span>SGST (6%)</span>
            <span>${formatCurrency(displayTax / 2)}</span>
          </div>

          <div class="flex justify-between items-center" style="padding-top: 0.75rem; border-top: 2px solid var(--border-color); font-size: 1.3rem; font-weight: 800;">
            <span>Grand Total</span>
            <span style="color: var(--primary);">${formatCurrency(displayTotal)}</span>
          </div>
        </div>
      </div>

      <!-- Action Options Below Ongoing Bill -->
      <div class="flex flex-col gap-3">
        ${!isBillPaid ? `
          <button id="btn-request-bill" class="btn btn-primary btn-lg w-full" style="box-shadow: 0 4px 18px rgba(245, 158, 11, 0.45); font-weight: 800; font-size: 1.05rem;" ${isBillRequested ? 'disabled' : ''}>
            ${isBillRequested ? '🔔 Bill Requested ✓ (Staff Processing)' : '🔔 REQUEST FINAL BILL FOR SETTLEMENT'}
          </button>
          <a href="#customer/menu" class="btn btn-secondary w-full text-center">
            + Add More Items
          </a>
        ` : `
          <a href="#customer/menu" class="btn btn-primary btn-lg w-full" style="box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
            Browse Restaurant Menu →
          </a>
          <button onclick="window.print()" class="btn btn-outline w-full text-center">
            🖨️ Print Paid Tax Invoice Receipt
          </button>
        `}
      </div>
    </div>
  `;

  setTimeout(() => {
    const requestBtn = document.getElementById('btn-request-bill');
    if (requestBtn && !isBillRequested) {
      requestBtn.onclick = async () => {
        requestBtn.disabled = true;
        requestBtn.textContent = 'Bill Requested ✓';

        await api.updateSessionStatus(sessionId, 'bill_requested');
        showToast('Bill request sent! Cafe manager is processing your bill payment.', 'success', 5000);
        setTimeout(() => window.location.reload(), 800);
      };
    }
  }, 50);

  return viewHTML;
};
