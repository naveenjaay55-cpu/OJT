# Campus Store Inventory & Sequential Checkout System

A lightweight, robust web application built for campus retail store inventory management and sequential checkout operations. Designed and implemented for the **College On-the-Job Training (OJT) Project**.

---

## 🌟 Key Highlights & Implementation Overview

- **Dual-Role Architecture**:
  - **Cashier (`C001`)**: Selects products, validates stock, calculates purchase totals live, completes checkouts, and prints receipts. *Enforces restriction: Cannot edit/add products or oversell stock.*
  - **Store Operations Staff (`S001`)**: Catalogs new products, updates unit prices, updates stock quantities, configures low-stock thresholds, and monitors alerts. *Enforces restriction: Cannot perform customer checkout operations.*
  - **JavaScript-Enforced Security**: Role restrictions are verified in the JavaScript service layer (`services.js`), preventing unauthorized actions even if UI controls are inspected or called programmatically.
- **Sequential Checkout Logic (FR-04 to FR-10)**:
  - Exact 11-step sequential checkout processing pipeline.
  - Prevents overselling atomically: If requested quantity exceeds available inventory, checkout is rejected immediately without modifying stock.
- **Visual Low-Stock Highlighting (FR-11)**:
  - Visual badges, animated pulse indicators, warning rows, and filter toggles highlight products with stock $\le$ configured `lowStockThreshold`.
- **Client-Side Persistence (FR-12)**:
  - Uses browser `localStorage` across standardized keys:
    - `campus_store_products`
    - `campus_store_transactions`
    - `campus_store_settings`
  - Includes `sample-data.json` and a one-click **"Reset Sample Data"** action.
- **Python Sequential Replay Script (Stretch Goal)**:
  - `replay_checkout.py`: Replays checkout transactions sequentially, validates stock integrity, and uses Python assertions (`assert product["stock"] >= 0`) to guarantee non-negative stock invariants.

---

## 📋 Functional Requirements Traceability Matrix

| ID | Requirement | Description | Status |
|---|---|---|:---:|
| **FR-01** | Display Products | Shows product name, ID, category, price, and available quantity in responsive card & table views. | ✅ Completed |
| **FR-02** | Add Product | Store Operations Staff can add new products with unique ID, name, category, price, stock, and low-stock threshold. | ✅ Completed |
| **FR-03** | Update Product | Store Operations Staff can update product details and adjust stock levels. | ✅ Completed |
| **FR-04** | Select Product | Cashiers can select products via interactive visual catalog cards or quick-select dropdown. | ✅ Completed |
| **FR-05** | Enter Quantity | Cashiers can enter purchase quantity with increment/decrement steppers. | ✅ Completed |
| **FR-06** | Validate Stock | Logic verifies requested quantity $\le$ available stock before processing. | ✅ Completed |
| **FR-07** | Calculate Total | Live calculation of $\text{unitPrice} \times \text{quantity}$ before checkout confirmation. | ✅ Completed |
| **FR-08** | Complete Checkout | Executes checkout and creates a timestamped transaction record. | ✅ Completed |
| **FR-09** | Decrease Stock | Decrements available inventory atomically upon successful checkout. | ✅ Completed |
| **FR-10** | Prevent Overselling | Rejects purchase attempts exceeding current stock without altering inventory. | ✅ Completed |
| **FR-11** | Low-Stock Highlight | Visually highlights items whose available quantity is at or below threshold. | ✅ Completed |
| **FR-12** | Persist Data | Stores and restores product inventory and transactions via `localStorage`. | ✅ Completed |
| **FR-13** | Sales Summary | KPI metric dashboard tracking total revenue, completed orders, and category breakdowns. | ✅ Completed |
| **FR-14** | Checkout History | Log of completed transactions with ID, cashier, timestamp, items, and status. | ✅ Completed |

---

## 🛠 Tech Stack

- **Frontend Structure**: HTML5 semantic markup (`index.html` & `.html`)
- **Styling**: Bootstrap 5.3.3 + Bootstrap Icons + Custom CSS (`css/styles.css`)
- **Business Logic & Services**: Vanilla JavaScript (ES6+ modular service pattern in `js/services.js` and UI controller in `js/app.js`)
- **Data Persistence**: Browser `localStorage`
- **Stretch Goal Script**: Python 3.9+ (`replay_checkout.py`)

---

## 📂 Project Directory Structure

```text
OJT project/
├── index.html            # Main web application entry point
├── .html                 # Synchronized application file
├── goodthread.html       # Standalone Goodthread clothing storefront demo
├── sample-data.json      # Official baseline sample data
├── replay_checkout.py    # Python 3 sequential replay & assertion script
├── css/
│   └── styles.css        # Custom styles, badges, and animations
├── js/
│   ├── services.js       # Section 9 Service Contract & role logic
│   └── app.js            # UI controller, event handlers, and modals
└── README.md             # Project documentation
```

---

## 🚀 How to Run the Web Application

### Option A: Direct Browser Launch
Simply open `index.html` (or `.html`) in any modern web browser (Google Chrome, Firefox, Microsoft Edge, Safari).

### Option B: Local Web Server
You can also serve the project using Python's built-in HTTP server:
```bash
cd "OJT project"
python3 -m http.server 8080
```
Then visit: `http://localhost:8080`

### Goodthread Clothing Storefront
The repository also includes a standalone clothing-store demo with product filtering, search, size selection, and a browser-persisted shopping bag. Open [`goodthread.html`](./goodthread.html) locally or visit the [Goodthread storefront on GitHub Pages](https://naveenjaay55-cpu.github.io/OJT/goodthread.html). Checkout is a demo and does not process payments.

---

## 🐍 Stretch Goal: Running the Python Checkout Replay Script

The Python script validates sequential transaction processing and verifies data integrity with assertions.

### Execution:
```bash
cd "OJT project"
python3 replay_checkout.py
```

### Script Output:
1. Displays initial inventory state.
2. Replays sequential checkout transactions one by one.
3. Automatically validates stock and decrements inventory for valid purchases.
4. Detects and rejects oversell attempts (e.g. attempting to purchase 10 water bottles when only 5 are in stock).
5. Runs assertions on inventory stock levels:
   ```python
   assert product["stock"] >= 0
   ```
6. Outputs a formatted audit report of successful and rejected transactions.

---

## 🧪 Testing Role Restrictions

1. **Test Cashier Role Restrictions**:
   - Set the role to **Cashier (C001)**.
   - Go to the **Product Inventory** tab and click **"Add New Product"** or **"Edit"**.
   - Notice the system immediately blocks the action with:
     > *"Permission Denied: Cashiers cannot add or modify product information. Switch to Store Operations Staff role."*
2. **Test Store Operations Staff Role Restrictions**:
   - Set the role to **Store Operations Staff (S001)**.
   - Go to the **Checkout / POS** tab and attempt to complete a checkout.
   - The application enforces the restriction:
     > *"Permission Denied: Only Cashiers can complete checkout operations."*
3. **Test Oversell Prevention (FR-10)**:
   - Select **Water Bottle (P003)** (Current stock: 8, Threshold: 10).
   - Enter quantity `15`.
   - Click **"Complete Checkout"** (or use the **"Demo: Test Oversell Scenario"** button).
   - Notice the application blocks the checkout with:
     > *"❌ Checkout Failed: Insufficient stock available. (Available: 8, Requested: 15)"*
   - Verify that the inventory count remains unchanged at 8.
