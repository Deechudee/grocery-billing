import React, { useState, useEffect } from "react";
import "./App.css";

function Admin({ onBack }) {
  const [itemName, setItemName] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      setMessage("Failed to fetch items");
    }
  };

  const addItem = async () => {
    if (!itemName || !pricePerKg) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_name: itemName,
          price_per_kg: parseFloat(pricePerKg),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Item added successfully");
        setItemName("");
        setPricePerKg("");
        fetchItems();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Failed to add item");
    }
  };

  const deleteItem = async (itemName) => {
    if (!window.confirm(`Delete ${itemName}?`)) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/items/${itemName}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Item deleted successfully");
        fetchItems();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Failed to delete item");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>Grocery Shop Admin</h2>
        <button className="nav-button" onClick={onBack}>
          Back to Billing
        </button>
      </div>

      <div className="input-section">
        <input
          className="input-field"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          list="item-suggestions"
        />
        <datalist id="item-suggestions">
          {items.map((item, index) => (
            <option key={index} value={item.item_name} />
          ))}
        </datalist>

        <input
          className="input-field"
          type="number"
          placeholder="Price per kg"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <button className="add-button" onClick={addItem}>
          Add Item
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="items-section">
        <h3>Items</h3>
        {items.length === 0 ? (
          <p>No items added yet</p>
        ) : (
          <ul className="items-list">
            {items.map((item, index) => (
              <li key={index} className="item-row">
                <span>
                  {item.item_name} - ₹{item.price_per_kg} / kg
                </span>
                <button
                  className="delete-button"
                  onClick={() => deleteItem(item.item_name)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Admin;
