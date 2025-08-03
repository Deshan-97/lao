# Galaxy Lottery System

A modern web-based lottery system built with Node.js and Express, featuring a user-friendly interface for lottery ticket purchasing and an admin panel for managing draws and tickets.

## Features

### User Features
- **Interactive Ticket Purchase**: Select 4 numbers from 1-50 with visual feedback
- **Receipt Upload**: Upload payment receipts for ticket verification
- **Mobile-Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Modern galaxy-themed UI with Tailwind CSS

### Admin Features
- **Admin Panel**: Comprehensive management interface at `/admin`
- **Winning Number Management**: Set and clear winning numbers for draws
- **Ticket Management**: View, confirm, or reject submitted tickets
- **Receipt Verification**: Review uploaded payment receipts
- **Status Filtering**: Filter tickets by status (pending, confirmed, rejected)

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3 for lightweight data storage
- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **File Upload**: Multer for handling receipt uploads
- **Styling**: Tailwind CSS for responsive design

## Project Structure

```
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
- **`default.db`**: A pre-configured database file committed to the repository
- **Auto-restore**: Server automatically copies from `default.db` when `db.sqlite` is missing
- **Separation**: `db.sqlite` is gitignored to keep user data separate from the template

### How It Works
1. When the server starts, it checks if `db.sqlite` exists
2. If not found, it automatically copies from `default.db`
3. This ensures the database structure is always available after Render sleep/wake cycles
4. Your table structure and any default data in `default.db` will be preserved

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