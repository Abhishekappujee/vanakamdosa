/* ==========================================================================
   STAFF & ADMIN AUTHENTICATION LOGIN VIEW
   ========================================================================== */

import { Auth } from '../auth.js';

export const renderStaffLoginView = () => {
  const viewHTML = `
    <div class="full-page-view" style="background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);">
      <div class="card glass-panel" style="width: 100%; max-width: 420px; padding: 2.25rem 1.75rem; text-align: center; box-shadow: var(--shadow-xl);">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔑</div>
        <h2 style="font-size: 1.6rem; color: var(--text-primary); margin-bottom: 0.25rem;">Staff & Admin Authentication</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
          Enter your authorized staff credentials to continue
        </p>

        <form id="staff-login-form" style="text-align: left;">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input type="text" id="username" class="form-input" placeholder="Enter username" required value="manager">
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="••••••••" required value="manager123">
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full" style="margin-top: 0.75rem;">
            Sign In to Authorized Portal →
          </button>
        </form>

        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
          Protected Restaurant SaaS Management System
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const form = document.getElementById('staff-login-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const res = Auth.loginStaff(user, pass);
        if (res.success) {
          window.location.hash = res.role === 'super_admin' ? '#admin/dashboard' : '#manager/dashboard';
        }
      };
    }
  }, 50);

  return viewHTML;
};
