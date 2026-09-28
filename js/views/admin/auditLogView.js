/* ==========================================================================
   SUPER ADMIN AUDIT TRAIL LOG VIEW
   ========================================================================== */

import { api } from '../../services/api.js';
import { formatDateTime } from '../../utils/formatters.js';

export const renderAdminAuditLogView = async () => {
  const auditLogs = await api.getAuditLogs();

  const viewHTML = `
    <div class="content-area">
      <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="margin: 0;">System Audit Logs & Activity Trail</h2>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">Compliance tracking, security events, and system mutation records</p>
        </div>
      </div>

      <div class="card glass-panel" style="padding: 0; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="background: var(--bg-darker); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 0.85rem 1.25rem;">TIMESTAMP</th>
              <th style="padding: 0.85rem 1.25rem;">USER</th>
              <th style="padding: 0.85rem 1.25rem;">ROLE</th>
              <th style="padding: 0.85rem 1.25rem;">ACTION</th>
              <th style="padding: 0.85rem 1.25rem;">ENTITY</th>
              <th style="padding: 0.85rem 1.25rem;">DETAILS</th>
            </tr>
          </thead>
          <tbody>
            ${auditLogs.map(log => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.85rem 1.25rem; color: var(--text-muted); font-family: var(--font-mono);">${formatDateTime(log.timestamp)}</td>
                <td style="padding: 0.85rem 1.25rem; font-weight: 600;">${log.userName}</td>
                <td style="padding: 0.85rem 1.25rem;"><span class="badge badge-neutral">${log.userRole.toUpperCase()}</span></td>
                <td style="padding: 0.85rem 1.25rem;"><span class="badge badge-warning">${log.action}</span></td>
                <td style="padding: 0.85rem 1.25rem; font-family: var(--font-mono); color: var(--primary);">${log.entity} (${log.entityId})</td>
                <td style="padding: 0.85rem 1.25rem; color: var(--text-secondary);">${log.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return viewHTML;
};
