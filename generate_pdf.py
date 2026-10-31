#!/usr/bin/env python3
"""
Generate a professional, publication-quality PDF document explaining
every single feature and function of the Campus Store Web Application.
"""

import sys
import os

# Add local libs containing reportlab
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".libs"))

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page count"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Campus Store Inventory & Sequential Checkout — System Documentation")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)

        self.drawString(54, 32, "College OJT Project  •  Live: https://naveenjaay55-cpu.github.io/OJT/")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()


def build_pdf(filename="Campus_Store_System_Full_Explanation.pdf"):
    pdf_path = os.path.join(os.path.dirname(__file__), filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#1e3a8a")     # Deep Blue
    SECONDARY = colors.HexColor("#0f766e")   # Teal
    ACCENT = colors.HexColor("#d97706")      # Amber
    DARK = colors.HexColor("#0f172a")        # Slate 900
    MUTED = colors.HexColor("#475569")       # Slate 600
    LIGHT_BG = colors.HexColor("#f8fafc")    # Slate 50
    BORDER = colors.HexColor("#cbd5e1")      # Slate 300
    SUCCESS = colors.HexColor("#16a34a")     # Emerald Green
    DANGER = colors.HexColor("#dc2626")      # Ruby Red

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=MUTED,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=DARK,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyBold_Custom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9")
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=body_style,
        fontSize=9,
        leading=13,
        textColor=PRIMARY
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=PRIMARY
    )

    story = []

    # =========================================================================
    # TITLE & METADATA BANNER
    # =========================================================================
    story.append(Paragraph("Campus Store Inventory & Sequential Checkout", title_style))
    story.append(Paragraph("Complete Technical Documentation, Function-by-Function Reference & User Guide", subtitle_style))

    # Meta Info Card Table
    meta_data = [
        [
            Paragraph("<b>Project:</b> College OJT Retail System", table_cell_style),
            Paragraph("<b>Architecture:</b> 2-Tier Modular Vanilla JS", table_cell_style)
        ],
        [
            Paragraph("<b>Live Website:</b> <font color='#1e3a8a'><u>https://naveenjaay55-cpu.github.io/OJT/</u></font>", table_cell_style),
            Paragraph("<b>GitHub:</b> <font color='#1e3a8a'><u>https://github.com/naveenjaay55-cpu/OJT</u></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Data Storage:</b> Browser LocalStorage (No DB needed)", table_cell_style),
            Paragraph("<b>Stretch Goal:</b> Python 3 Sequential Replay Script", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 1: SYSTEM OVERVIEW & ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("1. System Overview & Architecture", h1_style))
    story.append(Paragraph(
        "The Campus Store Inventory & Sequential Checkout web application is an enterprise-grade retail POS "
        "and inventory management prototype designed for campus stores. The application enforces a clean "
        "separation between presentation (DOM Manipulation & UI in <code>js/app.js</code>), business logic "
        "and security authorization (Service Layer in <code>js/services.js</code>), and persistence "
        "(Browser <code>localStorage</code>). Additionally, a standalone Python 3 verification script "
        "(<code>replay_checkout.py</code>) audits sequential transactions and asserts strict inventory integrity.",
        body_style
    ))

    arch_points = [
        ["Layer", "File", "Core Responsibility"],
        ["Presentation (UI)", "index.html / .html\ncss/styles.css\njs/app.js", "Renders POS cards, inventory tables, checkout form, receipt modals, toast alerts, steppers, and handles DOM user events."],
        ["Service & Security", "js/services.js", "Enforces the Section 9 Service Contract, executes the 11-step sequential checkout pipeline, enforces role security rules in JS logic, and guards invariants."],
        ["Persistence", "localStorage", "Maintains campus_store_products, campus_store_transactions, and campus_store_settings across page reloads and browser sessions."],
        ["Stretch Goal Audit", "replay_checkout.py", "Simulates offline sequential replay from sample-data.json, validating stock availability and testing 'assert product[stock] >= 0'."]
    ]
    arch_table_data = [[Paragraph(f"<b>{row[0]}</b>" if i==0 else row[0], table_header_style if i==0 else table_cell_bold),
                        Paragraph(f"<b>{row[1]}</b>" if i==0 else row[1].replace('\n', '<br/>'), table_header_style if i==0 else table_cell_style),
                        Paragraph(f"<b>{row[2]}</b>" if i==0 else row[2], table_header_style if i==0 else table_cell_style)]
                       for i, row in enumerate(arch_points)]
    arch_table = Table(arch_table_data, colWidths=[100, 130, 274])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 2: DUAL-ROLE SYSTEM & JAVASCRIPT ENFORCEMENT
    # =========================================================================
    story.append(Paragraph("2. Dual-Role Simulation & In-Depth Permission Enforcement", h1_style))
    story.append(Paragraph(
        "A key requirement of this project is that role-based permissions <b>cannot simply rely on hiding buttons</b>. "
        "The system enforces permissions directly inside the JavaScript application logic. If an unauthorized role invokes "
        "a restricted function programmatically, the function explicitly rejects the call and returns an error response.",
        body_style
    ))

    role_data = [
        ["Role Identity", "Allowed Capabilities", "Enforced Restrictions", "JS Enforcement Point"],
        ["Cashier\n(Terminal C001)", 
         "• View product catalog & stock<br/>• Select items for checkout<br/>• Enter purchase quantities<br/>• Complete sequential checkouts<br/>• Print transaction receipts",
         "• CANNOT add new products<br/>• CANNOT edit product info<br/>• CANNOT alter stock levels<br/>• CANNOT checkout > stock",
         "addProduct() & updateProduct() reject execution immediately with HTTP-like failure response if current role is Cashier."],
        ["Store Operations Staff\n(ID S001)",
         "• Catalog new products<br/>• Update pricing & names<br/>• Adjust stock quantities<br/>• Set low-stock alert limits<br/>• Delete obsolete inventory",
         "• CANNOT complete customer checkout transactions at POS terminal",
         "processCheckout() rejects execution immediately if current role is Store Staff, demanding switch to Cashier."]
    ]
    role_table_data = [[Paragraph(f"<b>{c}</b>", table_header_style) for c in role_data[0]]]
    for r in role_data[1:]:
        role_table_data.append([
            Paragraph(r[0].replace('\n', '<br/>'), table_cell_bold),
            Paragraph(r[1], table_cell_style),
            Paragraph(r[2], table_cell_style),
            Paragraph(r[3], table_cell_style)
        ])
    role_table = Table(role_table_data, colWidths=[90, 140, 134, 140])
    role_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(role_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 3: ONE-TO-ONE FEATURE BREAKDOWN (FR-01 to FR-14)
    # =========================================================================
    story.append(Paragraph("3. One-to-One Feature Breakdown (Requirements Traceability)", h1_style))
    story.append(Paragraph(
        "Each requirement from the project specification has been individually engineered, validated, and mapped:",
        body_style
    ))

    features = [
        ("FR-01: Product Catalog & Stock Display",
         "Must Have",
         "Displays all store inventory with Product ID, Name, Category, Unit Price, Available Quantity, and Stock Status. Available in responsive interactive visual cards and a filterable management table."),
        ("FR-02: Add Product",
         "Must Have",
         "Store Operations Staff can add new inventory items with unique Product IDs, names, categories, unit prices, initial stock, and low-stock thresholds. Validates ID uniqueness and positive numbers."),
        ("FR-03: Update Product & Restock",
         "Must Have",
         "Store Operations Staff can modify any existing product details, update prices, and restock quantities. Automatically updates the modified timestamp (updatedAt)."),
        ("FR-04: Select Product for Checkout",
         "Must Have",
         "Cashiers can select items for checkout in two intuitive ways: clicking directly on visual product cards in the POS grid, or picking from the quick-select dropdown list."),
        ("FR-05: Enter Purchase Quantity",
         "Must Have",
         "Cashiers can input purchase quantity with numeric controls or interactive decrement (-) and increment (+) steppers. Enforces whole positive integers (> 0)."),
        ("FR-06: Pre-Purchase Stock Validation",
         "Must Have",
         "The system compares the requested quantity against the currently available inventory before processing. If requested > available, checkout is blocked immediately."),
        ("FR-07: Dynamic Live Total Calculation",
         "Must Have",
         "Calculates Total Amount = Unit Price × Quantity in real time as the user types or clicks stepper buttons before checkout confirmation. Formatted to two decimal places."),
        ("FR-08: Complete Sequential Checkout",
         "Must Have",
         "Processes the purchase sequentially and atomically. Emits an immutable transaction record with a unique ID, cashier ID, timestamp, and creates a pop-up confirmation receipt."),
        ("FR-09: Automatic Stock Decrement",
         "Must Have",
         "Upon successful checkout, the purchased quantity is immediately deducted from product inventory. All UI cards, tables, badges, and summaries refresh in real time."),
        ("FR-10: Strict Oversell Prevention",
         "Must Have",
         "If requested purchase quantity exceeds available stock, checkout fails with a clear warning: 'Insufficient stock available (Available: X, Requested: Y)'. Crucially, stock remains untouched!"),
        ("FR-11: Visual Low-Stock Highlighting",
         "Must Have",
         "Products with available stock <= configured lowStockThreshold are visually distinguished with amber warning tags, animated pulsing dots, and highlighted table rows."),
        ("FR-12: Browser LocalStorage Persistence",
         "Must Have",
         "All product inventory, settings, and completed transactions persist in browser localStorage under designated keys. Data survives browser reloads, restarts, and closures."),
        ("FR-13: Sales Analytics & Summary Dashboard",
         "Good to Have",
         "Top KPI metric cards and an Analytics tab track total sales revenue, completed order count, total units sold, today's sales, average order value, and category revenue share."),
        ("FR-14: Historical Transaction Audit Log",
         "Good to Have",
         "Complete sequential audit log recording every completed checkout with Transaction ID, Date/Time, Product Name & SKU, Quantity, Unit Price, Total Paid, Cashier ID, and Status.")
    ]

    for title, priority, desc in features:
        story.append(Paragraph(f"<b>{title}</b> &nbsp;<font color='{'#1e3a8a' if 'Must' in priority else '#0f766e'}'>[{priority}]</font>", h3_style))
        story.append(Paragraph(desc, body_style))

    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 4: FUNCTION-BY-FUNCTION TECHNICAL REFERENCE
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Function-by-Function Technical Reference", h1_style))
    story.append(Paragraph(
        "This section explains in detail <b>which JavaScript and Python function does which work</b> across the codebase.",
        body_style
    ))

    # Part A: js/services.js
    story.append(Paragraph("4.1 Service Layer Functions (<code>js/services.js</code>)", h2_style))
    story.append(Paragraph(
        "The Service Layer implements the Section 9 Service Contract. It manages the in-memory cache, interacts with "
        "<code>localStorage</code>, enforces role-based restrictions, and implements business rules.",
        body_style
    ))

    service_funcs = [
        ("loadData()", "Loads persisted JSON data from localStorage keys (campus_store_products, campus_store_transactions, campus_store_settings). If first time or empty, automatically initializes with baseline sample data (P001 to P004)."),
        ("saveData()", "Serializes and persists in-memory product arrays, transaction history, and settings into localStorage. Returns success/failure status."),
        ("resetToSampleData()", "Wipes modified storage and restores pristine official sample data (Notebook P001, Blue Pen P002, Water Bottle P003, Chips Packet P004) and baseline transaction T001."),
        ("getCurrentRole()", "Returns the active simulated role ('cashier' or 'store_operations')."),
        ("setCurrentRole(role)", "Switches and persists the active role. Validates that the role string is either 'cashier' or 'store_operations'."),
        ("getActiveCashierId()", "Returns current cashier identifier string (default: 'C001')."),
        ("getActiveStaffId()", "Returns current store staff identifier string (default: 'S001')."),
        ("getProducts()", "Returns a deep-cloned array of all products currently in store inventory. Prevents external mutation of internal cache."),
        ("getProductById(productId)", "Finds and returns a single product object matching the given SKU/ID, or null if not found."),
        ("getLowStockProducts()", "Filters and returns an array of all products whose stock is at or below their lowStockThreshold (FR-11)."),
        ("addProduct(product)", "<b>Role Enforced (Store Staff Only):</b> Validates that the caller is Store Operations Staff. Validates that productId is unique, non-empty, and price/stock/threshold are non-negative numbers. Adds product to cache, saves to localStorage, and returns result."),
        ("updateProduct(productId, updates)", "<b>Role Enforced (Store Staff Only):</b> Validates Store Staff role. Finds target product, applies validated updates to name, category, price, stock, or threshold, updates updatedAt timestamp, and persists to localStorage."),
        ("deleteProduct(productId)", "<b>Role Enforced (Store Staff Only):</b> Removes an item from store inventory. Validates Store Staff role and updates localStorage."),
        ("processCheckout(productId, quantity, cashierId)", 
         "<b>Role Enforced (Cashier Only) & 11-Step Sequential Pipeline:</b><br/>"
         "1. Checks caller is Cashier.<br/>"
         "2. Finds product by productId in inventory.<br/>"
         "3. Verifies product existence.<br/>"
         "4. Validates quantity is a positive whole integer (&gt; 0).<br/>"
         "5. Compares requested quantity against available stock.<br/>"
         "6. <b>If insufficient stock:</b> Rejects checkout immediately; leaves stock 100% untouched; returns failure response.<br/>"
         "7. If sufficient: Computes totalAmount = price * quantity.<br/>"
         "8. Decrements product stock by quantity.<br/>"
         "9. Generates transaction object (T001, T002...) with timestamp and cashier ID.<br/>"
         "10. Persists updated inventory and transactions to localStorage.<br/>"
         "11. Returns standard success response with transaction details and remaining stock."),
        ("getTransactions()", "Returns a deep-cloned array of all recorded checkout transactions in reverse chronological order (latest first)."),
        ("getSalesSummary()", "Aggregates financial KPIs: total revenue, completed order count, units sold, today's sales, average order value, low-stock count, and out-of-stock count."),
        ("getSettings() & updateSettings(newSettings)", "Retrieves and updates store-level configuration (store name, currency symbol, default thresholds).")
    ]

    for fname, fdesc in service_funcs:
        story.append(Paragraph(f"<b><code>{fname}</code></b>", h3_style))
        story.append(Paragraph(fdesc, body_style))

    # Part B: js/app.js
    story.append(Spacer(1, 10))
    story.append(Paragraph("4.2 UI Controller Functions (<code>js/app.js</code>)", h2_style))
    story.append(Paragraph(
        "The UI Controller handles user interaction, event listeners, DOM rendering, modal dialogs, and connects the user interface to the Service Layer.",
        body_style
    ))

    ui_funcs = [
        ("initApp()", "Main initialization routine. Instantiates Bootstrap 5 modal objects (productModal, receiptModal, resetModal), binds all DOM event listeners, synchronizes role styling, and executes initial render of all tabs."),
        ("setupEventListeners()", "Attaches reactive DOM listeners: role selector dropdown change, POS search and category filter inputs, product dropdown selection, quantity +/- steppers, checkout button, oversell demo button, inventory filters, and modal form submissions."),
        ("syncRoleUI()", "Updates the visual role indicator in the top navbar and renders the dynamic Role Notice Card. Adjusts button states based on whether the active user is Cashier or Store Staff."),
        ("refreshAllViews()", "Master re-render trigger. Sequentially executes renderKPIs(), renderPOSProducts(), populateProductDropdown(), updateCheckoutSelectedProductUI(), renderInventoryTable(), renderHistoryTable(), and renderAnalyticsSummary()."),
        ("renderKPIs()", "Fetches latest metrics from getSalesSummary() and populates the 4 dashboard KPI cards. Dynamically applies red alert styling if low-stock count > 0."),
        ("renderPOSProducts()", "Generates interactive visual product cards for the POS view with real-time stock badges ('In Stock', 'Low Stock', 'Out of Stock') based on search text and category filters."),
        ("populateProductDropdown()", "Populates the `<select>` dropdown in the checkout form with current catalog items, unit prices, and stock indicators."),
        ("selectProduct(productId)", "Sets the globally active selectedProductId, highlights the selected card in the catalog grid, synchronizes the dropdown, and updates checkout form previews."),
        ("updateCheckoutSelectedProductUI()", "Renders the selected item's name, category, SKU, live unit price box, live available stock count, and stock threshold badge inside the checkout panel."),
        ("updateLiveCalculation()", "Computes and displays the live Total Amount before checkout (Price × Quantity). Displays an inline amber alert if the entered quantity exceeds currently available stock."),
        ("handleProcessCheckout()", "Validates input and dispatches processCheckout() to the service layer. On success, displays a toast notification, triggers the receipt modal, and resets quantity to 1. On rejection, displays clear error feedback."),
        ("handleTestOversell()", "Demonstration helper for college evaluators. Automatically populates the quantity field with (available stock + 5), allowing one-click testing of FR-10 oversell rejection."),
        ("showReceiptModal(transaction, remainingStock)", "Populates and opens the Bootstrap Receipt Modal with transaction ID, cashier ID, item details, amount paid, and updated remaining stock."),
        ("renderInventoryTable()", "Populates the Product Inventory Management table. Applies row-level warning backgrounds (row-low-stock) and badges. Includes Edit/Restock and Delete action buttons."),
        ("openAddProductModal()", "Checks that the active role is Store Operations Staff (blocking cashiers). Resets form fields, auto-generates the next sequential SKU (e.g. P005), and shows the Add Product modal."),
        ("openEditProductModal(productId)", "Checks Store Staff authorization. Loads existing product data into modal fields with read-only Product ID, allowing safe modification of price, stock, category, or thresholds."),
        ("handleProductFormSubmit(e)", "Intercepts form submission, parses numeric values, and calls addProduct() or updateProduct() in the service layer. Handles error display or closes modal on success."),
        ("handleDeleteProduct(productId)", "Prompts for confirmation and deletes a product from inventory (Store Staff only)."),
        ("renderHistoryTable()", "Renders the historical table of completed transactions with date/time, product SKU, cashier, quantity, unit price, total, and status badges."),
        ("renderAnalyticsSummary()", "Computes and populates category-by-category inventory stock and revenue share progress bars in the Analytics tab."),
        ("showToast(title, message, type)", "Creates and displays animated Bootstrap 5 floating toast notifications for success, warning, or error events."),
        ("escapeHtml(str)", "Security utility to sanitize text strings before rendering into innerHTML, preventing Cross-Site Scripting (XSS).")
    ]

    for fname, fdesc in ui_funcs:
        story.append(Paragraph(f"<b><code>{fname}</code></b>", h3_style))
        story.append(Paragraph(fdesc, body_style))

    # Part C: replay_checkout.py
    story.append(Spacer(1, 10))
    story.append(Paragraph("4.3 Python Replay Script Functions (<code>replay_checkout.py</code>)", h2_style))
    story.append(Paragraph(
        "The Stretch Goal Python script demonstrates backend verification, atomic inventory reduction, and assertion checking.",
        body_style
    ))

    py_funcs = [
        ("load_data(filepath)", "Reads sample-data.json from disk, parses products and transactions, and validates JSON file integrity."),
        ("run_replay(custom_transactions=None)", 
         "Main sequential transaction replay engine:<br/>"
         "• Loads products into an in-memory dictionary keyed by productId.<br/>"
         "• Replays checkout transactions one-by-one in sequential order.<br/>"
         "• Verifies product existence and validates positive integer quantity.<br/>"
         "• Compares requested quantity against available stock.<br/>"
         "• If quantity > stock: Rejects transaction, logs reason, and leaves stock unchanged.<br/>"
         "• If stock sufficient: Deducts stock, adds to total sales, and records successful transaction.<br/>"
         "• <b>Assertion Check:</b> Executes <code>assert product['stock'] &gt;= 0</code> after every transaction.<br/>"
         "• Prints a complete terminal audit report detailing successful transactions, rejected transactions, and final inventory.")
    ]

    for fname, fdesc in py_funcs:
        story.append(Paragraph(f"<b><code>{fname}</code></b>", h3_style))
        story.append(Paragraph(fdesc, body_style))

    # =========================================================================
    # SECTION 5: DATA SCHEMAS & ENTITIES
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Data Models & Entity Schemas", h1_style))
    story.append(Paragraph(
        "The application models two primary entities: <b>Product</b> and <b>Transaction</b>, formatted as standard JSON objects.",
        body_style
    ))

    story.append(Paragraph("5.1 Product Entity Schema", h2_style))
    prod_schema = [
        ["Field", "Type", "Example", "Description"],
        ["productId", "String", '"P001"', "Unique catalog SKU identifier."],
        ["name", "String", '"Notebook"', "Display name of the product."],
        ["category", "String", '"Stationery"', "Category (Stationery, Snacks, Accessories, etc.)."],
        ["price", "Number", "60.00", "Selling price per single unit in INR."],
        ["stock", "Number", "50", "Current available inventory count."],
        ["lowStockThreshold", "Number", "10", "Threshold at/below which low-stock highlight activates."],
        ["createdAt", "String", '"2026-10-30T09:00:00Z"', "ISO timestamp of product catalog creation."],
        ["updatedAt", "String", '"2026-10-30T10:30:00Z"', "ISO timestamp of last price or stock update."]
    ]
    p_table_data = [[Paragraph(f"<b>{c}</b>", table_header_style) for c in prod_schema[0]]]
    for r in prod_schema[1:]:
        p_table_data.append([
            Paragraph(f"<code>{r[0]}</code>", table_cell_bold),
            Paragraph(r[1], table_cell_style),
            Paragraph(f"<code>{r[2]}</code>", table_cell_style),
            Paragraph(r[3], table_cell_style)
        ])
    p_table = Table(p_table_data, colWidths=[95, 65, 120, 224])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(p_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("5.2 Transaction Entity Schema", h2_style))
    tx_schema = [
        ["Field", "Type", "Example", "Description"],
        ["transactionId", "String", '"T001"', "Unique sequential transaction identifier."],
        ["productId", "String", '"P001"', "Reference SKU to purchased product."],
        ["productName", "String", '"Notebook"', "Product name at purchase (preserves historical record)."],
        ["quantity", "Number", "2", "Number of units purchased in transaction."],
        ["unitPrice", "Number", "60.00", "Unit price at time of purchase."],
        ["totalAmount", "Number", "120.00", "Total amount paid (quantity × unitPrice)."],
        ["cashierId", "String", '"C001"', "Identifier of cashier who processed checkout."],
        ["createdAt", "String", '"2026-10-30T10:30:00Z"', "ISO timestamp of checkout completion."],
        ["status", "String", '"SUCCESS"', "Transaction status ('SUCCESS' or 'REJECTED')."]
    ]
    tx_table_data = [[Paragraph(f"<b>{c}</b>", table_header_style) for c in tx_schema[0]]]
    for r in tx_schema[1:]:
        tx_table_data.append([
            Paragraph(f"<code>{r[0]}</code>", table_cell_bold),
            Paragraph(r[1], table_cell_style),
            Paragraph(f"<code>{r[2]}</code>", table_cell_style),
            Paragraph(r[3], table_cell_style)
        ])
    tx_table = Table(tx_table_data, colWidths=[95, 65, 120, 224])
    tx_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tx_table)

    # =========================================================================
    # SECTION 6: EVALUATOR STEP-BY-STEP TEST GUIDE
    # =========================================================================
    story.append(Spacer(1, 14))
    story.append(Paragraph("6. Evaluator Step-by-Step Testing Guide", h1_style))
    story.append(Paragraph(
        "Follow these quick demonstration scenarios to test and grade every required capability:",
        body_style
    ))

    test_steps = [
        ("Test 1: Normal Cashier Checkout (FR-04 to FR-09)",
         "1. Ensure Role is set to <b>Cashier (C001)</b> in top navbar.<br/>"
         "2. Select <b>Notebook (P001)</b>. Unit price ₹60.00 and stock (50) display automatically.<br/>"
         "3. Enter quantity <b>2</b>. Notice live total updates to <b>₹120.00</b>.<br/>"
         "4. Click <b>'Complete Checkout'</b>.<br/>"
         "5. Pop-up receipt appears showing order confirmation. Stock decrements to <b>48</b> immediately."),
        ("Test 2: Oversell Prevention Verification (FR-06 & FR-10)",
         "1. Select <b>Water Bottle (P003)</b> (Stock: 8).<br/>"
         "2. Click the <b>'Demo: Test Oversell Scenario'</b> button (sets quantity to 13).<br/>"
         "3. Click <b>'Complete Checkout'</b>.<br/>"
         "4. System rejects purchase with clear red alert: <i>'Insufficient stock available. (Available: 8, Requested: 13)'</i>.<br/>"
         "5. Check inventory: stock remains safely untouched at <b>8 units</b>!"),
        ("Test 3: Role Security Enforcement in JavaScript",
         "1. While in <b>Cashier</b> mode, switch to the <b>Product Inventory</b> tab and click <b>'Add New Product'</b>.<br/>"
         "2. The JavaScript logic blocks the modal and fires a red permission alert.<br/>"
         "3. Switch role to <b>Store Operations Staff (S001)</b>.<br/>"
         "4. Now click <b>'Add New Product'</b>: the modal opens cleanly and allows adding items.<br/>"
         "5. Switch to <b>Checkout / POS</b> tab and click checkout: blocked with permission alert (Cashier only)."),
        ("Test 4: Low-Stock Visual Highlighting (FR-11)",
         "1. Notice <b>Water Bottle (P003)</b> has stock 8 and threshold 10.<br/>"
         "2. It features an amber warning tag, animated pulsing indicator, and highlighted yellow row.<br/>"
         "3. Low Stock Alert KPI card at top highlights in red."),
        ("Test 5: Run Python Sequential Replay Script (Stretch Goal)",
         "Open terminal in the project directory and run:<br/>"
         "<code>python3 replay_checkout.py</code><br/>"
         "The script replays transactions sequentially, verifies stock decrements, asserts <code>assert product['stock'] >= 0</code>, and outputs a formatted audit summary table.")
    ]

    for title, desc in test_steps:
        story.append(Paragraph(f"<b>{title}</b>", h3_style))
        story.append(Paragraph(desc, body_style))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_pdf()
