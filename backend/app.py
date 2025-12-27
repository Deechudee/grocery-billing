from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json


app = Flask(__name__)
CORS(app)
# MySQL connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="deeChu@2004",
        database="grocery_db"
    )
db = get_db_connection()

cursor = db.cursor(dictionary=True)

@app.route("/items", methods=["GET"])
def get_items():
    cursor.execute("SELECT item_name, price_per_kg FROM items")
    items = cursor.fetchall()
    return jsonify(items)

@app.route("/items", methods=["POST"])
def add_item():
    data = request.json
    item_name = data.get("item_name")
    price_per_kg = data.get("price_per_kg")

    if not item_name or not price_per_kg:
        return jsonify({"error": "Item name and price are required"}), 400

    try:
        cursor.execute(
            "INSERT INTO items (item_name, price_per_kg) VALUES (%s, %s)",
            (item_name, price_per_kg)
        )
        db.commit()
        return jsonify({"message": "Item added successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400

@app.route("/items/<item_name>", methods=["DELETE"])
def delete_item(item_name):
    cursor.execute("DELETE FROM items WHERE item_name = %s", (item_name,))
    db.commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"message": "Item deleted successfully"})

@app.route("/calculate", methods=["POST"])
def calculate_total():
    data = request.json
    items = data.get("items", [])


    bill = []
    total_amount = 0
    bill_date = request.json.get("bill_date")  # Optional, can be sent from frontend

    for entry in items:
        item_name = entry["item"].lower()
        quantity = entry["quantity"]
        unit = entry.get("unit", "grams")  # Default to grams

        cursor.execute(
            "SELECT price_per_kg FROM items WHERE item_name = %s",
            (item_name,)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": f"{item_name} not found"}), 400

        price_per_kg = result["price_per_kg"]
        if unit == "kg":
            price = price_per_kg * quantity
        else:  # grams
            price = (price_per_kg / 1000) * quantity

        bill.append({
            "item": item_name,
            "quantity": quantity,
            "unit": unit,
            "price": round(price, 2)
        })

        total_amount += price

    # Save bill to database
    try:
        cursor.execute(
    "INSERT INTO bills (bill_data, total_amount) VALUES (%s, %s)",
    (json.dumps(bill), round(total_amount, 2))
)
        db.commit()
        bill_id = cursor.lastrowid
    except mysql.connector.Error as err:
        return jsonify({"error": f"Failed to save bill: {str(err)}"}), 500

    return jsonify({
        "bill_id": bill_id,
        "bill": bill,
        "total": round(total_amount, 2),
        "bill_date": bill_date or "now"
    })
@app.route("/")
def home():
    return "Grocery Billing Backend Running 🚀"


@app.route("/bills", methods=["GET"])
def get_bills():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, bill_data, total_amount, created_at FROM bills ORDER BY created_at DESC"
    )
    bills = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(bills)

@app.route("/bills/<int:bill_id>", methods=["GET"])
def get_bill(bill_id):
    cursor.execute("SELECT * FROM bills WHERE id = %s", (bill_id,))
    bill = cursor.fetchone()
    if not bill:
        return jsonify({"error": "Bill not found"}), 404
    return jsonify(bill)


if __name__ == "__main__":
    app.run(debug=True)
