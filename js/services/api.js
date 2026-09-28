/* ==========================================================================
   ULTRA-FAST INSTANT API SERVICE LAYER (0ms WAIT TIME, LOCAL FIRST)
   ========================================================================== */

import { isFirebaseConfigured } from '../config/firebase.js';
import { MockService } from './mockService.js';
import { FirebaseService } from './firebaseService.js';

export const api = {
  // Sync & Read Layer
  getTables: async () => {
    if (isFirebaseConfigured()) {
      try {
        const remote = await FirebaseService.getTables();
        if (remote) MockService.syncTables?.(remote);
      } catch (e) {}
    }
    return MockService.getTables();
  },
  getTableByToken: async (token) => MockService.getTableByToken(token),
  getCategories: async () => MockService.getCategories(),
  getMenuItems: async () => MockService.getMenuItems(),
  getSessions: async () => {
    if (isFirebaseConfigured()) {
      try {
        const remote = await FirebaseService.getSessions();
        if (remote) MockService.syncSessions(remote);
      } catch (e) {}
    }
    return MockService.getSessions();
  },
  getActiveSessionByTable: async (tableId) => {
    if (isFirebaseConfigured()) {
      try {
        const remote = await FirebaseService.getSessions();
        if (remote) MockService.syncSessions(remote);
      } catch (e) {}
    }
    return MockService.getActiveSessionByTable(tableId);
  },
  getOrders: async () => {
    if (isFirebaseConfigured()) {
      try {
        const remote = await FirebaseService.getOrders();
        if (remote) MockService.syncOrders(remote);
      } catch (e) {}
    }
    return MockService.getOrders();
  },
  getOrdersBySession: async (sessionId) => {
    if (isFirebaseConfigured()) {
      try {
        const remote = await FirebaseService.getOrders();
        if (remote) MockService.syncOrders(remote);
      } catch (e) {}
    }
    return MockService.getOrdersBySession(sessionId);
  },
  getKots: async () => MockService.getKots(),
  getBillBySession: async (sessionId) => {
    if (isFirebaseConfigured()) {
      try {
        const remoteOrders = await FirebaseService.getOrders();
        if (remoteOrders) MockService.syncOrders(remoteOrders);
        const remoteSessions = await FirebaseService.getSessions();
        if (remoteSessions) MockService.syncSessions(remoteSessions);
      } catch (e) {}
    }
    return MockService.getBillBySession(sessionId);
  },
  getBills: async () => {
    if (isFirebaseConfigured()) {
      try {
        const remote = await FirebaseService.getBills();
        if (remote) MockService.syncBills(remote);
      } catch (e) {}
    }
    return MockService.getBills();
  },
  getManagers: async () => MockService.getManagers(),
  getInventory: async () => MockService.getInventory(),
  getInventoryTransactions: async () => MockService.getInventoryTransactions(),
  getExpenses: async () => MockService.getExpenses(),
  getCapital: async () => MockService.getCapital(),
  getAuditLogs: async () => MockService.getAuditLogs(),

  // Non-blocking fire-and-forget writes
  saveTable: async (tableData) => {
    const res = MockService.saveTable(tableData);
    if (isFirebaseConfigured()) {
      FirebaseService.saveTable(tableData).catch(() => {});
    }
    return res;
  },
  deleteTable: async (tableId) => {
    MockService.deleteTable(tableId);
    if (isFirebaseConfigured()) {
      FirebaseService.deleteTable(tableId).catch(() => {});
    }
  },

  saveMenuItem: async (itemData) => {
    const res = MockService.saveMenuItem(itemData);
    if (isFirebaseConfigured()) {
      FirebaseService.saveMenuItem(itemData).catch(() => {});
    }
    return res;
  },

  createSession: async (sessionData) => {
    const res = MockService.createSession(sessionData);
    if (isFirebaseConfigured()) {
      FirebaseService.createSession(sessionData).catch(() => {});
    }
    return res;
  },

  updateSessionStatus: async (sessionId, status) => {
    MockService.updateSessionStatus(sessionId, status);
    if (isFirebaseConfigured()) {
      FirebaseService.updateSessionStatus(sessionId, status).catch(() => {});
    }
  },

  createOrder: async (orderData) => {
    const res = MockService.createOrder(orderData);
    if (isFirebaseConfigured()) {
      FirebaseService.createOrder(orderData).catch(() => {});
    }
    return res;
  },

  updateOrderStatus: async (orderId, newStatus, rejectionReason = '') => {
    const res = MockService.updateOrderStatus(orderId, newStatus, rejectionReason);
    if (isFirebaseConfigured()) {
      try {
        await FirebaseService.updateOrderStatus(orderId, newStatus, rejectionReason);
      } catch (e) {
        console.error('Firebase updateOrderStatus error:', e);
      }
    }
    return res;
  },

  recordPayment: async (sessionId, paymentMethod, amountPaid) => {
    const res = MockService.recordPayment(sessionId, paymentMethod, amountPaid);
    if (isFirebaseConfigured()) {
      try {
        await FirebaseService.recordPayment(sessionId, paymentMethod, amountPaid);
      } catch (e) {
        console.error('Firebase recordPayment error:', e);
      }
    }
    return res;
  },

  saveManager: async (managerData) => {
    const res = MockService.saveManager(managerData);
    if (isFirebaseConfigured()) {
      FirebaseService.saveManager(managerData).catch(() => {});
    }
    return res;
  },

  saveInventoryItem: async (itemData) => {
    const res = MockService.saveInventoryItem(itemData);
    if (isFirebaseConfigured()) {
      FirebaseService.saveInventoryItem(itemData).catch(() => {});
    }
    return res;
  },

  addInventoryTransaction: async (transaction) => {
    return MockService.addInventoryTransaction(transaction);
  },

  addExpense: async (expenseData) => {
    const res = MockService.addExpense(expenseData);
    if (isFirebaseConfigured()) {
      FirebaseService.addExpense(expenseData).catch(() => {});
    }
    return res;
  },

  addCapitalTransaction: async (capitalData) => {
    const res = MockService.addCapitalTransaction(capitalData);
    if (isFirebaseConfigured()) {
      FirebaseService.addCapitalTransaction(capitalData).catch(() => {});
    }
    return res;
  }
};
