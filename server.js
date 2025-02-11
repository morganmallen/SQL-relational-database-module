const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database("expenses.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
    createTables();
  }
});

// Create categories and expenses tables if they don't exist
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories(category_id)
    )
  `);

  // Insert default categories
  const defaultCategories = [
    "Food",
    "Transportation",
    "Housing",
    "Entertainment",
    "Utilities",
  ];
  defaultCategories.forEach((category) => {
    db.run("INSERT OR IGNORE INTO categories (name) VALUES (?)", [category]);
  });
}

// API Endpoints

// Get all expenses with category names
app.get("/api/expenses", (req, res) => {
  const query = `
    SELECT e.expense_id, e.amount, e.description, e.date, c.name as category
    FROM expenses e
    JOIN categories c ON e.category_id = c.category_id
    ORDER BY e.date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all categories
app.get("/api/categories", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new expense
app.post("/api/expenses", (req, res) => {
  const { amount, description, category, date } = req.body;

  // First get category_id
  db.get(
    "SELECT category_id FROM categories WHERE name = ?",
    [category],
    (err, category_row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const category_id = category_row.category_id;

      db.run(
        "INSERT INTO expenses (amount, description, date, category_id) VALUES (?, ?, ?, ?)",
        [amount, description, date, category_id],
        function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ id: this.lastID });
        }
      );
    }
  );
});

// Update expense
app.put("/api/expenses/:id", (req, res) => {
  const { amount, description, category, date } = req.body;

  db.get(
    "SELECT category_id FROM categories WHERE name = ?",
    [category],
    (err, category_row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const category_id = category_row.category_id;

      db.run(
        "UPDATE expenses SET amount = ?, description = ?, date = ?, category_id = ? WHERE expense_id = ?",
        [amount, description, date, category_id, req.params.id],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: "Updated successfully" });
        }
      );
    }
  );
});

// Delete expense
app.delete("/api/expenses/:id", (req, res) => {
  db.run(
    "DELETE FROM expenses WHERE expense_id = ?",
    [req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Deleted successfully" });
    }
  );
});

// Get category summary
// join the two tables
app.get("/api/summary", (req, res) => {
  const query = `
    SELECT 
      c.name as category,
      COUNT(*) as count,
      SUM(e.amount) as total
    FROM categories c
    LEFT JOIN expenses e ON c.category_id = e.category_id
    GROUP BY c.category_id, c.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
