import React, { useState, useEffect } from "react";
import "./App.css";
import Admin from "./Admin";

function App() {
  const [view, setView] = useState("customer");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("grams");
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [bill, setBill] = useState([]);
  const [total, setTotal] = useState(null);
  const [billId, setBillId] = useState(null);
  const [billDate, setBillDate] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editItem, setEditItem] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("grams");
  const [shopName, setShopName] = useState("My Grocery Shop");
  const [ownerName, setOwnerName] = useState("Shop Owner");
  const [billHistory, setBillHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchAvailableItems();
    fetchBillHistory();
  }, []);

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/items");
      const data = await response.json();
      setAvailableItems(data);
    } catch (error) {
      console.error("Failed to fetch available items");
    }
  };

  const fetchBillHistory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/bills");
      const data = await response.json();
      setBillHistory(data);
    } catch (error) {
      console.error("Failed to fetch bill history");
    }
  };

  const addItem = () => {
    if (!item || !quantity) return;
    setItems([...items, { item, quantity: Number(quantity), unit }]);
    setItem("");
    setQuantity("");
    setUnit("grams");
  };

  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditItem(items[index].item);
    setEditQuantity(items[index].quantity.toString());
    setEditUnit(items[index].unit || "grams");
  };

  const saveEdit = () => {
    if (!editItem || !editQuantity) return;
    const updatedItems = [...items];
    updatedItems[editingIndex] = { item: editItem, quantity: Number(editQuantity), unit: editUnit };
    setItems(updatedItems);
    setEditingIndex(null);
    setEditItem("");
    setEditQuantity("");
    setEditUnit("grams");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditItem("");
    setEditQuantity("");
  };

  const printBill = () => {
    window.print();
  };

  const shareBill = () => {
    const billText = `Bill from ${shopName}\nOwner: ${ownerName}\nDate: ${billDate}\nBill ID: ${billId}\n\nItems:\n${bill.map(b => `${b.item} (${b.quantity} ${b.unit}): ₹${b.price}`).join('\n')}\n\nTotal: ₹${total}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(billText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const calculateBill = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items, shop_name: shopName, owner_name: ownerName }),
    });

    const data = await response.json();

    if (data.bill && Array.isArray(data.bill)) {
      setBill(data.bill);
      setTotal(data.total);
      setBillId(data.bill_id);
      setBillDate(data.bill_date);
      fetchBillHistory(); // Refresh bill history after saving new bill
    } else {
      alert(data.error || "Something went wrong");
      setBill([]);
      setTotal(null);
      setBillId(null);
      setBillDate(null);
    }
  } catch (error) {
    alert("Backend not reachable");
  }
};


  if (view === "admin") {
    return <Admin onBack={() => setView("customer")} />;
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>Grocery Billing App</h2>
        <button className="nav-button" onClick={() => setView("admin")}>
          Admin
        </button>
      </div>

      <div className="input-section">
        <input
          className="input-field"
          placeholder="Item name"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          list="item-suggestions"
        />
        <datalist id="item-suggestions">
          {availableItems.map((availableItem, index) => (
            <option key={index} value={availableItem.item_name} />
          ))}
        </datalist>

        <input
          className="input-field"
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <select
          className="input-field"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="grams">Grams</option>
          <option value="kg">Kg</option>
        </select>

        <button className="add-button" onClick={addItem}>Add Item</button>
      </div>

      <div className="items-section">
        <h3>Items</h3>
        <ul className="items-list">
          {items.map((i, index) => (
            <li key={index} className="item-row">
              {editingIndex === index ? (
                <>
                  <div className="edit-section">
                    <input
                      className="edit-input"
                      placeholder="Item name"
                      value={editItem}
                      onChange={(e) => setEditItem(e.target.value)}
                      list="edit-item-suggestions"
                    />
                    <datalist id="edit-item-suggestions">
                      {availableItems.map((availableItem, idx) => (
                        <option key={idx} value={availableItem.item_name} />
                      ))}
                    </datalist>
                    <input
                      className="edit-input"
                      type="number"
                      placeholder="Quantity"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                    />
                    <select
                      className="edit-input"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                    >
                      <option value="grams">Grams</option>
                      <option value="kg">Kg</option>
                    </select>
                    <button className="save-button" onClick={saveEdit}>Save</button>
                    <button className="cancel-button" onClick={cancelEdit}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span>
                    {i.item} - {i.quantity} {i.unit || 'g'}
                  </span>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => startEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteItem(index)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {items.length > 0 && (
        <button onClick={calculateBill}>Calculate Total</button>
      )}

      {bill && bill.length > 0 && (
        <div className="bill-section">
          <div className="bill-header">
            <h3>Bill #{billId}</h3>
            <p>Date: {billDate}</p>
            <p>Shop: {shopName} | Owner: {ownerName}</p>
          </div>
          <ul className="bill-list">
            {bill.map((b, index) => (
              <li key={index} className="bill-item">
                <span>{b.item} ({b.quantity} {b.unit})</span>
                <span>₹{b.price}</span>
              </li>
            ))}
          </ul>
          <h3 className="total-amount">Total: ₹{total}</h3>
          <div className="bill-actions">
            <button className="print-button" onClick={printBill}>Print Bill</button>
            <button className="share-button" onClick={shareBill}>Share Bill</button>
          </div>
        </div>
      )}

      <div className="history-section">
        <button className="nav-button" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide' : 'Show'} Bill History
        </button>
        {showHistory && (
          <div className="bill-history">
            <h3>Bill History</h3>
            <ul className="history-list">
              {billHistory.map((b, index) => (
                <li key={index} className="history-item">
                  <span>Bill #{b.id} - {b.shop_name}</span>
                  <span>{new Date(b.bill_date).toLocaleString()}</span>
                  <span>₹{b.total_amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
