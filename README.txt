DANIYA MANOHARI - LEAVE MANAGEMENT SYSTEM
========================================
Includes Home, Apply for Leave, View Leave Records, Manage Leave Requests, Login and Register pages.
Form fields: Employee ID dropdown, Employee Name dropdown, Leave Type (Casual/Professional/Other), Number of Days dropdown (1-30), Description.
Features: MySQL persistence, request listing, approve/reject/delete actions, pink/peach responsive theme, relevant office photo backgrounds.

SETUP ON WINDOWS
1. Open MySQL Workbench 8.0 and connect to your local server.
2. Open database.sql and execute the entire script.
3. In app.js, replace YOUR_MYSQL_PASSWORD with your actual MySQL root password.
4. Open this folder in VS Code and open Terminal in the project folder.
5. Run: npm install
6. Run: npm start
7. Visit: http://localhost:3000

Node.js + Express is included because browser HTML cannot connect directly to MySQL. Background photos use online Unsplash URLs, so internet is needed to load them. Login/Register are demonstration screens only and do not implement secure authentication.
