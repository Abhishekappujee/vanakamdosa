/* ==========================================================================
   PORTAL SELECTOR LANDING VIEW (ROLE GATEWAY)
   ========================================================================== */

import { Auth } from '../auth.js';

export const renderPortalSelectorView = () => {
  const viewHTML = `
    <div class="full-page-view" style="background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%); padding: 2rem 1rem;">
      <div style="width: 100%; max-width: 900px; margin: 0 auto; text-align: center;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">🍽️</div>
        <h1 style="font-size: 2.2rem; color: var(--text-primary); margin-bottom: 0.5rem;">Gourmet Bistro & Cafe Management</h1>
        <p style="color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto;">
          Touchless QR Table Ordering, POS Approval Queue, KOT Printing & Super Admin Financial Ecosystem
        </p>

        <!-- Role Portals Selector Cards Grid -->
        <div class="grid grid-cols-3 gap-4" style="text-align: left;">
          <!-- 1. Super Admin Portal Card -->
          <div class="card glass-panel flex flex-col justify-between" style="padding: 1.75rem; border-top: 4px solid var(--accent-purple);">
            <div>
              <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
                <span style="font-size: 2.5rem;">🛡️</span>
                <span class="badge badge-warning">ENTERPRISE</span>
              </div>
              <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Super Admin Portal</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                Executive Financial Dashboard, Manager CRUD, Raw Material Stock Ledger, Expenses, Capital Accounting & Reports.
              </p>
            </div>
            
            <div>
              <button id="btn-portal-admin" class="btn btn-primary w-full" style="background: var(--accent-purple); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
                Login as Super Admin →
              </button>
              <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; font-family: var(--font-mono);">
                Demo: admin / admin123
              </div>
            </div>
          </div>

          <!-- 2. Cafe Manager Portal Card -->
          <div class="card glass-panel flex flex-col justify-between" style="padding: 1.75rem; border-top: 4px solid var(--primary);">
            <div>
              <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
                <span style="font-size: 2.5rem;">👨‍🍳</span>
                <span class="badge badge-info">OPERATIONS</span>
              </div>
              <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Cafe Manager Portal</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                Live Table Layout, QR Code Generator, POS Order Kanban Queue, KOT Printer Center & Table Settlement.
              </p>
            </div>

            <div>
              <button id="btn-portal-manager" class="btn btn-primary w-full" style="box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);">
                Login as Cafe Manager →
              </button>
              <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; font-family: var(--font-mono);">
                Demo: manager / manager123
              </div>
            </div>
          </div>

          <!-- 3. Customer Mobile QR Menu Card -->
          <div class="card glass-panel flex flex-col justify-between" style="padding: 1.75rem; border-top: 4px solid var(--success);">
            <div>
              <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
                <span style="font-size: 2.5rem;">📱</span>
                <span class="badge badge-success">CUSTOMER</span>
              </div>
              <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Customer QR Order</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                Simulate customer scanning Table 04 QR code, browse mobile menu, place orders, track live status & request bill.
              </p>
            </div>

            <div>
              <a href="#customer/landing?table=Table_04&token=TOK_104" class="btn btn-success w-full" style="box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                Scan Table 04 QR Code →
              </a>
              <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; font-family: var(--font-mono);">
                Table 04 • Token: TOK_104
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const adminBtn = document.getElementById('btn-portal-admin');
    if (adminBtn) {
      adminBtn.onclick = () => {
        const res = Auth.loginStaff('admin', 'admin123');
        if (res.success) window.location.hash = '#admin/dashboard';
      };
    }

    const mgrBtn = document.getElementById('btn-portal-manager');
    if (mgrBtn) {
      mgrBtn.onclick = () => {
        const res = Auth.loginStaff('manager', 'manager123');
        if (res.success) window.location.hash = '#manager/dashboard';
      };
    }
  }, 50);

  return viewHTML;
};
