/* ==========================================================================
   SUPER ADMIN INVENTORY MANAGEMENT & TRANSACTION LEDGER VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderAdminInventoryView = async () => {
  const inventory = await api.getInventory();
  const transactions = await api.getInventoryTransactions();

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Inventory Management & Stock Ledger</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Track raw ingredients, add new stock items, record usage/wastage, and audit transactions</p>
        </div>
        <button id="btn-add-inv-item" class="btn btn-primary btn-sm">
          + Add New Inventory Item
        </button>
      </div>

      <!-- Current Inventory Stock Grid -->
      <div class="card glass-panel" style="margin-bottom: 1.5rem; padding: 0; overflow: hidden;">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color);" class="flex justify-between items-center">
          <h3 style="margin: 0;">Current Raw Material Stock</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.85rem 1.25rem;">ITEM NAME</th>
              <th style="padding: 0.85rem 1.25rem;">SKU CODE</th>
              <th style="padding: 0.85rem 1.25rem;">CURRENT STOCK</th>
              <th style="padding: 0.85rem 1.25rem;">MIN LEVEL</th>
              <th style="padding: 0.85rem 1.25rem;">PURCHASE PRICE</th>
              <th style="padding: 0.85rem 1.25rem;">SUPPLIER</th>
              <th style="padding: 0.85rem 1.25rem; text-align: right;">ACTION</th>
            </tr>
          </thead>
          <tbody>
            ${inventory.length === 0 ? `
              <tr>
                <td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">
                  No inventory items recorded yet. Click "+ Add New Inventory Item" above to add raw materials.
                </td>
              </tr>
            ` : inventory.map(item => {
              const isLow = item.currentQty <= item.minQty;
              return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.85rem 1.25rem; font-weight: 600;">
                    ${item.name}
                    ${isLow ? '<span class="badge badge-danger" style="font-size: 0.65rem; margin-left: 6px;">LOW STOCK</span>' : ''}
                  </td>
                  <td style="padding: 0.85rem 1.25rem; font-family: var(--font-mono);">${item.sku}</td>
                  <td style="padding: 0.85rem 1.25rem; font-weight: 700; color: ${isLow ? 'var(--danger)' : 'var(--success)'}; font-size: 1rem;">
                    ${item.currentQty} ${item.unit}
                  </td>
                  <td style="padding: 0.85rem 1.25rem; color: var(--text-muted);">${item.minQty} ${item.unit}</td>
                  <td style="padding: 0.85rem 1.25rem; color: var(--primary); font-weight: 600;">${formatCurrency(item.purchasePrice)} / ${item.unit}</td>
                  <td style="padding: 0.85rem 1.25rem; color: var(--text-secondary);">${item.supplier}</td>
                  <td style="padding: 0.85rem 1.25rem; text-align: right;">
                    <button class="btn btn-outline btn-sm btn-adjust-stock" data-id="${item.id}" data-name="${item.name}">
                      ⚙️ Stock Movement
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Auditable Transaction Ledger Table -->
      <div class="card glass-panel" style="padding: 0; overflow: hidden;">
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color);">
          <h3 style="margin: 0;">Auditable Stock Movement History</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.75rem 1.25rem;">TIMESTAMP</th>
              <th style="padding: 0.75rem 1.25rem;">ITEM</th>
              <th style="padding: 0.75rem 1.25rem;">TYPE</th>
              <th style="padding: 0.75rem 1.25rem;">OPENING</th>
              <th style="padding: 0.75rem 1.25rem;">CHANGE</th>
              <th style="padding: 0.75rem 1.25rem;">CLOSING</th>
              <th style="padding: 0.75rem 1.25rem;">REFERENCE / USER</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.length === 0 ? `
              <tr>
                <td colspan="7" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No stock movements recorded yet.</td>
              </tr>
            ` : transactions.map(txn => {
              const item = inventory.find(i => i.id === txn.inventoryId);
              return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.75rem 1.25rem; color: var(--text-muted);">${formatDateTime(txn.createdAt)}</td>
                  <td style="padding: 0.75rem 1.25rem; font-weight: 600;">${item ? item.name : 'Item'}</td>
                  <td style="padding: 0.75rem 1.25rem;">
                    <span class="badge ${txn.type === 'stock_in' ? 'badge-success' : 'badge-danger'}">
                      ${txn.type.toUpperCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td style="padding: 0.75rem 1.25rem;">${txn.openingQty}</td>
                  <td style="padding: 0.75rem 1.25rem; font-weight: bold; color: ${txn.type === 'stock_in' ? 'var(--success)' : 'var(--danger)'};">
                    ${txn.type === 'stock_in' ? '+' : '-'}${txn.qty}
                  </td>
                  <td style="padding: 0.75rem 1.25rem; font-weight: bold;">${txn.closingQty}</td>
                  <td style="padding: 0.75rem 1.25rem; color: var(--text-secondary);">${txn.reference} (${txn.createdBy})</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Add Inventory Item Modal
    const addInvBtn = document.getElementById('btn-add-inv-item');
    if (addInvBtn) {
      addInvBtn.onclick = () => {
        const modalContent = `
          <div class="form-group">
            <label class="form-label">Item Name *</label>
            <input type="text" id="inv-name" class="form-input" placeholder="e.g. Amul Fresh Cream" required>
          </div>
          <div class="form-group">
            <label class="form-label">SKU / Item Code *</label>
            <input type="text" id="inv-sku" class="form-input" placeholder="e.g. RAW-CRM-01" required value="RAW-${Math.floor(Math.random()*900)+100}">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label">Measurement Unit *</label>
              <select id="inv-unit" class="form-select">
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="litre">litre</option>
                <option value="ml">ml</option>
                <option value="piece">piece</option>
                <option value="packet">packet</option>
                <option value="box">box</option>
                <option value="bottle">bottle</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Initial Quantity *</label>
              <input type="number" step="0.1" id="inv-qty" class="form-input" placeholder="10" required>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label">Minimum Stock Alert Level *</label>
              <input type="number" step="0.1" id="inv-min" class="form-input" placeholder="5" required>
            </div>
            <div class="form-group">
              <label class="form-label">Purchase Price per Unit (₹) *</label>
              <input type="number" id="inv-price" class="form-input" placeholder="180" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Supplier / Vendor</label>
            <input type="text" id="inv-supplier" class="form-input" placeholder="e.g. Metro Wholesale Dist">
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-add-inv">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-add-inv">Save Inventory Item</button>
        `;

        const modal = createModal({
          title: 'Add New Inventory Raw Material Item',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-add-inv').onclick = modal.close;
        document.getElementById('btn-save-add-inv').onclick = async () => {
          const name = document.getElementById('inv-name').value;
          const sku = document.getElementById('inv-sku').value;
          const unit = document.getElementById('inv-unit').value;
          const currentQty = parseFloat(document.getElementById('inv-qty').value || 0);
          const minQty = parseFloat(document.getElementById('inv-min').value || 0);
          const purchasePrice = parseFloat(document.getElementById('inv-price').value || 0);
          const supplier = document.getElementById('inv-supplier').value || 'General Vendor';

          if (name && sku) {
            const newItem = {
              id: `INV-${Date.now().toString(36)}`,
              name,
              sku,
              unit,
              currentQty,
              minQty,
              purchasePrice,
              supplier,
              lastUpdated: new Date().toISOString()
            };
            await api.saveInventoryItem(newItem);
            modal.close();
            showToast(`Added ${name} (${currentQty} ${unit}) to inventory ledger`, 'success');
            window.location.reload();
          }
        };
      };
    }

    // Stock Movement Modal
    document.querySelectorAll('.btn-adjust-stock').forEach(btn => {
      btn.onclick = () => {
        const invId = btn.dataset.id;
        const invName = btn.dataset.name;

        const modalContent = `
          <div>
            <h4 style="margin-bottom: 1rem; color: var(--primary);">${invName} - Stock Movement</h4>
            
            <div class="form-group">
              <label class="form-label">Movement Type *</label>
              <select id="txn-type" class="form-select">
                <option value="stock_in">Purchase / Stock In (+)</option>
                <option value="usage">Kitchen Usage (-)</option>
                <option value="wastage">Spill / Wastage (-)</option>
                <option value="damaged">Damaged Stock (-)</option>
                <option value="adjustment">Stock Audit Count</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Quantity *</label>
              <input type="number" step="0.1" id="txn-qty" class="form-input" placeholder="e.g. 5.5" required>
            </div>

            <div class="form-group">
              <label class="form-label">Reference / PO Number / Notes</label>
              <input type="text" id="txn-ref" class="form-input" placeholder="e.g. Supplier Invoice #982">
            </div>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel-txn">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-txn">Record Stock Movement</button>
        `;

        const modal = createModal({
          title: 'Stock Adjustment Entry',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel-txn').onclick = modal.close;
        document.getElementById('btn-save-txn').onclick = async () => {
          const type = document.getElementById('txn-type').value;
          const qty = parseFloat(document.getElementById('txn-qty').value);
          const reference = document.getElementById('txn-ref').value || 'Manual Adjustment';

          if (qty > 0) {
            await api.addInventoryTransaction({
              inventoryId: invId,
              type,
              qty,
              reference,
              createdBy: 'Super Admin'
            });
            modal.close();
            showToast(`Recorded ${type.toUpperCase()} for ${invName}`, 'success');
            window.location.reload();
          }
        };
      };
    });
  }, 50);

  return viewHTML;
};
