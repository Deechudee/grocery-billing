import React, { useState } from "react";

function App() {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState([]);
  const [bill, setBill] = useState([]);
  const [total, setTotal] = useState(null);

  const addItem = () => {
    if (!item || !quantity) return;
    setItems([...items, { item, quantity: Number(quantity) }]);
    setItem("");
    setQuantity("");
  };

  const calculateBill = async () => {
    const response = await fetch("http://127.0.0.1:5000/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    const data = await response.json();
    setBill(data.bill);
    setTotal(data.total);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Grocery Billing App</h2>

      <input
        placeholder="Item name"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />

      <input
        type="number"
        placeholder="Quantity (grams)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <button onClick={addItem}>Add Item</button>

      <h3>Items</h3>
      <ul>
        {items.map((i, index) => (
          <li key={index}>
            {i.item} - {i.quantity} g
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <button onClick={calculateBill}>Calculate Total</button>
      )}

      {bill.length > 0 && (
        <>
          <h3>Bill</h3>
          <ul>
            {bill.map((b, index) => (
              <li key={index}>
                {b.item}: ₹{b.price}
              </li>
            ))}
          </ul>
          <h3>Total: ₹{total}</h3>
        </>
      )}
    </div>
  );
}

export default App;
