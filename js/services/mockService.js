/* ==========================================================================
   DEVELOPMENT / DEMO MOCK DATA SERVICE LAYER
   ========================================================================== */

const STORAGE_KEYS = {
  MANAGERS: 'qr_mock_managers',
  TABLES: 'qr_mock_tables',
  CATEGORIES: 'qr_mock_categories',
  MENU_ITEMS: 'qr_mock_menu_items',
  ORDERS: 'qr_mock_orders',
  SESSIONS: 'qr_mock_sessions',
  KOTS: 'qr_mock_kots',
  BILLS: 'qr_mock_bills',
  INVENTORY: 'qr_mock_inventory',
  INV_TRANSACTIONS: 'qr_mock_inv_transactions',
  EXPENSES: 'qr_mock_expenses',
  CAPITAL: 'qr_mock_capital',
  AUDIT_LOGS: 'qr_mock_audit_logs'
};

const SEED_DATA = {
  MANAGERS: [
    {
      id: 'MGR-001',
      name: 'Abhijeet Singh',
      email: 'manager@restaurant.com',
      phone: '+91 98765 11111',
      username: 'manager',
      role: 'manager',
      restaurantId: 'REST-001',
      status: 'active',
      createdAt: '2026-01-15T10:00:00Z',
      lastLogin: new Date().toISOString()
    }
  ],

  TABLES: [
    { id: 'TBL-001', number: 'Table 01', token: 'TOK_101', restaurantId: 'REST-001', status: 'available' },
    { id: 'TBL-002', number: 'Table 02', token: 'TOK_102', restaurantId: 'REST-001', status: 'available' },
    { id: 'TBL-003', number: 'Table 03', token: 'TOK_103', restaurantId: 'REST-001', status: 'available' },
    { id: 'TBL-004', number: 'Table 04', token: 'TOK_104', restaurantId: 'REST-001', status: 'available' }
  ],

  CATEGORIES: [
    { id: 'CAT-01', name: 'Starters', sortOrder: 1, status: 'active' },
    { id: 'CAT-02', name: 'Main Course', sortOrder: 2, status: 'active' },
    { id: 'CAT-03', name: 'Chinese & Asian', sortOrder: 3, status: 'active' },
    { id: 'CAT-04', name: 'Breads & Rice', sortOrder: 4, status: 'active' },
    { id: 'CAT-05', name: 'Beverages', sortOrder: 5, status: 'active' },
    { id: 'CAT-06', name: 'Desserts', sortOrder: 6, status: 'active' }
  ],

  MENU_ITEMS: [
    {
      id: 'ITEM-001',
      categoryId: 'CAT-02',
      name: 'Butter Chicken',
      description: 'Tender chicken cooked in rich creamy tomato and butter sauce.',
      price: 340,
      vegType: 'non-veg',
      isAvailable: true,
      isBestseller: true,
      tags: ['Bestseller', 'Chef Special'],
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
      modifiers: [
        { id: 'MOD-1', name: 'Extra Butter', price: 30 }
      ]
    },
    {
      id: 'ITEM-002',
      categoryId: 'CAT-02',
      name: 'Paneer Butter Masala',
      description: 'Cottage cheese cubes tossed in spicy tomato-butter gravy.',
      price: 290,
      vegType: 'veg',
      isAvailable: true,
      isBestseller: true,
      tags: ['Bestseller'],
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
      modifiers: []
    },
    {
      id: 'ITEM-004',
      categoryId: 'CAT-04',
      name: 'Garlic Butter Naan',
      description: 'Leavened flatbread brushed with garlic butter.',
      price: 60,
      vegType: 'veg',
      isAvailable: true,
      isBestseller: true,
      tags: ['Bestseller'],
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80',
      modifiers: []
    },
    {
      id: 'ITEM-006',
      categoryId: 'CAT-05',
      name: 'Fresh Cold Coffee',
      description: 'Chilled espresso blended with thick milk & vanilla scoop.',
      price: 150,
      vegType: 'veg',
      isAvailable: true,
      isBestseller: true,
      tags: ['Bestseller'],
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
      modifiers: []
    }
  ],

  INVENTORY: [
    { id: 'INV-01', name: 'Chicken Breast', sku: 'RAW-CHK-01', unit: 'kg', currentQty: 24.5, minQty: 10, purchasePrice: 220, supplier: 'Metro Poultry Ltd', lastUpdated: new Date().toISOString() },
    { id: 'INV-02', name: 'Paneer (Cottage Cheese)', sku: 'RAW-PNR-02', unit: 'kg', currentQty: 12.0, minQty: 5, purchasePrice: 320, supplier: 'Amul Dairy Dist', lastUpdated: new Date().toISOString() }
  ],

  INV_TRANSACTIONS: [],
  EXPENSES: [],
  CAPITAL: [
    { id: 'CAP-001', type: 'initial', amount: 500000, date: '2026-01-01', description: 'Initial Setup', createdBy: 'Super Admin' }
  ],
  ORDERS: [],
  SESSIONS: [],
  KOTS: [],
  BILLS: [],
  AUDIT_LOGS: []
};

const initStorage = () => {
  Object.keys(STORAGE_KEYS).forEach(key => {
    if (!localStorage.getItem(STORAGE_KEYS[key])) {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(SEED_DATA[key] || []));
    }
  });

  // Guarantee default table status to 'available' if no open active session exists
  try {
    const tables = JSON.parse(localStorage.getItem(STORAGE_KEYS.TABLES) || '[]');
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
    const activeTableIds = new Set(sessions.filter(s => s && s.status !== 'closed').map(s => s.tableId));

    let updated = false;
    tables.forEach(t => {
      if (t && (!activeTableIds.has(t.id) || t.status !== 'available' && !activeTableIds.has(t.id))) {
        if (t.status !== 'available') {
          t.status = 'available';
          updated = true;
        }
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    }
  } catch (err) {
    console.error('Error during initStorage table sanitization:', err);
  }
};

initStorage();

const getItem = (key) => JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]');
const setItem = (key, data) => localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));

export const logAuditAction = (userName, userRole, action, entity, entityId, details) => {
  const logs = getItem('AUDIT_LOGS');
  logs.unshift({
    id: `AUD-${Date.now().toString(36)}`,
    userName,
    userRole,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString(),
    details
  });
  setItem('AUDIT_LOGS', logs);
};

export const MockService = {
  syncOrders: (remoteOrders) => {
    if (!Array.isArray(remoteOrders) || remoteOrders.length === 0) return;
    const localOrders = getItem('ORDERS');
    const statusRank = {
      'PENDING_APPROVAL': 1,
      'APPROVED': 2,
      'PREPARING': 3,
      'READY': 4,
      'SERVED': 5,
      'COMPLETED': 6,
      'REJECTED': 6,
      'CANCELLED': 6
    };

    const map = {};
    localOrders.forEach(o => { if (o && o.id) map[o.id] = o; });

    remoteOrders.forEach(remote => {
      if (!remote || !remote.id) return;
      const local = map[remote.id];
      if (local) {
        const localRank = statusRank[local.status] || 0;
        const remoteRank = statusRank[remote.status] || 0;
        if (localRank > remoteRank) {
          map[remote.id] = { ...remote, ...local };
        } else {
          map[remote.id] = { ...local, ...remote };
        }
      } else {
        map[remote.id] = remote;
      }
    });

    const merged = Object.values(map).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setItem('ORDERS', merged);
  },

  syncSessions: (remoteSessions) => {
    if (!Array.isArray(remoteSessions) || remoteSessions.length === 0) return;
    const localSessions = getItem('SESSIONS');
    const localBills = getItem('BILLS');
    const paidSessionIds = new Set(localBills.filter(b => b && b.status === 'PAID').map(b => b.sessionId));

    const map = {};
    localSessions.forEach(s => {
      if (s && s.id) map[s.id] = s;
    });

    remoteSessions.forEach(remote => {
      if (!remote || !remote.id) return;
      const local = map[remote.id];
      if (local) {
        if (local.status === 'closed' || paidSessionIds.has(local.id)) {
          map[remote.id] = { ...remote, ...local, status: 'closed' };
        } else {
          map[remote.id] = { ...local, ...remote };
        }
      } else {
        if (paidSessionIds.has(remote.id)) {
          map[remote.id] = { ...remote, status: 'closed' };
        } else {
          map[remote.id] = remote;
        }
      }
    });
    setItem('SESSIONS', Object.values(map));
  },

  syncBills: (remoteBills) => {
    if (!Array.isArray(remoteBills) || remoteBills.length === 0) return;
    const localBills = getItem('BILLS');
    const map = {};
    localBills.forEach(b => { if (b && b.id) map[b.id] = b; });
    remoteBills.forEach(b => {
      if (b && b.id) {
        map[b.id] = { ...map[b.id], ...b };
      }
    });
    setItem('BILLS', Object.values(map));
  },

  getTables: () => {
    const tables = getItem('TABLES');
    const sessions = getItem('SESSIONS');
    const orders = getItem('ORDERS');

    const activeSessionsMap = {};
    sessions.filter(s => s && s.status !== 'closed').forEach(s => {
      activeSessionsMap[s.tableId] = s;
    });

    return tables.map(t => {
      const activeSession = activeSessionsMap[t.id];
      if (!activeSession) {
        return { ...t, status: 'available' };
      }
      if (activeSession.status === 'bill_requested') {
        return { ...t, status: 'bill_requested' };
      }
      const sessionOrders = orders.filter(o => o.sessionId === activeSession.id && o.status !== 'REJECTED' && o.status !== 'CANCELLED');
      if (sessionOrders.some(o => o.status === 'PENDING_APPROVAL')) {
        return { ...t, status: 'order_pending' };
      }
      return { ...t, status: t.status || 'occupied' };
    });
  },
  getTableByToken: (token) => getItem('TABLES').find(t => t.token === token),
  saveTable: (tableData) => {
    const tables = getItem('TABLES');
    const existingIndex = tables.findIndex(t => t.id === tableData.id);
    if (existingIndex > -1) {
      tables[existingIndex] = { ...tables[existingIndex], ...tableData };
    } else {
      tables.push(tableData);
    }
    setItem('TABLES', tables);
    return tableData;
  },
  deleteTable: (tableId) => {
    const tables = getItem('TABLES').filter(t => t.id !== tableId);
    setItem('TABLES', tables);
  },

  getCategories: () => getItem('CATEGORIES'),
  getMenuItems: () => getItem('MENU_ITEMS'),
  saveMenuItem: (itemData) => {
    const items = getItem('MENU_ITEMS');
    const index = items.findIndex(i => i.id === itemData.id);
    if (index > -1) {
      items[index] = { ...items[index], ...itemData };
    } else {
      items.push(itemData);
    }
    setItem('MENU_ITEMS', items);
    return itemData;
  },

  getSessions: () => getItem('SESSIONS'),
  getActiveSessionByTable: (tableId) => getItem('SESSIONS').find(s => s.tableId === tableId && s.status !== 'closed'),
  createSession: (sessionData) => {
    const sessions = getItem('SESSIONS');
    sessions.push(sessionData);
    setItem('SESSIONS', sessions);

    const tables = getItem('TABLES');
    const table = tables.find(t => t.id === sessionData.tableId);
    if (table) {
      table.status = 'occupied';
      setItem('TABLES', tables);
    }
    return sessionData;
  },
  updateSessionStatus: (sessionId, status) => {
    const sessions = getItem('SESSIONS');
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = status;
      if (status === 'closed') session.closedAt = new Date().toISOString();
      setItem('SESSIONS', sessions);
    }
  },

  getOrders: () => getItem('ORDERS'),
  getOrdersBySession: (sessionId) => getItem('ORDERS').filter(o => o.sessionId === sessionId),
  createOrder: (orderData) => {
    const orders = getItem('ORDERS');
    orders.unshift(orderData);
    setItem('ORDERS', orders);

    const tables = getItem('TABLES');
    const table = tables.find(t => t.id === orderData.tableId);
    if (table) {
      table.status = 'order_pending';
      setItem('TABLES', tables);
    }
    return orderData;
  },
  updateOrderStatus: (orderId, newStatus, rejectionReason = '') => {
    const orders = getItem('ORDERS');
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    if (rejectionReason) order.rejectionReason = rejectionReason;
    setItem('ORDERS', orders);

    if (newStatus === 'APPROVED') {
      const kots = getItem('KOTS');
      const kotNumber = `KOT-${(kots.length + 1).toString().padStart(4, '0')}`;
      const newKot = {
        id: `KOT-${Date.now().toString(36)}`,
        kotNumber,
        orderId: order.id,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        items: order.items,
        status: 'NEW',
        printedAt: new Date().toISOString()
      };
      kots.unshift(newKot);
      setItem('KOTS', kots);
    }

    return order;
  },

  getKots: () => getItem('KOTS'),
  getBills: () => getItem('BILLS'),

  getBillBySession: (sessionId) => {
    const session = getItem('SESSIONS').find(s => s.id === sessionId);
    const bills = getItem('BILLS');
    const paidBill = bills.find(b => (b.sessionId === sessionId || (session && b.tableId === session.tableId)) && b.status === 'PAID');

    const orders = getItem('ORDERS').filter(o => {
      if (o.status === 'REJECTED' || o.status === 'CANCELLED') return false;
      if (o.sessionId === sessionId) return true;
      if (session && o.tableId === session.tableId) {
        if (session.status !== 'closed') return true;
        if (session.startedAt && o.createdAt >= session.startedAt) return true;
      }
      return false;
    });

    const approvedOrders = orders.filter(o => o.status !== 'PENDING_APPROVAL');
    const pendingOrders = orders.filter(o => o.status === 'PENDING_APPROVAL');

    const calculateSubtotal = (orderList) => {
      let totalSub = 0;
      orderList.forEach(o => {
        let sub = o.subtotal;
        if (typeof sub !== 'number' || isNaN(sub) || sub === 0) {
          if (Array.isArray(o.items) && o.items.length > 0) {
            sub = o.items.reduce((sum, item) => sum + (item.total || ((item.unitPrice || 0) * (item.quantity || 1))), 0);
          } else if (o.total) {
            sub = Math.round(o.total / 1.12);
          }
        }
        totalSub += (sub || 0);
      });
      return totalSub;
    };

    const allOrdersSubtotal = calculateSubtotal(orders);
    const approvedSubtotal = calculateSubtotal(approvedOrders);
    const pendingSubtotal = calculateSubtotal(pendingOrders);

    const taxRate = 12;
    const allOrdersTax = (allOrdersSubtotal * taxRate) / 100;
    const allOrdersTotal = allOrdersSubtotal + allOrdersTax;

    const approvedTax = (approvedSubtotal * taxRate) / 100;
    const approvedTotal = approvedSubtotal + approvedTax;

    return {
      session,
      sessionId,
      paidBill,
      isPaid: Boolean(paidBill),
      orders,
      approvedOrders,
      pendingOrders,
      allOrdersSubtotal,
      allOrdersTax,
      allOrdersTotal,
      approvedSubtotal,
      approvedTax,
      approvedTotal,
      pendingSubtotal
    };
  },

  recordPayment: (sessionId, paymentMethod, amountPaid) => {
    const session = getItem('SESSIONS').find(s => s.id === sessionId);

    const bills = getItem('BILLS');
    const bill = {
      id: `INV-2026-${(bills.length + 1).toString().padStart(4, '0')}`,
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
    bills.unshift(bill);
    setItem('BILLS', bills);

    // Update Session status to closed
    MockService.updateSessionStatus(sessionId, 'closed');

    // Update Table status to available
    if (session) {
      const tables = getItem('TABLES');
      const table = tables.find(t => t.id === session.tableId);
      if (table) {
        table.status = 'available';
        setItem('TABLES', tables);
      }
    }

    // Also update all active orders of this session/table to COMPLETED
    const orders = getItem('ORDERS');
    orders.forEach(o => {
      if ((o.sessionId === sessionId || (session && o.tableId === session.tableId)) && o.status !== 'REJECTED' && o.status !== 'CANCELLED') {
        o.status = 'COMPLETED';
      }
    });
    setItem('ORDERS', orders);

    logAuditAction('Manager', 'manager', 'RECORD_PAYMENT', 'Bill', bill.id, `Payment ₹${amountPaid} recorded via ${paymentMethod}`);
    return bill;
  },

  getManagers: () => getItem('MANAGERS'),
  saveManager: (managerData) => {
    const managers = getItem('MANAGERS');
    const index = managers.findIndex(m => m.id === managerData.id);
    if (index > -1) {
      managers[index] = { ...managers[index], ...managerData };
    } else {
      managers.push(managerData);
    }
    setItem('MANAGERS', managers);
    return managerData;
  },

  getInventory: () => getItem('INVENTORY'),
  saveInventoryItem: (itemData) => {
    const inv = getItem('INVENTORY');
    const index = inv.findIndex(i => i.id === itemData.id);
    if (index > -1) {
      inv[index] = { ...inv[index], ...itemData };
    } else {
      inv.push(itemData);
    }
    setItem('INVENTORY', inv);
    return itemData;
  },
  getInventoryTransactions: () => getItem('INV_TRANSACTIONS'),
  addInventoryTransaction: (transaction) => {
    const inv = getItem('INVENTORY');
    const item = inv.find(i => i.id === transaction.inventoryId);
    if (!item) return;

    const openingQty = item.currentQty;
    let closingQty = openingQty;

    if (transaction.type === 'stock_in') closingQty += transaction.qty;
    else if (['usage', 'wastage', 'damaged'].includes(transaction.type)) closingQty -= transaction.qty;
    else if (transaction.type === 'adjustment') closingQty = transaction.qty;

    item.currentQty = Math.max(0, closingQty);
    item.lastUpdated = new Date().toISOString();
    setItem('INVENTORY', inv);

    const txns = getItem('INV_TRANSACTIONS');
    const newTxn = {
      id: `TXN-${Date.now().toString(36)}`,
      ...transaction,
      openingQty,
      closingQty,
      createdAt: new Date().toISOString()
    };
    txns.unshift(newTxn);
    setItem('INV_TRANSACTIONS', txns);
    return newTxn;
  },

  getExpenses: () => getItem('EXPENSES'),
  addExpense: (expenseData) => {
    const exp = getItem('EXPENSES');
    exp.unshift(expenseData);
    setItem('EXPENSES', exp);
    return expenseData;
  },

  getCapital: () => getItem('CAPITAL'),
  addCapitalTransaction: (capitalData) => {
    const cap = getItem('CAPITAL');
    cap.unshift(capitalData);
    setItem('CAPITAL', cap);
    return capitalData;
  },

  getAuditLogs: () => getItem('AUDIT_LOGS')
};
