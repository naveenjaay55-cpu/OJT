/**
 * Campus Store Inventory & Sequential Checkout - Services Layer
 * -------------------------------------------------------------
 * Implements Section 9 Service Contract with Role Enforcement,
 * Sequential Processing Logic, and localStorage Persistence.
 */

(function (window) {
  'use strict';

  // Storage Keys as mandated by Section 7
  const STORAGE_KEYS = {
    PRODUCTS: 'campus_store_products',
    TRANSACTIONS: 'campus_store_transactions',
    SETTINGS: 'campus_store_settings',
    ROLE: 'campus_store_current_role'
  };

  // Roles Definition
  const ROLES = {
    CASHIER: 'cashier',
    STORE_OPERATIONS: 'store_operations'
  };

  // Default Sample Data (matching Section 8.3 and 8.4)
  const DEFAULT_SAMPLE_DATA = {
    products: [
      {
        productId: 'P001',
        name: 'Notebook',
        category: 'Stationery',
        price: 60,
        stock: 50,
        lowStockThreshold: 10,
        createdAt: '2026-10-30T09:00:00.000Z',
        updatedAt: '2026-10-30T09:00:00.000Z'
      },
      {
        productId: 'P002',
        name: 'Blue Pen',
        category: 'Stationery',
        price: 10,
        stock: 100,
        lowStockThreshold: 20,
        createdAt: '2026-10-30T09:15:00.000Z',
        updatedAt: '2026-10-30T09:15:00.000Z'
      },
      {
        productId: 'P003',
        name: 'Water Bottle',
        category: 'Accessories',
        price: 150,
        stock: 8,
        lowStockThreshold: 10,
        createdAt: '2026-10-30T09:30:00.000Z',
        updatedAt: '2026-10-30T09:30:00.000Z'
      },
      {
        productId: 'P004',
        name: 'Chips Packet',
        category: 'Snacks',
        price: 20,
        stock: 30,
        lowStockThreshold: 5,
        createdAt: '2026-10-30T09:45:00.000Z',
        updatedAt: '2026-10-30T09:45:00.000Z'
      }
    ],
    transactions: [
      {
        transactionId: 'T001',
        productId: 'P001',
        productName: 'Notebook',
        quantity: 2,
        unitPrice: 60,
        totalAmount: 120,
        cashierId: 'C001',
        createdAt: '2026-10-30T10:30:00',
        status: 'SUCCESS'
      }
    ],
    settings: {
      storeName: 'Campus Store',
      currency: '₹',
      defaultThreshold: 10,
      activeCashierId: 'C001',
      activeStaffId: 'S001'
    }
  };

  // Internal In-Memory State
  let productsCache = [];
  let transactionsCache = [];
  let settingsCache = {};
  let currentRole = ROLES.CASHIER; // Default simulation role

  /**
   * Helper: Deep clone object/array
   */
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Persist current state to localStorage (FR-12)
   */
  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsCache));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactionsCache));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsCache));
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
      return { success: true, message: 'Data saved to localStorage successfully.' };
    } catch (e) {
      console.error('Error saving data to localStorage', e);
      return { success: false, message: 'Failed to persist data: ' + e.message };
    }
  }

  /**
   * Load data from localStorage or initialize with sample data (FR-12)
   */
  function loadData() {
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedRole = localStorage.getItem(STORAGE_KEYS.ROLE);

      if (storedProducts && storedTransactions) {
        productsCache = JSON.parse(storedProducts);
        transactionsCache = JSON.parse(storedTransactions);
        settingsCache = storedSettings ? JSON.parse(storedSettings) : clone(DEFAULT_SAMPLE_DATA.settings);
      } else {
        // First load: initialize with sample data
        resetToSampleData();
        return { products: clone(productsCache), transactions: clone(transactionsCache), settings: clone(settingsCache) };
      }

      if (storedRole && (storedRole === ROLES.CASHIER || storedRole === ROLES.STORE_OPERATIONS)) {
        currentRole = storedRole;
      }

      return { products: clone(productsCache), transactions: clone(transactionsCache), settings: clone(settingsCache) };
    } catch (e) {
      console.warn('Error reading from localStorage, falling back to sample data', e);
      resetToSampleData();
      return { products: clone(productsCache), transactions: clone(transactionsCache), settings: clone(settingsCache) };
    }
  }

  /**
   * Reset store to initial sample data
   */
  function resetToSampleData() {
    productsCache = clone(DEFAULT_SAMPLE_DATA.products);
    transactionsCache = clone(DEFAULT_SAMPLE_DATA.transactions);
    settingsCache = clone(DEFAULT_SAMPLE_DATA.settings);
    saveData();
    return { success: true, message: 'Reset to official sample data successfully.' };
  }

  /* ----------------- ROLE & PERMISSIONS ----------------- */

  function getCurrentRole() {
    return currentRole;
  }

  function setCurrentRole(role) {
    if (role === ROLES.CASHIER || role === ROLES.STORE_OPERATIONS) {
      currentRole = role;
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
      return { success: true, role: currentRole };
    }
    return { success: false, message: 'Invalid role specified.' };
  }

  function getActiveCashierId() {
    return settingsCache.activeCashierId || 'C001';
  }

  function getActiveStaffId() {
    return settingsCache.activeStaffId || 'S001';
  }

  /* ----------------- PRODUCT SERVICES (FR-01, FR-02, FR-03, FR-11) ----------------- */

  /**
   * getProducts()
   * Returns all products (cloned)
   */
  function getProducts() {
    return clone(productsCache);
  }

  /**
   * getProductById(productId)
   * Returns matching product or null
   */
  function getProductById(productId) {
    if (!productId) return null;
    const found = productsCache.find(p => p.productId === String(productId).trim());
    return found ? clone(found) : null;
  }

  /**
   * getLowStockProducts() (FR-11)
   * Returns products whose available quantity is at or below their lowStockThreshold
   */
  function getLowStockProducts() {
    return productsCache.filter(p => Number(p.stock) <= Number(p.lowStockThreshold)).map(clone);
  }

  /**
   * addProduct(product) (FR-02)
   * Enforces Store Operations Staff role in application logic
   */
  function addProduct(product) {
    // 1. Role Authorization Check (JavaScript Enforcement)
    if (currentRole !== ROLES.STORE_OPERATIONS) {
      return {
        success: false,
        message: 'Permission Denied: Cashiers cannot add products. Switch to Store Operations Staff role.'
      };
    }

    if (!product || typeof product !== 'object') {
      return { success: false, message: 'Invalid product payload provided.' };
    }

    const productId = String(product.productId || '').trim().toUpperCase();
    const name = String(product.name || '').trim();
    const category = String(product.category || 'General').trim();
    const price = Number(product.price);
    const stock = Number(product.stock);
    const lowStockThreshold = Number(product.lowStockThreshold ?? 10);

    // Validation
    if (!productId) {
      return { success: false, message: 'Product ID is required.' };
    }
    if (productsCache.some(p => p.productId.toUpperCase() === productId)) {
      return { success: false, message: `Product ID '${productId}' already exists. IDs must be unique.` };
    }
    if (!name) {
      return { success: false, message: 'Product name is required.' };
    }
    if (isNaN(price) || price < 0) {
      return { success: false, message: 'Product price must be a non-negative number.' };
    }
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      return { success: false, message: 'Stock quantity must be a non-negative whole integer.' };
    }
    if (isNaN(lowStockThreshold) || lowStockThreshold < 0 || !Number.isInteger(lowStockThreshold)) {
      return { success: false, message: 'Low-stock threshold must be a non-negative whole integer.' };
    }

    const now = new Date().toISOString();
    const newProduct = {
      productId,
      name,
      category,
      price: Math.round(price * 100) / 100,
      stock,
      lowStockThreshold,
      createdAt: now,
      updatedAt: now
    };

    productsCache.push(newProduct);
    saveData();

    return {
      success: true,
      message: `Product '${name}' (${productId}) added successfully.`,
      product: clone(newProduct)
    };
  }

  /**
   * updateProduct(productId, updates) (FR-03)
   * Enforces Store Operations Staff role in application logic
   */
  function updateProduct(productId, updates) {
    // 1. Role Authorization Check (JavaScript Enforcement)
    if (currentRole !== ROLES.STORE_OPERATIONS) {
      return {
        success: false,
        message: 'Permission Denied: Cashiers cannot modify product information. Switch to Store Operations Staff role.'
      };
    }

    if (!productId) {
      return { success: false, message: 'Product ID is required for update.' };
    }

    const index = productsCache.findIndex(p => p.productId === String(productId).trim());
    if (index === -1) {
      return { success: false, message: `Product '${productId}' not found in inventory.` };
    }

    const target = productsCache[index];

    if (updates.name !== undefined) {
      const name = String(updates.name).trim();
      if (!name) return { success: false, message: 'Product name cannot be empty.' };
      target.name = name;
    }

    if (updates.category !== undefined) {
      target.category = String(updates.category).trim() || 'General';
    }

    if (updates.price !== undefined) {
      const price = Number(updates.price);
      if (isNaN(price) || price < 0) {
        return { success: false, message: 'Price must be a valid non-negative number.' };
      }
      target.price = Math.round(price * 100) / 100;
    }

    if (updates.stock !== undefined) {
      const stock = Number(updates.stock);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        return { success: false, message: 'Stock must be a non-negative whole integer.' };
      }
      target.stock = stock;
    }

    if (updates.lowStockThreshold !== undefined) {
      const threshold = Number(updates.lowStockThreshold);
      if (isNaN(threshold) || threshold < 0 || !Number.isInteger(threshold)) {
        return { success: false, message: 'Low-stock threshold must be a non-negative whole integer.' };
      }
      target.lowStockThreshold = threshold;
    }

    target.updatedAt = new Date().toISOString();
    saveData();

    return {
      success: true,
      message: `Product '${target.name}' updated successfully.`,
      product: clone(target)
    };
  }

  /**
   * deleteProduct(productId)
   * Additional inventory operation for Store Operations Staff
   */
  function deleteProduct(productId) {
    if (currentRole !== ROLES.STORE_OPERATIONS) {
      return {
        success: false,
        message: 'Permission Denied: Only Store Operations Staff can remove items from inventory.'
      };
    }

    const index = productsCache.findIndex(p => p.productId === String(productId).trim());
    if (index === -1) {
      return { success: false, message: `Product '${productId}' not found.` };
    }

    const deleted = productsCache.splice(index, 1)[0];
    saveData();

    return {
      success: true,
      message: `Product '${deleted.name}' deleted successfully.`,
      product: clone(deleted)
    };
  }

  /* ----------------- CHECKOUT SERVICE (FR-04 to FR-10) ----------------- */

  /**
   * processCheckout(productId, quantity, cashierId)
   * Strictly follows the 11-step Checkout Processing Sequence (Section 9.2)
   */
  function processCheckout(productId, quantity, cashierId) {
    // Check role restriction: Cashier only
    if (currentRole !== ROLES.CASHIER) {
      return {
        success: false,
        message: 'Permission Denied: Only Cashiers can complete checkout operations. Switch to Cashier role.',
        availableStock: null,
        requestedQuantity: quantity
      };
    }

    // Step 1: Receive the selected product ID and requested quantity
    const cleanId = String(productId || '').trim();
    const reqQty = Number(quantity);

    // Step 2 & 3: Find product in inventory and check existence
    if (!cleanId) {
      return {
        success: false,
        message: 'Please select a valid product to purchase.',
        availableStock: 0,
        requestedQuantity: reqQty
      };
    }

    const product = productsCache.find(p => p.productId === cleanId);
    if (!product) {
      return {
        success: false,
        message: `Product with ID '${cleanId}' was not found in store inventory.`,
        availableStock: 0,
        requestedQuantity: reqQty
      };
    }

    // Step 4: Validate that requested quantity is a positive integer
    if (isNaN(reqQty) || !Number.isInteger(reqQty) || reqQty <= 0) {
      return {
        success: false,
        message: 'Purchase quantity must be a positive whole number greater than zero.',
        availableStock: product.stock,
        requestedQuantity: reqQty
      };
    }

    // Step 5: Compare requested quantity with available stock
    const availableStock = product.stock;

    // Step 6: If stock is insufficient, reject checkout WITHOUT changing inventory!
    if (reqQty > availableStock) {
      // Invariant check: Stock must remain untouched
      return {
        success: false,
        message: 'Insufficient stock available.',
        availableStock: availableStock,
        requestedQuantity: reqQty
      };
    }

    // Step 7: If stock is sufficient, calculate total amount
    const unitPrice = Number(product.price);
    const totalAmount = Math.round(unitPrice * reqQty * 100) / 100;

    // Step 8: Decrease product stock by requested quantity
    product.stock -= reqQty;
    product.updatedAt = new Date().toISOString();

    // Step 9: Create transaction record
    const nextTxNum = transactionsCache.length + 1;
    const txId = 'T' + String(nextTxNum).padStart(3, '0');
    const assignedCashier = cashierId || getActiveCashierId();

    const transaction = {
      transactionId: txId,
      productId: product.productId,
      productName: product.name,
      quantity: reqQty,
      unitPrice: unitPrice,
      totalAmount: totalAmount,
      cashierId: assignedCashier,
      createdAt: new Date().toISOString(),
      status: 'SUCCESS'
    };

    transactionsCache.unshift(transaction); // Prepend for latest first

    // Step 10: Save updated inventory and transaction data
    saveData();

    // Step 11: Return response with remaining stock & transaction confirmation
    return {
      success: true,
      message: 'Checkout completed successfully.',
      transaction: {
        transactionId: transaction.transactionId,
        productId: transaction.productId,
        productName: transaction.productName,
        quantity: transaction.quantity,
        unitPrice: transaction.unitPrice,
        totalAmount: transaction.totalAmount,
        cashierId: transaction.cashierId,
        createdAt: transaction.createdAt
      },
      remainingStock: product.stock
    };
  }

  /* ----------------- SALES & HISTORY (FR-13, FR-14) ----------------- */

  /**
   * getTransactions()
   * Returns all completed transactions
   */
  function getTransactions() {
    return clone(transactionsCache);
  }

  /**
   * getSalesSummary()
   * Computes sales metrics, counts, and category aggregations
   */
  function getSalesSummary() {
    const successTx = transactionsCache.filter(t => t.status === 'SUCCESS');
    const totalSales = successTx.reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);
    const totalUnitsSold = successTx.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const completedTransactions = successTx.length;

    // Calculate today's sales
    const today = new Date().toISOString().slice(0, 10);
    const todayTx = successTx.filter(t => (t.createdAt || '').slice(0, 10) === today);
    const todaySales = todayTx.reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

    const lowStockCount = productsCache.filter(p => Number(p.stock) <= Number(p.lowStockThreshold)).length;
    const outOfStockCount = productsCache.filter(p => Number(p.stock) === 0).length;

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      completedTransactions,
      totalUnitsSold,
      todaySales: Math.round(todaySales * 100) / 100,
      todayTransactions: todayTx.length,
      totalProducts: productsCache.length,
      lowStockCount,
      outOfStockCount,
      averageOrderValue: completedTransactions > 0 ? Math.round((totalSales / completedTransactions) * 100) / 100 : 0
    };
  }

  function getSettings() {
    return clone(settingsCache);
  }

  function updateSettings(newSettings) {
    settingsCache = Object.assign({}, settingsCache, newSettings);
    saveData();
    return clone(settingsCache);
  }

  // Export to Global Window
  window.CampusStoreService = {
    ROLES,
    STORAGE_KEYS,
    loadData,
    saveData,
    resetToSampleData,
    getCurrentRole,
    setCurrentRole,
    getActiveCashierId,
    getActiveStaffId,
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    processCheckout,
    getTransactions,
    getSalesSummary,
    getSettings,
    updateSettings
  };

  // Initial load
  loadData();

})(window);

