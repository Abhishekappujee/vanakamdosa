/* ==========================================================================
   ROLE-ISOLATED NAVIGATION BAR COMPONENT WITH HISTORY LINK
   ========================================================================== */

import { store } from '../state.js';
import { Auth } from '../auth.js';

export const renderNavbar = (currentRoute = '') => {
  const user = store.getState().currentUser;
  const session = store.getState().activeSession;
  const cart = store.getCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isStaff = user?.role === 'manager' || user?.role === 'super_admin';
  const rawHash = currentRoute || (window.location.hash || '');
  const currentHash = rawHash.split('?')[0];

  const isActive = (targetPath) => {
    if (currentHash === targetPath) return 'active';
    if ((!currentHash || currentHash === '#' || currentHash === '#landing') && ((user?.role === 'manager' && targetPath === '#manager/dashboard') || (user?.role === 'super_admin' && targetPath === '#admin/dashboard'))) {
      return 'active';
    }
    return '';
  };

  let navLinksHTML = '';

  if (user?.role === 'super_admin') {
    navLinksHTML = `
      <a href="#admin/dashboard" class="nav-item ${isActive('#admin/dashboard')}">Dashboard</a>
      <a href="#admin/managers" class="nav-item ${isActive('#admin/managers')}">Managers</a>
      <a href="#admin/menu" class="nav-item ${isActive('#admin/menu')}">Menu Mgmt</a>
      <a href="#admin/inventory" class="nav-item ${isActive('#admin/inventory')}">Inventory</a>
      <a href="#admin/finance" class="nav-item ${isActive('#admin/finance')}">Finance</a>
      <a href="#admin/reports" class="nav-item ${isActive('#admin/reports')}">Reports</a>
      <a href="#admin/audit" class="nav-item ${isActive('#admin/audit')}">Audit Logs</a>
    `;
  } else if (user?.role === 'manager') {
    navLinksHTML = `
      <a href="#manager/dashboard" class="nav-item ${isActive('#manager/dashboard')}">Dashboard</a>
      <a href="#manager/tables" class="nav-item ${isActive('#manager/tables')}">Tables & QR</a>
      <a href="#manager/orders" class="nav-item ${isActive('#manager/orders')}">Order Queue</a>
      <a href="#manager/kot" class="nav-item ${isActive('#manager/kot')}">KOT Center</a>
      <a href="#manager/billing" class="nav-item ${isActive('#manager/billing')}">Billing Settlement</a>
    `;
  }

  const bottomNavHTML = !isStaff && (session || user?.role === 'customer' || currentHash.startsWith('#customer')) ? `
    <nav class="mobile-bottom-nav">
      <a href="#customer/menu" class="bottom-nav-item ${isActive('#customer/menu')}">
        <span class="bottom-nav-icon">🍽️</span>
        <span class="bottom-nav-label">Menu</span>
      </a>
      <a href="#customer/orders" class="bottom-nav-item ${isActive('#customer/orders')}">
        <span class="bottom-nav-icon">📋</span>
        <span class="bottom-nav-label">Orders</span>
      </a>
      <a href="#customer/bill" class="bottom-nav-item ${isActive('#customer/bill')}">
        <span class="bottom-nav-icon">🧾</span>
        <span class="bottom-nav-label">Live Bill</span>
      </a>
      <a href="#customer/cart" class="bottom-nav-item ${isActive('#customer/cart')}">
        <span class="bottom-nav-icon">
          🛒
          ${cartCount > 0 ? `<span class="cart-badge-dot">${cartCount}</span>` : ''}
        </span>
        <span class="bottom-nav-label">Cart</span>
      </a>
      <a href="#customer/history" class="bottom-nav-item ${isActive('#customer/history')}">
        <span class="bottom-nav-icon">📜</span>
        <span class="bottom-nav-label">History</span>
      </a>
    </nav>
  ` : '';

  const navbarHTML = `
    <header class="navbar" style="background: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 0.75rem 1.25rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100;">
      <div class="navbar-left flex items-center gap-3">
        <a href="${user?.role === 'super_admin' ? '#admin/dashboard' : (user?.role === 'manager' ? '#manager/dashboard' : '#customer/menu')}" class="brand-logo flex items-center gap-2" style="font-weight: 700; font-size: 1.2rem; color: var(--primary);">
          <span style="font-size: 1.4rem;">🍽️</span>
          <span>Gourmet Bistro</span>
        </a>

        ${!isStaff && session ? `
          <span class="badge badge-warning" style="font-size: 0.85rem; padding: 0.3rem 0.75rem;">
            📍 ${session.tableNumber}
          </span>
        ` : ''}
      </div>

      ${isStaff ? `
        <nav class="navbar-center flex items-center gap-4 desktop-only">
          ${navLinksHTML}
        </nav>
      ` : ''}

      <div class="navbar-right flex items-center gap-3">
        ${user ? `
          <div class="user-profile flex items-center gap-2">
            <span class="badge badge-neutral">${user.role === 'manager' ? `👨‍🍳 ${user.name}` : (user.role === 'super_admin' ? `👑 ${user.name}` : user.name)}</span>
            <button id="logout-btn" class="btn btn-secondary btn-sm" title="Logout">
              🚪 Logout
            </button>
          </div>
        ` : ''}
      </div>
    </header>
    ${bottomNavHTML}
  `;

  setTimeout(() => {
    const activeRoute = (window.location.hash || '').split('?')[0];
    
    // Highlight top header nav items if present
    document.querySelectorAll('.navbar nav a.nav-item').forEach(el => {
      const href = el.getAttribute('href');
      const isMatch = href === activeRoute || ((!activeRoute || activeRoute === '#' || activeRoute === '#landing') && ((user?.role === 'manager' && href === '#manager/dashboard') || (user?.role === 'super_admin' && href === '#admin/dashboard')));
      if (isMatch) {
        el.classList.add('active');
        el.style.backgroundColor = '#f59e0b';
        el.style.color = '#090d16';
        el.style.fontWeight = '800';
        el.style.borderColor = '#f59e0b';
        el.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.45)';
      } else {
        el.classList.remove('active');
        el.style.backgroundColor = '';
        el.style.color = '';
        el.style.fontWeight = '';
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }
    });

    // Highlight bottom mobile nav items
    document.querySelectorAll('.mobile-bottom-nav a.bottom-nav-item').forEach(el => {
      const href = el.getAttribute('href');
      if (href === activeRoute) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    const btn = document.getElementById('logout-btn');
    if (btn) {
      btn.onclick = (e) => {
        if (e) e.preventDefault();
        Auth.confirmLogout();
      };
    }
  }, 20);

  return navbarHTML;
};
