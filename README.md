# Golden Chicken and Mutton Centre - Management System

A complete web application for managing a meat retail shop with two branches: **Kongara Kalan** and **Gurramguda** in Hyderabad.

## Features

### 🏪 Branch Management
- **Branch Selection**: Users can select between Kongara Kalan and Gurramguda branches
- **Session-based Branch Storage**: Selected branch is maintained throughout the session
- **Branch-specific Data**: All stock and sales data is filtered by selected branch

### 📦 Stock Management
- **Manual Stock Entry**: Daily stock entry for received inventory
- **Product Management**: Supports Chicken, Mutton, Boti, and Thalakaya
- **Quantity & Unit Tracking**: Track quantities in kg or pieces
- **Date-wise Stock Recording**: Maintain stock records by date

### 💰 Sales Management
- **POS System**: Point-of-sale interface for recording sales
- **Real-time Stock Validation**: Prevents overselling with stock availability checks
- **Rate Management**: Flexible rate entry per kg/piece
- **Automatic Calculations**: Auto-calculate totals based on quantity and rate

### 🧾 Receipt System
- **Thermal Receipt Printing**: Optimized for 58mm thermal paper
- **Professional Layout**: Includes shop name, branch, date, time, and itemized details
- **Instant Printing**: Modal popup with print functionality after each sale

### 📊 Reporting
- **Stock Reports**: View remaining stock by product, branch, and date
- **Daily Reports**: Comprehensive daily summary with stock in, sales out, and remaining inventory
- **Product-wise Analysis**: Detailed breakdown by individual products
- **Revenue Tracking**: Total sales and revenue calculations

### 🔐 Security
- **Admin Login System**: Secure authentication required for all operations
- **Session Management**: Secure session handling with automatic logout
- **Branch-level Access Control**: Users can only access selected branch data

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (lightweight, file-based)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5 with Bootstrap Icons
- **Template Engine**: EJS (Embedded JavaScript)
- **Session Management**: Express Session
- **Date Handling**: Moment.js

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Quick Start

1. **Clone or extract the project**:
   ```bash
   cd golden-chicken-mutton-centre
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - Open your browser and navigate to: `http://localhost:3000`
   - **Demo Login Credentials**:
     - **admin** / **admin123** (Full Access)
     - **manager** / **manager123** (Manager Access)
     - **kongara_staff** / **kongara123** (Kongara Branch Staff)
     - **gurramguda_staff** / **gurram123** (Gurramguda Branch Staff)

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## Usage Guide

### 1. Login
- Use any of the demo credentials (see Installation section)
- **Purpose of Demo Accounts**: These accounts demonstrate different user roles and access levels
- The system will redirect to branch selection after successful login

### 2. Branch Selection
- Choose between **Kongara Kalan** or **Gurramguda**
- This selection will persist for your entire session
- All subsequent operations will be tied to the selected branch

### 3. Adding Stock
- Navigate to **Stock Entry** from the dashboard
- Select product type:
  - **Chicken, Mutton, Boti**: Measured in **kilograms (kg)**
  - **Thalakaya (Chicken Head)**: Measured in **pieces**
- The system automatically selects the appropriate unit based on product
- Select date (defaults to today)
- Submit to add stock entry

**Note**: Thalakaya is chicken head, typically sold as individual items rather than by weight.

### 4. Recording Sales
- Go to **Sales Entry** from the dashboard
- Select the product being sold
- Enter quantity and rate per kg/piece
- Total amount will be calculated automatically
- Submit to complete the sale
- A receipt will be generated for printing

### 5. Viewing Reports
- **Stock Report**: Shows remaining inventory by product
- **Daily Report**: Comprehensive daily summary with all transactions
- Use date filters to view historical data
- Print reports using the browser's print function

### 6. Receipt Printing
- After each sale, a receipt modal will appear
- Click "Print Receipt" to open the thermal print view
- The receipt is optimized for 58mm thermal paper
- Print using Ctrl+P or the print button

## Database Schema

### Users Table
- `id`: Primary key
- `username`: User login name
- `password`: User password (Note: In production, use proper password hashing)

### Stock Table
- `id`: Primary key
- `branch`: Branch name (Kongara Kalan/Gurramguda)
- `product`: Product name (Chicken/Mutton/Boti/Thalakaya)
- `quantity`: Stock quantity
- `unit`: Unit of measurement (kg/pieces)
- `date`: Stock entry date
- `created_at`: Timestamp

### Sales Table
- `id`: Primary key
- `branch`: Branch name
- `product`: Product sold
- `quantity`: Quantity sold
- `rate`: Rate per unit
- `total`: Total amount
- `sale_date`: Sale date
- `created_at`: Timestamp

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Login submission
- `GET /logout` - Logout and destroy session

### Branch Management
- `GET /branch-selection` - Branch selection page
- `POST /select-branch` - Set branch in session

### Dashboard & Navigation
- `GET /` - Redirect to login or dashboard
- `GET /dashboard` - Main dashboard

### Stock Management
- `GET /stock` - Stock entry page
- `POST /add-stock` - Add stock entry (JSON API)

### Sales Management
- `GET /sales` - Sales entry page
- `POST /add-sale` - Record sale (JSON API)

### Reports
- `GET /stock-report` - Stock report page
- `GET /daily-report` - Daily report page

## File Structure

```
golden-chicken-mutton-centre/
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── shop.db                   # SQLite database (auto-created)
├── views/                    # EJS templates
│   ├── layout.ejs           # Main layout template
│   ├── login.ejs            # Login page
│   ├── branch-selection.ejs # Branch selection
│   ├── dashboard.ejs        # Dashboard
│   ├── stock.ejs            # Stock entry
│   ├── sales.ejs            # Sales entry
│   ├── stock-report.ejs     # Stock report
│   └── daily-report.ejs     # Daily report
├── public/                   # Static files
│   ├── css/
│   │   └── style.css        # Custom styles
│   └── js/
│       └── app.js           # Client-side JavaScript
└── README.md                # This file
```

## Demo Accounts Explained

### 🎭 **Why Demo Accounts?**

The application includes multiple demo accounts to demonstrate different scenarios:

1. **admin / admin123**
   - **Purpose**: Full system administrator access
   - **Use Case**: Complete system management, all features available

2. **manager / manager123**
   - **Purpose**: Shop manager with oversight capabilities
   - **Use Case**: Daily operations management, reporting

3. **kongara_staff / kongara123**
   - **Purpose**: Staff member specific to Kongara Kalan branch
   - **Use Case**: Demonstrates branch-specific access (if role-based access is implemented)

4. **gurramguda_staff / gurram123**
   - **Purpose**: Staff member specific to Gurramguda branch
   - **Use Case**: Demonstrates branch-specific access (if role-based access is implemented)

**Current Implementation**: All accounts have the same access level. The different accounts are provided for:
- **Testing**: Multiple user scenarios
- **Demonstration**: Showing potential for role-based access
- **Future Enhancement**: Easy expansion to role-based permissions

## Product Units Explained

### 🥩 **Thalakaya (Chicken Head) - Why Pieces?**

**Thalakaya** is chicken head, which is:
- Sold as **individual items** (pieces)
- Not measured by weight like other meat products
- Each piece is counted separately
- Common practice in South Indian meat shops

**Other Products** (Chicken, Mutton, Boti):
- Sold by **weight** (kilograms)
- Measured accurately for pricing
- Standard meat retail practice

The system **automatically selects** the correct unit when you choose a product:
- Select "Thalakaya" → Units automatically set to "pieces"
- Select other products → Units automatically set to "kg"

## Customization

### Adding New Products
1. Update the product options in the EJS templates (`stock.ejs`, `sales.ejs`)
2. Add new product options in the dashboard info section
3. No database changes required - products are stored as text

### Modifying Branch Names
1. Update branch names in `branch-selection.ejs`
2. Update branch references in other templates
3. Update the branch validation in server routes

### Changing Thermal Receipt Size
1. Modify the CSS `@page` size in the print styles
2. Adjust font sizes and spacing accordingly
3. Test with your specific thermal printer

## Security Considerations

⚠️ **Important for Production Use**:

1. **Password Security**: The current implementation uses plaintext passwords. For production:
   - Implement password hashing (bcrypt)
   - Add password complexity requirements
   - Enable password reset functionality

2. **Session Security**: 
   - Use secure session cookies in production
   - Implement session timeout
   - Use HTTPS in production

3. **Database Security**:
   - Move to a production database (PostgreSQL/MySQL)
   - Implement proper database user permissions
   - Add database connection encryption

4. **Input Validation**:
   - Add server-side input validation
   - Implement SQL injection protection
   - Add XSS protection

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   ```bash
   # Use a different port
   PORT=3001 npm start
   ```

2. **Database permission errors**:
   - Ensure write permissions in the application directory
   - Check if `shop.db` file is created successfully

3. **Print layout issues**:
   - Adjust CSS print styles in `style.css`
   - Test with different browsers
   - Check printer paper size settings

4. **Session issues**:
   - Clear browser cookies and try again
   - Restart the server application

## Support

For technical support or feature requests, please check the following:

1. Verify all dependencies are installed correctly
2. Check the browser console for JavaScript errors
3. Review server logs for backend errors
4. Ensure the database file has proper permissions

## License

This project is licensed under the MIT License. See the package.json file for details.

---

**Golden Chicken and Mutton Centre Management System**  
*Efficiently manage your meat retail business with modern technology*