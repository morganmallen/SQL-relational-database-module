# Overview

This project is an expense tracker where the user can get, add, edit, or delete expenses to keep track of them. The user simply clicks the 'add expense' button to open a form and add an expense. If the user finds that they need to update an expense, they can edit it as needed by pushing the 'edit' button. If the expense is no longer relevant, they need to press the 'delete' button. 

This software utilized a relational database in SQLite. The project queries the database on mounting, and displays them in a table. When getting, adding, updating, or deleting an expense, a call in the backend is made to modify and get that data as requested.

My reason for writing this software is to learn about relational databases, as well as how to use them in a fullstack setting. This broadened my knowledge greatly and feel more comfortable with coding with databases.

{Provide a link to your YouTube demonstration. It should be a 4-5 minute demo of the software running, a walkthrough of the code, and a view of how created the Relational Database.}

[Software Demo Video](https://youtu.be/pvyT8UrmPS0)

# Relational Database

The database that I am using is SQLite.

I have two tables in this database: the 'categories' table and the 'expenses' table. The 'categories' table has the columns 'category_id' and 'name'. As the name suggests, it holds the categories of the type of expenses. The expenses table has the 'expense_id', 'amount', 'description', 'date', and 'category_id' columns with 'category_id' being a foreign key.

# Development Environment

The code editor I used to create this project is VSCode. The languages that I used to make this project is JavaScript and Node.js. The libraries used are React and Express.js, with SQLite being the database. These technologies work together to fetch data to fetch data form the database and display them for the user.

# Useful Websites

- [SQLite Docs](https://www.sqlite.org/docs.html)
- [Youtube](https://www.youtube.com/playlist?list=PL84tBTIF9oqIka86oSQwNoziQ9ONTSXu1)
- [W3schools](https://www.w3schools.com/sql/)

# Future Work

- Add a filtering method to display by date. 
- Make a filtering method to display highest expenses to lowest by category.
- Make a grand total that adds up all of the expenses.