/* ==========================================================================
   CUSTOMER QR LANDING & TABLE AUTHENTICATION VIEW (NO CIRCULAR IMPORTS)
   ========================================================================== */

import { api } from '../../services/api.js';
import { Auth } from '../../auth.js';
import { store } from '../../state.js';

export const renderLandingView = async (params = {}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const tableToken = params.token || urlParams.get('token') || 'TOK_104';
  const tableNumberParam = params.table || urlParams.get('table') || 'Table 04';

  const table = await api.getTableByToken(tableToken);
  const displayTableNumber = table ? table.number : tableNumberParam;

  const viewHTML = `
    <div class="full-page-view" style="background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);">
      <div class="card glass-panel" style="width: 100%; max-width: 420px; padding: 2.25rem 1.75rem; text-align: center; box-shadow: var(--shadow-xl);">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🍽️</div>
        <h2 style="font-size: 1.6rem; color: var(--text-primary); margin-bottom: 0.25rem;">Gourmet Bistro & Cafe</h2>
        
        <div class="badge badge-warning" style="font-size: 0.95rem; padding: 0.4rem 1rem; margin: 0.75rem auto 1.5rem auto; display: inline-flex;">
          📍 Welcome to ${displayTableNumber}
        </div>

        <p style="color: var(--text-secondary); margin-bottom: 1.75rem; font-size: 0.9rem;">
          QR Code verified. Please enter your name and phone number to access the food menu and order directly from your table.
        </p>

        <form id="customer-login-form" style="text-align: left;">
          <div class="form-group">
            <label class="form-label" for="cust-name">Full Name *</label>
            <input type="text" id="cust-name" class="form-input" placeholder="e.g. Rahul Kumar" required value="Rahul Kumar">
          </div>

          <div class="form-group">
            <label class="form-label" for="cust-phone">Mobile Phone Number *</label>
            <input type="tel" id="cust-phone" class="form-input" placeholder="e.g. 9876543210" required value="9876543210" maxlength="10">
          </div>

          <button type="submit" id="btn-browse-menu-submit" class="btn btn-primary btn-lg w-full" style="margin-top: 1rem;">
            Browse Menu & Order →
          </button>
        </form>

        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
          Touchless QR Ordering • Table ${displayTableNumber}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const form = document.getElementById('customer-login-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('cust-name').value;
        const phone = document.getElementById('cust-phone').value;

        const authResult = Auth.loginCustomer(name, phone);
        if (authResult.success) {
          const targetTableId = table ? table.id : 'TBL-004';
          
          const session = {
            id: `SES-${Date.now().toString(36)}`,
            tableId: targetTableId,
            tableNumber: displayTableNumber,
            customerId: authResult.user.id,
            customerName: authResult.user.name,
            customerPhone: authResult.user.phone,
            status: 'active',
            startedAt: new Date().toISOString()
          };

          api.createSession(session);
          store.setSession(session);

          // Hash navigation automatically triggers hashchange listener in app.js
          window.location.hash = '#customer/menu';
        }
      };
    }
  }, 50);

  return viewHTML;
};
