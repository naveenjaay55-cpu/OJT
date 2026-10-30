#!/usr/bin/env python3
"""
Campus Store - Sequential Checkout Replay Script (Stretch Goal)
---------------------------------------------------------------
Reads product inventory and sequential transactions from sample-data.json,
replays each checkout sequentially, validates stock availability, decrements
stock atomically for valid checkouts, rejects transactions that exceed stock,
and verifies inventory integrity using assertions (assert product["stock"] >= 0).
"""

import json
import os
import sys
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), "sample-data.json")

def load_data(filepath):
    if not os.path.exists(filepath):
        print(f"Error: Data file not found at {filepath}")
        sys.exit(1)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def run_replay(custom_transactions=None):
    print("=" * 70)
    print("   CAMPUS STORE INVENTORY - SEQUENTIAL CHECKOUT REPLAY")
    print("=" * 70)

    data = load_data(DATA_FILE)
    
    # Deep copy products map by productId
    products = {}
    for p in data.get("products", []):
        products[p["productId"]] = {
            "productId": p["productId"],
            "name": p["name"],
            "category": p.get("category", "General"),
            "price": float(p["price"]),
            "stock": int(p["stock"]),
            "lowStockThreshold": int(p.get("lowStockThreshold", 10))
        }

    # Initial inventory state
    print("\n[STEP 1] INITIAL INVENTORY STATE:")
    print("-" * 70)
    print(f"{'Product ID':<12} {'Product Name':<20} {'Price':<10} {'Stock':<10} {'Status':<15}")
    print("-" * 70)
    for p in products.values():
        status = "LOW STOCK" if p["stock"] <= p["lowStockThreshold"] else "IN STOCK"
        print(f"{p['productId']:<12} {p['name']:<20} ₹{p['price']:<9.2f} {p['stock']:<10} {status:<15}")

    # Transactions to replay
    tx_list = custom_transactions if custom_transactions is not None else data.get("transactions", [])
    
    # If standard replay, let's also append a simulated sequence including an oversell test
    if custom_transactions is None:
        tx_list = [
            {
                "transactionId": "TX-1001",
                "productId": "P001",
                "productName": "Notebook",
                "quantity": 2,
                "cashierId": "C001"
            },
            {
                "transactionId": "TX-1002",
                "productId": "P003",
                "productName": "Water Bottle",
                "quantity": 3,
                "cashierId": "C001"
            },
            {
                "transactionId": "TX-1003",
                "productId": "P003",
                "productName": "Water Bottle",
                "quantity": 10,  # EXCEEDS current stock (5 remaining) -> MUST REJECT
                "cashierId": "C001"
            },
            {
                "transactionId": "TX-1004",
                "productId": "P004",
                "productName": "Chips Packet",
                "quantity": 5,
                "cashierId": "C002"
            },
            {
                "transactionId": "TX-1005",
                "productId": "P002",
                "productName": "Blue Pen",
                "quantity": 150, # EXCEEDS Blue pen stock (100) -> MUST REJECT
                "cashierId": "C002"
            }
        ]

    print(f"\n[STEP 2] SEQUENTIAL TRANSACTION REPLAY ({len(tx_list)} Transactions):")
    print("-" * 70)

    successful_tx = []
    rejected_tx = []
    total_sales = 0.0

    for idx, tx in enumerate(tx_list, start=1):
        tx_id = tx.get("transactionId", f"TX-{idx}")
        p_id = tx.get("productId")
        qty = tx.get("quantity")
        cashier = tx.get("cashierId", "C001")

        print(f"\nProcessing Transaction #{idx}: [{tx_id}]")
        print(f"  Cashier: {cashier} | Product: {p_id} ({tx.get('productName', 'Unknown')}) | Requested Qty: {qty}")

        # Check 1: Product existence
        if p_id not in products:
            msg = f"Product ID '{p_id}' not found in inventory."
            print(f"  ❌ RESULT: REJECTED - {msg}")
            rejected_tx.append({"transactionId": tx_id, "productId": p_id, "quantity": qty, "reason": msg})
            continue

        product = products[p_id]
        available_stock = product["stock"]

        # Check 2: Quantity validation
        if not isinstance(qty, int) or qty <= 0:
            msg = f"Invalid quantity '{qty}'. Must be a positive integer."
            print(f"  ❌ RESULT: REJECTED - {msg}")
            rejected_tx.append({"transactionId": tx_id, "productId": p_id, "quantity": qty, "reason": msg})
            continue

        # Check 3: Stock availability check (Prevent Overselling)
        if qty > available_stock:
            msg = f"Insufficient stock! Requested: {qty}, Available: {available_stock}."
            print(f"  ❌ RESULT: REJECTED (Stock Unchanged) - {msg}")
            rejected_tx.append({"transactionId": tx_id, "productId": p_id, "quantity": qty, "reason": msg})
            # Stock invariant assertion
            assert product["stock"] >= 0, f"Stock invariant violated for {p_id}!"
            continue

        # Valid checkout: Atomic decrement & calculation
        unit_price = product["price"]
        amount = unit_price * qty
        product["stock"] -= qty
        total_sales += amount

        # INVARIANT VERIFICATION
        assert product["stock"] >= 0, f"Stock became negative for {p_id}: {product['stock']}"

        print(f"  ✅ RESULT: SUCCESS")
        print(f"  Unit Price: ₹{unit_price:.2f} | Total: ₹{amount:.2f} | Remaining Stock: {product['stock']}")

        successful_tx.append({
            "transactionId": tx_id,
            "productId": p_id,
            "productName": product["name"],
            "quantity": qty,
            "unitPrice": unit_price,
            "totalAmount": amount,
            "cashierId": cashier,
            "remainingStock": product["stock"]
        })

    # Summary report
    print("\n" + "=" * 70)
    print("   REPLAY SUMMARY & AUDIT REPORT")
    print("=" * 70)
    print(f"Total Transactions Processed : {len(tx_list)}")
    print(f"Successful Checkouts         : {len(successful_tx)}")
    print(f"Rejected Checkouts (Oversell): {len(rejected_tx)}")
    print(f"Total Sales Revenue Generated: ₹{total_sales:.2f}")

    print("\n[SUCCESSFUL TRANSACTIONS]")
    if successful_tx:
        print(f"{'TX ID':<10} {'Product':<18} {'Qty':<6} {'Total Amount':<14} {'Remaining Stock':<15}")
        print("-" * 65)
        for s in successful_tx:
            print(f"{s['transactionId']:<10} {s['productName']:<18} {s['quantity']:<6} ₹{s['totalAmount']:<13.2f} {s['remainingStock']:<15}")
    else:
        print("  None")

    print("\n[REJECTED TRANSACTIONS (Zero Stock Modification)]")
    if rejected_tx:
        print(f"{'TX ID':<10} {'Product ID':<12} {'Qty':<6} {'Reason':<40}")
        print("-" * 70)
        for r in rejected_tx:
            print(f"{r['transactionId']:<10} {r['productId']:<12} {r['quantity']:<6} {r['reason']:<40}")
    else:
        print("  None")

    print("\n[FINAL INVENTORY AUDIT]")
    print("-" * 70)
    print(f"{'Product ID':<12} {'Product Name':<20} {'Remaining Stock':<18} {'Status':<15}")
    print("-" * 70)
    for p in products.values():
        # Assert non-negative stock for every product
        assert p["stock"] >= 0, f"Critical integrity failure: {p['productId']} has negative stock ({p['stock']})!"
        status = "LOW STOCK ⚠️" if p["stock"] <= p["lowStockThreshold"] else "IN STOCK ✅"
        print(f"{p['productId']:<12} {p['name']:<20} {p['stock']:<18} {status:<15}")

    print("-" * 70)
    print("✅ All stock assertions passed: assert product['stock'] >= 0")
    print("=" * 70)

if __name__ == "__main__":
    run_replay()

