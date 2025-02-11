import React, { useState, useEffect } from "react";

//url
const API_BASE_URL = "http://localhost:3001/api";

const ExpenseTracker = () => {
  //set the states
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchExpenses(), fetchCategories()]);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch expenses from db
  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`);
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  };

  // Fetch categories from db
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: data[0].name }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  // Update summary whenever expenses or categories change
  useEffect(() => {
    const newSummary = categories.map((category) => {
      const categoryExpenses = expenses.filter(
        (e) => e.category === category.name
      );
      return {
        category: category.name,
        total: categoryExpenses.reduce((sum, e) => sum + Number(e.amount), 0),
        count: categoryExpenses.length,
      };
    });
    setSummary(newSummary);
  }, [expenses, categories]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (selectedExpense) {
        // Update existing expense
        const response = await fetch(
          `${API_BASE_URL}/expenses/${selectedExpense.expense_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        if (!response.ok) throw new Error("Failed to update expense");
      } else {
        // Add new expense
        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Failed to add expense");
      }

      // Refresh expenses
      await fetchExpenses();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error saving expense:", error);
      setError("Failed to save expense. Please try again.");
    }
  };

  // delete expenses
  const handleDelete = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      setError("Failed to delete expense. Please try again.");
    }
  };

  //edit expenses
  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date,
    });
    setShowForm(true);
  };

  //resets the form
  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      category: categories[0]?.name || "",
      date: new Date().toISOString().split("T")[0],
    });
    setSelectedExpense(null);
    setError(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  //creating the table that includes the functionality with teh database
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {error && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Expense Tracker
        </h1>
        {/* button to show form to create expense */}
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Expense
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div
          style={{
            marginBottom: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          {/* displays depending on whether we are adding or editing expense */}
          <h2>{selectedExpense ? "Edit Expense" : "Add New Expense"}</h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div>
              <label>Amount: </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                //each form input will update the state
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                style={{ marginLeft: "10px", padding: "4px" }}
              />
            </div>
            <div>
              <label>Description: </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                style={{ marginLeft: "10px", padding: "4px" }}
              />
            </div>
            <div>
              <label>Category: </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                style={{ marginLeft: "10px", padding: "4px" }}
              >
                {categories.map((category) => (
                  <option key={category.category_id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Date: </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                style={{ marginLeft: "10px", padding: "4px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {selectedExpense ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              Date
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              Category
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "right",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              Amount
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "right",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {/* maps expenses and fills out the table */}
          {expenses.map((expense) => (
            <tr
              key={expense.expense_id}
              style={{ borderBottom: "1px solid #dee2e6" }}
            >
              <td style={{ padding: "12px" }}>{expense.date}</td>
              <td style={{ padding: "12px" }}>{expense.description}</td>
              <td style={{ padding: "12px" }}>{expense.category}</td>
              <td style={{ padding: "12px", textAlign: "right" }}>
                ${Number(expense.amount).toFixed(2)}
              </td>
              <td style={{ padding: "12px", textAlign: "right" }}>
                <button
                  //edit button. calls the handleEdit function
                  onClick={() => handleEdit(expense)}
                  style={{
                    marginRight: "8px",
                    padding: "4px 8px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  //deletes an expense from the db
                  onClick={() => handleDelete(expense.expense_id)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      {/* displays the categories, total amounts spent per category, and the transaction count per category */}
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>
          Category Summary
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                Total Amount
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "right",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                Transaction Count
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr
                key={item.category}
                style={{ borderBottom: "1px solid #dee2e6" }}
              >
                <td style={{ padding: "12px" }}>{item.category}</td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  ${item.total.toFixed(2)}
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTracker;
