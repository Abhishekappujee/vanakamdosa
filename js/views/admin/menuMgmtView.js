/* ==========================================================================
   SUPER ADMIN MENU MANAGEMENT VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatCurrency } from '../../utils/formatters.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderAdminMenuMgmtView = async () => {
  const items = await api.getMenuItems();
  const categories = await api.getCategories();

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Restaurant Menu Management</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Manage dishes, prices, availability, and modifiers</p>
        </div>
        <button id="btn-add-menu-item" class="btn btn-primary btn-sm">
          + Add New Menu Item
        </button>
      </div>

      <!-- Menu Items Table -->
      <div class="card glass-panel" style="padding: 0; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.85rem 1.25rem;">ITEM</th>
              <th style="padding: 0.85rem 1.25rem;">CATEGORY</th>
              <th style="padding: 0.85rem 1.25rem;">PRICE</th>
              <th style="padding: 0.85rem 1.25rem;">TYPE</th>
              <th style="padding: 0.85rem 1.25rem;">AVAILABILITY</th>
              <th style="padding: 0.85rem 1.25rem; text-align: right;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const cat = categories.find(c => c.id === item.categoryId);
              return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.85rem 1.25rem;">
                    <div class="flex items-center gap-3">
                      <img src="${item.image}" style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover;">
                      <div>
                        <strong style="color: var(--text-primary);">${item.name}</strong>
                        ${item.isBestseller ? '<span class="badge badge-warning" style="font-size: 0.65rem; margin-left: 4px;">BESTSELLER</span>' : ''}
                      </div>
                    </div>
                  </td>
                  <td style="padding: 0.85rem 1.25rem; color: var(--text-secondary);">${cat ? cat.name : 'General'}</td>
                  <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: var(--primary);">${formatCurrency(item.price)}</td>
                  <td style="padding: 0.85rem 1.25rem; text-transform: uppercase; font-size: 0.8rem;">${item.vegType}</td>
                  <td style="padding: 0.85rem 1.25rem;">
                    <button class="btn-toggle-avail badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}" data-id="${item.id}" style="cursor: pointer;">
                      ${item.isAvailable ? 'IN STOCK' : 'SOLD OUT'}
                    </button>
                  </td>
                  <td style="padding: 0.85rem 1.25rem; text-align: right;">
                    <button class="btn btn-secondary btn-sm btn-edit-item" data-id="${item.id}">✏️ Edit</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Add Item Modal
    const addBtn = document.getElementById('btn-add-menu-item');
    if (addBtn) {
      addBtn.onclick = () => {
        const modalContent = `
          <div class="form-group">
            <label class="form-label">Dish Name *</label>
            <input type="text" id="item-name" class="form-input" placeholder="e.g. Chicken Biryani" required>
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="item-cat" class="form-select">
              ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Selling Price (₹) *</label>
            <input type="number" id="item-price" class="form-input" placeholder="320" required>
          </div>
          <div class="form-group">
            <label class="form-label">Dietary Type *</label>
            <select id="item-veg" class="form-select">
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="egg">Contains Egg</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" id="item-desc" class="form-input" placeholder="Short description of ingredients...">
          </div>
          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" id="item-img" class="form-input" value="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80">
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-item">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-item">Save Menu Item</button>
        `;

        const modal = createModal({
          title: 'Add New Menu Item',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-item').onclick = modal.close;
        document.getElementById('btn-save-item').onclick = async () => {
          const name = document.getElementById('item-name').value;
          const categoryId = document.getElementById('item-cat').value;
          const price = parseFloat(document.getElementById('item-price').value);
          const vegType = document.getElementById('item-veg').value;
          const description = document.getElementById('item-desc').value;
          const image = document.getElementById('item-img').value;

          if (name && price) {
            const newItem = {
              id: `ITEM-${Date.now().toString(36)}`,
              categoryId,
              name,
              price,
              vegType,
              description,
              image,
              isAvailable: true,
              isBestseller: false,
              modifiers: []
            };
            await api.saveMenuItem(newItem);
            modal.close();
            showToast(`Added ${name} to menu`, 'success');
            window.location.reload();
          }
        };
      };
    }

    // Toggle Availability
    document.querySelectorAll('.btn-toggle-avail').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) {
          item.isAvailable = !item.isAvailable;
          await api.saveMenuItem(item);
          showToast(`Updated availability for ${item.name}`, 'info');
          window.location.reload();
        }
      };
    });
  }, 50);

  return viewHTML;
};
