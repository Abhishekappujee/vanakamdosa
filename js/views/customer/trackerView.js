/* ==========================================================================
   LIVE ORDER STATUS & PROGRESS TRACKER VIEW (REFRESH SAFE)
   ========================================================================== */

import { api } from '../../services/api.js';
import { store } from '../../state.js';
import { formatCurrency, formatTime } from '../../utils/formatters.js';

export const renderTrackerView = async () => {
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

  // Guaranteed sync to live active table session in storage
  if (session && session.tableId) {
    const liveSession = await api.getActiveSessionByTable(session.tableId);
    if (liveSession) {
      session = liveSession;
      store.setSession(liveSession);
    }
  }

  const orders = await api.getOrdersBySession(session.id);
  const billData = await api.getBillBySession(session.id);
  const isBillRequested = session && session.status === 'bill_requested';

  if (orders.length === 0) {
    return `
      <div class="content-area">
        <div class="card text-center" style="padding: 3rem 1.5rem; margin-top: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
          <h2>No Active Orders</h2>
          <p style="margin-bottom: 1.5rem;">You haven't placed any orders in this session yet.</p>
          <a href="#customer/menu" class="btn btn-primary btn-lg">Browse Menu & Order →</a>
        </div>
      </div>
    `;
  }

  const renderStepTracker = (status) => {
    const steps = [
      { key: 'PENDING_APPROVAL', label: 'Submitted' },
      { key: 'APPROVED', label: 'Accepted' },
      { key: 'PREPARING', label: 'Preparing' },
      { key: 'READY', label: 'Ready' },
      { key: 'SERVED', label: 'Served' }
    ];

    const statusOrder = ['PENDING_APPROVAL', 'APPROVED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
    const currentIndex = status === 'COMPLETED' ? 5 : statusOrder.indexOf(status);

    if (status === 'REJECTED') {
      return `
        <div class="card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); padding: 1rem; color: var(--danger); text-align: center; margin: 1rem 0;">
          ⚠️ <strong>Order Rejected by Cafe Manager</strong>
        </div>
      `;
    }

    return `
      <div class="tracker-steps flex items-center justify-between" style="position: relative; margin: 1.5rem 0;">
        <div style="position: absolute; top: 14px; left: 0; right: 0; height: 3px; background: var(--border-color); z-index: 1;"></div>
        
        ${steps.map((step, idx) => {
          const isDone = currentIndex >= idx;
          const isCurrent = currentIndex === idx;

          return `
            <div class="flex flex-col items-center gap-1" style="z-index: 2; position: relative;">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; background: ${isDone ? 'var(--primary)' : 'var(--bg-surface)'}; color: ${isDone ? 'var(--text-inverse)' : 'var(--text-muted)'}; border: 2px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}; box-shadow: ${isCurrent ? '0 0 12px var(--primary)' : 'none'};">
                ${isDone ? '✓' : idx + 1}
              </div>
              <span style="font-size: 0.75rem; font-weight: ${isCurrent ? '700' : 'normal'}; color: ${isDone ? 'var(--text-primary)' : 'var(--text-muted)'};">
                ${step.label}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  const getBadgeHTML = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return '<span class="badge badge-warning">⏳ PENDING MANAGER APPROVAL</span>';
      case 'APPROVED':
        return '<span class="badge badge-info">✓ ACCEPTED BY KITCHEN</span>';
      case 'PREPARING':
        return '<span class="badge badge-warning">🔥 PREPARING IN KITCHEN</span>';
      case 'READY':
        return '<span class="badge badge-success">🔔 READY FOR SERVING</span>';
      case 'SERVED':
        return '<span class="badge badge-success">🍽️ SERVED AT TABLE ✓</span>';
      case 'COMPLETED':
        return '<span class="badge badge-success">COMPLETED & PAID ✓</span>';
      case 'REJECTED':
        return '<span class="badge badge-danger">❌ REJECTED BY STAFF</span>';
      default:
        return `<span class="badge badge-warning">${status}</span>`;
    }
  };

  const ordersCardsHTML = orders.map(order => {
    const displayStatus = order.status;

    return `
      <div class="card glass-panel" style="margin-bottom: 1.5rem; padding: 1.25rem;">
        <div class="flex items-center justify-between" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div>
            <h4 style="margin: 0;">Order #${order.id}</h4>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${formatTime(order.createdAt)} • ${order.orderType.toUpperCase()} ORDER</span>
          </div>
          ${getBadgeHTML(displayStatus)}
        </div>

        ${displayStatus === 'PENDING_APPROVAL' ? `
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px dashed var(--primary); border-radius: var(--radius-md); padding: 0.75rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;" class="flex items-center gap-2">
            <span>⏳</span>
            <span>Your order has been submitted and is currently <strong>awaiting manager approval</strong>. Kitchen tickets (KOT) will print once accepted by staff.</span>
          </div>
        ` : ''}

        ${displayStatus === 'SERVED' ? `
          <div style="background: rgba(34, 197, 94, 0.12); border: 1.5px solid var(--success); border-radius: var(--radius-md); padding: 1rem; margin: 1rem 0; text-align: center;">
            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🍽️</div>
            <h4 style="margin: 0 0 0.25rem 0; color: var(--success);">Food Served at Table!</h4>
            <p style="margin: 0 0 0.85rem 0; font-size: 0.85rem; color: var(--text-secondary);">Enjoy your meal! Whenever you are ready, tap below to request your final bill & payment terminal.</p>
            <button class="btn-card-request-bill btn btn-primary btn-md w-full" style="box-shadow: 0 4px 15px rgba(245, 158, 11, 0.45); font-weight: 800;" ${isBillRequested ? 'disabled' : ''}>
              ${isBillRequested ? '🔔 Bill Requested ✓ (Staff Processing)' : '🔔 REQUEST FINAL BILL FOR SETTLEMENT'}
            </button>
          </div>
        ` : ''}

        ${renderStepTracker(displayStatus)}

        <div style="margin-top: 1rem; border-top: 1px dashed var(--border-color); padding-top: 0.75rem;">
          <h5 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Ordered Items</h5>
          ${order.items.map(i => `
            <div class="flex justify-between" style="font-size: 0.9rem; padding: 0.25rem 0;">
              <span><strong style="color: var(--primary);">${i.quantity}x</strong> ${i.name}</span>
              <span>${formatCurrency(i.unitPrice * i.quantity)}</span>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between items-center" style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); font-weight: 700;">
          <span>Total</span>
          <span style="color: var(--primary); font-size: 1.1rem;">${formatCurrency(order.total)}</span>
        </div>
      </div>
    `;
  }).join('');

  const viewHTML = `
    <div class="content-area customer-view-container">
      <div class="flex items-center justify-between" style="margin-bottom: 1.25rem;">
        <div>
          <h2 style="margin: 0;">Live Order Status</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--primary);">📍 ${session.tableNumber}</p>
        </div>
        ${!billData.isPaid ? `
          <a href="#customer/menu" class="btn btn-primary btn-sm">
            + ADD MORE ITEMS
          </a>
        ` : ''}
      </div>

      ${isBillRequested ? `
        <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid var(--primary); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.25rem;">🔔</div>
          <h3 style="margin: 0 0 0.25rem 0; color: var(--primary);">Final Bill Requested</h3>
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">Cafe staff has been notified! A manager is bringing your receipt to <strong>${session.tableNumber}</strong>.</p>
        </div>
      ` : ''}

      ${ordersCardsHTML}

      ${!billData.isPaid ? `
        <!-- Request Final Bill & Pay Section -->
        <div class="card glass-panel print-area" style="padding: 1.5rem; margin-top: 1.5rem; border: 1.5px solid var(--primary-border);">
          <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
            <div>
              <h4 style="margin: 0; color: var(--text-primary);">🍽️ Finished Your Meal?</h4>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">Request your final bill & POS payment terminal from staff</p>
            </div>
            <span class="badge ${isBillRequested ? 'badge-warning' : 'badge-primary'}">
              ${isBillRequested ? 'BILL REQUESTED' : 'UNPAID'}
            </span>
          </div>

          <div class="flex flex-col gap-3" style="margin-top: 1.25rem;">
            ${isBillRequested ? `
              <button class="btn btn-secondary btn-lg w-full" disabled style="opacity: 0.9;">
                🔔 Bill Requested ✓ (Staff Processing)
              </button>
            ` : `
              <button id="btn-tracker-request-bill" class="btn btn-primary btn-lg w-full" style="box-shadow: 0 4px 18px rgba(245, 158, 11, 0.45); font-weight: 800; font-size: 1.05rem;">
                🔔 REQUEST FINAL BILL & PAY
              </button>
            `}

            <a href="#customer/bill" class="btn btn-outline w-full text-center" style="font-weight: 600;">
              🧾 View Itemized Bill Breakdown (${formatCurrency(billData.allOrdersTotal || billData.approvedTotal)}) →
            </a>
          </div>
        </div>
      ` : `
        <div class="flex gap-3 justify-between" style="margin-top: 1.5rem;">
          <a href="#customer/bill" class="btn btn-outline w-full text-center">
            View Paid Tax Invoice →
          </a>
        </div>
      `}
    </div>
  `;

  setTimeout(() => {
    const handleBillRequest = async (btn) => {
      btn.disabled = true;
      btn.textContent = 'Bill Requested ✓';
      await api.updateSessionStatus(session.id, 'bill_requested');
      showToast('Bill request sent! Cafe manager is coming to your table.', 'success', 5000);
      setTimeout(() => window.location.reload(), 800);
    };

    const trackerReqBtn = document.getElementById('btn-tracker-request-bill');
    if (trackerReqBtn && !isBillRequested) {
      trackerReqBtn.onclick = () => handleBillRequest(trackerReqBtn);
    }

    document.querySelectorAll('.btn-card-request-bill').forEach(btn => {
      if (!isBillRequested) {
        btn.onclick = () => handleBillRequest(btn);
      }
    });
  }, 50);

  return viewHTML;
};
