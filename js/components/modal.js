/* ==========================================================================
   MODAL COMPONENT
   ========================================================================== */

export const createModal = ({ id = 'app-modal', title = '', contentHTML = '', footerHTML = '', width = '550px' }) => {
  // Remove pre-existing modal instance if present
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const modalOverlay = document.createElement('div');
  modalOverlay.id = id;
  modalOverlay.className = 'modal-overlay active';

  modalOverlay.innerHTML = `
    <div class="modal-container" style="max-width: ${width};">
      <div class="modal-header">
        <h3 style="margin: 0;">${title}</h3>
        <button class="modal-close-btn btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 1.1rem;">✕</button>
      </div>
      <div class="modal-body">
        ${contentHTML}
      </div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    setTimeout(() => modalOverlay.remove(), 200);
  };

  const closeBtn = modalOverlay.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.onclick = closeModal;

  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) closeModal();
  };

  return {
    element: modalOverlay,
    close: closeModal
  };
};
