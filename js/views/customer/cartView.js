/* ==========================================================================
   CUSTOMER CART & ORDER SUBMISSION VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { store } from '../../state.js';
import { formatCurrency, calculateTaxes } from '../../utils/formatters.js';
import { showToast } from '../../utils/toast.js';

export const renderCartView = async () => {
  let session = store.getState().activeSession || JSON.parse(localStorage.getItem('qr_last_session'));
  let user = store.getState().currentUser || JSON.parse(localStorage.getItem('qr_customer_user'));

  if (!user) {
    user = { id: 'CUST-001', name: 'Rahul Kumar', phone: '9876543210', role: 'customer' };
    store.setUser(user);
  }

  if (session && session.tableId) {
    const liveSession = await api.getActiveSessionByTable(session.tableId);
    if (liveSession) {
      session = liveSession;
      store.setSession(liveSession);
    } else if (session.status === 'closed') {
      session = {
        id: `SES-${Date.now().toString(36)}`,
        tableId: session.tableId,
        tableNumber: session.tableNumber || 'Table 04',
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        status: 'active',
        startedAt: new Date().toISOString()
      };
      await api.createSession(session);
      store.setSession(session);
    }
  }

  if (!session) {
    window.location.hash = '#customer/landing';
    return '';
  }

  const cart = store.getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.itemTotal * item.quantity), 0);
  const taxInfo = calculateTaxes(subtotal, 12);

  if (cart.length === 0) {
    return `
      <div class="content-area customer-view-container">
        <div class="card text-center" style="padding: 4rem 1.5rem; margin-top: 2rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p style="margin-bottom: 1.5rem;">Looks like you haven't added any items to your order yet.</p>
          <a href="#customer/menu" class="btn btn-primary btn-lg" style="margin: 0 auto; display: inline-flex;">
            Browse Restaurant Menu →
          </a>
        </div>
      </div>
    `;
  }

  const itemsListHTML = cart.map(item => `
    <div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">
      <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
        <div>
          <h4 style="margin: 0;">${item.name}</h4>
          ${item.customizations && item.customizations.length > 0 ? `
            <div style="font-size: 0.8rem; color: var(--primary);">
              Add-ons: ${item.customizations.map(c => c.name).join(', ')}
            </div>
          ` : ''}
          ${item.notes ? `
            <div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
              Note: ${item.notes}
            </div>
          ` : ''}
        </div>
        <div style="font-weight: 700; color: var(--primary); font-size: 1.05rem;">
          ${formatCurrency(item.itemTotal * item.quantity)}
        </div>
      </div>

      <div class="flex items-center justify-between" style="padding-top: 0.5rem; border-top: 1px dashed var(--border-color);">
        <span style="font-size: 0.85rem; color: var(--text-secondary);">${formatCurrency(item.itemTotal)} / unit</span>
        <div class="flex items-center gap-2" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.25rem 0.6rem;">
          <button class="btn-cart-minus btn-icon" data-key="${item.cartKey}" style="color: var(--text-primary); font-weight: bold;">-</button>
          <span style="font-weight: 700; min-width: 20px; text-align: center;">${item.quantity}</span>
          <button class="btn-cart-plus btn-icon" data-key="${item.cartKey}" style="color: var(--text-primary); font-weight: bold;">+</button>
        </div>
      </div>
    </div>
  `).join('');

  const viewHTML = `
    <div class="content-area customer-view-container">
      <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
        <h2 style="margin: 0;">Your Order Summary</h2>
        <span class="badge badge-warning">📍 ${session.tableNumber}</span>
      </div>

      <!-- Items List -->
      <div style="margin-bottom: 1.5rem;">
        ${itemsListHTML}
      </div>

      <!-- Bill Breakdown Card -->
      <div class="card glass-panel" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <h4 style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Price Details</h4>

        <div class="flex items-center justify-between" style="margin-bottom: 0.5rem; font-size: 0.95rem;">
          <span style="color: var(--text-secondary);">Item Subtotal</span>
          <span>${formatCurrency(taxInfo.subtotal)}</span>
        </div>

        <div class="flex items-center justify-between" style="margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
          <span>CGST (6%)</span>
          <span>${formatCurrency(taxInfo.cgst)}</span>
        </div>

        <div class="flex items-center justify-between" style="margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-muted);">
          <span>SGST (6%)</span>
          <span>${formatCurrency(taxInfo.sgst)}</span>
        </div>

        <div class="flex items-center justify-between" style="padding-top: 0.75rem; border-top: 1px solid var(--border-color); font-size: 1.2rem; font-weight: 800;">
          <span>To Pay</span>
          <span style="color: var(--primary);">${formatCurrency(taxInfo.grandTotal)}</span>
        </div>
      </div>

      <!-- Submit Order Action -->
      <button id="btn-place-order" class="btn btn-primary btn-lg w-full" style="box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);">
        ⚡ PLACE ORDER FOR APPROVAL
      </button>

      <p style="text-align: center; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.75rem;">
        Orders are verified by cafe staff prior to Kitchen Order Ticket (KOT) generation.
      </p>
    </div>
  `;

  // Attach Event Handlers
  setTimeout(() => {
    // Quantity Steppers
    document.querySelectorAll('.btn-cart-minus').forEach(btn => {
      btn.onclick = () => {
        store.updateCartQuantity(btn.dataset.key, -1);
        window.location.reload();
      };
    });

    document.querySelectorAll('.btn-cart-plus').forEach(btn => {
      btn.onclick = () => {
        store.updateCartQuantity(btn.dataset.key, 1);
        window.location.reload();
      };
    });

    // Place Order Button Handler
    const placeOrderBtn = document.getElementById('btn-place-order');
    if (placeOrderBtn) {
      placeOrderBtn.onclick = async () => {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Submitting Order...';

        try {
          // Check if there are already approved orders in this session -> if so, mark this as additional order
          const existingOrders = await api.getOrdersBySession(session.id);
          const isAdditional = existingOrders && existingOrders.length > 0;

          const orderData = {
            id: `ORD-2026-${(Math.floor(Math.random() * 90000) + 10000)}`,
            sessionId: session.id || 'SES-004',
            restaurantId: session.restaurantId || 'REST-001',
            tableId: session.tableId || 'TBL-004',
            tableNumber: session.tableNumber || 'Table 04',
            customerId: session.customerId || user.id || 'CUST-001',
            customerName: session.customerName || user.name || 'Rahul Kumar',
            customerPhone: session.customerPhone || user.phone || '9876543210',
            orderType: isAdditional ? 'additional' : 'initial',
            status: 'PENDING_APPROVAL',
            subtotal: taxInfo.subtotal || 0,
            tax: taxInfo.totalTax || 0,
            discount: 0,
            total: taxInfo.grandTotal || 0,
            items: cart.map(c => ({
              menuItemId: c.menuItemId || c.id || 'ITEM-001',
              name: c.name || 'Item',
              quantity: c.quantity || 1,
              unitPrice: c.unitPrice || c.price || 0,
              total: (c.itemTotal || c.price || 0) * (c.quantity || 1),
              notes: c.notes || '',
              modifiers: c.customizations || []
            })),
            createdAt: new Date().toISOString()
          };

          await api.createOrder(orderData);
          store.clearCart();

          showToast('Your order has been sent to the restaurant for approval!', 'success', 4000);
          window.location.hash = '#customer/orders';
        } catch (err) {
          console.error('Failed to place order:', err);
          placeOrderBtn.disabled = false;
          placeOrderBtn.textContent = '⚡ PLACE ORDER FOR APPROVAL';
          showToast('Failed to place order. Please try again.', 'error');
        }
      };
    }
  }, 50);

  return viewHTML;
};
