/* ==========================================================================
   CUSTOMER ORDER & BILL HISTORY VIEW (PERSISTENT & FAIL-SAFE)
   ========================================================================== */

import { api } from '../../services/api.js';
import { store } from '../../state.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const renderCustomerHistoryView = async () => {
  const user = store.getState().currentUser || JSON.parse(localStorage.getItem('qr_customer_user'));
  const session = store.getState().activeSession || JSON.parse(localStorage.getItem('qr_last_session'));

  const customerPhone = user?.phone || session?.customerPhone || '9876543210';
  const customerName = user?.name || session?.customerName || 'Rahul Kumar';
  const customerId = user?.id || session?.customerId || 'CUST-001';

  const normalizePhone = (p) => (p || '').replace(/\D/g, '').slice(-10);
  const targetPhoneNorm = normalizePhone(customerPhone);

  const allBills = await api.getBills();
  const allSessions = await api.getSessions();
  const allOrders = await api.getOrders();

  // Filter PAID bills that strictly belong to THIS SPECIFIC USER
  const userPaidBills = allBills.filter(b => {
    if (b.status !== 'PAID') return false;

    const billPhoneNorm = normalizePhone(b.customerPhone);
    const isDirectMatch = (billPhoneNorm && billPhoneNorm === targetPhoneNorm) || (b.customerId && b.customerId === customerId);
    if (isDirectMatch) return true;

    const linkedSession = allSessions.find(s => s.id === b.sessionId);
    if (linkedSession) {
      const sessPhoneNorm = normalizePhone(linkedSession.customerPhone);
      return (sessPhoneNorm && sessPhoneNorm === targetPhoneNorm) || (linkedSession.customerId && linkedSession.customerId === customerId);
    }

    return false;
  });

  const historyCardsHTML = userPaidBills.map(bill => {
    const sessionOrders = allOrders.filter(o => o.sessionId === bill.sessionId && o.status !== 'REJECTED');
    const linkedSession = allSessions.find(s => s.id === bill.sessionId);
    const displayTableNumber = bill.tableNumber || (linkedSession ? linkedSession.tableNumber : 'Table');

    const itemsList = [];
    sessionOrders.forEach(o => {
      o.items.forEach(i => {
        const existing = itemsList.find(x => x.name === i.name);
        if (existing) {
          existing.quantity += i.quantity;
          existing.total += (i.unitPrice * i.quantity);
        } else {
          itemsList.push({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, total: i.unitPrice * i.quantity });
        }
      });
    });

    return `
      <div class="card glass-panel" style="margin-bottom: 1.25rem; padding: 1.25rem; border-left: 4px solid var(--success);">
        <div class="flex items-center justify-between" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
          <div>
            <h4 style="margin: 0; color: var(--text-primary);">🧾 Invoice ${bill.id}</h4>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${formatDateTime(bill.paidAt || new Date().toISOString())}</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="badge badge-success font-mono">PAID ✓</span>
            <span class="badge badge-warning" style="margin-top: 0.25rem; font-size: 0.7rem;">📍 ${displayTableNumber}</span>
          </div>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <h5 style="margin: 0 0 0.5rem 0; color: var(--text-secondary);">Paid Items Summary</h5>
          ${itemsList.length === 0 ? `
            <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">Itemized details stored in receipt ${bill.id}.</p>
          ` : itemsList.map(i => `
            <div class="flex justify-between" style="font-size: 0.85rem; padding: 0.2rem 0;">
              <span><strong style="color: var(--primary);">${i.quantity}x</strong> ${i.name}</span>
              <span>${formatCurrency(i.total)}</span>
            </div>
          `).join('')}
        </div>

        <div class="flex items-center justify-between" style="border-top: 1px dashed var(--border-color); padding-top: 0.75rem; font-weight: 700;">
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Amount Paid via <strong>${bill.method || 'POS'}</strong></span>
            <div style="font-size: 1.15rem; color: var(--success);">${formatCurrency(bill.amount)}</div>
          </div>

          <button onclick="window.print()" class="btn btn-outline btn-sm">
            🖨️ Print Tax Invoice
          </button>
        </div>
      </div>
    `;
  });

  const viewHTML = `
    <div class="content-area customer-view-container">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Your Paid Bill History</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">User: ${customerName} (${customerPhone})</p>
        </div>
        <a href="#customer/menu" class="btn btn-primary btn-sm">+ Order Food</a>
      </div>

      ${historyCardsHTML.length === 0 ? `
        <div class="card text-center" style="padding: 3.5rem 1.5rem; margin-top: 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">📜</div>
          <h3>No Order History Found</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 400px; margin: 0 auto 1.5rem auto;">
            Past settled bills for <strong>${customerName}</strong> (${customerPhone}) will appear here after payment.
          </p>
          <a href="#customer/menu" class="btn btn-primary btn-lg" style="margin: 0 auto; display: inline-flex;">
            Browse Menu →
          </a>
        </div>
      ` : historyCardsHTML.join('')}
    </div>
  `;

  return viewHTML;
};
