from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)
# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="deeChu@2004",
    database="grocery_db"
)

cursor = db.cursor(dictionary=True)

@app.route("/calculate", methods=["POST"])
def calculate_total():
    data = request.json
    items = data.get("items", [])

    bill = []
    total_amount = 0

    for entry in items:
        item_name = entry["item"].lower()
        quantity = entry["quantity"]

        cursor.execute(
            "SELECT price_per_kg FROM items WHERE item_name = %s",
            (item_name,)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": f"{item_name} not found"}), 400

        price_per_kg = result["price_per_kg"]
        price = (price_per_kg / 1000) * quantity

        bill.append({
            "item": item_name,
            "quantity": quantity,
            "price": round(price, 2)
        })

        total_amount += price

    return jsonify({
        "bill": bill,
        "total": round(total_amount, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)
