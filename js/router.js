/* ==========================================================================
   SINGLE PAGE APPLICATION (SPA) ROUTER WITH FAIL-SAFE CUSTOMER MEMORY
   ========================================================================== */

import { renderNavbar } from './components/navbar.js';
import { Auth } from './auth.js';
import { store } from './state.js';

// Views
import { renderPortalSelectorView } from './views/portalSelectorView.js';
import { renderStaffLoginView } from './views/staffLoginView.js';
import { renderLandingView } from './views/customer/landingView.js';
import { renderMenuView } from './views/customer/menuView.js';
import { renderCartView } from './views/customer/cartView.js';
import { renderTrackerView } from './views/customer/trackerView.js';
import { renderBillView } from './views/customer/billView.js';
import { renderCustomerHistoryView } from './views/customer/historyView.js';

import { renderManagerDashboardView } from './views/manager/dashboardView.js';
import { renderTableMgmtView } from './views/manager/tableMgmtView.js';
import { renderOrderQueueView } from './views/manager/orderQueueView.js';
import { renderKotView } from './views/manager/kotView.js';
import { renderBillingView } from './views/manager/billingView.js';

import { renderAdminDashboardView } from './views/admin/dashboardView.js';
import { renderAdminManagersView } from './views/admin/managersView.js';
import { renderAdminMenuMgmtView } from './views/admin/menuMgmtView.js';
import { renderAdminInventoryView } from './views/admin/inventoryView.js';
import { renderAdminFinanceView } from './views/admin/financeView.js';
import { renderAdminReportsView } from './views/admin/reportsView.js';
import { renderAdminAuditLogView } from './views/admin/auditLogView.js';

const routes = {
  '': { render: renderPortalSelectorView, public: true },
  '#landing': { render: renderPortalSelectorView, public: true },
  '#login': { render: renderStaffLoginView, public: true },
  '#customer/landing': { render: renderLandingView, public: true },
  '#customer/menu': { render: renderMenuView, roles: ['customer', 'manager', 'super_admin'] },
  '#customer/cart': { render: renderCartView, roles: ['customer', 'manager', 'super_admin'] },
  '#customer/orders': { render: renderTrackerView, roles: ['customer', 'manager', 'super_admin'] },
  '#customer/bill': { render: renderBillView, roles: ['customer', 'manager', 'super_admin'] },
  '#customer/history': { render: renderCustomerHistoryView, roles: ['customer', 'manager', 'super_admin'] },

  '#manager/dashboard': { render: renderManagerDashboardView, roles: ['manager', 'super_admin'] },
  '#manager/tables': { render: renderTableMgmtView, roles: ['manager', 'super_admin'] },
  '#manager/orders': { render: renderOrderQueueView, roles: ['manager', 'super_admin'] },
  '#manager/kot': { render: renderKotView, roles: ['manager', 'super_admin'] },
  '#manager/billing': { render: renderBillingView, roles: ['manager', 'super_admin'] },

  '#admin/dashboard': { render: renderAdminDashboardView, roles: ['super_admin'] },
  '#admin/managers': { render: renderAdminManagersView, roles: ['super_admin'] },
  '#admin/menu': { render: renderAdminMenuMgmtView, roles: ['super_admin'] },
  '#admin/inventory': { render: renderAdminInventoryView, roles: ['super_admin'] },
  '#admin/finance': { render: renderAdminFinanceView, roles: ['super_admin'] },
  '#admin/reports': { render: renderAdminReportsView, roles: ['super_admin'] },
  '#admin/audit': { render: renderAdminAuditLogView, roles: ['super_admin'] }
};

export const handleRoute = async () => {
  const hashPath = window.location.hash.split('?')[0] || '';
  const route = routes[hashPath] || routes[''];

  if (!route.public) {
    const user = store.getState().currentUser || JSON.parse(localStorage.getItem('qr_customer_user'));
    const session = store.getState().activeSession || JSON.parse(localStorage.getItem('qr_last_session'));

    if (!user && !session) {
      window.location.hash = '#customer/landing';
      return;
    }

    if (route.roles && user && user.role !== 'customer' && !route.roles.includes(user.role)) {
      window.location.hash = user.role === 'super_admin' ? '#admin/dashboard' : '#manager/dashboard';
      return;
    }
  }

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const isFullPage = hashPath === '#login' || hashPath === '#customer/landing' || hashPath === '' || hashPath === '#landing';
  const navbarHTML = isFullPage ? '' : renderNavbar(hashPath);

  const viewHTML = await route.render();
  
  appContainer.innerHTML = `
    ${navbarHTML}
    <main id="main-content-mount">
      ${viewHTML}
    </main>
  `;
};
