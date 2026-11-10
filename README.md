# 🏫 Campus Store Inventory & Sequential Checkout System

A lightweight, robust, enterprise-grade retail inventory and sequential POS web application designed and implemented for the **College On-the-Job Training (OJT) Project**.

---

## 🌐 Quick Links & Access

| Resource | URL / Access Path | Description |
|---|---|---|
| 🚀 **Live Deployed App** | **[https://naveenjaay55-cpu.github.io/OJT/](https://naveenjaay55-cpu.github.io/OJT/)** | Publicly accessible GitHub Pages deployment. Open on any browser or mobile device. |
| 💻 **Localhost Server** | **[http://localhost:8080](http://localhost:8080)** | Local Python development server running on port `8080`. |
| 📂 **GitHub Repository** | **[https://github.com/naveenjaay55-cpu/OJT](https://github.com/naveenjaay55-cpu/OJT)** | Full source code, git commit history, and automated deployment workflows. |
| 📄 **Quick Summary PDF** | **[`Campus_Store_Quick_Summary.pdf`](Campus_Store_Quick_Summary.pdf)** | Compact 1-page cheatsheet of all features and functions. |
| 📚 **Complete Docs PDF** | **[`Campus_Store_System_Full_Explanation.pdf`](Campus_Store_System_Full_Explanation.pdf)** | Comprehensive 9-page technical documentation and function reference. |

---

## 🌟 Key Highlights & Architecture

- **Standalone Welcome Screen & Navigation Flow**:
  - **Welcome Page:** Dedicated entrance portal with live system status (`● System Online • Invariant Guard Active`), terminal station cards, and evaluator quick-test shortcuts.
  - **Main Dashboard:** Features the POS checkout terminal, product inventory table, sales history, and analytics.
  - **Back Button:** Prominent **`[← Back to Welcome]`** button in the main navbar allows 1-click navigation back to the welcome page anytime.
- **Dual-Role Architecture (Enforced in JavaScript Logic)**:
  - **Cashier (`C001`)**: Selects items, validates stock, calculates purchase totals live, completes checkouts, and prints receipts. *Cannot add/edit products or oversell stock.*
  - **Store Operations Staff (`S001`)**: Catalogs new items, updates pricing, restocks quantities, and sets alert thresholds. *Cannot process checkouts.*
  - *Note:* Role restrictions are not merely hidden buttons; they are strictly enforced inside `services.js`.
- **Sequential Checkout Logic & Zero-Oversell Guarantee (FR-04 to FR-10)**:
  - Strict 11-step sequential checkout processing pipeline.
  - Prevents overselling: If requested quantity > available inventory, checkout is rejected immediately with zero modification to stock.
- **Visual Low-Stock Radar (FR-11)**:
  - Visual badges, animated pulse indicators, warning rows, and filter toggles highlight products with stock $\le$ configured `lowStockThreshold`.
- **Client-Side Persistence (FR-12)**:
  - Pure browser `localStorage` architecture across standardized keys:
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
- **Business Logic & Services**: Vanilla JavaScript (Modular service pattern in `js/services.js` and UI controller in `js/app.js`)
- **Data Persistence**: Browser `localStorage`
- **Stretch Goal Backend Script**: Python 3.9+ (`replay_checkout.py`)

---

## 📂 Project Directory Structure

```text
OJT project/
├── index.html                               # Main web application entry point
├── .html                                    # Synchronized application file
├── sample-data.json                         # Baseline sample products and transactions
├── replay_checkout.py                       # Python 3 sequential replay & assertion script
├── Campus_Store_Quick_Summary.pdf           # 1-page quick reference PDF
├── Campus_Store_System_Full_Explanation.pdf  # 9-page comprehensive technical manual
├── css/
│   └── styles.css                           # Custom styles, badges, and animations
├── js/
│   ├── services.js                          # Section 9 Service Contract & role rules
│   └── app.js                               # UI controller, event handlers, and modals
└── README.md                                # Project documentation with live links
```

---

## 🚀 How to Run the Web Application

### Option 1: Live Public Deployment (Recommended)
Open directly in any web browser:  
👉 **[https://naveenjaay55-cpu.github.io/OJT/](https://naveenjaay55-cpu.github.io/OJT/)**

### Option 2: Localhost Development Web Server
To run locally on port `8080`:
```bash
cd "OJT project"
python3 -m http.server 8080
```
Then visit in your browser:  
👉 **[http://localhost:8080](http://localhost:8080)** (or `http://127.0.0.1:8080`)

### Option 3: Direct File Access
Simply double-click `index.html` on your computer or open:  
`file:///Users/naveenchoudhary/Documents/College/OJT%20project/index.html`

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

## 🧪 Evaluator Step-by-Step Test Scenarios

1. **Test Normal Purchase (FR-04 to FR-09)**:
   - On the Welcome Page, click **"1. Normal Purchase"** in the Quick-Test Sandbox (or click **"Enter Cashier Station"**).
   - Notebook `P001` is selected with quantity 2 (Total: ₹120.00).
   - Click **"Complete Checkout"**. Stock decreases from 50 to 48 and an order receipt appears.
2. **Test Oversell Prevention (FR-10)**:
   - On the Welcome Page, click **"2. Oversell Protection"**.
   - Water Bottle `P003` (Stock: 8) is selected with quantity 15.
   - Click **"Complete Checkout"**.
   - The transaction is rejected with error: *"Insufficient stock available. (Available: 8, Requested: 15)"*.
   - Stock remains untouched at 8.
3. **Test Role Security Enforcement in JavaScript**:
   - While in **Cashier** mode, switch to the *Product Inventory* tab and try to add or edit a product. The JavaScript logic blocks the action with a permission alert.
   - Switch role to **Store Operations Staff**. Try to complete checkout on the POS tab; it is blocked (Cashier only).
4. **Test Low-Stock Visual Highlighting (FR-11)**:
   - Water Bottle `P003` has stock 8 and threshold 10.
   - It is displayed with an amber warning badge, a pulsing indicator, and highlighted row in the inventory table.
5. **Test Returning to Welcome Page**:
   - At any time in the main dashboard, click **`[← Back to Welcome]`** in the top navigation bar to return to the landing portal.
