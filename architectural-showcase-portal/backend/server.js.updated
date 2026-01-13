require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/architectural_showcase'
});

// Email setup (update with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// =====================
// DATABASE INIT
// =====================
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        firm_name VARCHAR(255),
        contact_name VARCHAR(255),
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_name VARCHAR(255),
        project_location VARCHAR(255),
        project_address TEXT,
        contact_name VARCHAR(255),
        contact_title VARCHAR(255),
        contact_phone VARCHAR(20),
        contact_email VARCHAR(255),
        contact_role VARCHAR(255),
        authorization BOOLEAN DEFAULT false,
        project_type VARCHAR(255),
        project_category VARCHAR(255),
        date_of_occupancy DATE,
        total_construction_cost VARCHAR(100),
        total_gross_sqft VARCHAR(100),
        seating_capacity VARCHAR(100),
        cost_per_sqft VARCHAR(100),
        primary_funding VARCHAR(255),
        facility_rep_name VARCHAR(255),
        facility_rep_title VARCHAR(255),
        facility_rep_phone VARCHAR(20),
        facility_rep_email VARCHAR(255),
        facility_rep_address TEXT,
        manufacturers_suppliers JSONB,
        project_summary TEXT,
        project_description TEXT,
        special_instructions TEXT,
        architects JSONB,
        photo_credits TEXT,
        photo_special_instructions TEXT,
        status VARCHAR(50) DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

initDB();

// =====================
// AUTH ROUTES
// =====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firm_name, contact_name } = req.body;

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, firm_name, contact_name) VALUES ($1, $2, $3, $4) RETURNING id, email',
      [email, hashedPassword, firm_name, contact_name]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      JWT_SECRET
    );

    res.json({ token, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET
    );

    res.json({ token, user: { id: user.id, email: user.email, firm_name: user.firm_name, is_admin: user.is_admin } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// SUBMISSION ROUTES
// =====================

// Get or create submission
app.get('/api/submissions/current', authenticateToken, async (req, res) => {
  try {
    // Get the most recent in-progress submission
    const result = await pool.query(
      'SELECT * FROM submissions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [req.user.id, 'in_progress']
    );

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    // Create new submission if none exists
    const newSubmission = await pool.query(
      'INSERT INTO submissions (user_id) VALUES ($1) RETURNING *',
      [req.user.id]
    );

    res.json(newSubmission.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update submission (auto-save)
app.put('/api/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Build dynamic update query
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE submissions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
      [...values, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete submission
app.post('/api/submissions/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      ['completed', id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = result.rows[0];

    // Get user info
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: `New Submission Completed: ${submission.project_name || 'Untitled Project'}`,
      html: `
        <h2>New Submission Completed</h2>
        <p><strong>Project:</strong> ${submission.project_name || 'N/A'}</p>
        <p><strong>Architect Firm:</strong> ${user.firm_name || 'N/A'}</p>
        <p><strong>Contact:</strong> ${user.contact_name || 'N/A'} (${user.email})</p>
        <p><strong>Submitted:</strong> ${new Date(submission.updated_at).toLocaleString()}</p>
        <p>Please log in to the admin dashboard to review and export submission data.</p>
      `
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// ADMIN ROUTES
// =====================

// Get all submissions (admin only)
app.get('/api/admin/submissions', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(`
      SELECT s.*, u.firm_name, u.email, u.contact_name 
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.updated_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export submissions to Excel
app.get('/api/admin/export-excel', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(`
      SELECT s.*, u.firm_name, u.email, u.contact_name 
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.updated_at DESC
    `);

    const submissions = result.rows;

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Submissions');

    // Add headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Project Name', key: 'project_name', width: 25 },
      { header: 'Project Category', key: 'project_category', width: 20 },
      { header: 'Location', key: 'project_location', width: 20 },
      { header: 'Firm', key: 'firm_name', width: 25 },
      { header: 'Contact', key: 'contact_name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'contact_phone', width: 15 },
      { header: 'Construction Cost', key: 'total_construction_cost', width: 15 },
      { header: 'Sq Ft', key: 'total_gross_sqft', width: 12 },
      { header: 'Submitted', key: 'updated_at', width: 20 }
    ];

    // Add rows
    submissions.forEach(submission => {
      worksheet.addRow({
        id: submission.id,
        status: submission.status,
        project_name: submission.project_name,
        project_category: submission.project_category,
        project_location: submission.project_location,
        firm_name: submission.firm_name,
        contact_name: submission.contact_name,
        email: submission.email,
        contact_phone: submission.contact_phone,
        total_construction_cost: submission.total_construction_cost,
        total_gross_sqft: submission.total_gross_sqft,
        updated_at: new Date(submission.updated_at).toLocaleString()
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=submissions.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if admin
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalResult = await pool.query('SELECT COUNT(*) FROM submissions');
    const completedResult = await pool.query('SELECT COUNT(*) FROM submissions WHERE status = $1', ['completed']);
    const inProgressResult = await pool.query('SELECT COUNT(*) FROM submissions WHERE status = $1', ['in_progress']);

    res.json({
      total: parseInt(totalResult.rows[0].count),
      completed: parseInt(completedResult.rows[0].count),
      inProgress: parseInt(inProgressResult.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// CUMULATIVE REPORTING
// =====================

// Get cumulative reports
app.get('/api/admin/reports/summary', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all completed submissions
    const submissions = await pool.query(`
      SELECT * FROM submissions WHERE status = 'completed' ORDER BY updated_at DESC
    `);

    if (submissions.rows.length === 0) {
      return res.json({
        total: 0,
        byCategory: [],
        byType: [],
        costAnalysis: {},
        manufacturersFrequency: [],
        topSuppliers: []
      });
    }

    // Analyze by category
    const categories = {};
    const types = {};
    let totalCost = 0;
    let costCount = 0;
    const manufacturers = {};

    submissions.rows.forEach(sub => {
      // Count by category
      if (sub.project_category) {
        categories[sub.project_category] = (categories[sub.project_category] || 0) + 1;
      }

      // Count by type
      if (sub.project_type) {
        types[sub.project_type] = (types[sub.project_type] || 0) + 1;
      }

      // Cost analysis
      if (sub.total_construction_cost) {
        const costValue = parseInt(sub.total_construction_cost.replace(/[^0-9]/g, ''));
        if (!isNaN(costValue)) {
          totalCost += costValue;
          costCount++;
        }
      }

      // Manufacturer frequency
      if (sub.manufacturers_suppliers && typeof sub.manufacturers_suppliers === 'object') {
        Object.values(sub.manufacturers_suppliers).forEach(supplier => {
          if (supplier) {
            manufacturers[supplier] = (manufacturers[supplier] || 0) + 1;
          }
        });
      }
    });

    // Convert to arrays and sort
    const byCategory = Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const byType = Object.entries(types)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topSuppliers = Object.entries(manufacturers)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.json({
      total: submissions.rows.length,
      byCategory,
      byType,
      costAnalysis: {
        totalSpent: totalCost,
        averageCost: costCount > 0 ? Math.round(totalCost / costCount) : 0,
        projectsWithCost: costCount
      },
      topSuppliers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export cumulative report to Excel
app.get('/api/admin/export-cumulative-report', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(`
      SELECT s.*, u.firm_name, u.email, u.contact_name 
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'completed'
      ORDER BY s.updated_at DESC
    `);

    const submissions = result.rows;

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Summary Statistics
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    const totalCost = submissions.reduce((sum, s) => {
      const cost = parseInt((s.total_construction_cost || '0').replace(/[^0-9]/g, ''));
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);

    const avgCost = submissions.length > 0 ? Math.round(totalCost / submissions.length) : 0;

    summarySheet.addRows([
      { metric: 'Total Submissions', value: submissions.length },
      { metric: 'Total Construction Cost', value: `$${totalCost.toLocaleString()}` },
      { metric: 'Average Project Cost', value: `$${avgCost.toLocaleString()}` },
      { metric: 'Report Generated', value: new Date().toLocaleString() }
    ]);

    // Category breakdown
    const categories = {};
    submissions.forEach(s => {
      if (s.project_category) {
        categories[s.project_category] = (categories[s.project_category] || 0) + 1;
      }
    });

    summarySheet.addRows([{ metric: '', value: '' }]);
    summarySheet.addRows([{ metric: 'Projects by Category', value: '' }]);
    Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      summarySheet.addRows([{ metric: `  ${cat}`, value: count }]);
    });

    // Type breakdown
    const types = {};
    submissions.forEach(s => {
      if (s.project_type) {
        types[s.project_type] = (types[s.project_type] || 0) + 1;
      }
    });

    summarySheet.addRows([{ metric: '', value: '' }]);
    summarySheet.addRows([{ metric: 'Projects by Type', value: '' }]);
    Object.entries(types).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      summarySheet.addRows([{ metric: `  ${type}`, value: count }]);
    });

    // Sheet 2: All Submissions Detail
    const detailSheet = workbook.addWorksheet('All Submissions');
    detailSheet.columns = [
      { header: 'Project Name', key: 'project_name', width: 25 },
      { header: 'Category', key: 'project_category', width: 20 },
      { header: 'Type', key: 'project_type', width: 15 },
      { header: 'Location', key: 'project_location', width: 20 },
      { header: 'Firm', key: 'firm_name', width: 25 },
      { header: 'Contact', key: 'contact_name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Cost', key: 'total_construction_cost', width: 15 },
      { header: 'Sq Ft', key: 'total_gross_sqft', width: 12 },
      { header: 'Submitted', key: 'updated_at', width: 20 }
    ];

    submissions.forEach(submission => {
      detailSheet.addRow({
        project_name: submission.project_name,
        project_category: submission.project_category,
        project_type: submission.project_type,
        project_location: submission.project_location,
        firm_name: submission.firm_name,
        contact_name: submission.contact_name,
        email: submission.email,
        total_construction_cost: submission.total_construction_cost,
        total_gross_sqft: submission.total_gross_sqft,
        updated_at: new Date(submission.updated_at).toLocaleString()
      });
    });

    // Sheet 3: Supplier Analysis
    const suppliers = {};
    submissions.forEach(s => {
      if (s.manufacturers_suppliers && typeof s.manufacturers_suppliers === 'object') {
        Object.entries(s.manufacturers_suppliers).forEach(([category, supplier]) => {
          if (supplier) {
            if (!suppliers[supplier]) {
              suppliers[supplier] = { count: 0, categories: [] };
            }
            suppliers[supplier].count++;
            if (!suppliers[supplier].categories.includes(category)) {
              suppliers[supplier].categories.push(category);
            }
          }
        });
      }
    });

    const supplierSheet = workbook.addWorksheet('Top Suppliers');
    supplierSheet.columns = [
      { header: 'Supplier Name', key: 'supplier', width: 30 },
      { header: 'Times Used', key: 'count', width: 12 },
      { header: 'Categories', key: 'categories', width: 50 }
    ];

    Object.entries(suppliers)
      .map(([supplier, data]) => ({
        supplier,
        count: data.count,
        categories: data.categories.join('; ')
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)
      .forEach(row => supplierSheet.addRow(row));

    // Style header rows
    [summarySheet, detailSheet, supplierSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=cumulative-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier analysis
app.get('/api/admin/reports/suppliers', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(`
      SELECT manufacturers_suppliers FROM submissions WHERE status = 'completed'
    `);

    const suppliers = {};
    result.rows.forEach(row => {
      if (row.manufacturers_suppliers && typeof row.manufacturers_suppliers === 'object') {
        Object.entries(row.manufacturers_suppliers).forEach(([category, supplier]) => {
          if (supplier) {
            if (!suppliers[supplier]) {
              suppliers[supplier] = { count: 0, categories: new Set() };
            }
            suppliers[supplier].count++;
            suppliers[supplier].categories.add(category);
          }
        });
      }
    });

    const suppliersList = Object.entries(suppliers)
      .map(([name, data]) => ({
        name,
        count: data.count,
        categories: Array.from(data.categories)
      }))
      .sort((a, b) => b.count - a.count);

    res.json(suppliersList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
