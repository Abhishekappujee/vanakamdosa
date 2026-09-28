/* ==========================================================================
   SUPER ADMIN MANAGER MANAGEMENT VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatDate } from '../../utils/formatters.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderAdminManagersView = async () => {
  const managers = await api.getManagers();

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Cafe Manager Management</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Add, edit, assign permissions, and control staff access credentials</p>
        </div>
        <button id="btn-add-manager" class="btn btn-primary btn-sm">
          + Add New Manager
        </button>
      </div>

      <div class="card glass-panel" style="padding: 0; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.85rem 1.25rem;">NAME</th>
              <th style="padding: 0.85rem 1.25rem;">CONTACT</th>
              <th style="padding: 0.85rem 1.25rem;">USERNAME</th>
              <th style="padding: 0.85rem 1.25rem;">ASSIGNED BRANCH</th>
              <th style="padding: 0.85rem 1.25rem;">STATUS</th>
              <th style="padding: 0.85rem 1.25rem;">CREATED</th>
              <th style="padding: 0.85rem 1.25rem; text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${managers.map(mgr => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.85rem 1.25rem; font-weight: 600;">${mgr.name}</td>
                <td style="padding: 0.85rem 1.25rem; color: var(--text-secondary);">${mgr.email}<br><span style="font-size: 0.75rem;">${mgr.phone}</span></td>
                <td style="padding: 0.85rem 1.25rem; font-family: var(--font-mono);">${mgr.username}</td>
                <td style="padding: 0.85rem 1.25rem;">Gourmet Bistro Main</td>
                <td style="padding: 0.85rem 1.25rem;">
                  <span class="badge ${mgr.status === 'active' ? 'badge-success' : 'badge-danger'}">${mgr.status.toUpperCase()}</span>
                </td>
                <td style="padding: 0.85rem 1.25rem; color: var(--text-muted);">${formatDate(mgr.createdAt)}</td>
                <td style="padding: 0.85rem 1.25rem; text-align: right;">
                  <button class="btn btn-secondary btn-sm btn-edit-mgr" data-id="${mgr.id}">✏️ Edit</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    const addBtn = document.getElementById('btn-add-manager');
    if (addBtn) {
      addBtn.onclick = () => {
        const modalContent = `
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="mgr-name" class="form-input" placeholder="e.g. Vikram Sharma" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="mgr-email" class="form-input" placeholder="vikram@restaurant.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Mobile Phone Number *</label>
            <input type="tel" id="mgr-phone" class="form-input" placeholder="9876543210" required>
          </div>
          <div class="form-group">
            <label class="form-label">Login Username *</label>
            <input type="text" id="mgr-user" class="form-input" placeholder="vikram_mgr" required>
          </div>
          <div class="form-group">
            <label class="form-label">Initial Password *</label>
            <input type="password" id="mgr-pass" class="form-input" placeholder="••••••••" required value="manager123">
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-mgr">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-mgr">Save Manager</button>
        `;

        const modal = createModal({
          title: 'Add New Cafe Manager',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-mgr').onclick = modal.close;
        document.getElementById('btn-save-mgr').onclick = async () => {
          const name = document.getElementById('mgr-name').value;
          const email = document.getElementById('mgr-email').value;
          const phone = document.getElementById('mgr-phone').value;
          const username = document.getElementById('mgr-user').value;

          if (name && username) {
            const newMgr = {
              id: `MGR-${Date.now().toString(36)}`,
              name,
              email,
              phone,
              username,
              role: 'manager',
              restaurantId: 'REST-001',
              status: 'active',
              createdAt: new Date().toISOString()
            };
            await api.saveManager(newMgr);
            modal.close();
            showToast(`Added manager ${name}`, 'success');
            window.location.reload();
          }
        };
      };
    }
  }, 50);

  return viewHTML;
};
