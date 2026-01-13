# Architectural Showcase Submission Portal

A complete web application for managing architectural project submissions. Architects can register, fill out detailed project forms with auto-save functionality, and submit for review. Admins can review submissions and export data to Excel.

## Features

✅ **For Architects:**
- Create account and log in
- Multi-section submission form (based on your sample PDF)
- Auto-save as they type
- Return to submissions anytime
- Submit when complete
- Get email notification with image upload instructions

✅ **For Admins:**
- Review all submissions in dashboard
- See submission status and progress
- Export all data to Excel (.xlsx)
- Contact architects via email
- View submission statistics

✅ **Technical:**
- Secure user authentication (JWT + bcrypt)
- Auto-save functionality
- Mobile-responsive design
- Email notifications
- Excel export with formatting
- PostgreSQL database
- RESTful API

## Project Structure

```
architectural-showcase/
├── backend/              # Node.js/Express API
│   ├── server.js        # Main application
│   ├── package.json     # Dependencies
│   └── .env.example     # Environment variables template
│
├── frontend/            # React web app
│   ├── src/
│   │   ├── App.js       # Main component
│   │   ├── App.css      # Styling
│   │   └── pages/       # Page components
│   │       ├── LoginPage.js
│   │       ├── RegisterPage.js
│   │       ├── SubmissionForm.js
│   │       └── AdminDashboard.js
│   ├── public/index.html
│   └── package.json
│
├── QUICKSTART.md        # Fast setup guide (start here!)
├── DEPLOYMENT.md        # Detailed deployment guide
└── README.md            # This file
```

## Quick Start

### Local Development (5 minutes)

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Set up database:**
   ```bash
   createdb architectural_showcase
   ```

3. **Create `.env` files** (copy from examples):
   - `backend/.env` (see backend/.env.example)
   - `frontend/.env` (set REACT_APP_API_URL)

4. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

5. **Open in browser:**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

**See QUICKSTART.md for detailed step-by-step setup.**

## Deployment

### Recommended: Railway.app
- Free tier available
- PostgreSQL included
- Auto-deploys from GitHub
- Takes ~10 minutes

### Also works with:
- Heroku
- Vercel
- Your own server
- AWS, Azure, etc.

**See DEPLOYMENT.md for detailed instructions.**

## Form Fields

Based on your sample PDF, the form includes:

**Section 1: Submission Information**
- Project details (name, location, address)
- Contact information
- Authorization for publication

**Section 2: Project Information**
- Project data (type, category, cost, square footage)
- Facility representative info
- Manufacturers & suppliers (80+ categories)

**Section 3: Project Details**
- Project summary (200-300 words)
- Detailed description
- Special instructions for editors

**Section 4: Architect Information**
- Architect of Record
- Associate Architect
- Design Architect
- Other consultants

**Section 5: Image Submission**
- Photo credits and instructions
- (Images uploaded via file-sharing link after submission)

## Admin Dashboard

After marking a submission as complete, admins can:
- View all submissions in a table
- See submission status and dates
- Export to Excel with one click
- Contact architects via email links
- View submission statistics

## Email Notifications

When an architect completes a submission:
1. Email sent to admin email address
2. Contains: project name, firm, contact info
3. Admin dashboard link included

## Excel Export

Export includes:
- Submission ID and status
- Project name, category, location
- Firm name and contact information
- Email and phone
- Construction cost and square footage
- Submission date

Sortable and filterable in Excel.

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host/db
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
ADMIN_EMAIL=admin@yourmediacompany.com
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## User Roles

### Architect
- Create account
- Fill out submission form
- Auto-save progress
- Submit when complete
- Receive email confirmation

### Admin
- Log in with admin account
- View all submissions
- Export to Excel
- Contact architects
- Review submission data

(Admin access granted by updating database: `UPDATE users SET is_admin = true WHERE email = 'admin@example.com'`)

## Database Schema

### Users Table
- id, email, password_hash
- firm_name, contact_name
- is_admin flag
- created_at timestamp

### Submissions Table
- id, user_id (references users)
- All form fields as columns (40+)
- manufacturers_suppliers (JSON)
- architects (JSON)
- status (in_progress, completed)
- created_at, updated_at timestamps

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Submissions
- `GET /api/submissions/current` - Get current submission
- `PUT /api/submissions/:id` - Update submission (auto-save)
- `POST /api/submissions/:id/complete` - Mark as completed

### Admin
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/export-excel` - Download Excel file
- `GET /api/admin/stats` - Get dashboard statistics

## Customization

Edit these files to customize:

**Form fields:**
- `frontend/src/pages/SubmissionForm.js`

**Architect roles:**
- `frontend/src/pages/SubmissionForm.js` → `architectRoles` array

**Manufacturer categories:**
- `frontend/src/pages/SubmissionForm.js` → `manufacturerCategories` array

**Email template:**
- `backend/server.js` → `POST /api/submissions/:id/complete` route

**Styling:**
- `frontend/src/App.css`

## Security

✅ Passwords hashed with bcrypt
✅ JWT token-based authentication
✅ Database queries use parameterized statements (SQL injection safe)
✅ CORS configured

⚠️ Before production:
- Change JWT_SECRET to random value
- Use HTTPS
- Set secure database passwords
- Keep dependencies updated (`npm audit`)
- Regular backups of PostgreSQL

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Auto-save: 1 second debounce
- Database: Indexed on user_id, status
- Frontend: React optimization
- Excel export: Streaming response
- Image upload: Separate from portal (no file storage needed)

## Support & Troubleshooting

See **QUICKSTART.md** for common issues and solutions.

See **DEPLOYMENT.md** for production setup troubleshooting.

## License

This submission portal is provided as-is for your Architectural Showcase publication.

## Next Steps

1. **Read QUICKSTART.md** - Get it running locally
2. **Test with sample data** - Register architect and admin accounts
3. **Review DEPLOYMENT.md** - Deploy to production
4. **Customize form** - Add/remove fields as needed
5. **Set up email** - Configure Gmail or other service
6. **Go live** - Share submission link with architects

---

Built with React, Node.js, Express, and PostgreSQL. 🚀
