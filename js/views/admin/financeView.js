/* ==========================================================================
   SUPER ADMIN CAPITAL & EXPENSE FINANCIAL MANAGEMENT VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderAdminFinanceView = async () => {
  const expenses = await api.getExpenses();
  const capital = await api.getCapital();

  const totalCapital = capital.reduce((sum, c) => c.type === 'withdrawal' ? sum - c.amount : sum + c.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Financial Management & Accounting</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Record capital investments, track operating expenses, and audit cashflows</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-add-capital" class="btn btn-outline btn-sm">+ Record Capital</button>
          <button id="btn-add-expense" class="btn btn-primary btn-sm">+ Log Expense</button>
        </div>
      </div>

      <!-- Financial Summary Cards -->
      <div class="grid grid-cols-2 gap-4" style="margin-bottom: 1.5rem;">
        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Total Net Capital Invested</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--accent-purple);">${formatCurrency(totalCapital)}</h2>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Capital is not treated as an operating expense.</div>
          </div>
          <div style="font-size: 2.2rem;">🏦</div>
        </div>

        <div class="card glass-panel flex items-center justify-between">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Total Operating Expenses Recorded</span>
            <h2 style="margin: 0.25rem 0 0 0; color: var(--danger);">${formatCurrency(totalExpenses)}</h2>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Includes Rent, Salaries, Electricity & Raw Materials</div>
          </div>
          <div style="font-size: 2.2rem;">💸</div>
        </div>
      </div>

      <!-- Section 1: Operating Expenses Table -->
      <div class="card glass-panel" style="margin-bottom: 1.5rem; padding: 0; overflow: hidden;">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color);" class="flex justify-between items-center">
          <h3 style="margin: 0;">Operating Expenses Ledger</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.85rem 1.25rem;">DATE</th>
              <th style="padding: 0.85rem 1.25rem;">CATEGORY</th>
              <th style="padding: 0.85rem 1.25rem;">DESCRIPTION</th>
              <th style="padding: 0.85rem 1.25rem;">VENDOR</th>
              <th style="padding: 0.85rem 1.25rem;">PAYMENT METHOD</th>
              <th style="padding: 0.85rem 1.25rem; text-align: right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(exp => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.85rem 1.25rem; color: var(--text-muted);">${formatDate(exp.date)}</td>
                <td style="padding: 0.85rem 1.25rem;"><span class="badge badge-warning">${exp.category}</span></td>
                <td style="padding: 0.85rem 1.25rem; font-weight: 500;">${exp.description}</td>
                <td style="padding: 0.85rem 1.25rem; color: var(--text-secondary);">${exp.vendor}</td>
                <td style="padding: 0.85rem 1.25rem;">${exp.paymentMethod}</td>
                <td style="padding: 0.85rem 1.25rem; text-align: right; font-weight: 700; color: var(--danger); font-size: 1rem;">
                  -${formatCurrency(exp.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 2: Capital Ledger Table -->
      <div class="card glass-panel" style="padding: 0; overflow: hidden;">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color);" class="flex justify-between items-center">
          <h3 style="margin: 0;">Capital Investment Transactions</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.85rem 1.25rem;">DATE</th>
              <th style="padding: 0.85rem 1.25rem;">TYPE</th>
              <th style="padding: 0.85rem 1.25rem;">DESCRIPTION</th>
              <th style="padding: 0.85rem 1.25rem;">RECORDED BY</th>
              <th style="padding: 0.85rem 1.25rem; text-align: right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${capital.map(cap => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.85rem 1.25rem; color: var(--text-muted);">${formatDate(cap.date)}</td>
                <td style="padding: 0.85rem 1.25rem;">
                  <span class="badge ${cap.type === 'withdrawal' ? 'badge-danger' : 'badge-success'}">${cap.type.toUpperCase()}</span>
                </td>
                <td style="padding: 0.85rem 1.25rem;">${cap.description}</td>
                <td style="padding: 0.85rem 1.25rem; color: var(--text-secondary);">${cap.createdBy}</td>
                <td style="padding: 0.85rem 1.25rem; text-align: right; font-weight: 700; color: var(--accent-purple); font-size: 1rem;">
                  ${cap.type === 'withdrawal' ? '-' : '+'}${formatCurrency(cap.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Add Expense Modal
    const expBtn = document.getElementById('btn-add-expense');
    if (expBtn) {
      expBtn.onclick = () => {
        const modalContent = `
          <div class="form-group">
            <label class="form-label">Expense Category *</label>
            <select id="exp-cat" class="form-select">
              <option value="Rent">Rent</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Gas">Gas</option>
              <option value="Salaries">Salaries</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Marketing">Marketing</option>
              <option value="Equipment">Equipment</option>
              <option value="Transportation">Transportation</option>
              <option value="Internet">Internet</option>
              <option value="Software">Software</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Expense Amount (₹) *</label>
            <input type="number" id="exp-amount" class="form-input" placeholder="e.g. 5000" required>
          </div>
          <div class="form-group">
            <label class="form-label">Vendor / Payee</label>
            <input type="text" id="exp-vendor" class="form-input" placeholder="e.g. State Power Corp">
          </div>
          <div class="form-group">
            <label class="form-label">Description / Invoice Ref</label>
            <input type="text" id="exp-desc" class="form-input" placeholder="e.g. Electricity bill for September">
          </div>
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select id="exp-method" class="form-select">
              <option value="UPI">UPI / NetBanking</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-exp">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-exp">Record Expense</button>
        `;

        const modal = createModal({
          title: 'Log Operating Expense',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-exp').onclick = modal.close;
        document.getElementById('btn-save-exp').onclick = async () => {
          const category = document.getElementById('exp-cat').value;
          const amount = parseFloat(document.getElementById('exp-amount').value);
          const vendor = document.getElementById('exp-vendor').value;
          const description = document.getElementById('exp-desc').value;
          const paymentMethod = document.getElementById('exp-method').value;

          if (amount > 0) {
            await api.addExpense({
              id: `EXP-${Date.now().toString(36)}`,
              category,
              amount,
              vendor,
              description,
              paymentMethod,
              date: new Date().toISOString().split('T')[0],
              createdBy: 'Super Admin'
            });
            modal.close();
            showToast(`Recorded expense of ₹${amount}`, 'success');
            window.location.reload();
          }
        };
      };
    }

    // Add Capital Modal
    const capBtn = document.getElementById('btn-add-capital');
    if (capBtn) {
      capBtn.onclick = () => {
        const modalContent = `
          <div class="form-group">
            <label class="form-label">Capital Transaction Type *</label>
            <select id="cap-type" class="form-select">
              <option value="addition">Additional Capital Injection (+)</option>
              <option value="withdrawal">Capital Withdrawal (-)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Amount (₹) *</label>
            <input type="number" id="cap-amount" class="form-input" placeholder="e.g. 100000" required>
          </div>
          <div class="form-group">
            <label class="form-label">Description / Purpose *</label>
            <input type="text" id="cap-desc" class="form-input" placeholder="e.g. Kitchen Equipment expansion fund" required>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-cap">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-cap">Record Capital Transaction</button>
        `;

        const modal = createModal({
          title: 'Record Capital Transaction',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-cap').onclick = modal.close;
        document.getElementById('btn-save-cap').onclick = async () => {
          const type = document.getElementById('cap-type').value;
          const amount = parseFloat(document.getElementById('cap-amount').value);
          const description = document.getElementById('cap-desc').value;

          if (amount > 0) {
            await api.addCapitalTransaction({
              id: `CAP-${Date.now().toString(36)}`,
              type,
              amount,
              description,
              date: new Date().toISOString().split('T')[0],
              createdBy: 'Super Admin'
            });
            modal.close();
            showToast(`Recorded capital ${type} of ₹${amount}`, 'success');
            window.location.reload();
          }
        };
      };
    }
  }, 50);

  return viewHTML;
};
