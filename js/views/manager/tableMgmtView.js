/* ==========================================================================
   TABLE MANAGEMENT & QR CODE GENERATOR VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { renderQRCode, getQRCodeDataURL } from '../../utils/qrGenerator.js';
import { createModal } from '../../components/modal.js';
import { showToast } from '../../utils/toast.js';

export const renderTableMgmtView = async () => {
  const tables = await api.getTables();

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">Table Management & QR Cards</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Manage restaurant tables and generate touchless QR ordering cards</p>
        </div>
        <button id="btn-add-table" class="btn btn-primary btn-sm">
          + Add New Table
        </button>
      </div>

      <!-- Tables Grid -->
      <div class="grid grid-cols-3 gap-4" id="tables-container">
        ${tables.map(t => {
          let badgeClass = 'badge-success';
          if (t.status === 'occupied') badgeClass = 'badge-info';
          if (t.status === 'order_pending') badgeClass = 'badge-warning';
          if (t.status === 'bill_requested') badgeClass = 'badge-danger';

          return `
            <div class="card glass-panel flex flex-col justify-between" style="padding: 1.25rem;">
              <div>
                <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
                  <h3 style="margin: 0; color: var(--text-primary);">${t.number}</h3>
                  <span class="badge ${badgeClass}">${t.status.toUpperCase()}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; font-family: var(--font-mono);">
                  Token: ${t.token}
                </div>
              </div>

              <div class="flex items-center gap-2 justify-end" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
                <button class="btn btn-secondary btn-sm btn-view-qr" data-token="${t.token}" data-number="${t.number}">
                  📱 View QR
                </button>
                <button class="btn btn-outline btn-sm btn-regen-token" data-id="${t.id}">
                  🔄 Token
                </button>
                <button class="btn btn-danger btn-sm btn-delete-table" data-id="${t.id}">
                  🗑️
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach Event Handlers
  setTimeout(() => {
    // Add Table Button
    const addBtn = document.getElementById('btn-add-table');
    if (addBtn) {
      addBtn.onclick = () => {
        const modalContent = `
          <div class="form-group">
            <label class="form-label" for="table-num">Table Number / Label *</label>
            <input type="text" id="table-num" class="form-input" placeholder="e.g. Table 09" value="Table 09" required>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-save-table">Create Table & Generate QR</button>
        `;

        const modal = createModal({
          title: 'Add New Table',
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        document.getElementById('btn-cancel').onclick = modal.close;
        document.getElementById('btn-save-table').onclick = async () => {
          const num = document.getElementById('table-num').value;
          if (num) {
            const newTable = {
              id: `TBL-${Date.now().toString(36)}`,
              number: num,
              token: `TOK_${Math.floor(Math.random() * 900) + 100}`,
              restaurantId: 'REST-001',
              status: 'available'
            };
            await api.saveTable(newTable);
            modal.close();
            showToast(`Created ${num} with QR token ${newTable.token}`, 'success');
            window.location.reload();
          }
        };
      };
    }

    // View QR Code Modal
    document.querySelectorAll('.btn-view-qr').forEach(btn => {
      btn.onclick = () => {
        const token = btn.dataset.token;
        const number = btn.dataset.number;
        const targetURL = `${window.location.origin}${window.location.pathname}?table=${encodeURIComponent(number)}&token=${token}#customer/landing`;

        const modalContent = `
          <div class="text-center print-area">
            <h3 style="margin-bottom: 0.25rem;">Gourmet Bistro & Cafe</h3>
            <div class="badge badge-warning" style="font-size: 1rem; padding: 0.4rem 1rem; margin-bottom: 1rem;">
              ${number}
            </div>

            <div id="qr-canvas-holder" style="display: flex; justify-content: center; margin: 1rem 0;"></div>

            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              SCAN TO VIEW MENU & PLACE ORDERS
            </p>
            <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-muted); word-break: break-all; max-width: 320px; margin: 0 auto;">
              ${targetURL}
            </div>
          </div>
        `;

        const modalFooter = `
          <button class="btn btn-secondary btn-sm" id="btn-download-qr">📥 Download PNG</button>
          <button class="btn btn-primary btn-sm" id="btn-print-qr">🖨️ Print QR Card</button>
        `;

        const modal = createModal({
          title: `QR Code Card - ${number}`,
          contentHTML: modalContent,
          footerHTML: modalFooter
        });

        setTimeout(() => {
          const holder = document.getElementById('qr-canvas-holder');
          if (holder) {
            renderQRCode(holder, targetURL, 220);
          }

          document.getElementById('btn-download-qr').onclick = () => {
            const dataUrl = getQRCodeDataURL(targetURL, 300);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${number.replace(/\s+/g, '_')}_QR.png`;
            a.click();
          };

          document.getElementById('btn-print-qr').onclick = () => {
            window.print();
          };
        }, 50);
      };
    });

    // Regenerate Token
    document.querySelectorAll('.btn-regen-token').forEach(btn => {
      btn.onclick = async () => {
        const tableId = btn.dataset.id;
        const tablesList = await api.getTables();
        const t = tablesList.find(x => x.id === tableId);
        if (t) {
          t.token = `TOK_${Math.floor(Math.random() * 900) + 100}`;
          await api.saveTable(t);
          showToast(`Regenerated QR token for ${t.number} to ${t.token}`, 'success');
          window.location.reload();
        }
      };
    });

    // Delete Table
    document.querySelectorAll('.btn-delete-table').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('Are you sure you want to delete this table?')) {
          await api.deleteTable(btn.dataset.id);
          showToast('Table deleted', 'info');
          window.location.reload();
        }
      };
    });
  }, 50);

  return viewHTML;
};
