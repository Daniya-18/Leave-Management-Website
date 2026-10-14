
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'leave_management',
    waitForConnections: true,
    connectionLimit: 10
});

// Check MySQL connection
async function checkDatabase() {
    try {
        const connection = await db.getConnection();
        console.log('MySQL connected successfully!');
        connection.release();
    } catch (error) {
        console.error('MySQL connection failed:', error.message);
    }
}

checkDatabase();

// Get employees for dropdowns
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT employee_id, employee_name FROM employees ORDER BY employee_id'
        );
        res.json(rows);
    } catch (error) {
        console.error('Employee error:', error.message);
        res.status(500).json({
            message: 'Unable to load employees. Check MySQL connection.'
        });
    }
});

// Get all leave records
app.get('/api/leaves', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM leave_requests ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Load leaves error:', error.message);
        res.status(500).json({
            message: 'Unable to load leave records.'
        });
    }
});

// Submit a leave request
app.post('/api/leaves', async (req, res) => {
    const {
        employee_id,
        employee_name,
        leave_type,
        no_of_days,
        description
    } = req.body;

    const days = Number(no_of_days);

    if (
        !employee_id ||
        !employee_name ||
        !['Casual', 'Professional', 'Other'].includes(leave_type) ||
        !Number.isInteger(days) ||
        days < 1 ||
        days > 30 ||
        !description ||
        !description.trim()
    ) {
        return res.status(400).json({
            message: 'Please complete every field. Days must be from 1 to 30.'
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO leave_requests
            (employee_id, employee_name, leave_type, days, no_of_days, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                employee_id,
                employee_name,
                leave_type,
                days,
                days,
                description.trim(),
                'Pending'
            ]
        );

        res.status(201).json({
            message: 'Leave request submitted successfully!',
            id: result.insertId
        });

    } catch (error) {
        console.error('Save leave error:', error.message);
        res.status(500).json({
            message: 'Unable to save request. Check the VS Code terminal.'
        });
    }
});

// Approve or reject a leave request
app.patch('/api/leaves/:id/status', async (req, res) => {
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({
            message: 'Invalid leave status.'
        });
    }

    try {
        const [result] = await db.execute(
            'UPDATE leave_requests SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Leave request not found.'
            });
        }

        res.json({
            message: 'Leave status updated successfully.'
        });

    } catch (error) {
        console.error('Update error:', error.message);
        res.status(500).json({
            message: 'Unable to update leave status.'
        });
    }
});

// Delete a leave request
app.delete('/api/leaves/:id', async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM leave_requests WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Leave request not found.'
            });
        }

        res.json({
            message: 'Leave request deleted successfully.'
        });

    } catch (error) {
        console.error('Delete error:', error.message);
        res.status(500).json({
            message: 'Unable to delete leave request.'
        });
    }
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Leave Management System running at http://localhost:${PORT}`);
});