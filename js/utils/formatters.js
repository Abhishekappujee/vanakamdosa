/* ==========================================================================
   FORMATTER & CALCULATOR UTILITIES
   ========================================================================== */

export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

export const calculateTaxes = (subtotal = 0, taxRate = 12) => {
  const totalTax = (subtotal * taxRate) / 100;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const grandTotal = subtotal + totalTax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
};

export const generateId = (prefix = 'ID') => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};
