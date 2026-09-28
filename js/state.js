/* ==========================================================================
   APPLICATION STATE & EVENT STORE WITH PERSISTENT CUSTOMER MEMORY
   ========================================================================== */

class AppStore {
  constructor() {
    this.state = {
      currentUser: JSON.parse(sessionStorage.getItem('qr_user')) || JSON.parse(localStorage.getItem('qr_customer_user')) || null,
      activeSession: JSON.parse(sessionStorage.getItem('qr_session')) || JSON.parse(localStorage.getItem('qr_last_session')) || null,
      cart: JSON.parse(localStorage.getItem('qr_cart')) || [],
      restaurant: {
        id: 'REST-001',
        name: 'Gourmet Bistro & Cafe',
        address: '102 Culinary Boulevard, Suite 4',
        phone: '+91 98765 43210',
        gst: '27AAAAA0000A1Z5',
        taxRate: 12,
        currency: 'INR',
        kotPrefix: 'KOT',
        invoicePrefix: 'INV'
      }
    };
    this.listeners = {};
  }

  getState() {
    return this.state;
  }

  // Auth User State
  setUser(user) {
    this.state.currentUser = user;
    if (user) {
      sessionStorage.setItem('qr_user', JSON.stringify(user));
      if (user.role === 'customer') {
        localStorage.setItem('qr_customer_user', JSON.stringify(user));
      }
    } else {
      sessionStorage.removeItem('qr_user');
      localStorage.removeItem('qr_user');
      localStorage.removeItem('qr_customer_user');
    }
    this.emit('userChange', user);
  }

  // Active Customer Session State
  setSession(session) {
    this.state.activeSession = session;
    if (session) {
      sessionStorage.setItem('qr_session', JSON.stringify(session));
      localStorage.setItem('qr_last_session', JSON.stringify(session));
    } else {
      sessionStorage.removeItem('qr_session');
      localStorage.removeItem('qr_session');
      localStorage.removeItem('qr_last_session');
    }
    this.emit('sessionChange', session);
  }

  // Cart Management
  getCart() {
    return this.state.cart;
  }

  addToCart(menuItem, quantity = 1, customizations = [], notes = '') {
    const cartKey = `${menuItem.id}-${customizations.map(c => c.id).sort().join('-')}`;
    const existingIndex = this.state.cart.findIndex(i => i.cartKey === cartKey);

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += quantity;
    } else {
      const itemTotal = menuItem.price + customizations.reduce((acc, c) => acc + c.price, 0);
      this.state.cart.push({
        cartKey,
        menuItemId: menuItem.id,
        name: menuItem.name,
        image: menuItem.image,
        vegType: menuItem.vegType,
        unitPrice: menuItem.price,
        customizations,
        itemTotal,
        quantity,
        notes
      });
    }
    this.saveCart();
  }

  updateCartQuantity(cartKey, delta) {
    const item = this.state.cart.find(i => i.cartKey === cartKey);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.state.cart = this.state.cart.filter(i => i.cartKey !== cartKey);
      }
      this.saveCart();
    }
  }

  clearCart() {
    this.state.cart = [];
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem('qr_cart', JSON.stringify(this.state.cart));
    this.emit('cartChange', this.state.cart);
  }

  // Event Pub-Sub
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const store = new AppStore();
