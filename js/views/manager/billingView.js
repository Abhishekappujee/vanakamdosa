/* ==========================================================================
   TABLE BILLING & PAYMENT PROCESSING VIEW WITH FULL PRINTABLE BILL
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderBillingView = async () => {
  const sessions = await api.getSessions();
  const bills = await api.getBills();
  const paidBills = bills.filter(b => b.status === 'PAID');
  const paidSessionIds = new Set(paidBills.map(b => b.sessionId));
  const activeSessions = sessions.filter(s => s.status !== 'closed' && !paidSessionIds.has(s.id));

  const openBillsHTML = activeSessions.length === 0 ? `
    <div class="card text-center" style="padding: 2rem 1.5rem; margin-bottom: 2rem;">
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🧾</div>
      <h4>No Active Unsettled Table Sessions</h4>
      <p style="margin-bottom: 0; color: var(--text-secondary);">Active table sessions requiring bill settlement will appear here.</p>
    </div>
  ` : `
    <div class="grid grid-cols-2 gap-4" style="margin-bottom: 2rem;">
      ${await Promise.all(activeSessions.map(async session => {
        const bill = await api.getBillBySession(session.id);
        return `
          <div class="card glass-panel" style="padding: 1.25rem;">
            <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
              <div>
                <h3 style="margin: 0; color: var(--text-primary);">${session.tableNumber}</h3>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${session.customerName} (${session.customerPhone})</span>
              </div>
              <span class="badge ${session.status === 'bill_requested' ? 'badge-danger' : 'badge-warning'}">
                ${session.status === 'bill_requested' ? 'BILL REQUESTED' : 'SESSION ACTIVE'}
              </span>
            </div>

            <!-- Summary -->
            <div style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 0.75rem 0; margin-bottom: 1rem;">
              <div class="flex justify-between" style="font-size: 0.9rem; margin-bottom: 0.25rem;">
                <span style="color: var(--text-muted);">Approved Subtotal</span>
                <span>${formatCurrency(bill.approvedSubtotal)}</span>
              </div>
              <div class="flex justify-between" style="font-size: 0.9rem; margin-bottom: 0.25rem;">
                <span style="color: var(--text-muted);">Total Tax (12% GST)</span>
                <span>${formatCurrency(bill.approvedTax)}</span>
              </div>
              <div class="flex justify-between items-center" style="font-size: 1.15rem; font-weight: 800; padding-top: 0.5rem;">
                <span>Grand Total</span>
                <span style="color: var(--primary);">${formatCurrency(bill.approvedTotal)}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 justify-end">
              <button class="btn btn-outline btn-sm btn-view-full-bill" data-session="${session.id}">
                👁️ View & Print Full Bill
              </button>
              <button class="btn btn-primary btn-sm btn-process-pay" data-session="${session.id}" data-amount="${bill.approvedTotal}" data-table="${session.tableNumber}">
                💳 Settle & Pay
              </button>
            </div>
          </div>
        `;
      }))}
    </div>
  `;

  const paidBillsHTML = `
    <div style="margin-top: 1.5rem;">
      <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
        <div>
          <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>💳 Recent Paid Bills & Settlement History</span>
            <span class="badge badge-success" style="font-size: 0.75rem;">${paidBills.length} Paid</span>
          </h3>
          <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary);">Historical settled bills and payment transactions</p>
        </div>
      </div>

      ${paidBills.length === 0 ? `
        <div class="card text-center" style="padding: 2rem; color: var(--text-muted);">
          <p style="margin: 0;">No completed payments recorded yet.</p>
        </div>
      ` : `
        <div class="card glass-panel" style="padding: 0; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.03);">
                  <th style="padding: 0.85rem 1rem; color: var(--text-muted);">Invoice #</th>
                  <th style="padding: 0.85rem 1rem; color: var(--text-muted);">Table</th>
                  <th style="padding: 0.85rem 1rem; color: var(--text-muted);">Customer</th>
                  <th style="padding: 0.85rem 1rem; color: var(--text-muted);">Amount Paid</th>
                  <th style="padding: 0.85rem 1rem; color: var(--text-muted);">Payment Method</th>
                  <th style="padding: 0.85rem 1rem; color: var(--text-muted);">Settled Date & Time</th>
                  <th style="padding: 0.85rem 1rem; text-align: right; color: var(--text-muted);">Action</th>
                </tr>
              </thead>
              <tbody>
                ${paidBills.map(b => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--primary);">${b.id}</td>
                    <td style="padding: 0.85rem 1rem; font-weight: 600;">${b.tableNumber}</td>
                    <td style="padding: 0.85rem 1rem;">
                      <div style="font-weight: 600;">${b.customerName || 'Guest'}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${b.customerPhone || ''}</div>
                    </td>
                    <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--success);">${formatCurrency(b.amount)}</td>
                    <td style="padding: 0.85rem 1rem;">
                      <span class="badge badge-info">${b.method || 'Cash'}</span>
                    </td>
                    <td style="padding: 0.85rem 1rem; font-size: 0.8rem; color: var(--text-secondary);">${formatDateTime(b.paidAt)}</td>
                    <td style="padding: 0.85rem 1rem; text-align: right;">
                      <button class="btn btn-outline btn-sm btn-view-full-bill" data-session="${b.sessionId}">
                        🧾 View Invoice
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    </div>
  `;

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Table Billing & Settlement Center</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Review complete itemized bills, print invoices, and settle table payments</p>
        </div>
        <a href="#manager/tables" class="btn btn-secondary btn-sm">+ Add / Manage Tables</a>
      </div>

      ${openBillsHTML}
      ${paidBillsHTML}
    </div>
  `;

  setTimeout(() => {
    // View & Print Full Itemized Bill Modal
    document.querySelectorAll('.btn-view-full-bill').forEach(btn => {
      btn.onclick = async () => {
        const sessionId = btn.dataset.session;
        const bill = await api.getBillBySession(sessionId);
        const { session, paidBill, approvedOrders, approvedSubtotal, approvedTax, approvedTotal } = bill;

        const itemsMap = {};
        const ordersToDisplay = (approvedOrders && approvedOrders.length > 0) ? approvedOrders : (bill.orders || []);
        ordersToDisplay.forEach(o => {
          if (Array.isArray(o.items)) {
            o.items.forEach(i => {
              const itemTotal = i.total || ((i.unitPrice || 0) * (i.quantity || 1));
              if (itemsMap[i.name]) {
                itemsMap[i.name].quantity += (i.quantity || 1);
                itemsMap[i.name].total += itemTotal;
              } else {
                itemsMap[i.name] = { ...i, total: itemTotal };
              }
            });
          }
        });
        const itemList = Object.values(itemsMap);

        const modalContent = `
          <div class="print-area invoice-print-container" style="padding: 1rem;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 0.75rem; margin-bottom: 1rem;">
              <h2 style="margin: 0; color: #000;">GOURMET BISTRO & CAFE</h2>
              <div style="font-size: 0.85rem; color: #333;">102 Culinary Boulevard • GSTIN: 27AAAAA0000A1Z5</div>
              <div style="font-weight: bold; margin-top: 0.5rem; font-size: 1.1rem; color: #000;">TAX INVOICE ${paidBill ? `(${paidBill.id})` : ''}</div>
              ${paidBill ? `<div style="display: inline-block; background: #dcfce7; color: #166534; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; margin-top: 0.25rem;">PAID via ${paidBill.method}</div>` : ''}
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 1rem; border-bottom: 1px dashed #ccc; padding-bottom: 0.5rem; color: #000;">
              <div>
                <strong>TABLE: ${session ? session.tableNumber : (paidBill ? paidBill.tableNumber : 'Table')}</strong><br>
                Customer: ${session ? session.customerName : (paidBill ? paidBill.customerName : 'Guest')}<br>
                Phone: ${session ? session.customerPhone : (paidBill ? paidBill.customerPhone : '-')}
              </div>
              <div style="text-align: right;">
                Session ID: ${sessionId}<br>
                Date: ${paidBill ? formatDateTime(paidBill.paidAt) : formatDateTime(new Date().toISOString())}
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.9rem; color: #000;">
              <thead>
                <tr style="border-bottom: 1px solid #000; text-align: left;">
                  <th style="padding: 0.4rem 0;">ITEM DISH</th>
                  <th style="padding: 0.4rem 0; text-align: center;">QTY</th>
                  <th style="padding: 0.4rem 0; text-align: right;">RATE</th>
                  <th style="padding: 0.4rem 0; text-align: right;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${itemList.map(item => `
                  <tr style="border-bottom: 1px dashed #eee;">
                    <td style="padding: 0.4rem 0;">${item.name}</td>
                    <td style="padding: 0.4rem 0; text-align: center;">${item.quantity}</td>
                    <td style="padding: 0.4rem 0; text-align: right;">${formatCurrency(item.unitPrice)}</td>
                    <td style="padding: 0.4rem 0; text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="border-top: 2px solid #000; padding-top: 0.5rem; font-size: 0.9rem; color: #000;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span>Subtotal:</span>
                <span>${formatCurrency(approvedSubtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span>CGST (6%):</span>
                <span>${formatCurrency(approvedTax / 2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>SGST (6%):</span>
                <span>${formatCurrency(approvedTax / 2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; border-top: 1px solid #000; padding-top: 0.5rem;">
                <span>GRAND TOTAL:</span>
                <span>${formatCurrency(approvedTotal)}</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 1.5rem; font-size: 0.8rem; color: #555;">
              Thank you for dining with us! Please visit again.
            </div>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-close-full-bill">Close</button>
          <button class="btn btn-primary btn-sm" id="btn-print-full-bill">🖨️ Print Entire Bill Invoice</button>
        `;

        const modal = createModal({
          title: `Itemized Bill - ${session ? session.tableNumber : (paidBill ? paidBill.tableNumber : 'Table')}`,
          contentHTML: modalContent,
          footerHTML: modalFooter,
          width: '600px'
        });

        document.getElementById('btn-close-full-bill').onclick = modal.close;
        document.getElementById('btn-print-full-bill').onclick = () => window.print();
      };
    });

    // Process Payment Modal
    document.querySelectorAll('.btn-process-pay').forEach(btn => {
      btn.onclick = () => {
        const sessionId = btn.dataset.session;
        const amount = parseFloat(btn.dataset.amount);
        const tableNumber = btn.dataset.table;

        const modalContent = `
          <div>
            <h4 style="margin-bottom: 1rem; color: var(--primary);">Collect Payment for ${tableNumber}</h4>
            
            <div class="form-group">
              <label class="form-label" for="pay-amount">Bill Amount Payable (₹)</label>
              <input type="number" id="pay-amount" class="form-input" value="${amount}" readonly>
            </div>

            <div class="form-group">
              <label class="form-label" for="pay-method">Payment Method *</label>
              <select id="pay-method" class="form-select">
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="pay-ref">Transaction Reference / Note (Optional)</label>
              <input type="text" id="pay-ref" class="form-input" placeholder="e.g. UPI Ref #98721">
            </div>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-pay">Cancel</button>
          <button class="btn btn-success btn-sm" id="btn-confirm-pay">Confirm Payment & Close Table</button>
        `;

        const modal = createModal({
          title: 'Payment Settlement',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-pay').onclick = modal.close;
        document.getElementById('btn-confirm-pay').onclick = async () => {
          const method = document.getElementById('pay-method').value;
          const confirmBtn = document.getElementById('btn-confirm-pay');
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Processing...';

          await api.recordPayment(sessionId, method, amount);
          modal.close();
          showToast(`Payment of ₹${amount} recorded via ${method}. Table session closed!`, 'success');
          window.location.reload();
        };
      };
    });
  }, 50);

  return viewHTML;
};
