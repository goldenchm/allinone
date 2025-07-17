const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./shop.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);
    
    // Insert demo users for testing and demonstration
    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin123')`);
    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('manager', 'manager123')`);
    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('kongara_staff', 'kongara123')`);
    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('gurramguda_staff', 'gurram123')`);
    
    // Stock table
    db.run(`CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch TEXT,
        product TEXT,
        quantity REAL,
        unit TEXT,
        purchase_price REAL,
        total_cost REAL,
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Sales table
    db.run(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch TEXT,
        product TEXT,
        quantity REAL,
        rate REAL,
        total REAL,
        sale_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Daily pricing table
    db.run(`CREATE TABLE IF NOT EXISTS daily_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch TEXT,
        product TEXT,
        cost_price REAL,
        selling_price REAL,
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(branch, product, date)
    )`);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'golden-chicken-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/branch-selection');
    } else {
        res.redirect('/login');
    }
});

// Login routes
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err) {
            res.render('login', { error: 'Database error' });
        } else if (user) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.redirect('/branch-selection');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    });
});

// Branch selection
app.get('/branch-selection', requireAuth, (req, res) => {
    res.render('branch-selection');
});

app.post('/select-branch', requireAuth, (req, res) => {
    req.session.branch = req.body.branch;
    res.redirect('/dashboard');
});

// Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
    if (!req.session.branch) {
        return res.redirect('/branch-selection');
    }
    
    // Check if daily prices are set for today
    const today = moment().format('YYYY-MM-DD');
    const branch = req.session.branch;
    
    db.get('SELECT COUNT(*) as price_count FROM daily_prices WHERE branch = ? AND date = ?', 
        [branch, today], (err, result) => {
            const pricesSet = result && result.price_count > 0;
            
            res.render('dashboard', { 
                branch: req.session.branch,
                username: req.session.username,
                pricesSet: pricesSet,
                today: today
            });
        });
});

// Daily pricing setup
app.get('/daily-pricing', requireAuth, (req, res) => {
    if (!req.session.branch) {
        return res.redirect('/branch-selection');
    }
    
    const branch = req.session.branch;
    const date = req.query.date || moment().format('YYYY-MM-DD');
    
    // Get existing prices for the date
    db.all('SELECT * FROM daily_prices WHERE branch = ? AND date = ?', [branch, date], (err, existingPrices) => {
        res.render('daily-pricing', { 
            branch: branch,
            date: date,
            existingPrices: existingPrices || [],
            error: err ? err.message : null
        });
    });
});

app.post('/save-daily-prices', requireAuth, (req, res) => {
    const branch = req.session.branch;
    const { date, prices } = req.body;
    
    // Begin transaction
    db.serialize(() => {
        // Clear existing prices for the date
        db.run('DELETE FROM daily_prices WHERE branch = ? AND date = ?', [branch, date]);
        
        // Insert new prices
        const stmt = db.prepare('INSERT OR REPLACE INTO daily_prices (branch, product, cost_price, selling_price, date) VALUES (?, ?, ?, ?, ?)');
        
        let errorOccurred = false;
        for (const productName in prices) {
            const price = prices[productName];
            if (price.cost_price && price.selling_price) {
                stmt.run([branch, productName, price.cost_price, price.selling_price, date], (err) => {
                    if (err) errorOccurred = true;
                });
            }
        }
        
        stmt.finalize((err) => {
            if (err || errorOccurred) {
                res.json({ success: false, error: 'Failed to save prices' });
            } else {
                // Broadcast real-time update to all users in the same branch
                const priceData = {
                    branch,
                    date,
                    prices,
                    action: 'prices_updated'
                };
                broadcastUpdate('prices-updated', priceData, branch);
                
                res.json({ success: true });
            }
        });
    });
});

// Stock management
app.get('/stock', requireAuth, (req, res) => {
    if (!req.session.branch) {
        return res.redirect('/branch-selection');
    }
    res.render('stock', { branch: req.session.branch });
});

app.post('/add-stock', requireAuth, (req, res) => {
    const { product, quantity, unit, purchase_price, date } = req.body;
    const branch = req.session.branch;
    const total_cost = quantity * purchase_price;
    
    db.run('INSERT INTO stock (branch, product, quantity, unit, purchase_price, total_cost, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [branch, product, quantity, unit, purchase_price, total_cost, date], (err) => {
            if (err) {
                res.json({ success: false, error: err.message });
            } else {
                // Broadcast real-time update to all users in the same branch
                const stockData = {
                    branch,
                    product,
                    quantity: parseFloat(quantity),
                    unit,
                    purchase_price: parseFloat(purchase_price),
                    total_cost,
                    date,
                    action: 'stock_added'
                };
                broadcastUpdate('stock-updated', stockData, branch);
                
                res.json({ success: true });
            }
        });
});

// Sales entry
app.get('/sales', requireAuth, (req, res) => {
    if (!req.session.branch) {
        return res.redirect('/branch-selection');
    }
    res.render('sales', { branch: req.session.branch });
});

app.post('/add-sale', requireAuth, (req, res) => {
    const { product, quantity, rate } = req.body;
    const branch = req.session.branch;
    const total = quantity * rate;
    const sale_date = moment().format('YYYY-MM-DD');
    
    // Check if enough stock is available
    db.get(`
        SELECT 
            COALESCE(SUM(s.quantity), 0) - COALESCE(SUM(sales.quantity), 0) as available_stock
        FROM stock s
        LEFT JOIN sales ON s.branch = sales.branch AND s.product = sales.product
        WHERE s.branch = ? AND s.product = ?
        GROUP BY s.branch, s.product
    `, [branch, product], (err, stockResult) => {
        if (err) {
            return res.json({ success: false, error: err.message });
        }
        
        const availableStock = stockResult ? stockResult.available_stock : 0;
        
        if (availableStock < quantity) {
            return res.json({ 
                success: false, 
                error: `Insufficient stock. Available: ${availableStock}kg` 
            });
        }
        
        // Add sale
        db.run('INSERT INTO sales (branch, product, quantity, rate, total, sale_date) VALUES (?, ?, ?, ?, ?, ?)',
            [branch, product, quantity, rate, total, sale_date], function(err) {
                if (err) {
                    res.json({ success: false, error: err.message });
                } else {
                    // Broadcast real-time update to all users in the same branch
                    const saleData = {
                        branch,
                        product,
                        quantity: parseFloat(quantity),
                        rate: parseFloat(rate),
                        total,
                        sale_date,
                        action: 'sale_added'
                    };
                    broadcastUpdate('sale-updated', saleData, branch);
                    
                    res.json({ 
                        success: true, 
                        saleId: this.lastID,
                        receipt: {
                            branch,
                            product,
                            quantity,
                            rate,
                            total,
                            date: moment().format('DD/MM/YYYY'),
                            time: moment().format('HH:mm:ss')
                        }
                    });
                }
            });
    });
});

// Stock report
app.get('/stock-report', requireAuth, (req, res) => {
    if (!req.session.branch) {
        return res.redirect('/branch-selection');
    }
    
    const branch = req.session.branch;
    const date = req.query.date || moment().format('YYYY-MM-DD');
    
    db.all(`
        SELECT 
            s.product,
            COALESCE(SUM(s.quantity), 0) as total_stock,
            COALESCE(SUM(sales.quantity), 0) as total_sold,
            COALESCE(SUM(s.quantity), 0) - COALESCE(SUM(sales.quantity), 0) as remaining_stock
        FROM stock s
        LEFT JOIN sales ON s.branch = sales.branch AND s.product = sales.product
        WHERE s.branch = ? AND s.date = ?
        GROUP BY s.product
    `, [branch, date], (err, rows) => {
        if (err) {
            res.render('stock-report', { error: err.message, stocks: [], branch, date });
        } else {
            res.render('stock-report', { stocks: rows, branch, date, error: null });
        }
    });
});

// Daily report
app.get('/daily-report', requireAuth, (req, res) => {
    if (!req.session.branch) {
        return res.redirect('/branch-selection');
    }
    
    const branch = req.session.branch;
    const date = req.query.date || moment().format('YYYY-MM-DD');
    
    // Get stock data
    db.all('SELECT * FROM stock WHERE branch = ? AND date = ?', [branch, date], (err, stockData) => {
        if (err) {
            return res.render('daily-report', { error: err.message });
        }
        
        // Get sales data
        db.all('SELECT * FROM sales WHERE branch = ? AND sale_date = ?', [branch, date], (err, salesData) => {
            if (err) {
                return res.render('daily-report', { error: err.message });
            }
            
            res.render('daily-report', { 
                stockData, 
                salesData, 
                branch, 
                date, 
                error: null 
            });
        });
    });
});

// Profit/Loss report
app.get('/profit-loss', requireAuth, (req, res) => {
    if (!req.session.branch) {
        return res.redirect('/branch-selection');
    }
    
    const branch = req.session.branch;
    const date = req.query.date || moment().format('YYYY-MM-DD');
    
    // Get detailed profit/loss data
    db.all(`
        SELECT 
            s.product,
            s.quantity as stock_quantity,
            s.purchase_price,
            s.total_cost,
            COALESCE(SUM(sales.quantity), 0) as sold_quantity,
            COALESCE(SUM(sales.total), 0) as sales_revenue,
            COALESCE(AVG(sales.rate), 0) as avg_selling_price,
            (s.quantity - COALESCE(SUM(sales.quantity), 0)) as remaining_quantity
        FROM stock s
        LEFT JOIN sales ON s.branch = sales.branch AND s.product = sales.product AND s.date = sales.sale_date
        WHERE s.branch = ? AND s.date = ?
        GROUP BY s.id, s.product, s.quantity, s.purchase_price, s.total_cost
    `, [branch, date], (err, profitData) => {
        if (err) {
            return res.render('profit-loss', { error: err.message, profitData: [], branch, date });
        }
        
        // Calculate profit/loss for each item
        const enrichedData = profitData.map(item => {
            const soldValue = item.sold_quantity * item.purchase_price; // Cost of goods sold
            const profit = item.sales_revenue - soldValue;
            const profitMargin = item.sales_revenue > 0 ? ((profit / item.sales_revenue) * 100) : 0;
            const remainingValue = item.remaining_quantity * item.purchase_price;
            
            return {
                ...item,
                cost_of_goods_sold: soldValue,
                profit: profit,
                profit_margin: profitMargin,
                remaining_value: remainingValue
            };
        });
        
        res.render('profit-loss', { 
            profitData: enrichedData, 
            branch, 
            date, 
            error: null 
        });
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Socket.IO connection handling for real-time updates
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join branch-specific rooms for targeted updates
    socket.on('join-branch', (branch) => {
        socket.join(branch);
        console.log(`User ${socket.id} joined branch: ${branch}`);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Helper function to broadcast real-time updates
function broadcastUpdate(eventType, data, branch = null) {
    if (branch) {
        io.to(branch).emit(eventType, data);
    } else {
        io.emit(eventType, data);
    }
    console.log(`Broadcasting ${eventType} to ${branch || 'all branches'}`);
}

// Start server
server.listen(PORT, () => {
    console.log(`Golden Chicken and Mutton Centre app running on port ${PORT}`);
});