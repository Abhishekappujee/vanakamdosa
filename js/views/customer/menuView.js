/* ==========================================================================
   MOBILE-FIRST CUSTOMER MENU VIEW (NO CIRCULAR IMPORTS)
   ========================================================================== */

import { api } from '../../services/api.js';
import { store } from '../../state.js';
import { formatCurrency } from '../../utils/formatters.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderMenuView = async () => {
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
    await api.createSession(session);
    store.setSession(session);
  }

  const categories = await api.getCategories();
  const menuItems = await api.getMenuItems();

  let activeCategory = 'ALL';
  let searchQuery = '';

  const renderItemsGrid = () => {
    let filtered = menuItems.filter(item => {
      const matchCat = activeCategory === 'ALL' || item.categoryId === activeCategory;
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      return `
        <div class="card text-center" style="grid-column: 1 / -1; padding: 3rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h4>No Menu Items Found</h4>
          <p style="margin-bottom: 0;">Try adjusting your search query or category filter.</p>
        </div>
      `;
    }

    const currentCart = store.getCart();

    return filtered.map(item => {
      const cartItemsOfThisMenu = currentCart.filter(c => c.menuItemId === item.id);
      const totalQtyInCart = cartItemsOfThisMenu.reduce((sum, c) => sum + c.quantity, 0);
      const symbolClass = item.vegType === 'veg' ? 'veg-symbol' : (item.vegType === 'non-veg' ? 'nonveg-symbol' : 'egg-symbol');

      return `
        <div class="card card-interactive menu-item-card" style="display: flex; gap: 1rem; position: relative;">
          <div style="width: 100px; height: 100px; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-surface); flex-shrink: 0;">
            <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="flex items-center gap-2" style="margin-bottom: 0.25rem;">
                <span class="${symbolClass}"></span>
                <h4 style="margin: 0; font-size: 1rem;">${item.name}</h4>
              </div>

              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${item.description}
              </p>

              <div class="flex items-center gap-1">
                ${item.tags ? item.tags.map(t => `<span class="badge badge-warning" style="font-size: 0.65rem; padding: 0.15rem 0.4rem;">${t}</span>`).join('') : ''}
              </div>
            </div>

            <div class="flex items-center justify-between" style="margin-top: 0.5rem;">
              <span style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">${formatCurrency(item.price)}</span>

              ${!item.isAvailable ? `
                <span class="badge badge-danger">SOLD OUT</span>
              ` : (totalQtyInCart > 0 ? `
                <div class="flex items-center gap-2" style="background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: var(--radius-md); padding: 0.2rem 0.5rem;">
                  <button class="btn-qty-minus btn-icon" data-id="${item.id}" style="color: var(--primary); font-weight: bold; font-size: 1.1rem;">-</button>
                  <span style="font-weight: 700; color: var(--primary); min-width: 18px; text-align: center;">${totalQtyInCart}</span>
                  <button class="btn-qty-plus btn-icon" data-id="${item.id}" style="color: var(--primary); font-weight: bold; font-size: 1.1rem;">+</button>
                </div>
              ` : `
                <button class="btn btn-outline btn-sm btn-add-item" data-id="${item.id}">
                  + ADD ${item.modifiers && item.modifiers.length > 0 ? '<span style="font-size: 0.65rem;">(CUSTOM)</span>' : ''}
                </button>
              `)}
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  const updateStickyBar = () => {
    const isStaff = user?.role === 'manager' || user?.role === 'super_admin';
    let stickyBar = document.getElementById('customer-sticky-bar-container');
    if (isStaff) {
      if (stickyBar) stickyBar.remove();
      return;
    }

    const currentCart = store.getCart();
    const totalCartCount = currentCart.reduce((sum, c) => sum + c.quantity, 0);
    const totalCartAmount = currentCart.reduce((sum, c) => sum + (c.itemTotal * c.quantity), 0);

    if (totalCartCount > 0) {
      if (!stickyBar) {
        stickyBar = document.createElement('div');
        stickyBar.id = 'customer-sticky-bar-container';
        stickyBar.className = 'customer-sticky-bar flex items-center justify-between';
        document.body.appendChild(stickyBar);
      }
      stickyBar.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">${totalCartCount} Items Added</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${formatCurrency(totalCartAmount)} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">+ Taxes</span></div>
        </div>
        <a href="#customer/cart" class="btn btn-primary btn-lg" style="box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
          View Cart & Order →
        </a>
      `;
    } else if (stickyBar) {
      stickyBar.remove();
    }
  };

  const isStaff = user?.role === 'manager' || user?.role === 'super_admin';

  const viewHTML = `
    <div class="content-area customer-view-container">
      <!-- Customer Header Bar -->
      <div class="card glass-panel" style="margin-bottom: 1.25rem; padding: 1rem 1.25rem;">
        <div class="flex items-center justify-between">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem;">Gourmet Bistro & Cafe</h3>
            <p style="margin: 0; font-size: 0.85rem; color: var(--primary);">${isStaff ? '👨‍🍳 Staff Menu Preview Mode' : `📍 ${session.tableNumber} • Customer: ${session.customerName}`}</p>
          </div>
        </div>
      </div>

      <!-- Search & Category Tabs -->
      <div class="flex flex-col gap-3" style="margin-bottom: 1.25rem;">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="menu-search-input" class="form-input" placeholder="Search dishes, drinks, desserts...">
        </div>

        <div class="flex items-center justify-between">
          <div class="tabs-container">
            <button class="tab-btn active" data-category="ALL">All Categories</button>
            ${categories.map(c => `<button class="tab-btn" data-category="${c.id}">${c.name}</button>`).join('')}
          </div>
        </div>
      </div>

      <!-- Food Menu Grid -->
      <div id="menu-grid-container" class="grid grid-cols-2 gap-4">
        ${renderItemsGrid()}
      </div>
    </div>
  `;

  setTimeout(() => {
    updateStickyBar();

    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        const grid = document.getElementById('menu-grid-container');
        if (grid) grid.innerHTML = renderItemsGrid();
      };
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
        const grid = document.getElementById('menu-grid-container');
        if (grid) grid.innerHTML = renderItemsGrid();
      };
    });

    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.btn-add-item');
      const plusBtn = e.target.closest('.btn-qty-plus');
      const minusBtn = e.target.closest('.btn-qty-minus');

      if (addBtn) {
        const itemId = addBtn.dataset.id;
        const item = menuItems.find(m => m.id === itemId);
        if (item) {
          if (item.modifiers && item.modifiers.length > 0) {
            openCustomizationModal(item);
          } else {
            store.addToCart(item, 1);
            showToast(`Added ${item.name} to cart`, 'success');
            const grid = document.getElementById('menu-grid-container');
            if (grid) grid.innerHTML = renderItemsGrid();
            updateStickyBar();
          }
        }
      }

      if (plusBtn) {
        const itemId = plusBtn.dataset.id;
        const cartItem = store.getCart().find(c => c.menuItemId === itemId);
        if (cartItem) {
          store.updateCartQuantity(cartItem.cartKey, 1);
          const grid = document.getElementById('menu-grid-container');
          if (grid) grid.innerHTML = renderItemsGrid();
          updateStickyBar();
        }
      }

      if (minusBtn) {
        const itemId = minusBtn.dataset.id;
        const cartItem = store.getCart().find(c => c.menuItemId === itemId);
        if (cartItem) {
          store.updateCartQuantity(cartItem.cartKey, -1);
          const grid = document.getElementById('menu-grid-container');
          if (grid) grid.innerHTML = renderItemsGrid();
          updateStickyBar();
        }
      }
    });
  }, 50);

  const openCustomizationModal = (item) => {
    const modifiersHTML = item.modifiers.map(mod => `
      <label class="flex items-center justify-between" style="padding: 0.65rem 0.85rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; margin-bottom: 0.5rem;">
        <div class="flex items-center gap-2">
          <input type="checkbox" class="mod-checkbox" value="${mod.id}" data-name="${mod.name}" data-price="${mod.price}" style="width: 18px; height: 18px; accent-color: var(--primary);">
          <span style="font-weight: 500;">${mod.name}</span>
        </div>
        <span style="font-weight: 700; color: var(--primary);">+${formatCurrency(mod.price)}</span>
      </label>
    `).join('');

    const modalContent = `
      <div>
        <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${item.name}</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Select optional add-ons and cooking instructions.</p>

        <div style="margin-bottom: 1rem;">
          <label class="form-label" style="margin-bottom: 0.5rem; display: block;">Customizations & Add-ons</label>
          ${modifiersHTML}
        </div>

        <div class="form-group">
          <label class="form-label" for="special-notes">Special Kitchen Instructions</label>
          <input type="text" id="special-notes" class="form-input" placeholder="e.g. Less spicy, extra sauce on side...">
        </div>
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-secondary btn-sm" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary btn-sm" id="modal-add-cart">Add to Order (${formatCurrency(item.price)})</button>
    `;

    const modal = createModal({
      title: 'Customize Your Dish',
      contentHTML: modalContent,
      footerHTML: modalFooter
    });

    document.getElementById('modal-cancel').onclick = modal.close;
    document.getElementById('modal-add-cart').onclick = () => {
      const selectedMods = [];
      document.querySelectorAll('.mod-checkbox:checked').forEach(cb => {
        selectedMods.push({
          id: cb.value,
          name: cb.dataset.name,
          price: parseFloat(cb.dataset.price)
        });
      });
      const notes = document.getElementById('special-notes').value;

      store.addToCart(item, 1, selectedMods, notes);
      modal.close();
      showToast(`Added customized ${item.name} to cart`, 'success');
      const grid = document.getElementById('menu-grid-container');
      if (grid) grid.innerHTML = renderItemsGrid();
      updateStickyBar();
    };
  };

  return viewHTML;
};
