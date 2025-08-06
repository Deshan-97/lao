// Import the express framework for building the web server
const express = require('express');
// Import PostgreSQL client for interacting with PostgreSQL database
const { Pool } = require('pg');
// Import path for handling file and directory paths
const path = require('path');
// Import body-parser to parse incoming JSON request bodies
const bodyParser = require('body-parser');
// Import multer for handling file uploads (like images)
const multer = require('multer');

// Create an Express application
const app = express();
// Set the port number for the server
const PORT = process.env.PORT || 3000;

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection and create tables
async function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('\n🔔 DATABASE SETUP REQUIRED:');
      console.log('Please set up PostgreSQL database and set DATABASE_URL environment variable.');
      console.log('Example: export DATABASE_URL="postgresql://username:password@localhost:5432/lottery_db"');
      console.log('Or use online PostgreSQL service like Render, Railway, or Supabase.\n');
      
      // For development without database, just start server
      console.log('⚠️  Starting server without database connection (development mode)');
      console.log('💡 Database features will not work until DATABASE_URL is configured\n');
      return;
    }
    
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Create articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tickets table for lottery purchases  
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_phone TEXT NOT NULL,
        selected_numbers TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        receipt_image TEXT,
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmation_date TIMESTAMP
      )
    `);

    // Create winning_numbers table for admin-set winning numbers
    await client.query(`
      CREATE TABLE IF NOT EXISTS winning_numbers (
        id SERIAL PRIMARY KEY,
        numbers INTEGER[] NOT NULL,
        draw_date DATE NOT NULL,
        draw_time TIME DEFAULT '20:00:00',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    console.log('Database tables initialized successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('\n💡 Quick Setup Options:');
    console.log('1. For testing: Use online PostgreSQL (free tier): https://render.com');
    console.log('2. For local: Install PostgreSQL and create "lottery_db" database');
    console.log('3. Set DATABASE_URL environment variable');
    process.exit(1);
  }
}

// Initialize database on startup
initializeDatabase();

// Set up multer for handling image uploads
const storage = multer.diskStorage({
  // Set the destination folder for uploaded files
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  // Set the filename for uploaded files to be unique
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
// Create the multer upload middleware using the storage settings above
const upload = multer({ storage: storage });

// Middleware to check database connection
function requireDatabase(req, res, next) {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ 
      error: 'Database not configured', 
      message: 'Please set DATABASE_URL environment variable' 
    });
  }
  next();
}

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());
// Serve static files (HTML, JS, CSS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get all articles
app.get('/api/articles', requireDatabase, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to add a new article (with optional image upload)
app.post('/api/articles', requireDatabase, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  let image = null;
  
  if (req.file) {
    image = 'uploads/' + req.file.filename;
  }
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO articles (title, content, image) VALUES ($1, $2, $3) RETURNING id',
      [title, content, image]
    );
    res.json({ id: result.rows[0].id, title, content, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lottery API Endpoints

// Submit new ticket purchase
app.post('/api/tickets', requireDatabase, upload.single('receipt'), async (req, res) => {
  const { phone, numbers } = req.body;
  let receipt = null;
  
  if (req.file) {
    receipt = 'uploads/' + req.file.filename;
  }
  
  if (!phone || !numbers) {
    return res.status(400).json({ error: 'Phone and numbers are required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO tickets (user_phone, selected_numbers, receipt_image) VALUES ($1, $2, $3) RETURNING id',
      [phone, numbers, receipt]
    );
    res.json({ 
      id: result.rows[0].id, 
      phone, 
      numbers: JSON.parse(numbers), 
      status: 'pending',
      receipt 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tickets (admin)
app.get('/api/tickets', requireDatabase, async (req, res) => {
  const status = req.query.status;
  let query = 'SELECT * FROM tickets ORDER BY purchase_date DESC';
  let params = [];
  
  if (status) {
    query = 'SELECT * FROM tickets WHERE status = $1 ORDER BY purchase_date DESC';
    params = [status];
  }
  
  try {
    const result = await pool.query(query, params);
    res.json(result.rows.map(row => ({
      ...row,
      selected_numbers: JSON.parse(row.selected_numbers)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user tickets by phone
app.get('/api/user-tickets/:phone', requireDatabase, async (req, res) => {
  const phone = req.params.phone;
  
  try {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE user_phone = $1 ORDER BY purchase_date DESC',
      [phone]
    );
    res.json(result.rows.map(row => ({
      ...row,
      selected_numbers: JSON.parse(row.selected_numbers)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm ticket
app.put('/api/tickets/:id/confirm', requireDatabase, async (req, res) => {
  const id = req.params.id;
  
  try {
    await pool.query(
      'UPDATE tickets SET status = $1, confirmation_date = CURRENT_TIMESTAMP WHERE id = $2',
      ['confirmed', id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject ticket
app.put('/api/tickets/:id/reject', requireDatabase, async (req, res) => {
  const id = req.params.id;
  
  try {
    await pool.query('UPDATE tickets SET status = $1 WHERE id = $2', ['rejected', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== WINNING NUMBERS API ENDPOINTS =====

// Set winning numbers (Admin)
app.post('/api/winning-numbers', requireDatabase, async (req, res) => {
  try {
    const { numbers, drawDate } = req.body;
    
    if (!numbers || !Array.isArray(numbers) || numbers.length !== 4) {
      return res.status(400).json({ error: 'Must provide exactly 4 numbers' });
    }
    
    if (!drawDate) {
      return res.status(400).json({ error: 'Must provide draw date' });
    }

    // Deactivate all previous winning numbers
    await pool.query('UPDATE winning_numbers SET is_active = false');
    
    // Insert new winning numbers
    const result = await pool.query(
      'INSERT INTO winning_numbers (numbers, draw_date, is_active) VALUES ($1, $2, $3) RETURNING *',
      [numbers, drawDate, true]
    );
    
    res.json({
      success: true,
      id: result.rows[0].id,
      numbers: result.rows[0].numbers,
      draw_date: result.rows[0].draw_date,
      draw_time: result.rows[0].draw_time
    });
  } catch (err) {
    console.error('Error setting winning numbers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get latest winning numbers
app.get('/api/winning-numbers/latest', requireDatabase, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM winning_numbers WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.json(null);
    }
    
    const winningNumbers = result.rows[0];
    res.json({
      id: winningNumbers.id,
      numbers: winningNumbers.numbers,
      draw_date: winningNumbers.draw_date,
      draw_time: winningNumbers.draw_time,
      created_at: winningNumbers.created_at
    });
  } catch (err) {
    console.error('Error getting winning numbers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Clear winning numbers (Admin)
app.delete('/api/winning-numbers/clear', requireDatabase, async (req, res) => {
  try {
    await pool.query('UPDATE winning_numbers SET is_active = false');
    res.json({ success: true, message: 'All winning numbers cleared' });
  } catch (err) {
    console.error('Error clearing winning numbers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ad123.html'));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 