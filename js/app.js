/**
 * Campus Store Inventory & Sequential Checkout - UI Controller (app.js)
 * ---------------------------------------------------------------------
 * Handles DOM events, UI updates, role switcher, POS checkout form,
 * inventory management modals, alerts, and live calculation.
 */

(function () {
  'use strict';

  // Selected product in POS checkout form
  let selectedProductId = 'P001'; // Default select first item
  let currentInventoryView = 'table'; // 'table' or 'grid'

  // Bootstrap Modals & Toasts instances
  let productModalInstance = null;
  let receiptModalInstance = null;
  let resetModalInstance = null;

  // DOM Elements cache
  const elements = {
    // Role switcher
    roleSelector: document.getElementById('role-selector'),
    roleBadgeNavbar: document.getElementById('navbar-role-badge'),
    roleNoticeContainer: document.getElementById('role-notice-container'),

    // KPI cards
    kpiTotalProducts: document.getElementById('kpi-total-products'),
    kpiLowStock: document.getElementById('kpi-low-stock'),
    kpiTotalSales: document.getElementById('kpi-total-sales'),
    kpiTransactions: document.getElementById('kpi-transactions'),

    // POS / Checkout
    posSearchInput: document.getElementById('pos-search-input'),
    posCategoryFilter: document.getElementById('pos-category-filter'),
    posProductGrid: document.getElementById('pos-product-grid'),
    posProductSelectDropdown: document.getElementById('pos-product-select-dropdown'),
    checkoutSelectedBox: document.getElementById('checkout-selected-box'),
    checkoutQtyInput: document.getElementById('checkout-quantity-input'),
    btnQtyMinus: document.getElementById('btn-qty-minus'),
    btnQtyPlus: document.getElementById('btn-qty-plus'),
    checkoutUnitPrice: document.getElementById('checkout-unit-price'),
    checkoutAvailableStock: document.getElementById('checkout-available-stock'),
    checkoutStockBadge: document.getElementById('checkout-stock-badge'),
    checkoutCalcQty: document.getElementById('checkout-calc-qty'),
    checkoutTotalAmount: document.getElementById('checkout-total-amount'),
    btnProcessCheckout: document.getElementById('btn-process-checkout'),
    btnTestOversell: document.getElementById('btn-test-oversell'),
    checkoutAlertBox: document.getElementById('checkout-alert-box'),

    // Inventory Tab
    invSearchInput: document.getElementById('inv-search-input'),
    invCategoryFilter: document.getElementById('inv-category-filter'),
    invFilterLowStockOnly: document.getElementById('inv-filter-low-stock'),
    invTableBody: document.getElementById('inventory-table-body'),
    btnAddProduct: document.getElementById('btn-add-product'),

    // Add/Edit Product Modal
    productModal: document.getElementById('productModal'),
    productForm: document.getElementById('product-form'),
    productModalTitle: document.getElementById('productModalLabel'),
    inputProductId: document.getElementById('modal-product-id'),
    inputProductName: document.getElementById('modal-product-name'),
    inputProductCategory: document.getElementById('modal-product-category'),
    inputProductPrice: document.getElementById('modal-product-price'),
    inputProductStock: document.getElementById('modal-product-stock'),
    inputProductThreshold: document.getElementById('modal-product-threshold'),
    modalFormAlert: document.getElementById('modal-form-alert'),

    // Sales History Tab
    historyTableBody: document.getElementById('history-table-body'),
    historySearchInput: document.getElementById('history-search-input'),

    // Summary Tab
    summaryTotalRevenue: document.getElementById('summary-total-revenue'),
    summaryTotalOrders: document.getElementById('summary-total-orders'),
    summaryUnitsSold: document.getElementById('summary-units-sold'),
    summaryAvgOrder: document.getElementById('summary-avg-order'),
    summaryTodayRevenue: document.getElementById('summary-today-revenue'),
    summaryCategoryBreakdown: document.getElementById('summary-category-breakdown'),

    // Reset Data
    btnResetData: document.getElementById('btn-reset-data'),
    btnConfirmReset: document.getElementById('btn-confirm-reset')
  };

  /**
   * Initialize Application
   */
  function initApp() {
    // Initialize Modals
    if (elements.productModal) {
      productModalInstance = new bootstrap.Modal(elements.productModal);
    }
    const receiptModalEl = document.getElementById('receiptModal');
    if (receiptModalEl) {
      receiptModalInstance = new bootstrap.Modal(receiptModalEl);
    }
    const resetModalEl = document.getElementById('resetModal');
    if (resetModalEl) {
      resetModalInstance = new bootstrap.Modal(resetModalEl);
    }

    // Attach Event Listeners
    setupEventListeners();

    // Synchronize Role UI
    syncRoleUI();

    // Initial Render of All Views
    refreshAllViews();
  }

  /**
   * Set up DOM Event Listeners
   */
  function setupEventListeners() {
    // Role Switcher Change
    if (elements.roleSelector) {
      elements.roleSelector.addEventListener('change', function (e) {
        const newRole = e.target.value;
        CampusStoreService.setCurrentRole(newRole);
        syncRoleUI();
        refreshAllViews();
        showToast('Role Switched', `Active role is now: ${newRole === 'cashier' ? 'Cashier (C001)' : 'Store Operations Staff (S001)'}`, 'info');
      });
    }

    // POS Search & Filter
    if (elements.posSearchInput) {
      elements.posSearchInput.addEventListener('input', renderPOSProducts);
    }
    if (elements.posCategoryFilter) {
      elements.posCategoryFilter.addEventListener('change', renderPOSProducts);
    }
    if (elements.posProductSelectDropdown) {
      elements.posProductSelectDropdown.addEventListener('change', function (e) {
        selectProduct(e.target.value);
      });
    }

    // Quantity Steppers
    if (elements.btnQtyMinus) {
      elements.btnQtyMinus.addEventListener('click', function () {
        const current = parseInt(elements.checkoutQtyInput.value, 10) || 1;
        if (current > 1) {
          elements.checkoutQtyInput.value = current - 1;
          updateLiveCalculation();
        }
      });
    }

    if (elements.btnQtyPlus) {
      elements.btnQtyPlus.addEventListener('click', function () {
        const current = parseInt(elements.checkoutQtyInput.value, 10) || 1;
        elements.checkoutQtyInput.value = current + 1;
        updateLiveCalculation();
      });
    }

    if (elements.checkoutQtyInput) {
      elements.checkoutQtyInput.addEventListener('input', updateLiveCalculation);
    }

    // Checkout Action
    if (elements.btnProcessCheckout) {
      elements.btnProcessCheckout.addEventListener('click', handleProcessCheckout);
    }

    // Oversell Demonstration Button
    if (elements.btnTestOversell) {
      elements.btnTestOversell.addEventListener('click', handleTestOversell);
    }

    // Inventory Search & Filters
    if (elements.invSearchInput) {
      elements.invSearchInput.addEventListener('input', renderInventoryTable);
    }
    if (elements.invCategoryFilter) {
      elements.invCategoryFilter.addEventListener('change', renderInventoryTable);
    }
    if (elements.invFilterLowStockOnly) {
      elements.invFilterLowStockOnly.addEventListener('change', renderInventoryTable);
    }

    // Add Product Modal Trigger
    if (elements.btnAddProduct) {
      elements.btnAddProduct.addEventListener('click', function () {
        openAddProductModal();
      });
    }

    // Product Modal Submit
    if (elements.productForm) {
      elements.productForm.addEventListener('submit', handleProductFormSubmit);
    }

    // History Search
    if (elements.historySearchInput) {
      elements.historySearchInput.addEventListener('input', renderHistoryTable);
    }

    // Reset Data Action
    if (elements.btnConfirmReset) {
      elements.btnConfirmReset.addEventListener('click', function () {
        CampusStoreService.resetToSampleData();
        if (resetModalInstance) resetModalInstance.hide();
        selectedProductId = 'P001';
        refreshAllViews();
        showToast('Sample Data Restored', 'Store initialized with official sample data.', 'success');
      });
    }
  }

  /**
   * Synchronize Role-specific Visuals and Restrictions
   */
  function syncRoleUI() {
    const role = CampusStoreService.getCurrentRole();
    if (elements.roleSelector) {
      elements.roleSelector.value = role;
    }

    const isCashier = (role === CampusStoreService.ROLES.CASHIER);
    const isStoreStaff = (role === CampusStoreService.ROLES.STORE_OPERATIONS);

    // Navbar Badge
    if (elements.roleBadgeNavbar) {
      if (isCashier) {
        elements.roleBadgeNavbar.className = 'role-pill cashier';
        elements.roleBadgeNavbar.innerHTML = '<i class="bi bi-person-badge"></i> Cashier Terminal (C001)';
      } else {
        elements.roleBadgeNavbar.className = 'role-pill store-staff';
        elements.roleBadgeNavbar.innerHTML = '<i class="bi bi-box-seam"></i> Store Operations Staff (S001)';
      }
    }

    // Role Notice Card
    if (elements.roleNoticeContainer) {
      if (isCashier) {
        elements.roleNoticeContainer.innerHTML = `
          <div class="alert alert-primary d-flex align-items-center justify-content-between mb-0" role="alert">
            <div>
              <i class="bi bi-info-circle-fill me-2"></i>
              <strong>Active Role: Cashier (C001)</strong> — You can select products, validate quantities, and complete checkouts. Product editing and additions are restricted to Store Staff.
            </div>
            <button class="btn btn-sm btn-outline-primary" onclick="window.CampusStoreApp.switchRole('store_operations')">Switch to Store Staff</button>
          </div>
        `;
      } else {
        elements.roleNoticeContainer.innerHTML = `
          <div class="alert alert-secondary d-flex align-items-center justify-content-between mb-0" role="alert" style="border-left: 4px solid #7c3aed;">
            <div>
              <i class="bi bi-shield-lock-fill me-2 text-purple" style="color: #7c3aed;"></i>
              <strong>Active Role: Store Operations Staff (S001)</strong> — You can add new products, update prices, adjust stock levels, and monitor low-stock items. Direct customer checkout is disabled for this role.
            </div>
            <button class="btn btn-sm btn-outline-dark" onclick="window.CampusStoreApp.switchRole('cashier')">Switch to Cashier</button>
          </div>
        `;
      }
    }

    // Button states based on role
    if (elements.btnProcessCheckout) {
      if (!isCashier) {
        elements.btnProcessCheckout.setAttribute('title', 'Only Cashiers can process checkouts.');
        elements.btnProcessCheckout.classList.add('opacity-75');
      } else {
        elements.btnProcessCheckout.removeAttribute('title');
        elements.btnProcessCheckout.classList.remove('opacity-75');
      }
    }

    if (elements.btnAddProduct) {
      if (!isStoreStaff) {
        elements.btnAddProduct.setAttribute('title', 'Only Store Operations Staff can add products.');
      } else {
        elements.btnAddProduct.removeAttribute('title');
      }
    }
  }

  /**
   * Refresh all dashboard cards, POS view, inventory table, and history
   */
  function refreshAllViews() {
    renderKPIs();
    renderPOSProducts();
    populateProductDropdown();
    updateCheckoutSelectedProductUI();
    renderInventoryTable();
    renderHistoryTable();
    renderAnalyticsSummary();
  }

  /**
   * Render Top Dashboard KPIs
   */
  function renderKPIs() {
    const summary = CampusStoreService.getSalesSummary();

    if (elements.kpiTotalProducts) {
      elements.kpiTotalProducts.textContent = summary.totalProducts;
    }
    if (elements.kpiLowStock) {
      elements.kpiLowStock.textContent = summary.lowStockCount;
      const card = elements.kpiLowStock.closest('.kpi-card');
      if (card) {
        if (summary.lowStockCount > 0) {
          card.classList.add('kpi-alert');
        } else {
          card.classList.remove('kpi-alert');
        }
      }
    }
    if (elements.kpiTotalSales) {
      elements.kpiTotalSales.textContent = `₹${summary.totalSales.toFixed(2)}`;
    }
    if (elements.kpiTransactions) {
      elements.kpiTransactions.textContent = summary.completedTransactions;
    }
  }

  /**
   * Render POS Visual Product Catalog (FR-01, FR-04, FR-11)
   */
  function renderPOSProducts() {
    if (!elements.posProductGrid) return;

    const searchTerm = (elements.posSearchInput ? elements.posSearchInput.value : '').toLowerCase().trim();
    const category = elements.posCategoryFilter ? elements.posCategoryFilter.value : 'ALL';

    const allProducts = CampusStoreService.getProducts();
    const filtered = allProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.productId.toLowerCase().includes(searchTerm);
      const matchCat = (category === 'ALL' || p.category === category);
      return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
      elements.posProductGrid.innerHTML = `
        <div class="col-12 py-5 text-center text-muted">
          <i class="bi bi-search display-6 d-block mb-2"></i>
          No products matched your search or category filter.
        </div>
      `;
      return;
    }

    elements.posProductGrid.innerHTML = filtered.map(p => {
      const isSelected = (p.productId === selectedProductId);
      const isLowStock = (Number(p.stock) <= Number(p.lowStockThreshold));
      const isOutOfStock = (Number(p.stock) <= 0);

      let cardClass = 'product-picker-card';
      if (isSelected) cardClass += ' selected';
      if (isOutOfStock) cardClass += ' out-of-stock';
      else if (isLowStock) cardClass += ' low-stock';

      let statusBadge = '';
      if (isOutOfStock) {
        statusBadge = '<span class="badge badge-out-of-stock">Out of Stock (0)</span>';
      } else if (isLowStock) {
        statusBadge = `<span class="badge badge-low-stock"><span class="pulse-indicator"></span>Low Stock (${p.stock} left)</span>`;
      } else {
        statusBadge = `<span class="badge badge-in-stock">In Stock (${p.stock})</span>`;
      }

      return `
        <div class="col-sm-6 col-md-4 col-xl-3 mb-3">
          <div class="${cardClass}" onclick="window.CampusStoreApp.selectProduct('${p.productId}')">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-1">
                <span class="badge bg-light text-dark border">#${escapeHtml(p.productId)}</span>
                <span class="text-muted small">${escapeHtml(p.category)}</span>
              </div>
              <h6 class="fw-bold text-truncate mb-2" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h6>
            </div>
            <div class="mt-2 pt-2 border-top">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold fs-5 text-primary">₹${Number(p.price).toFixed(2)}</span>
                ${statusBadge}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Populate Product Select Dropdown (FR-04)
   */
  function populateProductDropdown() {
    if (!elements.posProductSelectDropdown) return;

    const products = CampusStoreService.getProducts();
    elements.posProductSelectDropdown.innerHTML = products.map(p => {
      const isLow = Number(p.stock) <= Number(p.lowStockThreshold);
      const label = `[${p.productId}] ${p.name} - ₹${Number(p.price).toFixed(2)} (Stock: ${p.stock}${isLow ? ' - LOW' : ''})`;
      return `<option value="${p.productId}" ${p.productId === selectedProductId ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');
  }

  /**
   * Select a product for the Checkout Form (FR-04)
   */
  function selectProduct(productId) {
    selectedProductId = productId;
    if (elements.posProductSelectDropdown) {
      elements.posProductSelectDropdown.value = productId;
    }
    renderPOSProducts();
    updateCheckoutSelectedProductUI();
    hideCheckoutAlert();
  }

  /**
   * Update Checkout Form UI with Selected Product Details (FR-04, FR-05, FR-07)
   */
  function updateCheckoutSelectedProductUI() {
    const product = CampusStoreService.getProductById(selectedProductId);

    if (!product) {
      if (elements.checkoutSelectedBox) {
        elements.checkoutSelectedBox.innerHTML = `
          <div class="text-center text-muted py-3">
            <i class="bi bi-cart-x fs-2 d-block mb-1"></i>
            Please select a product from the list above.
          </div>
        `;
      }
      if (elements.checkoutUnitPrice) elements.checkoutUnitPrice.textContent = '₹0.00';
      if (elements.checkoutAvailableStock) elements.checkoutAvailableStock.textContent = '0';
      if (elements.checkoutStockBadge) elements.checkoutStockBadge.className = 'badge bg-secondary';
      if (elements.checkoutStockBadge) elements.checkoutStockBadge.textContent = 'None';
      if (elements.checkoutTotalAmount) elements.checkoutTotalAmount.textContent = '₹0.00';
      return;
    }

    const isLowStock = Number(product.stock) <= Number(product.lowStockThreshold);
    const isOutOfStock = Number(product.stock) <= 0;

    let badgeClass = 'badge badge-in-stock';
    let badgeText = `In Stock (${product.stock} units)`;
    if (isOutOfStock) {
      badgeClass = 'badge badge-out-of-stock';
      badgeText = 'Out of Stock (0 units)';
    } else if (isLowStock) {
      badgeClass = 'badge badge-low-stock';
      badgeText = `⚠️ Low Stock (${product.stock} units left)`;
    }

    if (elements.checkoutSelectedBox) {
      elements.checkoutSelectedBox.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-muted small text-uppercase fw-bold">${escapeHtml(product.category)} &bull; ID: ${escapeHtml(product.productId)}</div>
            <h5 class="fw-bold mb-1">${escapeHtml(product.name)}</h5>
          </div>
          <span class="${badgeClass}">${badgeText}</span>
        </div>
      `;
    }

    if (elements.checkoutUnitPrice) {
      elements.checkoutUnitPrice.textContent = `₹${Number(product.price).toFixed(2)}`;
    }
    if (elements.checkoutAvailableStock) {
      elements.checkoutAvailableStock.textContent = `${product.stock} units`;
    }
    if (elements.checkoutStockBadge) {
      elements.checkoutStockBadge.className = badgeClass;
      elements.checkoutStockBadge.textContent = isOutOfStock ? 'Depleted' : (isLowStock ? 'Threshold Reached' : 'Sufficient');
    }

    updateLiveCalculation();
  }

  /**
   * Live Total Calculation (FR-07)
   */
  function updateLiveCalculation() {
    const product = CampusStoreService.getProductById(selectedProductId);
    const qtyVal = elements.checkoutQtyInput ? parseInt(elements.checkoutQtyInput.value, 10) : 1;
    const qty = isNaN(qtyVal) || qtyVal < 1 ? 1 : qtyVal;

    if (elements.checkoutCalcQty) {
      elements.checkoutCalcQty.textContent = `${qty} unit${qty > 1 ? 's' : ''}`;
    }

    if (!product) {
      if (elements.checkoutTotalAmount) elements.checkoutTotalAmount.textContent = '₹0.00';
      return;
    }

    const unitPrice = Number(product.price);
    const total = Math.round(unitPrice * qty * 100) / 100;

    if (elements.checkoutTotalAmount) {
      elements.checkoutTotalAmount.textContent = `₹${total.toFixed(2)}`;
    }

    // Immediate visual hint if quantity exceeds stock
    if (qty > product.stock) {
      showCheckoutAlert(`Warning: Requested quantity (${qty}) exceeds available stock (${product.stock}). Checkout will be rejected.`, 'warning');
    } else {
      hideCheckoutAlert();
    }
  }

  /**
   * Sequential Checkout Handler (FR-04 to FR-10)
   */
  function handleProcessCheckout() {
    const currentRole = CampusStoreService.getCurrentRole();

    // 1. Role enforcement check
    if (currentRole !== CampusStoreService.ROLES.CASHIER) {
      showCheckoutAlert('Permission Denied: Only Cashiers can process checkouts. Switch your role in the top bar to Cashier.', 'danger');
      showToast('Action Denied', 'Role Store Operations Staff cannot perform checkout.', 'danger');
      return;
    }

    // 2. Validate product selection
    if (!selectedProductId) {
      showCheckoutAlert('Please select a product before checking out.', 'danger');
      return;
    }

    const qtyVal = parseInt(elements.checkoutQtyInput.value, 10);

    // Call Service layer (enforces exact 11-step sequence & stock check)
    const result = CampusStoreService.processCheckout(selectedProductId, qtyVal, CampusStoreService.getActiveCashierId());

    if (!result.success) {
      // Rejection handling (FR-10: Stock unchanged)
      showCheckoutAlert(`❌ Checkout Failed: ${result.message} (Available: ${result.availableStock}, Requested: ${result.requestedQuantity})`, 'danger');
      showToast('Checkout Rejected', result.message, 'danger');
      return;
    }

    // Successful Checkout (FR-08, FR-09)
    hideCheckoutAlert();
    showToast('Checkout Successful', `Transaction ${result.transaction.transactionId} processed! Remaining stock: ${result.remainingStock}`, 'success');

    // Show Receipt Modal
    showReceiptModal(result.transaction, result.remainingStock);

    // Reset quantity back to 1
    if (elements.checkoutQtyInput) elements.checkoutQtyInput.value = 1;

    // Refresh all views immediately
    refreshAllViews();
  }

  /**
   * Test Oversell Scenario (Helpful for college demo / grader inspection)
   */
  function handleTestOversell() {
    const product = CampusStoreService.getProductById(selectedProductId);
    if (!product) return;

    // Set quantity higher than available stock
    const excessiveQty = product.stock + 5;
    if (elements.checkoutQtyInput) {
      elements.checkoutQtyInput.value = excessiveQty;
    }
    updateLiveCalculation();

    showToast('Test Oversell Prepared', `Set quantity to ${excessiveQty} (Stock is ${product.stock}). Click 'Complete Checkout' to verify rejection.`, 'warning');
  }

  /**
   * Display Receipt Modal
   */
  function showReceiptModal(transaction, remainingStock) {
    const receiptBody = document.getElementById('receipt-details');
    if (!receiptBody) return;

    receiptBody.innerHTML = `
      <div class="text-center mb-3">
        <div class="display-6 text-success"><i class="bi bi-check-circle-fill"></i></div>
        <h5 class="fw-bold mb-0">Payment Confirmed</h5>
        <div class="text-muted small">Campus Store POS Receipt</div>
      </div>
      <table class="table table-sm border">
        <tbody>
          <tr><th class="text-muted">Transaction ID:</th><td class="fw-bold">#${transaction.transactionId}</td></tr>
          <tr><th class="text-muted">Date & Time:</th><td>${new Date(transaction.createdAt).toLocaleString()}</td></tr>
          <tr><th class="text-muted">Cashier ID:</th><td><code>${transaction.cashierId}</code></td></tr>
          <tr><th class="text-muted">Product:</th><td><strong>${escapeHtml(transaction.productName)}</strong> (${transaction.productId})</td></tr>
          <tr><th class="text-muted">Unit Price:</th><td>₹${Number(transaction.unitPrice).toFixed(2)}</td></tr>
          <tr><th class="text-muted">Quantity:</th><td class="fw-bold">${transaction.quantity} unit(s)</td></tr>
          <tr class="table-primary"><th class="fw-bold fs-6">Total Amount Paid:</th><td class="fw-bold fs-6 text-primary">₹${Number(transaction.totalAmount).toFixed(2)}</td></tr>
          <tr><th class="text-muted">Updated Stock Remaining:</th><td class="fw-bold text-success">${remainingStock} units</td></tr>
        </tbody>
      </table>
    `;

    if (receiptModalInstance) {
      receiptModalInstance.show();
    }
  }

  /**
   * Alert box in checkout form
   */
  function showCheckoutAlert(msg, type = 'danger') {
    if (!elements.checkoutAlertBox) return;
    elements.checkoutAlertBox.className = `alert alert-${type} mt-3 mb-0`;
    elements.checkoutAlertBox.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i> ${escapeHtml(msg)}`;
    elements.checkoutAlertBox.classList.remove('d-none');
  }

  function hideCheckoutAlert() {
    if (elements.checkoutAlertBox) {
      elements.checkoutAlertBox.classList.add('d-none');
    }
  }

  /**
   * Render Product Inventory Table (FR-01, FR-02, FR-03, FR-11)
   */
  function renderInventoryTable() {
    if (!elements.invTableBody) return;

    const searchTerm = (elements.invSearchInput ? elements.invSearchInput.value : '').toLowerCase().trim();
    const category = elements.invCategoryFilter ? elements.invCategoryFilter.value : 'ALL';
    const lowStockOnly = elements.invFilterLowStockOnly ? elements.invFilterLowStockOnly.checked : false;

    const allProducts = CampusStoreService.getProducts();
    const filtered = allProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.productId.toLowerCase().includes(searchTerm);
      const matchCat = (category === 'ALL' || p.category === category);
      const isLow = Number(p.stock) <= Number(p.lowStockThreshold);
      const matchLow = lowStockOnly ? isLow : true;
      return matchSearch && matchCat && matchLow;
    });

    if (filtered.length === 0) {
      elements.invTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-3 d-block mb-1"></i>
            No products match the selected criteria.
          </td>
        </tr>
      `;
      return;
    }

    elements.invTableBody.innerHTML = filtered.map(p => {
      const isLowStock = Number(p.stock) <= Number(p.lowStockThreshold);
      const isOutOfStock = Number(p.stock) <= 0;

      let rowClass = '';
      let badgeHtml = '';

      if (isOutOfStock) {
        rowClass = 'row-out-of-stock';
        badgeHtml = '<span class="badge badge-out-of-stock">Depleted (0)</span>';
      } else if (isLowStock) {
        rowClass = 'row-low-stock';
        badgeHtml = `<span class="badge badge-low-stock"><span class="pulse-indicator"></span>Low Stock (&le; ${p.lowStockThreshold})</span>`;
      } else {
        badgeHtml = '<span class="badge badge-in-stock">In Stock</span>';
      }

      return `
        <tr class="${rowClass}">
          <td><span class="badge bg-light text-dark border">#${escapeHtml(p.productId)}</span></td>
          <td>
            <strong>${escapeHtml(p.name)}</strong>
          </td>
          <td><span class="text-muted small">${escapeHtml(p.category)}</span></td>
          <td class="fw-bold">₹${Number(p.price).toFixed(2)}</td>
          <td>
            <span class="fw-bold fs-6 ${isLowStock ? 'text-danger' : 'text-success'}">${p.stock}</span>
          </td>
          <td><span class="text-muted small">&le; ${p.lowStockThreshold} units</span></td>
          <td>${badgeHtml}</td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="window.CampusStoreApp.openEditProductModal('${p.productId}')" title="Edit Product / Restock">
                <i class="bi bi-pencil-square"></i> Edit
              </button>
              <button class="btn btn-outline-danger" onclick="window.CampusStoreApp.handleDeleteProduct('${p.productId}')" title="Remove Product">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Open Add Product Modal (FR-02)
   */
  function openAddProductModal() {
    const role = CampusStoreService.getCurrentRole();
    if (role !== CampusStoreService.ROLES.STORE_OPERATIONS) {
      showToast('Permission Denied', 'Only Store Operations Staff can add new products. Please switch role.', 'danger');
      return;
    }

    if (elements.productForm) elements.productForm.reset();
    if (elements.inputProductId) {
      elements.inputProductId.readOnly = false;
      // Auto-suggest next ID (e.g., P005)
      const products = CampusStoreService.getProducts();
      const nextId = 'P' + String(products.length + 1).padStart(3, '0');
      elements.inputProductId.value = nextId;
    }
    if (elements.productModalTitle) {
      elements.productModalTitle.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add New Product to Inventory';
    }
    if (elements.modalFormAlert) {
      elements.modalFormAlert.classList.add('d-none');
    }

    if (productModalInstance) productModalInstance.show();
  }

  /**
   * Open Edit Product Modal (FR-03)
   */
  function openEditProductModal(productId) {
    const role = CampusStoreService.getCurrentRole();
    if (role !== CampusStoreService.ROLES.STORE_OPERATIONS) {
      showToast('Permission Denied', 'Only Store Operations Staff can modify products. Switch to Store Operations Staff role.', 'danger');
      return;
    }

    const product = CampusStoreService.getProductById(productId);
    if (!product) {
      showToast('Error', 'Product not found.', 'danger');
      return;
    }

    if (elements.inputProductId) {
      elements.inputProductId.value = product.productId;
      elements.inputProductId.readOnly = true; // Cannot alter unique ID
    }
    if (elements.inputProductName) elements.inputProductName.value = product.name;
    if (elements.inputProductCategory) elements.inputProductCategory.value = product.category;
    if (elements.inputProductPrice) elements.inputProductPrice.value = product.price;
    if (elements.inputProductStock) elements.inputProductStock.value = product.stock;
    if (elements.inputProductThreshold) elements.inputProductThreshold.value = product.lowStockThreshold;

    if (elements.productModalTitle) {
      elements.productModalTitle.innerHTML = `<i class="bi bi-pencil-square me-1"></i> Edit Product: ${escapeHtml(product.name)} (#${product.productId})`;
    }
    if (elements.modalFormAlert) elements.modalFormAlert.classList.add('d-none');

    if (productModalInstance) productModalInstance.show();
  }

  /**
   * Handle Product Add/Edit Form Submission (FR-02, FR-03)
   */
  function handleProductFormSubmit(e) {
    e.preventDefault();

    const productId = elements.inputProductId.value.trim().toUpperCase();
    const name = elements.inputProductName.value.trim();
    const category = elements.inputProductCategory.value.trim();
    const price = parseFloat(elements.inputProductPrice.value);
    const stock = parseInt(elements.inputProductStock.value, 10);
    const lowStockThreshold = parseInt(elements.inputProductThreshold.value, 10);

    const isExisting = CampusStoreService.getProductById(productId);

    let result;
    if (isExisting && elements.inputProductId.readOnly) {
      // Update existing
      result = CampusStoreService.updateProduct(productId, {
        name,
        category,
        price,
        stock,
        lowStockThreshold
      });
    } else {
      // Add new
      result = CampusStoreService.addProduct({
        productId,
        name,
        category,
        price,
        stock,
        lowStockThreshold
      });
    }

    if (!result.success) {
      if (elements.modalFormAlert) {
        elements.modalFormAlert.className = 'alert alert-danger mb-3';
        elements.modalFormAlert.textContent = result.message;
        elements.modalFormAlert.classList.remove('d-none');
      }
      return;
    }

    // Success
    if (productModalInstance) productModalInstance.hide();
    showToast('Inventory Updated', result.message, 'success');
    refreshAllViews();
  }

  /**
   * Handle Delete Product
   */
  function handleDeleteProduct(productId) {
    const role = CampusStoreService.getCurrentRole();
    if (role !== CampusStoreService.ROLES.STORE_OPERATIONS) {
      showToast('Permission Denied', 'Only Store Operations Staff can remove products.', 'danger');
      return;
    }

    const product = CampusStoreService.getProductById(productId);
    if (!product) return;

    if (confirm(`Are you sure you want to delete product "${product.name}" (#${productId}) from store inventory?`)) {
      const res = CampusStoreService.deleteProduct(productId);
      if (res.success) {
        showToast('Product Removed', res.message, 'info');
        if (selectedProductId === productId) {
          const remaining = CampusStoreService.getProducts();
          selectedProductId = remaining.length > 0 ? remaining[0].productId : null;
        }
        refreshAllViews();
      } else {
        showToast('Error', res.message, 'danger');
      }
    }
  }

  /**
   * Render Checkout History Table (FR-14)
   */
  function renderHistoryTable() {
    if (!elements.historyTableBody) return;

    const searchTerm = (elements.historySearchInput ? elements.historySearchInput.value : '').toLowerCase().trim();
    const transactions = CampusStoreService.getTransactions();

    const filtered = transactions.filter(t => {
      return (
        t.transactionId.toLowerCase().includes(searchTerm) ||
        t.productName.toLowerCase().includes(searchTerm) ||
        t.productId.toLowerCase().includes(searchTerm) ||
        (t.cashierId && t.cashierId.toLowerCase().includes(searchTerm))
      );
    });

    if (filtered.length === 0) {
      elements.historyTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            <i class="bi bi-clock-history fs-3 d-block mb-1"></i>
            No checkout transactions recorded yet.
          </td>
        </tr>
      `;
      return;
    }

    elements.historyTableBody.innerHTML = filtered.map(t => {
      const dateFormatted = t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A';
      const statusBadge = t.status === 'SUCCESS'
        ? '<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle"></i> SUCCESS</span>'
        : '<span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-x-circle"></i> REJECTED</span>';

      return `
        <tr>
          <td><span class="badge bg-light text-dark border">#${escapeHtml(t.transactionId)}</span></td>
          <td><span class="text-muted small">${dateFormatted}</span></td>
          <td>
            <strong>${escapeHtml(t.productName)}</strong>
            <span class="text-muted small">(${escapeHtml(t.productId)})</span>
          </td>
          <td class="text-center fw-bold">${t.quantity}</td>
          <td>₹${Number(t.unitPrice).toFixed(2)}</td>
          <td class="fw-bold text-primary">₹${Number(t.totalAmount).toFixed(2)}</td>
          <td><code>${escapeHtml(t.cashierId || 'C001')}</code></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Render Sales Analytics & Summary (FR-13)
   */
  function renderAnalyticsSummary() {
    const summary = CampusStoreService.getSalesSummary();

    if (elements.summaryTotalRevenue) {
      elements.summaryTotalRevenue.textContent = `₹${summary.totalSales.toFixed(2)}`;
    }
    if (elements.summaryTotalOrders) {
      elements.summaryTotalOrders.textContent = summary.completedTransactions;
    }
    if (elements.summaryUnitsSold) {
      elements.summaryUnitsSold.textContent = summary.totalUnitsSold;
    }
    if (elements.summaryAvgOrder) {
      elements.summaryAvgOrder.textContent = `₹${summary.averageOrderValue.toFixed(2)}`;
    }
    if (elements.summaryTodayRevenue) {
      elements.summaryTodayRevenue.textContent = `₹${summary.todaySales.toFixed(2)} (${summary.todayTransactions} orders today)`;
    }

    // Category Breakdown
    if (elements.summaryCategoryBreakdown) {
      const products = CampusStoreService.getProducts();
      const transactions = CampusStoreService.getTransactions().filter(t => t.status === 'SUCCESS');

      const catMap = {};
      products.forEach(p => {
        if (!catMap[p.category]) {
          catMap[p.category] = { count: 0, stock: 0, revenue: 0 };
        }
        catMap[p.category].count += 1;
        catMap[p.category].stock += p.stock;
      });

      transactions.forEach(t => {
        const prod = products.find(p => p.productId === t.productId);
        const cat = prod ? prod.category : 'General';
        if (catMap[cat]) {
          catMap[cat].revenue += Number(t.totalAmount || 0);
        }
      });

      const categories = Object.keys(catMap);
      if (categories.length === 0) {
        elements.summaryCategoryBreakdown.innerHTML = '<div class="text-muted small">No categories registered.</div>';
      } else {
        elements.summaryCategoryBreakdown.innerHTML = categories.map(cat => {
          const c = catMap[cat];
          return `
            <div class="mb-3">
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>${escapeHtml(cat)} (${c.count} items, ${c.stock} units in stock)</span>
                <span class="text-primary">Sales: ₹${c.revenue.toFixed(2)}</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-primary" style="width: ${summary.totalSales > 0 ? (c.revenue / summary.totalSales) * 100 : 0}%"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  /**
   * Helper: Show Toast Notification
   */
  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    let bgClass = 'text-bg-primary';
    let icon = 'bi-info-circle-fill';

    if (type === 'success') {
      bgClass = 'text-bg-success';
      icon = 'bi-check-circle-fill';
    } else if (type === 'danger') {
      bgClass = 'text-bg-danger';
      icon = 'bi-exclamation-triangle-fill';
    } else if (type === 'warning') {
      bgClass = 'text-bg-warning';
      icon = 'bi-exclamation-circle-fill';
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast ${bgClass} align-items-center border-0 mb-2`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icon} me-1"></i>
          <strong>${escapeHtml(title)}:</strong> ${escapeHtml(message)}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  }

  /**
   * Helper: HTML escape
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Export methods for inline HTML onclick handlers
  window.CampusStoreApp = {
    switchRole: function (role) {
      CampusStoreService.setCurrentRole(role);
      syncRoleUI();
      refreshAllViews();
      showToast('Role Switched', `Active role is now: ${role === 'cashier' ? 'Cashier (C001)' : 'Store Operations Staff (S001)'}`, 'info');
    },
    selectProduct,
    openEditProductModal,
    handleDeleteProduct
  };

  // Run init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();

