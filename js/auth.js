/* ==========================================================================
   AUTHENTICATION & ROLE SESSION CONTROLLER
   ========================================================================== */

import { store } from './state.js';
import { showToast } from './utils/toast.js';
import { createModal } from './components/modal.js';

export const Auth = {
  // Login Super Admin or Manager
  loginStaff: (username, password) => {
    // Super Admin hardcoded security credentials (in production, verified via Firebase Auth / backend hash)
    if (username === 'admin' && password === 'admin123') {
      const user = {
        id: 'ADMIN-001',
        name: 'Super Administrator',
        role: 'super_admin',
        username: 'admin',
        assignedCafe: 'All Branches'
      };
      store.setUser(user);
      store.setSession(null);
      showToast('Welcome back, Super Admin!', 'success');
      return { success: true, role: 'super_admin' };
    }

    // Manager credentials check
    if (username === 'manager' && password === 'manager123') {
      const user = {
        id: 'MGR-001',
        name: 'Abhijeet Singh',
        role: 'manager',
        username: 'manager',
        assignedCafe: 'Gourmet Bistro (Main Branch)'
      };
      store.setUser(user);
      store.setSession(null);
      showToast('Welcome back, Manager Abhijeet!', 'success');
      return { success: true, role: 'manager' };
    }

    showToast('Invalid username or password credentials.', 'danger');
    return { success: false, error: 'Invalid credentials' };
  },

  // Customer OTP Login
  loginCustomer: (name, phone, otp = '123456') => {
    if (!name || !phone || phone.length < 10) {
      showToast('Please enter a valid full name and 10-digit mobile number.', 'warning');
      return { success: false };
    }

    const user = {
      id: `CUST-${Date.now().toString(36)}`,
      name: name.trim(),
      phone: phone.trim(),
      role: 'customer'
    };

    store.setUser(user);
    showToast(`Authenticated as ${name}`, 'success');
    return { success: true, user };
  },

  confirmLogout: () => {
    const user = store.getState().currentUser;
    const roleText = user?.role === 'manager' ? 'Manager' : (user?.role === 'super_admin' ? 'Administrator' : 'Customer');

    const modalContent = `
      <div style="text-align: center; padding: 0.75rem 0;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🚪</div>
        <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">Confirm Logout</h3>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem;">
          Are you sure you want to log out of your <strong>${roleText}</strong> account?
        </p>
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-secondary btn-sm" id="btn-cancel-logout">Cancel</button>
      <button class="btn btn-danger btn-sm" id="btn-confirm-logout" style="font-weight: 700;">Yes, Log Out</button>
    `;

    const modal = createModal({
      id: 'logout-confirm-modal',
      title: 'Logout Confirmation',
      contentHTML: modalContent,
      footerHTML: modalFooter,
      width: '420px'
    });

    document.getElementById('btn-cancel-logout').onclick = modal.close;
    document.getElementById('btn-confirm-logout').onclick = () => {
      modal.close();
      Auth.logout();
    };
  },

  logout: () => {
    store.setUser(null);
    store.setSession(null);
    store.clearCart();
    localStorage.removeItem('qr_user');
    localStorage.removeItem('qr_customer_user');
    localStorage.removeItem('qr_session');
    localStorage.removeItem('qr_last_session');
    sessionStorage.clear();
    showToast('Logged out successfully', 'info');
    window.location.hash = '#login';
    setTimeout(() => window.location.reload(), 100);
  },

  getCurrentUser: () => {
    return store.getState().currentUser;
  },

  checkAccess: (allowedRoles = []) => {
    const user = store.getState().currentUser;
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  }
};
