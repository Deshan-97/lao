# WINBIT Lottery System

A modern lottery system with HTML-based winning numbers management and PostgreSQL database.

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database

### Database Setup

#### Option 1: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database: `lottery_db`
3. Set environment variable: `DATABASE_URL=postgresql://username:password@localhost:5432/lottery_db`

#### Option 2: Online PostgreSQL (Recommended for Production)
1. Create a PostgreSQL database on services like:
   - [Render](https://render.com) (Free tier available)
   - [Railway](https://railway.app)
   - [Supabase](https://supabase.com)
   - [ElephantSQL](https://www.elephantsql.com)
2. Copy the connection string and set as `DATABASE_URL` environment variable

### Installation
```bash
npm install
npm start
```

## 🎯 Features

### ✅ HTML-Based Winning Numbers
- Edit winning numbers directly in `public/index.html`
- No server restart required
- Persistent after deployment restarts

### 🎫 Lottery System
- User ticket purchases
- Phone number validation
- WhatsApp integration for payments
- Admin panel for ticket management

### 🗄️ PostgreSQL Database
- Modern, scalable database
- ACID compliance
- Better performance than SQLite
- Cloud-ready

## 🎮 How to Set Winning Numbers

Edit the winning numbers in `public/index.html`:
```html
<div id="winning-numbers-data" style="display: none;">
  {
    "numbers": [7, 15, 23, 42],
    "drawDate": "06/08/2025",
    "drawTime": "8:00 PM"
  }
</div>
```

Save the file - changes appear immediately!
├── server.js              # Main server file
├── package.json           # Project dependencies
├── db.sqlite             # SQLite database
├── public/               # Static files
│   ├── index.html        # Main lottery interface
│   ├── ad123.html        # Admin panel
│   ├── script.js         # Frontend JavaScript
│   └── uploads/          # Uploaded receipt images
└── README.md             # Project documentation
```

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Deshan-97/lao.git
   cd lao
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - User Interface: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin`

## Render Deployment (Free Tier)

This project includes a solution for Render's free tier database persistence issue:

### The Problem
Render's free tier resets the filesystem when the service goes to sleep, causing the SQLite database to be lost.

### The Solution
- **`default.db`**: A pre-configured database file with empty table structures (no data)
- **Auto-restore**: Server automatically copies from `default.db` when `db.sqlite` is missing
- **Environment Variables**: Winning numbers persist across restarts using Render environment variables
- **Separation**: `db.sqlite` is gitignored to keep user data separate from the template
- **Clean Start**: Each restore provides fresh, empty tables without old data, but preserves current winning numbers

### How It Works
1. When the server starts, it checks if `db.sqlite` exists
2. If not found, it automatically copies from `default.db`
3. After database initialization, it restores winning numbers from environment variables
4. When you set winning numbers via admin panel, they're saved to both database and environment
5. This ensures winning numbers persist even after Render sleep/wake cycles
6. Old tickets are cleared, but current winning numbers remain available

### Setting Up Environment Variables on Render
1. In your Render dashboard, go to your service settings
2. Navigate to "Environment" tab
3. The system automatically manages these variables:
   - `CURRENT_WINNING_NUMBERS` - JSON array of current winning numbers
   - `CURRENT_DRAW_DATE` - Date of the current draw
4. You don't need to set these manually - they're set when you use the admin panel

### Deployment Steps for Render
1. Push your code with `default.db` to GitHub
2. Connect your GitHub repo to Render
3. Deploy - the database will auto-initialize from `default.db`
4. After Render sleep/wake, the database structure is automatically restored

## API Endpoints

### Public Endpoints
- `GET /` - Main lottery interface
- `POST /api/tickets` - Submit lottery ticket
- `GET /api/winning-numbers/latest` - Get current winning numbers

### Admin Endpoints
- `GET /admin` - Admin panel interface
- `POST /api/winning-numbers` - Set winning numbers
- `DELETE /api/winning-numbers/clear` - Clear winning numbers
- `GET /api/tickets` - Get all tickets (with optional status filter)
- `PUT /api/tickets/:id/confirm` - Confirm a ticket
- `PUT /api/tickets/:id/reject` - Reject a ticket

## Database Schema

### Tables
- **tickets**: Stores lottery ticket information
  - id, user_phone, selected_numbers, receipt_image, status, purchase_date
- **winning_numbers**: Stores winning numbers for each draw
  - id, numbers, draw_date, created_at

## Usage

### For Users
1. Visit the main page
2. Enter your phone number
3. Select 4 numbers from the grid (1-50)
4. Upload your payment receipt
5. Submit your ticket
6. Wait for admin verification

### For Administrators
1. Access the admin panel at `/admin`
2. Set winning numbers for each draw
3. Review and verify submitted tickets
4. Confirm or reject tickets based on receipt verification
5. Manage lottery draws and results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support and questions, please open an issue on the GitHub repository.