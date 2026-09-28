/* ==========================================================================
   FIREBASE REALTIME SERVICE (NON-BLOCKING FAST ASYNC WRITER)
   ========================================================================== */

import { firebaseConfig } from '../config/firebase.js';

// Ultra-fast HTTP REST API Writer with 800ms timeout threshold
const writeRTDBRest = async (path, data) => {
  const url = `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/${path}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 800);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      console.log(`🔥 RTDB Quick Write Success [${path}]`);
    }
  } catch (err) {
    // Non-blocking catch
  }
};

// Fast HTTP REST API Reader with timeout threshold
const readRTDBRest = async (path) => {
  const url = `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/${path}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (!data) return [];
      return Array.isArray(data) ? data : Object.values(data);
    }
  } catch (err) {
    // Non-blocking catch
  }
  return null;
};

export const FirebaseService = {
  getOrders: async () => readRTDBRest('orders'),
  getSessions: async () => readRTDBRest('sessions'),
  getTables: async () => readRTDBRest('tables'),
  getBills: async () => readRTDBRest('bills'),
  getKots: async () => readRTDBRest('kots'),
  getMenuItems: async () => readRTDBRest('menu_items'),

  saveTable: async (tableData) => writeRTDBRest(`tables/${tableData.id}`, tableData),
  deleteTable: async (tableId) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 800);
    fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/tables/${tableId}.json`, {
      method: 'DELETE',
      signal: controller.signal
    }).catch(() => {});
  },
  createOrder: async (orderData) => {
    writeRTDBRest(`orders/${orderData.id}`, orderData);
    writeRTDBRest(`tables/${orderData.tableId}/status`, 'order_pending');
  },
  updateOrderStatus: async (orderId, newStatus, rejectionReason = '') => {
    await writeRTDBRest(`orders/${orderId}/status`, newStatus);
    if (rejectionReason) {
      await writeRTDBRest(`orders/${orderId}/rejectionReason`, rejectionReason);
    }
    if (newStatus === 'APPROVED') {
      const localKots = JSON.parse(localStorage.getItem('qr_mock_kots') || '[]');
      const kot = localKots.find(k => k.orderId === orderId);
      if (kot) {
        await writeRTDBRest(`kots/${kot.id}`, kot);
      }
    }
  },
  createSession: async (sessionData) => {
    writeRTDBRest(`sessions/${sessionData.id}`, sessionData);
    writeRTDBRest(`tables/${sessionData.tableId}/status`, 'occupied');
  },
  updateSessionStatus: async (sessionId, status) => writeRTDBRest(`sessions/${sessionId}/status`, status),
  recordPayment: async (sessionId, paymentMethod, amountPaid) => {
    const localSessions = JSON.parse(localStorage.getItem('qr_mock_sessions') || '[]');
    const session = localSessions.find(s => s.id === sessionId);

    const billId = `INV-2026-${Date.now().toString(36).substring(0, 4).toUpperCase()}`;
    const bill = {
      id: billId,
      sessionId,
      tableId: session ? session.tableId : 'TBL-004',
      tableNumber: session ? session.tableNumber : 'Table 04',
      customerName: session ? session.customerName : 'Guest Customer',
      customerPhone: session ? session.customerPhone : '',
      amount: amountPaid,
      method: paymentMethod,
      status: 'PAID',
      paidAt: new Date().toISOString()
    };
    await writeRTDBRest(`bills/${billId}`, bill);
    await writeRTDBRest(`sessions/${sessionId}/status`, 'closed');
    if (session && session.tableId) {
      await writeRTDBRest(`tables/${session.tableId}/status`, 'available');
    }
  },
  saveInventoryItem: async (itemData) => writeRTDBRest(`inventory/${itemData.id}`, itemData),
  addExpense: async (expenseData) => writeRTDBRest(`expenses/${expenseData.id}`, expenseData),
  addCapitalTransaction: async (capitalData) => writeRTDBRest(`capital/${capitalData.id}`, capitalData),
  saveMenuItem: async (itemData) => writeRTDBRest(`menu_items/${itemData.id}`, itemData),
  saveManager: async (managerData) => writeRTDBRest(`managers/${managerData.id}`, managerData)
};
